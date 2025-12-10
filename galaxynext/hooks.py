app_name = "galaxynext"
app_title = "galaxynext"
app_publisher = "khushi"
app_description = "text change"
app_email = "khushim@gmail.com"
app_license = "mit"

# Import API
override_whitelisted_methods = {
    "galaxynext.api.get_all_customer": "galaxynext.api.get_all_customer",
    "galaxynext.api.get_all_company": "galaxynext.api.get_all_company",
    "galaxynext.api.get_all_companyaddress": "galaxynext.api.get_all_companyaddress",
    "galaxynext.api.get_all_customeraddress": "galaxynext.api.get_all_customeraddress",
    "galaxynext.api.whoami": "galaxynext.api.whoami",
    "galaxynext.api.get_portal_customers": "galaxynext.api.get_portal_customers",
    "galaxynext.api.get_portal_user": "galaxynext.api.get_portal_user",
    "galaxynext.api.get_logged_in_user": "galaxynext.api.get_logged_in_user",
    "galaxynext.api.get_item_valuation_rate": "galaxynext.api.get_item_valuation_rate",
    "galaxynext.api.get_companies_for_portal_user":"galaxynext.api.get_companies_for_portal_user",
    "galaxynext.api.get_all_ca":"galaxynext.api.get_all_ca",
    "galaxynext.api.get_company_gstin":"galaxynext.api.get_company_gstin",
    # API FOR SUPPLIER 
    "galaxynext.SupplierAPI.get_logged_in_supplier_user": "galaxynext.SupplierAPI.get_logged_in_supplier_user",
    "galaxynext.SupplierAPI.get_all_supplier_company": "galaxynext.SupplierAPI.get_all_supplier_company",
    "galaxynext.SupplierAPI.get_all_supplier":"galaxynext.SupplierAPI.get_all_supplier",
    "galaxynext.SupplierAPI.get_all_supplieraddress":"galaxynext.SupplierAPI.get_all_supplieraddress",
    "galaxynext.SupplierAPI.get_all_supplier_companyaddress":"galaxynext.SupplierAPI.get_all_supplier_companyaddress",
    # For Gantt view for WorkOrder
    "galaxynext.GanttAPI.get_workstation_gantt":"galaxynext.GanttAPI.get_workstation_gantt"
}

# Include custom JS and CSS in Desk
app_include_css = "/assets/galaxynext/css/galaxyerp.css"
app_include_js = [
    "/assets/galaxynext/js/galaxyerp.js",
    "/assets/galaxynext/js/custom_about.js"
]

# Include custom JS and CSS in Web Templates
web_include_css = "/assets/galaxynext/css/galaxyerp.css"
web_include_js = [
    "/assets/galaxynext/js/galaxyerp.js",
    "/assets/galaxynext/js/custom_about.js"
]

# Website context for logo overrides
website_context = {
    "favicon": "/assets/galaxynext/images/galaxynext_logo.png",
    "splash_image": "/assets/galaxynext/images/galaxynext_logo.png",
    "app_logo_url": "/assets/galaxynext/images/galaxynext_logo.png",
    "brand_logo": "/assets/galaxynext/images/galaxynext_logo.png",
    "footer_logo": "/assets/galaxynext/images/galaxynext_logo.png",
    "login_with_email_link": True
}

# Override favicon for all contexts
favicon = "/assets/galaxynext/images/galaxynext_logo.png"

# Override the About dialog JS from Frappe
override_include_files = {
    "frappe/public/js/frappe/ui/toolbar/about.js": "/assets/galaxynext/js/custom_about.js",
    "frappe/public/js/frappe/help/onboarding.js": "/assets/galaxynext/js/custom_onboarding.js",
    "erpnext/erpnext/setup/onboarding_step/create_an_item/create_an_item.json": "/assets/galaxynext/js/create_an_item.json"
}

onboarding_steps = {
    "Item": "galaxynext.setup.onboarding_step.create_an_item.create_an_item"
}


# App logo for top left corner
app_logo_url = "/assets/galaxynext/images/galaxynext_logo.png"

# ✅ Add this line for translation override:
translated_languages = ["en"]

# If needed in the future, you can override whitelisted methods here:
# override_whitelisted_methods = {
#     "frappe.widgets.onboarding_widget.get_onboarding_data": "galaxynext.utils.onboarding_widget_override.get_onboarding_widget_data_override",
#     "frappe.widgets.onboarding_widget.get_step_data": "galaxynext.utils.onboarding_widget_override.override_onboarding_step_data"
# }

fixtures = [
{
	"dt":"Client Script",
		"filters":[["name","in",[
			"NEW SALE ORDER",
            "Job Inward Date Validation",
            "Job Inward companywise warehouse",
            "Job Inward Item Detail For UOM",
            "Auto Ganareted JobInward No",
            "Quantity validation for job inward",
            "click"
   ]]]
},
    {
	"dt":"Server Script",
		"filters":[["name","in",[
			"Stock k liye hai",
            "Cancel Stock Entry on Job Inward Cancel",
            "Stock Effect For JobInward",
            "Portal User",
            "get_customers_for_portal_user",
            "test_message",
            "Permission",
            "Query",
            "Permission Server Script",
            "PURCHASE ORDER PORTAL USER"
   ]]]
},
    {
        "dt": "Custom Field",
        "filters": [["dt", "in", [
            "Customer"
        ]]]
    },
        {
        "dt": "Property Setter",
        "filters": [["doc_type", "in", [
            "Customer"
        ]]]
    }
]
