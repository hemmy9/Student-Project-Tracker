// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import ChatPanel from "./components/ChatPanel.jsx";
import { calculateProgress } from "./lib/calculateProgress.js";
import { assertCanInsertFeedback } from "./lib/permissions.js";
import { getSupabaseClient, subscribeToTable } from "./lib/supabaseClient.js";
import { getCached, removeCached, setCached } from "./lib/storage.js";

const SESSION_KEY = "supervisor-session";
const fallbackStudents = [{ id: "sample-student", name: "Sample Student", email: "student@example.com", project_title: "Sample Project" }];
const fallbackTasks = [{ id: "sample-task", student_id: "sample-student", title: "Sample project task", status: "In progress" }];
const fallbackDocuments = [{ id: "sample-document", student_id: "sample-student", chapter: 1, title: "Sample chapter submission", status: "pending" }];
const fallbackFeedbacks = [{ id: "sample-feedback", student_id: "sample-student", comment: "Sample feedback" }];
function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [comment, setComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseClient();

  async function loadData() {
    setError("");
    const [studentResult, taskResult, documentResult, feedbackResult] = await Promise.all([
      supabase.from("students").select("*").eq("role", "student").order("name"),
      supabase.from("tasks").select("*"),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("feedbacks").select("*")
    ]);
    if (studentResult.error) throw studentResult.error;
    if (taskResult.error) throw taskResult.error;
    if (documentResult.error) throw documentResult.error;
    if (feedbackResult.error) throw feedbackResult.error;
    setStudents(studentResult.data || []);
    setTasks(taskResult.data || []);
    setDocuments(documentResult.data || []);
    setFeedbacks(feedbackResult.data || []);
    setUsingFallbackData(false);
  }

  function showFallbackData(loadError) {
    if (!user.demo) console.error("Could not load supervisor dashboard:", loadError);
    setStudents(fallbackStudents);
    setTasks(fallbackTasks);
    setDocuments(fallbackDocuments);
    setFeedbacks(fallbackFeedbacks);
    setUsingFallbackData(true);
    setError("");
  }

  useEffect(() => {
    let active = true;
    if (user.demo) {
      showFallbackData(new Error("Local demo account uses sample dashboard data."));
      return () => { active = false; };
    }
    loadData().catch((loadError) => { if (active) showFallbackData(loadError); });
    const unsubscribe = ["students", "tasks", "documents", "feedbacks"].map((table) =>
      subscribeToTable(table, () => {
        if (active) loadData().catch((loadError) => {
          console.error(`Could not refresh ${table}:`, loadError);
          showFallbackData(loadError);
        });
      })
    );
    return () => {
      active = false;
      unsubscribe.forEach((stop) => stop());
    };
  }, []);

  useEffect(() => {
    if (!selectedStudent && students[0]) setSelectedStudent(students[0].id);
  }, [selectedStudent, students]);

  async function submitFeedback(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      assertCanInsertFeedback(user);
      if (!selectedStudent) throw new Error("Select a student first.");
      if (!comment.trim()) throw new Error("Enter feedback before saving.");
      const { error: insertError } = await supabase.from("feedbacks").insert({
        student_id: selectedStudent,
        supervisor_id: user.id,
        comment: comment.trim(),
        created_at: new Date().toISOString()
      });
      if (insertError) throw insertError;
      setComment("");
      setNotice("Feedback saved.");
    } catch (saveError) {
      console.error("Could not save supervisor feedback:", saveError);
      setError(saveError.message || "Could not save feedback.");
    } finally {
      setBusy(false);
    }
  }

  async function reviewDocument(document, status) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (user?.role !== "supervisor") {
        throw new Error("Only a supervisor can review documents.");
      }
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status,
          review_feedback: (reviewFeedback[document.id] || "").trim() || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", document.id);
      if (updateError) throw updateError;
      setNotice(`Document ${status}.`);
      await loadData();
    } catch (reviewError) {
      console.error("Could not update document review:", reviewError);
      setError(reviewError.message || "Could not update document review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/dashboard">ProjectTrack · Supervisor</a>
        <button className="secondary" type="button" onClick={onLogout}>Log out</button>
      </header>
      <section className="welcome">
        <p className="eyebrow">SUPERVISOR WORKSPACE</p>
        <h1>Student projects</h1>
        <p className="muted">Monitor project progress and provide feedback.</p>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
      {usingFallbackData && <p className="demo-notice" role="alert">{user.demo ? "Demo account: showing sample data. Sign in with a provisioned Supabase Auth account for live project records." : "Run setup.sql in Supabase to load live project data. Showing sample data; reviews and feedback are disabled."}</p>}
      <section className="student-grid">
        {students.map((student) => {
          const studentTasks = tasks.filter((task) => task.student_id === student.id);
          const progress = calculateProgress(studentTasks);
          return (
            <article className="panel student-card" key={student.id}>
              <h2>{student.name || student.email}</h2>
              <p className="muted">{student.email}</p>
              <p>{student.project_title || student.project || "Project title not set"}</p>
              <strong>{progress}% complete</strong>
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>
              <p className="muted">{studentTasks.length} tasks</p>
              <p>{feedbacks.filter((feedback) => feedback.student_id === student.id).length} feedback notes</p>
            </article>
          );
        })}
        {students.length === 0 && <p className="muted">No student records were found.</p>}
      </section>
      <section className="panel">
        <h2>Document reviews</h2>
        {documents.length === 0 ? <p className="muted">No documents have been submitted.</p> : (
          <ul className="record-list">
            {documents.map((document) => {
              const student = students.find((item) => item.id === document.student_id);
              return (
                <li key={document.id}>
                  <div>
                    <strong>{student?.name || student?.email || "Student"}</strong>
                    <p>
                      Chapter {document.chapter || "—"} · {document.title || document.filename || "Document"} ·{" "}
                      <span className="badge">{document.status || "Pending"}</span>
                    </p>
                    {document.file_url && <a href={document.file_url} target="_blank" rel="noreferrer">Open document</a>}
                    <label htmlFor={`review-${document.id}`}>Feedback for this document</label>
                    <textarea
                      id={`review-${document.id}`}
                      rows="2"
                      value={reviewFeedback[document.id] ?? document.review_feedback ?? ""}
                      onChange={(event) => setReviewFeedback((current) => ({
                        ...current,
                        [document.id]: event.target.value
                      }))}
                    />
                    <div className="review-actions">
                      <button disabled={busy || usingFallbackData} type="button" onClick={() => reviewDocument(document, "approved")}>Approve</button>
                      <button className="secondary" disabled={busy || usingFallbackData} type="button" onClick={() => reviewDocument(document, "rejected")}>Reject</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="panel">
        <h2>Leave feedback</h2>
        <form className="feedback-form" onSubmit={submitFeedback}>
          <label htmlFor="student-select">Student</label>
          <select id="student-select" value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)} required>
            <option value="">Choose a student</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.name || student.email}</option>)}
          </select>
          <label htmlFor="feedback-comment">Feedback</label>
          <textarea id="feedback-comment" value={comment} onChange={(event) => setComment(event.target.value)} required rows="4" />
          <button disabled={busy || !students.length || usingFallbackData} type="submit">{busy ? "Saving…" : "Save feedback"}</button>
        </form>
      </section>
      <ChatPanel
        user={user}
        studentId={selectedStudent}
        studentName={students.find((student) => student.id === selectedStudent)?.name || students.find((student) => student.id === selectedStudent)?.email || "this student"}
      />
      <p className="demo-notice">
        Demo and browser-side role checks are not an access-control boundary; configure Supabase Auth and RLS before using real data.
      </p>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCached(SESSION_KEY)
      .then((cached) => {
        if (cached?.role === "supervisor") setUser(cached);
        else if (cached) return removeCached(SESSION_KEY);
      })
      .catch((error) => {
        console.error("Could not restore supervisor session:", error);
      })
      .finally(() => setChecking(false));
  }, []);

  async function logout() {
    await removeCached(SESSION_KEY);
    setUser(null);
    navigate("/login", { replace: true });
  }

  if (checking) return <main className="auth-card"><p>Loading…</p></main>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <><Home /><Login onLogin={setUser} defaultRole="supervisor" /></>} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <><Home /><Login onLogin={setUser} defaultRole="supervisor" initialMode="signup" /></>} />
      <Route path="/supervisor-login" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={user?.role === "supervisor" ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="/supervisor-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to={user?.role === "supervisor" ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
