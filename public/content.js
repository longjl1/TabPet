const ROOT_ID = "tabpet-root";
const PET_CLASS = "tabpet-pet";
const SPEECH_CLASS = "tabpet-speech";
const STATUS_BAR_SELECTOR = "[data-bar]";
const STORAGE_KEY = "tabpet:pet-state";

const defaultSettings = {
  enabled: true,
  petName: "TabPet",
  speechEnabled: true
};

const defaultPetState = {
  hunger: 72,
  energy: 68,
  joy: 80,
  mood: "idle",
  position: 0.18,
  facing: 1,
  sleeping: false
};

const speechLines = {
  idle: [
    "I am on quality-control duty.",
    "This tab feels cozy.",
    "A tiny walk solves many problems."
  ],
  walk: [
    "Patrolling the page perimeter.",
    "Stretching my little tab legs.",
    "Every scroll deserves supervision."
  ],
  sleep: [
    "Tiny nap in progress...",
    "Dreaming about clean CSS.",
    "Wake me for snacks."
  ],
  feed: [
    "Crunch crunch. Excellent snack.",
    "That was premium kibble.",
    "Morale and calories restored."
  ],
  play: [
    "Best click of the day.",
    "Zoomies unlocked.",
    "I feel dramatically more heroic."
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
    <div class="tabpet-panel">
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
      <div class="tabpet-stage">
        <div class="tabpet-track"></div>
        <button class="${PET_CLASS}" type="button" aria-label="TabPet">
          <span class="tabpet-face">^.^</span>
        </button>
      </div>
      <div class="tabpet-actions">
        <button type="button" data-action="feed">Feed</button>
        <button type="button" data-action="sleep">Nap</button>
        <button type="button" data-action="play">Play</button>
      </div>
      <div class="${SPEECH_CLASS}" hidden></div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

function setMood(pet, mood) {
  pet.setAttribute("data-mood", mood);
}

function setFacing(pet, facing) {
  pet.style.setProperty("--tabpet-facing", String(facing));
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
  if (state.sleeping || state.energy < 22) return "sleep";
  if (state.joy > 78 && state.hunger > 40) return "happy";
  if (state.hunger < 30) return "idle";
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

function updateMeta(root, pet, settings, state) {
  const title = root.querySelector(".tabpet-name");
  const chip = root.querySelector("[data-state-chip]");
  if (title) title.textContent = settings.petName;
  if (chip) chip.textContent = state.sleeping ? "Sleeping" : state.mood[0].toUpperCase() + state.mood.slice(1);

  setMood(pet, state.mood);
  setFacing(pet, state.facing);
  pet.title = `${settings.petName}: hunger ${Math.round(state.hunger)}, energy ${Math.round(state.energy)}, joy ${Math.round(state.joy)}`;

  const stage = root.querySelector(".tabpet-stage");
  if (stage) {
    const width = stage.clientWidth || 280;
    const x = Math.round(state.position * (width - 92));
    pet.style.transform = `translateX(${x}px) scaleX(${state.facing})`;
    if (state.mood === "happy") {
      pet.style.transform += " rotate(6deg) scale(1.04)";
    }
  }

  updateBars(root, state);
}

function createController(root, pet, settings, initialState) {
  let state = { ...initialState };
  let syncCounter = 0;

  function sync() {
    updateMeta(root, pet, settings, state);
    syncCounter += 1;
    if (syncCounter % 3 === 0) {
      void savePetState(state);
    }
  }

  function setState(partial) {
    state = {
      ...state,
      ...partial
    };
    state.hunger = clamp(state.hunger);
    state.energy = clamp(state.energy);
    state.joy = clamp(state.joy);
    state.position = Math.min(0.92, Math.max(0.02, state.position));
    state.mood = deriveMood(state);
    sync();
  }

  function react(lineGroup) {
    if (settings.speechEnabled) {
      speak(root, randomItem(speechLines[lineGroup]));
    }
  }

  function feed() {
    setState({
      hunger: state.hunger + 24,
      joy: state.joy + 8,
      sleeping: false,
      mood: "happy"
    });
    react("feed");
  }

  function nap() {
    const nextSleeping = !state.sleeping;
    setState({
      sleeping: nextSleeping,
      mood: nextSleeping ? "sleep" : "idle"
    });
    react(nextSleeping ? "sleep" : "idle");
  }

  function play() {
    setState({
      joy: state.joy + 16,
      energy: state.energy - 10,
      hunger: state.hunger - 8,
      sleeping: false,
      mood: "happy"
    });
    react("play");
  }

  pet.addEventListener("click", () => {
    play();
  });

  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      if (action === "feed") feed();
      if (action === "sleep") nap();
      if (action === "play") play();
    });
  });

  window.setInterval(() => {
    const decay = state.sleeping
      ? { hunger: -2, energy: +5, joy: -1 }
      : { hunger: -3, energy: state.mood === "walk" ? -2 : -1, joy: -1.2 };

    let nextPosition = state.position;
    let nextFacing = state.facing;
    let nextSleeping = state.sleeping;

    if (!nextSleeping && state.energy > 18) {
      nextPosition += 0.06 * nextFacing;
      if (nextPosition >= 0.92 || nextPosition <= 0.02) {
        nextFacing *= -1;
        nextPosition = Math.min(0.92, Math.max(0.02, nextPosition));
      }
    }

    if (state.energy < 12) {
      nextSleeping = true;
    } else if (state.sleeping && state.energy > 76 && state.hunger > 28) {
      nextSleeping = false;
    }

    setState({
      hunger: state.hunger + decay.hunger,
      energy: state.energy + decay.energy,
      joy: state.joy + decay.joy,
      position: nextPosition,
      facing: nextFacing,
      sleeping: nextSleeping
    });
  }, 3200);

  sync();
}

async function mountPet() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const root = ensureRoot();
  const pet = root.querySelector(`.${PET_CLASS}`);
  if (!pet) return;

  const petState = await getPetState();
  createController(root, pet, settings, petState);
  if (settings.speechEnabled) {
    speak(root, `${settings.petName} is on page patrol.`);
  }
}

void mountPet();
