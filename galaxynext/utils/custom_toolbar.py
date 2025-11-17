# apps/galaxynext/galaxynext/utils/custom_toolbar.py

import frappe

@frappe.whitelist()
def get_help_links():
	return [
		{
			"label": "Documentation",
			"url": "https://docs.galaxyerpsoftware.com/",
			"target": "_blank"
		},
		# {
		# 	"label": "User Forum",
		# 	"url": "https://discuss.frappe.io",
		# 	"target": "_blank"
		# },
		# {
		# 	"label": "Frappe School",
		# 	"url": "https://frappe.school",
		# 	"target": "_blank"
		# },
		{
			"label": "Report an Issue",
			"url": "https://github.com/GalaxyERPSoftware/GalaxyNext/issues",
			"target": "_blank"
		},
		{
			"type": "separator"
		},
		{
			"label": "About",
			"action": "frappe.ui.misc.about()"
		},
		{
			"label": "Keyboard Shortcuts",
			"action": "frappe.ui.keys.show_keys()"
		},
		# {
		# 	"label": "Frappe Support",
		# 	"url": "https://frappe.io/support",
		# 	"target": "_blank"
		# }
	]
