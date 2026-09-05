/* =========================================================================
   VAANI — script.js
   Beginner-friendly, organized into clear sections. Search for "SECTION"
   to jump around.
   ========================================================================= */


/* =========================================================================
   SECTION 0 — ML API CONFIGURATION
   -------------------------------------------------------------------------
   This is the ONLY section the ML/backend team needs to touch to connect
   a real model. Everything else in this file already calls
   `analyzeVoiceWithAPI()` when `USE_REAL_API` is switched on — nothing
   else needs to change.
   ========================================================================= */

// Put your real backend endpoint here once it exists, e.g.
// "https://your-ml-backend.example.com/api/analyze"
const API_URL = "";

// Flip this to `true` once API_URL is set and the backend is ready.
// While it is `false`, the app uses simulateAnalysis() instead so the
// prototype keeps working with zero setup.
const USE_REAL_API = false;

/**
 * analyzeVoiceWithAPI(audioFile)
 * ---------------------------------------------------------------------
 * Sends the recorded/uploaded audio file to the real ML backend and
 * returns a result object in the exact shape renderResults() expects
 * (see buildResult() below for the shape).
 *
 * Replace the body of this function with your real request. Keep the
 * returned object's field names the same so the rest of the app does
 * not need to change.
 */
async function analyzeVoiceWithAPI(audioFile) {
  if (!API_URL) {
    throw new Error("API_URL is empty — set it in the ML API CONFIGURATION section.");
  }

  const formData = new FormData();
  formData.append("audio", audioFile);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("ML API request failed with status " + response.status);
  }

  // The backend should return JSON matching the shape used throughout
  // this file (see buildResult()): humanProb, aiProb, classification,
  // confidence, riskLevel, factors{}, scamIndicators{}, scamRisk.
  const data = await response.json();
  return data;
}


/* =========================================================================
   SECTION 1 — SIMULATED ANALYSIS ENGINE (demo data)
   -------------------------------------------------------------------------
   Everything below is fake, on purpose, and clearly labeled as such in
   the UI ("Demo Mode — ML model not connected"). This lets the whole
   app be demoed and judged before a real model exists.
   ========================================================================= */

/** Small helper: random integer between min and max (inclusive). */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * buildResult(...) assembles the object shape used by renderResults().
 * Both simulateAnalysis() and analyzeVoiceWithAPI() should ultimately
 * produce an object that looks like this.
 */
function buildResult({ humanProb, classification, confidence, riskLevel, factors, scamIndicators, scamRisk }) {
  return {
    humanProb,
    aiProb: 100 - humanProb,
    classification,       // "HUMAN VOICE" | "AI-GENERATED VOICE"
    confidence,            // 0-100
    riskLevel,             // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    factors,               // { voiceConsistency, spectral, pitchVariation, naturalness, deepfakeIndicators, backgroundNoise }
    scamIndicators,        // { urgency, suspiciousRequest, otpRequest, financialInfo, impersonation, socialEngineering }
    scamRisk                // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  };
}

/** Preset: a normal, human, non-scam call. */
function presetNormalHumanCall() {
  return buildResult({
    humanProb: 96,
    classification: "HUMAN VOICE",
    confidence: 95,
    riskLevel: "LOW",
    factors: {
      voiceConsistency: randomInt(88, 95),
      spectral: randomInt(85, 93),
      pitchVariation: randomInt(82, 91),
      naturalness: randomInt(90, 97),
      deepfakeIndicators: randomInt(3, 9),
      backgroundNoise: randomInt(10, 25)
    },
    scamIndicators: {
      urgency: false,
      suspiciousRequest: false,
      otpRequest: false,
      financialInfo: false,
      impersonation: false,
      socialEngineering: false
    },
    scamRisk: "LOW"
  });
}

/** Preset: an AI-generated, high-risk scam call. */
function presetAiScamCall() {
  return buildResult({
    humanProb: 8,
    classification: "AI-GENERATED VOICE",
    confidence: 94,
    riskLevel: "CRITICAL",
    factors: {
      voiceConsistency: randomInt(35, 48),
      spectral: randomInt(20, 35),
      pitchVariation: randomInt(15, 30),
      naturalness: randomInt(18, 32),
      deepfakeIndicators: randomInt(82, 95),
      backgroundNoise: randomInt(2, 12)
    },
    scamIndicators: {
      urgency: true,
      suspiciousRequest: true,
      otpRequest: true,
      financialInfo: true,
      impersonation: true,
      socialEngineering: true
    },
    scamRisk: "CRITICAL"
  });
}

/** Fallback: a lightly-randomized result for a plain uploaded/recorded file with no demo scenario picked. */
function presetRandomUpload() {
  const leansHuman = Math.random() > 0.35;

  if (leansHuman) {
    const humanProb = randomInt(78, 94);
    return buildResult({
      humanProb,
      classification: "HUMAN VOICE",
      confidence: randomInt(80, 93),
      riskLevel: "LOW",
      factors: {
        voiceConsistency: randomInt(75, 90),
        spectral: randomInt(72, 88),
        pitchVariation: randomInt(70, 87),
        naturalness: randomInt(78, 92),
        deepfakeIndicators: randomInt(6, 20),
        backgroundNoise: randomInt(15, 40)
      },
      scamIndicators: {
        urgency: Math.random() > 0.85,
        suspiciousRequest: false,
        otpRequest: false,
        financialInfo: false,
        impersonation: false,
        socialEngineering: Math.random() > 0.9
      },
      scamRisk: "LOW"
    });
  }

  const humanProb = randomInt(15, 40);
  return buildResult({
    humanProb,
    classification: "AI-GENERATED VOICE",
    confidence: randomInt(70, 89),
    riskLevel: "HIGH",
    factors: {
      voiceConsistency: randomInt(45, 62),
      spectral: randomInt(35, 55),
      pitchVariation: randomInt(30, 50),
      naturalness: randomInt(35, 55),
      deepfakeIndicators: randomInt(55, 80),
      backgroundNoise: randomInt(8, 25)
    },
    scamIndicators: {
      urgency: true,
      suspiciousRequest: true,
      otpRequest: Math.random() > 0.4,
      financialInfo: Math.random() > 0.5,
      impersonation: true,
      socialEngineering: Math.random() > 0.3
    },
    scamRisk: "HIGH"
  });
}

/**
 * simulateAnalysis(mode)
 * ---------------------------------------------------------------------
 * Returns a Promise that resolves with a result object after a short
 * delay, imitating a real network call to an ML backend.
 *
 * `mode` is one of "human", "scam", or "upload".
 *
 * TO CONNECT A REAL MODEL LATER: replace the call to simulateAnalysis()
 * inside runAnalysis() (Section 3) with a call to
 * analyzeVoiceWithAPI(currentAudioFile). Nothing else needs to change,
 * because both functions resolve to the same result shape.
 */
function simulateAnalysis(mode) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mode === "human") resolve(presetNormalHumanCall());
      else if (mode === "scam") resolve(presetAiScamCall());
      else resolve(presetRandomUpload());
    }, 900); // small extra delay on top of the timeline animation
  });
}


/* =========================================================================
   SECTION 2 — NAVIGATION
   ========================================================================= */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const navToggle = document.getElementById("navToggle");
const mainNav = document.querySelector(".main-nav");

function goToPage(pageName) {
  pages.forEach((p) => p.classList.toggle("active", p.id === "page-" + pageName));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.page === pageName));
  mainNav.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => goToPage(link.dataset.page));
});

document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", () => goToPage(el.dataset.goto));
});

navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));


/* =========================================================================
   SECTION 3 — AUDIO SOURCE: upload, drag & drop, record
   ========================================================================= */

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const recordBtn = document.getElementById("recordBtn");
const recordBtnLabel = document.getElementById("recordBtnLabel");
const fileInfo = document.getElementById("fileInfo");
const fileNameEl = document.getElementById("fileName");
const waveformEl = document.getElementById("waveform");
const audioPlayer = document.getElementById("audioPlayer");
const analyzeBtn = document.getElementById("analyzeBtn");
const analyzeHint = document.getElementById("analyzeHint");

let currentAudioFile = null; // File or Blob currently loaded, ready to analyze
let selectedDemo = null;     // "human" | "scam" | null

/** Draw a random static "waveform" out of divs — purely decorative. */
function renderFakeWaveform() {
  waveformEl.innerHTML = "";
  const barCount = 46;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("span");
    const height = randomInt(15, 100);
    bar.style.height = height + "%";
    waveformEl.appendChild(bar);
  }
}

function loadAudioSource(fileOrBlob, displayName) {
  currentAudioFile = fileOrBlob;
  fileNameEl.textContent = displayName;
  fileInfo.hidden = false;
  renderFakeWaveform();

  const url = URL.createObjectURL(fileOrBlob);
  audioPlayer.src = url;

  updateAnalyzeAvailability();
}

audioPlayer.addEventListener("play", () => waveformEl.classList.add("playing"));
audioPlayer.addEventListener("pause", () => waveformEl.classList.remove("playing"));
audioPlayer.addEventListener("ended", () => waveformEl.classList.remove("playing"));

/* --- Upload button + hidden input --- */
uploadBtn.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    clearDemoSelection();
    loadAudioSource(file, file.name);
  }
});

/* --- Drag & drop --- */
["dragenter", "dragover"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
});
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("audio")) {
    clearDemoSelection();
    loadAudioSource(file, file.name);
  }
});

/* --- Record voice (uses the real MediaRecorder API) --- */
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

recordBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        clearDemoSelection();
        const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        loadAudioSource(blob, "Recorded sample — " + stamp);
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtnLabel.textContent = "Stop Recording";
      recordBtn.classList.add("recording");
    } catch (err) {
      alert("Microphone access was blocked or is unavailable. You can still use Upload Audio or a demo scenario.");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    recordBtnLabel.textContent = "Record Voice";
    recordBtn.classList.remove("recording");
  }
});


/* =========================================================================
   SECTION 4 — DEMO SCENARIOS
   ========================================================================= */

const demoChips = document.querySelectorAll(".chip[data-demo]");

demoChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const demo = chip.dataset.demo;

    if (demo === "clear") {
      clearDemoSelection();
      return;
    }

    selectedDemo = demo;
    demoChips.forEach((c) => c.classList.toggle("selected", c.dataset.demo === demo));

    // A demo scenario doesn't require a real file, but the UI still
    // shows a representative "file" so the flow feels consistent.
    fileInfo.hidden = false;
    currentAudioFile = null;
    audioPlayer.removeAttribute("src");
    renderFakeWaveform();
    fileNameEl.textContent = demo === "human"
      ? "demo_normal_human_call.wav"
      : "demo_ai_generated_scam_call.wav";

    updateAnalyzeAvailability();
  });
});

function clearDemoSelection() {
  selectedDemo = null;
  demoChips.forEach((c) => c.classList.remove("selected"));
  updateAnalyzeAvailability();
}

function updateAnalyzeAvailability() {
  const ready = !!currentAudioFile || !!selectedDemo;
  analyzeBtn.disabled = !ready;
  analyzeHint.textContent = ready
    ? "Ready to analyze."
    : "Choose a demo scenario, upload a file, or record audio to enable analysis.";
}


/* =========================================================================
   SECTION 5 — TIMELINE ANIMATION
   ========================================================================= */

const timelineSteps = document.querySelectorAll(".timeline-step");

/** Animates the 6-step timeline, one step at a time, then resolves. */
function playTimeline() {
  return new Promise((resolve) => {
    timelineSteps.forEach((step) => step.classList.remove("active", "done"));

    let i = 0;
    const stepDelay = 420;

    function next() {
      if (i > 0) timelineSteps[i - 1].classList.replace("active", "done");
      if (i < timelineSteps.length) {
        timelineSteps[i].classList.add("active");
        i++;
        setTimeout(next, stepDelay);
      } else {
        resolve();
      }
    }
    next();
  });
}


/* =========================================================================
   SECTION 6 — RUN ANALYSIS + RENDER RESULTS
   ========================================================================= */

const resultsSection = document.getElementById("results");
const scoreGauge = document.getElementById("scoreGauge");
const gaugePct = document.getElementById("gaugePct");
const gaugeOf = document.getElementById("gaugeOf");
const classificationBadge = document.getElementById("classificationBadge");
const confidenceValue = document.getElementById("confidenceValue");
const riskBadge = document.getElementById("riskBadge");
const factorList = document.getElementById("factorList");
const scamRiskBadge = document.getElementById("scamRiskBadge");
const indicatorGrid = document.getElementById("indicatorGrid");

const RISK_CLASS = { LOW: "badge-low", MEDIUM: "badge-medium", HIGH: "badge-high", CRITICAL: "badge-critical" };

const FACTOR_LABELS = {
  voiceConsistency: "Voice consistency",
  spectral: "Spectral characteristics",
  pitchVariation: "Pitch variation",
  naturalness: "Speech naturalness",
  deepfakeIndicators: "AI / deepfake indicators",
  backgroundNoise: "Background noise analysis"
};

// Factors where a HIGH number is a bad sign (color the bar as a warning).
const INVERTED_FACTORS = new Set(["deepfakeIndicators"]);

const INDICATOR_LABELS = {
  urgency: "Urgency detected",
  suspiciousRequest: "Suspicious request detected",
  otpRequest: "OTP request detected",
  financialInfo: "Financial information request detected",
  impersonation: "Impersonation indicators",
  socialEngineering: "Social engineering indicators"
};

analyzeBtn.addEventListener("click", runAnalysis);

async function runAnalysis() {
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing…";
  resultsSection.hidden = true;

  const mode = selectedDemo || "upload";

  // Run the timeline animation and the (simulated) analysis in parallel
  // so the UI feels responsive rather than waiting on two back-to-back delays.
  const [, result] = await Promise.all([
    playTimeline(),
    USE_REAL_API && currentAudioFile
      ? analyzeVoiceWithAPI(currentAudioFile)
      : simulateAnalysis(mode)
  ]);

  renderResults(result);
  addHistoryEntry(result, fileNameEl.textContent);

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze Voice";
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderResults(result) {
  const isHuman = result.classification === "HUMAN VOICE";
  const dominantPct = isHuman ? result.humanProb : result.aiProb;

  // Gauge
  const gaugeColor = isHuman ? "var(--accent)" : "var(--danger)";
  scoreGauge.style.background =
    `conic-gradient(${gaugeColor} ${dominantPct * 3.6}deg, var(--surface-2) 0deg)`;
  gaugePct.textContent = dominantPct + "%";
  gaugeOf.textContent = isHuman ? "Human" : "AI Generated";

  // Classification + confidence + risk
  classificationBadge.textContent = result.classification;
  classificationBadge.className = "badge " + (isHuman ? "badge-human" : "badge-ai");

  confidenceValue.textContent = result.confidence + "%";

  riskBadge.textContent = result.riskLevel;
  riskBadge.className = "badge " + RISK_CLASS[result.riskLevel];

  // Factors
  factorList.innerHTML = "";
  Object.entries(result.factors).forEach(([key, value]) => {
    const isBad = INVERTED_FACTORS.has(key) ? value >= 50 : value < 50;
    const barColor = isBad ? "var(--danger)" : "var(--accent)";

    const item = document.createElement("div");
    item.className = "factor-item";
    item.innerHTML = `
      <div class="factor-top">
        <span>${FACTOR_LABELS[key]}</span>
        <span>${value}%</span>
      </div>
      <div class="factor-bar">
        <div class="factor-bar-fill" style="width:0%; background:${barColor}"></div>
      </div>
    `;
    factorList.appendChild(item);

    // animate the width on next frame so the CSS transition actually plays
    requestAnimationFrame(() => {
      item.querySelector(".factor-bar-fill").style.width = value + "%";
    });
  });

  // Scam risk + indicators
  scamRiskBadge.textContent = result.scamRisk;
  scamRiskBadge.className = "badge " + RISK_CLASS[result.scamRisk];

  indicatorGrid.innerHTML = "";
  Object.entries(result.scamIndicators).forEach(([key, flagged]) => {
    const item = document.createElement("div");
    item.className = "indicator-item " + (flagged ? "flagged" : "clear");
    item.innerHTML = `
      <span class="indicator-icon">${flagged ? "!" : "✓"}</span>
      <span class="label">${INDICATOR_LABELS[key]}</span>
    `;
    indicatorGrid.appendChild(item);
  });
}


/* =========================================================================
   SECTION 7 — HISTORY
   ========================================================================= */

const historyBody = document.getElementById("historyBody");

// A few sample rows so the History page isn't empty on first load.
let historyData = [
  { time: "04 Sep, 6:42 PM", name: "call_recording_882.wav", classification: "HUMAN VOICE", aiProb: 6, scamRisk: "LOW", status: "clear" },
  { time: "04 Sep, 3:15 PM", name: "unknown_number_call.mp3", classification: "AI-GENERATED VOICE", aiProb: 91, scamRisk: "CRITICAL", status: "flagged" },
  { time: "03 Sep, 11:20 AM", name: "bank_verification_call.wav", classification: "AI-GENERATED VOICE", aiProb: 78, scamRisk: "HIGH", status: "flagged" },
  { time: "02 Sep, 9:05 PM", name: "family_checkin_call.m4a", classification: "HUMAN VOICE", aiProb: 3, scamRisk: "LOW", status: "clear" },
  { time: "01 Sep, 1:47 PM", name: "delivery_otp_call.wav", classification: "AI-GENERATED VOICE", aiProb: 65, scamRisk: "MEDIUM", status: "flagged" }
];

function renderHistory() {
  historyBody.innerHTML = historyData.map((row) => `
    <tr>
      <td>${row.time}</td>
      <td>${row.name}</td>
      <td>${row.classification}</td>
      <td>${row.aiProb}%</td>
      <td><span class="badge ${RISK_CLASS[row.scamRisk]}">${row.scamRisk}</span></td>
      <td><span class="status-pill ${row.status === "flagged" ? "status-flagged" : "status-clear"}">
        ${row.status === "flagged" ? "Flagged" : "Clear"}
      </span></td>
    </tr>
  `).join("");
}

function addHistoryEntry(result, displayName) {
  const now = new Date();
  const time = now.toLocaleDateString([], { day: "2-digit", month: "short" }) +
    ", " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  historyData.unshift({
    time,
    name: displayName || "recorded_sample.webm",
    classification: result.classification,
    aiProb: result.aiProb,
    scamRisk: result.scamRisk,
    status: result.scamRisk === "LOW" ? "clear" : "flagged"
  });

  renderHistory();
}


/* =========================================================================
   SECTION 8 — INIT
   ========================================================================= */

renderHistory();
updateAnalyzeAvailability();
