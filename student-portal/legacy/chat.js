(function () {
    "use strict";

    const storageKey = "spt-supervisor-feedback";
    const stages = [
        { name: "Planning", icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"/><path d=\"M8 7h8M8 11h8M8 15h5\"/>" },
        { name: "Research", icon: "<circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\"/><path d=\"m16 16 4.5 4.5\"/>" },
        { name: "Design", icon: "<path d=\"M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.4-3 1.8 1.8 0 0 1 1.4-3H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z\"/>" },
        { name: "Development", icon: "<path d=\"m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16\"/>" },
        { name: "Testing", icon: "<path d=\"M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 15h8\"/>" },
        { name: "Documentation", icon: "<path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/>" }
    ];
    let feedback = loadFeedback();

    function loadFeedback() {
        try {
            let student = {};
            try {
                student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
            } catch (error) {
                console.error("Could not load student information for feedback:", error);
            }
            const matric = student["matric-number"] || "";
            const perStudent = matric
                ? JSON.parse(localStorage.getItem("feedback_" + matric) || "null")
                : null;
            const sharedFeedbacks = JSON.parse(localStorage.getItem("feedbacks") || "{}");
            const sharedStudent = matric ? sharedFeedbacks[matric] : null;
            const legacy = JSON.parse(localStorage.getItem(storageKey) || "null");
            const stageFeedback = Object.assign(
                {},
                legacy && typeof legacy === "object" ? legacy : {},
                sharedStudent && sharedStudent.stages || {},
                perStudent && perStudent.stages || {}
            );
            return stageFeedback;
        } catch (error) {
            console.error("Could not load supervisor feedback:", error);
            return {};
        }
    }

    function createIcon(contents) {
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
    }

    function getFeedback(stage) {
        const entry = feedback[stage];
        return entry && typeof entry === "object"
            ? entry
            : { rating: null, comment: "" };
    }

    function hasRating(entry) {
        return entry.rating !== null && entry.rating !== undefined &&
            entry.rating !== "" && Number.isFinite(Number(entry.rating));
    }

    function getInitials(name) {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return (parts[0] || "DS").slice(0, 2).toUpperCase();
    }

    function renderSupervisorMessage(list, message) {
        const student = message.author === "student";
        const row = document.createElement("article");
        row.className = "supervisor-chat-row " + (student ? "student-chat-row" : "supervisor-chat-row-received");

        const avatar = document.createElement("span");
        avatar.className = "chat-avatar " + (student ? "student-chat-avatar" : "supervisor-chat-avatar");
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = student
            ? "S"
            : (message.initials || getInitials(message.authorName || "Dr. Smith"));

        const bubble = document.createElement("div");
        bubble.className = "chat-message supervisor-chat-message" +
            (student ? " student-message" : "");

        const meta = document.createElement("span");
        meta.className = "chat-message-meta";
        meta.textContent = student ? "You" : (message.authorName || "Dr. Smith");

        const content = document.createElement("p");
        content.textContent = message.text;
        bubble.append(meta, content);

        const footer = document.createElement("div");
        footer.className = "supervisor-message-footer";
        const timestamp = document.createElement("time");
        timestamp.textContent = message.time || "";
        footer.appendChild(timestamp);

        if (student) {
            const deliveryStatus = ["sent", "delivered", "read"].includes(message.status)
                ? message.status
                : "sent";
            const status = document.createElement("span");
            status.className = "message-delivery-status status-" + deliveryStatus;
            status.setAttribute("role", "img");
            status.setAttribute("aria-label", deliveryStatus);
            status.title = deliveryStatus.charAt(0).toUpperCase() + deliveryStatus.slice(1);
            status.innerHTML = deliveryStatus === "sent"
                ? "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m5 12 4 4L19 6\"/></svg>"
                : "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m2 12 4 4L16 6M9 12l4 4 9-10\"/></svg>";
            footer.appendChild(status);
        }

        bubble.appendChild(footer);
        if (student) {
            row.append(avatar, bubble);
        } else {
            row.append(bubble, avatar);
        }
        list.appendChild(row);
    }

    function renderConversationMessage(list, author, text, student) {
        const message = document.createElement("article");
        message.className = "chat-message" + (student ? " student-message" : "");
        const meta = document.createElement("span");
        meta.className = "chat-message-meta";
        meta.textContent = author;
        const content = document.createElement("p");
        content.textContent = text;
        message.append(meta, content);
        list.appendChild(message);
    }

    function renderSupervisorChat() {
        const app = document.getElementById("supervisor-chat-app");
        if (!app) return;

        const buttons = document.getElementById("supervisor-stage-buttons");
        const heading = document.getElementById("supervisor-stage-heading");
        const summary = document.getElementById("supervisor-stage-summary");
        const history = document.getElementById("supervisor-feedback-history");
        const messages = document.getElementById("supervisor-message-list");
        const feedbackList = document.getElementById("student-feedback-list");
        const chatForm = document.getElementById("supervisor-chat-form");
        const chatInput = document.getElementById("supervisor-chat-input");
        const sendButton = chatForm && chatForm.querySelector(".chat-send-button");
        const statusDot = document.getElementById("supervisor-status-dot");
        const statusText = document.getElementById("supervisor-status-text");
        const supervisorNameLabel = document.getElementById("supervisor-name-label");
        const supervisorAvatar = document.getElementById("supervisor-avatar-initials");
        const presenceKey = "spt-supervisor-presence";
        const messagesKey = "spt-supervisor-chat-messages";
        let selectedStage = "Research";
        let conversations = {};
        let typingTimeout = null;
        let typingStage = null;
        let supervisorName = "Dr. Smith";

        try {
            const projectSettings = JSON.parse(localStorage.getItem("spt-project-settings"));
            if (projectSettings && typeof projectSettings["supervisor-name"] === "string" &&
                projectSettings["supervisor-name"].trim()) {
                supervisorName = projectSettings["supervisor-name"].trim();
            }
        } catch (error) {
            console.error("Could not load the supervisor name:", error);
        }
        if (supervisorNameLabel) supervisorNameLabel.textContent = supervisorName;
        if (supervisorAvatar) supervisorAvatar.textContent = getInitials(supervisorName);

        function loadPresence() {
            const fallback = { isActive: true, lastSeen: "today at 8:32pm" };
            try {
                const saved = JSON.parse(localStorage.getItem(presenceKey));
                if (!saved || typeof saved !== "object" || Array.isArray(saved) ||
                    typeof saved.isActive !== "boolean") {
                    localStorage.setItem(presenceKey, JSON.stringify(fallback));
                    return fallback;
                }
                return {
                    isActive: saved.isActive,
                    lastSeen: typeof saved.lastSeen === "string" && saved.lastSeen.trim()
                        ? saved.lastSeen
                        : fallback.lastSeen
                };
            } catch (error) {
                console.error("Could not load supervisor presence:", error);
                return fallback;
            }
        }

        const presence = loadPresence();

        function renderPresence() {
            if (!statusDot || !statusText) return;
            statusDot.classList.toggle("is-active", presence.isActive);
            statusText.textContent = presence.isActive
                ? "Active now"
                : "Last seen " + presence.lastSeen;
        }

        function updateSendButton() {
            if (sendButton) sendButton.disabled = !chatInput.value.trim();
        }
        chatInput.addEventListener("input", updateSendButton);
        updateSendButton();

        function createSeedConversation(stageName) {
            const entry = getFeedback(stageName);
            const conversation = [];
            if (entry.comment) {
                conversation.push({
                    id: stageName + "-feedback",
                    author: "supervisor",
                    authorName: supervisorName,
                    initials: getInitials(supervisorName),
                    text: entry.comment,
                    time: "",
                    isFeedback: true
                });
            }
            conversation.push({
                    id: stageName + "-reply",
                    author: "student",
                    text: "Thanks for the feedback. I'll update the " +
                        stageName.toLowerCase() + " work.",
                    status: "read",
                    time: ""
                });
            return conversation;
        }

        function loadConversations() {
            try {
                const saved = JSON.parse(localStorage.getItem(messagesKey));
                if (saved && typeof saved === "object" && !Array.isArray(saved)) {
                    stages.forEach(function (stage) {
                        const items = saved[stage.name];
                        conversations[stage.name] = Array.isArray(items) &&
                            items.every(function (item) {
                                return item && typeof item === "object" &&
                                    (item.author === "student" || item.author === "supervisor") &&
                                    typeof item.text === "string" &&
                                    (!item.status || ["sent", "delivered", "read"].includes(item.status));
                            })
                            ? items
                            : createSeedConversation(stage.name);
                    });
                } else {
                    stages.forEach(function (stage) {
                        conversations[stage.name] = createSeedConversation(stage.name);
                    });
                }
                saveConversations();
            } catch (error) {
                console.error("Could not load supervisor chat messages:", error);
                stages.forEach(function (stage) {
                    conversations[stage.name] = createSeedConversation(stage.name);
                });
            }
        }

        function saveConversations() {
            try {
                localStorage.setItem(messagesKey, JSON.stringify(conversations));
                return true;
            } catch (error) {
                console.error("Could not save supervisor chat messages:", error);
                window.alert("Unable to save chat messages in this browser.");
                return false;
            }
        }

        function formatMessageTime() {
            return new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });
        }

        function renderTypingIndicator() {
            const existingIndicator = document.getElementById("supervisor-typing-indicator");
            if (existingIndicator) existingIndicator.remove();
            const indicator = document.createElement("div");
            indicator.className = "supervisor-typing-indicator";
            indicator.id = "supervisor-typing-indicator";
            indicator.setAttribute("role", "status");
            const dots = document.createElement("span");
            dots.className = "typing-dots";
            dots.setAttribute("aria-hidden", "true");
            dots.innerHTML = "<span></span><span></span><span></span>";
            const text = document.createElement("span");
            text.textContent = "Supervisor is typing...";
            indicator.append(dots, text);
            messages.appendChild(indicator);
            messages.scrollTop = messages.scrollHeight;
        }

        function renderStageMessages() {
            messages.replaceChildren();
            conversations[selectedStage].forEach(function (message) {
                renderSupervisorMessage(messages, message);
            });
            if (typingStage === selectedStage) renderTypingIndicator();
            messages.scrollTop = messages.scrollHeight;
        }

        function updateHistory() {
            history.replaceChildren();
            stages.forEach(function (stage) {
                const entry = getFeedback(stage.name);
                if (!entry.comment && !hasRating(entry)) return;
                const chip = document.createElement("span");
                chip.className = "feedback-chip";
                chip.textContent = stage.name +
                    (hasRating(entry) ? " " + entry.rating + "/10" : "");
                history.appendChild(chip);
            });
            renderStudentFeedback();
        }

        function renderStudentFeedback() {
            if (!feedbackList) return;
            feedbackList.replaceChildren();
            stages.forEach(function (stage) {
                const entry = getFeedback(stage.name);
                if (!entry.comment && !hasRating(entry)) return;
                const card = document.createElement("article");
                card.className = "student-feedback-item";
                const heading = document.createElement("h4");
                heading.textContent = stage.name + " feedback";
                const body = document.createElement("p");
                body.textContent = entry.comment || "No written feedback.";
                const rating = document.createElement("strong");
                rating.textContent = hasRating(entry)
                    ? "Rating: " + entry.rating + "/10"
                    : "Rating not provided";
                card.append(heading, body, rating);
                if (entry.action) {
                    const action = document.createElement("p");
                    action.className = "student-feedback-action";
                    action.textContent = "Action: " + entry.action;
                    card.appendChild(action);
                }
                feedbackList.appendChild(card);
            });
            const matric = (function () {
                try {
                    const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
                    return student["matric-number"] || "";
                } catch (error) {
                    console.error("Could not read the student ID for document feedback:", error);
                    return "";
                }
            })();
            if (matric) {
                try {
                    const perStudent = JSON.parse(localStorage.getItem("feedback_" + matric) || "null");
                    const documents = perStudent && perStudent.documents || {};
                    Object.keys(documents).forEach(function (id) {
                        const entry = documents[id];
                        if (!entry || (!entry.comment && !hasRating(entry))) return;
                        const card = document.createElement("article");
                        card.className = "student-feedback-item";
                        const heading = document.createElement("h4");
                        const studentDocuments = JSON.parse(localStorage.getItem("documents") || "[]");
                        const doc = Array.isArray(studentDocuments)
                            ? studentDocuments.find(function (item) { return String(item.id) === String(id); })
                            : null;
                        heading.textContent = (doc && doc.title ? doc.title + " — " : "") +
                            "Document feedback";
                        const body = document.createElement("p");
                        body.textContent = entry.comment || "No written feedback.";
                        const rating = document.createElement("strong");
                        rating.textContent = hasRating(entry)
                            ? "Rating: " + entry.rating + "/10"
                            : "Rating not provided";
                        card.append(heading, body, rating);
                        if (entry.action) {
                            const action = document.createElement("p");
                            action.className = "student-feedback-action";
                            action.textContent = "Action: " + entry.action;
                            card.appendChild(action);
                        }
                        feedbackList.appendChild(card);
                    });
                } catch (error) {
                    console.error("Could not display supervisor document feedback:", error);
                }
            }
            if (!feedbackList.children.length) {
                const empty = document.createElement("p");
                empty.className = "chat-feedback-summary";
                empty.textContent = "No supervisor feedback has been shared yet.";
                feedbackList.appendChild(empty);
            }
        }

        function selectStage(stageName) {
            selectedStage = stageName;
            const entry = getFeedback(stageName);
            heading.textContent = stageName;
            summary.textContent = entry.comment
                ? (hasRating(entry)
                    ? "Supervisor rating: " + entry.rating + "/10"
                    : "Supervisor feedback available")
                : "No supervisor feedback recorded for this stage.";
            buttons.querySelectorAll("[data-chat-stage]").forEach(function (button) {
                const selected = button.dataset.chatStage === stageName;
                button.classList.toggle("selected", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
            renderStageMessages();
        }

        stages.forEach(function (stage) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "chat-stage-button";
            button.dataset.chatStage = stage.name;
            button.append(createIcon(stage.icon));
            const label = document.createElement("span");
            label.textContent = stage.name;
            button.appendChild(label);
            button.addEventListener("click", function () {
                selectStage(stage.name);
            });
            buttons.appendChild(button);
        });

        loadConversations();
        renderPresence();

        chatForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const text = chatInput.value.trim();
            if (!text) {
                chatInput.focus();
                return;
            }

            const stageAtSend = selectedStage;
            const sentMessage = {
                id: "student-" + Date.now() + "-" + Math.random().toString(36).slice(2),
                author: "student",
                text: text,
                status: "sent",
                time: formatMessageTime()
            };
            conversations[stageAtSend].push(sentMessage);
            if (!saveConversations()) {
                conversations[stageAtSend].pop();
                return;
            }
            chatInput.value = "";
            updateSendButton();
            if (window.DraftManager) {
                let studentId = "student";
                try {
                    const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
                    studentId = student["matric-number"] || studentId;
                } catch (error) {
                    console.error("Could not identify the student chat draft:", error);
                }
                window.DraftManager.clear("chat_" + studentId);
            }
            renderStageMessages();

            window.setTimeout(function () {
                sentMessage.status = "delivered";
                saveConversations();
                if (selectedStage === stageAtSend) renderStageMessages();
            }, 600);

            window.setTimeout(function () {
                sentMessage.status = "read";
                saveConversations();
                if (selectedStage === stageAtSend) renderStageMessages();
            }, 2000);

            window.clearTimeout(typingTimeout);
            if (presence.isActive) {
                typingStage = stageAtSend;
                renderTypingIndicator();
                typingTimeout = window.setTimeout(function () {
                    typingStage = null;
                    const indicator = document.getElementById("supervisor-typing-indicator");
                    if (indicator) indicator.remove();
                    const reply = {
                        id: "supervisor-" + Date.now() + "-" +
                            Math.random().toString(36).slice(2),
                        author: "supervisor",
                        authorName: supervisorName,
                        initials: getInitials(supervisorName),
                        text: "Thanks for the update. I have noted this for the " +
                            stageAtSend.toLowerCase() + " stage.",
                        time: formatMessageTime()
                    };
                    conversations[stageAtSend].push(reply);
                    saveConversations();
                    if (selectedStage === stageAtSend) renderStageMessages();
                }, 1500);
            } else {
                typingStage = null;
            }
        });

        updateHistory();
        selectStage(selectedStage);

        window.addEventListener("storage", function (event) {
            if (event.key === "feedbacks" || event.key === storageKey ||
                (event.key && event.key.startsWith("feedback_"))) {
                feedback = loadFeedback();
                updateHistory();
                const current = getFeedback(selectedStage);
                summary.textContent = current.comment
                    ? (hasRating(current)
                        ? "Supervisor rating: " + current.rating + "/10"
                        : "Supervisor feedback available")
                    : "No supervisor feedback recorded for this stage.";
            }
        });
    }

    function getProjectTitle() {
        try {
            const settings = JSON.parse(localStorage.getItem("spt-project-settings"));
            if (settings && typeof settings["project-title"] === "string" &&
                settings["project-title"].trim()) {
                return settings["project-title"].trim();
            }
        } catch (error) {
            console.error("Could not read the saved project title:", error);
        }
        return "Student Project Progress Tracking System";
    }

    function expandToWordCount(text, target, context) {
        const additions = [
            "The analysis connects these decisions to " + context +
                " and explains how the evidence supports the stated objectives.",
            "Progress should be documented transparently so readers can follow the reasoning, assess limitations, and understand the outcomes.",
            "A consistent review process also helps identify gaps, refine the approach, and keep the work aligned with practical needs.",
            "The final discussion should be checked against reliable evidence, project requirements, and feedback from the intended audience."
        ];
        const words = text.trim().split(/\s+/).filter(Boolean);
        let additionIndex = 0;
        while (words.length < target) {
            const sentenceWords = additions[additionIndex % additions.length].split(/\s+/);
            const remaining = target - words.length;
            words.push.apply(words, sentenceWords.slice(0, remaining));
            additionIndex += 1;
        }
        if (words.length) words[words.length - 1] = words[words.length - 1].replace(/[.,;:]?$/, ".");
        return words.slice(0, target).join(" ");
    }

    function createChapterDraft(chapter, title, project) {
        const outlines = {
            "1": [
                "This chapter introduces " + project + " through the task, " + title +
                    ". It establishes the project context, explains the practical problem, and describes why a structured response is needed.",
                "The problem statement identifies the gap between current practice and the expected outcome. It distinguishes the causes, effects, and affected users so that the work remains focused on a clearly defined need.",
                "The aim is to deliver a considered solution for " + title +
                    ". The objectives break that aim into observable activities, while the scope sets boundaries for the features, users, data, and constraints addressed in this project.",
                "The significance section explains how the expected result may support users and future project work. Key terms are defined consistently to clarify the terminology used in later chapters.",
                "The chapter closes with an overview of the report structure. Each following chapter builds on this foundation, connecting the objectives to relevant evidence, a justified method, evaluated results, and conclusions."
            ],
            "2": [
                "This chapter reviews literature relevant to " + project +
                    " and the task, " + title + ". It establishes the concepts and evidence needed to assess the project problem and to justify a suitable solution.",
                "The review compares established approaches, recent studies, and practical systems rather than listing sources independently. Attention is given to each source's purpose, method, findings, and limitations.",
                "A thematic synthesis identifies areas of agreement, unresolved questions, and differences in context. These comparisons reveal where existing evidence does not fully address the needs described in Chapter One.",
                "The selected concepts provide a framework for interpreting the project requirements and evaluating possible design choices. Reliable, current sources should support each claim and be cited using the required academic style.",
                "The final section summarizes the evidence gap and explains how the present project responds to it. This synthesis informs the methodology, evaluation criteria, and design decisions developed in later chapters."
            ],
            "3": [
                "This chapter describes the methodology used to complete " + title +
                    " within " + project + ". It explains the chosen approach and shows how the research and implementation activities address the project objectives.",
                "The process is organized into clear stages, including requirements gathering, analysis, design, implementation, and evaluation where appropriate. Each stage has defined inputs and outputs so progress can be reviewed.",
                "Data sources, participant or system selection, instruments, and procedures are described transparently. Ethical, privacy, and accessibility considerations are included wherever they apply to the work.",
                "The chapter also documents the tools, technologies, and criteria used to assess the solution. These choices are justified in relation to the project scope, available evidence, and practical constraints.",
                "Finally, potential limitations are acknowledged and steps for reducing bias or error are stated. This detail allows another reader to understand the process and judge whether the conclusions are supported."
            ],
            "4": [
                "This chapter presents the findings from " + title + " in " + project +
                    ". Results are organized around the project objectives so readers can see how the collected evidence relates to the original problem.",
                "Each result is reported clearly, with tables, figures, or examples used when they improve understanding. The methods and criteria introduced earlier are applied consistently throughout the evaluation.",
                "The discussion interprets the findings instead of repeating them. It compares outcomes with the literature, identifies expected and unexpected patterns, and explains how design or implementation decisions influenced performance.",
                "Where a result does not meet an objective, the chapter describes the gap and considers plausible causes. Limitations in the data, testing conditions, or available resources are kept visible.",
                "The chapter concludes by summarizing the strongest evidence and the remaining issues. These findings provide a transparent basis for the conclusions and recommendations in the final chapter."
            ],
            "5": [
                "This chapter concludes " + project + " by reviewing the work completed for " + title +
                    ". It relates the final outcome to the problem statement, project aim, and objectives.",
                "The summary highlights the main stages undertaken and the evidence gathered. The conclusion states what can reasonably be inferred from the results without extending beyond the available data.",
                "Each objective is revisited to explain whether it was achieved and what evidence supports that assessment. Any incomplete work or important limitation is stated directly.",
                "Recommendations identify practical improvements, additional evaluation, or future research that could strengthen the solution. They are prioritized and linked to specific findings rather than presented as unsupported suggestions.",
                "The closing section reflects on the contribution and boundaries of the project. Together, the conclusions and recommendations offer a clear account of what was learned and what further work is justified."
            ]
        };
        return expandToWordCount(
            "Chapter " + chapter + ": " + title + " — " + project + ". " +
                outlines[chapter].join(" "),
            300,
            project
        );
    }

    function createAbstractDraft(project) {
        const introduction = "This proposal presents " + project +
            ", a project intended to address a defined need through a systematic and evidence-informed process. The work begins by examining the context, affected users, existing approaches, and limitations that shape the problem. This analysis will be used to state a focused aim, establish measurable objectives, and set a realistic scope for the investigation and proposed solution.";
        const methods = "The project will review relevant academic and practical sources, compare existing methods, and translate the findings into clear requirements. A suitable methodology will guide the design and implementation activities, with each major decision documented and justified. Evaluation will use criteria connected to the objectives, such as completeness, usability, accuracy, reliability, or other measures appropriate to the project. Ethical, accessibility, privacy, and resource considerations will be addressed where relevant.";
        const outcomes = "The expected outcome is a documented and evaluated response that can be assessed against the original need. Findings will be analyzed in relation to the project objectives and existing evidence, while limitations will be reported transparently. The final report will summarize the process, results, conclusions, and recommendations for future work. By connecting a clearly defined problem with an explicit method and reviewable evidence, " + project +
            " aims to make its contribution understandable, practical, and suitable for further development.";
        return expandToWordCount(
            "Abstract / Proposal. " + introduction + " " + methods + " " + outcomes,
            250,
            project
        );
    }

    function polishWriting(text) {
        let polished = text
            .replace(/\s+/g, " ")
            .replace(/\bi\b/g, "I")
            .replace(/\bdont\b/gi, "don't")
            .replace(/\bcant\b/gi, "can't")
            .replace(/\bwont\b/gi, "won't")
            .replace(/\bteh\b/gi, "the")
            .replace(/\s+([,.!?;:])/g, "$1")
            .replace(/([.!?])([A-Za-z])/g, "$1 $2")
            .trim();
        if (polished) {
            polished = polished.charAt(0).toUpperCase() + polished.slice(1);
            if (!/[.!?]$/.test(polished)) polished += ".";
        }
        return polished;
    }

    function renderWriterTools(app) {
        const writerCard = app.querySelector(".write-for-me-card");
        if (!writerCard) return;

        const modeButtons = writerCard.querySelectorAll("[data-writer-mode]");
        const panels = writerCard.querySelectorAll("[data-writer-panel]");
        const previewSection = document.getElementById("writer-preview-section");
        const output = document.getElementById("writer-output");
        const status = document.getElementById("writer-status");
        const projectTitle = getProjectTitle();
        let currentTitle = projectTitle;

        ["writer-chapter-title", "writer-project-topic"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.value = projectTitle;
        });
        try {
            const savedTasks = JSON.parse(localStorage.getItem("spt-tasks"));
            if (Array.isArray(savedTasks) && savedTasks.length) {
                const latest = savedTasks[savedTasks.length - 1];
                if (latest && typeof latest.title === "string" && latest.title.trim()) {
                    document.getElementById("writer-task-title").value = latest.title.trim();
                }
            }
        } catch (error) {
            console.error("Could not load a task title for the writing tools:", error);
        }

        modeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const mode = button.dataset.writerMode;
                modeButtons.forEach(function (modeButton) {
                    const selected = modeButton === button;
                    modeButton.classList.toggle("selected", selected);
                    modeButton.setAttribute("aria-pressed", String(selected));
                });
                panels.forEach(function (panel) {
                    panel.hidden = panel.dataset.writerPanel !== mode;
                });
                status.textContent = "";
            });
        });

        writerCard.querySelectorAll("[data-generate-mode]").forEach(function (button) {
            button.addEventListener("click", function () {
                const mode = button.dataset.generateMode;
                let generated = "";
                if (mode === "chapter") {
                    const chapter = document.getElementById("writer-chapter-number").value;
                    currentTitle = document.getElementById("writer-chapter-title").value.trim();
                    if (!currentTitle) {
                        status.textContent = "Enter a task or chapter title first.";
                        return;
                    }
                    generated = createChapterDraft(chapter, currentTitle, projectTitle);
                } else if (mode === "task") {
                    currentTitle = document.getElementById("writer-task-title").value.trim();
                    if (!currentTitle) {
                        status.textContent = "Enter a task title first.";
                        return;
                    }
                    generated = currentTitle + " involves a structured set of activities within " +
                        projectTitle + ". Begin by reviewing the relevant requirements, existing " +
                        "project materials, and dependencies, then break the work into manageable " +
                        "steps with clear outcomes. Complete each step using the agreed project " +
                        "methods and tools, record decisions and supporting evidence, and check " +
                        "the result against its acceptance criteria. Raise constraints or risks " +
                        "early, keep related documentation up to date, and review the finished " +
                        "work for accuracy, usability, and consistency with the project objectives.";
                } else if (mode === "abstract") {
                    currentTitle = document.getElementById("writer-project-topic").value.trim();
                    if (!currentTitle) {
                        status.textContent = "Enter a project topic first.";
                        return;
                    }
                    generated = createAbstractDraft(currentTitle);
                } else {
                    const source = document.getElementById("writer-source-text").value.trim();
                    if (!source) {
                        status.textContent = "Paste some writing to improve first.";
                        return;
                    }
                    currentTitle = projectTitle;
                    generated = polishWriting(source);
                }

                output.textContent = generated;
                previewSection.hidden = false;
                status.textContent = "Mock draft generated. Review and edit it before use.";
            });
        });

        document.getElementById("writer-copy-button").addEventListener("click", async function () {
            const text = output.textContent.trim();
            if (!text) return;
            let copyError = null;
            try {
                if (!navigator.clipboard || !navigator.clipboard.writeText) {
                    throw new Error("Clipboard access is unavailable.");
                }
                await navigator.clipboard.writeText(text);
            } catch (error) {
                copyError = error;
                const temporaryInput = document.createElement("textarea");
                temporaryInput.value = text;
                temporaryInput.setAttribute("readonly", "");
                temporaryInput.style.position = "fixed";
                temporaryInput.style.opacity = "0";
                document.body.appendChild(temporaryInput);
                let copied = false;
                try {
                    temporaryInput.select();
                    copied = document.execCommand("copy");
                } catch (fallbackError) {
                    console.error("Clipboard fallback failed:", fallbackError);
                } finally {
                    temporaryInput.remove();
                }
                if (!copied) {
                    console.error("Could not copy the AI draft:", copyError);
                    status.textContent = "Copy failed. Select the draft and copy it manually.";
                    return;
                }
            }
            status.textContent = "Draft copied to the clipboard.";
        });

        function insertDraft(target) {
            const text = output.textContent.trim();
            if (!text) {
                status.textContent = "Generate a draft before inserting it.";
                return;
            }
            try {
                localStorage.setItem("spt-ai-insert", JSON.stringify({
                    target: target,
                    title: currentTitle || projectTitle,
                    text: text
                }));
                window.location.href = target === "task"
                    ? "task.html?aiInsert=task"
                    : "document.html?aiInsert=document";
            } catch (error) {
                console.error("Could not prepare the AI draft for insertion:", error);
                status.textContent = "The draft could not be saved for insertion in this browser.";
            }
        }

        document.getElementById("writer-insert-task-button").addEventListener("click", function () {
            insertDraft("task");
        });
        document.getElementById("writer-insert-document-button").addEventListener("click", function () {
            insertDraft("document");
        });
    }

    function renderAssistantChat() {
        const app = document.getElementById("ai-chat-app");
        if (!app) return;

        renderWriterTools(app);
        const chips = document.getElementById("ai-context-chips");
        const messages = document.getElementById("ai-message-list");
        const form = document.getElementById("ai-chat-form");
        const input = document.getElementById("ai-chat-input");
        const research = getFeedback("Research");
        const feedbackLabel = research.comment
            ? "Supervisor Feedback: Research " +
                (hasRating(research) ? research.rating + "/10" : "available")
            : "Supervisor Feedback: No review yet";

        [
            "Current Task: Literature review",
            "Docs: Project brief and research notes",
            feedbackLabel,
            "Planning",
            "Research",
            "Design",
            "Development",
            "Testing",
            "Docs"
        ].forEach(function (label) {
            const chip = document.createElement("span");
            chip.className = "context-chip";
            chip.textContent = label;
            chips.appendChild(chip);
        });

        renderConversationMessage(
            messages,
            "AI Assistant - Mock",
            research.comment
                ? "Supervisor feedback for Research" +
                    (hasRating(research) ? " (" + research.rating + "/10)" : "") +
                    ": " + research.comment + " In this example, projects improved by adding " +
                    "recent primary sources, comparing findings in a synthesis table, and " +
                    "linking each source back to a research objective."
                : "No supervisor feedback has been recorded yet. Add a specific question about " +
                    "your project and I can help you plan the next step.",
            false
        );

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) {
                input.focus();
                return;
            }

            renderConversationMessage(messages, "You", question, true);
            renderConversationMessage(
                messages,
                "AI Assistant - Mock",
                research.comment
                    ? "A useful next step is to address the supervisor's Research feedback" +
                        (hasRating(research) ? " (" + research.rating + "/10)" : "") +
                        " by applying this note: " + research.comment
                    : "I can help you outline the next step. Start by checking your project " +
                        "requirements and identifying the specific outcome you want to achieve.",
                false
            );
            input.value = "";
            if (window.DraftManager) {
                let studentId = "student";
                try {
                    const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
                    studentId = student["matric-number"] || studentId;
                } catch (error) {
                    console.error("Could not identify the AI chat draft:", error);
                }
                window.DraftManager.clear("ai_chat_" + studentId);
            }
            messages.scrollTop = messages.scrollHeight;
        });
    }

    renderSupervisorChat();
    renderAssistantChat();
})();
