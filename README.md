# AI Code Insights: Enterprise Intelligence Dashboard

## Overview
**AI Code Insights** is a state-of-the-art Enterprise Intelligence Dashboard designed to provide quantitative insights into AI-assisted software development. The platform bridges the gap between engineering output and AI investment by tracking the lifecycle of AI-generated vs. manually-written code across the entire organization.

## Key Performance Indicators
- **AI Output share (%):** The ratio of AI-generated lines of code vs. manual crafts.
- **Velocity Boost:** A metric tracking productivity gains over established manual baselines.
- **Merge Success Rate:** Tracking how often AI-assisted code clears quality checkpoints.
- **AI Output Efficiency:** Lines of code generated per million tokens consumed.
- **AI Risk Score:** Real-time monitoring of guardrail interventions and potential security flaws.

## Core Features

### 1. Executive Overview
A high-level command center for leadership to monitor monthly AI investments, cumulative adoption rates, and organizational velocity. Includes live telemetry feeds from VCS webhooks.

### 2. Team & Developer Analytics
Detailed benchmarking for Engineering Squads. Identify high-performance "AI Visionaries" and track adoption maturity across different teams (Frontend, Backend, Infrastructure, etc.).

### 3. Real-time Telemetry
A live streaming engine that visualizes incoming code events, commit confidence scores, and repository-level activity as it happens.

### 4. Security & Guardrails
A dedicated module for quality control. It tracks AI-risk interventions (e.g., hardcoded secrets, unsafe patterns) and provides a "Guardrail Efficiency" score to ensure scaling AI doesn't compromise security.

### 5. Merge Pipeline Analysis
Analyzes the deployment funnel from draft to production. Traces the success and rejection rates of AI-heavy Pull Requests to optimize review workflows.

### 6. Privacy First
Built-in **Strict Privacy Mode** which allows organizations to anonymize individual developer data while maintaining aggregate insights, ensuring compliance with internal data policies.

## Technology Stack
- **Frontend Framework:** [React](https://reactjs.org/) (v18+)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Visualizations:** [Recharts](https://recharts.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Networking:** Mock Socket.io service for live telemetry simulation.

## Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd ai-code-insights

# Install dependencies
npm install
```

### Development
```bash
# Run the development server
npm run dev
```
The application will be available at `http://localhost:8080` (or the port specified by Vite).

### Build for Production
```bash
# Generate the production bundle
npm run build
```

## Project Structure
- `src/components/ui`: Custom premium UI components (EnhancedChart, MetricCard, etc.).
- `src/pages`: Functional page views (Overview, Team Analytics, AI Tools, etc.).
- `src/lib`: Utility functions, ROI calculators, and export tools.
- `src/data`: Mock data generators supporting the dashboard's analytics.
- `src/store`: Global state management for privacy and pricing configurations.

## License
Proprietary - © 2026 AI Code Insights
