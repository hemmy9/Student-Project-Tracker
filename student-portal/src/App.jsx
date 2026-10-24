// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import ChatPanel from "./components/ChatPanel.jsx";
import { calculateProgress } from "./lib/calculateProgress.js";
import { getSupabaseClient, subscribeToTable } from "./lib/supabaseClient.js";
import { getCached, removeCached, setCached, uploadFile } from "./lib/storage.js";

const SESSION_KEY = "student-session";
const studentTables = ["tasks", "documents", "feedbacks"];
const fallbackDashboardData = {
  tasks: [{ id: "sample-task", title: "Sample project task", status: "In progress" }],
  documents: [{ id: "sample-document", chapter: 1, title: "Sample chapter submission", status: "pending" }],
  feedbacks: [{ id: "sample-feedback", comment: "Sample supervisor feedback will appear here." }],
  messages: []
};

function Dashboard({ user, onLogout }) {
  const [data, setData] = useState({ tasks: [], documents: [], feedbacks: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [chapter, setChapter] = useState("1");
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
    setUsingFallbackData(false);
  }

  function showFallbackData(loadError) {
    if (!user.demo) console.error("Could not load student dashboard:", loadError);
    setData(fallbackDashboardData);
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
    const unsubscribe = studentTables.map((table) =>
      subscribeToTable(table, () => {
        if (active) loadData().catch((loadError) => {
          console.error(`Could not refresh ${table}:`, loadError);
          showFallbackData(loadError);
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
        chapter: Number(chapter),
        title: file.name,
        filename: file.name,
        file_url: uploaded.url,
        file_path: uploaded.path,
        status: "pending",
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
      {usingFallbackData && <p className="demo-notice" role="alert">{user.demo ? "Demo account: showing sample data. Sign in with a provisioned Supabase Auth account for live project records." : "Run setup.sql in Supabase to load live project data. Showing sample data; uploads are disabled."}</p>}
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
          <label htmlFor="document-chapter">Chapter</label>
          <select id="document-chapter" value={chapter} onChange={(event) => setChapter(event.target.value)}>
            {[1, 2, 3, 4, 5].map((number) => (
              <option key={number} value={number}>Chapter {number}</option>
            ))}
          </select>
          <label htmlFor="document-file">File</label>
          <input id="document-file" type="file" required onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button disabled={busy || !file || usingFallbackData} type="submit">{busy ? "Uploading…" : "Upload"}</button>
        </form>
        <ul className="record-list">
          {data.documents.map((document) => (
            <li key={document.id}>
              <span>
                Chapter {document.chapter || "—"} · {document.title || document.filename || "Document"}
                <br />
                <span className="badge">{document.status || "Pending"}</span>
                {document.review_feedback && <p className="muted">{document.review_feedback}</p>}
              </span>
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
      <ChatPanel user={user} />
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
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <><Home /><Login onLogin={setUser} defaultRole="student" /></>} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <><Home /><Login onLogin={setUser} defaultRole="student" initialMode="signup" /></>} />
      <Route path="/dashboard" element={user?.role === "student" ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user?.role === "student" ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
