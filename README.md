# 💳 Subscription & Billing Admin Dashboard

A full-stack Subscription Management Dashboard featuring multi-card wallet support, domestic Libyan payment networks, automated renewal alerts, and real-time multi-currency conversion.

---

## 🚀 Key Features

- **Multi-Card Customer Management**: Customers can save multiple cards (e.g., primary and backup payment methods).
- **Libyan Payment Integration**: Supports local payment networks (**Tadawul / تداول**, **Moamalat / معاملات**, **Sadad / سداد**, and Libyan Bank cards) alongside international Visa & Mastercard.
- **Zero-Reload Card Switching**: Admins can switch which card is actively billed for a subscription with instantaneous database sync.
- **Multi-Currency Switcher**: Toggle real-time between **LYD (د.ل)**, **USD ($)**, and **EUR (€)** with automatic MRR recalculations.
- **Automated Pre-Renewal Alerts**: Built-in background engine that scans and flags subscriptions due within 3 days to prevent renewal failures and surprise charges.
- **PCI-DSS Compliant Design**: Sensitive credit card information is never stored directly; only tokenized references and card metadata are handled.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (zero-config, plug-and-play)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Billing & Email**: Stripe API structure & Resend

---

## ⚡ Quick Start for Reviewers

Clone and run this project locally in 3 steps:

### 1. Install Dependencies
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 2. Initialize Database & Seed Sample Data
\`\`\`bash
npx prisma db push
npx tsx prisma/seed.ts
\`\`\`

### 3. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Features

- **Test Currency Switcher**: Use the dropdown in the header to switch between LYD, USD, and EUR.
- **Test Card Switching**: In the table under **"Active Billed Card (Switchable)"**, pick another card to change the billing method.
- **Test Expiration Notification Endpoint**: Visit [http://localhost:3000/api/cron/check-expirations](http://localhost:3000/api/cron/check-expirations) to trigger the renewal notification worker.