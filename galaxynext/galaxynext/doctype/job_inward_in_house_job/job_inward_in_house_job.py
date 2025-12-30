import frappe

# --------------------------------------------------------
# 1️⃣  Detect Customer Company field dynamically
# --------------------------------------------------------
def get_customer_company_field():
    meta = frappe.get_meta("Customer")
    # ⭐ Added "represents_company" as the first option
    possible_fields = ["represents_company", "customer_company", "primary_company", "company"]
    for field in possible_fields:
        if meta.has_field(field):
            return field
    return None


# --------------------------------------------------------
# 2️⃣  Detect Subcontractor field dynamically
# --------------------------------------------------------
def get_subcontractor_field():
    meta = frappe.get_meta("Customer")
    possible_fields = ["default_supplier", "subcontractor", "linked_supplier"]
    for field in possible_fields:
        if meta.has_field(field):
            return field
    return None


# --------------------------------------------------------
# 3️⃣  Get Customer Details  
#     - Customer Company (Represents Company)
#     - Linked Subcontractor Supplier
#     - All Stock Entries of type "Send to Subcontractor"
#     - Allowed Companies (for Internal Customer)
# --------------------------------------------------------
@frappe.whitelist()
def get_customer_details(customer):

    company_field = get_customer_company_field()
    subcontractor_field = get_subcontractor_field()

    # Fetch Company if field exists
    customer_company = ""
    if company_field:
        customer_company = frappe.db.get_value("Customer", customer, company_field) or ""

    # Fetch linked subcontractor (supplier) - OPTIONAL now
    subcontractor = ""
    if subcontractor_field:
        subcontractor = frappe.db.get_value("Customer", customer, subcontractor_field) or ""

    # ⭐ UPDATED: Fetch all "Send to Subcontractor" stock entries
    # Filter by: company matches customer_company, docstatus=1
    # Return as list of dictionaries for table display
    stock_entries = []
    stock_entries_data = []
    
    if customer_company:
        entries = frappe.get_all(
            "Stock Entry",
            filters={
                "stock_entry_type": "Send to Subcontractor",
                "company": customer_company,
                "docstatus": 1
            },
            fields=["name", "supplier", "posting_date", "posting_time", "subcontracting_order"],
            order_by="posting_date desc, posting_time desc"
        )
        
        # ⭐ Return both formats:
        # 1. Simple list for backward compatibility
        # 2. Detailed data for table display
        for row in entries:
            stock_entries.append(row.name)
            stock_entries_data.append({
                "name": row.name,
                "supplier": row.supplier or "",
                "posting_date": str(row.posting_date) if row.posting_date else "",
                "posting_time": str(row.posting_time) if row.posting_time else "",
                "subcontracting_order": row.subcontracting_order or ""
            })

    # ⭐ NEW: Fetch Allowed Companies for Internal Customer
    allowed_companies = []
    is_internal_customer = frappe.db.get_value("Customer", customer, "is_internal_customer")
    
    if is_internal_customer:
        # Get all companies from "Allowed To Transact With" child table
        allowed_companies_data = frappe.get_all(
            "Allowed To Transact With",
            filters={"parent": customer, "parenttype": "Customer"},
            fields=["company"],
            pluck="company"
        )
        allowed_companies = list(filter(None, allowed_companies_data))

    return {
        "customer_company": customer_company,
        "stock_entries": "\n".join(stock_entries) if stock_entries else "",
        "stock_entries_data": stock_entries_data,  # ⭐ NEW: For table display
        "allowed_companies": allowed_companies
    }


# --------------------------------------------------------
# 4️⃣  Get all Items from a Stock Entry
# --------------------------------------------------------
@frappe.whitelist()
def get_stock_entry_items(stock_entry):

    items = frappe.get_all(
        "Stock Entry Detail",
        filters={"parent": stock_entry},
        fields=[
            "item_code",
            "item_name",
            "qty",
            "t_warehouse",
            "uom",
            "basic_rate",
            "parent",
            "item_group"
        ]
    )

    # Add item_group if not fetched
    for item in items:
        if not item.get("item_group"):
            item["item_group"] = (
                frappe.db.get_value("Item", item.item_code, "item_group") or ""
            )

    return items


# --------------------------------------------------------
# 5️⃣  ⭐ NEW: Query for Company field with filter
#     Shows only allowed companies for internal customers
# --------------------------------------------------------
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_allowed_companies_for_customer(doctype, txt, searchfield, start, page_len, filters):
    """
    Custom query function for Company field in Job Inward
    Filters companies based on Customer's "Allowed To Transact With" table
    """
    
    customer = filters.get("customer")
    
    if not customer:
        # If no customer selected, return all companies
        return frappe.get_all("Company", 
            filters={"name": ["like", f"%{txt}%"]},
            fields=["name"],
            limit_start=start,
            limit_page_length=page_len,
            as_list=True
        )
    
    # Check if customer is internal customer
    is_internal_customer = frappe.db.get_value("Customer", customer, "is_internal_customer")
    
    if not is_internal_customer:
        # If not internal customer, return all companies
        return frappe.get_all("Company",
            filters={"name": ["like", f"%{txt}%"]},
            fields=["name"],
            limit_start=start,
            limit_page_length=page_len,
            as_list=True
        )
    
    # Get allowed companies from child table
    allowed_companies = frappe.get_all(
        "Allowed To Transact With",
        filters={"parent": customer, "parenttype": "Customer"},
        fields=["company"],
        pluck="company"
    )
    
    if not allowed_companies:
        # If no allowed companies, return empty
        return []
    
    # Return only allowed companies matching search text
    return frappe.get_all("Company",
        filters={
            "name": ["in", allowed_companies],
            "name": ["like", f"%{txt}%"]
        },
        fields=["name"],
        limit_start=start,
        limit_page_length=page_len,
        as_list=True
    )


# --------------------------------------------------------
# 6️⃣  ⭐ FIXED: Query for Internal Customer field with filter
#     Shows only customers who have selected company in "Allowed To Transact With"
# --------------------------------------------------------
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_customers_by_allowed_company(doctype, txt, searchfield, start, page_len, filters):
    """
    Custom query function for Internal Customer field in Dialog
    Filters customers based on selected Company in "Allowed To Transact With" table
    """
    
    company = filters.get("company")
    
    if not company:
        # If no company selected, return only internal customers
        return frappe.db.sql("""
            SELECT name, customer_name 
            FROM `tabCustomer`
            WHERE is_internal_customer = 1
            AND (name LIKE %(txt)s OR customer_name LIKE %(txt)s)
            ORDER BY name
            LIMIT %(start)s, %(page_len)s
        """, {
            'txt': f'%{txt}%',
            'start': start,
            'page_len': page_len
        })
    
    # ⭐ FIXED: Using SQL JOIN to get customers who have selected company in "Allowed To Transact With"
    return frappe.db.sql("""
        SELECT DISTINCT c.name, c.customer_name
        FROM `tabCustomer` c
        INNER JOIN `tabAllowed To Transact With` a 
            ON a.parent = c.name 
            AND a.parenttype = 'Customer'
        WHERE c.is_internal_customer = 1
        AND a.company = %(company)s
        AND (c.name LIKE %(txt)s OR c.customer_name LIKE %(txt)s)
        ORDER BY c.name
        LIMIT %(start)s, %(page_len)s
    """, {
        'company': company,
        'txt': f'%{txt}%',
        'start': start,
        'page_len': page_len
    })