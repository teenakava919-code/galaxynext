import frappe

@frappe.whitelist(allow_guest=True)
def get_logged_in_supplier_user():
    return frappe.session.user

@frappe.whitelist(allow_guest=True)
def get_all_supplier_company():
    user = frappe.session.user
    companies = frappe.db.sql("""
        SELECT DISTINCT B.companyname as company,P.user
        FROM `tabSupplier` A
        LEFT JOIN `tabPortal User` P ON A.name = P.parent
        LEFT JOIN `tabSupplier Vs Company Mapping` B ON A.name = B.parent
        WHERE P.user = %s
    """,(user,), as_dict=True)
    return companies

@frappe.whitelist(allow_guest=True)
def get_all_supplier():
    # current logged-in user
    user = frappe.session.user
    # optional: return empty if not logged in
    if user == "Guest":
        return []
    suppliers = frappe.db.sql(
        """
        SELECT A.name AS supplier,
               B.user
        FROM `tabSupplier` A
        INNER JOIN `tabPortal User` B
        ON A.name = B.parent
        WHERE B.user = %s
        """,
        (user,),  # parameterized to avoid SQL injection
        as_dict=True
    )
    return suppliers

@frappe.whitelist(allow_guest=True)
def get_all_supplieraddress():
    user = frappe.session.user
    supplieraddresss = frappe.db.sql("""
        SELECT
            C.name  AS supplier,
            A.name  AS address_name,   -- Address primary key (must match Address.name)
            A.address_line1,
            A.address_line2,
            A.city,
            A.state,
            A.pincode,
            A.gstin           AS gstin,
            A.gst_category    AS gst_category,
            A.address_type
        FROM `tabSupplier` C
        LEFT JOIN `tabDynamic Link` DL
        ON DL.link_name = C.name
        AND DL.link_doctype = 'Supplier'
        AND DL.parenttype = 'Address'
        LEFT JOIN `tabAddress` A
        ON A.name = DL.parent
        LEFT JOIN `tabPortal User` B 
        ON C.name = B.parent
        WHERE B.user = %s
        """,
        (user,),  # parameterized to avoid SQL injection
        as_dict=True
    )
    return supplieraddresss

@frappe.whitelist(allow_guest=True)
def get_all_supplier_companyaddress():
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
        ORDER BY C.name
    """, as_dict=True)
    return companyaddresss