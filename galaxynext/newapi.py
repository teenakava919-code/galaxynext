import frappe

@frappe.whitelist(allow_guest=True)
def get_logged_in_user():
    user = frappe.session.user   # current login user (email id)
    
    # Guest hoy to handle karo
    if user == "Guest":
        return {"message": "No user logged in"}
    
    return {"email": user}
postman