# 🗳️ VoTI — Vote & Poll of India

VoTI is a modern, joyful, and highly interactive online polling platform built with Next.js 15. Designed to make data collection and community engagement seamless, VoTI offers robust poll creation, real-time analytics, and a secure administration panel. 

This project was rebuilt from the ground up to serve as a production-ready, scalable application suitable for MCA project submission.

---

## ✨ Key Features

### 📊 Advanced Analytics
*   **Live Standings:** Animated progress bars with automatic "Leader" highlighting.
*   **Vote Share:** Interactive donut pie charts.
*   **Demographics:** Real-time grouped bar charts for age brackets and regional distribution.
*   **Trend Analysis:** Dual-line charts showing daily vote trends and cumulative totals.

### 🛠️ Robust Poll Creation
*   **Multi-Choice Support:** Allow users to select multiple options with a customizable `maxChoices` limit.
*   **Rich Media & Metadata:** Support for cover images and up to 5 custom `#tags`.
*   **Scheduling:** Set a future `scheduledAt` date or manually save a poll as a `DRAFT`.
*   **Auto-Closing:** Set a `closesAt` date to automatically lock the poll from further voting.

### 💬 Community Engagement
*   **Nested Comments:** Participate in threaded discussions with support for up to one level of nested replies.
*   **AI Sentiment Analysis:** (Requires Python Microservice) Comments are analyzed in real-time by an AI microservice to determine if they are Positive 😊, Negative 😔, or Neutral 😐.
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
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Shadcn UI patterns
*   **Charts:** Recharts
*   **Icons:** Lucide React

### Backend & Database
*   **Database:** SQLite (via `better-sqlite3`)
*   **ORM:** Prisma v7
*   **Validation:** Zod v4 (Strict server-side validation)
*   **Authentication:** NextAuth (Google OAuth + Developer Credentials)

### Microservice (Python)
*   **Framework:** FastAPI
*   **Analysis:** VADER Sentiment Analysis (`vaderSentiment`)

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
