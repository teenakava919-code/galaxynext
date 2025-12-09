# # galaxynext/api.py

# import frappe

# @frappe.whitelist()
# @frappe.validate_and_sanitize_search_inputs
# def get_miscellaneous_options(doctype, txt, searchfield, start, page_len, filters=None):
#     """
#     Returns MiscellaneousMst options filtered by trantype + status=1.
#     """
#     filters = filters or {}
#     trantype = filters.get("trantype")
#     txt = txt or ""

#     if not trantype:
#         return []

#     like_txt = f"%{txt}%"

#     return frappe.db.sql("""
#         SELECT name, value
#         FROM `tabMiscellaneousMst`
#         WHERE trantype = %s
#           AND status = 'true'
#           AND (name LIKE %s OR value LIKE %s)
#         ORDER BY value
#         LIMIT %s, %s
#     """, (trantype, like_txt, like_txt, start, page_len))



# galaxynext/api.py
import frappe

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_miscellaneous_options(doctype, txt, searchfield, start, page_len, filters=None):
    """
    Returns MiscellaneousMst options filtered by trantype + status='true'.
    """
    filters = filters or {}
    trantype = filters.get("trantype")
    txt = txt or ""

    if not trantype:
        return []

    like_txt = f"%{txt}%"

    # IMPORTANT: Return as list of tuples (name, value) for ERPNext dropdown
    return frappe.db.sql("""
        SELECT name, value
        FROM `tabMiscellaneousMst`
        WHERE trantype = %s
          AND status = 'true'
          AND (name LIKE %s OR value LIKE %s)
        ORDER BY value
        LIMIT %s, %s
    """, (trantype, like_txt, like_txt, start, page_len), as_list=True)  # ← as_list=True जरूरी है!
    
# -------------------------------------------------------------------------------

# # import frappe
# from frappe.utils import get_datetime

# @frappe.whitelist()
# def get_work_orders(workstation=None, status=None):
#     filters = {"docstatus": ["<", 1]}
#     if workstation:
#         filters["operations.workstation"] = workstation
#     if status:
#         filters["status"] = status

#     work_orders = frappe.get_all(
#         "Work Order",
#         fields=["name", "production_item", "planned_start_date", "planned_end_date", "status"],
#         filters=filters,
#     )

#     tasks = []
#     for wo in work_orders:
#         tasks.append({
#             "id": wo.name,
#             "name": wo.production_item,
#             "start": wo.planned_start_date,
#             "end": wo.planned_end_date,
#             "progress": 100 if wo.status == "Completed" else 50,
#             "workstation": get_workstation_for_wo(wo.name),
#         })
#     return tasks


# def get_workstation_for_wo(wo_name):
#     op = frappe.db.get_value("Work Order Operation", {"parent": wo_name}, "workstation")
#     return op or "Unassigned"


# @frappe.whitelist()
# def update_work_order_dates(name, start_date, end_date):
#     frappe.db.set_value("Work Order", name, {
#         "planned_start_date": get_datetime(start_date),
#         "planned_end_date": get_datetime(end_date)
#     })
#     frappe.db.commit()
#     return {"message": "Updated successfully"}



# ---------=--------------------------------working code-----------------------


# @frappe.whitelist()
# def get_item_default_warehouse(item_code, company):
#     # First check Item Default table
#     wh = frappe.db.get_value(
#         "Item Default",
#         {"parent": item_code, "company": company},
#         "default_warehouse"
#     )
    
#     # If not found, get from Item master
#     if not wh:
#         item = frappe.get_doc("Item", item_code)
#         wh = item.default_warehouse if hasattr(item, 'default_warehouse') else None
    
#     return wh or ""

# @frappe.whitelist()
# def get_available_subcontracting_orders(doctype, txt, searchfield, start, page_len, filters):
#     """
#     Get Subcontracting Orders that don't have Sales Orders created yet
#     """
#     company = filters.get("company")
    
#     # Get all Subcontracting Orders already used in Sales Orders
#     used_sco = frappe.db.sql("""
#         SELECT DISTINCT po_no 
#         FROM `tabSales Order` 
#         WHERE po_no IS NOT NULL 
#         AND po_no LIKE 'SC-ORD-%'
#         AND docstatus < 2
#     """, as_dict=True)
    
#     used_sco_list = [d.po_no for d in used_sco]
    
#     # Build NOT IN condition
#     not_in_condition = ""
#     if used_sco_list:
#         not_in_values = ', '.join([f"'{x}'" for x in used_sco_list])
#         not_in_condition = f"AND name NOT IN ({not_in_values})"
    
#     return frappe.db.sql(f"""
#         SELECT name, supplier_name, schedule_date, purchase_order
#         FROM `tabSubcontracting Order`
#         WHERE company = %(company)s
#         AND docstatus = 1
#         AND (name LIKE %(txt)s OR supplier_name LIKE %(txt)s OR purchase_order LIKE %(txt)s)
#         {not_in_condition}
#         ORDER BY modified DESC
#         LIMIT %(start)s, %(page_len)s
#     """, {
#         'company': company,
#         'txt': f"%{txt}%",
#         'start': start,
#         'page_len': page_len
#     })


# import frappe

# @frappe.whitelist()
# def get_item_default_warehouse(item_code, company):
#     """
#     Get default warehouse for an item in a specific company
#     First checks Item Default table, then falls back to Item master
#     """
#     # Step 1: Check Item Default table for company-specific warehouse
#     warehouse = frappe.db.get_value(
#         "Item Default",
#         {"parent": item_code, "company": company},
#         "default_warehouse"
#     )
    
#     # Step 2: If not found, get from Item master
#     if not warehouse:
#         item_doc = frappe.get_doc("Item", item_code)
#         warehouse = item_doc.get("default_warehouse")
    
#     # Step 3: Return warehouse or empty string if nothing found
#     return warehouse if warehouse else ""


# @frappe.whitelist()
# def get_available_subcontracting_orders(doctype, txt, searchfield, start, page_len, filters):
#     """
#     Get Subcontracting Orders that haven't been used in Sales Orders yet
    
#     Logic:
#     1. Find all Subcontracting Orders already used in Sales Orders
#     2. Return only unused Subcontracting Orders
#     """
#     company = filters.get("company")
    
#     # Step 1: Find all SC Orders already used in Sales Orders
#     used_orders_query = """
#         SELECT DISTINCT po_no 
#         FROM `tabSales Order` 
#         WHERE po_no IS NOT NULL 
#         AND po_no LIKE 'SC-ORD-%'
#         AND docstatus < 2
#     """
#     used_orders = frappe.db.sql(used_orders_query, as_dict=True)
    
#     # Step 2: Create a list of used order IDs
#     used_list = [order.po_no for order in used_orders]
    
#     # Step 3: Build NOT IN condition to exclude used orders
#     exclude_condition = ""
#     if used_list:
#         # Convert list to SQL format: 'SC-ORD-001', 'SC-ORD-002'
#         formatted_list = ', '.join([f"'{order}'" for order in used_list])
#         exclude_condition = f"AND name NOT IN ({formatted_list})"
    
#     # Step 4: Get available (unused) Subcontracting Orders
#     query = f"""
#         SELECT name, supplier_name, schedule_date, purchase_order
#         FROM `tabSubcontracting Order`
#         WHERE company = %(company)s
#         AND docstatus = 1
#         AND (name LIKE %(txt)s OR supplier_name LIKE %(txt)s OR purchase_order LIKE %(txt)s)
#         {exclude_condition}
#         ORDER BY modified DESC
#         LIMIT %(start)s, %(page_len)s
#     """
    
#     return frappe.db.sql(query, {
#         'company': company,
#         'txt': f"%{txt}%",
#         'start': start,
#         'page_len': page_len
#     })


# @frappe.whitelist()
# def get_allowed_internal_customers(doctype, txt, searchfield, start, page_len, filters):
#     """
#     Get internal customers that are allowed to transact with the selected company
    
#     Logic:
#     1. Customer must be an internal customer
#     2. Selected company must exist in customer's "Allowed To Transact With" table
#     3. Display customer_name if available, otherwise show name
#     """
#     company = filters.get("company")
    
#     # Return empty list if no company selected
#     if not company:
#         return []
    
#     # Query to get allowed customers
#     query = """
#         SELECT 
#             c.name,
#             CASE 
#                 WHEN c.customer_name IS NOT NULL AND c.customer_name != '' 
#                 THEN c.customer_name 
#                 ELSE c.name 
#             END as display_name
#         FROM `tabCustomer` c
#         INNER JOIN `tabAllowed To Transact With` att 
#             ON att.parent = c.name
#         WHERE c.is_internal_customer = 1
#         AND c.disabled = 0
#         AND att.company = %(company)s
#         AND (c.name LIKE %(txt)s OR c.customer_name LIKE %(txt)s)
#         ORDER BY 
#             CASE 
#                 WHEN c.customer_name IS NOT NULL AND c.customer_name != '' 
#                 THEN c.customer_name 
#                 ELSE c.name 
#             END
#         LIMIT %(start)s, %(page_len)s
#     """
    
#     return frappe.db.sql(query, {
#         'company': company,
#         'txt': f"%{txt}%",
#         'start': start,
#         'page_len': page_len
#     })




import frappe
import json

@frappe.whitelist()
def get_item_default_warehouse(item_code, company):
    """
    Get default warehouse for an item in a specific company
    First checks Item Default table, then falls back to Item master
    """
    try:
        # Step 1: Check Item Default table for company-specific warehouse
        warehouse = frappe.db.get_value(
            "Item Default",
            {"parent": item_code, "company": company},
            "default_warehouse"
        )
        
        # Step 2: If not found, get from Item master
        if not warehouse:
            warehouse = frappe.db.get_value("Item", item_code, "default_warehouse")
        
        # Step 3: Return warehouse or empty string if nothing found
        return warehouse if warehouse else ""
    
    except Exception as e:
        frappe.log_error(
            message=f"Error fetching warehouse for item {item_code}: {str(e)}",
            title="Get Item Warehouse Error"
        )
        return ""


# ========================================================================
# 🆕 NEW API: Batch Warehouse Fetch (Performance Improvement)
# ========================================================================
@frappe.whitelist()
def get_multiple_item_warehouses(item_codes, company):
    """
    ⚡ Batch fetch warehouses for multiple items (MUCH faster!)
    
    Instead of 50 API calls for 50 items, this does it in ONE call
    
    Args:
        item_codes: JSON string or list of item codes
        company: Company name
        
    Returns:
        Dictionary mapping item_code to warehouse
        Example: {"ITEM-001": "Stores - XYZ", "ITEM-002": "FG - XYZ"}
    """
    try:
        # Convert JSON string to list if needed
        if isinstance(item_codes, str):
            item_codes = json.loads(item_codes)
        
        if not item_codes or not isinstance(item_codes, list):
            return {}
        
        warehouse_map = {}
        
        # ✅ OPTIMIZED: Single query to fetch all Item Defaults at once
        item_defaults = frappe.db.sql("""
            SELECT 
                parent as item_code,
                default_warehouse
            FROM `tabItem Default`
            WHERE parent IN %(item_codes)s
            AND company = %(company)s
            AND default_warehouse IS NOT NULL
            AND default_warehouse != ''
        """, {
            'item_codes': item_codes,
            'company': company
        }, as_dict=True)
        
        # Map the results
        for row in item_defaults:
            warehouse_map[row.item_code] = row.default_warehouse
        
        # ✅ OPTIMIZED: For items without company-specific warehouse, 
        # fetch from Item master in one query
        items_without_warehouse = [
            item for item in item_codes 
            if item not in warehouse_map
        ]
        
        if items_without_warehouse:
            item_warehouses = frappe.db.sql("""
                SELECT 
                    name as item_code,
                    default_warehouse
                FROM `tabItem`
                WHERE name IN %(item_codes)s
                AND default_warehouse IS NOT NULL
                AND default_warehouse != ''
            """, {
                'item_codes': items_without_warehouse
            }, as_dict=True)
            
            for row in item_warehouses:
                warehouse_map[row.item_code] = row.default_warehouse
        
        return warehouse_map
    
    except Exception as e:
        frappe.log_error(
            message=f"Error in batch warehouse fetch: {str(e)}",
            title="Batch Warehouse Fetch Error"
        )
        return {}


@frappe.whitelist()
def get_available_subcontracting_orders(doctype, txt, searchfield, start, page_len, filters):
    """
    Get Subcontracting Orders that haven't been used in Sales Orders yet
    
    Logic:
    1. Find all Subcontracting Orders already used in Sales Orders
    2. Return only unused Subcontracting Orders
    """
    try:
        company = filters.get("company")
        
        if not company:
            return []
        
        # Step 1: Find all SC Orders already used in Sales Orders
        # ✅ IMPROVED: Added status filter to exclude cancelled Sales Orders
        used_orders_query = """
            SELECT DISTINCT po_no 
            FROM `tabSales Order` 
            WHERE po_no IS NOT NULL 
            AND po_no LIKE 'SC-ORD-%'
            AND docstatus IN (0, 1)
        """
        used_orders = frappe.db.sql(used_orders_query, as_dict=True)
        
        # Step 2: Create a list of used order IDs
        used_list = [order.po_no for order in used_orders if order.po_no]
        
        # Step 3: Build NOT IN condition to exclude used orders
        exclude_condition = ""
        if used_list:
            # ✅ IMPROVED: Use parameterized query for safety
            placeholders = ', '.join(['%s'] * len(used_list))
            exclude_condition = f"AND name NOT IN ({placeholders})"
        
        # Step 4: Get available (unused) Subcontracting Orders
        # ✅ IMPROVED: Added more searchable fields and better ordering
        query = f"""
            SELECT 
                name, 
                supplier_name, 
                schedule_date, 
                purchase_order,
                transaction_date
            FROM `tabSubcontracting Order`
            WHERE company = %s
            AND docstatus = 1
            AND (
                name LIKE %s 
                OR supplier_name LIKE %s 
                OR purchase_order LIKE %s
            )
            {exclude_condition}
            ORDER BY 
                CASE 
                    WHEN name LIKE %s THEN 1
                    WHEN supplier_name LIKE %s THEN 2
                    ELSE 3
                END,
                schedule_date DESC,
                modified DESC
            LIMIT %s, %s
        """
        
        # Build parameters list
        search_pattern = f"%{txt}%"
        params = [company, search_pattern, search_pattern, search_pattern]
        
        # Add used_list for NOT IN condition
        if used_list:
            params.extend(used_list)
        
        # Add search patterns for ORDER BY
        params.extend([search_pattern, search_pattern])
        
        # Add pagination
        params.extend([start, page_len])
        
        return frappe.db.sql(query, tuple(params))
    
    except Exception as e:
        frappe.log_error(
            message=f"Error fetching subcontracting orders: {str(e)}",
            title="Get Subcontracting Orders Error"
        )
        return []


@frappe.whitelist()
def get_allowed_internal_customers(doctype, txt, searchfield, start, page_len, filters):
    """
    Get internal customers that are allowed to transact with the selected company
    
    Logic:
    1. Customer must be an internal customer
    2. Selected company must exist in customer's "Allowed To Transact With" table
    3. Display customer_name if available, otherwise show name
    """
    try:
        company = filters.get("company")
        
        # Return empty list if no company selected
        if not company:
            return []
        
        # ✅ IMPROVED: Better query with proper NULL handling
        query = """
            SELECT 
                c.name,
                COALESCE(NULLIF(c.customer_name, ''), c.name) as display_name
            FROM `tabCustomer` c
            INNER JOIN `tabAllowed To Transact With` att 
                ON att.parent = c.name
            WHERE c.is_internal_customer = 1
            AND c.disabled = 0
            AND att.company = %(company)s
            AND (c.name LIKE %(txt)s OR c.customer_name LIKE %(txt)s)
            ORDER BY 
                CASE 
                    WHEN c.name LIKE %(txt)s THEN 1
                    WHEN c.customer_name LIKE %(txt)s THEN 2
                    ELSE 3
                END,
                COALESCE(NULLIF(c.customer_name, ''), c.name)
            LIMIT %(start)s, %(page_len)s
        """
        
        return frappe.db.sql(query, {
            'company': company,
            'txt': f"%{txt}%",
            'start': start,
            'page_len': page_len
        })
    
    except Exception as e:
        frappe.log_error(
            message=f"Error fetching internal customers: {str(e)}",
            title="Get Internal Customers Error"
        )
        return []


# ========================================================================
# 🆕 BONUS API: Validate Subcontracting Order Availability
# ========================================================================
@frappe.whitelist()
def validate_subcontracting_order_usage(subcontracting_order):
    """
    Check if a Subcontracting Order is already used in any Sales Order
    
    Returns:
        dict: {
            "is_used": bool,
            "sales_order": str or None,
            "message": str
        }
    """
    try:
        existing_so = frappe.db.get_value(
            "Sales Order",
            {
                "po_no": subcontracting_order,
                "docstatus": ["<", 2]  # Not cancelled
            },
            ["name", "docstatus"],
            as_dict=True
        )
        
        if existing_so:
            status = "Draft" if existing_so.docstatus == 0 else "Submitted"
            return {
                "is_used": True,
                "sales_order": existing_so.name,
                "message": f"This Subcontracting Order is already used in Sales Order {existing_so.name} ({status})"
            }
        
        return {
            "is_used": False,
            "sales_order": None,
            "message": "Subcontracting Order is available"
        }
    
    except Exception as e:
        frappe.log_error(
            message=f"Error validating SC Order usage: {str(e)}",
            title="Validate SC Order Error"
        )
        return {
            "is_used": False,
            "sales_order": None,
            "message": "Could not validate"
        }