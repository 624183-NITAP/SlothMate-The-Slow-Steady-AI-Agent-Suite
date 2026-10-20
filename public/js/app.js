/**
 * SlothMate Frontend Application Logic
 * Built for Hacktoberfest Week 3: Slow and Steady
 */

// Application State
const state = {
  activeEngine: 'auto', // 'auto', 'browser', 'huggingface', 'ollama'
  stats: {
    minutesSaved: 48,
    joulesConserved: 1240,
    awkwardAvoided: 9
  },
  audioPlaying: false,
  slothModeActive: false
};

// Preset Data for Instant Testing
const PRESETS = {
  familyChat: `[Mom 8:14 AM]: Good morning everyone! Remember grandma's 80th is coming up in two weeks! Who is bringing the apple pie?
[Dave 8:16 AM]: I can't do baking guys, I'm swamped with work. Can someone else take dessert?
[Sarah 8:20 AM]: Dave you always say that lol. Fine I'll make the pie if someone handles the potato salad.
[Mom 8:25 AM]: What about the gift? Should we all chip in $25 for the digital photo frame?
[Sarah 8:27 AM]: Yes! Perfect idea.
[Dave 8:31 AM]: Let's do that. Who's ordering it?
[Mom 8:35 AM]: We need someone to order it by tonight so it ships in time. Also what time is everyone arriving? 4 PM or 5 PM?
[Uncle Bob 8:42 AM]: 5 PM is better for me, traffic on I-95 is crazy.
[Sarah 8:45 AM]: 5 PM works. Can someone confirm who is buying the frame?`,

  slackIncident: `[alex.dev 14:02]: @here Anyone seeing latency spikes on the auth-gateway service? P99 is at 4.2s.
[sre.bot 14:03]: [P1 ALERT] auth-gateway error rate exceeded 5% over 5m window.
[chen.infra 14:04]: Looking into it now. Looks like connection pool exhaustion on redis cluster shard 3.
[alex.dev 14:06]: Should we roll back deploy #1498 from 30 mins ago?
[chen.infra 14:08]: Wait, don't rollback yet. Shard 3 just restarted. Monitoring health now.
[alex.dev 14:10]: Latency is dropping back to 120ms. Shard restart seems to have cleared the deadlock.
[sarah.lead 14:12]: Thanks team. Alex please post a quick summary in #incidents and Chen file a Jira ticket for the connection pool timeout config.`,

  roommates: `[Jake 19:12]: Hey guys, electric bill for October came in, it was $142. Split 3 ways is $47.33 each.
[Jake 19:13]: Also whose turn is it to buy dish soap and paper towels? We are completely out.
[Sam 19:25]: Just Venmoed you $47.33 Jake! I can grab the paper towels on my way home from gym.
[Jake 19:30]: Thanks Sam! Who's grabbing the dish soap?
[Sam 19:32]: If whoever is home can start the dishwasher that would be awesome too, it's totally full.`
};

const MESSY_FILES_PRESET = [
  "Screen Shot 2026-10-18 at 3.42.11 PM.png",
  "invoice_acme_corp_september_v2_FINAL_final.pdf",
  "IMG_4091.PNG",
  "tax_receipt_uber_ride_1026.pdf",
  "zoom_us_meeting_recording_09332.mp4",
  "draft_proposal_unnamed_copy(1).docx",
  "Screen Shot 2026-10-19 at 11.15.02 AM.png",
  "backup_node_modules_archive_temp.zip",
  "receipt_groceries_trader_joes.pdf",
  "notes_brainstorm_hackathon_ideas.txt"
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEngineSelector();
  initDistillModule();
  initChefModule();
  initTidyModule();
  initSanctuaryModule();
  initSlothMode();
  fetchMascotQuote();
  updateStatCounters();
});

// Tab Switching
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// Engine Mode Selector
function initEngineSelector() {
  const chips = document.querySelectorAll('.engine-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', async () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeEngine = chip.dataset.engine;

      if (state.activeEngine === 'browser') {
        showToast('Initializing In-Browser Transformers.js (WebGPU)...');
        if (window.inBrowserAI) {
          await window.inBrowserAI.init((p) => {
            if (p.status === 'ready') showToast('✓ Open-weight model active in browser!');
          });
        }
      } else {
        showToast(`AI Engine switched to: ${chip.textContent.trim()}`);
      }
    });
  });
}

// Sloth Mode (Slow & Steady Chillout)
function initSlothMode() {
  const toggle = document.getElementById('slothModeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    state.slothModeActive = !state.slothModeActive;
    document.body.classList.toggle('sloth-mode', state.slothModeActive);
    toggle.innerHTML = state.slothModeActive 
      ? `<span>🌿</span> Sloth Mode: On` 
      : `<span>🦥</span> Sloth Mode`;
    showToast(state.slothModeActive ? "Sloth Mode activated: animations slowed to 60%" : "Normal mode restored");
  });
}

// Fetch Sloan Mascot Quote
async function fetchMascotQuote() {
  try {
    const res = await fetch('/api/mascot-quote');
    const data = await res.json();
    if (data.quote) {
      document.getElementById('sloanQuoteText').textContent = `"${data.quote}"`;
    }
  } catch (e) {
    // default already present
  }
}

// Sloth Energy Tracker Counter Updates
function addSavedEnergy(minutes = 15, joules = 420) {
  state.stats.minutesSaved += minutes;
  state.stats.joulesConserved += joules;
  state.stats.awkwardAvoided += 1;
  updateStatCounters();
}

function updateStatCounters() {
  const minEl = document.getElementById('statMinutes');
  const jouleEl = document.getElementById('statJoules');
  const awkwardEl = document.getElementById('statAwkward');

  if (minEl) minEl.textContent = state.stats.minutesSaved + 'm';
  if (jouleEl) jouleEl.textContent = state.stats.joulesConserved + ' J';
  if (awkwardEl) awkwardEl.textContent = state.stats.awkwardAvoided;
}

// Toast Helper
function showToast(msg) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Copy to Clipboard
function copyText(text, label = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✓ ${label}`);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// ==========================================
// Module 1: SlothDistill (Chat & Thread Distiller)
// ==========================================
function initDistillModule() {
  const input = document.getElementById('chatInput');
  const distillBtn = document.getElementById('distillBtn');
  const outputBox = document.getElementById('distillOutput');

  // Preset Chips
  document.getElementById('presetFamily')?.addEventListener('click', () => {
    input.value = PRESETS.familyChat;
    showToast('Loaded Family Chat preset');
  });
  document.getElementById('presetSlack')?.addEventListener('click', () => {
    input.value = PRESETS.slackIncident;
    showToast('Loaded Slack Incident preset');
  });
  document.getElementById('presetRoommates')?.addEventListener('click', () => {
    input.value = PRESETS.roommates;
    showToast('Loaded Roommates preset');
  });

  distillBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) {
      showToast('Please paste a chat thread or pick a sample above.');
      return;
    }

    distillBtn.disabled = true;
    distillBtn.innerHTML = `<span>⏳</span> Distilling with Sloth AI...`;

    try {
      // Check in-browser model if enabled
      let clientAnalysis = null;
      if (state.activeEngine === 'browser' && window.inBrowserAI) {
        clientAnalysis = await window.inBrowserAI.analyzeUrgency(text);
      }

      const res = await fetch('/api/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatText: text, mode: state.activeEngine })
      });

      const data = await res.json();
      renderDistillResult(data, clientAnalysis);
      addSavedEnergy(18, 480);
      showToast('Thread distilled! You conserved 18 mins of typing.');
    } catch (err) {
      showToast('Distill failed: ' + err.message);
    } finally {
      distillBtn.disabled = false;
      distillBtn.innerHTML = `<span>⚡</span> Distill & Generate Lazy Replies`;
    }
  });
}

function renderDistillResult(data, clientAnalysis) {
  const outputBox = document.getElementById('distillOutput');

  let summaryHtml = '';
  if (Array.isArray(data.summary)) {
    summaryHtml = data.summary.map(s => `<div class="summary-bullet">${escapeHtml(s)}</div>`).join('');
  } else {
    summaryHtml = `<div class="summary-bullet">${escapeHtml(data.summary)}</div>`;
  }

  const actions = data.actionItems && data.actionItems.length > 0 
    ? data.actionItems.map(a => `<div class="summary-bullet" style="color: #fbbf24;">${escapeHtml(a)}</div>`).join('')
    : '<div class="summary-bullet" style="color: #94a3b8;">No direct effort required from you. Pure peace.</div>';

  const engineBadge = clientAnalysis 
    ? `Local WebAssembly (${clientAnalysis.label})` 
    : (data.aiSource || 'Open Sloth Harness');

  outputBox.innerHTML = `
    <div class="summary-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4><span>✨</span> Sloth Summary (TL;DR)</h4>
        <span style="font-size: 0.72rem; color: var(--emerald-light);">${escapeHtml(engineBadge)}</span>
      </div>
      ${summaryHtml}
    </div>

    <div class="summary-box" style="border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.06);">
      <h4 style="color: var(--amber-light);"><span>🎯</span> Detected Action Items</h4>
      ${actions}
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: var(--emerald-light);">
        <span>💬</span> 1-Click Lazy Replies (Pick your flavor)
      </h4>
      <div class="replies-section">
        <div class="reply-card">
          <div class="reply-meta">
            <span class="reply-badge">1. Ultra-Lazy (Zero Effort)</span>
            <div class="reply-text" id="replyUltra">${escapeHtml(data.lazyReplies?.ultraLazy || "Sounds good! 👍")}</div>
          </div>
          <button class="copy-btn" onclick="copyText(document.getElementById('replyUltra').textContent, 'Ultra-lazy reply copied!')">Copy</button>
        </div>

        <div class="reply-card">
          <div class="reply-meta">
            <span class="reply-badge">2. Polite Deflection (Buy Time)</span>
            <div class="reply-text" id="replyDeflect">${escapeHtml(data.lazyReplies?.politeDeflection || "Thanks for the update, checking later!")}</div>
          </div>
          <button class="copy-btn" onclick="copyText(document.getElementById('replyDeflect').textContent, 'Polite deflection copied!')">Copy</button>
        </div>

        <div class="reply-card">
          <div class="reply-meta">
            <span class="reply-badge">3. Diplomatic Consensus (Go with the Flow)</span>
            <div class="reply-text" id="replyConsensus">${escapeHtml(data.lazyReplies?.diplomaticConsensus || "Whatever the group decides is fine with me.")}</div>
          </div>
          <button class="copy-btn" onclick="copyText(document.getElementById('replyConsensus').textContent, 'Diplomatic reply copied!')">Copy</button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// Module 2: SlothChef (Fridge to Lazy Recipes)
// ==========================================
function initChefModule() {
  const sampleBtn = document.getElementById('loadSampleFridgeBtn');
  const fridgeImg = document.getElementById('fridgePreviewImg');
  const inputIngredients = document.getElementById('ingredientsInput');
  const chefBtn = document.getElementById('chefBtn');
  const outputBox = document.getElementById('chefOutput');
  const fileInput = document.getElementById('fridgeFileInput');

  sampleBtn.addEventListener('click', () => {
    fridgeImg.src = '/assets/sample-fridge.jpg';
    fridgeImg.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    inputIngredients.value = 'eggs, sharp cheddar cheese, whole milk, fresh spinach, red onion, tomatoes, leftover pasta in container';
    showToast('Loaded Sample Refrigerator Snapshot');
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        fridgeImg.src = ev.target.result;
        fridgeImg.style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
      };
      reader.readAsDataURL(e.target.files[0]);
      showToast('Fridge photo ready for analysis');
    }
  });

  chefBtn.addEventListener('click', async () => {
    const ingr = inputIngredients.value.trim();
    chefBtn.disabled = true;
    chefBtn.innerHTML = `<span>🍳</span> Inventing Low-Effort Meals...`;

    try {
      const res = await fetch('/api/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingr, mode: state.activeEngine })
      });
      const data = await res.json();
      renderChefResult(data);
      addSavedEnergy(25, 600);
      showToast('Recipes generated! No unnecessary dishes required.');
    } catch (err) {
      showToast('Chef failed: ' + err.message);
    } finally {
      chefBtn.disabled = false;
      chefBtn.innerHTML = `<span>✨</span> Generate Sloth Meals & Grocery List`;
    }
  });
}

function renderChefResult(data) {
  const outputBox = document.getElementById('chefOutput');

  const recipesHtml = (data.recipes || []).map((r, idx) => `
    <div class="recipe-card">
      <div class="recipe-title">#${idx + 1}: ${escapeHtml(r.title)}</div>
      <div class="recipe-meta">
        <span>⏱️ Prep: ${escapeHtml(r.prepTime)}</span>
        <span>🔥 Cook: ${escapeHtml(r.cookTime)}</span>
        <span>🍽️ Wash: ${escapeHtml(r.dishesToWash)}</span>
        <span style="color: var(--emerald-light);">${escapeHtml(r.effortScore)}</span>
      </div>
      <div class="recipe-steps">${escapeHtml(r.instructions)}</div>
    </div>
  `).join('');

  const groceryItems = (data.groceryList || []).map(g => `
    <li style="margin-bottom: 6px; font-size: 0.88rem; color: #cbd5e1;">
      <strong>${escapeHtml(g.item)}</strong> — <span style="color: var(--text-muted); font-size: 0.8rem;">${escapeHtml(g.reason)}</span>
    </li>
  `).join('');

  outputBox.innerHTML = `
    <div class="summary-box">
      <h4><span>🦥</span> Sloan's Laziness Philosophy</h4>
      <div style="font-size: 0.9rem; color: #cbd5e1; font-style: italic;">"${escapeHtml(data.slothTip)}"</div>
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--amber-light);">
        <span>🍲</span> Zero-Effort Sloth Recipes
      </h4>
      ${recipesHtml}
    </div>

    <div class="summary-box" style="border-color: rgba(52, 211, 153, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="margin: 0;"><span>🛒</span> Auto-Generated Grocery List</h4>
        <button class="copy-btn" onclick="copyText('${data.groceryList?.map(g => g.item).join(', ')}', 'Grocery list copied!')">Copy List</button>
      </div>
      <ul style="padding-left: 20px;">
        ${groceryItems}
      </ul>
    </div>
  `;
}

// ==========================================
// Module 3: SlothTidier (Clutter File Organizer)
// ==========================================
function initTidyModule() {
  const filesInput = document.getElementById('filesInput');
  const sampleBtn = document.getElementById('loadSampleFilesBtn');
  const tidyBtn = document.getElementById('tidyBtn');
  const outputBox = document.getElementById('tidyOutput');

  sampleBtn.addEventListener('click', () => {
    filesInput.value = MESSY_FILES_PRESET.join('\n');
    showToast('Loaded 10 messy downloads & desktop screenshots');
  });

  tidyBtn.addEventListener('click', async () => {
    const raw = filesInput.value.trim();
    if (!raw) {
      showToast('Please paste a file list or load messy sample files.');
      return;
    }

    tidyBtn.disabled = true;
    tidyBtn.innerHTML = `<span>🧹</span> Organizing Clutter...`;

    try {
      const res = await fetch('/api/tidy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileList: raw })
      });
      const data = await res.json();
      renderTidyResult(data);
      addSavedEnergy(25, 520);
      showToast('Files categorized & cleanup scripts generated!');
    } catch (e) {
      showToast('Tidy failed: ' + e.message);
    } finally {
      tidyBtn.disabled = false;
      tidyBtn.innerHTML = `<span>🪄</span> Organize & Generate 1-Click Script`;
    }
  });
}

function renderTidyResult(data) {
  const outputBox = document.getElementById('tidyOutput');

  let categoriesHtml = '';
  for (const cat in data.categories) {
    const list = data.categories[cat];
    if (list.length > 0) {
      categoriesHtml += `
        <div style="margin-bottom: 12px;">
          <strong style="color: var(--emerald-light); font-size: 0.88rem;">📁 ${escapeHtml(cat)} (${list.length})</strong>
          <div style="font-size: 0.78rem; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-top: 4px; padding-left: 12px;">
            ${list.map(f => `• ${escapeHtml(f)}`).join('<br>')}
          </div>
        </div>
      `;
    }
  }

  outputBox.innerHTML = `
    <div class="summary-box">
      <h4><span>✓</span> Organization Plan</h4>
      <div style="font-size: 0.9rem; color: #cbd5e1;">${escapeHtml(data.summary)}</div>
    </div>

    <div class="summary-box" style="background: rgba(8, 14, 11, 0.9);">
      ${categoriesHtml}
    </div>

    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--amber-light);">⚡ 1-Click PowerShell Cleanup Script</span>
        <button class="copy-btn" onclick="copyText(document.getElementById('psScript').textContent, 'PowerShell script copied!')">Copy Script</button>
      </div>
      <div class="code-box" id="psScript">${escapeHtml(data.scripts.powershell)}</div>
    </div>

    <div style="margin-top: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--emerald-light);">🐧 1-Click Bash Cleanup Script</span>
        <button class="copy-btn" onclick="copyText(document.getElementById('bashScript').textContent, 'Bash script copied!')">Copy Script</button>
      </div>
      <div class="code-box" id="bashScript">${escapeHtml(data.scripts.bash)}</div>
    </div>
  `;
}

// ==========================================
// Module 4: SlothSanctuary (Sound & Bedtime)
// ==========================================
function initSanctuaryModule() {
  const masterAudioBtn = document.getElementById('masterAudioBtn');
  const storyBtn = document.getElementById('generateStoryBtn');
  const storyBox = document.getElementById('storyContentBox');
  const themeSelect = document.getElementById('storyThemeSelect');

  // Sloth-paced breathing label animation
  const breathLabel = document.getElementById('breathStateText');
  let inhale = true;
  setInterval(() => {
    if (breathLabel) {
      inhale = !inhale;
      breathLabel.textContent = inhale ? "Inhale..." : "Exhale...";
    }
  }, 5000); // 5s in, 5s out = 6 breaths/min (Sloth Cadence)

  // Web Audio Procedural Soundscape
  masterAudioBtn.addEventListener('click', () => {
    if (!state.audioPlaying) {
      window.slothAudio.start();
      state.audioPlaying = true;
      masterAudioBtn.innerHTML = `<span>⏸️</span> Pause Ambient Soundscape`;
      masterAudioBtn.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
      showToast('Ambient rainforest soundscape playing (100% synthesized offline)');
    } else {
      window.slothAudio.stop();
      state.audioPlaying = false;
      masterAudioBtn.innerHTML = `<span>▶️</span> Play Synthesized Rainforest (Web Audio)`;
      masterAudioBtn.style.background = '';
      showToast('Audio paused');
    }
  });

  // Mixer Sliders
  document.getElementById('sliderRain')?.addEventListener('input', (e) => {
    window.slothAudio.setVolume('rain', e.target.value);
  });
  document.getElementById('sliderWind')?.addEventListener('input', (e) => {
    window.slothAudio.setVolume('wind', e.target.value);
  });
  document.getElementById('sliderBrown')?.addEventListener('input', (e) => {
    window.slothAudio.setVolume('brown', e.target.value);
  });
  document.getElementById('sliderChimes')?.addEventListener('input', (e) => {
    window.slothAudio.setVolume('chimes', e.target.value);
  });

  // Bedtime Story Generator
  storyBtn.addEventListener('click', async () => {
    storyBtn.disabled = true;
    storyBtn.innerHTML = `<span>🌙</span> Dreaming Slow Tale...`;

    try {
      const res = await fetch('/api/bedtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeSelect.value, mode: state.activeEngine })
      });
      const data = await res.json();
      storyBox.innerHTML = `
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--amber-light); margin-bottom: 8px;">
          ${escapeHtml(data.title)}
        </div>
        <div style="font-size: 0.8rem; color: var(--emerald-light); margin-bottom: 14px;">
          ⏱️ ${escapeHtml(data.duration)} • ${escapeHtml(data.breathingPace)}
        </div>
        <div style="font-size: 0.95rem; line-height: 1.7; color: #e2e8f0;">
          ${escapeHtml(data.text)}
        </div>
      `;
      addSavedEnergy(20, 300);
      showToast('Bedtime story woven. Relax and conserve your energy.');
    } catch (e) {
      showToast('Story error: ' + e.message);
    } finally {
      storyBtn.disabled = false;
      storyBtn.innerHTML = `<span>📖</span> Generate Sloth Bedtime Story`;
    }
  });
}

// Utility: HTML Escaper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
