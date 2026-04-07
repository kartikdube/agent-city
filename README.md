# AgentCity Labs - Operations Center 🏙️🤖


> **AgentCity** is a dynamic, multi-agent simulation dashboard that allows users to model complex urban scenarios and observe how different governance styles (e.g., *People Pleasers*, *Fiscal Hawks*, *Power Players*, *Technocrats*) influence city-level metrics like traffic, budget, approval ratings, and housing.

Built with an immersive "Cyber-Industrial" aesthetic and an intuitive Next.js frontend, AgentCity simulates a sequential behavioral pipeline of AI agents evaluating a given city policy.

---

## ✨ Features

- 🧠 **Multi-Agent Simulation Pipeline**: Watch as AI analysts from different municipal departments (Infrastructure, Economic Development, Public Safety) debate the merits of specific policies in real-time.
- 📊 **Dynamic Scenario Modelling**: Choose from various behavioral modules that reflect different styles of decision-making. Are your city leaders prioritizing fast economic growth, or are they focused on public welfare?
- 📈 **Real-Time Impact Projections**: Visualize how policies dynamically alter starting metrics based on the final verdict from the "Mayor" agent.
- 🎨 **Sleek, Immersive UI**: Fully customized visual experience featuring rich dark modes, glassmorphism, glowing accents, and micro-animations to mimic a high-end operations center.

## 🌐 Deployment (Static Demo vs. Local AI)

**This repository exists in two primary states:**
1. **[Static Demo (gh-pages)](https://github.com/kartikdube/agent-city/tree/static-demo)**: The currently deployed GitHub Pages version is a highly optimized, fully static demo. It replays pre-saved scenario data to simulate AI behavioral output without requiring a heavy GPU or live backend, ensuring 100% up-time and high compatibility across browsers.
2. **Local Live AI (`main` branch)**: By running the repository locally via `main`, the dashboard dynamically interfaces directly with local LLMs (e.g., Ollama) hosted on `http://localhost:11434`, computing real-time, unstructured agent behaviors on the fly. 

To switch back to live processing in the UI, simply restore `DecisionPipeline.tsx` to utilize `fetch('/api/simulate')` inside the `startSimulation` block.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router), React 19
- **Styling**: Tailwind CSS v4, Framer Motion, Vanilla CSS
- **Icons**: Lucide React
- **AI Integration**: Custom `/api/simulate` API built to interface with local inference endpoints (e.g., Ollama).

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with a local instance of [Ollama](https://ollama.com/) (running on port `11434`) if you intend to run live agent deliberations.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/kartikdube/agent-city.git
   cd agent-city/ui
   ```
2. **Install dependencies**:

   ```bash
   npm install
   ```
3. **Start the development server**:

   ```bash
   npm run dev
   ```
4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the Operations Center.

## 📁 Repository Structure

- `/ui`: Contains the main Next.js web application.
  - `/src/components`: The core UI elements (`Dashboard`, `DecisionPipeline`, `HierarchyViewer`, etc.).
  - `/src/app/api`: Server-side API routes handling the streaming simulation logic and saving outputs.
  - `/public/scenarios`: JSON scenario modules describing the initial states and previous interaction logs.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

*Designed and engineered by [Kartik Dube](https://github.com/kartikdube) as part of an Advanced AI Engineering Portfolio.*
