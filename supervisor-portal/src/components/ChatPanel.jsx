// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import React, { useEffect, useRef, useState } from "react";
import { getSupabaseClient, subscribeToTable } from "../lib/supabaseClient.js";

function readLocalMessages(studentId) {
  const stored = JSON.parse(localStorage.getItem("fyp_messages") || "[]");
  if (!Array.isArray(stored)) throw new Error("Saved chat messages are not a list.");
  return stored.filter((message) => message.student_id === studentId);
}

function saveLocalMessage(message) {
  const stored = JSON.parse(localStorage.getItem("fyp_messages") || "[]");
  if (!Array.isArray(stored)) throw new Error("Saved chat messages are not a list.");
  const next = [...stored.filter((item) => item.id !== message.id), message];
  localStorage.setItem("fyp_messages", JSON.stringify(next));
  window.dispatchEvent(new Event("fyp-messages-change"));
}

export default function ChatPanel({ user, studentId, studentName = "this student" }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const remoteReadyRef = useRef(false);

  useEffect(() => {
    let active = true;
    let stopRealtime = () => {};

    function loadLocal() {
      if (!studentId) {
        setMessages([]);
        return;
      }
      try {
        setMessages(readLocalMessages(studentId));
      } catch (loadError) {
        console.error("Could not read local chat messages:", loadError);
        setError(loadError.message);
      }
    }

    async function loadRemote() {
      if (!studentId) return;
      try {
        const { data, error: queryError } = await getSupabaseClient()
          .from("messages")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: true });
        if (queryError) throw queryError;
        if (!active) return;
        setMessages(data || []);
        setRemoteReady(true);
        remoteReadyRef.current = true;
        setError("");
      } catch (loadError) {
        if (!active) return;
        console.error("Shared chat is unavailable; using local messages:", loadError);
        setRemoteReady(false);
        remoteReadyRef.current = false;
        loadLocal();
        setError("Chat is using this browser's local message history. Configure the Supabase messages table for shared realtime chat.");
      }
    }

    setRemoteReady(false);
    remoteReadyRef.current = false;
    loadLocal();
    if (user.demo) {
      setError(studentId ? "Demo chat is saved in this browser only." : "");
    } else {
      loadRemote();
    }
    if (studentId && !user.demo) {
      stopRealtime = subscribeToTable("messages", () => { loadRemote(); }, `student_id=eq.${studentId}`);
    }
    const refreshLocal = () => { if (!remoteReadyRef.current) loadLocal(); };
    window.addEventListener("storage", refreshLocal);
    window.addEventListener("fyp-messages-change", refreshLocal);
    return () => {
      active = false;
      stopRealtime();
      window.removeEventListener("storage", refreshLocal);
      window.removeEventListener("fyp-messages-change", refreshLocal);
    };
  }, [studentId, user.demo]);

  async function submit(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text || !studentId) return;
    setBusy(true);
    setError("");
    setNotice("");
    const message = {
      id: crypto.randomUUID(),
      student_id: studentId,
      sender_id: user.id,
      sender_role: user.role,
      sender_name: user.name || user.email,
      content: text,
      created_at: new Date().toISOString()
    };
    try {
      if (remoteReady) {
        const { error: insertError } = await getSupabaseClient().from("messages").insert({
          student_id: message.student_id,
          sender_id: message.sender_id,
          sender_role: message.sender_role,
          content: message.content,
          created_at: message.created_at
        });
        if (insertError) throw insertError;
      } else {
        saveLocalMessage(message);
      }
      setMessages((current) => {
        const next = new Map(current.map((item) => [item.id, item]));
        next.set(message.id, message);
        return [...next.values()];
      });
      setNotice(remoteReady ? "Message sent." : "Message saved in this browser only.");
      setContent("");
    } catch (sendError) {
      console.error("Could not send shared chat message; saving locally:", sendError);
      try {
        saveLocalMessage(message);
        setMessages((current) => {
          const next = new Map(current.map((item) => [item.id, item]));
          next.set(message.id, message);
          return [...next.values()];
        });
        setNotice("Message saved in this browser only.");
        setContent("");
      } catch (localError) {
        console.error("Could not save local chat message:", localError);
        setError(localError.message || "Could not save the message.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel chat-panel">
      <h2>Project chat</h2>
      <p className="muted">{studentId ? `Conversation with ${studentName}.` : "Choose a student to open the chat."}</p>
      <ul className="chat-messages" aria-live="polite">
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.sender_name || message.sender_role || "Project team"}</strong>
            <p>{message.content || message.message || message.body || ""}</p>
            <time dateTime={message.created_at}>{message.created_at ? new Date(message.created_at).toLocaleString() : ""}</time>
          </li>
        ))}
        {messages.length === 0 && <li className="chat-empty">No messages yet. Start the conversation.</li>}
      </ul>
      {error && <p className="demo-notice" role="status">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
      <form className="chat-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="project-chat-message">Message</label>
        <input id="project-chat-message" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message…" maxLength="2000" required />
        <button className="gradient-button" disabled={busy || !studentId || !content.trim()} type="submit">{busy ? "Sending…" : "Send"}</button>
      </form>
    </section>
  );
}
