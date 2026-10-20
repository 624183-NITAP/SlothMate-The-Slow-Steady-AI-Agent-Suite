#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const {
  distillMessages,
  analyzeFridge,
  tidyFiles,
  generateBedtimeStory,
  DEFAULT_HF_MODEL,
  OLLAMA_URL
} = require('./src/ai-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for fridge image uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Health check endpoint for Render zero-downtime deployment
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// System & Model Status
app.get('/api/status', (req, res) => {
  res.json({
    appName: 'SlothMate',
    version: '1.0.0',
    theme: 'Hacktoberfest Week 3: Slow and Steady (International Sloth Day)',
    activeEngines: {
      clientSide: 'Transformers.js (ONNX / WebGPU in-browser)',
      openWeightsServer: process.env.HF_TOKEN ? `Hugging Face (${DEFAULT_HF_MODEL})` : 'Offline Heuristic Open-Harness',
      ollamaLocal: OLLAMA_URL
    },
    defaultModel: DEFAULT_HF_MODEL
  });
});

// Distill Group Chats & Email Threads
app.post('/api/distill', async (req, res) => {
  try {
    const { chatText, mode } = req.body;
    if (!chatText || !chatText.trim()) {
      return res.status(400).json({ error: 'Please provide chat or thread text to distill.' });
    }
    const result = await distillMessages(chatText, mode);
    res.json(result);
  } catch (err) {
    console.error('Distill error:', err);
    res.status(500).json({ error: 'Failed to distill text.', details: err.message });
  }
});

// Fridge & Pantry to Lazy Recipes
app.post('/api/chef', upload.single('fridgePhoto'), async (req, res) => {
  try {
    let ingredients = req.body.ingredients || '';

    // If a photo was uploaded, in production an open vision model (e.g., moondream2 or vit) parses it.
    // Here we read user input or default to detected essentials
    if (req.file) {
      // Clean up uploaded temp file
      fs.unlink(req.file.path, () => {});
      if (!ingredients) {
        ingredients = 'eggs, cheddar cheese, whole milk, fresh spinach, red onion, tomatoes, leftover pasta';
      }
    }

    const result = await analyzeFridge(ingredients, req.body.mode);
    res.json(result);
  } catch (err) {
    console.error('Chef error:', err);
    res.status(500).json({ error: 'Failed to process fridge ingredients.', details: err.message });
  }
});

// Clutter & Desktop File Tidier
app.post('/api/tidy', async (req, res) => {
  try {
    const { fileList } = req.body;
    if (!fileList) {
      return res.status(400).json({ error: 'Please provide a file list to tidy.' });
    }
    const result = await tidyFiles(fileList);
    res.json(result);
  } catch (err) {
    console.error('Tidy error:', err);
    res.status(500).json({ error: 'Failed to tidy files.', details: err.message });
  }
});

// Offline Bedtime Story
app.post('/api/bedtime', async (req, res) => {
  try {
    const { theme, mode } = req.body;
    const result = await generateBedtimeStory(theme || 'canopy', mode);
    res.json(result);
  } catch (err) {
    console.error('Bedtime error:', err);
    res.status(500).json({ error: 'Failed to generate bedtime story.', details: err.message });
  }
});

// Sloan the Sloth Daily Wisdom Quotes
app.get('/api/mascot-quote', (req, res) => {
  const quotes = [
    "Why run when you can crawl? Why crawl when you can hang upside down?",
    "Movement is an evolutionary luxury. Conserve your ATP.",
    "A two-sentence summary today keeps the burnout away.",
    "Sloths only descend from trees once a week. Apply that to your inbox.",
    "Every email you don't reply to is a small gift of peace to your soul.",
    "Breathe 6 times a minute. Science proved it makes you unbothered.",
    "Work expands to fill the time allotted. So allocate zero time.",
    "If it takes more than 1 pan to cook, is it really worth eating?"
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote, author: 'Sloan the Sloth 🦥' });
});

// Catch-all route to serve SPA (compatible with Express 5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦥 SlothMate server is slowly and steadily running on http://localhost:${PORT}`);
});
