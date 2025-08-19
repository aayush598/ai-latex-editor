

# 📚 AI LaTeX Editor – Write, Compile & Collaborate with AI

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-blue?logo=vercel)](https://ai-latex-editor.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi)](#-backend)
[![License](https://img.shields.io/badge/License-MIT-black)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)](#-contributing)

**AI LaTeX Editor** is a full-stack project that combines the power of **AI**, **LaTeX**, and modern **web technologies** to provide an intelligent platform for researchers, students, and professionals to write, compile, and collaborate on scientific documents seamlessly.

👉 **Live Demo**: [https://ai-latex-editor.vercel.app/](https://ai-latex-editor.vercel.app/)

---

## ✨ Features

✅ **Document Management** – Create, edit, delete, and organize LaTeX projects.
✅ **AI Assistant** – Generate LaTeX code, explain snippets, and auto-fix errors.
✅ **PDF Compilation** – Compile LaTeX into PDFs safely in a sandboxed environment.
✅ **Math Intelligence** – Equation verification, symbolic derivations, and unit checks.
✅ **Figures & Tables** – Auto-generate LaTeX tables, plots, and TikZ diagrams.
✅ **References & Citations** – Fetch and validate BibTeX from DOI/arXiv.
✅ **Accessibility** – Alt text generation, color-blind compliance, and template validation.
✅ **Collaboration Tools** – Document diffs, AI-assisted merging, inline comments.
✅ **Scalable Backend** – Job queues, caching, observability, autoscaling, and failover-ready.

---

## 🖥️ Frontend

**Tech Stack**

* ⚛️ React (TypeScript)
* 🎨 TailwindCSS
* 🧩 Lucide Icons
* 🌐 Vercel Deployment

**Key Components**

* `DocumentSidebar` → Manage your LaTeX documents.
* `LaTeXEditor` → Rich code editor with AI assistance.
* `PDFViewer` → Preview compiled PDFs in real-time.
* `AIAssistant` → Ask AI to generate, explain, or fix LaTeX.
* `ResizablePanes` → Flexible UI for productivity.

---

## ⚡ Backend

**Tech Stack**

* 🐍 Python + FastAPI
* 🗄️ SQLite (pluggable with Postgres for scale)
* 🤖 AI Models (Gemini / SymPy / Crossref APIs)
* 📦 Celery + Redis (job queues for heavy tasks)

**Core APIs**

* `/documents` → CRUD for LaTeX docs
* `/compile` → Compile LaTeX into PDFs
* `/ai/*` → Generate LaTeX, explain snippets
* `/math/*` → Verify, derive, and check equations
* `/references/*` → Fetch + validate BibTeX
* `/figures/*` → Generate tables, plots, diagrams
* `/collaboration/*` → Diff, merge, summarize, comment

📖 [Full API Reference](#) (coming soon)

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/aayush598/ai-latex-editor.git
cd ai-latex-editor
```

### 2. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will be running at 👉 `http://127.0.0.1:8000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at 👉 `http://localhost:5173`

---

<!-- ## 🧪 Testing

* ✅ Backend: `pytest` for unit + integration tests
* ✅ Frontend: `vitest` + React Testing Library
* ✅ Load Testing: `k6` / `Locust`
* ✅ CI/CD: GitHub Actions (lint, test, security scans)

--- -->

## 🛡️ Security & Scalability

* 🔒 Input validation & rate limiting
* 🐳 Dockerized LaTeX sandbox (safe compilation)
* 📊 Observability with Prometheus + Grafana
* ☁️ Multi-region deployment with failover DB replicas
* 💰 Cost governance (quotas, anomaly detection)

<!-- ---

## 📈 Roadmap

* [x] AI-assisted LaTeX Editor
* [x] Real-time PDF compilation
* [x] Equation intelligence (SymPy + AI)
* [x] Collaboration features (diff, merge, comments)
* [ ] Offline mode for LaTeX editing
* [ ] Mobile-friendly editor
* [ ] Plugin ecosystem for templates/styles -->

---

## 🤝 Contributing

Contributions are welcome 🎉

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a PR 🚀

---

## 📜 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you like this project, **give it a star ⭐** on GitHub — it helps a lot!

👉 Live Demo: [ai-latex-editor.vercel.app](https://ai-latex-editor.vercel.app/)

---

🔥 With **AI + LaTeX + Collaboration**, this project is built for the next generation of researchers and creators.

---
