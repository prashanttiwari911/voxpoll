# 🗳️ VoTI — Vote & Poll of India

VoTI is a modern, interactive online polling platform built with **Next.js 16.2.6** (App Router). Designed to make data collection and community engagement seamless, VoTI offers robust poll creation, results analytics, and a secure administration panel.

This project was built as a production-oriented MCA submission demonstrating full-stack development with Next.js, Prisma, NextAuth, and a Python sentiment microservice.

---

## ✨ Key Features

### 📊 Advanced Analytics
*   **Live Standings:** Animated progress bars with automatic "Leader" highlighting.
*   **Vote Share:** Interactive donut pie charts.
*   **Demographics:** Grouped bar charts for age brackets and regional distribution, computed from aggregate vote data.
*   **Trend Analysis:** Dual-line charts showing daily vote trends and cumulative totals.
*   **Results update** after each vote submission via server-side refresh (not WebSocket).

### 🛠️ Robust Poll Creation
*   **Multi-Choice Support:** Fully implemented end-to-end — allow users to select multiple options with a configurable `maxChoices` limit. UI shows checkboxes and a live selection counter.
*   **Rich Media & Metadata:** Support for cover images and up to 5 custom `#tags`.
*   **Scheduling:** Set a future `scheduledAt` date or manually save a poll as a `DRAFT`.
*   **Auto-Closing:** Set a `closesAt` date to automatically lock the poll from further voting.

### 💬 Community Engagement
*   **Nested Comments:** Participate in threaded discussions with support for up to one level of nested replies.
*   **Sentiment Analysis:** (Requires Python Microservice) Comments are analyzed using VADER — a rule-based lexicon sentiment analyser — via a FastAPI microservice to classify them as Positive 😊, Negative 😔, or Neutral 😐.
*   **Bookmarks:** Save your favorite polls to a dedicated dashboard.
*   **Notifications:** Get alerted when someone replies to your comment or likes your post.

### 🛡️ Secure Admin Panel
*   **Role-Based Access Control (RBAC):** Dedicated `/admin` route exclusively for `ADMIN` and `MODERATOR` roles.
*   **User Management:** Admins can instantly upgrade or downgrade user roles.
*   **Content Moderation:** Moderators can delete inappropriate polls with a secure two-step confirmation.
*   **Data Export:** Export any poll's raw data and metadata summary via CSV.

---

## 💻 Tech Stack

### Frontend & Core
*   **Framework:** Next.js 16.2.6 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Charts:** Recharts
*   **Icons:** Lucide React

### Backend & Database
*   **Database:** SQLite (via `better-sqlite3`)
*   **ORM:** Prisma v7
*   **Validation:** Zod v4 (Strict server-side validation)
*   **Authentication:** NextAuth (Google OAuth + Developer Credentials)

### Microservice (Python)
*   **Framework:** FastAPI
*   **Analysis:** VADER rule-based sentiment analysis (`vaderSentiment` library)

---

## 🚀 Getting Started

### 1. Next.js Application
To run the main web platform:

```bash
# Install dependencies
npm install

# Apply database migrations
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Python Sentiment Microservice
To enable the AI comment sentiment analysis, you must run the Python microservice alongside Next.js.

```powershell
# Navigate to the microservice directory
cd sentiment-service

# Run the automated setup and start script (Windows)
.\start.ps1
```
The FastAPI server will boot on `http://127.0.0.1:8000`.

---

## 🔒 Security Posture
*   **Edge Middleware:** Enforces RBAC redirects for the admin panel and blocks state-mutating API requests that fail CSRF origin checks.
*   **Strict Security Headers:** `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, and more.
*   **Idle Timeout:** Automatically logs out users after 15 minutes of inactivity to protect sensitive sessions.
*   **Audit Logging:** Critical actions (like poll deletion or role changes) are securely logged in the database.

---
*Made with 💖 for the VoTI Community.*
