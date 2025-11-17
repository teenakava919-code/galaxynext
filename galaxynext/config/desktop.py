# # def get_data():
# #     return [
# #         {
# #             "label": "Manufacturing",
# #             "items": [
# #                 {
# #                     "type": "page",
# #                     "name": "workstation-gantt",
# #                     "label": "Workstation Gantt",
# #                     "icon": "octicon octicon-calendar",
# #                 }
# #             ],
# #         }
# #     ]
# #


# # from frappe import _

# # def get_data():
# #     return [
# #         {
# #             "module_name": "Manufacturing",
# #             "category": "Modules",
# #             "label": _("Manufacturing"),
# #             "color": "#FFA00A",
# #             "icon": "octicon octicon-package",
# #             "type": "module",
# #             "description": "Manufacturing and Production"
# #         },
# #         {
# #             "module_name": "Workstation Gantt",
# #             "category": "Places",
# #             "label": _("Workstation Gantt"),
# #             "type": "page",
# #             "link": "workstation-gantt",
# #             "icon": "octicon octicon-calendar",
# #             "color": "#7289da",
# #             "_label": _("Workstation Gantt View")
# #         }
# #     ]


# from frappe import _

# def get_data():
#     return [
#         {
#             "module_name": "Workstation Gantt",
#             "category": "Places",
#             "label": _("Workstation Gantt"),
#             "type": "page",
#             "link": "workstation-gantt",
#             "icon": "octicon octicon-calendar",
#             "color": "#7289da",
#             "description": _("Visual timeline view of workstation schedules and work orders")
#         }
#     ]