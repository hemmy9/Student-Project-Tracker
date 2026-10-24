import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { calculateProgress } from "./lib/calculateProgress.js";
import { getSupabaseClient, subscribeToTable } from "./lib/supabaseClient.js";
import { getCached, removeCached, setCached, uploadFile } from "./lib/storage.js";

const SESSION_KEY = "student-session";
const studentTables = ["tasks", "documents", "feedbacks", "messages"];

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
        .from("students")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (queryError) throw queryError;
      if (!data || data.role !== "student") {
        throw new Error("No student account was found for that email.");
      }
      await setCached(SESSION_KEY, data);
      onLogin(data);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      console.error("Student sign-in failed:", loginError);
      setError(loginError.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-card">
      <p className="eyebrow">STUDENT WORKSPACE</p>
      <h1>Sign in</h1>
      <p className="muted">Enter the email address on your student record.</p>
      <form onSubmit={submit}>
        <label htmlFor="student-email">Email</label>
        <input
          id="student-email"
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
  const [data, setData] = useState({ tasks: [], documents: [], feedbacks: [], messages: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const supabase = getSupabaseClient();

  async function loadData() {
    setError("");
    const results = await Promise.all(
      studentTables.map((table) =>
        supabase.from(table).select("*").eq("student_id", user.id)
      )
    );
    const failed = results.find((result) => result.error);
    if (failed) throw failed.error;
    setData(Object.fromEntries(studentTables.map((table, index) => [table, results[index].data || []])));
  }

  useEffect(() => {
    let active = true;
    loadData().catch((loadError) => {
      if (!active) return;
      console.error("Could not load student dashboard:", loadError);
      setError(loadError.message || "Could not load dashboard data.");
    });
    const unsubscribe = studentTables.map((table) =>
      subscribeToTable(table, () => {
        if (active) loadData().catch((loadError) => {
          console.error(`Could not refresh ${table}:`, loadError);
          setError(loadError.message || "Could not refresh dashboard data.");
        });
      }, `student_id=eq.${user.id}`)
    );
    return () => {
      active = false;
      unsubscribe.forEach((stop) => stop());
    };
  }, [user.id]);

  async function submitDocument(event) {
    event.preventDefault();
    if (!file) return;
    const form = event.currentTarget;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const uploaded = await uploadFile(file, `students/${user.id}`);
      const { error: insertError } = await supabase.from("documents").insert({
        student_id: user.id,
        title: file.name,
        filename: file.name,
        file_url: uploaded.url,
        file_path: uploaded.path,
        created_at: new Date().toISOString()
      });
      if (insertError) throw insertError;
      setFile(null);
      form.reset();
      setNotice("Document uploaded.");
      await loadData();
    } catch (uploadError) {
      console.error("Document upload failed:", uploadError);
      setError(uploadError.message || "Could not upload the document.");
    } finally {
      setBusy(false);
    }
  }

  const progress = calculateProgress(data.tasks);
  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/dashboard">ProjectTrack · Student</a>
        <button className="secondary" type="button" onClick={onLogout}>Log out</button>
      </header>
      <section className="welcome">
        <p className="eyebrow">YOUR PROJECT WORKSPACE</p>
        <h1>Welcome{user.name || user.student_name ? `, ${user.name || user.student_name}` : ""}</h1>
        <p className="muted">Track project tasks and share documents with your supervisor.</p>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
      <section className="summary-grid">
        <article className="panel">
          <span className="muted">Project progress</span>
          <strong className="metric">{progress}%</strong>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <p className="muted">{data.tasks.length} tasks</p>
        </article>
        <article className="panel">
          <span className="muted">Documents</span>
          <strong className="metric">{data.documents.length}</strong>
          <p className="muted">Files shared with your supervisor</p>
        </article>
        <article className="panel">
          <span className="muted">Feedback</span>
          <strong className="metric">{data.feedbacks.length}</strong>
          <p className="muted">Supervisor notes</p>
        </article>
      </section>
      <section className="panel">
        <h2>Tasks</h2>
        {data.tasks.length === 0 ? <p className="muted">No tasks have been added yet.</p> : (
          <ul className="record-list">
            {data.tasks.map((task) => (
              <li key={task.id}>
                <span>{task.title || task.name || "Untitled task"}</span>
                <span className="badge">{task.status || "Pending"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel">
        <h2>Upload a document</h2>
        <form className="upload-form" onSubmit={submitDocument}>
          <label htmlFor="document-file">File</label>
          <input id="document-file" type="file" required onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button disabled={busy || !file} type="submit">{busy ? "Uploading…" : "Upload"}</button>
        </form>
        <ul className="record-list">
          {data.documents.map((document) => (
            <li key={document.id}>
              <span>{document.title || document.filename || "Document"}</span>
              {document.file_url && <a href={document.file_url} target="_blank" rel="noreferrer">Open</a>}
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>Supervisor feedback</h2>
        {data.feedbacks.length === 0 && <p className="muted">No feedback yet.</p>}
        <ul className="record-list">
          {data.feedbacks.map((feedback) => (
            <li key={feedback.id}>{feedback.comment || feedback.feedback || "Feedback"}</li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>Messages</h2>
        {data.messages.length === 0 && <p className="muted">No messages yet.</p>}
        <ul className="record-list">
          {data.messages.map((message) => (
            <li key={message.id}>{message.content || message.message || message.body || "Message"}</li>
          ))}
        </ul>
      </section>
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
        if (cached?.role === "student") setUser(cached);
        else if (cached) return removeCached(SESSION_KEY);
      })
      .catch((error) => {
        console.error("Could not restore student session:", error);
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
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={setUser} />} />
      <Route path="/dashboard" element={user?.role === "student" ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user?.role === "student" ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
