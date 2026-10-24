(function () {
    "use strict";

    const h = React.createElement;
    const { useEffect, useState } = React;
    const demoStudents = window.PROJECT_TRACKER_DEMO_STUDENTS || [];
    const stages = ["Planning", "Research", "Design", "Development", "Testing", "Documentation"];
    const tabs = ["Documents", "Tasks", "Chat", "Grading"];

    function readJson(key, fallback) {
        try {
            const stored = localStorage.getItem(key);
            return stored === null ? fallback : JSON.parse(stored);
        } catch (error) {
            console.error("Could not read " + key + ":", error);
            return fallback;
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save " + key + ":", error);
            return false;
        }
    }

    function ensureSharedData() {
        const storedStudents = readJson("students", []);
        const students = Array.isArray(storedStudents) ? storedStudents : [];
        const byMatric = new Map(students.map(function (student) {
            return [String(student.matric), student];
        }));
        demoStudents.forEach(function (student) {
            if (!byMatric.has(String(student.matric))) byMatric.set(String(student.matric), student);
        });
        const mergedStudents = Array.from(byMatric.values());
        if (mergedStudents.length !== students.length) saveJson("students", mergedStudents);

        const storedDocuments = readJson("documents", null);
        if (!Array.isArray(storedDocuments)) {
            const sampleDocuments = demoStudents.flatMap(function (student, index) {
                return [
                    {
                        id: student.matric + "-proposal",
                        studentMatric: student.matric,
                        title: "Project proposal",
                        category: "Proposal",
                        description: "Initial project scope, objectives, and proposed methodology.",
                        filename: "",
                        hasFile: false,
                        createdAt: student.lastActive
                    },
                    {
                        id: student.matric + "-progress",
                        studentMatric: student.matric,
                        title: index % 2 ? "Literature review draft" : "Research notes",
                        category: index % 2 ? "Chapter" : "Research",
                        description: "Working material submitted for supervisor review.",
                        filename: "",
                        hasFile: false,
                        createdAt: student.lastActive
                    }
                ];
            });
            const studentProfile = readJson("spt-student-settings", {});
            const studentMatric = studentProfile["matric-number"] || "";
            const studentDocuments = readJson("spt-documents", []);
            const migrated = Array.isArray(studentDocuments)
                ? studentDocuments.map(function (document) {
                    return Object.assign({}, document, {
                        studentMatric: document.studentMatric || studentMatric
                    });
                })
                : [];
            saveJson("documents", sampleDocuments.concat(migrated));
        } else {
            const studentProfile = readJson("spt-student-settings", {});
            const studentMatric = studentProfile["matric-number"] || "";
            const studentDocuments = readJson("spt-documents", []);
            if (studentMatric && Array.isArray(studentDocuments)) {
                const mergedDocs = storedDocuments.slice();
                studentDocuments.forEach(function (document) {
                    if (!mergedDocs.some(function (item) { return item.id === document.id; })) {
                        mergedDocs.push(Object.assign({}, document, { studentMatric: studentMatric }));
                    }
                });
                if (mergedDocs.length !== storedDocuments.length) saveJson("documents", mergedDocs);
            }
        }
        if (!readJson("feedbacks", null)) saveJson("feedbacks", {});
        return readJson("students", mergedStudents);
    }

    function initials(name) {
        return String(name || "Student").split(/\s+/).filter(Boolean).slice(0, 2)
            .map(function (part) { return part[0]; }).join("").toUpperCase();
    }

    function getPath() {
        const route = window.location.hash.replace(/^#/, "");
        return route || (localStorage.getItem("supervisorId") ? "/dashboard" : "/login");
    }

    function navigate(path) {
        window.location.hash = path;
    }

    function getStudentTasks(student) {
        const existing = readJson("tasks", []);
        if (Array.isArray(existing)) {
            const matching = existing.filter(function (task) {
                return String(task.studentMatric || "") === String(student.matric);
            });
            if (matching.length) return matching;
        }
        const count = 5;
        const completed = Math.round(count * Number(student.progress || 0) / 100);
        return Array.from({ length: count }, function (_, index) {
            return {
                id: student.matric + "-task-" + index,
                studentMatric: student.matric,
                title: [
                    "Define project scope and objectives",
                    "Review related research",
                    "Prepare system design",
                    "Implement core workflow",
                    "Test and document results"
                ][index],
                stage: stages[Math.min(stages.length - 1, Math.floor(index * stages.length / count))],
                priority: index % 2 ? "Medium" : "High",
                status: index < completed ? "Completed" : index === completed ? "In Progress" : "Pending",
                deadline: ""
            };
        });
    }

    function useLocation() {
        const [path, setPath] = useState(getPath);
        useEffect(function () {
            function update() { setPath(getPath()); }
            window.addEventListener("hashchange", update);
            return function () { window.removeEventListener("hashchange", update); };
        }, []);
        return path;
    }

    function Avatar(props) {
        return h("span", { className: "sp-avatar", "aria-label": props.name },
            initials(props.name));
    }

    function Topbar(props) {
        return h("header", { className: "sp-topbar" },
            h("a", { className: "sp-brand", href: "#/dashboard" },
                h("span", { className: "sp-brand-mark" }, "P"),
                "ProjectTrack Supervisor"),
            h("div", { className: "sp-top-actions" },
                props.loggedIn
                    ? h("button", {
                        className: "sp-button-quiet",
                        type: "button",
                        onClick: props.onLogout
                    }, "Log out")
                    : h("a", { className: "sp-button sp-button-primary", href: "#/login" }, "Supervisor Login")));
    }

    function LoginPage(props) {
        const [identifier, setIdentifier] = useState("sup@futminna.edu.ng");
        const [password, setPassword] = useState("123");
        const [error, setError] = useState("");

        function submit(event) {
            event.preventDefault();
            if (!identifier.trim() || !password.trim()) {
                setError("Enter an ID or email and a password to continue.");
                return;
            }
            try {
                localStorage.setItem("supervisorId", identifier.trim());
            } catch (storageError) {
                console.error("Could not save supervisor login:", storageError);
                setError("Sign-in could not be saved in this browser.");
                return;
            }
            props.onLogin();
            navigate("/dashboard");
        }

        return h("div", { className: "sp-login-wrap" },
            h("section", { className: "sp-surface sp-login-card" },
                h("p", { className: "sp-eyebrow" }, "SUPERVISOR WORKSPACE"),
                h("h1", null, "Welcome back"),
                h("p", { className: "sp-subtitle" }, "Sign in to review your students and provide feedback."),
                h("form", { className: "sp-login-form", onSubmit: submit },
                    h("label", { htmlFor: "sp-login-id" }, "Supervisor ID or email"),
                    h("input", {
                        className: "sp-input",
                        id: "sp-login-id",
                        autoComplete: "username",
                        value: identifier,
                        onChange: function (event) { setIdentifier(event.target.value); },
                        required: true
                    }),
                    h("label", { htmlFor: "sp-login-password" }, "Password"),
                    h("input", {
                        className: "sp-input",
                        id: "sp-login-password",
                        type: "password",
                        autoComplete: "current-password",
                        value: password,
                        onChange: function (event) { setPassword(event.target.value); },
                        required: true
                    }),
                    error && h("p", { className: "sp-error", role: "alert" }, error),
                    h("button", { className: "sp-button sp-button-primary", type: "submit" }, "Sign in")),
                h("p", { className: "sp-note" },
                    "Demo mode: any non-empty credentials work. Sign-in is stored only in this browser; there is no server authentication.")));
    }

    function StudentCard(props) {
        const student = props.student;
        const docs = props.documents.filter(function (doc) {
            return String(doc.studentMatric) === String(student.matric);
        });
        const unread = docs.reduce(function (count, doc) {
            const viewed = Number(localStorage.getItem("sp-viewed-" + student.matric)) || 0;
            return count + (new Date(doc.createdAt || 0).getTime() > viewed ? 1 : 0);
        }, 0);
        return h("button", {
            className: "sp-student-card",
            type: "button",
            onMouseMove: function (event) {
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;
                event.currentTarget.style.setProperty("--tilt-x", ((0.5 - y) * 5).toFixed(2) + "deg");
                event.currentTarget.style.setProperty("--tilt-y", ((x - 0.5) * 7).toFixed(2) + "deg");
            },
            onMouseLeave: function (event) {
                event.currentTarget.style.setProperty("--tilt-x", "0deg");
                event.currentTarget.style.setProperty("--tilt-y", "0deg");
            },
            onClick: function () { navigate("/student/" + encodeURIComponent(student.matric)); }
        },
        h("div", { className: "sp-card-top" },
            h("div", { className: "sp-person" },
                h(Avatar, { name: student.name }),
                h("div", null,
                    h("h2", null, student.name),
                    h("p", { className: "sp-matric" }, student.matric))),
            h("span", { className: "sp-stage" }, student.stage)),
        h("p", { className: "sp-project" }, student.project),
        h("div", { className: "sp-progress-label" },
            h("span", null, "Project progress"),
            h("strong", null, student.progress + "%")),
        h("div", { className: "sp-progress-track", "aria-label": "Progress " + student.progress + "%" },
            h("span", { style: { width: student.progress + "%" } })),
        h("div", { className: "sp-card-footer" },
            h("span", { className: "sp-last-active" }, "Last active " + student.lastActiveLabel),
            unread > 0 && h("span", { className: "sp-new-badge" }, unread + " new docs")));
    }

    function Dashboard(props) {
        const [query, setQuery] = useState("");
        const docs = readJson("documents", []);
        const visible = props.students.filter(function (student) {
            const search = query.trim().toLowerCase();
            return !search || [student.name, student.matric, student.project]
                .some(function (value) { return String(value).toLowerCase().includes(search); });
        });
        return h(React.Fragment, null,
            h("div", { className: "sp-page-heading" },
                h("div", null,
                    h("p", { className: "sp-eyebrow" }, "SUPERVISOR DASHBOARD"),
                    h("h1", null, "My Students"),
                    h("p", { className: "sp-subtitle" }, "Review progress and provide feedback to your students.")),
                h("div", { className: "sp-dashboard-actions" },
                    h("button", { type: "button", className: "sp-button sp-button-quiet", onClick: function () { navigate("/map"); } }, "Project DNA map"),
                    h("button", { type: "button", className: "sp-button sp-button-quiet", onClick: function () { navigate("/war-room"); } }, "Open war room"),
                    h("span", { className: "sp-count-badge" }, props.students.length + " students"))),
            h("div", { className: "sp-filter-row" },
                h("label", { className: "visually-hidden", htmlFor: "sp-student-search" }, "Search students"),
                h("input", {
                    className: "sp-input",
                    id: "sp-student-search",
                    type: "search",
                    placeholder: "Search by name, matric, or project",
                    value: query,
                    onChange: function (event) { setQuery(event.target.value); }
                })),
            h("div", { className: "sp-student-grid sp-bento-grid" },
                visible.map(function (student) {
                    return h(StudentCard, {
                        key: student.matric,
                        student: student,
                        documents: Array.isArray(docs) ? docs : []
                    });
                })),
            visible.length === 0 && h("p", { className: "sp-note" }, "No students match this search."));
    }

    function calculateReadiness(student, week) {
        const progress = Number(student.progress) || 0;
        const offset = (String(student.matric).charCodeAt(String(student.matric).length - 1) || 0) % 7;
        const weekFactor = week / 16;
        return [
            Math.min(10, 3.2 + offset * 0.45),
            Math.min(10, 2.8 + progress / 22 + weekFactor),
            Math.min(10, 3.1 + progress / 28 + offset * 0.18),
            Math.min(10, 3.5 + progress / 24),
            Math.min(10, 1.8 + progress / 16 * weekFactor),
            Math.min(10, 2.7 + (16 - offset) * 0.35)
        ];
    }

    function RadarChart(props) {
        const labels = ["Originality", "Methodology", "Writing", "Research", "Progress", "Engagement"];
        const scores = calculateReadiness(props.student, props.week);
        const average = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
        const center = 160;
        const radius = 108;
        function point(index, value, scale) {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / labels.length;
            const distance = radius * (value / 10) * (scale || 1);
            return {
                x: center + Math.cos(angle) * distance,
                y: center + Math.sin(angle) * distance
            };
        }
        function polygon(values, scale) {
            return values.map(function (value, index) {
                const vertex = point(index, value, scale);
                return vertex.x.toFixed(1) + "," + vertex.y.toFixed(1);
            }).join(" ");
        }
        return h("div", { className: "sp-radar-layout" },
            h("svg", {
                className: "sp-radar-chart",
                viewBox: "0 0 320 320",
                role: "img",
                "aria-label": "Defense readiness radar chart"
            },
            [2, 4, 6, 8, 10].map(function (scale) {
                return h("polygon", {
                    key: "grid-" + scale,
                    points: polygon(labels.map(function () { return 10; }), scale / 10),
                    className: "sp-radar-grid"
                });
            }),
            labels.map(function (_, index) {
                const end = point(index, 10);
                return h("line", {
                    key: "axis-" + index,
                    x1: center,
                    y1: center,
                    x2: end.x,
                    y2: end.y,
                    className: "sp-radar-axis"
                });
            }),
            h("polygon", { points: polygon(scores, 1), className: "sp-radar-area" }),
            scores.map(function (score, index) {
                const vertex = point(index, score);
                return h("circle", {
                    key: "point-" + labels[index],
                    cx: vertex.x,
                    cy: vertex.y,
                    r: 4,
                    className: "sp-radar-point"
                });
            }),
            labels.map(function (label, index) {
                const vertex = point(index, 10, 1.22);
                return h("text", {
                    key: "label-" + label,
                    x: vertex.x,
                    y: vertex.y,
                    className: "sp-radar-label",
                    textAnchor: vertex.x < center - 8 ? "end" : vertex.x > center + 8 ? "start" : "middle",
                    dominantBaseline: vertex.y < center ? "auto" : "hanging"
                }, label);
            })),
            h("div", { className: "sp-readiness-score" },
                h("span", { className: "sp-readiness-kicker" }, "DEFENSE READINESS"),
                h("strong", null, average.toFixed(1) + "/10"),
                h("span", { className: "sp-readiness-status" },
                    average >= 7.5 ? "Defense ready" : average >= 5 ? "Getting there" : "Not Ready")));
    }

    function TimeTravel(props) {
        const history = window.PROJECT_TRACKER_DUMMY_HISTORY[props.student.matric] || [];
        const snapshot = history[props.week - 1] || { progress: props.student.progress, documents: 0 };
        return h("section", { className: "sp-time-travel sp-glass" },
            h("div", { className: "sp-time-heading" },
                h("div", null,
                    h("span", { className: "sp-eyebrow" }, "PROJECT TIME TRAVEL"),
                    h("h2", null, "Week " + props.week + " snapshot")),
                h("p", null, snapshot.progress + "% progress · " + snapshot.documents + " documents")),
            h("input", {
                className: "sp-time-slider",
                type: "range",
                min: 1,
                max: 16,
                step: 1,
                value: props.week,
                "aria-label": "Project history week",
                onChange: function (event) { props.onChange(Number(event.target.value)); }
            }),
            h("div", { className: "sp-time-ticks", "aria-hidden": "true" },
                [1, 4, 8, 12, 16].map(function (week) {
                    return h("span", { key: week }, "W" + week);
                })));
    }

    function CopilotPanel(props) {
        const [summary, setSummary] = useState("");
        const [status, setStatus] = useState("");
        function summarize() {
            const score = calculateReadiness(props.student, props.week);
            const average = score.reduce(function (sum, value) { return sum + value; }, 0) / score.length;
            const rating = Math.max(1, Math.min(10, Math.round(average)));
            const next = props.student.progress < 50
                ? "Prioritize the research synthesis and lock the methodology before expanding implementation."
                : "Tighten the final chapter, verify test evidence, and prepare a concise defense narrative.";
            const draft = "You have made progress on " + props.student.project +
                ". Next, " + next + " Bring a short evidence trail for each research objective to the next review.";
            setSummary(draft);
            setStatus("Suggested rating: " + rating + "/10 · Draft feedback is ready to review.");
        }
        function applyDraft() {
            if (!summary) return;
            const current = readJson("feedback_" + props.student.matric, {});
            const updated = Object.assign({}, current, {
                stages: Object.assign({}, current.stages || {}, {
                    [props.student.stage]: {
                        comment: summary,
                        rating: Math.round(calculateReadiness(props.student, props.week)
                            .reduce(function (sum, value) { return sum + value; }, 0) / 6),
                        action: "Request Revision",
                        updatedAt: new Date().toISOString()
                    }
                })
            });
            if (saveJson("feedback_" + props.student.matric, updated)) {
                const all = readJson("feedbacks", {});
                all[props.student.matric] = updated;
                if (saveJson("feedbacks", all)) setStatus("Feedback saved to the student record.");
            }
        }
        return h("aside", { className: "sp-copilot sp-glass" },
            h("div", { className: "sp-copilot-brand" },
                h("span", { className: "sp-copilot-sparkle" }, "✦"),
                h("div", null, h("span", { className: "sp-eyebrow" }, "SUPERVISOR COPILOT"),
                    h("h2", null, "Review assistant"))),
            h("p", { className: "sp-copilot-description" },
                "Generate a grounded review brief from this student's current progress."),
            h("button", { className: "sp-button sp-button-primary sp-copilot-generate", type: "button", onClick: summarize },
                "✦  AI Summarize Student"),
            summary && h("div", { className: "sp-copilot-result" },
                h("span", { className: "sp-copilot-result-label" }, "REVIEW BRIEF"),
                h("p", null, summary),
                h("div", { className: "sp-copilot-actions" },
                    h("button", { className: "sp-button sp-button-quiet", type: "button", onClick: applyDraft }, "Save feedback"),
                    h("button", { className: "sp-button sp-button-quiet", type: "button", onClick: function () { navigator.clipboard.writeText(summary).then(function () { setStatus("Draft copied."); }).catch(function (error) { console.error("Could not copy feedback draft:", error); setStatus("Copy is unavailable; select the text to copy."); }); } }, "Copy draft"))),
            status && h("p", { className: "sp-note", role: "status" }, status));
    }

    function downloadAttachment(doc, button) {
        if (doc.fileData && doc.fileData.startsWith("data:")) {
            const link = document.createElement("a");
            link.href = doc.fileData;
            link.download = doc.filename || "project-document";
            link.click();
            return;
        }
        if (!doc.fileId || !window.indexedDB) {
            button.textContent = "File unavailable in browser storage";
            return;
        }
        const request = indexedDB.open("project-tracker-files", 2);
        request.addEventListener("success", function () {
            const transaction = request.result.transaction("attachments", "readonly");
            const item = transaction.objectStore("attachments").get(doc.fileId);
            item.addEventListener("success", function () {
                const data = item.result && item.result.data;
                if (typeof data !== "string" || !data.startsWith("data:")) {
                    button.textContent = "File unavailable in browser storage";
                    return;
                }
                const link = document.createElement("a");
                link.href = data;
                link.download = doc.filename || "project-document";
                link.click();
            });
            item.addEventListener("error", function () {
                console.error("Could not read the document attachment:", item.error);
                button.textContent = "File unavailable in browser storage";
            });
        });
        request.addEventListener("error", function () {
            console.error("Could not open document attachment storage:", request.error);
            button.textContent = "File unavailable in browser storage";
        });
    }

    function readFeedback(matric) {
        const perStudent = readJson("feedback_" + matric, {});
        const all = readJson("feedbacks", {});
        return Object.assign({}, all[matric] || {}, perStudent || {});
    }

    function writeFeedback(matric, next) {
        const all = readJson("feedbacks", {});
        const perStudent = readJson("feedback_" + matric, {});
        const merged = Object.assign({}, all[matric] || {}, perStudent || {}, next);
        const allNext = Object.assign({}, all, {});
        allNext[matric] = merged;
        return saveJson("feedback_" + matric, merged) && saveJson("feedbacks", allNext);
    }

    function FocusMode(props) {
        const [selection, setSelection] = useState(null);
        const [comment, setComment] = useState("");
        const [comments, setComments] = useState(props.feedback.inlineComments || []);
        const [recording, setRecording] = useState(false);
        const [audio, setAudio] = useState(props.feedback.audioFeedback || []);
        const [status, setStatus] = useState("");
        const viewerRef = React.useRef(null);
        const recorderRef = React.useRef(null);
        const streamRef = React.useRef(null);
        const chunksRef = React.useRef([]);

        function captureSelection() {
            const selectionObject = window.getSelection();
            const text = selectionObject && selectionObject.toString().trim();
            if (!text || !viewerRef.current) return;
            const range = selectionObject.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const bounds = viewerRef.current.getBoundingClientRect();
            setSelection({
                text: text,
                x: Math.max(4, Math.min(94, ((rect.left + rect.width / 2 - bounds.left) / bounds.width) * 100)),
                y: Math.max(4, Math.min(92, ((rect.top - bounds.top) / bounds.height) * 100))
            });
            setStatus("");
        }

        function persist(nextComments, nextAudio) {
            const current = readFeedback(props.student.matric);
            const documents = Object.assign({}, current.documents || {});
            documents[props.doc.id] = Object.assign({}, documents[props.doc.id] || {}, {
                inlineComments: nextComments,
                audioFeedback: nextAudio
            });
            const updated = Object.assign({}, current, { documents: documents });
            if (writeFeedback(props.student.matric, updated)) {
                setComments(nextComments);
                setAudio(nextAudio);
                setStatus("Annotation saved to this document.");
            } else {
                setStatus("Could not save the annotation.");
            }
        }

        function addComment() {
            if (!selection || !comment.trim()) return;
            const next = comments.concat({
                id: Date.now() + "-" + Math.random().toString(36).slice(2),
                text: comment.trim(),
                selectedText: selection.text,
                x: selection.x,
                y: selection.y,
                createdAt: new Date().toISOString()
            });
            persist(next, audio);
            setComment("");
            setSelection(null);
            window.getSelection().removeAllRanges();
        }

        async function toggleRecording() {
            if (recording && recorderRef.current) {
                recorderRef.current.stop();
                return;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
                typeof MediaRecorder === "undefined") {
                setStatus("Audio recording is not available in this browser or connection.");
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                chunksRef.current = [];
                const recorder = new MediaRecorder(stream);
                recorderRef.current = recorder;
                recorder.addEventListener("dataavailable", function (event) {
                    if (event.data && event.data.size) chunksRef.current.push(event.data);
                });
                recorder.addEventListener("stop", function () {
                    setRecording(false);
                    stream.getTracks().forEach(function (track) { track.stop(); });
                    streamRef.current = null;
                    const blob = new Blob(chunksRef.current, {
                        type: recorder.mimeType || "audio/webm"
                    });
                    const reader = new FileReader();
                    reader.addEventListener("load", function () {
                        const next = audio.concat({
                            id: Date.now() + "",
                            dataUrl: reader.result,
                            mimeType: blob.type,
                            createdAt: new Date().toISOString()
                        });
                        persist(comments, next);
                    }, { once: true });
                    reader.addEventListener("error", function () {
                        console.error("Could not store voice feedback:", reader.error);
                        setStatus("The recording could not be saved.");
                    }, { once: true });
                    reader.readAsDataURL(blob);
                }, { once: true });
                recorder.start();
                setRecording(true);
                setStatus("Recording voice feedback…");
            } catch (error) {
                console.error("Could not start voice feedback recording:", error);
                setStatus("Microphone permission was denied or unavailable.");
            }
        }

        useEffect(function () {
            return function () {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(function (track) { track.stop(); });
                }
            };
        }, []);

        return h("div", { className: "sp-focus-backdrop", role: "dialog", "aria-modal": "true", "aria-label": "Document focus mode" },
            h("section", { className: "sp-focus-window" },
                h("header", { className: "sp-focus-header" },
                    h("div", null,
                        h("span", { className: "sp-eyebrow" }, "FOCUS MODE"),
                        h("h2", null, props.doc.title || "Project document")),
                    h("button", { type: "button", className: "sp-icon-button", onClick: props.onClose, "aria-label": "Close focus mode" }, "×")),
                h("div", { className: "sp-focus-toolbar" },
                    h("span", null, "Select text to pin a comment"),
                    h("button", {
                        type: "button",
                        className: "sp-button sp-button-quiet",
                        onClick: toggleRecording
                    }, recording ? "■ Stop recording" : "● Voice feedback")),
                h("div", { className: "sp-focus-content-wrap" },
                    h("article", {
                        className: "sp-focus-document",
                        ref: viewerRef,
                        onMouseUp: captureSelection,
                        onTouchEnd: captureSelection
                    },
                    h("h1", null, props.doc.title || "Project document"),
                    h("p", { className: "sp-doc-meta" },
                        (props.doc.category || "Project document") + " · Supervisor review copy"),
                    h("div", { className: "sp-focus-paper" },
                        h("p", null, props.doc.description ||
                            "Select text in the document preview to add a precise, position-aware review comment."),
                        h("p", null, "This focus view previews the document text available to the local demo. Attachments can be downloaded from the document list; editable PDF rendering is not available in this offline browser preview."),
                        h("p", null, "Review note: use clear evidence, defined terms, and a direct link to the project's objectives when revising this section."),
                        comments.map(function (item) {
                            return h("button", {
                                type: "button",
                                className: "sp-inline-pin",
                                style: { left: item.x + "%", top: item.y + "%" },
                                title: item.text,
                                key: item.id,
                                onClick: function () { setStatus("Comment: " + item.text); }
                            }, "✎");
                        }))),
                    selection && h("div", {
                        className: "sp-selection-popover",
                        style: { left: selection.x + "%", top: selection.y + "%" }
                    },
                    h("strong", null, "“" + selection.text.slice(0, 65) + (selection.text.length > 65 ? "…" : "") + "”"),
                    h("textarea", {
                        className: "sp-textarea",
                        rows: 2,
                        placeholder: "Add an inline comment",
                        value: comment,
                        onChange: function (event) { setComment(event.target.value); }
                    }),
                    h("button", { type: "button", className: "sp-button sp-button-primary", onClick: addComment }, "Pin comment"))),
                h("div", { className: "sp-focus-sidebar" },
                    h("h3", null, "Review annotations"),
                    comments.length === 0 && h("p", { className: "sp-note" }, "Select text in the preview to leave the first comment."),
                    comments.map(function (item) {
                        return h("article", { className: "sp-annotation-card", key: item.id },
                            h("span", { className: "sp-annotation-quote" }, "“" + item.selectedText + "”"),
                            h("p", null, item.text));
                    }),
                    audio.map(function (item, index) {
                        return h("article", { className: "sp-annotation-card", key: item.id },
                            h("strong", null, "Voice feedback " + (index + 1)),
                            h("audio", { controls: true, src: item.dataUrl }));
                    }),
                    status && h("p", { className: "sp-note", role: "status" }, status))));
    }

    function DocumentsTab(props) {
        const documents = readJson("documents", []);
        const studentDocuments = Array.isArray(documents)
            ? documents.filter(function (doc) {
                return String(doc.studentMatric) === String(props.student.matric);
            })
            : [];
        const [feedback, setFeedback] = useState(function () {
            return readFeedback(props.student.matric);
        });
        const [status, setStatus] = useState("");
        const [focusDoc, setFocusDoc] = useState(null);
        const history = window.PROJECT_TRACKER_DUMMY_HISTORY[props.student.matric] || [];
        const snapshot = history[props.week - 1] || { documents: studentDocuments.length };
        const visibleDocuments = studentDocuments.slice(0, snapshot.documents);

        function saveDocumentFeedback(doc, comment, rating, action) {
            const numericRating = Number(rating);
            if (!comment.trim() || !Number.isInteger(numericRating) ||
                numericRating < 1 || numericRating > 10) {
                setStatus("Enter written feedback and a whole-number rating from 1 to 10.");
                return;
            }
            const current = readFeedback(props.student.matric);
            const updated = Object.assign({}, current, {
                documents: Object.assign({}, current.documents || {}, {
                    [doc.id]: {
                        comment: comment,
                        rating: numericRating,
                        action: action,
                        updatedAt: new Date().toISOString()
                    }
                })
            });
            if (writeFeedback(props.student.matric, updated)) {
                setFeedback(updated);
                setStatus("Feedback saved. The student can now view it in their portal.");
            } else {
                setStatus("Feedback could not be saved in this browser.");
            }
        }

        return h("section", { className: "sp-surface sp-panel" },
            h("div", { className: "sp-section-heading" },
                h("h2", null, "Student Documents"),
                h("span", { className: "sp-snapshot-tag" }, "Week " + props.week + " snapshot · " + visibleDocuments.length + " docs")),
            !visibleDocuments.length && h("p", { className: "sp-note" },
                studentDocuments.length ? "No documents had been submitted by this week." : "No documents submitted."),
            h("div", { className: "sp-record-list" }, visibleDocuments.map(function (doc) {
                const existing = feedback.documents && feedback.documents[doc.id] || {};
                const hasFile = typeof doc.hasFile === "boolean"
                    ? doc.hasFile
                    : Boolean(doc.fileId || doc.fileData);
                return h(DocumentCard, {
                    key: doc.id,
                    doc: doc,
                    hasFile: hasFile,
                    existing: existing,
                    onSave: saveDocumentFeedback,
                    onFocus: setFocusDoc
                });
            })),
            status && h("p", { className: "sp-note", role: "status" }, status),
            focusDoc && h(FocusMode, {
                student: props.student,
                doc: focusDoc,
                feedback: feedback.documents && feedback.documents[focusDoc.id] || {},
                onClose: function () { setFocusDoc(null); }
            }));
    }

    function DocumentCard(props) {
        const [comment, setComment] = useState(props.existing.comment || "");
        const [rating, setRating] = useState(
            props.existing.rating ? String(props.existing.rating) : "");
        const [action, setAction] = useState(props.existing.action || "Approve");
        const [downloadText, setDownloadText] = useState("Download file");
        return h("article", { className: "sp-document" },
            h("div", { className: "sp-document-heading" },
                h("div", null,
                    h("h3", null, props.doc.title || "Untitled document"),
                    h("p", { className: "sp-doc-meta" },
                        (props.doc.category || "Document") + " · " +
                        (props.doc.description || "No description"))),
                h("button", {
                    type: "button",
                    className: "sp-button sp-button-quiet",
                    onClick: function () { props.onFocus(props.doc); }
                }, "Focus mode")),
            props.hasFile
                ? h("button", {
                    className: "sp-text-link sp-file-download",
                    type: "button",
                    onClick: function (event) {
                        downloadAttachment(props.doc, event.currentTarget);
                        setDownloadText("Preparing download…");
                    }
                }, downloadText)
                : h("span", { className: "sp-no-file" }, "No file attached"),
            h("form", {
                className: "sp-feedback-form",
                onSubmit: function (event) {
                    event.preventDefault();
                    props.onSave(props.doc, comment, rating, action);
                }
            },
            h("div", { className: "sp-feedback-comment" },
                h("label", { htmlFor: "feedback-" + props.doc.id }, "Write Feedback"),
                h("textarea", {
                    className: "sp-textarea",
                    id: "feedback-" + props.doc.id,
                    placeholder: "Add specific, constructive feedback...",
                    value: comment,
                    onChange: function (event) { setComment(event.target.value); }
                })),
            h("div", null,
                h("label", { htmlFor: "rating-" + props.doc.id }, "Rating /10"),
                h("input", {
                    className: "sp-input",
                    id: "rating-" + props.doc.id,
                    type: "number",
                    min: "1",
                    max: "10",
                    step: "1",
                    value: rating,
                    onChange: function (event) { setRating(event.target.value); }
                })),
            h("div", { className: "sp-feedback-action" },
                h("label", { htmlFor: "action-" + props.doc.id }, "Action"),
                h("select", {
                    className: "sp-select",
                    id: "action-" + props.doc.id,
                    value: action,
                    onChange: function (event) { setAction(event.target.value); }
                },
                h("option", { value: "Approve" }, "Approve"),
                h("option", { value: "Request Revision" }, "Request Revision"))),
            h("button", {
                className: "sp-button sp-button-primary sp-feedback-save",
                type: "submit"
            }, "Save Feedback")));
    }

    function TasksTab(props) {
        const tasks = getStudentTasks(props.student);
        return h("section", { className: "sp-surface sp-panel" },
            h("h2", null, "Student Tasks (Read only)"),
            h("div", { className: "sp-record-list" },
                tasks.map(function (task) {
                    return h("article", { className: "sp-task-row", key: task.id },
                        h("h3", null, task.title),
                        h("p", { className: "sp-task-meta" },
                            [task.stage, task.priority, task.status, task.deadline]
                                .filter(Boolean).join(" · ")));
                })));
    }

    function ChatTab(props) {
        const key = "chat_" + props.student.matric;
        const [messages, setMessages] = useState(function () {
            const saved = readJson(key, []);
            return Array.isArray(saved) ? saved : [];
        });
        const [text, setText] = useState("");
        const [isActive, setIsActive] = useState(true);
        const [lastSeen, setLastSeen] = useState("today at 8:32 PM");
        const [recording, setRecording] = useState(false);
        const [voiceStatus, setVoiceStatus] = useState("");
        const recorder = React.useRef(null);
        const stream = React.useRef(null);
        const chunks = React.useRef([]);

        useEffect(function () {
            const savedPresence = readJson("presence_" + props.student.matric, null);
            if (savedPresence) {
                setIsActive(Boolean(savedPresence.isActive));
                setLastSeen(savedPresence.lastSeen || "today at 8:32 PM");
            }
        }, [props.student.matric]);

        function send(event) {
            event.preventDefault();
            const messageText = text.trim();
            if (!messageText) return;
            const sent = {
                id: Date.now() + "-" + Math.random().toString(36).slice(2),
                author: "supervisor",
                text: messageText,
                time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                status: "read"
            };
            const next = messages.concat(sent);
            if (!saveJson(key, next)) return;
            setMessages(next);
            setText("");
        }

        async function toggleVoice() {
            if (recording && recorder.current) {
                recorder.current.stop();
                return;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
                typeof MediaRecorder === "undefined") {
                setVoiceStatus("Voice notes require microphone access in a supported browser.");
                return;
            }
            try {
                stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                chunks.current = [];
                const mediaRecorder = new MediaRecorder(stream.current);
                recorder.current = mediaRecorder;
                mediaRecorder.addEventListener("dataavailable", function (event) {
                    if (event.data && event.data.size) chunks.current.push(event.data);
                });
                mediaRecorder.addEventListener("stop", function () {
                    setRecording(false);
                    stream.current.getTracks().forEach(function (track) { track.stop(); });
                    const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
                    const reader = new FileReader();
                    reader.addEventListener("load", function () {
                        const message = {
                            id: Date.now() + "-" + Math.random().toString(36).slice(2),
                            author: "supervisor",
                            text: "Voice note",
                            audioDataUrl: reader.result,
                            time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                            status: "read"
                        };
                        const next = messages.concat(message);
                        if (saveJson(key, next)) {
                            setMessages(next);
                            setVoiceStatus("Voice note sent.");
                        } else {
                            setVoiceStatus("Voice note could not be saved. The recording may be too large for browser storage.");
                        }
                    }, { once: true });
                    reader.addEventListener("error", function () {
                        console.error("Could not encode chat voice note:", reader.error);
                        setVoiceStatus("Voice note could not be saved.");
                    }, { once: true });
                    reader.readAsDataURL(blob);
                }, { once: true });
                mediaRecorder.start();
                setRecording(true);
                setVoiceStatus("Recording… select stop to send.");
            } catch (error) {
                if (stream.current) stream.current.getTracks().forEach(function (track) { track.stop(); });
                stream.current = null;
                console.error("Could not access the microphone:", error);
                setVoiceStatus("Microphone permission is unavailable.");
            }
        }

        useEffect(function () {
            function stopStream() {
                if (stream.current) stream.current.getTracks().forEach(function (track) { track.stop(); });
            }
            return stopStream;
        }, []);

        return h("section", { className: "sp-surface sp-chat-surface" },
            h("header", { className: "sp-chat-top" },
                h(Avatar, { name: props.student.name }),
                h("div", null,
                    h("h2", null, props.student.name),
                    h("p", { className: "sp-chat-presence" },
                        h("span", { className: isActive ? "sp-online-dot" : "sp-online-dot offline" }),
                        isActive ? "Active now" : "Last seen " + lastSeen))),
            h("div", { className: "sp-chat-list", "aria-live": "polite" },
                messages.length === 0 && h("p", { className: "sp-note" },
                    "No messages yet. Send a message to start the conversation."),
                messages.map(function (message) {
                    const fromSupervisor = message.author === "supervisor";
                    return h("div", {
                        className: "sp-chat-row" + (fromSupervisor ? " student" : ""),
                        key: message.id
                    },
                    h(Avatar, { name: fromSupervisor ? "Supervisor" : props.student.name }),
                    h("div", { className: "sp-chat-bubble-wrap" },
                        h("span", { className: "sp-chat-meta" },
                            fromSupervisor ? "You" : props.student.name),
                        message.audioDataUrl
                            ? h("audio", { className: "sp-chat-audio", controls: true, src: message.audioDataUrl })
                            : h("p", null, message.text),
                        h("div", { className: "sp-chat-footer" },
                            h("time", null, message.time),
                            fromSupervisor && h("span", {
                                className: "sp-tick read",
                                title: "Read",
                                "aria-label": "Read"
                            }, "✓✓"))));
                })),
            h("form", { className: "sp-chat-composer", onSubmit: send },
                h("button", {
                    className: "sp-icon-button sp-voice-note",
                    type: "button",
                    onClick: toggleVoice,
                    "aria-label": recording ? "Stop and send voice note" : "Record voice note"
                }, recording ? "■" : "🎙"),
                h("label", { className: "visually-hidden", htmlFor: "sp-chat-input" }, "Write a message"),
                h("textarea", {
                    className: "sp-textarea",
                    id: "sp-chat-input",
                    rows: 1,
                    placeholder: "Write a message…",
                    value: text,
                    onChange: function (event) { setText(event.target.value); },
                    onKeyDown: function (event) {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            if (event.currentTarget.form.requestSubmit) {
                                event.currentTarget.form.requestSubmit();
                            }
                        }
                    }
                }),
                h("button", {
                    className: "sp-send",
                    type: "submit",
                    disabled: !text.trim(),
                    "aria-label": "Send message"
                }, h("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    "aria-hidden": "true"
                }, h("path", { d: "m22 2-7 20-4-9-9-4Z" }),
                h("path", { d: "M22 2 11 13" })))),
            voiceStatus && h("p", { className: "sp-chat-status", role: "status" }, voiceStatus));
    }

    function GradingTab(props) {
        const feedback = readFeedback(props.student.matric);
        const [stage, setStage] = useState(props.student.stage || "Planning");
        const [rating, setRating] = useState("");
        const [comment, setComment] = useState("");
        const [action, setAction] = useState("Approve");
        const [status, setStatus] = useState("");
        const tasks = getStudentTasks(props.student);
        const completed = tasks.filter(function (task) {
            return task.status === "Completed";
        }).length;
        function saveStageFeedback(event) {
            event.preventDefault();
            if (!comment.trim() || !rating) {
                setStatus("Add written feedback and a rating to save this stage review.");
                return;
            }
            const current = readFeedback(props.student.matric);
            const updated = Object.assign({}, current, {
                stages: Object.assign({}, current.stages || {}, {
                    [stage]: {
                        comment: comment.trim(),
                        rating: Number(rating),
                        action: action,
                        updatedAt: new Date().toISOString()
                    }
                })
            });
            if (writeFeedback(props.student.matric, updated)) {
                setStatus("Stage feedback saved and shared with the student.");
                setComment("");
            } else {
                setStatus("Stage feedback could not be saved.");
            }
        }

        return h("section", { className: "sp-surface sp-panel" },
            h("h2", null, "Defense Readiness"),
            h(RadarChart, { student: props.student, week: props.week }),
            h("div", { className: "sp-grading-grid" },
                h("div", { className: "sp-grade-stat" },
                    "Completed tasks", h("strong", null, completed + " / " + tasks.length)),
                h("div", { className: "sp-grade-stat" },
                    "Documents reviewed", h("strong", null,
                        Object.keys(feedback.documents || {}).length))),
            h("form", { className: "sp-feedback-form sp-stage-review-form", onSubmit: saveStageFeedback },
                h("div", null,
                    h("label", { htmlFor: "sp-grade-stage" }, "Project Stage"),
                    h("select", {
                        id: "sp-grade-stage",
                        className: "sp-select",
                        value: stage,
                        onChange: function (event) { setStage(event.target.value); }
                    }, stages.map(function (name) {
                        return h("option", { key: name, value: name }, name);
                    }))),
                h("div", null,
                    h("label", { htmlFor: "sp-grade-rating" }, "Rating /10"),
                    h("input", {
                        id: "sp-grade-rating",
                        className: "sp-input",
                        type: "number",
                        min: 1,
                        max: 10,
                        value: rating,
                        onChange: function (event) { setRating(event.target.value); }
                    })),
                h("div", { className: "sp-feedback-comment" },
                    h("label", { htmlFor: "sp-grade-comment" }, "Stage Feedback"),
                    h("textarea", {
                        id: "sp-grade-comment",
                        className: "sp-textarea",
                        value: comment,
                        placeholder: "Provide specific guidance for this stage...",
                        onChange: function (event) { setComment(event.target.value); }
                    })),
                h("div", { className: "sp-feedback-action" },
                    h("label", { htmlFor: "sp-grade-action" }, "Action"),
                    h("select", {
                        id: "sp-grade-action",
                        className: "sp-select",
                        value: action,
                        onChange: function (event) { setAction(event.target.value); }
                    },
                    h("option", { value: "Approve" }, "Approve"),
                    h("option", { value: "Request Revision" }, "Request Revision"))),
                h("button", { className: "sp-button sp-button-primary sp-feedback-save", type: "submit" },
                    "Save Stage Feedback")),
            status && h("p", { className: "sp-note", role: "status" }, status));
    }

    function StudentDetail(props) {
        const requested = decodeURIComponent(props.matric);
        const student = props.students.find(function (record) {
            return String(record.matric) === requested;
        });
        const [tab, setTab] = useState("Documents");
        const [week, setWeek] = useState(16);
        const history = window.PROJECT_TRACKER_DUMMY_HISTORY[student && student.matric] || [];
        const snapshot = history[week - 1] || { progress: student && student.progress || 0, documents: 0 };

        useEffect(function () {
            if (!student) return;
            try {
                localStorage.setItem("sp-viewed-" + student.matric, String(Date.now()));
            } catch (error) {
                console.error("Could not update submission read status:", error);
            }
        }, [student && student.matric]);

        if (!student) {
            return h("section", { className: "sp-surface sp-panel" },
                h("h1", null, "Student not found"),
                h("p", { className: "sp-note" }, "This student is not available in the local roster."),
                h("button", {
                    className: "sp-button sp-button-primary",
                    type: "button",
                    onClick: function () { navigate("/dashboard"); }
                }, "Back to students"));
        }

        const panel = tab === "Documents"
            ? h(DocumentsTab, { student: student, week: week })
            : tab === "Tasks"
                ? h(TasksTab, { student: student })
                : tab === "Chat"
                    ? h(ChatTab, { student: student })
                    : h(GradingTab, { student: student, week: week });

        return h(React.Fragment, null,
            h("div", { className: "sp-detail-heading" },
                h("div", { className: "sp-person sp-detail-person" },
                    h(Avatar, { name: student.name }),
                    h("div", null,
                        h("p", { className: "sp-eyebrow" }, student.matric),
                        h("h1", null, student.name),
                        h("p", { className: "sp-subtitle" }, student.project))),
                h("span", { className: "sp-stage" }, student.stage)),
            h(TimeTravel, { student: student, week: week, onChange: setWeek }),
            h("div", { className: "sp-tabs", role: "tablist", "aria-label": "Student details" },
                tabs.map(function (name) {
                    return h("button", {
                        className: "sp-tab",
                        type: "button",
                        role: "tab",
                        key: name,
                        "aria-selected": String(tab === name),
                        onClick: function () { setTab(name); }
                    }, name);
                })),
            h("div", { className: "sp-detail-layout" },
                h("div", { className: "sp-detail-main", role: "tabpanel", key: tab + "-" + week },
                    h("div", { className: "sp-snapshot-progress sp-glass" },
                        h("span", null, "Week " + week + " progress"),
                        h("strong", { key: "snapshot-" + week }, snapshot.progress + "%"),
                        h("span", null, snapshot.documents + " documents in snapshot")),
                    panel),
                h(CopilotPanel, { student: student, week: week })));
    }

    function ProjectMap(props) {
        const canvasRef = React.useRef(null);
        const pointsRef = React.useRef([]);
        const [selected, setSelected] = useState(null);

        useEffect(function () {
            const canvas = canvasRef.current;
            if (!canvas) return undefined;
            const context = canvas.getContext("2d");
            if (!context) return undefined;
            function draw() {
                const bounds = canvas.getBoundingClientRect();
                const ratio = window.devicePixelRatio || 1;
                canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
                canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
                context.setTransform(ratio, 0, 0, ratio, 0, 0);
                context.clearRect(0, 0, bounds.width, bounds.height);
                const centerX = bounds.width / 2;
                const centerY = bounds.height / 2;
                const radiusX = Math.max(90, bounds.width * 0.38);
                const radiusY = Math.max(90, bounds.height * 0.36);
                const points = props.students.map(function (student, index) {
                    const angle = index * Math.PI * 2 / props.students.length - Math.PI / 2;
                    return {
                        student: student,
                        x: centerX + Math.cos(angle) * radiusX,
                        y: centerY + Math.sin(angle) * radiusY
                    };
                });
                pointsRef.current = points;
                for (let i = 0; i < points.length; i += 1) {
                    for (let j = i + 1; j < points.length; j += 1) {
                        const similarity = 34 + ((i * 17 + j * 23) % 57);
                        if (similarity < 48) continue;
                        context.beginPath();
                        context.moveTo(points[i].x, points[i].y);
                        context.lineTo(points[j].x, points[j].y);
                        context.strokeStyle = similarity > 60
                            ? "rgba(239, 68, 68, 0.42)"
                            : "rgba(0, 135, 81, 0.20)";
                        context.lineWidth = 0.7 + similarity / 24;
                        context.stroke();
                    }
                }
                points.forEach(function (point) {
                    context.beginPath();
                    context.arc(point.x, point.y, 8, 0, Math.PI * 2);
                    context.fillStyle = "#008751";
                    context.fill();
                    context.lineWidth = 2;
                    context.strokeStyle = "#fff";
                    context.stroke();
                    context.fillStyle = getComputedStyle(document.body).color;
                    context.font = "12px system-ui";
                    context.textAlign = point.x > centerX + radiusX * 0.62 ? "right" :
                        point.x < centerX - radiusX * 0.62 ? "left" : "center";
                    context.fillText(point.student.name.split(" ")[0], point.x, point.y + 23);
                });
            }
            draw();
            window.addEventListener("resize", draw);
            return function () { window.removeEventListener("resize", draw); };
        }, [props.students]);

        function selectPoint(event) {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            const point = pointsRef.current.find(function (item) {
                return Math.hypot(item.x - x, item.y - y) < 20;
            });
            if (point) {
                setSelected(point.student);
                navigate("/student/" + encodeURIComponent(point.student.matric));
            }
        }

        return h("section", null,
            h("div", { className: "sp-page-heading" },
                h("div", null, h("p", { className: "sp-eyebrow" }, "PROJECT DNA"),
                    h("h1", null, "Similarity network"),
                    h("p", { className: "sp-subtitle" }, "Connections show synthetic project-title similarity; red links exceed 60%.")),
                h("button", { className: "sp-button sp-button-quiet", type: "button", onClick: function () { navigate("/dashboard"); } }, "Back to students")),
            h("div", { className: "sp-map-legend" },
                h("span", null, h("i", { className: "sp-map-key normal" }), "Under 60%"),
                h("span", null, h("i", { className: "sp-map-key high" }), "Over 60% similarity")),
            h("div", { className: "sp-map-canvas-wrap sp-glass" },
                h("canvas", {
                    ref: canvasRef,
                    className: "sp-map-canvas",
                    onClick: selectPoint,
                    role: "img",
                    "aria-label": "Project similarity network. Select a student node to open their profile."
                })),
            h("div", { className: "sp-map-student-list" }, props.students.map(function (student) {
                return h("button", {
                    key: student.matric,
                    type: "button",
                    className: "sp-button sp-button-quiet",
                    onClick: function () { navigate("/student/" + encodeURIComponent(student.matric)); }
                }, student.name);
            })),
            selected && h("p", { className: "sp-note" }, "Selected " + selected.name));
    }

    function WarRoom(props) {
        const [students, setStudents] = useState(props.students);
        const [dragging, setDragging] = useState("");
        useEffect(function () { setStudents(props.students); }, [props.students]);

        function moveStudent(matric, stage) {
            const next = students.map(function (student) {
                return String(student.matric) === String(matric)
                    ? Object.assign({}, student, { stage: stage })
                    : student;
            });
            if (saveJson("students", next)) {
                setStudents(next);
                props.onStudentsChange(next);
            }
        }
        function drop(event, stage) {
            event.preventDefault();
            const matric = event.dataTransfer.getData("text/plain") || dragging;
            if (matric) moveStudent(matric, stage);
            setDragging("");
        }

        return h("section", null,
            h("div", { className: "sp-page-heading" },
                h("div", null, h("p", { className: "sp-eyebrow" }, "LIVE PROJECT PIPELINE"),
                    h("h1", null, "War room"),
                    h("p", { className: "sp-subtitle" }, "Drag a student between stages to update the shared roster.")),
                h("button", { className: "sp-button sp-button-quiet", type: "button", onClick: function () { navigate("/dashboard"); } }, "Back to students")),
            h("div", { className: "sp-war-room" }, stages.map(function (stage) {
                const columnStudents = students.filter(function (student) { return student.stage === stage; });
                return h("section", {
                    className: "sp-war-column",
                    key: stage,
                    onDragOver: function (event) { event.preventDefault(); },
                    onDrop: function (event) { drop(event, stage); }
                },
                h("header", null, h("h2", null, stage), h("span", null, columnStudents.length)),
                columnStudents.map(function (student) {
                    return h("article", {
                        className: "sp-war-card sp-glass",
                        key: student.matric,
                        draggable: true,
                        onDragStart: function (event) {
                            setDragging(String(student.matric));
                            event.dataTransfer.setData("text/plain", String(student.matric));
                        },
                        onDragEnd: function () { setDragging(""); }
                    },
                    h("div", { className: "sp-person" },
                        h(Avatar, { name: student.name }),
                        h("div", null, h("strong", null, student.name), h("small", null, student.matric))),
                    h("p", null, student.project),
                    h("div", { className: "sp-war-card-actions" },
                        h("span", null, student.progress + "% progress"),
                        h("button", {
                            className: "sp-text-link",
                            type: "button",
                            onClick: function () { navigate("/student/" + encodeURIComponent(student.matric)); }
                        }, "Review")));
                }));
            })));
    }

    function CommandPalette(props) {
        const [query, setQuery] = useState("");
        const matches = props.students.filter(function (student) {
            return [student.name, student.matric, student.project].some(function (value) {
                return String(value).toLowerCase().includes(query.toLowerCase());
            });
        }).slice(0, 6);
        if (!props.open) return null;
        return h("div", {
            className: "sp-palette-backdrop",
            onMouseDown: function (event) {
                if (event.target === event.currentTarget) props.onClose();
            }
        }, h("section", { className: "sp-command-palette sp-glass", role: "dialog", "aria-modal": "true", "aria-label": "Command palette" },
            h("label", { className: "visually-hidden", htmlFor: "sp-palette-search" }, "Search students and actions"),
            h("input", {
                id: "sp-palette-search",
                className: "sp-input",
                autoFocus: true,
                placeholder: "Search students or type an action…",
                value: query,
                onChange: function (event) { setQuery(event.target.value); },
                onKeyDown: function (event) { if (event.key === "Escape") props.onClose(); }
            }),
            h("div", { className: "sp-palette-actions" },
                [["Dashboard", "/dashboard"], ["Project DNA map", "/map"], ["War room", "/war-room"]]
                    .filter(function (action) { return !query || action[0].toLowerCase().includes(query.toLowerCase()); })
                    .map(function (action) {
                        return h("button", {
                            type: "button", key: action[0], onClick: function () { props.onClose(); navigate(action[1]); }
                        }, action[0]);
                    }),
                matches.map(function (student) {
                    return h("button", {
                        type: "button", key: student.matric,
                        onClick: function () { props.onClose(); navigate("/student/" + encodeURIComponent(student.matric)); }
                    }, h(Avatar, { name: student.name }), h("span", null, student.name + " · " + student.matric));
                }))));
    }

    function App() {
        const path = useLocation();
        const [signedIn, setSignedIn] = useState(Boolean(localStorage.getItem("supervisorId")));
        const [students, setStudents] = useState(ensureSharedData);
        const [paletteOpen, setPaletteOpen] = useState(false);

        useEffect(function () {
            function onKeyDown(event) {
                if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                    event.preventDefault();
                    setPaletteOpen(function (open) { return !open; });
                }
                if (event.key === "Escape") setPaletteOpen(false);
            }
            function onStorage(event) {
                if (event.key === "students" && event.newValue) {
                    try {
                        const next = JSON.parse(event.newValue);
                        if (Array.isArray(next)) setStudents(next);
                    } catch (error) {
                        console.error("Could not refresh shared students:", error);
                    }
                }
            }
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("storage", onStorage);
            return function () {
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("storage", onStorage);
            };
        }, []);

        function logout() {
            localStorage.removeItem("supervisorId");
            setSignedIn(false);
            navigate("/login");
        }

        let content;
        if (path === "/login" || !signedIn) {
            content = h(LoginPage, { onLogin: function () { setSignedIn(true); } });
        } else if (path === "/dashboard" || path === "/") {
            const normalized = students.map(function (student) {
                const lastActiveDate = new Date(student.lastActive || Date.now());
                const elapsedHours = Math.max(0, Math.floor((Date.now() - lastActiveDate.getTime()) / 3600000));
                return Object.assign({}, student, {
                    progress: Number(student.progress) || 0,
                    stage: student.stage || "Planning",
                    lastActiveLabel: elapsedHours < 1 ? "just now" : elapsedHours + "h ago"
                });
            });
            content = h(Dashboard, { students: normalized });
        } else if (path.startsWith("/student/")) {
            content = h(StudentDetail, {
                students: students,
                matric: path.slice("/student/".length)
            });
        } else if (path === "/map") {
            content = h(ProjectMap, { students: students });
        } else if (path === "/war-room") {
            content = h(WarRoom, { students: students, onStudentsChange: setStudents });
        } else {
            content = h(LoginPage, { onLogin: function () { setSignedIn(true); } });
        }

        return h("div", { className: "supervisor-react-app" },
            h(Topbar, { loggedIn: signedIn, onLogout: logout }),
            h("main", { className: path === "/login" || !signedIn ? "" : "sp-shell" }, content),
            signedIn && h("button", {
                className: "sp-palette-trigger sp-button sp-button-quiet",
                type: "button",
                onClick: function () { setPaletteOpen(true); }
            }, "⌘K  Quick search"),
            h(CommandPalette, {
                open: paletteOpen && signedIn,
                students: students,
                onClose: function () { setPaletteOpen(false); }
            }),
            h("footer", { className: "sp-footer" },
                "Local demo portal · Shared browser storage · No backend connection"));
    }

    if (!React || !ReactDOM || !window.PROJECT_TRACKER_DEMO_STUDENTS) {
        document.getElementById("supervisor-app").textContent =
            "Supervisor portal could not start. Refresh the page to retry.";
        return;
    }
    ReactDOM.createRoot(document.getElementById("supervisor-app")).render(h(App));
})();
