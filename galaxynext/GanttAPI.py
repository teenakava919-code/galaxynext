import frappe
from dateutil.parser import parse
from datetime import datetime, timedelta

@frappe.whitelist(allow_guest=True)
def get_workstation_gantt(from_date=None, to_date=None, company=None):
    """
    Returns workstation-wise operations with planned times.
    """
    if not from_date or not to_date:
        # default 14-day window
        today = frappe.utils.getdate()
        from_date = today
        to_date = today + timedelta(days=14)

    # normalize to strings with time
    start_dt = frappe.utils.get_datetime(from_date)
    end_dt = frappe.utils.get_datetime(to_date) + timedelta(hours=23, minutes=59, seconds=59)

    filters = [
        ["Work Order Operation", "planned_start_time", "<=", end_dt],
        ["Work Order Operation", "planned_end_time", ">=", start_dt],
    ]
    if company:
        filters.append(["Work Order Operation", "company", "=", company])

    rows = frappe.get_all(
        "Work Order Operation",
        filters=filters,
        fields=[
            "name",
            "parent as work_order",
            "operation",
            "workstation",
            "planned_start_time",
            "planned_end_time",
            "status",
            "production_item",
            "bom",
        ],
        order_by="workstation asc, planned_start_time asc",
    )

    # group by workstation
    by_ws = {}
    for r in rows:
        ws = r.workstation or "Not Set"
        by_ws.setdefault(ws, [])
        by_ws[ws].append({
            "id": r.name,
            "name": f"{r.operation} ({r.work_order})",
            "operation": r.operation,
            "work_order": r.work_order,
            "start": frappe.utils.format_datetime(r.planned_start_time, "YYYY-MM-DD HH:mm:ss"),
            "end": frappe.utils.format_datetime(r.planned_end_time, "YYYY-MM-DD HH:mm:ss"),
        })

    # small palette by operation (for client coloring)
    ops = list({r.operation for r in rows})
    op_palette = {op: idx for idx, op in enumerate(ops)}

    return {
        "from": frappe.utils.formatdate(start_dt),
        "to": frappe.utils.formatdate(end_dt),
        "workstations": [{"name": k, "tasks": v} for k, v in by_ws.items()],
        "op_palette": op_palette,
    }
