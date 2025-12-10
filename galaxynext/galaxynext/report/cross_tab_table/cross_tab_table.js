// Copyright (c) 2025,contributors
// For license information, please see license.txt

// frappe.query_reports["Cross Tab Table"] = {
// 	"filters": [
// 			{
//             "fieldname": "from_date",
//             "label": "From Date",
//             "fieldtype": "Date",
//             "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
//             "reqd": 1
//         },
//         {
//             "fieldname": "to_date",
//             "label": "To Date",
//             "fieldtype": "Date",
//             "default": frappe.datetime.get_today(),
//             "reqd": 1
//         }
// 	]
// };

// Copyright (c) 2025
// For license information, please see license.txt

// frappe.query_reports["Cross Tab Table"] = {
//     "filters": [
//         {
//             "fieldname": "from_date",
//             "label": "From Date",
//             "fieldtype": "Date",
//             // "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
//             "default": frappe.datetime.get_today(),
//             "reqd": 1
//         },
//         {
//             "fieldname": "to_date",
//             "label": "To Date",
//             "fieldtype": "Date",
//             "default": frappe.datetime.get_today(),
//             "reqd": 1
//         },
//         // {
//         //     "fieldname": "company",
//         //     "label": "Company",
//         //     "fieldtype": "Link",
//         //     "options": "Company",
//         //     "reqd": 1,
//         //     "default": frappe.defaults.get_default("company")
//         // }
//         {
//             "fieldname": "customer",
//             "label": "customer",
//             "fieldtype": "Link",
//             "options": "Customer",
//             "reqd": 0,
//             // "default": frappe.defaults.get_default("customer")
//         }
//     ]
// };


frappe.query_reports["Cross Tab Table"] = {
    "filters": [
        {
            "fieldname": "from_date",
            "label": "From Date",
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1
        },
        {
            "fieldname": "to_date",
            "label": "To Date",
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1
        },
        {
            "fieldname": "company",
            "label": "Company",
            "fieldtype": "Link",
            "options": "Company",
            "reqd": 0
        },
        {
            "fieldname": "customer",
            "label": "Customer",
            "fieldtype": "Link",
            "options": "Customer",
            "reqd": 0
        }
    ],
    
    "onload": function(report) {
        // 🔹 FORCE RESET to today's date on every load
        let today = frappe.datetime.get_today();
        
        setTimeout(function() {
            report.set_filter_value('from_date', today);
            report.set_filter_value('to_date', today);
            report.set_filter_value('customer', null);
            
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'User Permission',
                    filters: {
                        'user': frappe.session.user,
                        'is_default': 1,
                        'allow': 'Company'
                    },
                    fields: ['for_value'],
                    limit: 1
                },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        let default_company = r.message[0].for_value;
                        report.set_filter_value('company', default_company);
                        report.refresh();
                    } else {
                        report.refresh();
                    }
                }
            });
        }, 100);
        
        // ✅ ADD CUSTOM PRINT BUTTON
        report.page.add_inner_button(__('Print Custom Format'), function() {
            let filters = report.get_values();
            
            if (!filters.from_date || !filters.to_date) {
                frappe.msgprint(__('Please select From Date and To Date'));
                return;
            }
            
            let data = report.data || [];
            let columns = report.columns || [];
            
            if (!data.length) {
                frappe.msgprint(__('No data to print. Please run the report first.'));
                return;
            }
            
            generate_custom_print(filters, columns, data);
            
        }, __('Actions'));
    }
};

function generate_custom_print(filters, columns, data) {
    // Find month columns
    let month_columns = [];
    columns.forEach(col => {
        if (col.label && col.label.includes('/')) {
            month_columns.push(col);
        }
    });
    
    // Debug - show how many month columns found
    console.log('Month columns found:', month_columns.length);
    console.log('Month columns:', month_columns.map(c => c.label));
    
    if (month_columns.length === 0) {
        frappe.msgprint(__('No month columns found in the report'));
        return;
    }
    
    // Build HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cross Tab Table Report</title>
    <style>
        @media print {
            @page {
                size: landscape;
                margin: 10mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            margin: 15px;
            position: relative;
        }
        
        button.no-print:hover {
            background: #f5f5f5;
            border-color: #999;
        }
        
        .print-header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
        }
        
        .print-header h2 {
            margin: 0 0 8px 0;
            font-size: 16pt;
            font-weight: bold;
        }
        
        .print-info {
            margin: 5px 0;
            font-size: 9pt;
        }
        
        .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .print-table th {
            background-color: #e8e8e8;
            border: 1px solid #333;
            padding: 6px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 9pt;
        }
        
        .print-table td {
            border: 1px solid #666;
            padding: 3px;
            font-size: 8pt;
            vertical-align: top;
        }
        
        .month-data {
            padding: 3px !important;
        }
        
        .month-data div {
            line-height: 1.3;
            margin: 0;
            padding: 1px 0;
        }
        
        .total-cell {
            text-align: right;
            font-weight: bold;
        }
        
        .cost-cell {
            text-align: right;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="no-print" style="position: absolute; top: 15px; right: 15px; padding: 8px 16px; cursor: pointer; background: white; color: #333; border: 1px solid #ccc; border-radius: 4px; font-size: 10pt;">
        Print
    </button>
    
    <div class="print-format">
        <div class="print-header">
            <h2>Cross Tab Table Report</h2>
            <div class="print-info" style="text-align: left;">
                <strong>From Date:</strong> ${filters.from_date || 'N/A'} &nbsp;&nbsp;&nbsp;
                <strong>To Date:</strong> ${filters.to_date || 'N/A'}
                ${filters.company ? '<br><strong>Company:</strong> ' + filters.company : ''}
            </div>
        </div>
        
        <table class="print-table">
            <thead>
                <tr>
                    <th style="width: 3%;">#</th>
                    <th style="width: 10%;">Company</th>
                    <th style="width: 10%;">Customer</th>
                    <th style="width: 10%;">Customer Name</th>
                    <th style="width: 10%;">Group</th>`;
    
    // Add all month columns dynamically
    let total_month_width = 45; // Reduced to accommodate cost column
    let month_width = month_columns.length > 0 ? Math.floor(total_month_width / month_columns.length) : 20;
    
    month_columns.forEach(col => {
        html += `
                    <th style="width: ${month_width}%;">${col.label}</th>`;
    });
    
    html += `
                    <th style="width: 7%;">Cost</th>
                    <th style="width: 8%;">Total</th>
                </tr>
            </thead>
            <tbody>`;
    
    // Generate ALL rows - main data + summaries + totals
    let row_num = 1;
    
    data.forEach((row, index) => {
        let first_col = columns[0].fieldname;
        let first_col_value = String(row[first_col] || '');
        let clean_first_col = first_col_value.replace(/<[^>]*>/g, '').trim();
        
        // Check if this is a HEADER row (Summary/Total with month names in columns)
        let is_header = (clean_first_col.toLowerCase().includes('summary') || clean_first_col.toLowerCase().includes('total'));
        
        // Check if this row has month column headers instead of data
        let has_month_headers = false;
        if (is_header && month_columns.length > 0) {
            let first_month_val = String(row[month_columns[0].fieldname] || '').replace(/<[^>]*>/g, '').trim();
            if (first_month_val && !first_month_val.includes('Q:') && !first_month_val.includes('|')) {
                has_month_headers = true;
            }
        }
        
        if (has_month_headers) {
            // This is a section header with month column names
            html += `
                <tr style="background-color: #e8e8e8;">
                    <td colspan="5" style="font-weight: bold; padding: 6px; border: 1px solid #333;">${clean_first_col}</td>`;
            
            month_columns.forEach(col => {
                let header_val = String(row[col.fieldname] || '').replace(/<[^>]*>/g, '').trim();
                html += `
                    <td style="font-weight: bold; text-align: center; border: 1px solid #333;">${header_val || col.label}</td>`;
            });
            
            // Add Cost header
            let cost_field = columns[columns.length - 2].fieldname;
            let cost_header = String(row[cost_field] || '').replace(/<[^>]*>/g, '').trim();
            html += `
                    <td style="font-weight: bold; text-align: center; border: 1px solid #333;">${cost_header || 'Cost'}</td>`;
            
            // Add Total header
            let total_field = columns[columns.length - 1].fieldname;
            let total_header = String(row[total_field] || '').replace(/<[^>]*>/g, '').trim();
            html += `
                    <td style="font-weight: bold; text-align: center; border: 1px solid #333;">${total_header || 'Total Amount'}</td>
                </tr>`;
            return;
        }
        
        // Regular data or summary data row
        html += `
                <tr>
                    <td style="text-align: center;">${row_num}</td>
                    <td>${row.company || ''}</td>
                    <td>${row.customer || ''}</td>
                    <td>${row.customer_name || ''}</td>
                    <td>${row.customer_group || ''}</td>`;
        
        // Add each month column data
        month_columns.forEach(col => {
            let month_data = row[col.fieldname] || '';
            let qty = '0.00', rate = '0.00', amount = '0.00';
            
            if (month_data) {
                let data_str = String(month_data).replace(/<[^>]*>/g, '');
                
                // First try to extract from Q: R: A: format
                let q_match = data_str.match(/Q:\s*([\d,.]+)/);
                let r_match = data_str.match(/R:\s*₹?\s*R\.?\s*([\d,.]+)/);
                let a_match = data_str.match(/A:\s*₹?\s*A\.?\s*([\d,.]+)/);
                
                if (q_match) qty = q_match[1];
                if (r_match) {
                    rate = r_match[1];
                } else {
                    let r_simple = data_str.match(/R:\s*₹?\s*([\d,.]+)/);
                    if (r_simple) rate = r_simple[1];
                }
                if (a_match) {
                    amount = a_match[1];
                } else {
                    let a_simple = data_str.match(/A:\s*₹?\s*([\d,.]+)/);
                    if (a_simple) amount = a_simple[1];
                }
                
                // If still no data, try pipe format
                if (qty === '0.00' && data_str.includes('|')) {
                    let parts = data_str.replace(/₹|,|Q:|R:|A:/g, '').trim().split('|');
                    if (parts.length >= 3) {
                        qty = parts[0].trim();
                        rate = parts[1].trim();
                        amount = parts[2].trim();
                    }
                }
            }
            
            html += `
                    <td class="month-data">
                        <div>Q: ${qty}</div>
                        <div>R: ₹ ${rate}</div>
                        <div>A: ₹ ${amount}</div>
                    </td>`;
        });
        
        // Cost column
        let cost_field = columns[columns.length - 2].fieldname;
        let cost_value = String(row[cost_field] || '0.00').replace(/<[^>]*>/g, '').replace(/₹/g, '').trim();
        html += `
                    <td class="cost-cell">₹ ${cost_value}</td>`;
        
        // Total
        let total_field = columns[columns.length - 1].fieldname;
        let total_value = String(row[total_field] || '0.00').replace(/<[^>]*>/g, '').replace(/₹/g, '').trim();
        
        html += `
                    <td class="total-cell">₹ ${total_value}</td>
                </tr>`;
        
        row_num++;
    });
    
    html += `
            </tbody>
        </table>
    </div>
</body>
</html>`;
    
    // Open in new window
    let print_window = window.open('', '_blank', 'width=1200,height=800');
    if (print_window) {
        print_window.document.write(html);
        print_window.document.close();
        
        setTimeout(function() {
            print_window.focus();
        }, 300);
    } else {
        frappe.msgprint(__('Please allow popups for this site'));
    }
}