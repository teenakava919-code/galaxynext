# import frappe
# import re

# # ======================================================
# # 🧩 CONFIGURATION SECTION — EASY CUSTOMIZATION
# # ======================================================
# # These indexes decide which column will show section headers
# # and which column will show section totals.
# SUMMARY_HEADER_COL = 0
# SUMMARY_TOTAL_COL = 0
# COMPANY_HEADER_COL = 0
# COMPANY_TOTAL_COL = 0


# # ======================================================
# # 🔹 MAIN EXECUTION FUNCTION (ENTRY POINT OF REPORT)
# # ======================================================
# def execute(filters=None):
#     """
#     Main function called by ERPNext report engine.
#     It loads main data, summary data, company summary,
#     calculates totals, builds section headers, and merges
#     everything into one final dataset.
#     """
#     if not filters:
#         filters = {}

#     # 1️⃣ Fetch main data from stored procedure
#     columns, data_main = get_data_and_columns(filters)
    
#     # If no data found, return empty report
#     if not columns or not data_main:
#         return [], []
    
#     # Build TOTAL row for the main data
#     total_main = build_section_total(data_main, columns, "Total")

#     # 2️⃣ Fetch Customer Group summary (stored procedure)
#     data_summary = get_summary_data(filters, columns)
#     total_summary = build_section_total(data_summary, columns, "Customer Group Total")

#     # 3️⃣ Fetch Company-wise summary (stored procedure)
#     data_company = get_company_summary_data(filters, columns)
#     total_company = build_section_total(data_company, columns, "Company-wise Total")

#     # 4️⃣ Build header rows (separator rows)
#     separator_row_summary = build_summary_header_row(columns)
#     separator_row_company = build_company_header_row(columns)

#     # 5️⃣ Prepare final combined dataset for output
#     final_data = (
#         data_main
#         + [total_main]
#         + [separator_row_summary]
#         + data_summary
#         + [total_summary]
#         + [separator_row_company]
#         + data_company
#         + [total_company]
#     )

#     return columns, final_data


# # ======================================================
# # 🔹 HEADER ROW BUILDERS (SECTION TITLES)
# # ======================================================
# def build_summary_header_row(columns):
#     """
#     Creates the header row for 'Customer Group Summary'.
#     This appears as a visible separator inside the report.
#     """
#     if not columns:
#         return {}
    
#     row = {}
#     row[columns[SUMMARY_HEADER_COL]["fieldname"]] = (
#         "<div style='font-weight:bold;font-size:14px;'>Customer Group Summary</div>"
#     )

#     # Apply bold labels for month-based columns
#     for col in columns:
#         if "/" in col["label"]:
#             row[col["fieldname"]] = (
#                 f"<div style='font-weight:bold;font-size:14px;text-align:center;'>{col['label']}</div>"
#             )

#     # Last column special title
#     row[columns[-1]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Total Amount</div>"
#     return row


# def build_company_header_row(columns):
#     """
#     Creates the header row for 'Company-wise Summary'.
#     This appears before the company summary block.
#     """
#     if not columns:
#         return {}
    
#     row = {}
#     row[columns[COMPANY_HEADER_COL]["fieldname"]] = (
#         "<div style='font-weight:bold;font-size:14px;'>Company-wise Summary</div>"
#     )

#     for col in columns:
#         if "/" in col["label"]:
#             row[col["fieldname"]] = (
#                 f"<div style='font-weight:bold;font-size:14px;text-align:center;'>{col['label']}</div>"
#             )

#     row[columns[-1]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Total Amount</div>"
#     return row


# # ======================================================
# # 🔹 FETCH MAIN DATA (SP: sp_get_sales_invoice_data)
# # ======================================================
# def get_data_and_columns(filters):
#     """
#     Calls the main stored procedure which returns
#     the complete dynamic pivot report.
#     Also builds dynamic columns and formats the HTML output.
#     """
#     from_date = filters.get("from_date")
#     to_date = filters.get("to_date")
#     if not from_date or not to_date:
#         frappe.throw("Please select From Date and To Date")

#     # Optional filters
#     company = filters.get("company")
#     customer = filters.get("customer")

#     # Execute stored procedure
#     results, colnames = call_stored_procedure(
#         "sp_get_sales_invoice_data",
#         from_date,
#         to_date,
#         company,
#         customer
#     )
    
#     if not results:
#         return [], []

#     columns = []
#     # Build dynamic column definitions
#     for idx, col in enumerate(colnames):
#         col_lower = col.lower()
#         is_month_col = "/" in col             # Month columns like "Jan/2024"
#         is_amount_col = "amount" in col_lower # Total or amount columns

#         # Decide fieldtype
#         fieldtype = "HTML" if is_month_col or is_amount_col else "Data"
#         width = 200 if is_month_col else 150

#         columns.append({
#             "label": col,
#             "fieldname": col_lower.replace(" ", "_").replace("/", "_"),
#             "fieldtype": fieldtype,
#             "width": width
#         })

#     # Convert result rows into dict format
#     data = []
#     for row in results:
#         row_dict = {}
#         for idx, col in enumerate(colnames):
#             val = row[idx]
#             fieldname = col.lower().replace(" ", "_").replace("/", "_")

#             # For month QRA columns
#             if "/" in col:
#                 val = format_month_value(val)

#             # For last amount column
#             elif idx == len(colnames) - 1 and val:
#                 val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"

#             row_dict[fieldname] = val
#         data.append(row_dict)

#     return columns, data


# # ======================================================
# # 🔹 LOAD SUMMARY (Customer Group + Company-wise)
# # ======================================================
# def get_summary_data(filters, columns):
#     """
#     Calls stored procedure: sp_get_sales_invoice_summary
#     Returns Customer Group summary rows.
#     """
#     from_date = filters.get("from_date")
#     to_date = filters.get("to_date")
#     company = filters.get("company")
#     customer = filters.get("customer")
    
#     results, colnames = call_stored_procedure(
#         "sp_get_sales_invoice_summary",
#         from_date,
#         to_date,
#         company,
#         customer
#     )
#     return build_summary_rows(results, colnames)


# def get_company_summary_data(filters, columns):
#     """
#     Calls stored procedure: sp_get_sales_invoice_company_summary
#     Returns Company-wise summary rows.
#     """
#     from_date = filters.get("from_date")
#     to_date = filters.get("to_date")
#     company = filters.get("company")
#     customer = filters.get("customer")
    
#     results, colnames = call_stored_procedure(
#         "sp_get_sales_invoice_company_summary",
#         from_date,
#         to_date,
#         company,
#         customer
#     )
#     return build_summary_rows(results, colnames)


# def build_summary_rows(results, colnames):
#     """
#     Converts summary stored procedure results into HTML formatted rows.
#     Applies same formatting used for the main report.
#     """
#     data = []
#     for row in results:
#         row_dict = {}
#         for idx, col in enumerate(colnames):
#             val = row[idx]
#             fieldname = col.lower().replace(" ", "_").replace("/", "_")

#             # Month values -> QRA formatting
#             if "/" in col:
#                 val = format_month_value(val)

#             # Total amount formatting
#             elif idx == len(colnames) - 1 and val:
#                 val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"

#             row_dict[fieldname] = val
#         data.append(row_dict)
#     return data


# # ======================================================
# # 🔹 BUILD SECTION TOTAL ROW
# # ======================================================
# def build_section_total(data, columns, label="Total"):
#     """
#     Calculates column-wise totals for:
#     - Main rows
#     - Customer Group Summary
#     - Company-wise Summary
#     And formats them into a TOTAL ROW.
#     """
#     if not data or not columns:
#         return {}

#     total_row = {}

#     # Decide which column to place section title into
#     if "Customer Group" in label:
#         col_index = SUMMARY_TOTAL_COL
#     elif "Company-wise" in label:
#         col_index = COMPANY_TOTAL_COL
#     else:
#         col_index = 0

#     total_row[columns[col_index]["fieldname"]] = f"<b>{label}</b>"

#     # Loop through each column and sum values
#     for col in columns:
#         fname = col["fieldname"]
#         label_text = col["label"]

#         if fname == columns[col_index]["fieldname"]:
#             continue

#         # Month QRA columns → sum Q, R, A separately
#         if "/" in label_text:
#             q_total, r_total, a_total = 0, 0, 0
#             for row in data:
#                 html_val = str(row.get(fname, ""))
#                 q, r, a = extract_qra(html_val)
#                 q_total += q
#                 r_total += r
#                 a_total += a
#             total_row[fname] = format_month_value(f"{q_total}|{r_total}|{a_total}")

#         # Total amount columns
#         elif any(x in fname for x in ["amount", "total", "value"]):
#             total = 0
#             for row in data:
#                 total += extract_number(row.get(fname))
#             total_row[fname] = (
#                 f"<div style='text-align:right;font-weight:bold;'>₹ {format_number(total)}</div>"
#             )

#         # Non-numeric plain columns
#         else:
#             total_row[fname] = "<div style='text-align:center;'>-</div>"

#     return total_row


# # ======================================================
# # 🔹 PARSING HELPERS (Extract Q/R/A/Numbers)
# # ======================================================
# def extract_qra(html_text):
#     """
#     Extracts Q, R, A values from formatted HTML text.
#     Example: 'Q: 10 | R: 500 | A: 5000'
#     """
#     try:
#         q_match = re.search(r"Q:\s*([0-9,.]+)", html_text)
#         r_match = re.search(r"R:\s*₹?\s*([0-9,.]+)", html_text)
#         a_match = re.search(r"A:\s*₹?\s*([0-9,.]+)", html_text)

#         q = float(q_match.group(1).replace(",", "")) if q_match else 0
#         r = float(r_match.group(1).replace(",", "")) if r_match else 0
#         a = float(a_match.group(1).replace(",", "")) if a_match else 0

#         return q, r, a
#     except:
#         return 0, 0, 0


# def extract_number(value):
#     """
#     Extracts raw number from HTML formatted amount fields.
#     """
#     if not value:
#         return 0
#     try:
#         match = re.search(r"[\d,.]+", str(value))
#         if match:
#             return float(match.group(0).replace(",", ""))
#     except:
#         pass
#     return 0


# # ======================================================
# # 🔹 QRA FORMATTER
# # ======================================================
# def format_month_value(value):
#     """
#     Converts raw QRA values into HTML formatted block:
#     Q: 10.00 | R: ₹ 500.00 | A: ₹ 5000.00
#     """
#     if not value:
#         return "<div style='text-align:center;'>-</div>"

#     value = str(value).replace("₹", "").replace(",", "").strip()
#     parts = re.split(r"[|, ]+", value)
#     parts = [p.strip() for p in parts if p.strip()]

#     qty = format_number(parts[0]) if len(parts) > 0 else "0.00"
#     rate = format_number(parts[1]) if len(parts) > 1 else "0.00"
#     amount = format_number(parts[2]) if len(parts) > 2 else "0.00"

#     return f"""
#     <div style='text-align:center;font-family:monospace;font-size:13px;'>
#         Q: {qty} | R: ₹ {rate} | A: ₹ {amount}
#     </div>
#     """.strip()


# def format_number(num):
#     """
#     Formats a number with comma separators and 2 decimals.
#     Example: 10000 → 10,000.00
#     """
#     try:
#         return f"{float(num):,.2f}"
#     except:
#         return str(num)


# # ======================================================
# # 🔹 CALL STORED PROCEDURE (MAIN DB OPERATION)
# # ======================================================
# def call_stored_procedure(proc_name, from_date, to_date, company=None, customer=None):
#     """
#     Executes stored procedure with required filters.
#     Handles procedure result sets and returns rows + column names.
#     """
#     query = f"CALL {proc_name}(%s, %s, %s, %s)"
#     conn = frappe.db.get_connection()
#     cursor = conn.cursor()

#     # Execute stored procedure
#     cursor.execute(query, (from_date, to_date, company, customer))

#     # Fetch results + column names
#     results = cursor.fetchall()
#     colnames = [d[0] for d in cursor.description] if cursor.description else []

#     # Required for MySQL multi-resultset cleanup
#     while cursor.nextset():
#         pass

#     cursor.close()
#     conn.close()

#     return results, colnames



# @frappe.whitelist()
# def get_print_html(filters):
#     """
#     Generate custom print HTML for Cross Tab Table report
#     """
#     import json
    
#     # Parse filters if they come as JSON string
#     if isinstance(filters, str):
#         filters = json.loads(filters)
    
#     # Get report data using existing execute function
#     columns, data = execute(filters)
    
#     if not columns or not data:
#         frappe.throw("No data found for the selected filters")
    
#     # Extract month columns
#     month_columns = []
#     for col in columns:
#         if "/" in col.get("label", ""):
#             month_columns.append(col)
    
#     # Generate HTML
#     html = f"""
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <meta charset="utf-8">
#         <title>Cross Tab Table Report</title>
#         <style>
#             @media print {{
#                 @page {{
#                     size: portrait;
#                     margin: 15mm;
#                 }}
#                 body {{
#                     -webkit-print-color-adjust: exact;
#                     print-color-adjust: exact;
#                 }}
#             }}
            
#             body {{
#                 font-family: Arial, sans-serif;
#                 font-size: 10pt;
#                 margin: 20px;
#             }}
            
#             .print-header {{
#                 text-align: center;
#                 margin-bottom: 20px;
#                 border-bottom: 2px solid #333;
#                 padding-bottom: 10px;
#             }}
            
#             .print-header h2 {{
#                 margin: 0 0 10px 0;
#                 font-size: 18pt;
#                 font-weight: bold;
#             }}
            
#             .print-info {{
#                 margin: 10px 0;
#                 font-size: 10pt;
#             }}
            
#             .print-table {{
#                 width: 100%;
#                 border-collapse: collapse;
#                 margin-top: 15px;
#             }}
            
#             .print-table th {{
#                 background-color: #f0f0f0;
#                 border: 1px solid #333;
#                 padding: 8px 5px;
#                 text-align: center;
#                 font-weight: bold;
#                 font-size: 9pt;
#             }}
            
#             .print-table td {{
#                 border: 1px solid #999;
#                 padding: 6px 5px;
#                 font-size: 9pt;
#                 vertical-align: top;
#             }}
            
#             .month-columns {{
#                 display: table;
#                 width: 100%;
#             }}
            
#             .month-row {{
#                 display: table-row;
#             }}
            
#             .month-col {{
#                 display: table-cell;
#                 width: 50%;
#                 padding: 2px 10px;
#                 vertical-align: top;
#             }}
            
#             .month-col div {{
#                 line-height: 1.6;
#             }}
            
#             .total-cell {{
#                 text-align: right;
#                 font-weight: bold;
#             }}
            
#             .no-print {{
#                 display: none;
#             }}
            
#             @media print {{
#                 .no-print {{
#                     display: none !important;
#                 }}
#             }}
#         </style>
#     </head>
#     <body>
#         <button onclick="window.print()" class="no-print" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">
#             🖨️ Print
#         </button>
        
#         <div class="print-format">
#             <div class="print-header">
#                 <h2>Cross Tab Table Report</h2>
#                 <div class="print-info">
#                     <strong>From Date:</strong> {filters.get('from_date', 'N/A')} 
#                     <strong style="margin-left: 20px;">To Date:</strong> {filters.get('to_date', 'N/A')}
#     """
    
#     if filters.get('company'):
#         html += f"<br><strong>Company:</strong> {filters.get('company')}"
    
#     html += """
#                 </div>
#             </div>
            
#             <table class="print-table">
#                 <thead>
#                     <tr>
#                         <th style="width: 4%;">#</th>
#                         <th style="width: 12%;">Company</th>
#                         <th style="width: 10%;">Customer</th>
#                         <th style="width: 12%;">Customer Name</th>
#                         <th style="width: 10%;">Group</th>
#                         <th style="width: 42%;">Monthly Data</th>
#                         <th style="width: 10%;">Total</th>
#                     </tr>
#                 </thead>
#                 <tbody>
#     """
    
#     # Generate table rows
#     for idx, row in enumerate(data, 1):
#         # Skip summary rows (they have HTML formatting)
#         if any(x in str(row.get(columns[0].get('fieldname'), '')) for x in ['<div', 'Total', 'Summary']):
#             continue
        
#         html += f"""
#                     <tr>
#                         <td style="text-align: center;">{idx}</td>
#                         <td>{row.get('company', '')}</td>
#                         <td>{row.get('customer', '')}</td>
#                         <td>{row.get('customer_name', '')}</td>
#                         <td>{row.get('customer_group', '')}</td>
#                         <td style="padding: 5px;">
#                             <div class="month-columns">
#                                 <div class="month-row">
#         """
        
#         # Add month columns (up to 2 side by side)
#         for col in month_columns[:2]:
#             fieldname = col.get('fieldname')
#             month_label = col.get('label')
#             month_data = row.get(fieldname, '')
            
#             # Parse Q|R|A format
#             qty, rate, amount = "0.00", "0.00", "0.00"
#             if month_data and '|' in str(month_data):
#                 parts = str(month_data).replace('₹', '').replace(',', '').strip().split('|')
#                 if len(parts) >= 3:
#                     qty = parts[0].strip()
#                     rate = parts[1].strip()
#                     amount = parts[2].strip()
            
#             html += f"""
#                                     <div class="month-col">
#                                         <div style="font-weight: bold; margin-bottom: 3px;">{month_label}:</div>
#                                         <div>Q: {qty}</div>
#                                         <div>R: ₹ {rate}</div>
#                                         <div>A: ₹ {amount}</div>
#                                     </div>
#             """
        
#         # Get total amount
#         total_field = columns[-1].get('fieldname')
#         total_value = str(row.get(total_field, '0.00')).replace('<div', '').replace('</div>', '').replace('₹', '').strip()
#         # Extract number from HTML if present
#         import re
#         match = re.search(r'[\d,]+\.?\d*', total_value)
#         if match:
#             total_value = match.group(0)
        
#         html += f"""
#                                 </div>
#                             </div>
#                         </td>
#                         <td class="total-cell">₹ {total_value}</td>
#                     </tr>
#         """
    
#     html += """
#                 </tbody>
#             </table>
#         </div>
#     </body>
#     </html>
#     """
    
#     return html






import frappe
import re

# ======================================================
# 🧩 CONFIGURATION SECTION — EASY CUSTOMIZATION
# ======================================================
SUMMARY_HEADER_COL = 0
SUMMARY_TOTAL_COL = 0
COMPANY_HEADER_COL = 0
COMPANY_TOTAL_COL = 0


# ======================================================
# 🔹 MAIN EXECUTION FUNCTION (ENTRY POINT OF REPORT)
# ======================================================
def execute(filters=None):
    """
    Main function called by ERPNext report engine.
    """
    if not filters:
        filters = {}

    # 1️⃣ Fetch main data from stored procedure
    columns, data_main = get_data_and_columns(filters)
    
    if not columns or not data_main:
        return [], []
    
    # Build TOTAL row for the main data
    total_main = build_section_total(data_main, columns, "Total")

    # 2️⃣ Fetch Customer Group summary
    data_summary = get_summary_data(filters, columns)
    total_summary = build_section_total(data_summary, columns, "Customer Group Total")

    # 3️⃣ Fetch Company-wise summary
    data_company = get_company_summary_data(filters, columns)
    total_company = build_section_total(data_company, columns, "Company-wise Total")

    # 4️⃣ Build header rows
    separator_row_summary = build_summary_header_row(columns)
    separator_row_company = build_company_header_row(columns)

    # 5️⃣ Prepare final combined dataset
    final_data = (
        data_main
        + [total_main]
        + [separator_row_summary]
        + data_summary
        + [total_summary]
        + [separator_row_company]
        + data_company
        + [total_company]
    )

    return columns, final_data


# ======================================================
# 🔹 HEADER ROW BUILDERS
# ======================================================
def build_summary_header_row(columns):
    """Creates the header row for 'Customer Group Summary'."""
    if not columns:
        return {}
    
    row = {}
    row[columns[SUMMARY_HEADER_COL]["fieldname"]] = (
        "<div style='font-weight:bold;font-size:14px;'>Customer Group Summary</div>"
    )

    for col in columns:
        if "/" in col["label"]:
            row[col["fieldname"]] = (
                f"<div style='font-weight:bold;font-size:14px;text-align:center;'>{col['label']}</div>"
            )

    # Cost column header
    row[columns[-2]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Cost</div>"
    # Total column header
    row[columns[-1]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Total Amount</div>"
    return row


def build_company_header_row(columns):
    """Creates the header row for 'Company-wise Summary'."""
    if not columns:
        return {}
    
    row = {}
    row[columns[COMPANY_HEADER_COL]["fieldname"]] = (
        "<div style='font-weight:bold;font-size:14px;'>Company-wise Summary</div>"
    )

    for col in columns:
        if "/" in col["label"]:
            row[col["fieldname"]] = (
                f"<div style='font-weight:bold;font-size:14px;text-align:center;'>{col['label']}</div>"
            )

    row[columns[-2]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Cost</div>"
    row[columns[-1]["fieldname"]] = "<div style='font-weight:bold;font-size:14px;'>Total Amount</div>"
    return row


# ======================================================
# 🔹 FETCH MAIN DATA
# ======================================================
def get_data_and_columns(filters):
    """Calls the main stored procedure."""
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    if not from_date or not to_date:
        frappe.throw("Please select From Date and To Date")

    company = filters.get("company")
    customer = filters.get("customer")

    results, colnames = call_stored_procedure(
        "sp_get_sales_invoice_data",
        from_date,
        to_date,
        company,
        customer
    )
    
    if not results:
        return [], []

    columns = []
    for idx, col in enumerate(colnames):
        col_lower = col.lower()
        is_month_col = "/" in col
        is_cost_col = "cost" in col_lower
        is_amount_col = "amount" in col_lower

        fieldtype = "HTML" if (is_month_col or is_cost_col or is_amount_col) else "Data"
        width = 200 if is_month_col else 150

        columns.append({
            "label": col,
            "fieldname": col_lower.replace(" ", "_").replace("/", "_"),
            "fieldtype": fieldtype,
            "width": width
        })

    data = []
    for row in results:
        row_dict = {}
        for idx, col in enumerate(colnames):
            val = row[idx]
            fieldname = col.lower().replace(" ", "_").replace("/", "_")

            # Month columns
            if "/" in col:
                val = format_month_value(val)
            # Cost column (second last)
            elif idx == len(colnames) - 2 and val:
                val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"
            # Total amount column (last)
            elif idx == len(colnames) - 1 and val:
                val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"

            row_dict[fieldname] = val
        data.append(row_dict)

    return columns, data


# ======================================================
# 🔹 LOAD SUMMARY DATA
# ======================================================
def get_summary_data(filters, columns):
    """Calls stored procedure for Customer Group summary."""
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    company = filters.get("company")
    customer = filters.get("customer")
    
    results, colnames = call_stored_procedure(
        "sp_get_sales_invoice_summary",
        from_date,
        to_date,
        company,
        customer
    )
    return build_summary_rows(results, colnames)


def get_company_summary_data(filters, columns):
    """Calls stored procedure for Company-wise summary."""
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    company = filters.get("company")
    customer = filters.get("customer")
    
    results, colnames = call_stored_procedure(
        "sp_get_sales_invoice_company_summary",
        from_date,
        to_date,
        company,
        customer
    )
    return build_summary_rows(results, colnames)


def build_summary_rows(results, colnames):
    """Converts summary results into formatted rows."""
    data = []
    for row in results:
        row_dict = {}
        for idx, col in enumerate(colnames):
            val = row[idx]
            fieldname = col.lower().replace(" ", "_").replace("/", "_")

            # Month columns
            if "/" in col:
                val = format_month_value(val)
            # Cost column (second last)
            elif idx == len(colnames) - 2 and val:
                val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"
            # Total amount (last)
            elif idx == len(colnames) - 1 and val:
                val = f"<div style='text-align:right;'>₹ {format_number(val)}</div>"

            row_dict[fieldname] = val
        data.append(row_dict)
    return data


# ======================================================
# 🔹 BUILD SECTION TOTAL ROW
# ======================================================
def build_section_total(data, columns, label="Total"):
    """Calculates column-wise totals."""
    if not data or not columns:
        return {}

    total_row = {}

    if "Customer Group" in label:
        col_index = SUMMARY_TOTAL_COL
    elif "Company-wise" in label:
        col_index = COMPANY_TOTAL_COL
    else:
        col_index = 0

    total_row[columns[col_index]["fieldname"]] = f"<b>{label}</b>"

    for col in columns:
        fname = col["fieldname"]
        label_text = col["label"]

        if fname == columns[col_index]["fieldname"]:
            continue

        # Month columns
        if "/" in label_text:
            q_total, r_total, a_total = 0, 0, 0
            for row in data:
                html_val = str(row.get(fname, ""))
                q, r, a = extract_qra(html_val)
                q_total += q
                r_total += r
                a_total += a
            total_row[fname] = format_month_value(f"{q_total}|{r_total}|{a_total}")

        # Cost and Total columns
        elif any(x in fname for x in ["cost", "amount", "total", "value"]):
            total = 0
            for row in data:
                total += extract_number(row.get(fname))
            total_row[fname] = (
                f"<div style='text-align:right;font-weight:bold;'>₹ {format_number(total)}</div>"
            )

        else:
            total_row[fname] = "<div style='text-align:center;'>-</div>"

    return total_row


# ======================================================
# 🔹 PARSING HELPERS
# ======================================================
def extract_qra(html_text):
    """Extracts Q, R, A values from HTML text."""
    try:
        q_match = re.search(r"Q:\s*([0-9,.]+)", html_text)
        r_match = re.search(r"R:\s*₹?\s*([0-9,.]+)", html_text)
        a_match = re.search(r"A:\s*₹?\s*([0-9,.]+)", html_text)

        q = float(q_match.group(1).replace(",", "")) if q_match else 0
        r = float(r_match.group(1).replace(",", "")) if r_match else 0
        a = float(a_match.group(1).replace(",", "")) if a_match else 0

        return q, r, a
    except:
        return 0, 0, 0


def extract_number(value):
    """Extracts number from HTML formatted fields."""
    if not value:
        return 0
    try:
        match = re.search(r"[\d,.]+", str(value))
        if match:
            return float(match.group(0).replace(",", ""))
    except:
        pass
    return 0


# ======================================================
# 🔹 FORMATTERS
# ======================================================
def format_month_value(value):
    """Formats QRA values into HTML."""
    if not value:
        return "<div style='text-align:center;'>-</div>"

    value = str(value).replace("₹", "").replace(",", "").strip()
    parts = re.split(r"[|, ]+", value)
    parts = [p.strip() for p in parts if p.strip()]

    qty = format_number(parts[0]) if len(parts) > 0 else "0.00"
    rate = format_number(parts[1]) if len(parts) > 1 else "0.00"
    amount = format_number(parts[2]) if len(parts) > 2 else "0.00"

    return f"""
    <div style='text-align:center;font-family:monospace;font-size:13px;'>
        Q: {qty} | R: ₹ {rate} | A: ₹ {amount}
    </div>
    """.strip()


def format_number(num):
    """Formats number with comma separators."""
    try:
        return f"{float(num):,.2f}"
    except:
        return str(num)


# ======================================================
# 🔹 CALL STORED PROCEDURE
# ======================================================
def call_stored_procedure(proc_name, from_date, to_date, company=None, customer=None):
    """Executes stored procedure."""
    query = f"CALL {proc_name}(%s, %s, %s, %s)"
    conn = frappe.db.get_connection()
    cursor = conn.cursor()

    cursor.execute(query, (from_date, to_date, company, customer))

    results = cursor.fetchall()
    colnames = [d[0] for d in cursor.description] if cursor.description else []

    while cursor.nextset():
        pass

    cursor.close()
    conn.close()

    return results, colnames