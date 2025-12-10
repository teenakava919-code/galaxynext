import frappe
from frappe.utils import get_datetime, now_datetime

@frappe.whitelist()
def get_workorders(company=None):
    """
    Fetch work orders and related data for the Gantt view.
    This function is called from JavaScript when the page loads.
    
    Returns:
        dict: Contains companies, workstations, work orders, and default company
    """
    try:
        # ===== STEP 1: Fetch all companies for the dropdown filter =====
        # Retrieves all company names from the Company doctype
        companies = [d.name for d in frappe.get_all("Company", fields=["name"])]
        
        # ===== STEP 2: Fetch all workstations for Gantt chart rows =====
        # These workstations will appear as rows on the left side of the Gantt view
        all_workstations = [d.name for d in frappe.get_all("Workstation", fields=["name"])]

        # ===== STEP 3: Fetch all work orders and their operations =====
        # This SQL query joins two tables:
        # 1. `tabWork Order` - Main work order table
        # 2. `tabWork Order Operation` - Child table containing operations for each work order
        work_orders = frappe.db.sql("""
            SELECT
                wo.name AS work_order,              -- Work Order ID (e.g., WO-2024-00001)
                wo.company,                          -- Company name
                wo.production_item,                  -- Item to be produced
                wo.qty,                              -- Quantity to produce
                wo.status,                           -- Work Order status (Not Started, In Process, etc.)
                wo.docstatus,                        -- Document status: 0=Draft, 1=Submitted, 2=Cancelled
                wo.planned_start_date,               -- Overall start date for the work order
                wo.planned_end_date,                 -- Overall end date for the work order
                wop.name AS operation_id,            -- Unique ID for the operation (used for drag-drop updates)
                wop.operation,                       -- Operation name (e.g., Dyeing, Cutting, Finishing)
                wop.workstation,                     -- Assigned workstation
                wop.planned_start_time,              -- Start time for this operation
                wop.planned_end_time,                -- End time for this operation
                wop.time_in_mins,                    -- Duration in minutes
                wop.status AS operation_status       -- Operation-level status
            FROM `tabWork Order` wo
            LEFT JOIN `tabWork Order Operation` wop ON wop.parent = wo.name
            WHERE wo.docstatus IN (0, 1)             -- Only fetch Draft and Submitted work orders
            AND wo.status NOT IN ('Completed', 'Closed')  -- Exclude completed/closed work orders
            ORDER BY wo.creation DESC                -- Most recent work orders first
        """, as_dict=True)

        # ===== STEP 4: Create work order names list for autocomplete =====
        # Extract unique work order names and sort them alphabetically
        # This list powers the search/autocomplete functionality
        work_order_names = list(set([wo['work_order'] for wo in work_orders if wo['work_order']]))
        work_order_names.sort()

        # ===== STEP 5: Determine user's default company =====
        # Query the User Permission table to find the default company for the current user
        default_company_q = frappe.db.sql("""
            SELECT DISTINCT for_value
            FROM `tabUser Permission`
            WHERE is_default = 1
            AND user = %s
        """, (frappe.session.user,), as_dict=True)

        # Use the default company if found, otherwise fall back to first available company
        default_company = (
            default_company_q[0].for_value
            if default_company_q else (companies[0] if companies else None)
        )

        # ===== STEP 6: Log debug information =====
        # These logs help troubleshoot data loading issues
        frappe.log_error(f"Default Company: {default_company}", "Gantt Debug")
        frappe.log_error(f"Total Work Orders Fetched: {len(work_orders)}", "Gantt Debug")

        # Calculate work order count per company for debugging
        company_counts = {}
        for wo in work_orders:
            comp = wo.get('company', 'Unknown')
            company_counts[comp] = company_counts.get(comp, 0) + 1
        
        frappe.log_error(f"Companies Breakdown: {company_counts}", "Gantt Debug")

        # ===== STEP 7: Return all data to JavaScript =====
        return {
            "company": default_company,              # Default company for initial filter
            "companies": companies,                  # All companies for dropdown
            "all_workstations": all_workstations,   # All workstations for Gantt rows
            "work_orders": work_orders,             # Complete work order data with operations
            "work_order_names": work_order_names    # Work order names for autocomplete
        }

    except Exception as e:
        # Log any errors and return error message to frontend
        frappe.log_error(frappe.get_traceback(), "Workstation Gantt - get_workorders")
        return {"error": str(e)}


@frappe.whitelist()
def update_workorder(operation_id, workstation, start_date, end_date):
    """
    Update work order operation when dragged/dropped or resized in Gantt view.
    
    Args:
        operation_id (str): Unique ID of the operation to update
        workstation (str): New workstation name (changed via drag to different row)
        start_date (str): New start datetime (changed via drag or left-resize)
        end_date (str): New end datetime (changed via drag or right-resize)
    
    Returns:
        dict: Status and message indicating success or failure
    """
    try:
        # ===== STEP 1: Validate operation exists =====
        if not frappe.db.exists("Work Order Operation", operation_id):
            return {"status": "error", "message": "Operation not found"}

        # ===== STEP 2: Convert date strings to Python datetime objects =====
        try:
            # Convert strings like "2024-11-27 08:00:00" to datetime objects
            start_datetime = get_datetime(start_date)
            end_datetime = get_datetime(end_date)
        except Exception as e:
            return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}

        # ===== STEP 3: Fetch old operation values for comparison =====
        # We need old values to create a meaningful activity log
        old_operation = frappe.db.get_value(
            "Work Order Operation",
            operation_id,
            ["parent", "operation", "workstation", "planned_start_time", "planned_end_time"],
            as_dict=True
        )

        if not old_operation:
            return {"status": "error", "message": "Operation not found"}

        # Get parent Work Order name and its submission status
        parent_wo = old_operation.parent
        docstatus = frappe.db.get_value("Work Order", parent_wo, "docstatus")

        # ===== CASE 1: SUBMITTED WORK ORDERS (docstatus = 1) =====
        # Submitted documents require direct SQL updates to bypass validation
        if docstatus == 1:
            # ===== STEP 4A: Update operation using direct SQL =====
            # We use raw SQL because submitted documents can't be modified via ORM
            frappe.db.sql("""
                UPDATE `tabWork Order Operation`
                SET workstation = %s,              -- New workstation assignment
                    planned_start_time = %s,       -- New start time
                    planned_end_time = %s,         -- New end time
                    modified = NOW(),              -- Update modification timestamp
                    modified_by = %s               -- Record who made the change
                WHERE name = %s                    -- Target operation ID
            """, (workstation, start_datetime, end_datetime, frappe.session.user, operation_id))

            # ===== STEP 5A: Create activity log comment =====
            # Build a human-readable comment describing what changed
            comment_text = _build_activity_comment(
                old_operation.operation,
                old_operation.workstation,
                workstation,
                old_operation.planned_start_time,
                start_datetime,
                old_operation.planned_end_time,
                end_datetime
            )

            # Insert the comment into the Work Order timeline
            frappe.get_doc({
                "doctype": "Comment",
                "comment_type": "Info",
                "reference_doctype": "Work Order",
                "reference_name": parent_wo,
                "content": comment_text,
                "comment_email": frappe.session.user,
                "comment_by": frappe.session.user_fullname or frappe.session.user
            }).insert(ignore_permissions=True)

            # ===== STEP 6A: Recalculate parent Work Order dates =====
            # The parent WO dates should reflect the earliest start and latest end of all operations
            operations = frappe.db.sql("""
                SELECT planned_start_time, planned_end_time
                FROM `tabWork Order Operation`
                WHERE parent = %s
                AND planned_start_time IS NOT NULL
                AND planned_end_time IS NOT NULL
            """, parent_wo, as_dict=True)

            if operations:
                # Find earliest start and latest end across all operations
                min_start = min(op.planned_start_time for op in operations)
                max_end = max(op.planned_end_time for op in operations)

                # Get current parent dates for comparison
                parent_doc = frappe.get_doc("Work Order", parent_wo)
                old_start = parent_doc.planned_start_date
                old_end = parent_doc.planned_end_date

                # Only update parent if dates actually changed
                if old_start != min_start or old_end != max_end:
                    frappe.db.sql("""
                        UPDATE `tabWork Order`
                        SET planned_start_date = %s,
                            planned_end_date = %s,
                            modified = NOW(),
                            modified_by = %s
                        WHERE name = %s
                    """, (min_start, max_end, frappe.session.user, parent_wo))

                    # Add comment about parent date changes
                    parent_comment = _build_parent_date_comment(
                        old_start, min_start, old_end, max_end
                    )
                    frappe.get_doc({
                        "doctype": "Comment",
                        "comment_type": "Info",
                        "reference_doctype": "Work Order",
                        "reference_name": parent_wo,
                        "content": parent_comment,
                        "comment_email": frappe.session.user,
                        "comment_by": frappe.session.user_fullname or frappe.session.user
                    }).insert(ignore_permissions=True)

            # Commit all changes to database
            frappe.db.commit()
            return {"status": "success", "message": "Operation updated successfully"}

        # ===== CASE 2: DRAFT WORK ORDERS (docstatus = 0) =====
        # Draft documents can be modified using normal Frappe ORM
        else:
            # ===== STEP 4B: Update operation using ORM =====
            op = frappe.get_doc("Work Order Operation", operation_id)
            old_ws = op.workstation
            old_start = op.planned_start_time
            old_end = op.planned_end_time

            # Update the operation fields
            op.workstation = workstation
            op.planned_start_time = start_datetime
            op.planned_end_time = end_datetime
            op.save(ignore_permissions=True)

            # ===== STEP 5B: Create activity log comment =====
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

            # ===== STEP 6B: Update parent Work Order dates =====
            parent = frappe.get_doc("Work Order", op.parent)
            old_parent_start = parent.planned_start_date
            old_parent_end = parent.planned_end_date

            # Recalculate parent dates based on all operations
            parent.planned_start_date = min(
                [d.planned_start_time for d in parent.operations if d.planned_start_time]
            )
            parent.planned_end_date = max(
                [d.planned_end_time for d in parent.operations if d.planned_end_time]
            )

            # Only save parent if dates changed
            if old_parent_start != parent.planned_start_date or old_parent_end != parent.planned_end_date:
                parent.save(ignore_permissions=True)

                # Add comment about parent date changes
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

            # Commit all changes to database
            frappe.db.commit()

            return {"status": "success", "message": "Operation updated successfully"}

    except Exception as e:
        # Log error and rollback any partial changes
        frappe.log_error(frappe.get_traceback(), "Workstation Gantt - update_workorder")
        frappe.db.rollback()
        return {"status": "error", "message": str(e)}


def _build_activity_comment(operation_name, old_ws, new_ws, old_start, new_start, old_end, new_end):
    """
    Build a human-readable comment describing operation changes.
    
    Args:
        operation_name (str): Name of the operation
        old_ws (str): Previous workstation
        new_ws (str): New workstation
        old_start (datetime): Previous start time
        new_start (datetime): New start time
        old_end (datetime): Previous end time
        new_end (datetime): New end time
    
    Returns:
        str: Formatted comment text
    """
    from frappe.utils import format_datetime
    
    changes = []

    # Check if workstation changed
    if old_ws != new_ws:
        changes.append(f"Workstation changed from {old_ws or 'Not Set'} to {new_ws}")

    # Check if start time changed
    if old_start and new_start and old_start != new_start:
        old_start_str = format_datetime(old_start, "dd-MM-yyyy HH:mm")
        new_start_str = format_datetime(new_start, "dd-MM-yyyy HH:mm")
        changes.append(f"Planned Start Time changed from {old_start_str} to {new_start_str}")

    # Check if end time changed
    if old_end and new_end and old_end != new_end:
        old_end_str = format_datetime(old_end, "dd-MM-yyyy HH:mm")
        new_end_str = format_datetime(new_end, "dd-MM-yyyy HH:mm")
        changes.append(f"Planned End Time changed from {old_end_str} to {new_end_str}")

    # If no changes detected, return generic message
    if not changes:
        return f"Operation {operation_name} updated via Gantt View"

    # Combine all changes into a single comment
    comment = f"Administrator Operation {operation_name} updated via Gantt View: "
    comment += " • ".join(changes)
    return comment


def _build_parent_date_comment(old_start, new_start, old_end, new_end):
    """
    Build a comment describing parent Work Order date changes.
    
    Args:
        old_start (datetime): Previous start date
        new_start (datetime): New start date
        old_end (datetime): Previous end date
        new_end (datetime): New end date
    
    Returns:
        str: Formatted comment text
    """
    from frappe.utils import format_datetime
    
    changes = []

    # Check if start date changed
    if old_start and new_start and old_start != new_start:
        old_start_str = format_datetime(old_start, "dd-MM-yyyy HH:mm")
        new_start_str = format_datetime(new_start, "dd-MM-yyyy HH:mm")
        changes.append(f"Planned Start Date changed from {old_start_str} to {new_start_str}")

    # Check if end date changed
    if old_end and new_end and old_end != new_end:
        old_end_str = format_datetime(old_end, "dd-MM-yyyy HH:mm")
        new_end_str = format_datetime(new_end, "dd-MM-yyyy HH:mm")
        changes.append(f"Planned End Date changed from {old_end_str} to {new_end_str}")

    # If no changes detected, return generic message
    if not changes:
        return "Administrator Work Order dates automatically updated"

    # Combine all changes into a single comment
    comment = "Administrator Work Order dates automatically updated: "
    comment += " • ".join(changes)
    return comment