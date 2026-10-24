// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="tech-home">
      <header className="home-nav glass">
        <a className="home-brand" href="/">◈ <span>Project<span className="brand-accent">Track</span></span></a>
        <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#about">About</a></nav>
        <Link className="nav-login" to="/login">Login</Link>
      </header>
      <section className="hero-copy">
        <p className="eyebrow">PLAN BOLDLY · BUILD BRILLIANTLY</p>
        <h1>Your final year.<br /><span>Your next big idea.</span></h1>
        <p className="hero-description">One calm, clear workspace for every milestone, draft, and conversation with your supervisor.</p>
        <Link className="gradient-button hero-cta" to="/signup">Get started <span aria-hidden="true">↗</span></Link>
      </section>
      <div className="hero-art" aria-label="A graduation cap hovering above a cyan-lit rock pedestal">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="rock-glow" />
        <div className="rock-pedestal"><span /></div>
        <div className="cap-tassel" />
        <div className="grad-cap"><span className="cap-top" /><span className="cap-base" /></div>
        <article className="floating-card security-card"><span className="feature-icon">◈</span><div><strong>Reinforced Security</strong><small>Your work, protected</small></div><span className="check-icon">✓</span></article>
        <article className="floating-card review-card"><span className="feature-icon purple">↗</span><div><strong>Rapid Review</strong><small>Feedback without delays</small></div></article>
        <article className="floating-card support-card"><span className="feature-icon orange">✦</span><div><strong>24/7 Support</strong><small>Keep momentum anytime</small></div></article>
        <span className="art-particle particle-a" /><span className="art-particle particle-b" /><span className="art-particle particle-c" />
      </div>
      <section className="feature-strip" id="features">
        <article><span>01</span><h2>Stay organized</h2><p>Keep project documents and progress in one place.</p></article>
        <article><span>02</span><h2>Work together</h2><p>Share updates and feedback with your supervisor.</p></article>
        <article><span>03</span><h2>See what’s next</h2><p>Make deadlines and milestones easier to track.</p></article>
      </section>
      <p className="home-footnote" id="about">Student Project Tracker · Final Year Project workspace</p>
    </main>
  );
}
