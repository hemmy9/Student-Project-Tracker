// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { setCached } from "../lib/storage.js";

const ROLE = "student";
const DEMO = { email: "student@test.com", password: "123456", id: "demo-student-1", role: ROLE, name: "Demo Student", demo: true };

async function passwordDigest(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readLocalUsers() {
  try {
    const users = JSON.parse(localStorage.getItem("fyp_users") || "[]");
    if (!Array.isArray(users)) throw new Error("Saved demo accounts are not a list.");
    return users;
  } catch (error) {
    console.error("Could not read local demo accounts:", error);
    throw new Error("Local demo account data is invalid. Clear fyp_users and try again.");
  }
}

export default function Login({ onLogin, defaultRole = ROLE, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function finishLogin(user) {
    const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role, demo: Boolean(user.demo) };
    await setCached("student-session", sessionUser);
    onLogin(sessionUser);
    navigate("/dashboard", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (role !== ROLE) {
        throw new Error("Use the supervisor portal to sign in as a supervisor.");
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (mode === "signup") {
        if (password.length < 6) throw new Error("Use a password with at least 6 characters.");
        const users = readLocalUsers();
        if (users.some((user) => user.email === normalizedEmail && user.role === ROLE)) {
          throw new Error("An account with that email already exists on this browser.");
        }
        const user = {
          id: crypto.randomUUID(),
          name: name.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          role: ROLE,
          demo: true,
          passwordDigest: await passwordDigest(password)
        };
        localStorage.setItem("fyp_users", JSON.stringify([...users, user]));
        await finishLogin(user);
        return;
      }

      if (normalizedEmail === DEMO.email && password === DEMO.password) {
        await finishLogin(DEMO);
        return;
      }

      const digest = await passwordDigest(password);
      const localUser = readLocalUsers().find((user) =>
        user.email === normalizedEmail &&
        user.role === ROLE &&
        user.passwordDigest === digest
      );
      if (localUser) {
        await finishLogin(localUser);
        return;
      }

      const { data, error: authError } = await getSupabaseClient().auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      if (authError) throw authError;
      const authRole = data.user.user_metadata?.role;
      if (authRole !== ROLE) {
        await getSupabaseClient().auth.signOut();
        throw new Error("This account is not registered for the student portal.");
      }
      await finishLogin({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email,
        role: ROLE
      });
    } catch (loginError) {
      console.error("Student sign-in failed:", loginError);
      setError(loginError.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) navigate("/");
    }}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" type="button" aria-label="Close sign in" onClick={() => navigate("/")}>×</button>
        <p className="eyebrow">STUDENT WORKSPACE</p>
        <h2 id="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">Keep your final year project moving forward.</p>
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setError(""); }}>Login</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
        </div>
        <div className="role-pills" aria-label="Choose portal role">
          {["student", "supervisor"].map((portalRole) => (
            <button key={portalRole} type="button" className={role === portalRole ? "active" : ""} onClick={() => setRole(portalRole)}>
              {portalRole === "student" ? "Student" : "Supervisor"}
            </button>
          ))}
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label htmlFor="student-name">Name</label>
              <input id="student-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </>
          )}
          <label htmlFor="student-email">Email</label>
          <input id="student-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <label htmlFor="student-password">Password</label>
          <input id="student-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength="6" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" />
          <button className="gradient-button" disabled={busy} type="submit">{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
        <p className="demo-hint">Demo: student@test.com · 123456. Local signups are saved on this browser; demo access is not secure authentication.</p>
      </section>
    </div>
  );
}
