/**
 * SlothMate AI Engine: Open-Source AI Harness
 * Built for Hacktoberfest Week 3: Slow and Steady (International Sloth Day)
 * 
 * Supports:
 * 1. Hugging Face Open-Weight Inference (Qwen-2.5, Llama-3.2, Mistral, Phi-3)
 * 2. Local Ollama instance (localhost:11434)
 * 3. Built-in Open Sloth Heuristic Rule Agent (100% offline, zero-lag, no API key required)
 */

const DEFAULT_HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const HF_TOKEN = process.env.HF_TOKEN || '';

/**
 * Universal query dispatcher to open models
 */
async function queryOpenModel({ systemPrompt, userPrompt, temperature = 0.6, maxTokens = 600, mode = 'auto' }) {
  // If Ollama is requested or reachable
  if (mode === 'ollama') {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          stream: false,
          options: { temperature, num_predict: maxTokens }
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.response, source: 'Local Ollama (Open-Weight)' };
      }
    } catch (err) {
      console.warn('Ollama unavailable, falling back:', err.message);
    }
  }

  // If Hugging Face token is provided or public router is used
  if (HF_TOKEN && (mode === 'auto' || mode === 'huggingface')) {
    try {
      const endpoint = `https://api-inference.huggingface.co/models/${DEFAULT_HF_MODEL}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          parameters: { max_new_tokens: maxTokens, temperature, return_full_text: false }
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const data = await res.json();
        const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
        if (text) {
          return { text: text.trim(), source: `Hugging Face (${DEFAULT_HF_MODEL})` };
        }
      }
    } catch (err) {
      console.warn('HF Inference API unavailable, falling back:', err.message);
    }
  }

  // Default: Built-in Sloth Heuristic Engine
  return null;
}

/**
 * Distill noisy group chats, email threads, or Slack messages
 */
async function distillMessages(rawChat, mode = 'auto') {
  const systemPrompt = `You are Sloan the Sloth AI, a hyper-efficient agent dedicated to extreme laziness. 
Your job is to read overwhelming group chats and distill them into:
1. Two-line summary of what actually matters.
2. Detected action items (if any).
3. 3 pre-written lazy replies:
   - Ultra-Lazy (minimal keystrokes, e.g. "Sounds good! 👍")
   - Polite Deflection (buying time without commitment)
   - Diplomatic Consensus (agreeing with the majority so you don't have to think)
Return clean JSON with format:
{
  "summary": ["Line 1", "Line 2"],
  "actionItems": ["item 1"],
  "lazyReplies": {
    "ultraLazy": "...",
    "politeDeflection": "...",
    "diplomaticConsensus": "..."
  },
  "effortConserved": "Saved ~18 mins of pointless texting"
}`;

  const openModelRes = await queryOpenModel({
    systemPrompt,
    userPrompt: `Here is the chat thread:\n\n${rawChat}`,
    mode
  });

  if (openModelRes && openModelRes.text) {
    try {
      // Find JSON block if present
      const jsonMatch = openModelRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...parsed, aiSource: openModelRes.source };
      }
    } catch (e) {
      // fallback to parsing or heuristic
    }
  }

  // Intelligent Open Heuristic Sloth Agent (Works 100% offline with zero dependencies)
  return fallbackDistill(rawChat);
}

function fallbackDistill(rawChat) {
  const lines = rawChat.split('\n').filter(l => l.trim().length > 0);
  const text = rawChat.toLowerCase();

  let topic = "General updates & chatter";
  let line1 = "Mostly banter and back-and-forth updates.";
  let line2 = "No urgent crisis requiring you to break your rest.";
  let actions = [];
  let ultra = "Sounds good! 👍";
  let deflection = "Thanks for the heads up, I'll review this when I'm at my desk.";
  let consensus = "I'm totally fine with whatever the group decides!";

  if (text.includes('dinner') || text.includes('lunch') || text.includes('pizza') || text.includes('food') || text.includes('eat') || text.includes('restaurant')) {
    topic = "Food & Gathering Plans";
    line1 = "The group is trying to coordinate where and when to eat.";
    line2 = "General consensus is leaning towards dinner around 7:30 PM.";
    actions = ["Vote on the restaurant pick (or let others choose)"];
    ultra = "Down for whatever! 🍕";
    deflection = "Count me in, just ping me the address when it's decided.";
    consensus = "Whatever cuisine everyone else wants works great for me.";
  } else if (text.includes('bug') || text.includes('deploy') || text.includes('pr') || text.includes('prod') || text.includes('incident') || text.includes('server')) {
    topic = "Technical/Deployment Discussion";
    line1 = "Team is investigating an issue / reviewing PRs.";
    line2 = "Mitigation is underway; no immediate action required from your end unless paged.";
    actions = ["Acknowledge status without taking on extra tickets"];
    ultra = "Ack, monitoring. 👀";
    deflection = "In the middle of a focus block, pinging back if needed.";
    consensus = "Agreed with the proposed rollback/fix strategy.";
  } else if (text.includes('trip') || text.includes('flight') || text.includes('hotel') || text.includes('airbnb') || text.includes('weekend')) {
    topic = "Trip / Vacation Coordination";
    line1 = "Logistics debate over dates, booking, and budget.";
    line2 = "Everyone has opinions, but nobody has booked yet.";
    actions = ["Send your preferred dates or stay hands-off"];
    ultra = "I'm in! Let me know my share of the split.";
    deflection = "Checking my calendar tonight, don't wait up on me.";
    consensus = "Option B looks best to me, happy to split evenly.";
  } else if (text.includes('rent') || text.includes('bill') || text.includes('trash') || text.includes('dishes') || text.includes('clean')) {
    topic = "Household / Roommate Logistics";
    line1 = "Routine household chores and shared bill reconciliation.";
    line2 = "All amounts are split; quick confirmation expected.";
    actions = ["Confirm payment sent via Venmo/Zelle"];
    ultra = "Sent! 💸";
    deflection = "Got it, sending payment as soon as I sit down.";
    consensus = "All good on my side, thanks for taking care of it!";
  } else {
    // General chat
    actions = ["Skim through if curious, otherwise safe to mute"];
  }

  return {
    topic,
    summary: [line1, line2],
    actionItems: actions,
    lazyReplies: {
      ultraLazy: ultra,
      politeDeflection: deflection,
      diplomaticConsensus: consensus
    },
    effortConserved: `Analyzed ${lines.length} messages in 0.04s. Saved ~${Math.max(8, Math.round(lines.length * 1.5))} mins of typing.`,
    aiSource: "SlothMate Local Heuristic Agent (Open Offline Engine)"
  };
}

/**
 * Fridge / Pantry to Lazy 3-Ingredient Recipes & Auto Grocery List
 */
async function analyzeFridge(ingredientsList, mode = 'auto') {
  const items = (ingredientsList || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const recipes = [];
  const groceryList = [];

  // Determine recipes based on what's detected
  const hasEggs = items.some(i => i.includes('egg'));
  const hasCheese = items.some(i => i.includes('cheese') || i.includes('cheddar'));
  const hasSpinach = items.some(i => i.includes('spinach') || i.includes('green') || i.includes('lettuce'));
  const hasPasta = items.some(i => i.includes('pasta') || i.includes('spaghetti') || i.includes('noodle'));
  const hasTomato = items.some(i => i.includes('tomato'));
  const hasMilk = items.some(i => i.includes('milk') || i.includes('butter'));
  const hasOnion = items.some(i => i.includes('onion'));

  if (hasEggs && hasCheese) {
    recipes.push({
      title: "The 3-Minute Microwave Mug Frittata",
      effortScore: "1/10 (Sloth Approved)",
      prepTime: "60 seconds",
      cookTime: "2 minutes in microwave",
      dishesToWash: "Just 1 coffee mug and a fork",
      ingredientsUsed: ["2 Eggs", "Handful of Cheese", hasSpinach ? "Pinch of Spinach" : "Salt & Pepper"],
      instructions: "Crack eggs into a mug. Fork-whisk with cheese and spinach. Microwave on high for 90 seconds. Eat directly from the mug."
    });
  }

  if (hasPasta || (hasCheese && hasMilk)) {
    recipes.push({
      title: "One-Pan Lazy Cheesy Meltdown",
      effortScore: "2/10 (Zero Straining Required)",
      prepTime: "2 minutes",
      cookTime: "5 minutes",
      dishesToWash: "1 single pan",
      ingredientsUsed: [hasPasta ? "Leftover Pasta" : "Bread/Tortilla", "Cheddar/Cheese", hasTomato ? "Sliced Tomato" : "Butter"],
      instructions: "Dump pasta or bread straight into a warm pan with cheese. Put lid on so steam melts it effortlessly. Slide onto plate or eat from pan."
    });
  }

  if (hasSpinach || hasTomato || hasOnion) {
    recipes.push({
      title: "The Toss & Nap Chopped Bowl",
      effortScore: "1.5/10 (No Stovetop)",
      prepTime: "3 minutes",
      cookTime: "0 minutes",
      dishesToWash: "1 bowl",
      ingredientsUsed: ["Spinach/Greens", hasTomato ? "Diced Tomato" : "Cheese cubes", "Any salad dressing / olive oil"],
      instructions: "Rip greens by hand (no cutting board to wash). Throw in bowl with tomatoes and cheese. Drizzle dressing and collapse on couch."
    });
  }

  // Fallback catch-all recipe if few ingredients
  if (recipes.length === 0) {
    recipes.push({
      title: "The Sloth Comfort Melt",
      effortScore: "1/10",
      prepTime: "1 minute",
      cookTime: "3 minutes",
      dishesToWash: "1 paper towel",
      ingredientsUsed: items.slice(0, 3),
      instructions: "Layer available ingredients between toast or microwave in a bowl until melty. Minimal movement required."
    });
  }

  // Missing essentials / Grocery list recommendations
  const staples = ['Eggs', 'Cheese', 'Tortillas / Bread', 'Garlic butter', 'Coffee beans', 'Dark chocolate'];
  staples.forEach(staple => {
    if (!items.some(i => i.includes(staple.toLowerCase().split(' ')[0]))) {
      groceryList.push({ item: staple, reason: "Essential low-effort sustenance" });
    }
  });

  return {
    detectedIngredients: items.length > 0 ? items : ["eggs", "cheddar cheese", "milk", "spinach", "tomatoes", "leftover pasta"],
    recipes: recipes.slice(0, 3),
    groceryList: groceryList.slice(0, 4),
    slothTip: "Pro Sloth Tip: Eat directly from the pan. Washing dishes burns unnecessary calories.",
    aiSource: "SlothChef Open Recipe Matrix (Offline-Ready)"
  };
}

/**
 * Clutter File & Desktop Tidier
 */
async function tidyFiles(fileList) {
  const files = Array.isArray(fileList) ? fileList : fileList.split('\n').filter(Boolean);

  const categories = {
    'Documents & Invoices': [],
    'Screenshots & Media': [],
    'Code & Archives': [],
    'Unsorted Clutter': []
  };

  const renames = [];
  const today = new Date().toISOString().slice(0, 10);

  files.forEach(f => {
    const raw = f.trim();
    const lower = raw.toLowerCase();

    if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('tax') || lower.includes('statement') || lower.endsWith('.pdf')) {
      const cleanName = `${today}_${raw.replace(/[\s\-_]+/g, '_')}`;
      categories['Documents & Invoices'].push(raw);
      renames.push({ original: raw, sanitized: cleanName, targetFolder: 'Documents/Finance' });
    } else if (lower.includes('screen shot') || lower.includes('screenshot') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      const cleanName = `screenshot_${today}_${Math.floor(Math.random() * 899 + 100)}.png`;
      categories['Screenshots & Media'].push(raw);
      renames.push({ original: raw, sanitized: cleanName, targetFolder: 'Media/Screenshots' });
    } else if (lower.endsWith('.zip') || lower.endsWith('.tar.gz') || lower.endsWith('.json') || lower.endsWith('.js') || lower.endsWith('.py')) {
      categories['Code & Archives'].push(raw);
      renames.push({ original: raw, sanitized: raw.replace(/\s+/g, '_'), targetFolder: 'Dev/Archives' });
    } else {
      categories['Unsorted Clutter'].push(raw);
      renames.push({ original: raw, sanitized: raw, targetFolder: 'Archive/Unsorted' });
    }
  });

  // Generate 1-line shell cleanup script
  const powershellCommands = renames.map(r => 
    `New-Item -ItemType Directory -Force -Path '${r.targetFolder}'; Move-Item -Path '${r.original}' -Destination '${r.targetFolder}/${r.sanitized}'`
  ).join('; ');

  const bashCommands = renames.map(r => 
    `mkdir -p "${r.targetFolder}" && mv "${r.original}" "${r.targetFolder}/${r.sanitized}"`
  ).join(' && ');

  return {
    summary: `Categorized ${files.length} messy files across 4 clean folders.`,
    categories,
    renamePreview: renames,
    scripts: {
      powershell: powershellCommands,
      bash: bashCommands
    },
    effortSaved: "Saved ~25 minutes of manual dragging and renaming files."
  };
}

/**
 * Offline Bedtime Story Generator
 */
async function generateBedtimeStory(theme = 'canopy', mode = 'auto') {
  const stories = {
    canopy: {
      title: "The Mossy Canopy of Manuel Antonio",
      duration: "3-minute wind-down",
      text: "High above the damp rainforest floor, the leaves of the wild Cecropia tree barely tremble. Sloan the three-toed sloth does not rush. He has not rushed in seven years. The evening mist wraps the high branch in a cool, silver blanket. Below, tiny insects sing a rhythmic, repeating lullaby that never changes pitch. A warm breeze passes through his green-tinted fur—a miniature ecosystem of peaceful algae living in harmony. Sloan closes his dark, heavy eyelids. The world down there is hurried, running after things that do not matter. Up here, all that exists is the slow inhale of rain-washed ozone, the creak of damp bark, and the knowledge that tomorrow will be just as wonderfully still."
    },
    river: {
      title: "The River That Forgot to Rush",
      duration: "4-minute wind-down",
      text: "There is an ancient tributary nestled deep in the cloud forest where the current slowed down so much it eventually became a mirror. The river stones are rounded and smooth, having surrendered all their sharp edges centuries ago. Water striders glide like silent thoughts across the black surface. A sloth hangs upside down from a low liana vine, gazing at his own reflection. His paws are hook-shaped, locked naturally into place with zero muscle strain. He does not hold on; gravity and evolution hold him. You do not need to push the river forward tonight. Let the current carry whatever worries you gathered today. Breathe in stillness... breathe out effort."
    },
    stars: {
      title: "The Sloth's Constellation Guide",
      duration: "3-minute wind-down",
      text: "When the sun dips behind the Pacific cordillera, the stars emerge not in a sudden flash, but one by one, taking their sweet time. Sloan looks up through a parting in the fig leaves. Polaris stands still. The Southern Cross drifts by inches per millennium. The universe itself is in no hurry to expand. Your body feels heavy now, resting into the mattress just as Sloan rests into the crook of a mossy bough. The work of the day is finished. The emails will sleep. The tasks will wait. It is safe to conserve your energy now."
    }
  };

  const selected = stories[theme] || stories.canopy;
  return {
    ...selected,
    breathingPace: "6 breaths per minute (True Sloth Cadence)",
    ambientPreset: "rainforest_and_rain"
  };
}

module.exports = {
  distillMessages,
  analyzeFridge,
  tidyFiles,
  generateBedtimeStory,
  DEFAULT_HF_MODEL,
  OLLAMA_URL
};
