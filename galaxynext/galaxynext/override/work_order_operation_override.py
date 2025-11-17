import frappe
from erpnext.manufacturing.doctype.work_order_operation.work_order_operation import WorkOrderOperation

class WorkOrderOperationOverride(WorkOrderOperation):

    def validate(self):
        if getattr(self, 'docstatus', 0) == 1:
            return
        super().validate()

    def before_save(self):
        if getattr(self, 'docstatus', 0) == 1:
            self.flags.ignore_validate = True
            self.flags.ignore_permissions = True
            self.flags.ignore_links = True
        super().before_save()
