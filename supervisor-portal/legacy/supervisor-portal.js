(function () {
    const page = document.querySelector("[data-supervisor-page]");
    if (!page) return;

    function readJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null ? fallback : value;
        } catch (error) {
            console.error("Could not read " + key + " from local storage:", error);
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save " + key + " to local storage:", error);
            return false;
        }
    }

    function identity(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getCurrentProfile() {
        const student = readJson("spt-student-settings", {});
        const project = readJson("spt-project-settings", {});
        const matric = student["matric-number"] || "";
        if (!matric) return null;
        return {
            matric: matric,
            name: student["student-name"] || "Student",
            project: project["project-title"] || "Project title not set",
            supervisorId: project["supervisor-id"] || project["supervisor-name"] || ""
        };
    }

    function getRoster(supervisorId) {
        const records = readJson("spt-supervisor-students", []);
        const roster = Array.isArray(records)
            ? records.filter(function (student) {
                return student && identity(student.assignedSupervisorId) === identity(supervisorId);
            }).map(function (student) {
                return Object.assign({}, student, {
                    matric: student.matric || student.matricNumber ||
                        student.matricNo || student["matric-number"] || "",
                    name: student.name || student.studentName || "Student",
                    project: student.project || student.projectTitle || "Project title not set"
                });
            }).filter(function (student) { return Boolean(student.matric); })
            : [];
        const current = getCurrentProfile();
        if (current && identity(current.supervisorId) === identity(supervisorId) &&
            !roster.some(function (student) { return String(student.matric) === String(current.matric); })) {
            roster.push(current);
        }
        return roster;
    }

    function requireSupervisor() {
        const supervisorId = localStorage.getItem("supervisorId");
        if (!supervisorId) {
            window.location.href = page.dataset.supervisorPage === "student"
                ? "../login/"
                : "./login/";
            return null;
        }
        return supervisorId;
    }

    document.querySelectorAll("#supervisor-logout").forEach(function (button) {
        button.addEventListener("click", function () {
            localStorage.removeItem("supervisorId");
            window.location.href = page.dataset.supervisorPage === "student"
                ? "../login/"
                : "./login/";
        });
    });

    if (page.dataset.supervisorPage === "login") {
        const form = document.getElementById("supervisor-login-form");
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const supervisorId = document.getElementById("supervisor-login-id").value.trim();
            if (!supervisorId) return;
            try {
                localStorage.setItem("supervisorId", supervisorId);
            } catch (error) {
                console.error("Could not save supervisor login:", error);
                document.getElementById("supervisor-login-status").textContent =
                    "The login could not be saved in this browser.";
                return;
            }
            window.location.href = "../";
        });
        return;
    }

    const supervisorId = requireSupervisor();
    if (!supervisorId) return;

    function getStudentRecords(matric) {
        const current = getCurrentProfile();
        function studentItems(key) {
            const items = readJson(key, []);
            if (!Array.isArray(items)) return [];
            return items.filter(function (item) {
                if (String(item.studentMatric || "") === String(matric)) {
                    return !item.supervisorId ||
                        identity(item.supervisorId) === identity(supervisorId);
                }
                return !item.studentMatric && current &&
                    String(current.matric) === String(matric);
            });
        }
        return {
            tasks: studentItems("spt-tasks"),
            documents: studentItems("spt-documents"),
            journal: studentItems("spt-journals")
        };
    }

    function countProgress(tasks) {
        return tasks.length
            ? Math.round(tasks.filter(function (task) {
                return String(task.status || "").toLowerCase() === "completed";
            }).length / tasks.length * 100)
            : 0;
    }

    function relativeTime(value) {
        if (!value) return "2h ago";
        const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
        const minutes = Math.floor(elapsed / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + "h ago";
        return Math.floor(hours / 24) + "d ago";
    }

    function countNewSubmissions(student, records) {
        const viewedAt = Number(localStorage.getItem(
            "supervisor-viewed-" + identity(supervisorId) + "-" + student.matric
        )) || 0;
        return records.tasks.concat(records.documents).filter(function (record) {
            return record.createdAt && new Date(record.createdAt).getTime() > viewedAt;
        }).length;
    }

    if (page.dataset.supervisorPage === "dashboard") {
        const roster = getRoster(supervisorId);
        document.getElementById("supervisor-student-count").textContent = String(roster.length);
        const list = document.getElementById("supervisor-student-list");
        if (!roster.length) {
            const message = document.createElement("p");
            message.className = "activity-empty";
            message.textContent = "No students are assigned to this supervisor ID. Match the ID in Project Settings or add assigned students to the local roster.";
            list.appendChild(message);
            return;
        }

        roster.forEach(function (student) {
            const records = getStudentRecords(student.matric);
            const card = document.createElement("a");
            card.className = "portal-student-card";
            card.href = "student/?matric=" + encodeURIComponent(student.matric);
            const name = document.createElement("h2");
            name.textContent = student.name || "Student";
            const matric = document.createElement("p");
            matric.textContent = "Matric No: " + student.matric;
            const project = document.createElement("p");
            project.className = "portal-project-title";
            project.textContent = student.project || "Project title not set";
            const stage = document.createElement("span");
            const latestTask = records.tasks[0];
            stage.className = "portal-stage-badge";
            stage.textContent = latestTask && latestTask.stage || "Planning";
            const percent = countProgress(records.tasks);
            const progressLabel = document.createElement("p");
            progressLabel.textContent = "Progress: " + percent + "%";
            const progressTrack = document.createElement("div");
            progressTrack.className = "portal-progress-track";
            const progressFill = document.createElement("div");
            progressFill.className = "portal-progress-fill";
            progressFill.style.width = percent + "%";
            progressTrack.appendChild(progressFill);
            const lastActivity = records.tasks.concat(records.documents, records.journal)
                .map(function (item) { return item.createdAt; })
                .filter(Boolean)
                .sort()
                .pop();
            const active = document.createElement("p");
            active.appendChild(document.createTextNode("Last Active: " + relativeTime(lastActivity)));
            const lastJournal = records.journal.map(function (item) {
                return new Date(item.createdAt || item.date).getTime();
            }).filter(Number.isFinite).sort().pop();
            if (!lastJournal || Date.now() - lastJournal > 7 * 24 * 60 * 60 * 1000) {
                const dot = document.createElement("span");
                dot.className = "portal-no-journal";
                dot.title = "No journal entry in the last 7 days";
                dot.setAttribute("aria-label", "No journal entry in the last 7 days");
                active.appendChild(dot);
            }
            card.append(name, matric, project, stage, progressLabel, progressTrack, active);
            const newCount = countNewSubmissions(student, records);
            if (newCount) {
                const badge = document.createElement("span");
                badge.className = "portal-notification-badge";
                badge.textContent = newCount + " new submissions";
                card.appendChild(badge);
            }
            list.appendChild(card);
        });
        return;
    }

    if (page.dataset.supervisorPage !== "student") return;

    const requestedMatric = new URLSearchParams(window.location.search).get("matric");
    const student = getRoster(supervisorId).find(function (record) {
        return String(record.matric) === String(requestedMatric);
    });
    if (!student) {
        window.location.replace("../");
        return;
    }

    const records = getStudentRecords(student.matric);
    document.getElementById("portal-student-name").textContent = student.name || "Student";
    document.getElementById("portal-student-project").textContent =
        (student.matric || "") + " · " + (student.project || "Project title not set");
    writeJson(
        "supervisor-viewed-" + identity(supervisorId) + "-" + student.matric,
        Date.now()
    );

    function appendEmpty(panel, text) {
        const empty = document.createElement("p");
        empty.className = "activity-empty";
        empty.textContent = text;
        panel.appendChild(empty);
    }

    const tasksPanel = document.getElementById("portal-tab-tasks");
    if (!records.tasks.length) appendEmpty(tasksPanel, "No tasks submitted.");
    records.tasks.forEach(function (task) {
        const row = document.createElement("article");
        row.className = "portal-data-row";
        const title = document.createElement("h3");
        title.textContent = task.title || "Untitled task";
        const details = document.createElement("p");
        details.textContent = (task.stage || "Planning") + " · " +
            (task.priority || "No priority") + " · " + (task.status || "Pending") +
            (task.deadline ? " · Due " + task.deadline : "");
        const description = document.createElement("p");
        description.textContent = task.description || "No description.";
        row.append(title, details, description);
        tasksPanel.appendChild(row);
    });

    const documentsPanel = document.getElementById("portal-tab-documents");
    if (!records.documents.length) appendEmpty(documentsPanel, "No documents submitted.");
    records.documents.forEach(function (record) {
        const row = document.createElement("article");
        row.className = "portal-data-row";
        const title = document.createElement("h3");
        title.textContent = record.title || "Untitled document";
        const details = document.createElement("p");
        details.textContent = (record.category || "Document") + " · " +
            (record.description || "No description.");
        row.append(title, details);
        const hasFile = typeof record.hasFile === "boolean"
            ? record.hasFile
            : Boolean(record.fileId || record.fileData);
        if (hasFile) {
            const link = document.createElement("a");
            link.textContent = "Preparing download…";
            if (record.fileData && record.fileData.startsWith("data:")) {
                link.href = record.fileData;
                link.download = record.filename || "project-document";
                link.textContent = "Download " + (record.filename || "file");
            } else if (record.fileId) {
                const request = indexedDB.open("project-tracker-files", 2);
                request.addEventListener("success", function () {
                    const transaction = request.result.transaction("attachments", "readonly");
                    const getRequest = transaction.objectStore("attachments").get(record.fileId);
                    getRequest.addEventListener("success", function () {
                        if (getRequest.result && getRequest.result.data) {
                            link.href = getRequest.result.data;
                            link.download = record.filename || "project-document";
                            link.textContent = "Download " + (record.filename || "file");
                        } else {
                            link.textContent = "File unavailable in browser storage.";
                        }
                    });
                    getRequest.addEventListener("error", function () {
                        link.textContent = "File unavailable in browser storage.";
                    });
                });
                request.addEventListener("error", function () {
                    link.textContent = "File unavailable in browser storage.";
                });
            } else {
                link.textContent = "File unavailable in browser storage.";
            }
            row.appendChild(link);
        } else {
            const noFile = document.createElement("span");
            noFile.className = "document-no-file-badge";
            noFile.textContent = "No file attached";
            row.appendChild(noFile);
        }
        const feedbackForm = document.createElement("form");
        feedbackForm.className = "portal-feedback-form";
        const feedbackLabel = document.createElement("label");
        feedbackLabel.textContent = "Feedback";
        const textarea = document.createElement("textarea");
        textarea.value = record.feedback || "";
        textarea.setAttribute("aria-label", "Feedback for " + (record.title || "document"));
        const send = document.createElement("button");
        send.type = "submit";
        send.textContent = "Send Feedback";
        const status = document.createElement("span");
        status.setAttribute("role", "status");
        feedbackForm.append(feedbackLabel, textarea, send, status);
        feedbackForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const stored = readJson("spt-documents", []);
            if (!Array.isArray(stored)) {
                status.textContent = "Document records could not be loaded.";
                return;
            }
            const target = stored.find(function (item) {
                if (item.id !== record.id) return false;
                if (String(item.studentMatric || "") === String(student.matric)) return true;
                return !item.studentMatric && currentStudent &&
                    String(currentStudent.matric) === String(student.matric);
            });
            if (!target) {
                status.textContent = "This document record is no longer available.";
                return;
            }
            target.feedback = textarea.value.trim();
            target.feedbackAt = new Date().toISOString();
            if (writeJson("spt-documents", stored)) {
                status.textContent = "Feedback saved for the student.";
            } else {
                status.textContent = "Feedback could not be saved.";
            }
        });
        row.appendChild(feedbackForm);
        documentsPanel.appendChild(row);
    });

    const journalPanel = document.getElementById("portal-tab-journal");
    if (!records.journal.length) appendEmpty(journalPanel, "No journal entries submitted.");
    records.journal.forEach(function (entry) {
        const row = document.createElement("article");
        row.className = "portal-data-row";
        const heading = document.createElement("h3");
        heading.textContent = "Week " + entry.week + " · " + (entry.date || "");
        const work = document.createElement("p");
        work.textContent = entry.work || "No work details.";
        row.append(heading, work);
        journalPanel.appendChild(row);
    });

    const chatPanel = document.getElementById("portal-tab-chat");
    const currentStudent = getCurrentProfile();
    const chats = currentStudent && String(currentStudent.matric) === String(student.matric)
        ? readJson("spt-supervisor-chat-messages", {})
        : {};
    const messages = Object.values(chats).flat().filter(function (message) {
        return message && (message.author === "student" || message.author === "supervisor");
    });
    if (!messages.length) appendEmpty(chatPanel, "No chat messages are available.");
    messages.forEach(function (message) {
        const row = document.createElement("article");
        row.className = "portal-data-row";
        const author = document.createElement("strong");
        author.textContent = message.author === "student" ? "Student" : "Supervisor";
        const text = document.createElement("p");
        text.textContent = message.text || "";
        row.append(author, text);
        chatPanel.appendChild(row);
    });

    document.querySelectorAll("[data-portal-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
            const selected = button.dataset.portalTab;
            document.querySelectorAll("[data-portal-tab]").forEach(function (tab) {
                tab.setAttribute("aria-selected", String(tab === button));
            });
            document.querySelectorAll("[id^='portal-tab-']").forEach(function (panel) {
                panel.hidden = panel.id !== "portal-tab-" + selected;
            });
        });
    });

    const reviewKey = "spt-supervisor-reviews";
    const reviews = readJson(reviewKey, {});
    const studentReview = reviews[student.matric] &&
        reviews[student.matric][identity(supervisorId)] || {};
    document.getElementById("portal-stage-status").value = studentReview.status || "Pending";
    document.getElementById("portal-stage-deadline").value = studentReview.deadline || "";
    document.getElementById("portal-save-review").addEventListener("click", function () {
        const latest = readJson(reviewKey, {});
        if (!latest[student.matric]) latest[student.matric] = {};
        latest[student.matric][identity(supervisorId)] = {
            status: document.getElementById("portal-stage-status").value,
            deadline: document.getElementById("portal-stage-deadline").value,
            updatedAt: new Date().toISOString()
        };
        const status = document.getElementById("portal-review-status");
        status.textContent = writeJson(reviewKey, latest)
            ? "Review saved."
            : "Review could not be saved.";
    });
})();
