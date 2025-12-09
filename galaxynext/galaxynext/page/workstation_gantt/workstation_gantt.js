// ===== PAGE INITIALIZATION =====
// This function is automatically called by Frappe when the page loads
frappe.pages["workstation-gantt"].on_page_load = function (wrapper) {
	new WorkstationGantt(wrapper);
};

// ===== MAIN CLASS =====
class WorkstationGantt {
	constructor(wrapper) {
		// Initialize properties
		this.default_company = null;      // User's default company (from backend)
		this.current_company = null;      // Currently selected company in filter
		this.all_work_orders = [];        // Complete list of work orders from backend
		this.work_order_names = [];       // Work order names for autocomplete
		
		// Create the Frappe page structure
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: "Work Order Gantt View",
			single_column: true,
		});
		
		this.wrapper = wrapper;
		this.activeTooltips = new Map();  // Track active tooltips for cleanup
		this.currentTimeSlot = 30;        // Default time slot (30 minutes)
		
		// Store instance globally for access from other functions
		window.currentGanttInstance = this;
		
		// Start rendering the page
		this.render();
		
		// Setup cleanup handlers for tooltips
		this.setupCleanup();
	}

	// ===== CLEANUP HANDLERS =====
	// Prevents memory leaks by removing tooltips when navigating away
	setupCleanup() {
		// Cleanup when navigating to different page
		const routeChangeHandler = () => {
			if (!window.location.hash.includes("workstation-gantt")) {
				this.cleanupAllTooltips();
			}
		};

		window.addEventListener("hashchange", routeChangeHandler);
		
		// Cleanup before page unload
		window.addEventListener("beforeunload", () => {
			this.cleanupAllTooltips();
		});

		// Hide tooltips when clicking outside calendar
		document.addEventListener("click", (e) => {
			if (!e.target.closest("#calendar") && !e.target.closest(".fc-event")) {
				this.hideAllTooltips();
			}
		});

		this.cleanupHandlers = {
			routeChange: routeChangeHandler,
		};
	}

	// Remove all tooltip elements from DOM
	cleanupAllTooltips() {
		const tooltips = document.querySelectorAll(".gantt-custom-tooltip");
		tooltips.forEach((t) => {
			if (t.parentNode) {
				t.parentNode.removeChild(t);
			}
		});

		if (this.activeTooltips) {
			this.activeTooltips.clear();
		}
	}

	// Hide all tooltips without removing them
	hideAllTooltips() {
		const tooltips = document.querySelectorAll(".gantt-custom-tooltip");
		tooltips.forEach((t) => {
			t.style.display = "none";
		});
	}

	// ===== RENDER PAGE STRUCTURE =====
	async render() {
		// Create main container div
		const container = $(
			`<div style="padding: 0px;">
                <div id="gantt-container"></div>
            </div>`
		).appendTo(this.page.main);

		// Load data from backend
		await this.load_data();
	}

	// ===== LOAD DATA FROM BACKEND =====
	async load_data() {
		// Show loading message
		frappe.show_alert({ message: "Loading Gantt View...", indicator: "blue" });

		// Call Python function to get work orders
		const data = await frappe.call({
			method: "galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders",
		});

		// Handle errors
		if (!data.message || data.message.error) {
			frappe.msgprint("Error loading work orders");
			return;
		}

		// Extract data from response
		const { work_orders, all_workstations, companies, company, work_order_names } =
			data.message;

		// Store data in class properties
		this.all_work_orders = work_orders;
		this.work_order_names = work_order_names || [];
		this.default_company = company;
		this.current_company = company;

		// Debug logging
		console.log("===== DATA LOADED =====");
		console.log("Default Company:", this.default_company);
		console.log("Total Work Orders from Backend:", this.all_work_orders.length);
		console.log("Work Order Names for Autocomplete:", this.work_order_names.length);

		// Prepare resources (workstations) for FullCalendar
		const resources = all_workstations.map((ws) => ({
			id: ws,
			title: ws,
		}));

		// Prepare events (work order operations) for FullCalendar
		const events = this.prepareEvents(this.current_company, all_workstations);

		// Render the Gantt chart
		this.render_gantt(resources, events, companies);
	}

	// ===== REFRESH WORK ORDERS FROM BACKEND =====
	// Called when user clicks Refresh button
	async refreshWorkOrders() {
		try {
			const data = await frappe.call({
				method: "galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders",
			});

			if (data.message && !data.message.error) {
				this.all_work_orders = data.message.work_orders;
				this.work_order_names = data.message.work_order_names || [];
				console.log("Work orders refreshed:", this.all_work_orders.length);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error refreshing work orders:", error);
			return false;
		}
	}

	// ===== FETCH WORK ORDERS (ALTERNATIVE METHOD) =====
	async fetchWorkOrders() {
		return await frappe
			.call({
				method: "galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.get_workorders",
				freeze: false,
			})
			.then((r) => r.message);
	}

	// ===== DETERMINE ACTUAL STATUS =====
	// Maps docstatus + status to a single consistent status
	getActualStatus(wo) {
		if (wo.docstatus === 0) {
			return "Draft";
		}

		if (wo.docstatus === 1) {
			if (wo.status === "Not Started" || wo.status === "Submitted") {
				return "Not Started";
			} else if (wo.status === "In Process") {
				return "In Process";
			} else if (wo.status === "Stopped") {
				return "Stopped";
			} else if (wo.status === "Completed") {
				return "Completed";
			} else if (wo.status === "Closed") {
				return "Closed";
			} else {
				return "Not Started";
			}
		}

		if (wo.docstatus === 2) {
			return "Cancelled";
		}

		return "Draft";
	}

	// ===== GET STATUS COLORS =====
	// Returns background and border colors for each status
	getStatusColors(actualStatus) {
		let backgroundColor, borderColor;

		switch (actualStatus) {
			case "Draft":
				backgroundColor = "#9ca3af";  // Gray
				borderColor = "#6b7280";
				break;
			case "Not Started":
				backgroundColor = "#fdba74";  // Orange
				borderColor = "#fb923c";
				break;
			case "In Process":
				backgroundColor = "#93c5fd";  // Blue
				borderColor = "#60a5fa";
				break;
			case "Stopped":
				backgroundColor = "#fca5a5";  // Red
				borderColor = "#f87171";
				break;
			case "Completed":
				backgroundColor = "#86efac";  // Green
				borderColor = "#4ade80";
				break;
			case "Cancelled":
				backgroundColor = "#e5e7eb";  // Light gray
				borderColor = "#9ca3af";
				break;
			default:
				backgroundColor = "#9ca3af";
				borderColor = "#6b7280";
		}

		return { backgroundColor, borderColor };
	}

	// ===== PREPARE EVENTS FOR FULLCALENDAR =====
	// Converts work orders to FullCalendar event format
	prepareEvents(filterCompany, all_workstations) {
		let filteredWO = this.all_work_orders;

		// Filter by company if selected
		if (filterCompany && filterCompany !== "All") {
			filteredWO = this.all_work_orders.filter((wo) => wo.company === filterCompany);
		}

		console.log(`Filtering for company: ${filterCompany}`);
		console.log(`Work Orders after company filter: ${filteredWO.length}`);

		// Convert each work order to event format
		const events = filteredWO
			.filter((wo) => wo.status !== "Completed" && wo.status !== "Closed")
			.map((wo, index) => {
				// Extract work order number (last part after -)
				const woNumber = wo.work_order.split("-").pop() || wo.work_order;
				const displayTitle = woNumber;

				// Use planned times if available, otherwise generate default times
				let startTime = wo.planned_start_time;
				let endTime = wo.planned_end_time;
				let hasPlannedTimes = !!(wo.planned_start_time && wo.planned_end_time);

				// Generate default times if not available
				if (!startTime || !endTime) {
					const baseDate = new Date();
					baseDate.setHours(8, 0, 0, 0);  // Start at 8 AM
					const offsetHours = index * 2;   // Stagger by 2 hours each
					startTime = new Date(baseDate.getTime() + offsetHours * 3600000).toISOString();
					endTime = new Date(
						baseDate.getTime() + (offsetHours + 1) * 3600000
					).toISOString();
				}

				// Get status and colors
				const actualStatus = this.getActualStatus(wo);
				const { backgroundColor, borderColor } = this.getStatusColors(actualStatus);

				// Return event object
				return {
					id: wo.operation_id || `temp_${wo.work_order}_${index}`,
					resourceId: wo.workstation || all_workstations[0] || "Unassigned",
					title: displayTitle,
					start: startTime,
					end: endTime,
					backgroundColor: backgroundColor,
					borderColor: borderColor,
					textColor: "#ffffff",
					extendedProps: {
						work_order: wo.work_order,
						operation: wo.operation || "Not Set",
						workstation: wo.workstation || "Not Assigned",
						production_item: wo.production_item || "N/A",
						status: actualStatus,
						docstatus: wo.docstatus,
						qty: wo.qty || 0,
						time_in_mins: wo.time_in_mins || 0,
						has_planned_times: hasPlannedTimes,
						operation_id: wo.operation_id,
						company: wo.company || "All",
					},
				};
			});

		console.log("Events created:", events.length);
		return events;
	}

	// ===== RENDER GANTT CHART HTML =====
	render_gantt(resources, events, companies) {
		// Build HTML structure with legend and filters
		const html = `
		<div class="gantt-main"> 
            <!-- Status Legend -->
            <div class="gantt-legend">
                <div class="legend-items">
                    <div class="legend-item" data-status="Draft">
                        <div class="legend-color" style="background: #9ca3af;"></div>
                        <span>Draft</span>
                    </div>
                    <div class="legend-item" data-status="Not Started">
                        <div class="legend-color" style="background: #fdba74;"></div>
                        <span>Not Started</span>
                    </div>
                    <div class="legend-item" data-status="In Process">
                        <div class="legend-color" style="background: #93c5fd;"></div>
                        <span>In Process</span>
                    </div>
                    <div class="legend-item" data-status="Stopped">
                        <div class="legend-color" style="background: #fca5a5;"></div>
                        <span>Stopped</span>
                    </div>
                </div>
            </div>
            
            <!-- Filter Controls -->
            <div class="gantt-filters">
                <!-- Work Order Search with Autocomplete -->
                <div class="filter-group" style="position: relative;">
                    <label>Work Order:</label>
                    <input type="text" id="filter-wo-id" placeholder="Search..." autocomplete="off">
                    <div id="wo-suggestions" class="wo-suggestions"></div>
                </div>
                
                <!-- Status Filter -->
                <div class="filter-group">
                    <label>Status:</label>
                    <select id="filter-status">
                        <option value="">All</option>
                        <option value="Draft">Draft</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Process">In Process</option>
                        <option value="Stopped">Stopped</option>
                    </select>
                </div>
                
                <!-- Company Filter -->
                <div class="filter-group">
                    <label>Company:</label>
                    <select id="filter-company">
                    </select>
                </div>
                
                <!-- Time Slot Filter (Day view only) -->
                <div class="filter-group">
                    <label>Time Slot:</label>
                    <select id="filter-timeslot">
                        <option value="15">15 mins</option>
                        <option value="30" selected>30 mins</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>
                
                <!-- Action Buttons -->
                <button class="filter-clear-btn" id="apply-filters">Apply</button>
                <button class="filter-clear-btn" id="clear-filters" style="background: #6b7280; margin-left: 5px;">Clear</button>
                <button class="filter-clear-btn refresh-btn" id="refresh-gantt" style="background: #059669; margin-left: 5px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                    Refresh
                </button>
            </div>
		</div>
            <!-- FullCalendar Container -->
            <div id="calendar"></div>
        `;

		$("#gantt-container").html(html);

		// ===== POPULATE COMPANY DROPDOWN =====
		const companySelect = document.getElementById("filter-company");
		companySelect.innerHTML = "";

		// Add "All" option
		const allOption = document.createElement("option");
		allOption.value = "All";
		allOption.textContent = "All";
		companySelect.appendChild(allOption);

		// Add company options
		if (companies && companies.length > 0) {
			companies.forEach((comp) => {
				const option = document.createElement("option");
				option.value = comp;
				option.textContent = comp;
				companySelect.appendChild(option);
			});
		}

		// Set default company
		companySelect.value = this.current_company;

		// Setup autocomplete functionality
		this.setupWorkOrderAutocomplete();

		// ===== LOAD FULLCALENDAR LIBRARY =====
		// Helper function to load scripts dynamically
		const loadScript = (src) => {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = src;
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		};

		// Load FullCalendar libraries
		loadScript("https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js")
			.then(() =>
				loadScript(
					"https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@6.1.11/index.global.min.js"
				)
			)
			.then(() => {
				console.log("FullCalendar loaded successfully");
				// Initialize calendar after short delay
				setTimeout(() => {
					this.init_calendar(resources, events);
				}, 500);
			})
			.catch((error) => {
				console.error("Error loading FullCalendar:", error);
				frappe.msgprint("Error loading calendar library. Please refresh the page.");
			});
	}

	// ===== SETUP WORK ORDER AUTOCOMPLETE =====
	setupWorkOrderAutocomplete() {
		const input = document.getElementById("filter-wo-id");
		const suggestionsBox = document.getElementById("wo-suggestions");

		if (!input || !suggestionsBox) return;

		// Show suggestions as user types
		input.addEventListener("input", (e) => {
			const value = e.target.value.toLowerCase().trim();

			// Hide suggestions if input is empty
			if (!value) {
				suggestionsBox.innerHTML = "";
				suggestionsBox.classList.remove("active");
				return;
			}

			// Filter work order names
			const filtered = this.work_order_names
				.filter((wo) => wo.toLowerCase().includes(value))
				.slice(0);  // Get all matches

			// Show filtered suggestions
			if (filtered.length > 0) {
				suggestionsBox.innerHTML = filtered
					.map((wo) => `<div class="wo-suggestion-item" data-wo="${wo}">${wo}</div>`)
					.join("");
				suggestionsBox.classList.add("active");

				// Add click handler to each suggestion
				suggestionsBox.querySelectorAll(".wo-suggestion-item").forEach((item) => {
					item.addEventListener("click", () => {
						input.value = item.getAttribute("data-wo");
						suggestionsBox.innerHTML = "";
						suggestionsBox.classList.remove("active");
					});
				});
			} else {
				// Show "no results" message
				suggestionsBox.innerHTML =
					'<div class="wo-suggestion-item" style="color: #999;">No matching work orders</div>';
				suggestionsBox.classList.add("active");
			}
		});

		// Hide suggestions when clicking outside
		document.addEventListener("click", (e) => {
			if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
				suggestionsBox.innerHTML = "";
				suggestionsBox.classList.remove("active");
			}
		});

		// Keyboard navigation support
		input.addEventListener("keydown", (e) => {
			const items = suggestionsBox.querySelectorAll(".wo-suggestion-item");
			if (!items.length) return;

			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
			} else if (e.key === "Enter") {
				// Select first suggestion on Enter
				const firstItem = items[0];
				if (firstItem && firstItem.getAttribute("data-wo")) {
					input.value = firstItem.getAttribute("data-wo");
					suggestionsBox.innerHTML = "";
					suggestionsBox.classList.remove("active");
				}
			} else if (e.key === "Escape") {
				// Hide suggestions on Escape
				suggestionsBox.innerHTML = "";
				suggestionsBox.classList.remove("active");
			}
		});
	}

	// ===== INITIALIZE FULLCALENDAR =====
	init_calendar(resources, events) {
		const calendarEl = document.getElementById("calendar");
		if (!calendarEl) {
			console.error("Calendar element not found!");
			return;
		}

		if (typeof FullCalendar === "undefined") {
			console.error("FullCalendar not loaded!");
			frappe.msgprint("Calendar library not loaded. Please refresh the page.");
			return;
		}

		console.log("Initializing calendar with", events.length, "events");

		// ===== CREATE FULLCALENDAR INSTANCE =====
		const calendar = new FullCalendar.Calendar(calendarEl, {
			schedulerLicenseKey: "GPL-My-Project-Is-Open-Source",  // Open source license
			initialView: "resourceTimelineDay",  // Default view
			aspectRatio: 1.8,                    // Width to height ratio
			displayEventTime: false,             // Don't show time in event title
			editable: true,                      // Allow drag and drop
			eventResizableFromStart: true,       // Allow resize from start
			nowIndicator: true,                  // Show current time line
			resourceAreaWidth: "200px",          // Width of workstation column
			resourceAreaHeaderContent: "Workstation",  // Header text
			slotMinWidth: 80,                    // Minimum width of time slots
			height: "auto",                      // Auto height

			// ===== HEADER TOOLBAR =====
			headerToolbar: {
				left: "prev,next today",
				center: "title",
				right: "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
			},

			// ===== VIEW CONFIGURATIONS =====
			views: {
				resourceTimelineDay: {
					buttonText: "Day",
					slotDuration: "00:30:00",        // 30 minute slots
					slotLabelInterval: "00:30:00",
					slotLabelFormat: {
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
					},
				},
				resourceTimelineWeek: {
					buttonText: "Week",
					slotDuration: { days: 1 },       // 1 day slots
					slotLabelFormat: {
						weekday: "short",
						day: "numeric",
						month: "short",
					},
				},
				resourceTimelineMonth: {
					buttonText: "Month",
					slotDuration: "24:00:00",        // 1 day slots
					slotLabelInterval: "24:00:00",
					slotLabelFormat: {
						day: "numeric",
						weekday: "short",
					},
				},
			},

			// ===== DATA =====
			resources: resources,  // Workstations
			events: events,        // Work order operations

			// ===== EVENT HANDLERS =====
			
			// When user clicks on an event
			eventClick: (info) => {
				this.hideAllTooltips();
				// Open Work Order form
				frappe.set_route("Form", "Work Order", info.event.extendedProps.work_order);
			},

			// When user drags an event
			eventDrop: async (info) => {
				await this.handleEventUpdate(info, calendar, resources);
			},

			// When user resizes an event
			eventResize: async (info) => {
				await this.handleEventUpdate(info, calendar, resources);
			},

			// When event is rendered in DOM
			eventDidMount: (info) => {
				// Check if we're on the Gantt page
				const isGanttPage =
					document.querySelector('[data-page-route="workstation-gantt"]') ||
					window.location.pathname.includes("workstation-gantt") ||
					document.getElementById("calendar");

				if (!isGanttPage) {
					return;
				}

				// ===== CREATE CUSTOM TOOLTIP =====
				const eventId = info.event.id;
				const props = info.event.extendedProps;
				const startDate = moment(info.event.start).format("DD-MM-YYYY HH:mm");
				const endDate = moment(info.event.end).format("DD-MM-YYYY HH:mm");

				// Determine status color
				let statusColor = "#f97316";
				if (props.status === "Draft") statusColor = "#6b7280";
				else if (props.status === "In Process") statusColor = "#3b82f6";
				else if (props.status === "Stopped") statusColor = "#ef4444";

				// Create tooltip element
				let tooltip = document.createElement("div");
				tooltip.classList.add("gantt-custom-tooltip");
				tooltip.setAttribute("data-event-id", eventId);
				tooltip.style.cssText = `
					position: fixed;
					z-index: 999999;
					background: #fff;
					padding: 12px;
					border-radius: 8px;
					box-shadow: 0 4px 12px rgba(0,0,0,0.15);
					display: none;
					pointer-events: none;
					max-width: 300px;
					font-size: 13px;
					line-height: 1.5;
					border: 1px solid #e5e7eb;
				`;

				// Tooltip content
				tooltip.innerHTML = `
					<div class="tooltip-header" style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">${
						props.work_order
					}</div>
					<div><strong>Product:</strong> ${props.production_item}</div>
					<div><strong>Operation:</strong> ${props.operation}</div>
					<div><strong>Workstation:</strong> ${props.workstation}</div>
					<div><strong>Company:</strong> ${props.company}</div>
					<div><strong>Status:</strong> <span style="color:${statusColor}">${props.status}</span></div>
					<div><strong>Time:</strong> ${props.time_in_mins || 0} mins</div>
					<hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
					<div><strong>Start:</strong> ${startDate}</div>
					<div><strong>End:</strong> ${endDate}</div>
				`;

				document.body.appendChild(tooltip);
				this.activeTooltips.set(eventId, tooltip);

				// ===== TOOLTIP POSITIONING =====
				const positionTooltip = (e) => {
					const tooltipHeight = tooltip.offsetHeight;
					const tooltipWidth = tooltip.offsetWidth;

					let top = e.clientY + 15;
					let left = e.clientX + 15;

					// Keep tooltip within viewport
					if (top + tooltipHeight > window.innerHeight) {
						top = e.clientY - tooltipHeight - 15;
					}

					if (left + tooltipWidth > window.innerWidth) {
						left = e.clientX - tooltipWidth - 15;
					}

					tooltip.style.top = top + "px";
					tooltip.style.left = left + "px";
				};

				// ===== TOOLTIP EVENT LISTENERS =====
				const mouseenterHandler = (e) => {
					tooltip.style.display = "block";
					positionTooltip(e);
				};

				const mousemoveHandler = (e) => {
					positionTooltip(e);
				};

				const mouseleaveHandler = () => {
					tooltip.style.display = "none";
				};

				info.el.addEventListener("mouseenter", mouseenterHandler);
				info.el.addEventListener("mousemove", mousemoveHandler);
				info.el.addEventListener("mouseleave", mouseleaveHandler);

				// Store cleanup function
				info.el._tooltipCleanup = () => {
					if (tooltip && tooltip.parentNode) {
						tooltip.parentNode.removeChild(tooltip);
					}
					this.activeTooltips.delete(eventId);
				};
			},

			// When event is removed from DOM
			eventWillUnmount: (info) => {
				if (info.el._tooltipCleanup) {
					info.el._tooltipCleanup();
				}
			},
		});

		// Render the calendar
		calendar.render();
		console.log("Calendar rendered successfully");

		// Store calendar instance
		window.currentCalendarInstance = calendar;
		this.currentCalendar = calendar;
		this.currentResources = resources;

		// Setup filter handlers
		this.setup_filters(calendar, resources);
		this.setup_legend_clicks();
	}

	// ===== HANDLE EVENT UPDATE (DRAG/DROP/RESIZE) =====
	async handleEventUpdate(info, calendar, resources) {
		const event = info.event;
		const resourceId = event.getResources()[0]?.id;

		// Check if event has planned times (can't update auto-generated times)
		if (!event.extendedProps.has_planned_times) {
			frappe.show_alert({
				message: `This work order doesn't have planned times`,
				indicator: "orange",
			});
			info.revert();  // Revert the change
			return;
		}

		try {
			// Format dates for backend
			const start_date = moment(event.start).format("YYYY-MM-DD HH:mm:ss");
			const end_date = moment(event.end).format("YYYY-MM-DD HH:mm:ss");

			// Call backend to update operation
			const response = await frappe.call({
				method: "galaxynext.galaxynext.page.workstation_gantt.workstation_gantt.update_workorder",
				args: {
					operation_id: event.extendedProps.operation_id,
					workstation: resourceId,
					start_date: start_date,
					end_date: end_date,
				},
			});

			// Handle success
			if (response.message && response.message.status === "success") {
				// Refresh work orders data
				const refreshed = await this.refreshWorkOrders();

				if (refreshed) {
					// Update event properties
					event.setExtendedProp("workstation", resourceId);

					// Find updated work order
					const updatedWO = this.all_work_orders.find(
						(wo) => wo.operation_id === event.extendedProps.operation_id
					);

					if (updatedWO) {
						event.setExtendedProp("workstation", updatedWO.workstation);
					}

					// Recreate tooltip with updated data
					this.recreateEventTooltip(info.el, event);
				}

				frappe.show_alert({
					message: `✓ Updated ${event.extendedProps.work_order} - Times saved`,
					indicator: "green",
				});
			} else {
				// Handle failure - revert changes
				info.revert();
				frappe.show_alert({
					message: `✗ Failed to update`,
					indicator: "red",
				});
			}
		} catch (error) {
			// Handle error - revert changes and show error message
			info.revert();
			frappe.show_alert({
				message: `✗ Error: ${error.message}`,
				indicator: "red",
			});
		}
	}

	// ===== RECREATE EVENT TOOLTIP =====
	// Called after drag/drop to update tooltip with new data
	recreateEventTooltip(eventElement, event) {
		// Check if we're on the Gantt page
		const isGanttPage =
			document.querySelector('[data-page-route="workstation-gantt"]') ||
			document.getElementById("calendar");

		if (!isGanttPage) {
			return;
		}

		// Remove old tooltip
		const eventId = event.id;
		const oldTooltip = this.activeTooltips.get(eventId);
		if (oldTooltip && oldTooltip.parentNode) {
			oldTooltip.parentNode.removeChild(oldTooltip);
			this.activeTooltips.delete(eventId);
		}

		// Get updated event properties
		const props = event.extendedProps;
		const startDate = moment(event.start).format("DD-MM-YYYY HH:mm");
		const endDate = moment(event.end).format("DD-MM-YYYY HH:mm");

		// Determine status color
		let statusColor = "#f97316";
		if (props.status === "Draft") statusColor = "#6b7280";
		else if (props.status === "In Process") statusColor = "#3b82f6";
		else if (props.status === "Stopped") statusColor = "#ef4444";

		// Create new tooltip element
		let tooltip = document.createElement("div");
		tooltip.classList.add("gantt-custom-tooltip");
		tooltip.setAttribute("data-event-id", eventId);
		tooltip.style.cssText = `
			position: fixed;
			z-index: 999999;
			background: #fff;
			padding: 12px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			display: none;
			pointer-events: none;
			max-width: 300px;
			font-size: 13px;
			line-height: 1.5;
			border: 1px solid #e5e7eb;
		`;

		// Tooltip content with updated data
		tooltip.innerHTML = `
			<div class="tooltip-header" style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">${
				props.work_order
			}</div>
			<div><strong>Product:</strong> ${props.production_item}</div>
			<div><strong>Operation:</strong> ${props.operation}</div>
			<div><strong>Workstation:</strong> ${props.workstation}</div>
			<div><strong>Company:</strong> ${props.company}</div>
			<div><strong>Status:</strong> <span style="color:${statusColor}">${props.status}</span></div>
			<div><strong>Time:</strong> ${props.time_in_mins || 0} mins</div>
			<hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
			<div><strong>Start:</strong> ${startDate}</div>
			<div><strong>End:</strong> ${endDate}</div>
		`;

		document.body.appendChild(tooltip);
		this.activeTooltips.set(eventId, tooltip);

		// Tooltip positioning function
		const positionTooltip = (e) => {
			const tooltipHeight = tooltip.offsetHeight;
			const tooltipWidth = tooltip.offsetWidth;

			let top = e.clientY + 15;
			let left = e.clientX + 15;

			if (top + tooltipHeight > window.innerHeight) {
				top = e.clientY - tooltipHeight - 15;
			}
			if (left + tooltipWidth > window.innerWidth) {
				left = e.clientX - tooltipWidth - 15;
			}

			tooltip.style.top = top + "px";
			tooltip.style.left = left + "px";
		};

		// Add event listeners
		eventElement.addEventListener("mouseenter", (e) => {
			tooltip.style.display = "block";
			positionTooltip(e);
		});

		eventElement.addEventListener("mousemove", positionTooltip);

		eventElement.addEventListener("mouseleave", () => {
			tooltip.style.display = "none";
		});
	}

	// ===== SETUP FILTER HANDLERS =====
	setup_filters(calendar, resources) {
		const filterWOId = document.getElementById("filter-wo-id");
		const filterStatus = document.getElementById("filter-status");
		const filterCompany = document.getElementById("filter-company");
		const filterTimeSlot = document.getElementById("filter-timeslot");
		const applyBtn = document.getElementById("apply-filters");
		const clearBtn = document.getElementById("clear-filters");
		const refreshBtn = document.getElementById("refresh-gantt");

		// ===== REFRESH BUTTON HANDLER =====
		if (refreshBtn) {
			refreshBtn.addEventListener("click", async () => {
				// Show refreshing message
				frappe.show_alert({
					message: "Refreshing...",
					indicator: "blue",
				});

				// Refresh work orders from backend
				const success = await this.refreshWorkOrders();

				if (success) {
					// RESET ALL FILTERS
					filterWOId.value = "";
					filterStatus.value = "";
					filterCompany.value = this.default_company;
					
					// Reset time slot to default (30 mins)
					const timeSlotElement = document.getElementById("filter-timeslot");
					if (timeSlotElement) {
						timeSlotElement.value = "30";
						this.currentTimeSlot = 30;
					}

					// Remove legend selection highlighting
					const legendItems = document.querySelectorAll(".legend-item");
					legendItems.forEach((li) => li.classList.remove("legend-selected"));

					// Reset company and regenerate events
					this.current_company = this.default_company;
					const events = this.prepareEvents(this.default_company, resources);

					// Clear calendar and add fresh events
					calendar.getEvents().forEach((e) => e.remove());
					events.forEach((e) => calendar.addEvent(e));

					// Reset calendar view if needed
					if (calendar.view.type === "resourceTimelineDay" && timeSlotElement && timeSlotElement.value !== "30") {
						timeSlotElement.dispatchEvent(new Event("change"));
					}

					// Show success message
					setTimeout(() => {
						frappe.show_alert({
							message: "✓ Page refreshed successfully",
							indicator: "green",
						});
					}, 100);
				} else {
					// Show error message
					setTimeout(() => {
						frappe.show_alert({
							message: "✗ Failed to refresh",
							indicator: "red",
						});
					}, 100);
				}
			});
		}

		// ===== TIME SLOT CHANGE HANDLER =====
		// Only works in Day view
		if (filterTimeSlot) {
			// Remove existing listeners
			const newTimeSlot = filterTimeSlot.cloneNode(true);
			filterTimeSlot.parentNode.replaceChild(newTimeSlot, filterTimeSlot);

			newTimeSlot.addEventListener("change", () => {
				// Check if we're in Day view
				if (calendar.view.type !== "resourceTimelineDay") {
					frappe.show_alert({
						message: "⚠️ Time slot filter only works in Day view",
						indicator: "orange",
					});
					return;
				}

				const timeSlotValue = parseInt(newTimeSlot.value);
				this.currentTimeSlot = timeSlotValue;

				// Format time for FullCalendar (HH:mm:ss)
				const hours = Math.floor(timeSlotValue / 60);
				const minutes = timeSlotValue % 60;
				const slotDuration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
					2,
					"0"
				)}:00`;

				console.log(`⏱️ Time slot changed to: ${timeSlotValue} mins = ${slotDuration}`);

				// Get current view and date
				const currentView = calendar.view.type;
				const currentDate = calendar.getDate();

				// Destroy current calendar
				calendar.destroy();

				// Recreate calendar with new time slot
				const newCalendar = new FullCalendar.Calendar(
					document.getElementById("calendar"),
					{
						schedulerLicenseKey: "GPL-My-Project-Is-Open-Source",
						initialView: currentView,
						initialDate: currentDate,
						aspectRatio: 1.8,
						editable: true,
						eventResizableFromStart: true,
						nowIndicator: true,
						resourceAreaWidth: "200px",
						resourceAreaHeaderContent: "Workstation",
						slotMinWidth: 80,
						height: "auto",

						headerToolbar: {
							left: "prev,next today",
							center: "title",
							right: "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
						},

						views: {
							resourceTimelineDay: {
								buttonText: "Day",
								slotDuration: slotDuration,  // Updated slot duration
								slotLabelInterval: slotDuration,
								slotLabelFormat: {
									hour: "2-digit",
									minute: "2-digit",
									hour12: true,
								},
							},
							resourceTimelineWeek: {
								buttonText: "Week",
								slotDuration: { days: 1 },
								slotLabelFormat: {
									weekday: "short",
									day: "numeric",
									month: "short",
								},
							},
							resourceTimelineMonth: {
								buttonText: "Month",
								slotDuration: "24:00:00",
								slotLabelInterval: "24:00:00",
								slotLabelFormat: {
									day: "numeric",
									weekday: "short",
								},
							},
						},

						resources: resources,
						// Get existing events from old calendar
						events: calendar.getEvents().map((e) => ({
							id: e.id,
							resourceId: e.getResources()[0]?.id,
							title: e.title,
							start: e.start,
							end: e.end,
							backgroundColor: e.backgroundColor,
							borderColor: e.borderColor,
							textColor: e.textColor,
							extendedProps: e.extendedProps,
						})),

						eventClick: (info) => {
							this.hideAllTooltips();
							frappe.set_route(
								"Form",
								"Work Order",
								info.event.extendedProps.work_order
							);
						},

						eventDrop: async (info) => {
							await this.handleEventUpdate(info, newCalendar, resources);
						},

						eventResize: async (info) => {
							await this.handleEventUpdate(info, newCalendar, resources);
						},

						// Re-create tooltips for events
						eventDidMount: (info) => {
							const isGanttPage =
								document.querySelector('[data-page-route="workstation-gantt"]') ||
								window.location.pathname.includes("workstation-gantt") ||
								document.getElementById("calendar");

							if (!isGanttPage) {
								return;
							}

							const eventId = info.event.id;
							const props = info.event.extendedProps;
							const startDate = moment(info.event.start).format("DD-MM-YYYY HH:mm");
							const endDate = moment(info.event.end).format("DD-MM-YYYY HH:mm");

							let statusColor = "#f97316";
							if (props.status === "Draft") statusColor = "#6b7280";
							else if (props.status === "In Process") statusColor = "#3b82f6";
							else if (props.status === "Stopped") statusColor = "#ef4444";

							let tooltip = document.createElement("div");
							tooltip.classList.add("gantt-custom-tooltip");
							tooltip.setAttribute("data-event-id", eventId);
							tooltip.style.cssText = `
							position: fixed;
							z-index: 999999;
							background: #fff;
							padding: 12px;
							border-radius: 8px;
							box-shadow: 0 4px 12px rgba(0,0,0,0.15);
							display: none;
							pointer-events: none;
							max-width: 300px;
							font-size: 13px;
							line-height: 1.5;
							border: 1px solid #e5e7eb;
						`;

							tooltip.innerHTML = `
							<div class="tooltip-header" style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">${
								props.work_order
							}</div>
							<div><strong>Product:</strong> ${props.production_item}</div>
							<div><strong>Operation:</strong> ${props.operation}</div>
							<div><strong>Workstation:</strong> ${props.workstation}</div>
							<div><strong>Company:</strong> ${props.company}</div>
							<div><strong>Status:</strong> <span style="color:${statusColor}">${props.status}</span></div>
							<div><strong>Time:</strong> ${props.time_in_mins || 0} mins</div>
							<hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
							<div><strong>Start:</strong> ${startDate}</div>
							<div><strong>End:</strong> ${endDate}</div>
						`;

							document.body.appendChild(tooltip);

							this.activeTooltips.set(eventId, tooltip);

							const positionTooltip = (e) => {
								const tooltipHeight = tooltip.offsetHeight;
								const tooltipWidth = tooltip.offsetWidth;

								let top = e.clientY + 15;
								let left = e.clientX + 15;

								if (top + tooltipHeight > window.innerHeight) {
									top = e.clientY - tooltipHeight - 15;
								}

								if (left + tooltipWidth > window.innerWidth) {
									left = e.clientX - tooltipWidth - 15;
								}

								tooltip.style.top = top + "px";
								tooltip.style.left = left + "px";
							};

							const mouseenterHandler = (e) => {
								tooltip.style.display = "block";
								positionTooltip(e);
							};

							const mousemoveHandler = (e) => {
								positionTooltip(e);
							};

							const mouseleaveHandler = () => {
								tooltip.style.display = "none";
							};

							info.el.addEventListener("mouseenter", mouseenterHandler);
							info.el.addEventListener("mousemove", mousemoveHandler);
							info.el.addEventListener("mouseleave", mouseleaveHandler);

							info.el._tooltipCleanup = () => {
								if (tooltip && tooltip.parentNode) {
									tooltip.parentNode.removeChild(tooltip);
								}
								this.activeTooltips.delete(eventId);
							};
						},

						eventWillUnmount: (info) => {
							if (info.el._tooltipCleanup) {
								info.el._tooltipCleanup();
							}
						},
					}
				);

				newCalendar.render();

				// Update references
				this.currentCalendar = newCalendar;
				window.currentCalendarInstance = newCalendar;

				// Show success message
				setTimeout(() => {
					frappe.show_alert({
						message: `✓ Time slot: ${timeSlotValue} minutes`,
						indicator: "green",
					});
				}, 100);

				// Re-setup filters for new calendar
				setTimeout(() => {
					this.setup_filters(newCalendar, resources);
					// Ensure time slot dropdown shows correct value
					const timeSlotDropdown = document.getElementById("filter-timeslot");
					if (timeSlotDropdown) {
						timeSlotDropdown.value = timeSlotValue.toString();
					}
				}, 200);
			});
		}

		// ===== APPLY FILTERS BUTTON =====
		if (applyBtn) {
			applyBtn.addEventListener("click", () => {
				const selectedCompany = filterCompany.value;
				const woVal = filterWOId.value.toLowerCase().trim();
				const statusVal = filterStatus.value;

				console.log("===== APPLYING FILTERS =====");
				console.log("Company:", selectedCompany);
				console.log("WO Search:", woVal);
				console.log("Status:", statusVal);

				this.current_company = selectedCompany;

				// Start with company filter
				let companyFiltered = this.all_work_orders;
				if (selectedCompany && selectedCompany !== "All") {
					companyFiltered = this.all_work_orders.filter(
						(wo) => wo.company === selectedCompany
					);
				}

				// Apply work order search filter
				if (woVal) {
					companyFiltered = companyFiltered.filter((wo) =>
						wo.work_order.toLowerCase().includes(woVal)
					);
				}

				// Apply status filter
				if (statusVal) {
					companyFiltered = companyFiltered.filter((wo) => {
						const actualStatus = this.getActualStatus(wo);
						return actualStatus === statusVal;
					});
				}

				// Always exclude Completed and Closed
				companyFiltered = companyFiltered.filter(
					(wo) => wo.status !== "Completed" && wo.status !== "Closed"
				);

				// Convert to events
				const events = companyFiltered.map((wo, index) => {
					const woNumber = wo.work_order.split("-").pop() || wo.work_order;

					let startTime = wo.planned_start_time;
					let endTime = wo.planned_end_time;
					let hasPlannedTimes = !!(wo.planned_start_time && wo.planned_end_time);

					if (!startTime || !endTime) {
						const baseDate = new Date();
						baseDate.setHours(8, 0, 0, 0);
						const offsetHours = index * 2;
						startTime = new Date(
							baseDate.getTime() + offsetHours * 3600000
						).toISOString();
						endTime = new Date(
							baseDate.getTime() + (offsetHours + 1) * 3600000
						).toISOString();
					}

					const actualStatus = this.getActualStatus(wo);
					const { backgroundColor, borderColor } = this.getStatusColors(actualStatus);

					return {
						id: wo.operation_id || `temp_${wo.work_order}_${index}`,
						resourceId: wo.workstation || resources[0]?.id || "Unassigned",
						title: woNumber,
						start: startTime,
						end: endTime,
						backgroundColor: backgroundColor,
						borderColor: borderColor,
						textColor: "#ffffff",
						extendedProps: {
							work_order: wo.work_order,
							operation: wo.operation || "Not Set",
							workstation: wo.workstation || "Not Assigned",
							production_item: wo.production_item || "N/A",
							status: actualStatus,
							docstatus: wo.docstatus,
							qty: wo.qty || 0,
							time_in_mins: wo.time_in_mins || 0,
							has_planned_times: hasPlannedTimes,
							operation_id: wo.operation_id,
							company: wo.company || "All",
						},
					};
				});

				// Update calendar
				calendar.getEvents().forEach((e) => e.remove());
				events.forEach((e) => calendar.addEvent(e));

				// Navigate to first event if available
				if (events.length > 0) {
					const firstEvent = events[0];
					const eventDate = new Date(firstEvent.start);
					calendar.gotoDate(eventDate);

					frappe.show_alert({
						message: `Showing ${events.length} work orders`,
						indicator: "green",
					});
				} else {
					frappe.show_alert({
						message: `No matching work orders found`,
						indicator: "orange",
					});
				}
			});
		}

		// ===== CLEAR FILTERS BUTTON =====
		if (clearBtn) {
			clearBtn.addEventListener("click", () => {
				// Reset all filter inputs
				filterWOId.value = "";
				filterStatus.value = "";
				filterCompany.value = this.default_company;

				// Reset time slot to default
				const timeSlotElement = document.getElementById("filter-timeslot");
				if (timeSlotElement) {
					timeSlotElement.value = "30";
					this.currentTimeSlot = 30;
				}

				// Reset time slot in Day view if needed
				if (
					calendar.view.type === "resourceTimelineDay" &&
					timeSlotElement &&
					timeSlotElement.value !== "30"
				) {
					// Trigger change event to recreate calendar
					timeSlotElement.dispatchEvent(new Event("change"));
					return; // Let the change handler do the rest
				}

				// Remove legend selection
				const legendItems = document.querySelectorAll(".legend-item");
				legendItems.forEach((li) => li.classList.remove("legend-selected"));

				// Reset to default company
				this.current_company = this.default_company;
				const events = this.prepareEvents(this.default_company, resources);

				// Update calendar
				calendar.getEvents().forEach((e) => e.remove());
				events.forEach((e) => calendar.addEvent(e));

				frappe.show_alert({
					message: "✓ Filters cleared",
					indicator: "blue",
				});
			});
		}
	}

	// ===== SETUP LEGEND CLICK HANDLERS =====
	// Allows filtering by clicking on legend items
	setup_legend_clicks() {
		const legendItems = document.querySelectorAll(".legend-item");
		const filterStatus = document.getElementById("filter-status");
		const applyBtn = document.getElementById("apply-filters");

		legendItems.forEach((item) => {
			item.addEventListener("click", () => {
				const status = item.getAttribute("data-status");

				// Set the status filter
				filterStatus.value = status;

				// Highlight the selected legend item
				legendItems.forEach((li) => li.classList.remove("legend-selected"));
				item.classList.add("legend-selected");

				// Trigger filter application
				applyBtn.click();

				frappe.show_alert({
					message: `Filtering by status: ${status}`,
					indicator: "blue",
				});
			});
		});
	}
}