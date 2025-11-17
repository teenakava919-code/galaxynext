# import frappe
# from frappe.utils import now

# @frappe.whitelist()
# def get_workorders():
#     try:
#         # Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]

#         # Get all work orders and operations
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.operation,
#                 wop.workstation
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus < 2
#             ORDER BY wo.creation DESC
#         """, as_dict=True)

#         return {"all_workstations": all_workstations, "work_orders": work_orders}

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(work_order, workstation, start_date, end_date):
#     """Update Work Order + Operation when dragged in Gantt"""
#     try:
#         if not frappe.db.exists("Work Order", work_order):
#             return "not found"

#         frappe.db.set_value("Work Order", work_order, {
#             "planned_start_date": start_date,
#             "planned_end_date": end_date,
#             "modified": now()
#         })

#         frappe.db.sql("""
#             UPDATE `tabWork Order Operation`
#             SET workstation = %s
#             WHERE parent = %s
#         """, (workstation, work_order))

#         frappe.db.commit()
#         return "success"
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         return str(e)


# # workinggg


# import frappe
# from frappe.utils import now

# @frappe.whitelist()
# def get_workorders():
#     try:
#         # Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]

#         # Get all work orders and operations
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.operation,
#                 wop.workstation
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus < 2
#             ORDER BY wo.creation DESC
#         """, as_dict=True)

#         return {"all_workstations": all_workstations, "work_orders": work_orders}

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(work_order, workstation, start_date, end_date):
#     """Update Work Order + Operation when dragged in Gantt"""
#     try:
#         if not frappe.db.exists("Work Order", work_order):
#             return "not found"

#         # Load the Work Order document
#         doc = frappe.get_doc("Work Order", work_order)
        
#         # Update the planned dates
#         doc.planned_start_date = start_date
#         doc.planned_end_date = end_date
        
#         # Update workstation in operations
#         for operation in doc.operations:
#             operation.workstation = workstation
        
#         # Add a comment to track the change
#         doc.add_comment(
#             "Info",
#             f"Updated via Gantt: Workstation updated → {workstation}"
#         )
        
#         # Save the document (this will trigger activity logging)
#         doc.save(ignore_permissions=True)
        
#         frappe.db.commit()
#         return "success"
        
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         return str(e)



# --------------------------------------------------------------------------------
# import frappe

# @frappe.whitelist()
# def get_workorders():
#     """Fetch only submitted work orders and their operations."""
#     try:
#         # ✅ Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]

#         # ✅ Fetch only submitted work orders (docstatus = 1)
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.name AS operation_id,
#                 wop.operation,
#                 wop.workstation,
#                 wop.planned_start_time,
#                 wop.planned_end_time
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus = 1
#             ORDER BY wo.creation DESC
#         """, as_dict=True)

#         return {"all_workstations": all_workstations, "work_orders": work_orders}

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(operation_id, workstation, start_date, end_date):
#     """Update only the dragged operation, not all operations."""
#     try:
#         if not frappe.db.exists("Work Order Operation", operation_id):
#             return "not found"

#         op = frappe.get_doc("Work Order Operation", operation_id)
#         op.workstation = workstation
#         op.planned_start_time = start_date
#         op.planned_end_time = end_date
#         op.save(ignore_permissions=True)

#         # ✅ Also update parent work order planned dates if needed
#         parent = frappe.get_doc("Work Order", op.parent)
#         parent.planned_start_date = min(
#             [d.planned_start_time for d in parent.operations if d.planned_start_time]
#         )
#         parent.planned_end_date = max(
#             [d.planned_end_time for d in parent.operations if d.planned_end_time]
#         )
#         parent.save(ignore_permissions=True)

#         frappe.db.commit()
#         return "success"

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         return str(e)

# ------------------------------------workstation update----------------------------------------

# import frappe
# from frappe.utils import get_datetime

# @frappe.whitelist()
# def get_workorders():
#     """Fetch only submitted work orders and their operations."""
#     try:
#         # ✅ Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]
        
#         # ✅ Fetch only submitted work orders (docstatus = 1)
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.name AS operation_id,
#                 wop.operation,
#                 wop.workstation,
#                 wop.planned_start_time,
#                 wop.planned_end_time
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus = 1
#             ORDER BY wo.creation DESC
#         """, as_dict=True)
        
#         return {"all_workstations": all_workstations, "work_orders": work_orders}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(operation_id, workstation, start_date, end_date):
#     """Update only the dragged operation using direct SQL for submitted documents."""
#     try:
#         if not frappe.db.exists("Work Order Operation", operation_id):
#             return {"status": "error", "message": "Operation not found"}
        
#         # ✅ Convert datetime strings to proper format
#         # FullCalendar sends ISO format with timezone, we need to convert to MySQL datetime
#         try:
#             start_datetime = get_datetime(start_date)
#             end_datetime = get_datetime(end_date)
#         except Exception as e:
#             return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}
        
#         # ✅ Get the parent work order name
#         parent_wo = frappe.db.get_value("Work Order Operation", operation_id, "parent")
        
#         if not parent_wo:
#             return {"status": "error", "message": "Parent Work Order not found"}
        
#         # ✅ Check if work order is submitted
#         docstatus = frappe.db.get_value("Work Order", parent_wo, "docstatus")
        
#         if docstatus == 1:
#             # ✅ For submitted documents, use direct SQL update to bypass validation
#             frappe.db.sql("""
#                 UPDATE `tabWork Order Operation`
#                 SET workstation = %s,
#                     planned_start_time = %s,
#                     planned_end_time = %s,
#                     modified = NOW(),
#                     modified_by = %s
#                 WHERE name = %s
#             """, (workstation, start_datetime, end_datetime, frappe.session.user, operation_id))
            
#             # ✅ Update parent work order dates based on all operations
#             operations = frappe.db.sql("""
#                 SELECT planned_start_time, planned_end_time
#                 FROM `tabWork Order Operation`
#                 WHERE parent = %s
#                 AND planned_start_time IS NOT NULL
#                 AND planned_end_time IS NOT NULL
#             """, parent_wo, as_dict=True)
            
#             if operations:
#                 min_start = min([op.planned_start_time for op in operations])
#                 max_end = max([op.planned_end_time for op in operations])
                
#                 frappe.db.sql("""
#                     UPDATE `tabWork Order`
#                     SET planned_start_date = %s,
#                         planned_end_date = %s,
#                         modified = NOW(),
#                         modified_by = %s
#                     WHERE name = %s
#                 """, (min_start, max_end, frappe.session.user, parent_wo))
            
#             frappe.db.commit()
#             return {"status": "success", "message": "Operation updated successfully"}
        
#         else:
#             # ✅ For draft documents, use normal save
#             op = frappe.get_doc("Work Order Operation", operation_id)
#             op.workstation = workstation
#             op.planned_start_time = start_datetime
#             op.planned_end_time = end_datetime
#             op.save(ignore_permissions=True)
            
#             # Update parent work order
#             parent = frappe.get_doc("Work Order", op.parent)
#             parent.planned_start_date = min(
#                 [d.planned_start_time for d in parent.operations if d.planned_start_time]
#             )
#             parent.planned_end_date = max(
#                 [d.planned_end_time for d in parent.operations if d.planned_end_time]
#             )
#             parent.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             return {"status": "success", "message": "Operation updated successfully"}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         frappe.db.rollback()
#         return {"status": "error", "message": str(e)}


# -------------------------perfect and working code




# import frappe
# from frappe.utils import get_datetime, now_datetime

# @frappe.whitelist()
# def get_workorders():
#     """Fetch only submitted work orders and their operations."""
#     try:
#         # ✅ Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]
        
#         # ✅ Fetch only submitted work orders (docstatus = 1)
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.name AS operation_id,
#                 wop.operation,
#                 wop.workstation,
#                 wop.planned_start_time,
#                 wop.planned_end_time
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus = 1
#             ORDER BY wo.creation DESC
#         """, as_dict=True)
        
#         return {"all_workstations": all_workstations, "work_orders": work_orders}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(operation_id, workstation, start_date, end_date):
#     """Update only the dragged operation using direct SQL for submitted documents."""
#     try:
#         if not frappe.db.exists("Work Order Operation", operation_id):
#             return {"status": "error", "message": "Operation not found"}
        
#         # ✅ Convert datetime strings to proper format
#         try:
#             start_datetime = get_datetime(start_date)
#             end_datetime = get_datetime(end_date)
#         except Exception as e:
#             return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}
        
#         # ✅ Get the current operation details before updating
#         old_operation = frappe.db.get_value(
#             "Work Order Operation", 
#             operation_id, 
#             ["parent", "operation", "workstation", "planned_start_time", "planned_end_time"],
#             as_dict=True
#         )
        
#         if not old_operation:
#             return {"status": "error", "message": "Operation not found"}
        
#         parent_wo = old_operation.parent
        
#         # ✅ Check if work order is submitted
#         docstatus = frappe.db.get_value("Work Order", parent_wo, "docstatus")
        
#         if docstatus == 1:
#             # ✅ For submitted documents, use direct SQL update to bypass validation
#             frappe.db.sql("""
#                 UPDATE `tabWork Order Operation`
#                 SET workstation = %s,
#                     planned_start_time = %s,
#                     planned_end_time = %s,
#                     modified = NOW(),
#                     modified_by = %s
#                 WHERE name = %s
#             """, (workstation, start_datetime, end_datetime, frappe.session.user, operation_id))
            
#             # ✅ Add comment to Work Order Activity
#             comment_text = _build_activity_comment(
#                 old_operation.operation,
#                 old_operation.workstation,
#                 workstation,
#                 old_operation.planned_start_time,
#                 start_datetime,
#                 old_operation.planned_end_time,
#                 end_datetime
#             )
            
#             # Add comment to Work Order
#             frappe.get_doc({
#                 "doctype": "Comment",
#                 "comment_type": "Info",
#                 "reference_doctype": "Work Order",
#                 "reference_name": parent_wo,
#                 "content": comment_text,
#                 "comment_email": frappe.session.user,
#                 "comment_by": frappe.session.user_fullname or frappe.session.user
#             }).insert(ignore_permissions=True)
            
#             # ✅ Update parent work order dates based on all operations
#             operations = frappe.db.sql("""
#                 SELECT planned_start_time, planned_end_time
#                 FROM `tabWork Order Operation`
#                 WHERE parent = %s
#                 AND planned_start_time IS NOT NULL
#                 AND planned_end_time IS NOT NULL
#             """, parent_wo, as_dict=True)
            
#             if operations:
#                 min_start = min([op.planned_start_time for op in operations])
#                 max_end = max([op.planned_end_time for op in operations])
                
#                 # Check if parent dates changed
#                 parent_doc = frappe.get_doc("Work Order", parent_wo)
#                 old_start = parent_doc.planned_start_date
#                 old_end = parent_doc.planned_end_date
                
#                 frappe.db.sql("""
#                     UPDATE `tabWork Order`
#                     SET planned_start_date = %s,
#                         planned_end_date = %s,
#                         modified = NOW(),
#                         modified_by = %s
#                     WHERE name = %s
#                 """, (min_start, max_end, frappe.session.user, parent_wo))
                
#                 # Add comment for parent date changes
#                 if old_start != min_start or old_end != max_end:
#                     parent_comment = _build_parent_date_comment(old_start, min_start, old_end, max_end)
#                     frappe.get_doc({
#                         "doctype": "Comment",
#                         "comment_type": "Info",
#                         "reference_doctype": "Work Order",
#                         "reference_name": parent_wo,
#                         "content": parent_comment,
#                         "comment_email": frappe.session.user,
#                         "comment_by": frappe.session.user_fullname or frappe.session.user
#                     }).insert(ignore_permissions=True)
            
#             frappe.db.commit()
#             return {"status": "success", "message": "Operation updated successfully"}
        
#         else:
#             # ✅ For draft documents, use normal save
#             op = frappe.get_doc("Work Order Operation", operation_id)
            
#             # Store old values for comment
#             old_ws = op.workstation
#             old_start = op.planned_start_time
#             old_end = op.planned_end_time
            
#             op.workstation = workstation
#             op.planned_start_time = start_datetime
#             op.planned_end_time = end_datetime
#             op.save(ignore_permissions=True)
            
#             # Add comment
#             comment_text = _build_activity_comment(
#                 op.operation, old_ws, workstation, old_start, start_datetime, old_end, end_datetime
#             )
            
#             frappe.get_doc({
#                 "doctype": "Comment",
#                 "comment_type": "Info",
#                 "reference_doctype": "Work Order",
#                 "reference_name": op.parent,
#                 "content": comment_text,
#                 "comment_email": frappe.session.user,
#                 "comment_by": frappe.session.user_fullname or frappe.session.user
#             }).insert(ignore_permissions=True)
            
#             # Update parent work order
#             parent = frappe.get_doc("Work Order", op.parent)
#             old_parent_start = parent.planned_start_date
#             old_parent_end = parent.planned_end_date
            
#             parent.planned_start_date = min(
#                 [d.planned_start_time for d in parent.operations if d.planned_start_time]
#             )
#             parent.planned_end_date = max(
#                 [d.planned_end_time for d in parent.operations if d.planned_end_time]
#             )
#             parent.save(ignore_permissions=True)
            
#             # Add parent date comment if changed
#             if old_parent_start != parent.planned_start_date or old_parent_end != parent.planned_end_date:
#                 parent_comment = _build_parent_date_comment(
#                     old_parent_start, parent.planned_start_date, 
#                     old_parent_end, parent.planned_end_date
#                 )
#                 frappe.get_doc({
#                     "doctype": "Comment",
#                     "comment_type": "Info",
#                     "reference_doctype": "Work Order",
#                     "reference_name": parent.name,
#                     "content": parent_comment,
#                     "comment_email": frappe.session.user,
#                     "comment_by": frappe.session.user_fullname or frappe.session.user
#                 }).insert(ignore_permissions=True)
            
#             frappe.db.commit()
            
#             return {"status": "success", "message": "Operation updated successfully"}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         frappe.db.rollback()
#         return {"status": "error", "message": str(e)}


# def _build_activity_comment(operation_name, old_ws, new_ws, old_start, new_start, old_end, new_end):
#     """Build detailed activity comment for operation changes."""
#     changes = []
    
#     if old_ws != new_ws:
#         changes.append(f"<b>Workstation</b> changed from <b>{old_ws or 'Not Set'}</b> to <b>{new_ws}</b>")
    
#     if old_start != new_start:
#         old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
#         new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
#         changes.append(f"<b>Planned Start Time</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
#     if old_end != new_end:
#         old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
#         new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
#         changes.append(f"<b>Planned End Time</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
#     if not changes:
#         return f"Operation <b>{operation_name}</b> updated via Gantt View"
    
#     comment = f"Operation <b>{operation_name}</b> updated via Gantt View:<br><br>"
#     comment += "<br>".join([f"• {change}" for change in changes])
    
#     return comment


# def _build_parent_date_comment(old_start, new_start, old_end, new_end):
#     """Build activity comment for parent Work Order date changes."""
#     changes = []
    
#     if old_start != new_start:
#         old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
#         new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
#         changes.append(f"<b>Planned Start Date</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
#     if old_end != new_end:
#         old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
#         new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
#         changes.append(f"<b>Planned End Date</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
#     if not changes:
#         return "Work Order dates recalculated based on operation changes"
    
#     comment = "Work Order dates automatically updated:<br><br>"
#     comment += "<br>".join([f"• {change}" for change in changes])
    
#     return comment




# import frappe
# from frappe.utils import get_datetime, now_datetime

# @frappe.whitelist()
# def get_workorders():
#     """Fetch only submitted work orders and their operations."""
#     try:
#         # ✅ Get all workstations
#         all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]
        
#         # ✅ Fetch only submitted work orders (docstatus = 1)
#         work_orders = frappe.db.sql("""
#             SELECT
#                 wo.name AS work_order,
#                 wo.production_item,
#                 wo.qty,
#                 wo.status,
#                 wo.planned_start_date,
#                 wo.planned_end_date,
#                 wop.name AS operation_id,
#                 wop.operation,
#                 wop.workstation,
#                 wop.planned_start_time,
#                 wop.planned_end_time,
#                 wop.time_in_mins
#             FROM `tabWork Order` wo
#             LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
#             WHERE wo.docstatus = 1
#             ORDER BY wo.creation DESC
#         """, as_dict=True)
        
#         return {"all_workstations": all_workstations, "work_orders": work_orders}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
#         return {"error": str(e)}


# @frappe.whitelist()
# def update_workorder(operation_id, workstation, start_date, end_date):
#     """Update only the dragged operation using direct SQL for submitted documents."""
#     try:
#         if not frappe.db.exists("Work Order Operation", operation_id):
#             return {"status": "error", "message": "Operation not found"}
        
#         # ✅ Convert datetime strings to proper format
#         try:
#             start_datetime = get_datetime(start_date)
#             end_datetime = get_datetime(end_date)
#         except Exception as e:
#             return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}
        
#         # ✅ Get the current operation details before updating
#         old_operation = frappe.db.get_value(
#             "Work Order Operation", 
#             operation_id, 
#             ["parent", "operation", "workstation", "planned_start_time", "planned_end_time"],
#             as_dict=True
#         )
        
#         if not old_operation:
#             return {"status": "error", "message": "Operation not found"}
        
#         parent_wo = old_operation.parent
        
#         # ✅ Check if work order is submitted
#         docstatus = frappe.db.get_value("Work Order", parent_wo, "docstatus")
        
#         if docstatus == 1:
#             # ✅ For submitted documents, use direct SQL update to bypass validation
#             frappe.db.sql("""
#                 UPDATE `tabWork Order Operation`
#                 SET workstation = %s,
#                     planned_start_time = %s,
#                     planned_end_time = %s,
#                     modified = NOW(),
#                     modified_by = %s
#                 WHERE name = %s
#             """, (workstation, start_datetime, end_datetime, frappe.session.user, operation_id))
            
#             # ✅ Add comment to Work Order Activity
#             comment_text = _build_activity_comment(
#                 old_operation.operation,
#                 old_operation.workstation,
#                 workstation,
#                 old_operation.planned_start_time,
#                 start_datetime,
#                 old_operation.planned_end_time,
#                 end_datetime
#             )
            
#             # Add comment to Work Order
#             frappe.get_doc({
#                 "doctype": "Comment",
#                 "comment_type": "Info",
#                 "reference_doctype": "Work Order",
#                 "reference_name": parent_wo,
#                 "content": comment_text,
#                 "comment_email": frappe.session.user,
#                 "comment_by": frappe.session.user_fullname or frappe.session.user
#             }).insert(ignore_permissions=True)
            
#             # ✅ Update parent work order dates based on all operations
#             operations = frappe.db.sql("""
#                 SELECT planned_start_time, planned_end_time
#                 FROM `tabWork Order Operation`
#                 WHERE parent = %s
#                 AND planned_start_time IS NOT NULL
#                 AND planned_end_time IS NOT NULL
#             """, parent_wo, as_dict=True)
            
#             if operations:
#                 min_start = min([op.planned_start_time for op in operations])
#                 max_end = max([op.planned_end_time for op in operations])
                
#                 # Check if parent dates changed
#                 parent_doc = frappe.get_doc("Work Order", parent_wo)
#                 old_start = parent_doc.planned_start_date
#                 old_end = parent_doc.planned_end_date
                
#                 frappe.db.sql("""
#                     UPDATE `tabWork Order`
#                     SET planned_start_date = %s,
#                         planned_end_date = %s,
#                         modified = NOW(),
#                         modified_by = %s
#                     WHERE name = %s
#                 """, (min_start, max_end, frappe.session.user, parent_wo))
                
#                 # Add comment for parent date changes
#                 if old_start != min_start or old_end != max_end:
#                     parent_comment = _build_parent_date_comment(old_start, min_start, old_end, max_end)
#                     frappe.get_doc({
#                         "doctype": "Comment",
#                         "comment_type": "Info",
#                         "reference_doctype": "Work Order",
#                         "reference_name": parent_wo,
#                         "content": parent_comment,
#                         "comment_email": frappe.session.user,
#                         "comment_by": frappe.session.user_fullname or frappe.session.user
#                     }).insert(ignore_permissions=True)
            
#             frappe.db.commit()
#             return {"status": "success", "message": "Operation updated successfully"}
        
#         else:
#             # ✅ For draft documents, use normal save
#             op = frappe.get_doc("Work Order Operation", operation_id)
            
#             # Store old values for comment
#             old_ws = op.workstation
#             old_start = op.planned_start_time
#             old_end = op.planned_end_time
            
#             op.workstation = workstation
#             op.planned_start_time = start_datetime
#             op.planned_end_time = end_datetime
#             op.save(ignore_permissions=True)
            
#             # Add comment
#             comment_text = _build_activity_comment(
#                 op.operation, old_ws, workstation, old_start, start_datetime, old_end, end_datetime
#             )
            
#             frappe.get_doc({
#                 "doctype": "Comment",
#                 "comment_type": "Info",
#                 "reference_doctype": "Work Order",
#                 "reference_name": op.parent,
#                 "content": comment_text,
#                 "comment_email": frappe.session.user,
#                 "comment_by": frappe.session.user_fullname or frappe.session.user
#             }).insert(ignore_permissions=True)
            
#             # Update parent work order
#             parent = frappe.get_doc("Work Order", op.parent)
#             old_parent_start = parent.planned_start_date
#             old_parent_end = parent.planned_end_date
            
#             parent.planned_start_date = min(
#                 [d.planned_start_time for d in parent.operations if d.planned_start_time]
#             )
#             parent.planned_end_date = max(
#                 [d.planned_end_time for d in parent.operations if d.planned_end_time]
#             )
#             parent.save(ignore_permissions=True)
            
#             # Add parent date comment if changed
#             if old_parent_start != parent.planned_start_date or old_parent_end != parent.planned_end_date:
#                 parent_comment = _build_parent_date_comment(
#                     old_parent_start, parent.planned_start_date, 
#                     old_parent_end, parent.planned_end_date
#                 )
#                 frappe.get_doc({
#                     "doctype": "Comment",
#                     "comment_type": "Info",
#                     "reference_doctype": "Work Order",
#                     "reference_name": parent.name,
#                     "content": parent_comment,
#                     "comment_email": frappe.session.user,
#                     "comment_by": frappe.session.user_fullname or frappe.session.user
#                 }).insert(ignore_permissions=True)
            
#             frappe.db.commit()
            
#             return {"status": "success", "message": "Operation updated successfully"}
    
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
#         frappe.db.rollback()
#         return {"status": "error", "message": str(e)}


# def _build_activity_comment(operation_name, old_ws, new_ws, old_start, new_start, old_end, new_end):
#     """Build detailed activity comment for operation changes."""
#     changes = []
    
#     if old_ws != new_ws:
#         changes.append(f"<b>Workstation</b> changed from <b>{old_ws or 'Not Set'}</b> to <b>{new_ws}</b>")
    
#     if old_start != new_start:
#         old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
#         new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
#         changes.append(f"<b>Planned Start Time</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
#     if old_end != new_end:
#         old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
#         new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
#         changes.append(f"<b>Planned End Time</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
#     if not changes:
#         return f"Operation <b>{operation_name}</b> updated via Gantt View"
    
#     comment = f"Operation <b>{operation_name}</b> updated via Gantt View:<br><br>"
#     comment += "<br>".join([f"• {change}" for change in changes])
    
#     return comment


# def _build_parent_date_comment(old_start, new_start, old_end, new_end):
#     """Build activity comment for parent Work Order date changes."""
#     changes = []
    
#     if old_start != new_start:
#         old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
#         new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
#         changes.append(f"<b>Planned Start Date</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
#     if old_end != new_end:
#         old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
#         new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
#         changes.append(f"<b>Planned End Date</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
#     if not changes:
#         return "Work Order dates recalculated based on operation changes"
    
#     comment = "Work Order dates automatically updated:<br><br>"
#     comment += "<br>".join([f"• {change}" for change in changes])
    
#     return comment



import frappe
from frappe.utils import get_datetime, now_datetime

@frappe.whitelist()
def get_workorders():
    """Fetch only submitted work orders and their operations."""
    try:
        # ✅ Get all workstations
        all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]
        
        # ✅ Fetch only submitted work orders (docstatus = 1) with BOTH operation and work order status
        work_orders = frappe.db.sql("""
            SELECT
                wo.name AS work_order,
                wo.production_item,
                wo.qty,
                wo.status AS work_order_status,
                wo.planned_start_date,
                wo.planned_end_date,
                wop.name AS operation_id,
                wop.operation,
                wop.workstation,
                wop.planned_start_time,
                wop.planned_end_time,
                wop.time_in_mins,
                wop.status AS operation_status
            FROM `tabWork Order` wo
            LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
            WHERE wo.docstatus = 1
            ORDER BY wo.creation DESC
        """, as_dict=True)
        
        # ✅ Add final status (operation status has priority over work order status)
        for wo in work_orders:
            wo['final_status'] = wo.get('operation_status') or wo.get('work_order_status') or 'Not Started'
        
        return {"all_workstations": all_workstations, "work_orders": work_orders}
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
        return {"error": str(e)}


@frappe.whitelist()
def update_workorder(operation_id, workstation, start_date, end_date):
    """Update only the dragged operation using direct SQL for submitted documents."""
    try:
        if not frappe.db.exists("Work Order Operation", operation_id):
            return {"status": "error", "message": "Operation not found"}
        
        # ✅ Convert datetime strings to proper format
        try:
            start_datetime = get_datetime(start_date)
            end_datetime = get_datetime(end_date)
        except Exception as e:
            return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}
        
        # ✅ Get the current operation details before updating
        old_operation = frappe.db.get_value(
            "Work Order Operation", 
            operation_id, 
            ["parent", "operation", "workstation", "planned_start_time", "planned_end_time"],
            as_dict=True
        )
        
        if not old_operation:
            return {"status": "error", "message": "Operation not found"}
        
        parent_wo = old_operation.parent
        
        # ✅ Check if work order is submitted
        docstatus = frappe.db.get_value("Work Order", parent_wo, "docstatus")
        
        if docstatus == 1:
            # ✅ For submitted documents, use direct SQL update to bypass validation
            frappe.db.sql("""
                UPDATE `tabWork Order Operation`
                SET workstation = %s,
                    planned_start_time = %s,
                    planned_end_time = %s,
                    modified = NOW(),
                    modified_by = %s
                WHERE name = %s
            """, (workstation, start_datetime, end_datetime, frappe.session.user, operation_id))
            
            # ✅ Add comment to Work Order Activity
            comment_text = _build_activity_comment(
                old_operation.operation,
                old_operation.workstation,
                workstation,
                old_operation.planned_start_time,
                start_datetime,
                old_operation.planned_end_time,
                end_datetime
            )
            
            # Add comment to Work Order
            frappe.get_doc({
                "doctype": "Comment",
                "comment_type": "Info",
                "reference_doctype": "Work Order",
                "reference_name": parent_wo,
                "content": comment_text,
                "comment_email": frappe.session.user,
                "comment_by": frappe.session.user_fullname or frappe.session.user
            }).insert(ignore_permissions=True)
            
            # ✅ Update parent work order dates based on all operations
            operations = frappe.db.sql("""
                SELECT planned_start_time, planned_end_time
                FROM `tabWork Order Operation`
                WHERE parent = %s
                AND planned_start_time IS NOT NULL
                AND planned_end_time IS NOT NULL
            """, parent_wo, as_dict=True)
            
            if operations:
                min_start = min([op.planned_start_time for op in operations])
                max_end = max([op.planned_end_time for op in operations])
                
                # Check if parent dates changed
                parent_doc = frappe.get_doc("Work Order", parent_wo)
                old_start = parent_doc.planned_start_date
                old_end = parent_doc.planned_end_date
                
                frappe.db.sql("""
                    UPDATE `tabWork Order`
                    SET planned_start_date = %s,
                        planned_end_date = %s,
                        modified = NOW(),
                        modified_by = %s
                    WHERE name = %s
                """, (min_start, max_end, frappe.session.user, parent_wo))
                
                # Add comment for parent date changes
                if old_start != min_start or old_end != max_end:
                    parent_comment = _build_parent_date_comment(old_start, min_start, old_end, max_end)
                    frappe.get_doc({
                        "doctype": "Comment",
                        "comment_type": "Info",
                        "reference_doctype": "Work Order",
                        "reference_name": parent_wo,
                        "content": parent_comment,
                        "comment_email": frappe.session.user,
                        "comment_by": frappe.session.user_fullname or frappe.session.user
                    }).insert(ignore_permissions=True)
            
            frappe.db.commit()
            return {"status": "success", "message": "Operation updated successfully"}
        
        else:
            # ✅ For draft documents, use normal save
            op = frappe.get_doc("Work Order Operation", operation_id)
            
            # Store old values for comment
            old_ws = op.workstation
            old_start = op.planned_start_time
            old_end = op.planned_end_time
            
            op.workstation = workstation
            op.planned_start_time = start_datetime
            op.planned_end_time = end_datetime
            op.save(ignore_permissions=True)
            
            # Add comment
            comment_text = _build_activity_comment(
                op.operation, old_ws, workstation, old_start, start_datetime, old_end, end_datetime
            )
            
            frappe.get_doc({
                "doctype": "Comment",
                "comment_type": "Info",
                "reference_doctype": "Work Order",
                "reference_name": op.parent,
                "content": comment_text,
                "comment_email": frappe.session.user,
                "comment_by": frappe.session.user_fullname or frappe.session.user
            }).insert(ignore_permissions=True)
            
            # Update parent work order
            parent = frappe.get_doc("Work Order", op.parent)
            old_parent_start = parent.planned_start_date
            old_parent_end = parent.planned_end_date
            
            parent.planned_start_date = min(
                [d.planned_start_time for d in parent.operations if d.planned_start_time]
            )
            parent.planned_end_date = max(
                [d.planned_end_time for d in parent.operations if d.planned_end_time]
            )
            parent.save(ignore_permissions=True)
            
            # Add parent date comment if changed
            if old_parent_start != parent.planned_start_date or old_parent_end != parent.planned_end_date:
                parent_comment = _build_parent_date_comment(
                    old_parent_start, parent.planned_start_date, 
                    old_parent_end, parent.planned_end_date
                )
                frappe.get_doc({
                    "doctype": "Comment",
                    "comment_type": "Info",
                    "reference_doctype": "Work Order",
                    "reference_name": parent.name,
                    "content": parent_comment,
                    "comment_email": frappe.session.user,
                    "comment_by": frappe.session.user_fullname or frappe.session.user
                }).insert(ignore_permissions=True)
            
            frappe.db.commit()
            
            return {"status": "success", "message": "Operation updated successfully"}
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
        frappe.db.rollback()
        return {"status": "error", "message": str(e)}


def _build_activity_comment(operation_name, old_ws, new_ws, old_start, new_start, old_end, new_end):
    """Build detailed activity comment for operation changes."""
    changes = []
    
    if old_ws != new_ws:
        changes.append(f"<b>Workstation</b> changed from <b>{old_ws or 'Not Set'}</b> to <b>{new_ws}</b>")
    
    if old_start != new_start:
        old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
        new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
        changes.append(f"<b>Planned Start Time</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
    if old_end != new_end:
        old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
        new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
        changes.append(f"<b>Planned End Time</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
    if not changes:
        return f"Operation <b>{operation_name}</b> updated via Gantt View"
    
    comment = f"Operation <b>{operation_name}</b> updated via Gantt View:<br><br>"
    comment += "<br>".join([f"• {change}" for change in changes])
    
    return comment


def _build_parent_date_comment(old_start, new_start, old_end, new_end):
    """Build activity comment for parent Work Order date changes."""
    changes = []
    
    if old_start != new_start:
        old_start_str = frappe.utils.format_datetime(old_start, "dd-MM-yyyy HH:mm") if old_start else "Not Set"
        new_start_str = frappe.utils.format_datetime(new_start, "dd-MM-yyyy HH:mm") if new_start else "Not Set"
        changes.append(f"<b>Planned Start Date</b> changed from <b>{old_start_str}</b> to <b>{new_start_str}</b>")
    
    if old_end != new_end:
        old_end_str = frappe.utils.format_datetime(old_end, "dd-MM-yyyy HH:mm") if old_end else "Not Set"
        new_end_str = frappe.utils.format_datetime(new_end, "dd-MM-yyyy HH:mm") if new_end else "Not Set"
        changes.append(f"<b>Planned End Date</b> changed from <b>{old_end_str}</b> to <b>{new_end_str}</b>")
    
    if not changes:
        return "Work Order dates recalculated based on operation changes"
    
    comment = "Work Order dates automatically updated:<br><br>"
    comment += "<br>".join([f"• {change}" for change in changes])
    
    return comment