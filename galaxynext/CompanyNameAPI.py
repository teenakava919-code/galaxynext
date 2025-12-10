import frappe

@frappe.whitelist(allow_guest=True)
def get_all_company():
    customers = frappe.db.sql("""
        SELECT * FROM tabCompany
    """, as_dict=True)

    return customers