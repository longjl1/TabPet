const ROOT_ID = "tabpet-root";
const PET_CLASS = "tabpet-pet";
const SPEECH_CLASS = "tabpet-speech";
const STATUS_BAR_SELECTOR = "[data-bar]";
const STORAGE_KEY = "tabpet:pet-state";

const defaultSettings = {
  enabled: true,
  petName: "TabPet",
  speechEnabled: true,
  customAssetUrl: "",
  petScale: 1,
  roamSpeed: 1
};

const defaultPetState = {
  hunger: 72,
  energy: 68,
  joy: 80,
  mood: "idle",
  x: 180,
  y: 140,
  vx: 1,
  facing: 1,
  sleeping: false,
  dragged: false
};

const speechLines = {
  idle: [
    "I am quietly supervising this page.",
    "This corner of the internet seems acceptable.",
    "Just a tiny patrol before my next nap."
  ],
  walk: [
    "Cross-tab patrol in progress.",
    "Stretching my little browser legs.",
    "I am mapping the page terrain."
  ],
  sleep: [
    "Power-saving mode engaged.",
    "Dreaming in CSS gradients.",
    "Wake me only for premium snacks."
  ],
  feed: [
    "Snack accepted with gratitude.",
    "Tiny stomach, huge morale boost.",
    "Excellent. I can keep patrolling."
  ],
  play: [
    "That was delightfully chaotic.",
    "Zoomies initiated.",
    "I feel dramatically more alive."
  ],
  drag: [
    "Careful, I am portable but proud.",
    "New spot acquired.",
    "Strategic repositioning approved."
  ]
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function ensureRoot() {
  const existing = document.getElementById(ROOT_ID);
  if (existing) return existing;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = `
    <div class="tabpet-hud">
      <div class="tabpet-header">
        <div>
          <p class="tabpet-eyebrow">Browser Pet</p>
          <h2 class="tabpet-name">TabPet</h2>
        </div>
        <span class="tabpet-state-chip" data-state-chip>Idle</span>
      </div>
      <div class="tabpet-status">
        <div class="tabpet-stat">
          <span>Hunger</span>
          <div class="tabpet-bar"><div data-bar="hunger"></div></div>
        </div>
        <div class="tabpet-stat">
          <span>Energy</span>
          <div class="tabpet-bar"><div data-bar="energy"></div></div>
        </div>
        <div class="tabpet-stat">
          <span>Joy</span>
          <div class="tabpet-bar"><div data-bar="joy"></div></div>
        </div>
      </div>
      <div class="tabpet-actions">
        <button type="button" data-action="feed">Feed</button>
        <button type="button" data-action="sleep">Nap</button>
        <button type="button" data-action="play">Play</button>
      </div>
      <div class="${SPEECH_CLASS}" hidden></div>
    </div>
    <button class="${PET_CLASS}" type="button" aria-label="TabPet">
      <span class="tabpet-face" data-face>^.^</span>
    </button>
  `;
  document.body.appendChild(root);
  return root;
}

function setMood(pet, mood) {
  pet.setAttribute("data-mood", mood);
}

function speak(root, text) {
  const bubble = root.querySelector(`.${SPEECH_CLASS}`);
  if (!bubble) return;
  bubble.textContent = text;
  bubble.hidden = false;
  window.clearTimeout(speak.timeoutId);
  speak.timeoutId = window.setTimeout(() => {
    bubble.hidden = true;
  }, 2400);
}
speak.timeoutId = 0;

async function getSettings() {
  const result = await chrome.storage.local.get("tabpet:settings");
  return {
    ...defaultSettings,
    ...(result["tabpet:settings"] || {})
  };
}

async function getPetState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return {
    ...defaultPetState,
    ...(result[STORAGE_KEY] || {})
  };
}

async function savePetState(state) {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function deriveMood(state) {
  if (state.sleeping || state.energy < 18) return "sleep";
  if (state.joy > 82 && state.hunger > 42) return "happy";
  if (state.dragged) return "happy";
  return "walk";
}

function updateBars(root, state) {
  root.querySelectorAll(STATUS_BAR_SELECTOR).forEach((bar) => {
    const key = bar.getAttribute("data-bar");
    const value = clamp(state[key] ?? 0);
    bar.style.width = `${value}%`;
    bar.setAttribute("data-level", value < 30 ? "low" : value < 60 ? "mid" : "high");
  });
}

function applyAsset(face, pet, settings) {
  if (settings.customAssetUrl) {
    pet.style.setProperty("--tabpet-asset-url", `url("${settings.customAssetUrl}")`);
    pet.setAttribute("data-render-mode", "image");
    face.hidden = true;
  } else {
    pet.style.removeProperty("--tabpet-asset-url");
    pet.setAttribute("data-render-mode", "face");
    face.hidden = false;
  }
}

function getViewportBounds() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function updateMeta(root, pet, face, settings, state) {
  const title = root.querySelector(".tabpet-name");
  const chip = root.querySelector("[data-state-chip]");
  const hud = root.querySelector(".tabpet-hud");
  if (title) title.textContent = settings.petName;
  if (chip) chip.textContent = state.sleeping ? "Sleeping" : state.mood[0].toUpperCase() + state.mood.slice(1);

  applyAsset(face, pet, settings);
  setMood(pet, state.mood);
  pet.style.setProperty("--tabpet-scale", String(settings.petScale));
  pet.style.setProperty("--tabpet-facing", String(state.facing));

  const petWidth = 96 * settings.petScale;
  const petHeight = 96 * settings.petScale;
  const x = Math.round(state.x);
  const y = Math.round(state.y);
  pet.style.left = `${x}px`;
  pet.style.top = `${y}px`;
  pet.title = `${settings.petName}: hunger ${Math.round(state.hunger)}, energy ${Math.round(state.energy)}, joy ${Math.round(state.joy)}`;

  if (hud) {
    const hudX = Math.min(window.innerWidth - 248, Math.max(12, x - 78));
    const hudY = Math.max(12, y - 166);
    hud.style.left = `${hudX}px`;
    hud.style.top = `${hudY}px`;
  }

  updateBars(root, state);
}

function createController(root, pet, face, settings, initialState) {
  let state = { ...initialState };
  let syncCounter = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;

  function sync() {
    updateMeta(root, pet, face, settings, state);
    syncCounter += 1;
    if (syncCounter % 2 === 0) {
      void savePetState(state);
    }
  }

  function setState(partial) {
    const next = {
      ...state,
      ...partial
    };
    const { width, height } = getViewportBounds();
    const petWidth = 96 * settings.petScale;
    const petHeight = 96 * settings.petScale;
    next.hunger = clamp(next.hunger);
    next.energy = clamp(next.energy);
    next.joy = clamp(next.joy);
    next.x = Math.min(width - petWidth - 8, Math.max(8, next.x));
    next.y = Math.min(height - petHeight - 8, Math.max(8, next.y));
    next.mood = deriveMood(next);
    state = next;
    sync();
  }

  function react(group) {
    if (settings.speechEnabled) {
      speak(root, randomItem(speechLines[group]));
    }
  }

  function feed() {
    setState({
      hunger: state.hunger + 26,
      joy: state.joy + 8,
      sleeping: false,
      dragged: false
    });
    react("feed");
  }

  function nap() {
    const nextSleeping = !state.sleeping;
    setState({
      sleeping: nextSleeping,
      dragged: false
    });
    react(nextSleeping ? "sleep" : "idle");
  }

  function play() {
    setState({
      joy: state.joy + 15,
      energy: state.energy - 12,
      hunger: state.hunger - 7,
      sleeping: false,
      dragged: false
    });
    react("play");
  }

  function beginDrag(event) {
    const rect = pet.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    dragging = true;
    pet.setPointerCapture(event.pointerId);
    setState({
      sleeping: false,
      dragged: true
    });
    react("drag");
  }

  function moveDrag(event) {
    if (!dragging) return;
    setState({
      x: event.clientX - dragOffsetX,
      y: event.clientY - dragOffsetY
    });
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    pet.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      setState({ dragged: false });
    }, 900);
  }

  pet.addEventListener("click", () => {
    if (!dragging) play();
  });

  pet.addEventListener("pointerdown", beginDrag);
  pet.addEventListener("pointermove", moveDrag);
  pet.addEventListener("pointerup", endDrag);
  pet.addEventListener("pointercancel", endDrag);

  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      if (action === "feed") feed();
      if (action === "sleep") nap();
      if (action === "play") play();
    });
  });

  window.addEventListener("resize", () => {
    setState({});
  });

  window.setInterval(() => {
    const speed = 7 * settings.roamSpeed;
    const decay = state.sleeping
      ? { hunger: -1.8, energy: +4.5, joy: -0.6 }
      : { hunger: -2.8, energy: state.mood === "walk" ? -1.6 : -0.8, joy: -0.9 };

    let nextX = state.x;
    let nextY = state.y;
    let nextFacing = state.facing;
    let nextSleeping = state.sleeping;

    if (!dragging && !nextSleeping && state.energy > 16) {
      nextX += speed * nextFacing;
      if (Math.random() < 0.28) {
        nextY += (Math.random() - 0.5) * 22;
      }
    }

    const { width, height } = getViewportBounds();
    const petWidth = 96 * settings.petScale;
    const petHeight = 96 * settings.petScale;

    if (nextX <= 8 || nextX >= width - petWidth - 8) {
      nextFacing *= -1;
      nextX = Math.min(width - petWidth - 8, Math.max(8, nextX));
    }
    nextY = Math.min(height - petHeight - 8, Math.max(8, nextY));

    if (state.energy < 12) {
      nextSleeping = true;
    } else if (state.sleeping && state.energy > 80 && state.hunger > 26) {
      nextSleeping = false;
    }

    setState({
      hunger: state.hunger + decay.hunger,
      energy: state.energy + decay.energy,
      joy: state.joy + decay.joy,
      x: nextX,
      y: nextY,
      facing: nextFacing,
      sleeping: nextSleeping
    });
  }, 2500);

  sync();
}

async function mountPet() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const root = ensureRoot();
  const pet = root.querySelector(`.${PET_CLASS}`);
  const face = root.querySelector("[data-face]");
  if (!pet || !face) return;

  const petState = await getPetState();
  createController(root, pet, face, settings, petState);
  if (settings.speechEnabled) {
    speak(root, `${settings.petName} is roaming freely across this page.`);
  }
}

void mountPet();
