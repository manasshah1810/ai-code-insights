# 🚀 AI-Code-Insights: Enterprise Intelligence Platform

**AI-Code-Insights** is a high-fidelity, professional-grade analytics dashboard designed to monitor, analyze, and optimize AI-augmented software development. It provides an enterprise-wide view of how AI tools like GitHub Copilot and Cursor impact your codebase, team velocity, and security posture.

---

## � Key Features & Capabilities

### 📊 Comprehensive Dashboards
- **Executive Overview**: High-level KPIs including AI adoption rates, token consumption costs, and global line counts.
- **Team-Specific Analytics**: Scoped views for managers to track squad performance, merge rates, and tool preferences.
- **Personal Developer Portal**: Individual self-service analytics for developers to monitor their AI usage and productivity trends.

### 🤖 Intelligent AI Attribution
- **Heuristic Engine**: Fast, automated signature detection for identifying the source of code commits.
- **LLM Attribution Engine**: Advanced fallback analysis using Anthropic's Claude to verify code origin with high confidence.
- **Merge Analytics**: In-depth tracking of PR success rates and code review overhead for AI-generated code.

### 🏛️ Professional Reporting & Intelligence
- **SWOT Analysis Page**: Automated AI-driven assessment of Strengths, Weaknesses, Opportunities, and Threats for different teams and projects.
- **Dynamic PDF Generator**: Generates pixel-perfect, branded PDF reports for stakeholders.
- **Security Guardrails**: Monitoring for "AI Flaws" and security risks in machine-generated code.

---

## 🎨 Multi-Brand (White-Label) Support

Designed for diverse enterprise deployments, the platform supports multiple brand modes through environment variables. This allows the same codebase to be deployed for different organizations or sub-brands on Vercel or other platforms.

### 🏳️ Supported Brands:
- **Company AI (Default)**: Standard "ACI" branding.
- **persistent AI**: Personalized logo and color theme for persistent.
- **Cogniify AI**: Personalized logo and name mapping for Cogniify.

---

## ⚙️ Configuration & Orchestration

The application uses a sophisticated environment injection system to maintain performance and security.

### 🔑 Environment Variable Setup (`.env`)

Add the following to your environment configuration:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_BRAND` | Set the active brand mode | `persistent` / `cogniify` / `company` |
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic Claude API Key | `sk-ant-api03-...` |

**Verification**: To ensure you are using the correct secret, verify the last few characters of your active Anthropic key: **`...0J-1jwAA`**

### 🏗️ Technical Architecture Details

Vite's default environment protection is configured in `vite.config.ts` to allow the use of `NEXT_PUBLIC_` prefixes:
```typescript
envPrefix: ['VITE_', 'NEXT_PUBLIC_']
```

The branding is resolved at runtime in `src/lib/brand-config.ts` which handles:
1. Identifying the host environment (Vite vs Node).
2. Normalizing brand inputs (Case-insensitive matching).
3. Providing fallback assets for the UI and PDF generator.

---

## 📦 Installation & Developer Setup

### 1. Requirements
- Node.js (Latest stable version)
- NPM or Bun

### 2. Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
The app will launch at `http://localhost:8080` by default.

---

## 🗺️ Project Structure Overview

```text
├── src/
│   ├── components/      # UI Components (TopBar, Sidebar, Role Badges)
│   ├── lib/             # Core Logic (Attribution, Heuristic Engine, PDF Export)
│   ├── pages/           # View Modules (Dashboard, SWOT, Glossary, Leaderboard)
│   ├── store/           # Global State Management (Zustand)
│   ├── styles/          # Custom CSS & Tailwind Configurations
│   └── main.tsx         # Application Entry Point
├── public/              # Static Assets (Logos & Placeholders)
└── vite.config.ts       # Build and Proxy Configurations
```

## 📄 Automated Report Generation

The reporting system orchestrates data across your entire organization:
- **Admin Scope**: Includes cost models, adoption trends, and organization-wide investment metrics.
- **Manager Scope**: Focuses on team velocity, primary tool attribution, and squad merge rates.
- **Developer Scope**: Highlights rank among peers, weekly trend analysis, and PR success rates.