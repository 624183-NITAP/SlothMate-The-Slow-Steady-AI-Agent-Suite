# 🦥 SlothMate: The Slow & Steady AI Agent Harness

> **Built for International Sloth Day & the Hacktoberfest Open-Source AI Challenge (Week 3: Slow and Steady)**  
> *Channeling our inner sloth to automate what we dread, conserve biological energy, and run 100% open-weight AI locally and on Render.*

![Sloan the Sloth](/public/assets/sloan-mascot.jpg)

---

## 🌿 Overview

Tomorrow, October 20, is **International Sloth Day**. Sloths have it figured out: they move at their own pace, conserve energy, take only 6 breaths per minute, and never overcomplicate life.

**SlothMate** is an open-source AI agent suite designed to reward pure laziness. It automates the everyday digital tasks you keep putting off—distilling 200-message chaotic group chats into 2 sentences with 1-click ghostwritten replies, transforming messy fridge photos into 3-minute 1-pan microwave meals, automatically tidying messy desktop files with 1-click scripts, and soothing you to sleep with offline procedural ambient soundscapes.

Most importantly, **open-source AI is at the absolute core** of SlothMate:
- **Zero Cloud Lock-in**: Run open models in your browser via **Transformers.js (ONNX/WebGPU)** with 0 data leaving your device.
- **Open-Weight Server Engine**: Seamlessly connect to Hugging Face open-weight models (`Qwen/Qwen2.5-7B-Instruct`, `meta-llama/Llama-3.2-3B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.3`) or local **Ollama** (`localhost:11434`).
- **Zero-Dependency Heuristic Agent**: Built-in fallback rule engine so it works instantly offline anywhere, even in airplane mode.
- **Zero Cost & Infinite Privacy**: Your private family chats, financial files, and fridge photos never leak to closed proprietary servers.

---

## ✨ Features & Modules

### 1. 💬 SlothDistill (Chat & Inbox Distiller + 1-Click Ghostwriter)
- Paste messy group chats (family WhatsApp, Slack incident threads, roommate drama).
- Distills the chaos into a **2-sentence summary** of what actually matters.
- Detects hidden action items and generates **3 calibrated 1-click replies**:
  1. *Ultra-Lazy*: Minimal keystrokes (e.g., `"Sounds good! 👍"`).
  2. *Polite Deflection*: Buys time without committing (e.g., `"Checking later today!"`).
  3. *Diplomatic Consensus*: Agrees with the majority so you don't have to think.

### 2. 🥦 SlothChef (Fridge Snap to Lazy 3-Ingredient Meals)
- Upload a fridge/pantry snapshot or click **Load Sample Fridge**.
- Generates meals with an **Effort Score** (e.g., `1/10 Effort`, `1 pan to wash`, `4-minute microwave scramble`).
- Generates an auto-organized grocery shopping list for the missing staples you actually need.

### 3. 🧹 SlothTidier (Clutter Desktop & Downloads Cleaner)
- Paste messy filenames (`IMG_9401.png`, `invoice_v2_FINAL.pdf`, zoom recordings).
- Automatically categorizes files into clean directories (`Documents/Finance/`, `Media/Screenshots/`, `Dev/Archives/`).
- Generates ready-to-execute **1-click PowerShell and Bash cleanup scripts** to tidy your laptop in 1 second.

### 4. 🌙 SlothSanctuary (Wind-Down Bedtime & Ambient Soundscape)
- **Generative Bedtime Storyteller**: Slow-paced, sensory-rich bedtime stories ("The Mossy Canopy of Manuel Antonio", "The River That Forgot to Rush").
- **Sloth-Paced Breathing Guide**: Visual pulsating orb calibrated to true sloth biology (6 breaths per minute / 5s inhale, 5s exhale).
- **Procedural Ambient Soundscape Synthesizer**: 100% offline procedural audio built with the HTML5 **Web Audio API** (Tropical Rain, Canopy Wind, Lo-Fi Brown Noise, Zen Chimes). Zero external audio files required!

### 5. 🦥 The Sloth Meter & Sloth Mode
- Live tracker measuring **Time Saved**, **Biological Joules Conserved**, and **Awkward Replies Avoided**.
- **Sloth Mode Toggle**: Slows animations to 60% speed, dims bright contrast, and activates a warm rainforest aesthetic.
- Sloan the Sloth daily philosophical quotes on energy conservation.

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- Node.js v18+ (tested on Node 20 & 24)
- (Optional) [Ollama](https://ollama.ai) if running local LLMs on your machine

### 1. Clone & Install
```bash
git clone https://github.com/624183-NITAP/SlothMate-The-Slow-Steady-AI-Agent-Suite.git
cd SlothMate-The-Slow-Steady-AI-Agent-Suite
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(Leave blank to use the built-in offline open engine and client-side Transformers.js!)*

### 3. Run Locally
```bash
npm start
```
Visit **http://localhost:3000** in your browser!

---

## ☁️ Deploy to Render in 2 Minutes

SlothMate is pre-configured for **Render Free Tier**:
- Uses an ultra-lightweight Node.js footprint (<50MB memory) that never hits Render's RAM limits.
- Built-in `/health` endpoint for Render zero-downtime health checks.
- Pre-packaged `render.yaml` blueprint.

### Deployment Steps:
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
6. Click **Create Web Service**. Your live URL will be ready in under 60 seconds!

---

## 🧠 Why Open Innovation Matters

| Dimension | Closed Proprietary APIs (OpenAI, Anthropic) | SlothMate Open-Source AI Architecture |
|---|---|---|
| **Privacy** | Personal family WhatsApp chats, messy desktop file names, and personal fridge photos are sent to third-party corporate servers. | **100% Local / Zero Exfiltration**: Runs in-browser via Transformers.js or on local Ollama. Your files never leave your device. |
| **Cost** | Recurring $20/month subscriptions + token billing per request. | **$0 Forever**: Run on open-weight models with zero recurring subscription fees. |
| **Offline Independence** | Completely breaks if internet drops or API servers experience outages. | **100% Offline Capability**: Runs in airplane mode, off-grid, or during network disruptions. |
| **Model Freedom** | Locked into vendor deprecation schedules and arbitrary API policy changes. | **Hot-Swappable Open Weights**: Easily switch between Qwen-2.5, Llama-3.2, Mistral, or Phi-3. |

---

## 📜 License
MIT License. Created for the DEV Community Hacktoberfest 2026 Open-Source AI Challenge.
