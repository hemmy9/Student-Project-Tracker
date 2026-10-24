import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { calculateProgress } from "./lib/calculateProgress.js";
import { assertCanInsertFeedback } from "./lib/permissions.js";
import { getSupabaseClient, subscribeToTable } from "./lib/supabaseClient.js";
import { getCached, removeCached, setCached } from "./lib/storage.js";

const SESSION_KEY = "supervisor-session";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: queryError } = await getSupabaseClient()
        .from("supervisors")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (queryError) throw queryError;
      if (!data || data.role !== "supervisor") {
        throw new Error("No supervisor account was found for that email.");
      }
      await setCached(SESSION_KEY, data);
      onLogin(data);
      navigate("/supervisor-dashboard", { replace: true });
    } catch (loginError) {
      console.error("Supervisor sign-in failed:", loginError);
      setError(loginError.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-card">
      <p className="eyebrow">SUPERVISOR WORKSPACE</p>
      <h1>Sign in</h1>
      <p className="muted">Enter the email address on your supervisor record.</p>
      <form onSubmit={submit}>
        <label htmlFor="supervisor-email">Email</label>
        <input
          id="supervisor-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button disabled={busy} type="submit">
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <p className="demo-notice">
        Demo-only email matching; this does not verify identity or protect student data.
      </p>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [comment, setComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseClient();

  async function loadData() {
    setError("");
    const [studentResult, taskResult, documentResult, feedbackResult, messageResult] = await Promise.all([
      supabase.from("students").select("*").eq("role", "student").order("name"),
      supabase.from("tasks").select("*"),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("feedbacks").select("*"),
      supabase.from("messages").select("*")
    ]);
    if (studentResult.error) throw studentResult.error;
    if (taskResult.error) throw taskResult.error;
    if (documentResult.error) throw documentResult.error;
    if (feedbackResult.error) throw feedbackResult.error;
    if (messageResult.error) throw messageResult.error;
    setStudents(studentResult.data || []);
    setTasks(taskResult.data || []);
    setDocuments(documentResult.data || []);
    setFeedbacks(feedbackResult.data || []);
    setMessages(messageResult.data || []);
  }

  useEffect(() => {
    let active = true;
    loadData().catch((loadError) => {
      if (!active) return;
      console.error("Could not load supervisor dashboard:", loadError);
      setError(loadError.message || "Could not load dashboard data.");
    });
    const unsubscribe = ["students", "tasks", "documents", "feedbacks", "messages"].map((table) =>
      subscribeToTable(table, () => {
        if (active) loadData().catch((loadError) => {
          console.error(`Could not refresh ${table}:`, loadError);
          setError(loadError.message || "Could not refresh dashboard data.");
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
        <a className="brand" href="/supervisor-dashboard">ProjectTrack · Supervisor</a>
        <button className="secondary" type="button" onClick={onLogout}>Log out</button>
      </header>
      <section className="welcome">
        <p className="eyebrow">SUPERVISOR WORKSPACE</p>
        <h1>Student projects</h1>
        <p className="muted">Monitor project progress and provide feedback.</p>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
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
              <p>{feedbacks.filter((feedback) => feedback.student_id === student.id).length} feedback notes · {messages.filter((message) => message.student_id === student.id).length} messages</p>
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
                      <button disabled={busy} type="button" onClick={() => reviewDocument(document, "approved")}>Approve</button>
                      <button className="secondary" disabled={busy} type="button" onClick={() => reviewDocument(document, "rejected")}>Reject</button>
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
          <button disabled={busy || !students.length} type="submit">{busy ? "Saving…" : "Save feedback"}</button>
        </form>
      </section>
      <p className="demo-notice">
        Email-only demo. The browser-side role check is not an access-control boundary; configure Supabase Auth and RLS before using real data.
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
    navigate("/supervisor-login", { replace: true });
  }

  if (checking) return <main className="auth-card"><p>Loading…</p></main>;

  return (
    <Routes>
      <Route path="/supervisor-login" element={user ? <Navigate to="/supervisor-dashboard" replace /> : <LoginPage onLogin={setUser} />} />
      <Route path="/supervisor-dashboard" element={user?.role === "supervisor" ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/supervisor-login" replace />} />
      <Route path="*" element={<Navigate to={user?.role === "supervisor" ? "/supervisor-dashboard" : "/supervisor-login"} replace />} />
    </Routes>
  );
}
