console.log("Student Progress Tracker is ready!");

function renderGlobalNavigation() {
    const pages = [
        { label: "Dashboard", href: "spt.html", icon: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>" },
        { label: "Task Manager", href: "task.html", icon: "<path d=\"M9 6h12M9 12h12M9 18h12\"/><path d=\"m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2\"/>" },
        { label: "Progress Journal", href: "journal.html", icon: "<path d=\"M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z\"/><path d=\"M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h8\"/>" },
        { label: "Project Reports", href: "reports.html", icon: "<path d=\"M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18\"/>" },
        { label: "Documents", href: "document.html", icon: "<path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/>" },
        { label: "Data Management", href: "data-management.html", icon: "<ellipse cx=\"10\" cy=\"5\" rx=\"7\" ry=\"3\"/><path d=\"M3 5v10c0 1.7 3.1 3 7 3M17 8v3M3 10c0 1.7 3.1 3 7 3M17 14v7M14 18l3 3 3-3\"/>" },
        { label: "AI Assistant", href: "ai-assistant.html", icon: "<path d=\"M12 3 10.5 9.5 4 11l6.5 1.5L12 19l1.5-6.5L20 11l-6.5-1.5Z\"/><path d=\"m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z\"/>" }
    ];
    document.querySelectorAll(".page-header nav").forEach(function (legacyNav) {
        legacyNav.remove();
    });

    document.querySelectorAll(".menu-toggle, .menu-overlay, .mobile-menu-button")
        .forEach(function (oldMenuControl) { oldMenuControl.remove(); });

    const currentPage = window.location.pathname.split("/").pop() || "spt.html";
    const activePage = currentPage;
    const icon = function (contents) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "1.8");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML = contents;
        return svg;
    };
    const header = document.createElement("header");
    header.className = "global-navigation";
    header.id = "global-navigation";

    const brand = document.createElement("a");
    brand.className = "global-brand";
    brand.href = "spt.html";
    brand.innerHTML = "<span class=\"global-brand-mark\">P</span><span>ProjectTrack</span>";

    const menuToggle = document.createElement("button");
    menuToggle.className = "global-menu-toggle";
    menuToggle.type = "button";
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.appendChild(icon("<path d=\"M4 6h16M4 12h16M4 18h16\"/>"));

    const nav = document.createElement("nav");
    nav.className = "global-navigation-links";
    nav.id = "global-navigation-links";
    nav.setAttribute("aria-label", "Main navigation");

    pages.forEach(function (page) {
        const link = document.createElement("a");
        link.className = "global-nav-link";
        link.href = page.href;
        link.dataset.page = page.href;
        link.appendChild(icon(page.icon));
        const label = document.createElement("span");
        label.textContent = page.label;
        link.appendChild(label);

        if (page.href === activePage) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }

        nav.appendChild(link);
    });

    const tools = document.createElement("div");
    tools.className = "global-nav-tools";

    const search = document.createElement("div");
    search.className = "global-search";
    const searchToggle = document.createElement("button");
    searchToggle.className = "global-icon-button global-search-toggle";
    searchToggle.type = "button";
    searchToggle.setAttribute("aria-label", "Search tasks");
    searchToggle.appendChild(icon("<circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\"/><path d=\"m16 16 4.5 4.5\"/>"));
    const searchInput = document.createElement("input");
    searchInput.id = "workspace-search";
    searchInput.type = "search";
    searchInput.setAttribute("aria-label", "Search tasks");
    searchInput.setAttribute("autocomplete", "off");
    search.append(searchToggle, searchInput);
    taskSearchInput = searchInput;

    const initialSearch = new URLSearchParams(window.location.search).get("search");
    if (initialSearch) {
        searchInput.value = initialSearch;
        taskSearchTerm = initialSearch.trim().toLowerCase();
        search.classList.add("is-open");
    }

    const notificationWrap = document.createElement("div");
    notificationWrap.className = "notification-wrap";
    const notificationButton = document.createElement("button");
    notificationButton.className = "notification-button";
    notificationButton.id = "notifications-toggle";
    notificationButton.type = "button";
    notificationButton.setAttribute("aria-label", "Notifications");
    notificationButton.setAttribute("aria-expanded", "false");
    notificationButton.setAttribute("aria-controls", "notifications-panel");
    notificationButton.appendChild(icon("<path d=\"M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9\"/><path d=\"M10 21h4\"/>"));
    const count = document.createElement("span");
    count.className = "notification-count";
    count.id = "notification-count";
    count.hidden = true;
    notificationButton.appendChild(count);

    const notificationPanelElement = document.createElement("section");
    notificationPanelElement.className = "notification-panel";
    notificationPanelElement.id = "notifications-panel";
    notificationPanelElement.setAttribute("aria-label", "Notifications");
    notificationPanelElement.hidden = true;
    notificationPanelElement.innerHTML = "<div class=\"notification-panel-heading\"><h2>Notifications</h2><button class=\"notification-close\" id=\"notifications-close\" type=\"button\" aria-label=\"Close notifications\">×</button></div><div class=\"notification-filter-tabs\" role=\"group\" aria-label=\"Filter notifications\"><button type=\"button\" class=\"selected\" data-notification-filter=\"All\">All</button><button type=\"button\" data-notification-filter=\"Edits\">Edits</button><button type=\"button\" data-notification-filter=\"Alerts\">Alerts</button></div><div class=\"notification-list\" id=\"notification-list\" aria-live=\"polite\"></div>";
    notificationWrap.append(notificationButton, notificationPanelElement);
    notificationToggle = notificationButton;
    notificationPanel = notificationPanelElement;
    notificationsClose = notificationPanelElement.querySelector(".notification-close");
    notificationList = notificationPanelElement.querySelector(".notification-list");
    notificationCount = count;

    notificationPanelElement.querySelectorAll("[data-notification-filter]")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                notificationFilter = button.dataset.notificationFilter || "All";
                notificationPanelElement.querySelectorAll("[data-notification-filter]")
                    .forEach(function (filterButton) {
                        filterButton.classList.toggle("selected", filterButton === button);
                    });
                renderNotifications();
            });
        });

    const themeToggle = document.createElement("button");
    themeToggle.className = "global-icon-button theme-toggle";
    themeToggle.id = "theme-toggle";
    themeToggle.type = "button";
    const applyTheme = function (theme) {
        document.documentElement.dataset.theme = theme;
        const dark = theme === "dark";
        themeToggle.replaceChildren(icon(dark
            ? "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42\"/>"
            : "<path d=\"M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z\"/>"));
        themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
        themeToggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
    };
    let savedTheme = "light";
    try {
        savedTheme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    } catch (error) {
        console.error("Could not load theme preference:", error);
    }
    applyTheme(savedTheme);
    document.documentElement.removeAttribute("data-theme-booting");
    themeToggle.addEventListener("click", function () {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        try {
            localStorage.setItem("theme", nextTheme);
        } catch (error) {
            console.error("Could not save theme preference:", error);
        }
        applyTheme(nextTheme);
    });

    const profileWrap = document.createElement("div");
    profileWrap.className = "global-profile-wrap";
    const profileButton = document.createElement("button");
    profileButton.className = "topbar-avatar global-profile-button";
    profileButton.id = "topbar-avatar";
    profileButton.type = "button";
    profileButton.setAttribute("aria-label", "Open profile menu");
    profileButton.setAttribute("aria-expanded", "false");
    profileButton.setAttribute("aria-controls", "profile-menu");
    profileButton.textContent = "S";
    const profileMenu = document.createElement("div");
    profileMenu.className = "global-profile-menu";
    profileMenu.id = "profile-menu";
    profileMenu.hidden = true;
    profileMenu.innerHTML = "<a href=\"profile.html\">My Profile</a><a href=\"settings.html\">Settings</a><a href=\"profile.html#change-password\">Change Password</a><div class=\"profile-menu-divider\"></div><button type=\"button\" id=\"logout-button\">Log Out</button>";
    profileWrap.append(profileButton, profileMenu);

    tools.append(search, notificationWrap, themeToggle, profileWrap);
    header.append(brand, menuToggle, nav, tools);
    document.body.prepend(header);

    const logoutDialog = document.createElement("dialog");
    logoutDialog.className = "logout-dialog";
    logoutDialog.id = "logout-dialog";
    logoutDialog.innerHTML = "<h2>Log out?</h2><p>Are you sure you want to log out?</p><p class=\"logout-warning\">Logging out clears tasks, journal entries, documents, and settings saved in this browser.</p><div class=\"logout-dialog-actions\"><button type=\"button\" id=\"logout-cancel\">Cancel</button><button type=\"button\" id=\"logout-confirm\">Log Out</button></div>";
    document.body.appendChild(logoutDialog);

    menuToggle.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    searchToggle.addEventListener("click", function () {
        const isOpen = search.classList.toggle("is-open");
        if (isOpen) searchInput.focus();
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            searchInput.value = "";
            searchInput.blur();
            search.classList.remove("is-open");
            taskSearchTerm = "";
            applyTaskListFilters();
        }

        if (event.key === "Enter" && !taskList && searchInput.value.trim()) {
            window.location.href = "spt.html?search=" +
                encodeURIComponent(searchInput.value.trim()) + "#tasks";
        }
    });

    profileButton.addEventListener("click", function () {
        const isOpen = profileMenu.hidden;
        profileMenu.hidden = !isOpen;
        profileButton.setAttribute("aria-expanded", String(isOpen));
    });

    const logoutButton = profileMenu.querySelector("#logout-button");
    logoutButton.addEventListener("click", function () {
        profileMenu.hidden = true;
        profileButton.setAttribute("aria-expanded", "false");
        logoutDialog.showModal();
    });

    logoutDialog.querySelector("#logout-cancel").addEventListener("click", function () {
        logoutDialog.close();
    });

    logoutDialog.querySelector("#logout-confirm").addEventListener("click", function () {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "login.html";
    });

    const profileLogoutButton = document.getElementById("profile-logout-button");
    if (profileLogoutButton) {
        profileLogoutButton.addEventListener("click", function () {
            logoutDialog.showModal();
        });
    }

    document.addEventListener("click", function (event) {
        if (!profileWrap.contains(event.target)) {
            profileMenu.hidden = true;
            profileButton.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !profileMenu.hidden) {
            profileMenu.hidden = true;
            profileButton.setAttribute("aria-expanded", "false");
            profileButton.focus();
        }
    });

    const globalNav = document.getElementById("global-navigation-links");
    globalNav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            nav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// =========================================
// 1. SELECT HTML ELEMENTS
// =========================================

const taskForm = document.getElementById("task-form");
let editingTaskId = null;
const taskFormSection = document.getElementById("task-form-section");
const openTaskButton = document.getElementById("open-task-form");
const cancelTaskButton = document.getElementById("cancel-task");
const taskList = document.getElementById("task-list");
const saveTaskDraftButton = document.getElementById("save-task-draft");
const taskDraftBanner = document.getElementById("task-draft-banner");
const restoreTaskDraftButton = document.getElementById("restore-task-draft");
const discardTaskDraftButton = document.getElementById("discard-task-draft");
const taskStageInput = document.getElementById("task-stage");
const taskCountBadge = document.getElementById("task-count-badge");
let taskSearchInput = null;
const filterButtons = document.querySelectorAll(".filter-button");
let notificationToggle = null;
let notificationPanel = null;
let notificationList = null;
let notificationCount = null;
let notificationsClose = null;
const activityList = document.getElementById("activity-list");
const refreshActivityButton = document.getElementById("refresh-activity");
const taskFormHeading = document.getElementById("task-form-heading");
const taskSubmitButton = taskForm
    ? taskForm.querySelector('button[type="submit"]')
    : null;
const defaultTaskFormHeading = taskFormHeading
    ? taskFormHeading.textContent
    : "Create a Task";
const defaultTaskSubmitText = taskSubmitButton
    ? taskSubmitButton.textContent
    : "Save Task";
let selectedTaskFilter = "All";
let taskSearchTerm = "";
let notificationFilter = "All";
let taskDraft = null;
let taskDraftSaveTimer = null;

function createStageIcon(stage) {
    const icon = document.createElement("span");
    const icons = {
        Planning: "📋",
        Research: "🔍",
        Design: "📋",
        Development: "🚀",
        Testing: "🔍",
        Documentation: "✅",
        Implementation: "🚀",
        Review: "🔍",
        Completed: "✅"
    };
    icon.className = "stage-icon-3d";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = icons[stage] || icons.Planning;
    return icon;
}

renderGlobalNavigation();

function getStudentSubmissionMetadata() {
    try {
        const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
        const project = JSON.parse(localStorage.getItem("spt-project-settings")) || {};
        return {
            studentMatric: student["matric-number"] || "",
            studentName: student["student-name"] || "Student",
            projectTitle: project["project-title"] || "Project title not set",
            supervisorId: project["supervisor-id"] || project["supervisor-name"] || "",
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error("Could not load student submission details:", error);
        return { studentMatric: "", studentName: "Student", projectTitle: "Project title not set", supervisorId: "", createdAt: new Date().toISOString() };
    }
}

function setTaskFormMode(taskId = null) {
    editingTaskId = taskId;

    if (taskFormHeading) {
        taskFormHeading.textContent = taskId === null
            ? defaultTaskFormHeading
            : "Edit Task";
    }

    if (taskSubmitButton) {
        taskSubmitButton.textContent = taskId === null
            ? defaultTaskSubmitText
            : "Save Changes";
    }
}

// =========================================
// 2. LOAD SAVED TASKS
// =========================================

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("spt-tasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks;
    }
} catch (error) {
    console.error("Could not load tasks:", error);
}

let recentActivity = [];

try {
    const savedActivity = JSON.parse(localStorage.getItem("spt-activity"));

    if (Array.isArray(savedActivity)) {
        recentActivity = savedActivity.filter(function (entry) {
            return entry && typeof entry.action === "string" &&
                typeof entry.title === "string";
        });
    }
} catch (error) {
    console.error("Could not load recent activity:", error);
}

try {
    const savedDraft = JSON.parse(
        localStorage.getItem("draft_task") || localStorage.getItem("task_draft")
    );
    if (savedDraft && typeof savedDraft === "object" && !Array.isArray(savedDraft) &&
        Date.now() - Number(savedDraft.timestamp || Date.parse(savedDraft.savedAt) || Date.now()) <
            24 * 60 * 60 * 1000) {
        taskDraft = Object.assign({}, savedDraft.formData || savedDraft, savedDraft);
    } else if (savedDraft) {
        localStorage.removeItem("draft_task");
        localStorage.removeItem("task_draft");
    }
} catch (error) {
    console.error("Could not load task draft:", error);
    localStorage.removeItem("draft_task");
    localStorage.removeItem("task_draft");
}

// =========================================
// 3. SAVE TASKS
// =========================================

function saveTasks() {
    try {
        localStorage.setItem("spt-tasks", JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Unable to save your changes. Please try again.");
        return false;
    }
}

function renderRecentActivity() {
    if (!activityList) return;

    activityList.replaceChildren();

    if (recentActivity.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "activity-empty";
        emptyMessage.textContent = "No recent activity yet. Your task updates will appear here.";
        activityList.appendChild(emptyMessage);
        return;
    }

    recentActivity.slice(0, 8).forEach(function (entry) {
        const item = document.createElement("div");
        item.className = "deadline-item activity-item";

        const dateBox = document.createElement("div");
        dateBox.className = "date-box";
        const date = new Date(entry.date);
        const month = document.createElement("span");
        const day = document.createElement("strong");
        const validDate = !Number.isNaN(date.getTime());
        month.textContent = validDate
            ? date.toLocaleString("en", { month: "short" }).toUpperCase()
            : "RECENT";
        day.textContent = validDate ? String(date.getDate()).padStart(2, "0") : "--";
        dateBox.append(month, day);

        const details = document.createElement("div");
        details.className = "deadline-details activity-details";
        const title = document.createElement("strong");
        title.textContent = entry.title;

        const action = document.createElement("span");
        action.className = "activity-action";
        action.textContent = entry.action;

        const stage = document.createElement("span");
        stage.className = "activity-stage";
        const stageIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        stageIcon.setAttribute("viewBox", "0 0 24 24");
        stageIcon.setAttribute("fill", "none");
        stageIcon.setAttribute("stroke", "currentColor");
        stageIcon.setAttribute("stroke-width", "1.8");
        stageIcon.setAttribute("stroke-linecap", "round");
        stageIcon.setAttribute("stroke-linejoin", "round");
        stageIcon.setAttribute("aria-hidden", "true");
        stageIcon.innerHTML = "<path d=\"M4 5h16M4 12h16M4 19h16\"/><circle cx=\"8\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"11\" cy=\"19\" r=\"1\"/>";
        stage.append(stageIcon, document.createTextNode(entry.stage || "Planning"));

        const time = document.createElement("time");
        time.className = "activity-time";
        if (validDate) {
            const calendarIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            calendarIcon.setAttribute("viewBox", "0 0 24 24");
            calendarIcon.setAttribute("fill", "none");
            calendarIcon.setAttribute("stroke", "currentColor");
            calendarIcon.setAttribute("stroke-width", "1.8");
            calendarIcon.setAttribute("stroke-linecap", "round");
            calendarIcon.setAttribute("stroke-linejoin", "round");
            calendarIcon.setAttribute("aria-hidden", "true");
            calendarIcon.innerHTML = "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>";
            time.append(calendarIcon, document.createTextNode(
                date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
            ));
        }

        details.append(title, action, stage, time);
        item.append(dateBox, details);
        activityList.appendChild(item);
    });
}

function refreshRecentActivity() {
    try {
        const savedActivity = JSON.parse(localStorage.getItem("spt-activity"));
        recentActivity = Array.isArray(savedActivity)
            ? savedActivity.filter(function (entry) {
                return entry && typeof entry.action === "string" &&
                    typeof entry.title === "string";
            })
            : [];
    } catch (error) {
        console.error("Could not refresh recent activity:", error);
        recentActivity = [];
    }

    renderRecentActivity();

    if (refreshActivityButton) {
        refreshActivityButton.classList.remove("is-refreshing");
        void refreshActivityButton.offsetWidth;
        refreshActivityButton.classList.add("is-refreshing");
        window.setTimeout(function () {
            refreshActivityButton.classList.remove("is-refreshing");
        }, 500);
    }
}

if (refreshActivityButton) {
    refreshActivityButton.addEventListener("click", refreshRecentActivity);
}

function recordTaskActivity(action, task, details = {}) {
    recentActivity.unshift({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        taskId: task.id,
        action: action,
        title: task.title,
        stage: task.stage || "Planning",
        previousStage: details.previousStage || "",
        date: new Date().toISOString()
    });
    recentActivity = recentActivity.slice(0, 8);

    try {
        localStorage.setItem("spt-activity", JSON.stringify(recentActivity));
    } catch (error) {
        console.error("Could not save recent activity:", error);
    }

    renderRecentActivity();
}

function applyTaskListFilters() {
    if (!taskList) return;

    const rows = Array.from(taskList.querySelectorAll(".task-row"));
    let visibleCount = 0;

    rows.forEach(function (row) {
        const statusSelect = row.querySelector(".task-status-select");
        const matchesStatus = selectedTaskFilter === "All" ||
            (statusSelect && statusSelect.value === selectedTaskFilter);
        const matchesSearch = !taskSearchTerm ||
            (row.dataset.searchText || "").includes(taskSearchTerm);

        row.hidden = !(matchesStatus && matchesSearch);

        if (!row.hidden) visibleCount += 1;
    });

    let emptyMessage = taskList.querySelector(".task-list-empty");

    if (rows.length === 0 || visibleCount === 0) {
        if (!emptyMessage) {
            emptyMessage = document.createElement("div");
            emptyMessage.className = "activity-empty task-list-empty";
            const illustration = document.createElement("img");
            illustration.className = "dashboard-empty-illustration";
            illustration.src = "public/illustrations/project-progress.svg";
            illustration.alt = "A student organizing project work";
            const description = document.createElement("p");
            emptyMessage.append(illustration, description);
            taskList.appendChild(emptyMessage);
        }

        const description = emptyMessage.querySelector("p");
        if (description) description.textContent = rows.length === 0
            ? "No tasks yet. Click \"New Task\" to add your first task."
            : "No tasks match the selected filter and search.";
    } else if (emptyMessage) {
        emptyMessage.remove();
    }
}

function updateDashboardFromSettings() {
    const greeting = document.getElementById("dashboard-greeting-name");

    try {
        const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
        const project = JSON.parse(localStorage.getItem("spt-project-settings")) || {};
        const studentName = typeof student["student-name"] === "string" &&
            student["student-name"].trim()
            ? student["student-name"].trim()
            : "Student";
        const projectTitle = document.getElementById("dashboard-project-title");
        const projectDescription = document.getElementById("dashboard-project-description");
        const initials = studentName.split(/\s+/).slice(0, 2)
            .map(function (part) { return part.charAt(0).toUpperCase(); })
            .join("");

        if (greeting) greeting.textContent = studentName;

        document.querySelectorAll(".avatar, #topbar-avatar").forEach(function (avatar) {
            avatar.textContent = initials || "ST";
        });

        if (projectTitle && typeof project["project-title"] === "string" &&
            project["project-title"].trim()) {
            projectTitle.textContent = project["project-title"].trim();
        }

        if (projectDescription && typeof project["project-description"] === "string" &&
            project["project-description"].trim()) {
            projectDescription.textContent = project["project-description"].trim();
        }
    } catch (error) {
        console.error("Could not load dashboard settings:", error);
    }
}

function getTaskDraftFromForm() {
    return {
        title: document.getElementById("task-title")?.value || "",
        description: document.getElementById("task-description")?.value || "",
        priority: document.getElementById("task-priority")?.value || "Medium",
        stage: document.getElementById("task-stage")?.value || "Planning",
        deadline: document.getElementById("task-deadline")?.value || ""
    };
}

function saveTaskDraft() {
    if (editingTaskId !== null || !taskForm) return false;

    const formData = getTaskDraftFromForm();
    const draft = {
        formData: formData,
        timestamp: Date.now(),
        isDraft: true
    };
    if (!formData.title.trim() && !formData.description.trim() &&
        formData.stage === "Planning" && formData.priority === "Medium" &&
        !formData.deadline) {
        if (taskDraft) clearTaskDraft();
        return false;
    }

    try {
        localStorage.setItem("draft_task", JSON.stringify(draft));
        localStorage.removeItem("task_draft");
        taskDraft = Object.assign({}, formData, draft);
        const savedLabel = document.getElementById("task-draft-autosave-label");
        if (savedLabel) {
            savedLabel.textContent = "Draft auto-saved at " + new Date(draft.timestamp)
                .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            savedLabel.hidden = false;
        }
        const bannerText = document.getElementById("task-draft-banner-text");
        if (bannerText) {
            bannerText.textContent = "You have an unfinished draft from " +
                new Date(draft.timestamp).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit"
                });
        }
        if (taskDraftBanner && !taskFormSection?.hidden) taskDraftBanner.hidden = false;
        renderTaskDraftRow();
        updateDashboardDraftCard();
        return true;
    } catch (error) {
        console.error("Could not save task draft:", error);
        return false;
    }
}

function clearTaskDraft() {
    localStorage.removeItem("draft_task");
    localStorage.removeItem("task_draft");
    taskDraft = null;
    if (taskDraftBanner) taskDraftBanner.hidden = true;
    if (taskList) {
        const draftRow = taskList.querySelector(".task-draft-row");
        if (draftRow) draftRow.remove();
    }
    applyTaskListFilters();
    updateDashboardDraftCard();
}

function restoreTaskDraft() {
    if (!taskDraft || !taskForm) return;

    document.getElementById("task-title").value = taskDraft.title || "";
    document.getElementById("task-description").value = taskDraft.description || "";
    document.getElementById("task-priority").value = taskDraft.priority || "Medium";
    document.getElementById("task-stage").value = taskDraft.stage || "Planning";
    document.getElementById("task-deadline").value = taskDraft.deadline || "";
    setTaskFormMode();
    if (taskDraftBanner) taskDraftBanner.hidden = true;
    if (taskFormSection) {
        taskFormSection.hidden = false;
        taskFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function renderTaskDraftRow() {
    if (!taskList || !document.querySelector("body:has(.page-header)")) return;

    const existing = taskList.querySelector(".task-draft-row");
    if (existing) existing.remove();
    if (!taskDraft) return;

    const row = document.createElement("article");
    row.className = "task-row task-draft-row";
    row.dataset.searchText = [taskDraft.title, taskDraft.description, taskDraft.stage, "draft"]
        .filter(Boolean).join(" ").toLowerCase();

    const details = document.createElement("div");
    details.className = "task-details";
    const titleLine = document.createElement("div");
    titleLine.className = "task-title-line";
    const title = document.createElement("strong");
    title.textContent = taskDraft.title.trim() || "Untitled task";
    const badge = document.createElement("span");
    badge.className = "draft-badge";
    badge.textContent = "Draft";
    titleLine.append(title, badge);

    const stage = document.createElement("span");
    stage.className = "task-stage-pill";
    stage.append(createStageIcon(taskDraft.stage || "Planning"));
    stage.append(document.createTextNode(taskDraft.stage || "Planning"));
    details.append(titleLine, stage);

    const actions = document.createElement("div");
    actions.className = "draft-actions";
    const continueButton = document.createElement("button");
    continueButton.type = "button";
    continueButton.className = "draft-continue-button";
    continueButton.textContent = "Continue";
    continueButton.addEventListener("click", restoreTaskDraft);
    const discardButton = document.createElement("button");
    discardButton.type = "button";
    discardButton.className = "draft-discard-button";
    discardButton.textContent = "Discard";
    discardButton.addEventListener("click", clearTaskDraft);
    actions.append(continueButton, discardButton);

    row.append(details, actions);
    taskList.appendChild(row);
    applyTaskListFilters();
}

function updateDashboardDraftCard() {
    const count = document.getElementById("dashboard-draft-count");
    const restore = document.getElementById("restore-dashboard-draft");
    const empty = document.getElementById("dashboard-draft-empty");
    if (!count || !restore || !empty) return;

    const hasDraft = Boolean(taskDraft);
    count.textContent = hasDraft ? "1 unsaved" : "0 unsaved";
    restore.hidden = !hasDraft;
    empty.hidden = hasDraft;
}

// =========================================
// 4. OPEN AND CLOSE THE FORM
// =========================================

function openTaskForm() {
    if (!taskFormSection) return;

    if (taskForm) taskForm.reset();
    setTaskFormMode();
    if (taskDraftBanner) taskDraftBanner.hidden = !taskDraft;
    taskFormSection.hidden = false;

    taskFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeTaskForm() {
    if (taskForm) taskForm.reset();
    setTaskFormMode();
    if (taskDraftBanner) taskDraftBanner.hidden = true;
    if (taskFormSection) taskFormSection.hidden = true;
}

if (openTaskButton) {
    openTaskButton.addEventListener("click", function (event) {
        event.preventDefault();
        openTaskForm();
    });
}

if (cancelTaskButton) {
    cancelTaskButton.addEventListener("click", closeTaskForm);
}

if (taskForm) {
    const scheduleTaskDraftSave = function () {
        if (editingTaskId !== null) return;

        window.clearTimeout(taskDraftSaveTimer);
        taskDraftSaveTimer = window.setTimeout(saveTaskDraft, 3000);
    };

    taskForm.addEventListener("input", scheduleTaskDraftSave);
    taskForm.addEventListener("change", scheduleTaskDraftSave);
}

if (taskDraft) {
    const timestamp = Number(taskDraft.timestamp) || Date.parse(taskDraft.savedAt);
    const formattedTime = Number.isFinite(timestamp)
        ? new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : "";
    const bannerText = document.getElementById("task-draft-banner-text");
    const savedLabel = document.getElementById("task-draft-autosave-label");
    if (taskDraftBanner) taskDraftBanner.hidden = false;
    if (bannerText) bannerText.textContent = "You have an unfinished draft from " + formattedTime;
    if (savedLabel) {
        savedLabel.textContent = "Draft auto-saved at " + formattedTime;
        savedLabel.hidden = false;
    }
}

if (taskForm && new URLSearchParams(window.location.search).get("aiInsert") === "task") {
    try {
        const pendingInsert = JSON.parse(localStorage.getItem("spt-ai-insert"));
        if (pendingInsert && pendingInsert.target === "task" &&
            typeof pendingInsert.text === "string") {
            openTaskForm();
            document.getElementById("task-title").value =
                typeof pendingInsert.title === "string" ? pendingInsert.title : "";
            document.getElementById("task-description").value = pendingInsert.text;
            document.getElementById("task-description").dispatchEvent(
                new Event("input", { bubbles: true })
            );
            localStorage.removeItem("spt-ai-insert");
        }
    } catch (error) {
        console.error("Could not insert the AI draft into the task form:", error);
        window.alert("The AI draft could not be opened in the task form.");
    }
}

if (saveTaskDraftButton) {
    saveTaskDraftButton.addEventListener("click", function () {
        if (saveTaskDraft()) closeTaskForm();
    });
}

if (restoreTaskDraftButton) {
    restoreTaskDraftButton.addEventListener("click", restoreTaskDraft);
}

if (discardTaskDraftButton) {
    discardTaskDraftButton.addEventListener("click", function () {
        clearTaskDraft();
        if (taskDraftBanner) taskDraftBanner.hidden = true;
    });
}

// =========================================
// 5. DISPLAY A TASK
// =========================================

function displayTask(task) {
    if (!taskList) return;

    const row = document.createElement("div");
    row.className = "task-row";
    row.dataset.taskId = String(task.id);
    row.dataset.searchText = [
        task.title,
        task.description,
        task.stage,
        task.priority,
        task.status
    ].filter(Boolean).join(" ").toLowerCase();
    

    // Complete-task button
    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "task-check";
    checkButton.setAttribute(
        "aria-label",
        task.status === "Completed" ? "Mark as pending" : "Mark as completed"
    );

    // Task information
    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const description = document.createElement("span");
    description.className = "task-stage-pill";
    description.append(
        createStageIcon(task.stage || "Planning"),
        document.createTextNode("Stage: " + (task.stage || "Planning"))
    );
    

    // Priority label
    const priority = document.createElement("span");
    const priorityValue = task.priority || "Medium";

    priority.className = "priority";

    if (priorityValue === "High") {
        priority.classList.add("priority-high");
    } else if (priorityValue === "Medium") {
        priority.classList.add("priority-medium");
    }

    priority.textContent = priorityValue;
    const titleLine = document.createElement("div");
titleLine.className = "task-title-line";
titleLine.append(title, priority);

details.append(titleLine, description);

    // Allow the user to change a task's status
    const statusSelect = document.createElement("select");
    statusSelect.className = "task-status-select";
    statusSelect.setAttribute("aria-label", "Change task status");

    ["Pending", "In Progress", "Completed"].forEach(function (status) {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });

    statusSelect.value = task.status || "Pending";

    statusSelect.addEventListener("change", function () {
        const previousStatus = task.status;
        task.status = statusSelect.value;

        if (saveTasks()) {
            recordTaskActivity(
                task.status === "Completed"
                    ? "Completed task"
                    : "Changed status to " + task.status,
                task
            );
            updateTaskAppearance();
            updateDashboardStats();
           
        } else {
            task.status = previousStatus;
            statusSelect.value = previousStatus;
        }
    });

    details.appendChild(statusSelect);

    // Deadline
    const date = document.createElement("span");
    date.className = "task-date";
    const calendarIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    calendarIcon.setAttribute("viewBox", "0 0 24 24");
    calendarIcon.setAttribute("fill", "none");
    calendarIcon.setAttribute("stroke", "currentColor");
    calendarIcon.setAttribute("stroke-width", "1.8");
    calendarIcon.setAttribute("stroke-linecap", "round");
    calendarIcon.setAttribute("stroke-linejoin", "round");
    calendarIcon.setAttribute("aria-hidden", "true");
    calendarIcon.innerHTML = "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>";
    const dateText = document.createElement("span");

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline + "T00:00:00");

        dateText.textContent = Number.isNaN(deadlineDate.getTime())
            ? "No date"
            : deadlineDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short"
            });
    } else {
        dateText.textContent = "No date";
    }
    date.append(calendarIcon, dateText);

    // Edit button
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "task-edit-button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", "Edit " + task.title);
    editButton.title = "Edit task";

    // Open the form with this task's existing details
    editButton.addEventListener("click", function () {
    if (!taskForm || !taskFormSection) {
        alert("The task editing form is not available on this page.");
        return;
    }

    setTaskFormMode(task.id);

        document.getElementById("task-title").value = task.title;
        document.getElementById("task-description").value =
            task.description || "";
        document.getElementById("task-priority").value =
            task.priority || "Medium";
        document.getElementById("task-stage").value =
            task.stage || "Planning";
        document.getElementById("task-deadline").value =
            task.deadline || "";

        const formSection = taskFormSection;

        if (formSection) {
            formSection.hidden = false;
            formSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "task-delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + task.title);
    deleteButton.title = "Delete task";

    const actionGroup = document.createElement("div");
    actionGroup.className = "task-row-actions";
    actionGroup.append(editButton, deleteButton);

    // Update the row to reflect its status
    function updateTaskAppearance() {
        statusSelect.value = task.status || "pending";
        const completed = task.status === "Completed"; 
        

        checkButton.classList.toggle("completed-check", completed);
        checkButton.textContent = completed ? "✓" : "";
        checkButton.setAttribute(
            "aria-label",
            completed ? "Mark as pending" : "Mark as completed"
        );

        description.replaceChildren(
            createStageIcon(task.stage || "Planning"),
            document.createTextNode("Stage: " + (task.stage || "Planning"))
        );
        row.dataset.searchText = [
            task.title,
            task.description,
            task.stage,
            task.priority,
            task.status
        ].filter(Boolean).join(" ").toLowerCase();

        title.style.textDecoration = completed ? "line-through" : "none";
        title.style.opacity = completed ? "0.65" : "1";
    }

    // Mark a task complete or pending
    checkButton.addEventListener("click", function () {
        const previousStatus = task.status;

        task.status = previousStatus === "Completed"
            ? "Pending"
            : "Completed";

        if (saveTasks()) {
            recordTaskActivity(
                task.status === "Completed" ? "Completed task" : "Reopened task",
                task
            );
            updateTaskAppearance();
            updateDashboardStats();
        } else {
            task.status = previousStatus;
            updateTaskAppearance();
        }
    });

    // Delete a task permanently from this prototype's saved list
    deleteButton.addEventListener("click", function () {
        const confirmed = window.confirm(
            'Are you sure you want to delete "' + task.title + '"?'
        );

        if (!confirmed) return;

        const previousTasks = [...tasks];
        tasks = tasks.filter(function (item) {
            return item.id !== task.id;
        });

        if (saveTasks()) {
            recordTaskActivity("Deleted task", task);
            row.remove();
            updateDashboardStats();
        } else {
            tasks = previousTasks;
        }
    });

    row.append(
        checkButton,
        details,
        date,
        actionGroup
    );

    updateTaskAppearance();
    taskList.prepend(row);
    applyTaskListFilters();
}

// =========================================
// 6. DISPLAY SAVED TASKS ON PAGE LOAD
// =========================================

// Render older tasks first so the newest appears at the top.
tasks.slice().reverse().forEach(displayTask);
renderTaskDraftRow();
renderRecentActivity();
updateDashboardFromSettings();
updateDashboardStats();
updateDashboardDraftCard();

if (taskForm && taskDraft &&
    new URLSearchParams(window.location.search).get("draft") === "restore") {
    openTaskForm();
    restoreTaskDraft();
}

// =========================================
// 7. CREATE AND SAVE A NEW TASK
// =========================================

if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const titleInput = document.getElementById("task-title");
        const descriptionInput =
            document.getElementById("task-description");
        const priorityInput = document.getElementById("task-priority");
        const stageInput = document.getElementById("task-stage");
        const deadlineInput = document.getElementById("task-deadline");

        if (
            !titleInput ||
            !descriptionInput ||
            !priorityInput ||
            !stageInput ||
            !deadlineInput
        ) {
            alert("One or more task form fields are missing.");
            return;
        }

        const title = titleInput.value.trim();

        if (!title) {
            alert("Please enter a task title.");
            titleInput.focus();
            return;
        }

        // EDIT AN EXISTING TASK
        if (editingTaskId !== null) {
            const taskIndex = tasks.findIndex(function (task) {
                return task.id === editingTaskId;
            });

            if (taskIndex === -1) {
                alert("The task could not be found. Please try again.");
                setTaskFormMode();
                return;
            }

            const previousTask = { ...tasks[taskIndex] };

            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: title,
                description: descriptionInput.value.trim(),
                priority: priorityInput.value,
                stage: stageInput.value,
                deadline: deadlineInput.value
            };

            if (!saveTasks()) {
                tasks[taskIndex] = previousTask;
                return;
            }

            recordTaskActivity("Edited task", tasks[taskIndex], {
                previousStage: previousTask.stage || "Planning"
            });

            // Refresh the displayed task rows
            taskList.innerHTML = "";

            tasks.slice().reverse().forEach(function (task) {
                displayTask(task);
            });

            editingTaskId = null;
            updateDashboardStats();
            closeTaskForm();

            console.log("Task updated successfully.");
            return;
        }

        // CREATE A NEW TASK
        const newTask = {
            id: Date.now(),
            ...getStudentSubmissionMetadata(),
            title: title,
            description: descriptionInput.value.trim(),
            priority: priorityInput.value,
            stage: stageInput.value,
            deadline: deadlineInput.value,
            status: "Pending"
        };

        tasks.unshift(newTask);

        if (!saveTasks()) {
            tasks.shift();
            return;
        }

        clearTaskDraft();
        recordTaskActivity("Created task", newTask);
        displayTask(newTask);
        updateDashboardStats();
        closeTaskForm();

        console.log("Task created successfully:", newTask);
    });
}
/* =========================================
   8. UPDATE DASHBOARD STATISTICS
========================================= */

function updateDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate task totals from saved tasks
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.status === "Completed";
    }).length;

    const inProgress = tasks.filter(function (task) {
        return task.status === "In Progress";
    }).length;

    const pending = tasks.filter(function (task) {
        return task.status === "Pending";
    }).length;

    const overdue = tasks.filter(function (task) {
        if (!task.deadline || task.status === "Completed") {
            return false;
        }

        const deadline = new Date(task.deadline + "T00:00:00");

        return !Number.isNaN(deadline.getTime()) && deadline < today;
    }).length;

    // Update the statistic cards
    document.querySelectorAll(".stat-card").forEach(function (card) {
        const labelElement = card.querySelector(".stat-label");
        const valueElement = card.querySelector(".stat-value");

        if (!labelElement || !valueElement) return;

        const label = labelElement.textContent.trim().toLowerCase();

        if (label.includes("total")) {
            valueElement.textContent = total;
        } else if (label.includes("completed")) {
            valueElement.textContent = completed;
        } else if (label.includes("in progress")) {
            valueElement.textContent = inProgress;
        } else if (label.includes("overdue")) {
            valueElement.textContent = overdue;
        } else if (label.includes("pending")) {
            valueElement.textContent = pending;
        }
    });

    // Calculate completion percentage
    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // Update the overall progress heading
    const progressText = document.querySelector(
        ".completion-heading strong"
    );

    if (progressText) {
        progressText.textContent = progress + "%";
    }

    // Update the progress bar
    const progressBar = document.querySelector(".progress-fill");

    if (progressBar) {
        progressBar.style.width = progress + "%";
    }

    // Update the completed-task summary
    const completionSummary = document.getElementById(
        "completion-summary"
    );

    if (completionSummary) {
        completionSummary.textContent =
            completed + " of " + total + " tasks completed";
    }

    // Update the percentage in the Completed card
    const completedPercentage = document.getElementById(
        "completed-percentage"
    );

    if (completedPercentage) {
        completedPercentage.textContent = progress + "% complete";
    }
    if (taskCountBadge) {
        taskCountBadge.textContent = String(total);
    }
    applyTaskListFilters();
    renderUpcomingDeadlines();
    renderNotifications();
}

function getRelativeActivityTime(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "recently";

    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (elapsedMinutes < 1) return "just now";
    if (elapsedMinutes < 60) return elapsedMinutes + "m ago";
    if (elapsedMinutes < 1440) return Math.floor(elapsedMinutes / 60) + "h ago";
    if (elapsedMinutes < 2880) return "yesterday";
    return Math.floor(elapsedMinutes / 1440) + "d ago";
}

function buildNotificationFeed() {
    let activityItems = recentActivity.map(function (entry) {
        const action = String(entry.action || "");
        let message;
        let type = "info";
        let filter = "Activity";

        if (/^Created task$/i.test(action)) {
            message = "You created " + entry.title;
            type = "success";
        } else if (/^(Edited|Updated) task$/i.test(action)) {
            message = "You edited " + entry.title;
            if (entry.previousStage && entry.stage && entry.previousStage !== entry.stage) {
                message += ": " + entry.previousStage + " → " + entry.stage;
            }
            filter = "Edits";
        } else if (/^Completed task$/i.test(action)) {
            message = "You completed " + entry.title;
            type = "success";
        } else if (/^Reopened task$/i.test(action)) {
            message = "You reopened " + entry.title;
        } else if (/^Deleted task$/i.test(action)) {
            message = "You deleted " + entry.title;
            type = "warning";
        } else {
            message = "You " + action.charAt(0).toLowerCase() + action.slice(1) +
                " - " + entry.title;
        }

        return {
            id: entry.id,
            taskId: entry.taskId,
            title: entry.title,
            message: message,
            time: getRelativeActivityTime(entry.date),
            type: entry.notificationType || type,
            filter: filter,
            date: entry.date
        };
    });

    if (activityItems.length === 0) {
        const now = Date.now();
        const sampleActivity = [
            {
                id: "demo-created",
                title: "tests1.1",
                action: "Created task",
                notificationType: "info",
                date: new Date(now - 2 * 60000).toISOString()
            },
            {
                id: "demo-edited",
                title: "yyyyyyy",
                action: "Edited task",
                previousStage: "Testing",
                stage: "Development",
                notificationType: "info",
                date: new Date(now - 8 * 60000).toISOString()
            },
            {
                id: "demo-completed",
                title: "Research plan",
                action: "Completed task",
                notificationType: "success",
                date: new Date(now - 60 * 60000).toISOString()
            }
        ];
        activityItems = sampleActivity.map(function (entry) {
            const matchingTask = tasks.find(function (task) {
                return typeof task.title === "string" &&
                    task.title.toLowerCase() === entry.title.toLowerCase();
            });
            let message = "You created " + entry.title;
            if (entry.action === "Edited task") {
                message = "You edited " + entry.title + ": " +
                    entry.previousStage + " → " + entry.stage;
            } else if (entry.action === "Completed task") {
                message = "You completed " + entry.title;
            }
            return {
                id: entry.id,
                taskId: matchingTask ? matchingTask.id : undefined,
                title: entry.title,
                message: message,
                time: getRelativeActivityTime(entry.date),
                type: entry.notificationType,
                filter: entry.action === "Edited task" ? "Edits" : "Activity",
                date: entry.date
            };
        });
        activityItems.push({
            id: "demo-alert",
            title: "Research review",
            message: "Research review deadline is approaching",
            time: "30m ago",
            type: "warning",
            filter: "Alerts",
            date: new Date(now - 30 * 60000).toISOString()
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineItems = tasks.flatMap(function (task) {
        if (!task.deadline || task.status === "Completed") return [];

        const deadline = new Date(task.deadline + "T00:00:00");
        if (Number.isNaN(deadline.getTime())) return [];

        const daysUntilDeadline = Math.floor(
            (deadline.getTime() - today.getTime()) / 86400000
        );
        if (daysUntilDeadline > 3) return [];

        let message;
        let type = "info";
        if (daysUntilDeadline < 0) {
            const overdueDays = Math.abs(daysUntilDeadline);
            message = task.title + " overdue by " + overdueDays +
                (overdueDays === 1 ? " day" : " days");
            type = "warning";
        } else if (daysUntilDeadline === 0) {
            message = task.title + " is due today";
            type = "warning";
        } else if (daysUntilDeadline === 1) {
            message = task.title + " is due tomorrow";
        } else {
            message = task.title + " is due in " + daysUntilDeadline + " days";
        }

        return [{
            id: "deadline-" + task.id,
            taskId: task.id,
            message: message,
            time: "Deadline alert",
            type: type,
            filter: "Alerts",
            date: task.deadline
        }];
    });

    return activityItems.concat(deadlineItems).sort(function (first, second) {
        return new Date(second.date).getTime() - new Date(first.date).getTime();
    });
}

function renderNotifications() {
    if (!notificationToggle || !notificationPanel || !notificationList) return;

    const feed = buildNotificationFeed();
    const visibleItems = notificationFilter === "All"
        ? feed
        : feed.filter(function (item) {
            return notificationFilter === "Alerts"
                ? item.filter === "Alerts"
                : item.filter === "Edits";
        });
    notificationCount.hidden = feed.length === 0;
    notificationCount.textContent = feed.length > 99 ? "99+" : String(feed.length);
    notificationToggle.setAttribute(
        "aria-label",
        feed.length === 0
            ? "Notifications, none"
            : "Notifications, " + feed.length + " item" + (feed.length === 1 ? "" : "s")
    );

    notificationList.replaceChildren();

    if (visibleItems.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "notification-empty";
        emptyMessage.textContent = feed.length === 0
            ? "No recent activity or deadline alerts."
            : "No notifications in this category.";
        notificationList.appendChild(emptyMessage);
        return;
    }

    visibleItems.slice(0, 20).forEach(function (entry) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "notification-item notification-" + entry.type;
        if (entry.taskId !== undefined && entry.taskId !== null) {
            item.dataset.taskId = String(entry.taskId);
        }
        item.dataset.taskTitle = entry.title || "";

        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "currentColor");
        icon.setAttribute("stroke-width", "1.8");
        icon.setAttribute("stroke-linecap", "round");
        icon.setAttribute("stroke-linejoin", "round");
        icon.setAttribute("aria-hidden", "true");
        if (entry.type === "success") {
            icon.innerHTML = "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 12 2.5 2.5L16 9\"/>";
        } else if (entry.type === "warning") {
            icon.innerHTML = "<path d=\"M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z\"/><path d=\"M12 9v4M12 17h.01\"/>";
        } else {
            icon.innerHTML = "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 8h.01\"/>";
        }

        const text = document.createElement("span");
        text.className = "notification-message";
        text.textContent = entry.message;
        const time = document.createElement("time");
        time.textContent = entry.time;
        item.append(icon, text, time);
        notificationList.appendChild(item);
    });
}

function closeNotifications(returnFocus) {
    if (!notificationToggle || !notificationPanel) return;

    notificationPanel.hidden = true;
    notificationToggle.setAttribute("aria-expanded", "false");

    if (returnFocus) notificationToggle.focus();
}

if (notificationToggle && notificationPanel) {
    notificationToggle.addEventListener("click", function () {
        const opening = notificationPanel.hidden;
        notificationPanel.hidden = !opening;
        notificationToggle.setAttribute("aria-expanded", String(opening));

        if (opening) {
            const firstNotification = notificationList.querySelector(".notification-item");
            if (firstNotification) firstNotification.focus();
        }
    });

    if (notificationsClose) {
        notificationsClose.addEventListener("click", function () {
            closeNotifications(true);
        });
    }

    if (notificationList) {
        notificationList.addEventListener("click", function (event) {
            const notification = event.target.closest(".notification-item");
            if (!notification) return;

            selectedTaskFilter = "All";
            filterButtons.forEach(function (button) {
                button.classList.toggle("selected", button.dataset.filter === "All");
            });

            if (taskSearchInput) {
                taskSearchInput.value = "";
                taskSearchTerm = "";
            }

            applyTaskListFilters();
            closeNotifications(false);

            const taskRow = Array.from(
                document.querySelectorAll("#task-list .task-row")
            ).find(function (row) {
                return row.dataset.taskId === notification.dataset.taskId;
            });

            if (taskRow) {
                taskRow.scrollIntoView({ behavior: "smooth", block: "center" });
                taskRow.tabIndex = -1;
                taskRow.focus({ preventScroll: true });
            } else if (notification.dataset.taskTitle) {
                window.location.href = "task.html?search=" +
                    encodeURIComponent(notification.dataset.taskTitle);
            }
        });
    }

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".notification-wrap")) {
            closeNotifications(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !notificationPanel.hidden) {
            closeNotifications(true);
        }
    });
}
/* TASK FILTERS */

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedTaskFilter = button.dataset.filter || "All";

        filterButtons.forEach(function (filterButton) {
            filterButton.classList.toggle("selected", filterButton === button);
        });

        applyTaskListFilters();
    });
});

if (taskSearchInput) {
    taskSearchInput.addEventListener("input", function () {
        taskSearchTerm = taskSearchInput.value.trim().toLowerCase();
        applyTaskListFilters();
    });

    taskSearchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && taskSearchInput.value) {
            taskSearchInput.value = "";
            taskSearchTerm = "";
            applyTaskListFilters();
        }
    });

}
/* DISPLAY DYNAMIC UPCOMING DEADLINES */

function renderUpcomingDeadlines() {
    const deadlineList = document.getElementById("deadline-list");

    if (!deadlineList) return;

    deadlineList.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tasks that have deadlines and are not completed
    const deadlineTasks = tasks
        .filter(function (task) {
            if (!task.deadline || task.status === "Completed") {
                return false;
            }

            const date = new Date(task.deadline + "T00:00:00");

            return !Number.isNaN(date.getTime());
        })
        .sort(function (a, b) {
            return a.deadline.localeCompare(b.deadline);
        });

    // Display a message if there are no deadlines
    if (deadlineTasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "deadline-empty";
        emptyMessage.textContent = "No upcoming deadlines. Add a task with a deadline to see it here.";
        deadlineList.appendChild(emptyMessage);
        return;
    }

    // Create a deadline card for each task
    deadlineTasks.forEach(function (task) {
        const deadline = new Date(task.deadline + "T00:00:00");
        const daysDifference = Math.round(
            (deadline.getTime() - today.getTime()) / 86400000
        );

        const item = document.createElement("div");
        item.className = "deadline-item";

        const dateBox = document.createElement("div");
        dateBox.className = "date-box";

        const month = document.createElement("span");
        month.textContent = deadline
            .toLocaleString("en", { month: "short" })
            .toUpperCase();

        const day = document.createElement("strong");
        day.textContent = String(deadline.getDate()).padStart(2, "0");

        dateBox.append(month, day);

        const details = document.createElement("div");
        details.className = "deadline-details";

        const title = document.createElement("strong");
        title.textContent = task.title;

        const stage = document.createElement("span");
        stage.textContent = (task.stage || "Planning") + " stage";

        const tag = document.createElement("span");
        tag.className = "deadline-tag";

        if (daysDifference < 0) {
            const overdueDays = Math.abs(daysDifference);
            tag.textContent = "Overdue by " + overdueDays +
                (overdueDays === 1 ? " day" : " days");
            tag.classList.add("urgent-tag");
        } else if (daysDifference === 0) {
            tag.textContent = "Due today";
            tag.classList.add("urgent-tag");
        } else if (daysDifference === 1) {
            tag.textContent = "Due tomorrow";
            tag.classList.add("urgent-tag");
        } else {
            tag.textContent = "Due in " + daysDifference + " days";

            if (daysDifference <= 3) {
                tag.classList.add("urgent-tag");
            }
        }

        details.append(title, stage, tag);
        item.append(dateBox, details);
        deadlineList.appendChild(item);
    });
}

/* =========================================
   WEEKLY PROGRESS JOURNAL
========================================= */

(function () {
    const journalForm = document.getElementById("journal-form");
    const journalList = document.getElementById("journal-list");

    // This code runs only on the Journal page.
    if (!journalForm || !journalList) {
        return;
    }

    const journalStorageKey = "spt-journals";

    let journalEntries = [];

    try {
        journalEntries = JSON.parse(
            localStorage.getItem(journalStorageKey)
        ) || [];
    } catch (error) {
        journalEntries = [];
    }

    function renderJournalEntries() {
        journalList.replaceChildren();

        if (journalEntries.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "activity-empty";
            emptyMessage.textContent =
                "No journal entries yet. Save your first weekly entry to see it here.";

            journalList.appendChild(emptyMessage);
            return;
        }

        journalEntries.forEach(function (entry) {
            const card = document.createElement("article");
            card.className = "task-row journal-entry";

            const content = document.createElement("div");
            content.className = "task-details";

            const heading = document.createElement("h3");
            heading.textContent =
                "Week " + entry.week + " — Weekly Progress";

            content.appendChild(heading);

            function addJournalField(label, value) {
                const paragraph = document.createElement("p");
                const strong = document.createElement("strong");

                strong.textContent = label + ": ";
                paragraph.appendChild(strong);
                paragraph.appendChild(
                    document.createTextNode(value || "Not provided")
                );

                content.appendChild(paragraph);
            }

            addJournalField("Week Ending", entry.date);
            addJournalField("Work Completed", entry.work);
            addJournalField("Challenges", entry.challenges);
            addJournalField("Lessons Learned", entry.lessons);
            addJournalField("Plans for Next Week", entry.nextWeek);

            card.appendChild(content);
            journalList.appendChild(card);
        });
    }

    journalForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const entry = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            ...getStudentSubmissionMetadata(),
            week: journalForm.elements["journal-week"].value,
            date: journalForm.elements["journal-date"].value,
            work: journalForm.elements["journal-work"].value.trim(),
            challenges: journalForm.elements["journal-challenges"].value.trim(),
            lessons: journalForm.elements["journal-lessons"].value.trim(),
            nextWeek: journalForm.elements["journal-next-week"].value.trim()
        };

        journalEntries.unshift(entry);

        try {
            localStorage.setItem(
                journalStorageKey,
                JSON.stringify(journalEntries)
            );
        } catch (error) {
            journalEntries.shift();
            alert("The journal entry could not be saved. Please check your browser storage.");
            return;
        }

        if (window.DraftManager) window.DraftManager.clear("journal");
        renderJournalEntries();
        journalForm.reset();

        alert("Your weekly journal entry has been saved!");
    });

    renderJournalEntries();
})();

/* =========================================
   PROJECT REPORTS
========================================= */

(function () {
    const totalTasksElement =
        document.getElementById("report-total-tasks");

    // Run this code only on the Reports page.
    if (!totalTasksElement) {
        return;
    }

    function readStoredData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    const tasks = readStoredData("spt-tasks");
    const journals = readStoredData("spt-journals");

    function normalizeStatus(status) {
        return String(status || "pending")
            .trim()
            .toLowerCase()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ");
    }

    const completedTasks = tasks.filter(function (task) {
        return normalizeStatus(task.status) === "completed";
    });

    const inProgressTasks = tasks.filter(function (task) {
        return normalizeStatus(task.status) === "in progress";
    });

    const pendingTasks = tasks.filter(function (task) {
        return normalizeStatus(task.status) === "pending";
    });

    function updateReportValue(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    // PROJECT OVERVIEW
    updateReportValue("report-total-tasks", tasks.length);
    updateReportValue("report-completed-tasks", completedTasks.length);
    updateReportValue("report-progress-tasks", inProgressTasks.length);
    updateReportValue("report-pending-tasks", pendingTasks.length);

    const completionRate = tasks.length
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    updateReportValue("report-completion-rate", completionRate + "%");

    // TASK SUMMARY
    function normalizePriority(priority) {
        return String(priority || "medium").trim().toLowerCase();
    }

    updateReportValue(
        "report-high-priority",
        tasks.filter(task => normalizePriority(task.priority) === "high").length
    );

    updateReportValue(
        "report-medium-priority",
        tasks.filter(task => normalizePriority(task.priority) === "medium").length
    );

    updateReportValue(
        "report-low-priority",
        tasks.filter(task => normalizePriority(task.priority) === "low").length
    );

    const today = new Date();
    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    const overdueTasks = tasks.filter(function (task) {
        return (
            task.deadline &&
            task.deadline < todayString &&
            normalizeStatus(task.status) !== "completed"
        );
    });

    updateReportValue("report-overdue-tasks", overdueTasks.length);

    // WEEKLY PROGRESS SUMMARY
    updateReportValue("report-journal-count", journals.length);

    const latestEntry = journals
        .filter(function (entry) {
            if (!entry || typeof entry.date !== "string") return false;

            const date = new Date(entry.date + "T00:00:00");
            return !Number.isNaN(date.getTime()) && Number.isFinite(Number(entry.week));
        })
        .sort(function (first, second) {
            return second.date.localeCompare(first.date);
        })[0];

    updateReportValue(
        "report-latest-week",
        latestEntry ? "Week " + latestEntry.week : "—"
    );

    const taskTableBody = document.getElementById("report-task-table-body");
    const taskEmptyMessage = document.getElementById("report-task-empty");
    const weeklyNotes = document.getElementById("report-weekly-notes");

    if (taskTableBody) {
        taskTableBody.replaceChildren();
        tasks.forEach(function (task) {
            const row = document.createElement("tr");
            [task.title || "Untitled task", task.stage || "Planning",
                task.priority || "Medium", task.deadline || "No deadline"]
                .forEach(function (value) {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });
            taskTableBody.appendChild(row);
        });
    }
    if (taskEmptyMessage) taskEmptyMessage.hidden = tasks.length > 0;

    if (weeklyNotes) {
        weeklyNotes.replaceChildren();
        if (journals.length === 0) {
            const empty = document.createElement("p");
            empty.className = "report-empty";
            empty.textContent = "No weekly notes have been recorded yet.";
            weeklyNotes.appendChild(empty);
        } else {
            journals.forEach(function (entry) {
                const note = document.createElement("article");
                note.className = "report-weekly-note";
                const heading = document.createElement("h4");
                heading.textContent = "Week " + (entry.week || "—") +
                    (entry.date ? " · " + entry.date : "");
                const content = document.createElement("p");
                content.textContent = entry.work || "No work notes recorded.";
                note.append(heading, content);
                if (entry.challenges) {
                    const challenges = document.createElement("p");
                    challenges.textContent = "Challenges: " + entry.challenges;
                    note.appendChild(challenges);
                }
                if (entry.nextWeek) {
                    const next = document.createElement("p");
                    next.textContent = "Next week: " + entry.nextWeek;
                    note.appendChild(next);
                }
                weeklyNotes.appendChild(note);
            });
        }
    }

    const printButton = document.getElementById("print-report-button");
    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }

    const downloadButton = document.getElementById("download-report-button");
    const downloadStatus = document.getElementById("report-download-status");
    if (downloadButton && downloadStatus) {
        downloadButton.addEventListener("click", function () {
            const pdfLibrary = window.jspdf;
            if (!pdfLibrary || typeof pdfLibrary.jsPDF !== "function") {
                downloadStatus.textContent =
                    "PDF generation is unavailable. Check your connection and try again.";
                console.error("jsPDF did not load; the report PDF could not be generated.");
                return;
            }

            try {
                const pdf = new pdfLibrary.jsPDF();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 14;
                const contentWidth = pageWidth - margin * 2;
                let y = 18;

                function ensureSpace(height) {
                    if (y + height > pageHeight - margin) {
                        pdf.addPage();
                        y = margin;
                    }
                }

                function addParagraph(text, fontSize, indent) {
                    const left = indent || margin;
                    pdf.setFontSize(fontSize);
                    const lines = pdf.splitTextToSize(text, pageWidth - left - margin);
                    ensureSpace(lines.length * (fontSize * 0.45) + 4);
                    pdf.text(lines, left, y);
                    y += lines.length * (fontSize * 0.45) + 4;
                }

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(19);
                pdf.text("Project Overview", margin, y);
                y += 9;
                pdf.setFont("helvetica", "normal");
                addParagraph(
                    "Generated " + new Date().toLocaleDateString(),
                    10
                );
                addParagraph(
                    "Total tasks: " + tasks.length +
                    "   Completed: " + completedTasks.length +
                    "   In progress: " + inProgressTasks.length,
                    11
                );
                addParagraph(
                    "Pending: " + pendingTasks.length +
                    "   Completion rate: " + completionRate + "%",
                    11
                );

                y += 3;
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.text("Task Details", margin, y);
                y += 7;

                const columns = [
                    { title: "Task", x: margin, width: 65 },
                    { title: "Stage", x: margin + 67, width: 41 },
                    { title: "Priority", x: margin + 110, width: 29 },
                    { title: "Deadline", x: margin + 141, width: contentWidth - 141 }
                ];

                function drawTableHeader() {
                    pdf.setFillColor(239, 246, 255);
                    pdf.rect(margin, y - 4, contentWidth, 8, "F");
                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(9);
                    columns.forEach(function (column) {
                        pdf.text(column.title, column.x + 1, y + 1);
                    });
                    y += 9;
                }

                drawTableHeader();
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                if (tasks.length === 0) {
                    addParagraph("No tasks have been added yet.", 10, margin + 1);
                } else {
                    tasks.forEach(function (task) {
                        const values = [
                            task.title || "Untitled task",
                            task.stage || "Planning",
                            task.priority || "Medium",
                            task.deadline || "No deadline"
                        ];
                        const lines = values.map(function (value, index) {
                            return pdf.splitTextToSize(String(value), columns[index].width - 2);
                        });
                        const rowHeight = Math.max.apply(null, lines.map(function (cell) {
                            return cell.length;
                        })) * 4.5 + 4;
                        if (y + rowHeight > pageHeight - margin) {
                            pdf.addPage();
                            y = margin;
                            drawTableHeader();
                            pdf.setFont("helvetica", "normal");
                            pdf.setFontSize(9);
                        }
                        columns.forEach(function (column, index) {
                            pdf.text(lines[index], column.x + 1, y);
                        });
                        y += rowHeight;
                        pdf.setDrawColor(220, 226, 235);
                        pdf.line(margin, y - 2, pageWidth - margin, y - 2);
                    });
                }

                y += 7;
                ensureSpace(12);
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.text("Weekly Notes", margin, y);
                y += 8;
                pdf.setFont("helvetica", "normal");
                if (journals.length === 0) {
                    addParagraph("No weekly notes have been recorded yet.", 10);
                } else {
                    journals.forEach(function (entry) {
                        addParagraph(
                            "Week " + (entry.week || "—") +
                            (entry.date ? " · " + entry.date : ""),
                            10
                        );
                        if (entry.work) addParagraph("Work: " + entry.work, 9, margin + 3);
                        if (entry.challenges) {
                            addParagraph("Challenges: " + entry.challenges, 9, margin + 3);
                        }
                        if (entry.nextWeek) {
                            addParagraph("Next week: " + entry.nextWeek, 9, margin + 3);
                        }
                        y += 2;
                    });
                }

                const date = new Date();
                const dateString = [
                    String(date.getDate()).padStart(2, "0"),
                    String(date.getMonth() + 1).padStart(2, "0"),
                    date.getFullYear()
                ].join("-");
                pdf.save("ProjectTrack-Report-" + dateString + ".pdf");
                downloadStatus.textContent = "Your PDF report has been downloaded.";
            } catch (error) {
                console.error("Could not generate the project report PDF:", error);
                downloadStatus.textContent =
                    "The PDF could not be generated. Please try again.";
            }
        });
    }
})();

 const documentAttachmentStorage = (function () {
     let databasePromise = null;

     function openDatabase() {
         if (databasePromise) return databasePromise;
         if (!window.indexedDB) {
             return Promise.reject(new Error("Browser file storage is unavailable."));
         }

         databasePromise = new Promise(function (resolve, reject) {
             const request = window.indexedDB.open("project-tracker-files", 2);
             request.addEventListener("upgradeneeded", function () {
                 const database = request.result;
                 if (!database.objectStoreNames.contains("attachments")) {
                     database.createObjectStore("attachments", { keyPath: "id" });
                 }
             });
             request.addEventListener("success", function () {
                 resolve(request.result);
             }, { once: true });
             request.addEventListener("error", function () {
                 reject(request.error || new Error("Could not open browser file storage."));
             }, { once: true });
         }).catch(function (error) {
             databasePromise = null;
             throw error;
         });
         return databasePromise;
     }

     function transact(mode, operation) {
         return openDatabase().then(function (database) {
             return new Promise(function (resolve, reject) {
                 const transaction = database.transaction("attachments", mode);
                 const store = transaction.objectStore("attachments");
                 const request = operation(store);
                 let result;
                 if (request) {
                     request.addEventListener("success", function () {
                         result = request.result;
                     }, { once: true });
                     request.addEventListener("error", function () {
                         reject(request.error || new Error("File storage operation failed."));
                     }, { once: true });
                 }
                 transaction.addEventListener("complete", function () {
                     resolve(result);
                 }, { once: true });
                 transaction.addEventListener("error", function () {
                     reject(transaction.error || new Error("File storage transaction failed."));
                 }, { once: true });
                 transaction.addEventListener("abort", function () {
                     reject(transaction.error || new Error("File storage transaction was aborted."));
                 }, { once: true });
             });
         });
     }

     return {
         get: function (id) {
             return transact("readonly", function (store) {
                 return store.get(id);
             }).then(function (record) {
                 return record ? record.data : null;
             });
         },
         put: function (id, data) {
             return transact("readwrite", function (store) {
                 return store.put({ id: id, data: data });
             });
         },
         delete: function (id) {
             return transact("readwrite", function (store) {
                 return store.delete(id);
             });
         }
     };
 })();

 // =========================================
 // SUPPORTING DOCUMENTS
 // =========================================

(function () {
    const documentForm = document.getElementById("document-form");
    const documentList = document.getElementById("document-list");
    const documentCount = document.getElementById("document-count");
    const documentToast = document.getElementById("document-toast");

    // Do nothing on pages without the documents section
    if (!documentForm || !documentList || !documentCount) {
        return;
    }

    const titleInput = document.getElementById("document-title");
    const categoryInput = document.getElementById("document-category");
    const fileInput = document.getElementById("document-file");
    const descriptionInput = document.getElementById("document-description");

    const storageKey = "spt-documents";
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    const uploadProgress = document.getElementById("document-upload-progress");
    const uploadProgressText = document.getElementById("document-upload-progress-text");
    let documentToastTimer = null;

    function showDocumentToast(message) {
        if (!documentToast) return;

        documentToast.textContent = message;
        documentToast.hidden = false;
        window.clearTimeout(documentToastTimer);
        documentToastTimer = window.setTimeout(function () {
            documentToast.hidden = true;
        }, 3000);
    }

    let documents = [];
    let needsFileFlagMigration = false;

    try {
        const savedDocuments = JSON.parse(localStorage.getItem(storageKey));
        if (Array.isArray(savedDocuments)) {
            needsFileFlagMigration = savedDocuments.some(function (record) {
                return !record || typeof record.hasFile !== "boolean";
            });
            documents = savedDocuments.map(function (record) {
                const savedRecord = record && typeof record === "object" ? record : {};
                return Object.assign({}, savedRecord, {
                    hasFile: typeof savedRecord.hasFile === "boolean"
                        ? savedRecord.hasFile
                        : Boolean(savedRecord.fileId || savedRecord.fileData)
                });
            });
        }
    } catch (error) {
        console.error("Could not load saved documents:", error);
        documents = [];
    }

    function saveDocuments() {
        try {
            const metadata = documents.map(function (documentRecord) {
                const savedRecord = Object.assign({}, documentRecord);
                if (savedRecord.fileId) delete savedRecord.fileData;
                return savedRecord;
            });
            localStorage.setItem(storageKey, JSON.stringify(metadata));
            const matric = metadata[0] && metadata[0].studentMatric || (function () {
                try {
                    const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
                    return student["matric-number"] || "";
                } catch (error) {
                    console.error("Could not load student ID while sharing documents:", error);
                    return "";
                }
            })();
            const shared = JSON.parse(localStorage.getItem("documents") || "[]");
            const otherStudents = Array.isArray(shared)
                ? shared.filter(function (record) {
                    return record.studentMatric && record.studentMatric !== matric;
                })
                : [];
            localStorage.setItem("documents", JSON.stringify(
                otherStudents.concat(metadata.map(function (record) {
                    return Object.assign({}, record, {
                        studentMatric: record.studentMatric || matric
                    });
                }))
            ));
            return true;
        } catch (error) {
            console.error("Could not save shared document data:", error);
            alert("Unable to save document records in this browser.");
            return false;
        }
    }

    if (needsFileFlagMigration) saveDocuments();

    function readFileAsDataUrl(file, progressElement, progressText) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.addEventListener("load", function () {
                if (progressElement) progressElement.value = 100;
                if (progressText) progressText.textContent = "Saving file…";
                resolve(reader.result);
            }, { once: true });
            reader.addEventListener("error", function () {
                reject(reader.error || new Error("Could not read the selected file."));
            }, { once: true });
            reader.addEventListener("progress", function (event) {
                if (!event.lengthComputable) return;
                const percent = Math.round((event.loaded / event.total) * 100);
                if (progressElement) progressElement.value = percent;
                if (progressText) progressText.textContent = "Reading file… " + percent + "%";
            });
            reader.readAsDataURL(file);
        });
    }

    function renderDocuments() {
        documentList.replaceChildren();

        documentCount.textContent = documents.length === 0
            ? "You haven't added any documents yet."
            : `You have ${documents.length} document(s).`;

        documents.forEach(function (doc) {
            const card = document.createElement("article");
            card.className = "document-card";

            const title = document.createElement("h3");
            title.textContent = doc.title;

            const category = document.createElement("p");
            category.textContent = "Category: " + doc.category;

            const hasFile = typeof doc.hasFile === "boolean"
                ? doc.hasFile
                : Boolean(doc.fileId || doc.fileData);
            const attachmentSection = document.createElement("div");
            attachmentSection.className = "document-attachment";
            if (hasFile) {
                const filename = document.createElement("p");
                filename.textContent = "File: " + (doc.filename || "Attachment");
                const fileLink = document.createElement("a");
                fileLink.className = "document-download-link";
                if (typeof doc.fileData === "string" &&
                    doc.fileData.startsWith("data:") &&
                    doc.fileData.includes(";base64,")) {
                    fileLink.href = doc.fileData;
                    fileLink.download = doc.filename || "project-document";
                    fileLink.textContent = "Download file";
                } else if (doc.fileId) {
                    fileLink.textContent = "Preparing download…";
                    documentAttachmentStorage.get(doc.fileId).then(function (fileData) {
                        if (typeof fileData === "string" && fileData.startsWith("data:")) {
                            fileLink.href = fileData;
                            fileLink.download = doc.filename || "project-document";
                            fileLink.textContent = "Download file";
                        } else {
                            fileLink.textContent = "File unavailable in browser storage.";
                            fileLink.setAttribute("aria-disabled", "true");
                        }
                    }).catch(function (error) {
                        console.error("Could not load document attachment:", error);
                        fileLink.textContent = "File unavailable in browser storage.";
                        fileLink.setAttribute("aria-disabled", "true");
                    });
                } else {
                    fileLink.textContent = "File unavailable in browser storage.";
                    fileLink.setAttribute("aria-disabled", "true");
                }
                const size = document.createElement("p");
                size.textContent = "Size: " + (doc.fileSize || "Unknown");
                attachmentSection.append(filename, fileLink, size);
            } else {
                const badge = document.createElement("span");
                badge.className = "document-no-file-badge";
                badge.textContent = "No file attached";
                const uploadButton = document.createElement("button");
                uploadButton.type = "button";
                uploadButton.className = "document-upload-now";
                uploadButton.textContent = "Upload now";
                const uploadInput = document.createElement("input");
                uploadInput.type = "file";
                uploadInput.accept = fileInput.accept;
                uploadInput.hidden = true;
                uploadInput.addEventListener("change", async function () {
                    const file = uploadInput.files && uploadInput.files[0];
                    if (!file) return;
                    if (file.size > MAX_FILE_SIZE) {
                        alert("Choose a file that is 20 MB or smaller.");
                        uploadInput.value = "";
                        return;
                    }
                    const fileId = doc.id + "-" + Date.now();
                    try {
                        const fileData = await readFileAsDataUrl(file, null, null);
                        await documentAttachmentStorage.put(fileId, fileData);
                        const previous = Object.assign({}, doc);
                        Object.assign(doc, {
                            hasFile: true,
                            fileId: fileId,
                            filename: file.name,
                            fileSize: file.size < 1024 * 1024
                                ? (file.size / 1024).toFixed(1) + " KB"
                                : (file.size / (1024 * 1024)).toFixed(2) + " MB"
                        });
                        if (saveDocuments()) {
                            renderDocuments();
                        } else {
                            Object.assign(doc, previous);
                            await documentAttachmentStorage.delete(fileId);
                        }
                    } catch (error) {
                        console.error("Could not attach a file to the document:", error);
                        alert("The attachment could not be saved in this browser.");
                    }
                });
                uploadButton.addEventListener("click", function () {
                    uploadInput.click();
                });
                attachmentSection.append(badge, uploadButton, uploadInput);
            }

            const description = document.createElement("p");
            description.textContent = doc.description || "No description provided.";
            if (doc.feedback) {
                const feedback = document.createElement("p");
                feedback.className = "document-supervisor-feedback";
                feedback.textContent = "Supervisor feedback: " + doc.feedback;
                attachmentSection.appendChild(feedback);
            }

            const date = document.createElement("p");
            date.textContent = "Added: " + doc.date;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete Document";
            deleteButton.className = "delete-document-button";

            deleteButton.addEventListener("click", function () {
                const confirmed = confirm(
                    "Are you sure you want to delete this document record?"
                );

                if (!confirmed) return;

                const previousDocuments = documents;
                documents = documents.filter(function (item) {
                    return item.id !== doc.id;
                });

                if (saveDocuments()) {
                    if (doc.fileId) {
                        documentAttachmentStorage.delete(doc.fileId)
                            .catch(function (error) {
                                console.error("Could not remove document attachment:", error);
                            });
                    }
                    renderDocuments();
                } else {
                    documents = previousDocuments;
                }
            });

            card.append(title, category, attachmentSection, description, date, deleteButton);

            documentList.appendChild(card);
        });
    }

    documentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = fileInput.files[0] || null;

        if (file && file.size > MAX_FILE_SIZE) {
            alert("Choose a file that is 20 MB or smaller.");
            return;
        }

        let fileData;
        const submitButton = documentForm.querySelector('button[type="submit"]');
        if (file && submitButton) submitButton.disabled = true;
        if (file && uploadProgress) {
            uploadProgress.hidden = false;
            uploadProgress.value = 0;
        }
        if (file && uploadProgressText) {
            uploadProgressText.hidden = false;
            uploadProgressText.textContent = "Preparing file…";
        }

        if (file) {
            try {
                fileData = await readFileAsDataUrl(file, uploadProgress, uploadProgressText);
            } catch (error) {
                console.error("Could not read document file:", error);
                alert("The selected file could not be read. Please try again.");
                if (submitButton) submitButton.disabled = false;
                if (uploadProgress) uploadProgress.hidden = true;
                if (uploadProgressText) uploadProgressText.hidden = true;
                return;
            }
        }

        const documentId = Date.now().toString() + Math.random().toString(36).slice(2);
        const fileId = file ? documentId : null;
        const newDocument = {
            id: documentId,
            fileId: fileId,
            hasFile: Boolean(file),
            ...getStudentSubmissionMetadata(),
            title: titleInput.value.trim(),
            category: categoryInput.value,
            filename: file ? file.name : "",
            fileSize: file ? (file.size < 1024 * 1024
                ? (file.size / 1024).toFixed(1) + " KB"
                : (file.size / (1024 * 1024)).toFixed(2) + " MB") : "",
            description: descriptionInput.value.trim(),
            date: new Date().toLocaleDateString()
        };

        if (file) {
            try {
                await documentAttachmentStorage.put(fileId, fileData);
            } catch (error) {
                console.error("Could not save document attachment:", error);
                alert("The attachment could not be saved in this browser. Please try a smaller file or check available storage.");
                if (submitButton) submitButton.disabled = false;
                if (uploadProgress) uploadProgress.hidden = true;
                if (uploadProgressText) uploadProgressText.hidden = true;
                return;
            }
        }

        documents.unshift(newDocument);

        if (saveDocuments()) {
            renderDocuments();
            documentForm.reset();
            if (window.DraftManager) window.DraftManager.clear("document");
            showDocumentToast("Document added successfully");
        } else {
            documents.shift();
            if (fileId) {
                documentAttachmentStorage.delete(fileId).catch(function (error) {
                    console.error("Could not clean up failed document attachment:", error);
                });
            }
        }
        if (submitButton) submitButton.disabled = false;
        if (uploadProgress) uploadProgress.hidden = true;
        if (uploadProgressText) uploadProgressText.hidden = true;
    });

    if (new URLSearchParams(window.location.search).get("aiInsert") === "document") {
        try {
            const pendingInsert = JSON.parse(localStorage.getItem("spt-ai-insert"));
            if (pendingInsert && pendingInsert.target === "document" &&
                typeof pendingInsert.text === "string") {
                titleInput.value = typeof pendingInsert.title === "string"
                    ? pendingInsert.title
                    : "";
                descriptionInput.value = pendingInsert.text;
                localStorage.removeItem("spt-ai-insert");
                showDocumentToast("AI draft inserted. Choose a category and file to save it.");
            }
        } catch (error) {
            console.error("Could not insert the AI draft into the document form:", error);
            window.alert("The AI draft could not be opened in the document form.");
        }
    }

    renderDocuments();
})();

/* =========================================
   PROJECT SETTINGS
   ========================================= */

(function () {
    const studentForm = document.getElementById("student-settings-form");
    const projectForm = document.getElementById("project-settings-form");

    // Run only on the Settings page
    if (!studentForm || !projectForm) {
        return;
    }

    const studentFields = [
        "student-name",
        "matric-number",
        "department",
        "institution"
    ];

    const projectFields = [
        "project-title",
        "supervisor-name",
        "supervisor-id",
        "academic-session",
        "project-description"
    ];

    const studentKey = "spt-student-settings";
    const projectKey = "spt-project-settings";

    function loadSettings(key, fields) {
        try {
            const saved = JSON.parse(localStorage.getItem(key));

            if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
                return;
            }

            fields.forEach(function (id) {
                const field = document.getElementById(id);

                if (field && typeof saved[id] === "string") {
                    field.value = saved[id];
                }
            });
        } catch (error) {
            console.error("Unable to load settings:", error);
        }
    }

    function saveSettings(key, fields) {
        const settings = {};

        fields.forEach(function (id) {
            const field = document.getElementById(id);
            settings[id] = field.value.trim();
        });

        try {
            localStorage.setItem(key, JSON.stringify(settings));
            if (key === studentKey) {
                const project = JSON.parse(localStorage.getItem(projectKey) || "{}");
                const matric = settings["matric-number"];
                if (matric) {
                    const roster = JSON.parse(localStorage.getItem("students") || "[]");
                    const students = Array.isArray(roster) ? roster : [];
                    const studentRecord = Object.assign({}, students.find(function (item) {
                        return String(item.matric) === String(matric);
                    }) || {}, {
                        matric: matric,
                        name: settings["student-name"] || "Student",
                        project: project["project-title"] || "Project title not set",
                        stage: "Planning",
                        lastActive: new Date().toISOString(),
                        supervisorId: project["supervisor-id"] || project["supervisor-name"] || ""
                    });
                    const updated = students.filter(function (item) {
                        return String(item.matric) !== String(matric);
                    });
                    updated.push(studentRecord);
                    localStorage.setItem("students", JSON.stringify(updated));
                }
            }
            if (key === projectKey) {
                const student = JSON.parse(localStorage.getItem(studentKey) || "{}");
                const matric = student["matric-number"];
                if (matric) {
                    const roster = JSON.parse(localStorage.getItem("students") || "[]");
                    const students = Array.isArray(roster) ? roster : [];
                    const existing = students.find(function (item) {
                        return String(item.matric) === String(matric);
                    });
                    if (existing) {
                        existing.project = settings["project-title"] || "Project title not set";
                        existing.supervisorId = settings["supervisor-id"] ||
                            settings["supervisor-name"] || "";
                        localStorage.setItem("students", JSON.stringify(students));
                    }
                }
            }
            updateDashboardFromSettings();
            alert("Your settings have been saved successfully!");
            return true;
        } catch (error) {
            alert("Unable to save your settings. Please check your browser storage.");
            return false;
        }
    }

    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        saveSettings(studentKey, studentFields);
    });

    projectForm.addEventListener("submit", function (event) {
        event.preventDefault();
        saveSettings(projectKey, projectFields);
    });

    loadSettings(studentKey, studentFields);
    loadSettings(projectKey, projectFields);
})();

/* =========================================
   DATA MANAGEMENT — EXPORT PROJECT BACKUP
   ========================================= */

(function () {
    const exportButton = document.getElementById("export-backup-button");
    const backupStatus = document.getElementById("backup-status");

    // Run only on the Data Management page
    if (!exportButton || !backupStatus) {
        return;
    }

    exportButton.addEventListener("click", async function () {
        const storageKeys = [
            "spt-tasks",
            "spt-journals",
            "spt-documents",
            "spt-student-settings",
            "spt-project-settings",
            "spt-activity"
        ];

        const backup = {
            application: "Student Project Progress Tracking System",
            backupDate: new Date().toISOString(),
            data: {}
        };

        try {
            storageKeys.forEach(function (key) {
                const savedData = localStorage.getItem(key);

                if (savedData !== null) {
                    backup.data[key] = JSON.parse(savedData);
                } else {
                    backup.data[key] = null;
                }
            });

            const savedDocuments = backup.data["spt-documents"];
            if (Array.isArray(savedDocuments)) {
                for (const documentRecord of savedDocuments) {
                    if (documentRecord.fileId && !documentRecord.fileData) {
                        const fileData = await documentAttachmentStorage.get(documentRecord.fileId);
                        if (!fileData) {
                            throw new Error(
                                "An attachment is missing from browser storage: " +
                                documentRecord.filename
                            );
                        }
                        documentRecord.fileData = fileData;
                    }
                }
            }

            const backupContent = JSON.stringify(backup, null, 2);
            const backupBlob = new Blob(
                [backupContent],
                { type: "application/json" }
            );

            const downloadUrl = URL.createObjectURL(backupBlob);
            const downloadLink = document.createElement("a");

            downloadLink.href = downloadUrl;
            downloadLink.download =
                "spt-backup-" + new Date().toISOString().slice(0, 10) + ".json";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            URL.revokeObjectURL(downloadUrl);

            backupStatus.textContent =
                "Your project backup has been exported successfully.";
        } catch (error) {
            console.error("Backup export failed:", error);

            backupStatus.textContent =
                "Backup failed. Please check your saved project data and try again.";
        }
    });
})();

/* =========================================
   DATA MANAGEMENT — RESTORE PROJECT BACKUP
   ========================================= */

(function () {
    const restoreButton = document.getElementById("restore-backup-button");
    const fileInput = document.getElementById("restore-backup-file");
    const restoreStatus = document.getElementById("restore-status");
    const cancelRestoreButton = document.getElementById("cancel-restore-button");

    // Run only on the Data Management page
    if (!restoreButton || !fileInput || !restoreStatus) {
        return;
    }

    restoreButton.addEventListener("click", async function () {
        const file = fileInput.files[0];

        if (!file) {
            restoreStatus.textContent =
                "Please select a JSON backup file first.";
            return;
        }

        try {
            const fileText = await file.text();
            const backup = JSON.parse(fileText);

            const requiredKeys = [
                "spt-tasks",
                "spt-journals",
                "spt-documents",
                "spt-student-settings",
                "spt-project-settings"
            ];
            const activityKey = "spt-activity";
            const storageKeys = requiredKeys.concat(activityKey);

            if (
                !backup ||
                backup.application !==
                    "Student Project Progress Tracking System" ||
                !backup.data ||
                typeof backup.data !== "object" ||
                Array.isArray(backup.data)
            ) {
                throw new Error("Invalid backup format.");
            }

            for (const key of requiredKeys) {
                if (!Object.prototype.hasOwnProperty.call(backup.data, key)) {
                    throw new Error("The backup is missing required data.");
                }
            }

            if (!Object.prototype.hasOwnProperty.call(backup.data, activityKey)) {
                backup.data[activityKey] = null;
            }

            for (const key of storageKeys) {
                const value = backup.data[key];

                if (value !== null && typeof value !== "object") {
                    throw new Error("The backup contains invalid data.");
                }

                if (["spt-tasks", "spt-journals", "spt-documents", activityKey]
                    .includes(key) && value !== null && !Array.isArray(value)) {
                    throw new Error("The backup contains invalid list data.");
                }

                if (["spt-student-settings", "spt-project-settings"]
                    .includes(key) && value !== null && Array.isArray(value)) {
                    throw new Error("The backup contains invalid settings data.");
                }

                if (key === "spt-tasks" && value !== null && !value.every(function (task) {
                    return task && typeof task === "object" && !Array.isArray(task) &&
                        (typeof task.id === "string" || typeof task.id === "number") &&
                        typeof task.title === "string";
                })) {
                    throw new Error("Invalid task data.");
                }

                if (key === "spt-journals" && value !== null && !value.every(function (entry) {
                    return entry && typeof entry === "object" && !Array.isArray(entry) &&
                        typeof entry.week === "string" && typeof entry.date === "string" &&
                        typeof entry.work === "string" && typeof entry.nextWeek === "string";
                })) {
                    throw new Error("Invalid journal data.");
                }

                if (key === "spt-documents" && value !== null && !value.every(function (doc) {
                    return doc && typeof doc === "object" && !Array.isArray(doc) &&
                        (typeof doc.id === "string" || typeof doc.id === "number") &&
                        typeof doc.title === "string" && typeof doc.filename === "string" &&
                        (doc.fileData === undefined ||
                            (typeof doc.fileData === "string" &&
                                doc.fileData.startsWith("data:") &&
                                doc.fileData.includes(";base64,")));
                })) {
                    throw new Error("Invalid document data.");
                }

                if (key === activityKey && value !== null && !value.every(function (entry) {
                    return entry && typeof entry === "object" && !Array.isArray(entry) &&
                        typeof entry.action === "string" && typeof entry.title === "string" &&
                        typeof entry.date === "string";
                })) {
                    throw new Error("Invalid activity data.");
                }
            }

            const confirmed = window.confirm(
                "Restoring this backup will replace your current saved project data. " +
                "Export a backup of your current data first if you may need it. " +
                "Do you want to continue?"
            );

            if (!confirmed) {
                restoreStatus.textContent = "Restore cancelled. Your data was not changed.";
                return;
            }

            // Keep a temporary copy so a failed restore can be rolled back.
            const previousData = {};

            for (const key of storageKeys) {
                previousData[key] = localStorage.getItem(key);
            }

            try {
                const restoredDocuments = backup.data["spt-documents"];
                if (Array.isArray(restoredDocuments)) {
                    const storedDocuments = [];
                    for (const documentRecord of restoredDocuments) {
                        const restoredDocument = Object.assign({}, documentRecord);
                        if (typeof restoredDocument.fileData === "string" &&
                            restoredDocument.fileData.startsWith("data:")) {
                            const attachmentId = "restore-" + Date.now() + "-" +
                                Math.random().toString(36).slice(2);
                            await documentAttachmentStorage.put(
                                attachmentId,
                                restoredDocument.fileData
                            );
                            restoredDocument.fileId = attachmentId;
                            delete restoredDocument.fileData;
                        }
                        storedDocuments.push(restoredDocument);
                    }
                    backup.data["spt-documents"] = storedDocuments;
                }

                for (const key of storageKeys) {
                    const value = backup.data[key];

                    if (value === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                }
            } catch (error) {
                // Attempt to restore the original values if saving fails.
                for (const key of storageKeys) {
                    try {
                        if (previousData[key] === null) {
                            localStorage.removeItem(key);
                        } else {
                            localStorage.setItem(key, previousData[key]);
                        }
                    } catch (rollbackError) {
                        console.error("Could not roll back:", rollbackError);
                    }
                }

                throw error;
            }

            restoreStatus.textContent =
                "Backup restored successfully! Refresh the page to see the restored information.";

        } catch (error) {
            console.error("Backup restore failed:", error);

            restoreStatus.textContent =
                "Restore failed. Please select a valid backup exported from this system. Your data may be unchanged; if an error occurred during saving, check your project pages.";
        }
    });
    cancelRestoreButton.addEventListener("click", function () {
        fileInput.value = "";
        restoreStatus.textContent = "Restore cancelled. No data was changed.";
    });
})();