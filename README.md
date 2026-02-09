# 📦 Caixinhas: Collaborative Financial Intelligence

<div align="center">

![Product Version](https://img.shields.io/badge/version-0.1.0-blue.svg?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Next.js%2015-Black?style=for-the-badge&logo=next.js)
![AI Engine](https://img.shields.io/badge/Genkit%20AI-4285F4?style=for-the-badge&logo=google)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)

**Empowering couples to transform taboo financial conversations into shared dreams.**

[The Manifesto](./about-project.md) • [Architecture Guide](./docs/ARCHITECTURE.md) • [Performance Report](./PERFORMANCE-STATUS.md)

</div>

---

## 🚀 Vision & Strategy

**Caixinhas** is not just another finance tracker. It’s a **Collaborative Financial Operating System** designed for couples. In a world where money is often a source of friction, Caixinhas provides a neutral, transparent, and encouraging space where equity meets individual autonomy.

### The Problem

Traditional finance apps are either too personal (ignoring the partner) or too complex (spreadsheets). This gap creates "financial silos" that lead to stress and lack of shared vision.

### The Solution: The "Vault & Goal" Protocol

- **Shared Vaults**: Transparent shared spaces for joint expenses, without merging bank accounts in the real world.
- **Personal Vaults**: Autonomy and privacy within a shared ecosystem.
- **Goal-Driven Logic**: Turning abstract savings into visual "Caixinhas" (e.g., "Tuscany Trip 2026").

---

## 🛠️ Engineering Excellence

Built with a **Senior-First** mentality, the architecture prioritizes scalability, security, and developer joy.

### 🧠 Generative AI Tier (Google Genkit)

We leverage **Google Genkit** to provide a "Financial Coach" experience:

- **Financial Report Flows**: Automated monthly analysis using LLMs to detect spending patterns and offer human-like coaching.
- **Transaction Analysis**: Intelligent categorization and sentiment analysis of spending behavior.
- See: `src/ai/flows`

### 🏗️ Architectural Pillars

- **Service-Oriented Core**: Decoupled business logic in `src/services` for maximum testability.
- **RBAC (Role-Based Access Control)**: Granular permissions for Vault members, ensuring data integrity and privacy.
- **Optimized Data Layer**: Prisma ORM with performance-tuned PostgreSQL indexing for sub-100ms query times on large transaction datasets.
- **PWA Infrastructure**: Full service-worker implementation for offline resilience and an app-native UX.

---

## 💎 Product Ecosystem

- **High-Conversion Landing**: A premium [Landing Page](./src/app/landing) featuring scroll animations (Framer Motion) and optimized asset delivery.
- **Communication Suite**: Integrated SendGrid for lifecycle emails (Invite → Progress → Report).
- **Financial Grammar**: Native support for:
  - **Recurring Transactions**: Automated lifecycle management for bills.
  - **Installment Tracking**: Smart breakdown of credit card purchases.
  - **Inter-Account Transfers**: Tracking movement between bank accounts and "Caixinhas".

---

## 🧰 Developer Experience (DX) & Automation

The project includes an **Industrial-Grade Toolbelt** of 26+ utility scripts to streamline development:

| Script                        | Purpose                                               |
| :---------------------------- | :---------------------------------------------------- |
| `benchmark-api.ts`            | Measures and audits API latency.                      |
| `switch-db.js`                | Hot-swaps between PostgreSQL and SQLite for testing.  |
| `generate-sw.js`              | Dynamically builds the Service Worker for PWA.        |
| `test-invite-flow.ts`         | Automated verification of complex RBAC invite logic.  |
| `test-all-email-templates.ts` | Visual preview and test-send of all lifecycle emails. |

Check the full suite in `/scripts`.

---

## 💻 Tech Stack

- **Core**: Next.js 15 (App Router), React 18, TypeScript.
- **State & Data**: Prisma ORM, PostgreSQL (Production), SQLite (Dev/Test).
- **Intelligence**: Google Genkit, Google Generative AI.
- **UI/UX**: Tailwind CSS, Radix UI, Framer Motion, Lucide Icons.
- **Testing**: Jest (Unit/Integration), Playwright (E2E), Critters (LCP Optimization).
- **Storage**: AWS S3/Cloud Storage for transaction artifacts.

---

## 🏁 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   Copy `.env.development.example` to `.env` and fill the keys (Prisma, Auth, GenAI).
3. **Initialize Database**:
   ```bash
   npm run prisma:generate
   npm run db:seed
   ```
4. **Launch Engine**:
   ```bash
   npm run dev
   ```

---

<div align="center">
Built with ❤️ for those who dream together.
</div>
