// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Workstation Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({ id: ws, title: ws }));

//         // Prepare events (work orders)
//         const events = work_orders.map(wo => ({
//             id: wo.work_order,
//             resourceId: wo.workstation || all_workstations[0],
//             title: `${wo.production_item} (${wo.work_order})`,
//             start: wo.planned_start_date,
//             end: wo.planned_end_date,
//             backgroundColor:
//                 wo.status === "Not Started" ? "#f87171" :
//                 wo.status === "In Process" ? "#60a5fa" :
//                 "#34d399",
//             borderColor: "#000",
//             extendedProps: { workstation: wo.workstation }
//         }));

//         // Render FullCalendar Scheduler
//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <div id="calendar" style="height: 80vh;"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineMonth',
//                 editable: true,
//                 droppable: true,
//                 resourceAreaHeaderContent: 'Workstations',
//                 resourceAreaWidth: '15%',
//                 resources: resources,
//                 events: events,

//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             work_order: event.id,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     frappe.show_alert({ message: `Updated ${event.id}`, indicator: 'green' });
//                 },

//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             work_order: event.id,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     frappe.show_alert({ message: `Resized ${event.id}`, indicator: 'green' });
//                 }
//             });

//             calendar.render();
//         }, 500);
//     }
// }




//working code top ma show thashse workstation


// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Workstation Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.map(wo => ({
//             id: wo.operation_id,
//             resourceId: wo.workstation || all_workstations[0],
//             title: `${wo.production_item} (${wo.operation})`,
//             start: wo.planned_start_time,
//             end: wo.planned_end_time,
//             backgroundColor:
//                 wo.status === "Not Started" ? "#f87171" :
//                 wo.status === "In Process" ? "#60a5fa" :
//                 "#34d399",
//             borderColor: "#000",
//             extendedProps: {
//                 work_order: wo.work_order,
//                 operation: wo.operation,
//                 workstation: wo.workstation
//             }
//         }));

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <div id="calendar" style="height: 80vh;"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimeGridWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 nowIndicator: true,
//                 resourceAreaWidth: '18%',
//                 resourceAreaHeaderContent: 'Workstations',
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimeGridDay,resourceTimeGridWeek,dayGridMonth'
//                 },
//                 resources,
//                 events,

//                 // ✅ Drag event
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             operation_id: event.id,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     frappe.show_alert({ message: `Updated ${event.title}`, indicator: 'green' });
//                 },

//                 // ✅ Resize event
//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             operation_id: event.id,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     frappe.show_alert({ message: `Resized ${event.title}`, indicator: 'blue' });
//                 },

//                 eventDidMount: (info) => {
//                     $(info.el).tooltip({
//                         title: `
//                             <b>${info.event.extendedProps.work_order}</b><br>
//                             <small>${info.event.extendedProps.operation}</small><br>
//                             <small>${info.event.extendedProps.workstation}</small><br>
//                             ${frappe.datetime.str_to_user(info.event.startStr)} → ${frappe.datetime.str_to_user(info.event.endStr)}
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }

// ---------------------------------------------------------------------------------------



// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Workstation Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.calendar = null;
//         this.setup_realtime();
//         this.render();
//     }

//     setup_realtime() {
//         // Listen for refresh events from Work Order saves
//         frappe.realtime.on('workstation_gantt_refresh', () => {
//             console.log('Gantt refresh triggered');
//             this.load_data();
//         });
//     }

//     async render() {
//         // Add refresh button
//         this.page.add_inner_button('Refresh', () => {
//             this.load_data();
//         });

//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({ id: ws, title: ws }));

//         // Prepare events (work order OPERATIONS, not work orders)
//         const events = work_orders
//             .filter(wo => wo.operation && wo.workstation && wo.planned_start_date && wo.planned_end_date) // Filter valid records
//             .map((wo, index) => ({
//                 id: `${wo.work_order}-${wo.operation}-${index}`, // Unique ID for each operation
//                 resourceId: wo.workstation || all_workstations[0],
//                 title: `${wo.production_item} - ${wo.operation} (${wo.work_order})`,
//                 start: wo.planned_start_date,
//                 end: wo.planned_end_date,
//                 backgroundColor:
//                     wo.status === "Not Started" ? "#f87171" :
//                     wo.status === "In Process" ? "#60a5fa" :
//                     "#34d399",
//                 borderColor: "#000",
//                 extendedProps: { 
//                     work_order: wo.work_order,
//                     operation: wo.operation,
//                     workstation: wo.workstation,
//                     original_index: index
//                 }
//             }));

//         // Render FullCalendar Scheduler
//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <div id="calendar" style="height: 80vh;"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             this.calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineMonth',
//                 editable: true, // Enable drag and drop
//                 droppable: true, // Enable dropping
//                 resourceAreaHeaderContent: 'Workstations',
//                 resourceAreaWidth: '15%',
//                 resources: resources,
//                 events: events,
                
//                 // Click event to open Work Order
//                 eventClick: (info) => {
//                     const work_order = info.event.extendedProps.work_order;
//                     frappe.set_route('Form', 'Work Order', work_order);
//                 },

//                 // When event is dragged to different workstation or time
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;
//                     const { work_order, operation } = event.extendedProps;

//                     const result = await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             work_order: work_order,
//                             operation: operation,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     if (result.message === "success") {
//                         frappe.show_alert({ 
//                             message: `✓ Updated ${operation} → ${resourceId}`, 
//                             indicator: 'green' 
//                         });
//                     } else {
//                         frappe.show_alert({ 
//                             message: `Error: ${result.message}`, 
//                             indicator: 'red' 
//                         });
//                         info.revert(); // Revert if failed
//                     }
//                 },

//                 // When event is resized
//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;
//                     const { work_order, operation } = event.extendedProps;

//                     const result = await frappe.call({
//                         method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                         args: {
//                             work_order: work_order,
//                             operation: operation,
//                             workstation: resourceId,
//                             start_date: event.startStr,
//                             end_date: event.endStr
//                         }
//                     });

//                     if (result.message === "success") {
//                         frappe.show_alert({ 
//                             message: `✓ Resized ${operation}`, 
//                             indicator: 'green' 
//                         });
//                     } else {
//                         frappe.show_alert({ 
//                             message: `Error: ${result.message}`, 
//                             indicator: 'red' 
//                         });
//                         info.revert(); // Revert if failed
//                     }
//                 }
//             });

//             this.calendar.render();
//         }, 500);
//     }
// }

// ----------------------------------activity log ma perfect aave che----------------------------------

// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Workstation Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.map(wo => ({
//             id: wo.operation_id,
//             resourceId: wo.workstation || all_workstations[0],
//             title: `${wo.production_item} (${wo.operation})`,
//             start: wo.planned_start_time,
//             end: wo.planned_end_time,
//             backgroundColor:
//                 wo.status === "Not Started" ? "#f87171" :
//                 wo.status === "In Process" ? "#60a5fa" :
//                 "#34d399",
//             borderColor: "#000",
//             extendedProps: {
//                 work_order: wo.work_order,
//                 operation: wo.operation,
//                 workstation: wo.workstation
//             }
//         }));

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <div id="calendar" style="height: 80vh;"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimeGridWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 nowIndicator: true,
//                 resourceAreaWidth: '18%',
//                 resourceAreaHeaderContent: 'Workstations',
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimeGridDay,resourceTimeGridWeek,dayGridMonth'
//                 },
//                 resources,
//                 events,

//                 // ✅ Drag event
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Updated ${event.title}`, 
//                                 indicator: 'green' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Resize event
//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: event.startStr,
//                                 end_date: event.endStr
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Resized ${event.title}`, 
//                                 indicator: 'blue' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to resize: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 eventDidMount: (info) => {
//                     $(info.el).tooltip({
//                         title: `
//                             <b>${info.event.extendedProps.work_order}</b><br>
//                             <small>${info.event.extendedProps.operation}</small><br>
//                             <small>${info.event.extendedProps.workstation}</small><br>
//                             ${frappe.datetime.str_to_user(info.event.startStr)} → ${frappe.datetime.str_to_user(info.event.endStr)}
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }








// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Work Order Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         // Add "Add Work Order" button
//         this.page.set_primary_action('Add Work Order', () => {
//             frappe.new_doc('Work Order');
//         });

//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.map(wo => ({
//             id: wo.operation_id,
//             resourceId: wo.workstation || all_workstations[0],
//             title: `${wo.production_item} (${wo.operation})`,
//             start: wo.planned_start_time,
//             end: wo.planned_end_time,
//             backgroundColor:
//                 wo.status === "Not Started" ? "#f87171" :
//                 wo.status === "In Process" ? "#60a5fa" :
//                 "#34d399",
//             borderColor: "#000",
//             extendedProps: {
//                 work_order: wo.work_order,
//                 operation: wo.operation,
//                 workstation: wo.workstation,
//                 production_item: wo.production_item,
//                 status: wo.status
//             }
//         }));

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <style>
//                 #calendar {
//                     height: 80vh;
//                     background: white;
//                     border-radius: 8px;
//                     padding: 15px;
//                     box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//                 }
//                 .fc-event {
//                     cursor: pointer;
//                 }
//                 .fc-event:hover {
//                     opacity: 0.85;
//                     transform: translateY(-1px);
//                     box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//                 }
//                 .fc-resource-timeline .fc-resource {
//                     font-weight: 600;
//                     padding: 8px 12px;
//                 }
//                 .fc-toolbar-title {
//                     font-size: 1.5em !important;
//                     font-weight: 600;
//                 }
//                 .fc-button {
//                     text-transform: capitalize !important;
//                 }
//             </style>
//             <div id="calendar"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 nowIndicator: true,
//                 resourceAreaWidth: '200px',
//                 resourceAreaHeaderContent: 'Workstation',
//                 slotMinWidth: 100,
                
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
//                 },
                
//                 views: {
//                     resourceTimelineDay: {
//                         buttonText: 'Day',
//                         slotDuration: '01:00:00',
//                         slotLabelFormat: {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: false
//                         }
//                     },
//                     resourceTimelineWeek: {
//                         buttonText: 'Week',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: [
//                             { weekday: 'short', day: 'numeric', month: 'short' }
//                         ]
//                     },
//                     resourceTimelineMonth: {
//                         buttonText: 'Month',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: {
//                             day: 'numeric',
//                             weekday: 'short'
//                         }
//                     }
//                 },
                
//                 resources,
//                 events,

//                 // ✅ Click to open Work Order
//                 eventClick: (info) => {
//                     frappe.set_route('Form', 'Work Order', info.event.extendedProps.work_order);
//                 },

//                 // ✅ Drag event to different workstation or time
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Updated ${event.title}`, 
//                                 indicator: 'green' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Resize event (change duration)
//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Resized ${event.title}`, 
//                                 indicator: 'blue' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to resize: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Hover tooltip with details
//                 eventDidMount: (info) => {
//                     const props = info.event.extendedProps;
//                     $(info.el).tooltip({
//                         title: `
//                             <div style="text-align: left;">
//                                 <strong>${props.work_order}</strong><br>
//                                 <strong>Product:</strong> ${props.production_item}<br>
//                                 <strong>Operation:</strong> ${props.operation}<br>
//                                 <strong>Workstation:</strong> ${props.workstation}<br>
//                                 <strong>Status:</strong> ${props.status}<br>
//                                 <strong>Start:</strong> ${frappe.datetime.str_to_user(info.event.startStr)}<br>
//                                 <strong>End:</strong> ${frappe.datetime.str_to_user(info.event.endStr)}
//                             </div>
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }



// ------1------------------------------------

// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Work Order Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.filter(wo => wo.planned_start_time && wo.planned_end_time).map(wo => {
//             // Format dates to show time
//             const startTime = moment(wo.planned_start_time).format('DD-MM HH:mm');
//             const endTime = moment(wo.planned_end_time).format('DD-MM HH:mm');
            
//             // Create a better display title with time and duration
//             const timeInMins = wo.time_in_mins || 0;
//             const displayTitle = `${wo.work_order} - ${wo.operation}
// ${startTime} → ${endTime} (${timeInMins} mins)`;
            
//             return {
//                 id: wo.operation_id,
//                 resourceId: wo.workstation || all_workstations[0],
//                 title: displayTitle,
//                 start: wo.planned_start_time,
//                 end: wo.planned_end_time,
//                 backgroundColor:
//                     wo.status === "Not Started" ? "#ef4444" :
//                     wo.status === "In Process" ? "#3b82f6" :
//                     "#10b981",
//                 borderColor: "#1f2937",
//                 textColor: "#ffffff",
//                 extendedProps: {
//                     work_order: wo.work_order,
//                     operation: wo.operation,
//                     workstation: wo.workstation,
//                     production_item: wo.production_item,
//                     status: wo.status,
//                     qty: wo.qty,
//                     start_time: startTime,
//                     end_time: endTime,
//                     time_in_mins: timeInMins
//                 }
//             };
//         });

//         console.log('Resources:', resources);
//         console.log('Events:', events);

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"></script>
//             <style>
//                 #calendar {
//                     height: 80vh;
//                     background: white;
//                     border-radius: 8px;
//                     padding: 15px;
//                     box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//                 }
//                 .fc-event {
//                     cursor: pointer;
//                     font-size: 14px;
//                     font-weight: 700;
//                     padding: 6px 10px;
//                     border-width: 2px;
//                     min-height: 50px;
//                 }
//                 .fc-event:hover {
//                     opacity: 0.9;
//                     transform: translateY(-1px);
//                     box-shadow: 0 4px 8px rgba(0,0,0,0.3);
//                 }
//                 .fc-event-title {
//                     font-weight: 700;
//                 }
//                 .fc-resource-timeline .fc-resource {
//                     font-weight: 600;
//                     padding: 8px 12px;
//                     font-size: 14px;
//                 }
//                 .fc-toolbar-title {
//                     font-size: 1.5em !important;
//                     font-weight: 600;
//                 }
//                 .fc-button {
//                     text-transform: capitalize !important;
//                 }
//                 .fc-timeline-event {
//                     border-radius: 4px;
//                 }
//                 .fc-timeline-event-harness {
//                     min-height: 50px !important;
//                 }
//                 .drag-tooltip {
//                     position: fixed;
//                     background: rgba(0, 0, 0, 0.9);
//                     color: white;
//                     padding: 12px 16px;
//                     border-radius: 6px;
//                     font-size: 13px;
//                     font-weight: 600;
//                     z-index: 10000;
//                     pointer-events: none;
//                     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//                     line-height: 1.6;
//                 }
//             </style>
//             <div id="calendar"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 eventResizableFromStart: true,  // Disable resizing
//                 eventDurationEditable: true,     // Disable duration editing
//                 nowIndicator: true,
//                 resourceAreaWidth: '200px',
//                 resourceAreaHeaderContent: 'Workstation',
//                 slotMinWidth: 100,
//                 height: 'auto',
//                 contentHeight: 'auto',
                
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
//                 },
                
//                 views: {
//                     resourceTimelineDay: {
//                         buttonText: 'Day',
//                         slotDuration: '01:00:00',
//                         slotLabelFormat: {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: false
//                         }
//                     },
//                     resourceTimelineWeek: {
//                         buttonText: 'Week',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: [
//                             { weekday: 'short', day: 'numeric', month: 'short' }
//                         ]
//                     },
//                     resourceTimelineMonth: {
//                         buttonText: 'Month',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: {
//                             day: 'numeric',
//                             weekday: 'short'
//                         }
//                     }
//                 },
                
//                 resources,
//                 events,
                
//                 eventContent: function(arg) {
//                     const lines = arg.event.title.split('\n');
//                     const workOrder = lines[0] || '';
//                     const timeInfo = lines[1] || '';
                    
//                     return {
//                         html: `
//                             <div style="padding: 6px 10px; font-weight: 700; line-height: 1.5; height: 100%; display: flex; flex-direction: column; justify-content: center;">
//                                 <div style="font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 3px;">
//                                     ${workOrder}
//                                 </div>
//                                 <div style="font-size: 12px; opacity: 0.95; font-weight: 600;">
//                                     ${timeInfo}
//                                 </div>
//                             </div>
//                         `
//                     };
//                 },

//                 // ✅ Click to open Work Order
//                 eventClick: (info) => {
//                     frappe.set_route('Form', 'Work Order', info.event.extendedProps.work_order);
//                 },

//                 // ✅ Show tooltip while dragging
//                 eventDragStart: (info) => {
//                     const tooltip = $(`<div class="drag-tooltip"></div>`).appendTo('body');
                    
//                     $(document).on('mousemove.drag', function(e) {
//                         const startDate = moment(info.event.start).format('DD-MM-YYYY HH:mm');
//                         const endDate = moment(info.event.end).format('DD-MM-YYYY HH:mm');
                        
//                         tooltip.html(`
//                             <div><strong>${info.event.extendedProps.work_order}</strong></div>
//                             <div style="margin-top: 4px;">Start: ${startDate}</div>
//                             <div>End: ${endDate}</div>
//                         `).css({
//                             left: e.pageX + 15,
//                             top: e.pageY + 15,
//                             display: 'block'
//                         });
//                     });
//                 },

//                 // ✅ Remove tooltip after drag
//                 eventDragStop: (info) => {
//                     $(document).off('mousemove.drag');
//                     $('.drag-tooltip').remove();
//                 },

//                 // ✅ Drag event to different workstation or time
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Updated ${event.extendedProps.work_order}`, 
//                                 indicator: 'green' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Resize event (change duration)
//                 eventResize: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Resized ${event.title}`, 
//                                 indicator: 'blue' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to resize: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Hover tooltip with details
//                 eventDidMount: (info) => {
//                     const props = info.event.extendedProps;
//                     const startDate = frappe.datetime.str_to_user(info.event.startStr);
//                     const endDate = frappe.datetime.str_to_user(info.event.endStr);
                    
//                     $(info.el).tooltip({
//                         title: `
//                             <div style="text-align: left; padding: 5px;">
//                                 <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
//                                     ${props.work_order}
//                                 </div>
//                                 <div style="margin: 4px 0;"><strong>Product:</strong> ${props.production_item}</div>
//                                 <div style="margin: 4px 0;"><strong>Operation:</strong> ${props.operation}</div>
//                                 <div style="margin: 4px 0;"><strong>Workstation:</strong> ${props.workstation}</div>
//                                 <div style="margin: 4px 0;"><strong>Qty:</strong> ${props.qty}</div>
//                                 <div style="margin: 4px 0;"><strong>Time:</strong> ${props.time_in_mins} minutes</div>
//                                 <div style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${
//                                     props.status === 'Not Started' ? '#ef4444' :
//                                     props.status === 'In Process' ? '#3b82f6' : '#10b981'
//                                 };">${props.status}</span></div>
//                                 <div style="margin: 4px 0; margin-top: 8px; padding-top: 5px; border-top: 1px solid #ddd;">
//                                     <div><strong>Start:</strong> ${startDate}</div>
//                                     <div><strong>End:</strong> ${endDate}</div>
//                                 </div>
//                             </div>
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top',
//                         boundary: 'window'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }









// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Work Order Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.filter(wo => wo.planned_start_time && wo.planned_end_time).map(wo => {
//             // Format dates to show time
//             const startTime = moment(wo.planned_start_time).format('DD-MM HH:mm');
//             const endTime = moment(wo.planned_end_time).format('DD-MM HH:mm');
            
//             // Create a better display title with time and duration
//             const timeInMins = wo.time_in_mins || 0;
//             const displayTitle = `${wo.work_order} - ${wo.operation}
// ${startTime} → ${endTime} (${timeInMins} mins)`;
            
//             return {
//                 id: wo.operation_id,
//                 resourceId: wo.workstation || all_workstations[0],
//                 title: displayTitle,
//                 start: wo.planned_start_time,
//                 end: wo.planned_end_time,
//                 backgroundColor:
//                     wo.status === "Not Started" ? "#ef4444" :
//                     wo.status === "In Process" ? "#3b82f6" :
//                     "#10b981",
//                 borderColor: "#1f2937",
//                 textColor: "#ffffff",
//                 extendedProps: {
//                     work_order: wo.work_order,
//                     operation: wo.operation,
//                     workstation: wo.workstation,
//                     production_item: wo.production_item,
//                     status: wo.status,
//                     qty: wo.qty,
//                     start_time: startTime,
//                     end_time: endTime,
//                     time_in_mins: timeInMins
//                 }
//             };
//         });

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"><\/script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"><\/script>
//             <style>
//                 #calendar {
//                     height: 80vh;
//                     background: white;
//                     border-radius: 8px;
//                     padding: 15px;
//                     box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//                 }
                
//                    .fc-event {
//                     cursor: pointer;
//                     font-size: 12px;
//                     font-weight: 700;
//                     padding: 4px 8px;
//                     border-width: 2px;
//                     min-height: 20px;
//                 }
//                 .fc-event:hover {
//                     opacity: 0.9;
//                     transform: translateY(-1px);
//                     box-shadow: 0 4px 8px rgba(0,0,0,0.3);
//                 }
//                 .fc-event-title {
//                     font-weight: 700;
//                 }
//                 .fc-resource-timeline .fc-resource {
//                     font-weight: 600;
//                     padding: 8px 12px;
//                     font-size: 14px;
//                 }
//                 .fc-toolbar-title {
//                     font-size: 1.5em !important;
//                     font-weight: 600;
//                 }
//                 .fc-button {
//                     text-transform: capitalize !important;
//                 }
//                 .fc-timeline-event {
//                     border-radius: 4px;
//                 }
//                 .fc-timeline-event-harness {
//                     min-height: 50px !important;
//                 }
//                 .drag-tooltip {
//                     position: fixed;
//                     background: rgba(0, 0, 0, 0.9);
//                     color: white;
//                     padding: 12px 16px;
//                     border-radius: 6px;
//                     font-size: 13px;
//                     font-weight: 600;
//                     z-index: 10000;
//                     pointer-events: none;
//                     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//                     line-height: 1.6;
//                 }
//             </style>
//             <div id="calendar"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 eventResizableFromStart: true,
//                 eventDurationEditable: true,
//                 nowIndicator: true,
//                 resourceAreaWidth: '200px',
//                 resourceAreaHeaderContent: 'Workstation',
//                 slotMinWidth: 100,
//                 height: 'auto',
//                 contentHeight: 'auto',
                
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
//                 },
                
//                 views: {
//                     resourceTimelineDay: {
//                         buttonText: 'Day',
//                         slotDuration: '01:00:00',
//                         slotLabelFormat: {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: false
//                         }
//                     },
//                     resourceTimelineWeek: {
//                         buttonText: 'Week',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: [
//                             { weekday: 'short', day: 'numeric', month: 'short' }
//                         ]
//                     },
//                     resourceTimelineMonth: {
//                         buttonText: 'Month',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: {
//                             day: 'numeric',
//                             weekday: 'short'
//                         }
//                     }
//                 },
                
//                 resources,
//                 events,
                
//                 eventContent: function(arg) {
//                     const lines = arg.event.title.split('\n');
//                     const workOrder = lines[0] || '';
//                     const timeInfo = lines[1] || '';
                    
//                     return {
//                         html: `
//                             <div style="padding: 6px 10px; font-weight: 700; line-height: 1.5; height: 100%; display: flex; flex-direction: column; justify-content: center;">
//                                 <div style="font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 3px;">
//                                     ${workOrder}
//                                 </div>
//                                 <div style="font-size: 12px; opacity: 0.95; font-weight: 600;">
//                                     ${timeInfo}
//                                 </div>
//                             </div>
//                         `
//                     };
//                 },

//                 // ✅ Click to open Work Order
//                 eventClick: (info) => {
//                     frappe.set_route('Form', 'Work Order', info.event.extendedProps.work_order);
//                 },

//                 // ✅ Show tooltip while dragging
//                 eventDragStart: (info) => {
//                     const tooltip = $(`<div class="drag-tooltip"></div>`).appendTo('body');
                    
//                     $(document).on('mousemove.drag', function(e) {
//                         const startDate = moment(info.event.start).format('DD-MM-YYYY HH:mm');
//                         const endDate = moment(info.event.end).format('DD-MM-YYYY HH:mm');
                        
//                         tooltip.html(`
//                             <div><strong>${info.event.extendedProps.work_order}</strong></div>
//                             <div style="margin-top: 4px;">Start: ${startDate}</div>
//                             <div>End: ${endDate}</div>
//                         `).css({
//                             left: e.pageX + 15,
//                             top: e.pageY + 15,
//                             display: 'block'
//                         });
//                     });
//                 },

//                 // ✅ Remove tooltip after drag
//                 eventDragStop: (info) => {
//                     $(document).off('mousemove.drag');
//                     $('.drag-tooltip').remove();
//                 },

//                 // ✅ Drag event to different workstation or time
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Updated ${event.extendedProps.work_order}`, 
//                                 indicator: 'green' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Resize event - visual only, not saved
//                 eventResize: async (info) => {
//                     frappe.show_alert({ 
//                         message: `Resize is for viewing only - changes not saved`, 
//                         indicator: 'orange' 
//                     });
                    
//                     // // Revert after 1 second
//                     // setTimeout(() => {
//                     //     info.revert();
//                     // }, 1000);
//                 },

//                 // ✅ Hover tooltip with details
//                 eventDidMount: (info) => {
//                     const props = info.event.extendedProps;
//                     const startDate = frappe.datetime.str_to_user(info.event.startStr);
//                     const endDate = frappe.datetime.str_to_user(info.event.endStr);
                    
//                     $(info.el).tooltip({
//                         title: `
//                             <div style="text-align: left; padding: 5px;">
//                                 <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
//                                     ${props.work_order}
//                                 </div>
//                                 <div style="margin: 4px 0;"><strong>Product:</strong> ${props.production_item}</div>
//                                 <div style="margin: 4px 0;"><strong>Operation:</strong> ${props.operation}</div>
//                                 <div style="margin: 4px 0;"><strong>Workstation:</strong> ${props.workstation}</div>
//                                 <div style="margin: 4px 0;"><strong>Qty:</strong> ${props.qty}</div>
//                                 <div style="margin: 4px 0;"><strong>Time:</strong> ${props.time_in_mins} minutes</div>
//                                 <div style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${
//                                     props.status === 'Not Started' ? '#ef4444' :
//                                     props.status === 'In Process' ? '#3b82f6' : '#10b981'
//                                 };">${props.status}</span></div>
//                                 <div style="margin: 4px 0; margin-top: 8px; padding-top: 5px; border-top: 1px solid #ddd;">
//                                     <div><strong>Start:</strong> ${startDate}</div>
//                                     <div><strong>End:</strong> ${endDate}</div>
//                                 </div>
//                             </div>
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top',
//                         boundary: 'window'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }



// frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
//     new WorkstationGantt(wrapper);
// };

// class WorkstationGantt {
//     constructor(wrapper) {
//         this.page = frappe.ui.make_app_page({
//             parent: wrapper,
//             title: 'Work Order Gantt View',
//             single_column: true
//         });
//         this.wrapper = wrapper;
//         this.render();
//     }

//     async render() {
//         const container = $(`
//             <div style="padding: 15px;">
//                 <div id="gantt-container"></div>
//             </div>
//         `).appendTo(this.page.main);

//         await this.load_data();
//     }

//     async load_data() {
//         frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

//         const data = await frappe.call({
//             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
//         });

//         if (!data.message || data.message.error) {
//             frappe.msgprint('Error loading work orders');
//             return;
//         }

//         const { work_orders, all_workstations } = data.message;

//         // 🔹 Prepare resources (workstations)
//         const resources = all_workstations.map(ws => ({
//             id: ws,
//             title: ws
//         }));

//         // 🔹 Prepare events (operations)
//         const events = work_orders.filter(wo => wo.planned_start_time && wo.planned_end_time).map(wo => {
//             // Extract only the number from work order (e.g., "MFG-WO-2025-00001" -> "00001")
//             const woNumber = wo.work_order.split('-').pop() || wo.work_order;
            
//             return {
//                 id: wo.operation_id,
//                 resourceId: wo.workstation || all_workstations[0],
//                 title: woNumber,
//                 start: wo.planned_start_time,
//                 end: wo.planned_end_time,
//                 backgroundColor:
//                     wo.status === "Not Started" ? "#ef4444" :
//                     wo.status === "In Process" ? "#3b82f6" :
//                     "#10b981",
//                 borderColor: "#1f2937",
//                 textColor: "#ffffff",
//                 extendedProps: {
//                     work_order: wo.work_order,
//                     operation: wo.operation,
//                     workstation: wo.workstation,
//                     production_item: wo.production_item,
//                     status: wo.status,
//                     qty: wo.qty,
//                     start_time: moment(wo.planned_start_time).format('DD-MM HH:mm'),
//                     end_time: moment(wo.planned_end_time).format('DD-MM HH:mm'),
//                     time_in_mins: wo.time_in_mins || 0
//                 }
//             };
//         });

//         this.render_gantt(resources, events);
//     }

//     render_gantt(resources, events) {
//         $('#gantt-container').html(`
//             <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"><\/script>
//             <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"><\/script>
//             <style>
//                 #calendar {
//                     height: 80vh;
//                     background: white;
//                     border-radius: 8px;
//                     padding: 15px;
//                     box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//                 }
//                 .fc-event {
//                     cursor: pointer;
//                     border-width: 1px;
//                     min-height: 30px;
//                 }
//                 .fc-event:hover {
//                     opacity: 0.9;
//                     transform: translateY(-1px);
//                     box-shadow: 0 4px 8px rgba(0,0,0,0.3);
//                 }
//                 .fc-event-main {
//                     display: flex !important;
//                     align-items: center !important;
//                     justify-content: center !important;
//                     padding: 4px 8px !important;
//                 }
//                 .fc-event-title {
//                     font-size: 11px !important;
//                     font-weight: 700 !important;
//                     text-align: center !important;
//                 }
//                 .fc-resource-timeline .fc-resource {
//                     font-weight: 600;
//                     padding: 6px 10px;
//                     font-size: 13px;
//                 }
//                 .fc-toolbar-title {
//                     font-size: 1.5em !important;
//                     font-weight: 600;
//                 }
//                 .fc-button {
//                     text-transform: capitalize !important;
//                 }
//                 .fc-timeline-event {
//                     border-radius: 4px;
//                 }
//                 .drag-tooltip {
//                     position: fixed;
//                     background: rgba(0, 0, 0, 0.9);
//                     color: white;
//                     padding: 12px 16px;
//                     border-radius: 6px;
//                     font-size: 13px;
//                     font-weight: 600;
//                     z-index: 10000;
//                     pointer-events: none;
//                     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//                     line-height: 1.6;
//                 }
//             </style>
//             <div id="calendar"></div>
//         `);

//         setTimeout(() => {
//             const calendarEl = document.getElementById('calendar');

//             const calendar = new FullCalendar.Calendar(calendarEl, {
//                 schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//                 initialView: 'resourceTimelineWeek',
//                 aspectRatio: 1.8,
//                 editable: true,
//                 droppable: true,
//                 eventResizableFromStart: true,
//                 eventDurationEditable: true,
//                 nowIndicator: true,
//                 resourceAreaWidth: '200px',
//                 resourceAreaHeaderContent: 'Workstation',
//                 slotMinWidth: 100,
//                 height: 'auto',
//                 contentHeight: 'auto',
                
//                 headerToolbar: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
//                 },
                
//                 views: {
//                     resourceTimelineDay: {
//                         buttonText: 'Day',
//                         slotDuration: '01:00:00',
//                         slotLabelFormat: {
//                             hour: 'numeric',
//                             minute: '2-digit',
//                             hour12: false
//                         }
//                     },
//                     resourceTimelineWeek: {
//                         buttonText: 'Week',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: [
//                             { weekday: 'short', day: 'numeric', month: 'short' }
//                         ]
//                     },
//                     resourceTimelineMonth: {
//                         buttonText: 'Month',
//                         slotDuration: '24:00:00',
//                         slotLabelFormat: {
//                             day: 'numeric',
//                             weekday: 'short'
//                         }
//                     }
//                 },
                
//                 resources,
//                 events,

//                 // ✅ Click to open Work Order
//                 eventClick: (info) => {
//                     frappe.set_route('Form', 'Work Order', info.event.extendedProps.work_order);
//                 },

//                 // ✅ Show tooltip while dragging
//                 eventDragStart: (info) => {
//                     const tooltip = $(`<div class="drag-tooltip"></div>`).appendTo('body');
                    
//                     $(document).on('mousemove.drag', function(e) {
//                         const startDate = moment(info.event.start).format('DD-MM-YYYY HH:mm');
//                         const endDate = moment(info.event.end).format('DD-MM-YYYY HH:mm');
                        
//                         tooltip.html(`
//                             <div><strong>${info.event.extendedProps.work_order}</strong></div>
//                             <div style="margin-top: 4px;">Start: ${startDate}</div>
//                             <div>End: ${endDate}</div>
//                         `).css({
//                             left: e.pageX + 15,
//                             top: e.pageY + 15,
//                             display: 'block'
//                         });
//                     });
//                 },

//                 // ✅ Remove tooltip after drag
//                 eventDragStop: (info) => {
//                     $(document).off('mousemove.drag');
//                     $('.drag-tooltip').remove();
//                 },

//                 // ✅ Drag event to different workstation or time
//                 eventDrop: async (info) => {
//                     const event = info.event;
//                     const resourceId = event.getResources()[0]?.id;

//                     try {
//                         // Convert to Frappe-compatible datetime format
//                         const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
//                         const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

//                         const response = await frappe.call({
//                             method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
//                             args: {
//                                 operation_id: event.id,
//                                 workstation: resourceId,
//                                 start_date: start_date,
//                                 end_date: end_date
//                             }
//                         });

//                         if (response.message && response.message.status === 'success') {
//                             frappe.show_alert({ 
//                                 message: `✓ Updated ${event.extendedProps.work_order}`, 
//                                 indicator: 'green' 
//                             });
//                         } else {
//                             // Revert if failed
//                             info.revert();
//                             frappe.show_alert({ 
//                                 message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
//                                 indicator: 'red' 
//                             });
//                         }
//                     } catch (error) {
//                         info.revert();
//                         frappe.show_alert({ 
//                             message: `✗ Error: ${error.message}`, 
//                             indicator: 'red' 
//                         });
//                     }
//                 },

//                 // ✅ Resize event - visual only, not saved
//                 eventResize: async (info) => {
//                     frappe.show_alert({ 
//                         message: `Resize is for viewing only - changes not saved`, 
//                         indicator: 'orange' 
//                     });
//                 },

//                 // ✅ Hover tooltip with details
//                 eventDidMount: (info) => {
//                     const props = info.event.extendedProps;
//                     const startDate = frappe.datetime.str_to_user(info.event.startStr);
//                     const endDate = frappe.datetime.str_to_user(info.event.endStr);
                    
//                     $(info.el).tooltip({
//                         title: `
//                             <div style="text-align: left; padding: 5px;">
//                                 <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
//                                     ${props.work_order}
//                                 </div>
//                                 <div style="margin: 4px 0;"><strong>Product:</strong> ${props.production_item}</div>
//                                 <div style="margin: 4px 0;"><strong>Operation:</strong> ${props.operation}</div>
//                                 <div style="margin: 4px 0;"><strong>Workstation:</strong> ${props.workstation}</div>
//                                 <div style="margin: 4px 0;"><strong>Qty:</strong> ${props.qty}</div>
//                                 <div style="margin: 4px 0;"><strong>Time:</strong> ${props.time_in_mins} minutes</div>
//                                 <div style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${
//                                     props.status === 'Not Started' ? '#ef4444' :
//                                     props.status === 'In Process' ? '#3b82f6' : '#10b981'
//                                 };">${props.status}</span></div>
//                                 <div style="margin: 4px 0; margin-top: 8px; padding-top: 5px; border-top: 1px solid #ddd;">
//                                     <div><strong>Start:</strong> ${startDate}</div>
//                                     <div><strong>End:</strong> ${endDate}</div>
//                                 </div>
//                             </div>
//                         `,
//                         html: true,
//                         container: 'body',
//                         placement: 'top',
//                         boundary: 'window'
//                     });
//                 }
//             });

//             calendar.render();
//         }, 400);
//     }
// }




frappe.pages['workstation-gantt'].on_page_load = function (wrapper) {
    new WorkstationGantt(wrapper);
};

class WorkstationGantt {
    constructor(wrapper) {
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'Work Order Gantt View',
            single_column: true
        });
        this.wrapper = wrapper;
        this.render();
    }

    async render() {
        const container = $(`
            <div style="padding: 15px;">
                <div id="gantt-container"></div>
            </div>
        `).appendTo(this.page.main);

        await this.load_data();
    }

    async load_data() {
        frappe.show_alert({ message: 'Loading Gantt View...', indicator: 'blue' });

        const data = await frappe.call({
            method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders'
        });

        if (!data.message || data.message.error) {
            frappe.msgprint('Error loading work orders');
            return;
        }

        const { work_orders, all_workstations } = data.message;

        // 🔹 Prepare resources (workstations)
        const resources = all_workstations.map(ws => ({
            id: ws,
            title: ws
        }));

        // 🔹 Prepare events (operations) - UPDATED WITH STATUS COLORS
        const events = work_orders.filter(wo => wo.planned_start_time && wo.planned_end_time).map(wo => {
            // Extract only the number from work order (e.g., "MFG-WO-2025-00001" -> "00001")
            const woNumber = wo.work_order.split('-').pop() || wo.work_order;
            
            // ✅ Get status from final_status, operation_status, or work_order_status
            const status = wo.final_status || wo.operation_status || wo.work_order_status || wo.status || "Not Started";
            
            // ✅ Status-based colors
            let backgroundColor;
            if (status === "In Process" || status === "Started") {
                backgroundColor = "#10b981"; // 🟢 Green
            } else if (status === "Stopped") {
                backgroundColor = "#ef4444"; // 🔴 Red
            } else if (status === "Not Started" || status === "Paused" || status === "Pending") {
                backgroundColor = "#ef4444"; // 🔴 Red
            } else if (status === "Completed") {
                backgroundColor = "#3b82f6"; // 🔵 Blue
            } else if (status === "Cancelled") {
                backgroundColor = "#f59e0b"; // 🟠 Orange
            } else if (status === "Draft") {
                backgroundColor = "#9ca3af"; // ⚫ Gray
            } else {
                backgroundColor = "#6b7280"; // ⚫ Dark Gray
            }
            
            return {
                id: wo.operation_id,
                resourceId: wo.workstation || all_workstations[0],
                title: woNumber,
                start: wo.planned_start_time,
                end: wo.planned_end_time,
                backgroundColor: backgroundColor,
                borderColor: "#1f2937",
                textColor: "#ffffff",
                extendedProps: {
                    work_order: wo.work_order,
                    operation: wo.operation,
                    workstation: wo.workstation,
                    production_item: wo.production_item,
                    status: status,
                    qty: wo.qty,
                    start_time: moment(wo.planned_start_time).format('DD-MM HH:mm'),
                    end_time: moment(wo.planned_end_time).format('DD-MM HH:mm'),
                    time_in_mins: wo.time_in_mins || 0
                }
            };
        });

        this.render_gantt(resources, events);
    }

    render_gantt(resources, events) {
        $('#gantt-container').html(`
            <link href="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/main.min.css" rel="stylesheet" />
            <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"><\/script>
            <script src="https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.8/index.global.min.js"><\/script>
            <style>
                #calendar {
                    height: 80vh;
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .fc-event {
                    cursor: pointer;
                    border-width: 1px;
                    min-height: 30px;
                }
                .fc-event:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
                .fc-event-main {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 4px 8px !important;
                }
                .fc-event-title {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    text-align: center !important;
                }
                .fc-resource-timeline .fc-resource {
                    font-weight: 600;
                    padding: 6px 10px;
                    font-size: 13px;
                }
                .fc-toolbar-title {
                    font-size: 1.5em !important;
                    font-weight: 600;
                }
                .fc-button {
                    text-transform: capitalize !important;
                }
                .fc-timeline-event {
                    border-radius: 4px;
                }
                .drag-tooltip {
                    position: fixed;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    z-index: 10000;
                    pointer-events: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    line-height: 1.6;
                }
            </style>
            <div id="calendar"></div>
        `);

        setTimeout(() => {
            const calendarEl = document.getElementById('calendar');

            const calendar = new FullCalendar.Calendar(calendarEl, {
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
                initialView: 'resourceTimelineWeek',
                aspectRatio: 1.8,
                editable: true,
                droppable: true,
                eventResizableFromStart: true,
                eventDurationEditable: true,
                nowIndicator: true,
                resourceAreaWidth: '200px',
                resourceAreaHeaderContent: 'Workstation',
                slotMinWidth: 100,
                height: 'auto',
                contentHeight: 'auto',
                
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
                },
                
                views: {
                    resourceTimelineDay: {
                        buttonText: 'Day',
                        slotDuration: '01:00:00',
                        slotLabelFormat: {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: false
                        }
                    },
                    resourceTimelineWeek: {
                        buttonText: 'Week',
                        slotDuration: '24:00:00',
                        slotLabelFormat: [
                            { weekday: 'short', day: 'numeric', month: 'short' }
                        ]
                    },
                    resourceTimelineMonth: {
                        buttonText: 'Month',
                        slotDuration: '24:00:00',
                        slotLabelFormat: {
                            day: 'numeric',
                            weekday: 'short'
                        }
                    }
                },
                
                resources,
                events,

                // ✅ Click to open Work Order
                eventClick: (info) => {
                    frappe.set_route('Form', 'Work Order', info.event.extendedProps.work_order);
                },

                // ✅ Show tooltip while dragging
                eventDragStart: (info) => {
                    const tooltip = $(`<div class="drag-tooltip"></div>`).appendTo('body');
                    
                    $(document).on('mousemove.drag', function(e) {
                        const startDate = moment(info.event.start).format('DD-MM-YYYY HH:mm');
                        const endDate = moment(info.event.end).format('DD-MM-YYYY HH:mm');
                        
                        tooltip.html(`
                            <div><strong>${info.event.extendedProps.work_order}</strong></div>
                            <div style="margin-top: 4px;">Start: ${startDate}</div>
                            <div>End: ${endDate}</div>
                        `).css({
                            left: e.pageX + 15,
                            top: e.pageY + 15,
                            display: 'block'
                        });
                    });
                },

                // ✅ Remove tooltip after drag
                eventDragStop: (info) => {
                    $(document).off('mousemove.drag');
                    $('.drag-tooltip').remove();
                },

                // ✅ Drag event to different workstation or time
                eventDrop: async (info) => {
                    const event = info.event;
                    const resourceId = event.getResources()[0]?.id;

                    try {
                        // Convert to Frappe-compatible datetime format
                        const start_date = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
                        const end_date = moment(event.end).format('YYYY-MM-DD HH:mm:ss');

                        const response = await frappe.call({
                            method: 'galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder',
                            args: {
                                operation_id: event.id,
                                workstation: resourceId,
                                start_date: start_date,
                                end_date: end_date
                            }
                        });

                        if (response.message && response.message.status === 'success') {
                            frappe.show_alert({ 
                                message: `✓ Updated ${event.extendedProps.work_order}`, 
                                indicator: 'green' 
                            });
                        } else {
                            // Revert if failed
                            info.revert();
                            frappe.show_alert({ 
                                message: `✗ Failed to update: ${response.message?.message || 'Unknown error'}`, 
                                indicator: 'red' 
                            });
                        }
                    } catch (error) {
                        info.revert();
                        frappe.show_alert({ 
                            message: `✗ Error: ${error.message}`, 
                            indicator: 'red' 
                        });
                    }
                },

                // ✅ Resize event - visual only, not saved
                eventResize: async (info) => {
                    frappe.show_alert({ 
                        message: `Resize is for viewing only - changes not saved`, 
                        indicator: 'orange' 
                    });
                },

                // ✅ Hover tooltip with details - UPDATED STATUS COLORS
                eventDidMount: (info) => {
                    const props = info.event.extendedProps;
                    const startDate = frappe.datetime.str_to_user(info.event.startStr);
                    const endDate = frappe.datetime.str_to_user(info.event.endStr);
                    
                    // Status color logic
                    let statusColor;
                    if (props.status === 'In Process' || props.status === 'Started') {
                        statusColor = '#10b981'; // Green
                    } else if (props.status === 'Stopped') {
                        statusColor = '#ef4444'; // Red
                    } else if (props.status === 'Not Started' || props.status === 'Paused' || props.status === 'Pending') {
                        statusColor = '#ef4444'; // Red
                    } else if (props.status === 'Completed') {
                        statusColor = '#3b82f6'; // Blue
                    } else if (props.status === 'Cancelled') {
                        statusColor = '#f59e0b'; // Orange
                    } else if (props.status === 'Draft') {
                        statusColor = '#9ca3af'; // Gray
                    } else {
                        statusColor = '#6b7280'; // Dark Gray
                    }
                    
                    $(info.el).tooltip({
                        title: `
                            <div style="text-align: left; padding: 5px;">
                                <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                                    ${props.work_order}
                                </div>
                                <div style="margin: 4px 0;"><strong>Product:</strong> ${props.production_item}</div>
                                <div style="margin: 4px 0;"><strong>Operation:</strong> ${props.operation}</div>
                                <div style="margin: 4px 0;"><strong>Workstation:</strong> ${props.workstation}</div>
                                <div style="margin: 4px 0;"><strong>Qty:</strong> ${props.qty}</div>
                                <div style="margin: 4px 0;"><strong>Time:</strong> ${props.time_in_mins} minutes</div>
                                <div style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${statusColor};">⬤ ${props.status}</span></div>
                                <div style="margin: 4px 0; margin-top: 8px; padding-top: 5px; border-top: 1px solid #ddd;">
                                    <div><strong>Start:</strong> ${startDate}</div>
                                    <div><strong>End:</strong> ${endDate}</div>
                                </div>
                            </div>
                        `,
                        html: true,
                        container: 'body',
                        placement: 'top',
                        boundary: 'window'
                    });
                }
            });

            calendar.render();
        }, 400);
    }
}