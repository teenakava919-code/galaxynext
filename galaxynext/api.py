import frappe

@frappe.whitelist(allow_guest=True)
def get_logged_in_user():
    return frappe.session.user

@frappe.whitelist(allow_guest=True)
def get_all_company():
    user = frappe.session.user
    companies = frappe.db.sql("""
        SELECT B.companyname as company,P.user
        FROM `tabCustomer` A
        LEFT JOIN `tabPortal User` P ON A.name = P.parent
        LEFT JOIN `tabCustomer Vs Company Mapping` B ON A.name = B.parent
        WHERE P.user = %s
    """,(user,), as_dict=True)
    return companies

@frappe.whitelist(allow_guest=True)
def get_all_customer():
    # current logged-in user
    user = frappe.session.user
    # optional: return empty if not logged in
    if user == "Guest":
        return []
    customers = frappe.db.sql(
        """
        SELECT A.name AS customer,
               A.customer_group,
               A.customer_type,
               B.user
        FROM `tabCustomer` A
        INNER JOIN `tabPortal User` B
            ON A.name = B.parent
        WHERE B.user = %s
        """,
        (user,),  # parameterized to avoid SQL injection
        as_dict=True
    )
    return customers

@frappe.whitelist(allow_guest=True)
def get_all_companyaddress():
    companyaddresss = frappe.db.sql("""
        SELECT
            C.name AS company,
            A.name AS address_name,       -- <--- important: address record name
            A.address_line1,
            A.address_line2,
            A.city,
            A.state,
            A.pincode,
            A.gstin company_gstin,
            A.address_type
        FROM `tabCompany` C
        LEFT JOIN `tabDynamic Link` DL
            ON DL.link_name = C.name
           AND DL.link_doctype = 'Company'
           AND DL.parenttype = 'Address'
        LEFT JOIN `tabAddress` A
            ON A.name = DL.parent
            where C.name='GOGAD FABRICS PVT LTD'
            # WHERE C.name = %s
        ORDER BY C.name
    """, as_dict=True)
    return companyaddresss
# @frappe.whitelist(allow_guest=True)
# def get_all_companyaddress(company_name=None):
#     if not company_name:
#         return {}

#     companyaddresss = """
#         SELECT
#             C.name AS company,
#             A.name AS address_name,
#             A.address_line1,
#             A.address_line2,
#             A.city,
#             A.state,
#             A.pincode,
#             C.gstin AS company_gstin,
#             A.address_type
#         FROM `tabCompany` C
#         LEFT JOIN `tabDynamic Link` DL
#             ON DL.link_name = C.name
#             AND DL.link_doctype = 'Company'
#             AND DL.parenttype = 'Address'
#         LEFT JOIN `tabAddress` A
#             ON A.name = DL.parent
#         WHERE C.name = %s
#         ORDER BY C.name
#         LIMIT 1
#     """

#     result = frappe.db.sql(companyaddresss, (company_name,), as_dict=True)
#     return result[0] if result else {}

@frappe.whitelist(allow_guest=True)
def get_all_customeraddress():
    user = frappe.session.user
    customeraddresss = frappe.db.sql("""
        SELECT
            C.name  AS customer,
            A.name  AS address_name,   -- Address primary key (must match Address.name)
            A.address_line1,
            A.address_line2,
            A.city,
            A.state,
            A.pincode,
            A.gstin           AS gstin,
            A.gst_category    AS gst_category,
            A.address_type
        FROM `tabCustomer` C
        LEFT JOIN `tabDynamic Link` DL
        ON DL.link_name = C.name
        AND DL.link_doctype = 'Customer'
        AND DL.parenttype = 'Address'
        LEFT JOIN `tabAddress` A
        ON A.name = DL.parent
        LEFT JOIN `tabPortal User` B 
        ON C.name = B.parent
        # WHERE A.address_type = 'Billing'  AND C.name='NARAYAN SARDA'  -- only billing addresses
        # ORDER BY C.name
        WHERE B.user = %s
        """,
        (user,),  # parameterized to avoid SQL injection
        as_dict=True
    )
    return customeraddresss


@frappe.whitelist(allow_guest=True)
def get_item_valuation_rate(item_code: str = None, warehouse: str = None):
    """
    Returns numeric valuation_rate for an item (warehouse-aware).
    allow_guest=True so portal users (or guest) can call this.
    """
    if not item_code:
        frappe.throw(_("Item code is required"))

    # Try Bin (warehouse-specific) first
    if warehouse:
        val = frappe.db.get_value("Bin",
                                  {"item_code": item_code, "warehouse": warehouse},
                                  "valuation_rate")
        if val is not None:
            return {"valuation_rate": float(val)}

    # Fallback to Item.valuation_rate
    val = frappe.db.get_value("Item", item_code, "valuation_rate")
    if val is None:
        val = 0.0

    return {"valuation_rate": float(val)}
# --==============================Testing API=====================================================================
@frappe.whitelist(allow_guest=True)
def whoami():
    """
    Return the current session user.
    If nobody is logged in, this returns "Guest".
    """
    return frappe.session.user

@frappe.whitelist(allow_guest=True)
def get_portal_customers():
    user = frappe.session.user  # current user (email or "Guest")

    # all customers that have a portal user entry (INNER JOIN)
    all_customers = frappe.db.sql("""
        SELECT A.name AS customer, A.customer_group, A.customer_type
        FROM `tabCustomer` A
        INNER JOIN `tabPortal User` B
            ON A.name = B.parent
    """, as_dict=True)

    # portal-specific customers (only when user logged in)
    if user and user != "Guest":
        portal_customers = frappe.db.sql("""
            SELECT A.name AS customer, A.customer_group, A.customer_type
            FROM `tabCustomer` A
            LEFT JOIN `tabPortal User` B
                ON A.name = B.parent
            WHERE B.user = %s
        """, (user,), as_dict=True)
    else:
        portal_customers = []  # not logged in or guest

    return {"user": user, "portal_customers": portal_customers, "all_customers": all_customers}


    # ===============================================================================
@frappe.whitelist(allow_guest=True)
def get_companies_for_portal_user(user=None):
    user = frappe.session.user
    """
    Returns companies list mapped to logged-in portal user
    """
    if not user:
        user = frappe.session.user   # current logged in user

    query = """
        SELECT B.company as name
        FROM `tabCustomer` A
        LEFT JOIN `tabPortal User` P ON A.name = P.parent
        LEFT JOIN `tabCustomer Company Mapping` B ON A.name = B.section_break_mcs4
        WHERE P.user=%s
    """
    companies = frappe.db.sql(query, user, as_dict=True)
    return companies


@frappe.whitelist()   
def get_portal_user():
    user = frappe.session.user

    if user == "Guest":
        frappe.throw("Not logged in", frappe.PermissionError)

    vals = frappe.db.get_values(
        "User",
        {"name": user},
        ["name", "full_name", "email"],
        as_dict=True
    ) or []

    user_info = vals[0] if vals else {"name": user, "full_name": user, "email": ""}

    # find linked Customer by email (common pattern). Adjust if you link differently.
    customer = None
    if user_info.get("email"):
        customer = frappe.db.get_value("Customer", {"email_id": user_info.get("email")}, "name")

    return {
        "user": user_info,
        "customer": customer   # will be None if no linked customer
    }


@frappe.whitelist(allow_guest=True)
def get_all_ca(company_name=None):
    if not company_name:
        return {}

    query = """
        SELECT
            C.name AS company,
            A.name AS address_name,
            A.address_line1,
            A.address_line2,
            A.city,
            A.state,
            A.pincode,
            C.gstin AS company_gstin,
            A.address_type
        FROM `tabCompany` C
        LEFT JOIN `tabDynamic Link` DL
            ON DL.link_name = C.name
            AND DL.link_doctype = 'Company'
            AND DL.parenttype = 'Address'
        LEFT JOIN `tabAddress` A
            ON A.name = DL.parent
        WHERE C.name = %s
        ORDER BY C.name
        LIMIT 1
    """

    result = frappe.db.sql(query, (company_name,), as_dict=True)
    return result[0] if result else {}

@frappe.whitelist(allow_guest=True)
def get_company_gstin(company_name=None):
    if not company_name:
        return {}

    result = frappe.db.sql("""
        # SELECT gstin as company_gstin
        # FROM `tabCompany`
        SELECT
            C.name AS company,
            A.name AS address_name,       -- <--- important: address record name
            A.address_line1,
            A.address_line2,
            A.city,
            A.state,
            A.pincode,
            C.gstin company_gstin,
            A.address_type
        FROM `tabCompany` C
        LEFT JOIN `tabDynamic Link` DL
            ON DL.link_name = C.name
           AND DL.link_doctype = 'Company'
           AND DL.parenttype = 'Address'
        LEFT JOIN `tabAddress` A
            ON A.name = DL.parent
        WHERE C.name = %s
        LIMIT 1
    """, (company_name,), as_dict=True)

    return result[0] if result else {}


