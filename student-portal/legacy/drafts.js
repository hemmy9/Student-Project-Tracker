(function () {
    const MAX_AGE = 24 * 60 * 60 * 1000;
    const studentId = (function () {
        try {
            const student = JSON.parse(localStorage.getItem("spt-student-settings")) || {};
            return student["matric-number"] || "student";
        } catch (error) {
            console.error("Could not read the student ID for draft storage:", error);
            return "student";
        }
    })();

    function displayTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function timeAgo(timestamp) {
        const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
        const days = Math.floor(hours / 24);
        return days + (days === 1 ? " day ago" : " days ago");
    }

    function readDraft(key) {
        try {
            const draft = JSON.parse(localStorage.getItem(key));
            if (!draft || !draft.isDraft || Date.now() - draft.timestamp >= MAX_AGE) {
                if (draft) localStorage.removeItem(key);
                return null;
            }
            return draft;
        } catch (error) {
            console.error("Could not read saved draft:", error);
            localStorage.removeItem(key);
            return null;
        }
    }

    function createDraftArea(container, key, collect, restore, message) {
        const banner = document.createElement("div");
        banner.className = "unfinished-draft-banner";
        banner.hidden = true;
        const bannerText = document.createElement("span");
        const continueButton = document.createElement("button");
        continueButton.type = "button";
        continueButton.textContent = "Continue";
        const discardButton = document.createElement("button");
        discardButton.type = "button";
        discardButton.textContent = "Discard";
        banner.append(bannerText, continueButton, discardButton);
        container.prepend(banner);

        const savedLabel = document.createElement("p");
        savedLabel.className = "draft-autosave-label";
        savedLabel.setAttribute("role", "status");
        savedLabel.hidden = true;
        container.after(savedLabel);

        const savedDraft = readDraft(key);
        if (savedDraft) {
            bannerText.textContent = message + timeAgo(savedDraft.timestamp);
            banner.hidden = false;
            updateSavedLabel(savedDraft);
        }

        let dirty = false;
        function updateSavedLabel(draft) {
            savedLabel.textContent = "Draft auto-saved at " + displayTime(draft.timestamp);
            savedLabel.hidden = false;
        }

        continueButton.addEventListener("click", function () {
            const draft = readDraft(key);
            if (!draft) {
                banner.hidden = true;
                return;
            }
            restore(draft.formData);
            banner.hidden = true;
            dirty = true;
        });

        discardButton.addEventListener("click", function () {
            localStorage.removeItem(key);
            banner.hidden = true;
            savedLabel.hidden = true;
            dirty = false;
        });

        container.addEventListener("input", function () { dirty = true; });
        container.addEventListener("change", function () { dirty = true; });

        window.setInterval(function () {
            if (!dirty) return;
            const formData = collect();
            if (!Object.values(formData).some(function (value) {
                return typeof value === "string" ? value.trim() : Boolean(value);
            })) return;
            const draft = { formData: formData, timestamp: Date.now(), isDraft: true };
            try {
                localStorage.setItem(key, JSON.stringify(draft));
                updateSavedLabel(draft);
                if (banner.hidden) {
                    bannerText.textContent = message + timeAgo(draft.timestamp);
                    banner.hidden = false;
                }
                dirty = false;
            } catch (error) {
                console.error("Could not save draft:", error);
                savedLabel.textContent = "Draft could not be saved in this browser.";
            }
        }, 3000);

        return {
            restoreSaved: function () {
                const draft = readDraft(key);
                if (draft) restore(draft.formData);
            },
            markDirty: function () { dirty = true; },
            clear: function () {
                localStorage.removeItem(key);
                banner.hidden = true;
                savedLabel.hidden = true;
                dirty = false;
            }
        };
    }

    function addFormDraft(form, name) {
        const manager = createDraftArea(
            form,
            "draft_" + name,
            function () {
                return Array.from(form.elements).reduce(function (values, element) {
                    if (element.id && element.type !== "file" &&
                        element.type !== "submit" && element.type !== "button") {
                        values[element.id] = element.value;
                    }
                    return values;
                }, {});
            },
            function (data) {
                Object.keys(data || {}).forEach(function (id) {
                    const element = document.getElementById(id);
                    if (element && element.form === form && element.type !== "file") {
                        element.value = data[id];
                    }
                });
            },
            "You have an unfinished draft from "
        );
        return manager;
    }

    const documentForm = document.getElementById("document-form");
    if (documentForm) addFormDraft(documentForm, "document");

    const journalForm = document.getElementById("journal-form");
    if (journalForm) addFormDraft(journalForm, "journal");

    const writerCard = document.getElementById("write-for-me-card");
    if (writerCard) {
        const manager = createDraftArea(
            writerCard,
            "draft_ai_write",
            function () {
                const data = {};
                writerCard.querySelectorAll("input, select, textarea").forEach(function (field) {
                    if (field.id) data[field.id] = field.value;
                });
                data["writer-output"] = document.getElementById("writer-output").textContent;
                const selectedMode = writerCard.querySelector(".writer-mode-button.selected");
                data["writer-mode"] = selectedMode && selectedMode.dataset.writerMode || "chapter";
                return data;
            },
            function (data) {
                Object.keys(data || {}).forEach(function (id) {
                    const field = document.getElementById(id);
                    if (field && "value" in field) field.value = data[id];
                });
                const modeButton = writerCard.querySelector(
                    '[data-writer-mode="' + (data["writer-mode"] || "chapter") + '"]'
                );
                if (modeButton) modeButton.click();
                const output = document.getElementById("writer-output");
                const preview = document.getElementById("writer-preview-section");
                if (output && data["writer-output"]) {
                    output.textContent = data["writer-output"];
                    preview.hidden = false;
                }
            },
            "You have an unfinished AI writing draft from "
        );
        writerCard.addEventListener("click", function (event) {
            if (event.target.closest("[data-generate-mode]")) {
                manager.markDirty();
            }
        });
    }

    ["supervisor-chat-input", "ai-chat-input"].forEach(function (inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const chatForm = input.form;
        const key = inputId === "supervisor-chat-input"
            ? "draft_chat_" + studentId
            : "draft_ai_chat_" + studentId;
        const manager = createDraftArea(
            chatForm,
            key,
            function () { return { message: input.value }; },
            function (data) { input.value = data.message || ""; },
            "Unsent message saved "
        );
        chatForm.addEventListener("submit", function () {
            manager.clear();
        });
    });

    window.DraftManager = {
        clear: function (name) {
            localStorage.removeItem("draft_" + name);
        }
    };
})();
