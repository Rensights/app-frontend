"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="landing-nav">
          <div className="nav-container">
            <div className="logo">Rensights</div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#about">About</a>
            </div>
            <div className="nav-actions">
              <Link href="/portal/login" className="btn-link">
                Login
              </Link>
              <Link href="/portal/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            Property Intelligence Platform
          </h1>
          <p className="hero-subtitle">
            Make smarter property investment decisions with AI-powered insights,
            market analysis, and real-time deal alerts.
          </p>
          <div className="hero-cta">
            <Link href="/portal/signup" className="btn btn-large btn-primary">
              Get Started
            </Link>
            <Link href="/portal/login" className="btn btn-large btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Rensights?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Market Analysis</h3>
              <p>
                Get comprehensive market insights and trends to make informed
                investment decisions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Deal Alerts</h3>
              <p>
                Receive instant notifications on the best property deals
                matching your criteria.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>
                Leverage artificial intelligence to analyze property values,
                rental yields, and investment potential.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Performance Tracking</h3>
              <p>
                Track your portfolio performance and monitor investment returns
                in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of smart property investors using Rensights</p>
          <div className="cta-buttons">
            <Link href="/portal/signup" className="btn btn-large btn-primary">
              Sign Up Free
            </Link>
            <Link href="/portal/login" className="btn btn-large btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Rensights</h4>
              <p>Property Intelligence Platform</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><Link href="/portal/login">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Rensights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
