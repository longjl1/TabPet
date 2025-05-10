import { getSettings } from "../shared/storage";
import type { PetMood } from "../shared/types";
import "./style.css";

const ROOT_ID = "tabpet-root";
const PET_CLASS = "tabpet-pet";
const SPEECH_CLASS = "tabpet-speech";

const moods: PetMood[] = ["idle", "walk", "sleep", "happy"];
const lines = [
  "Just vibing on this tab.",
  "You scroll, I supervise.",
  "This page looks important.",
  "Pet me for morale."
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function ensureRoot(): HTMLDivElement {
  const existing = document.getElementById(ROOT_ID);
  if (existing) {
    return existing as HTMLDivElement;
  }

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = `
    <button class="${PET_CLASS}" type="button" aria-label="TabPet">
      <span class="tabpet-face">^.^</span>
    </button>
    <div class="${SPEECH_CLASS}" hidden></div>
  `;
  document.body.appendChild(root);
  return root;
}

function setMood(pet: HTMLElement, mood: PetMood) {
  pet.setAttribute("data-mood", mood);
}

function speak(root: HTMLElement, text: string) {
  const bubble = root.querySelector(`.${SPEECH_CLASS}`) as HTMLDivElement | null;
  if (!bubble) return;
  bubble.textContent = text;
  bubble.hidden = false;
  window.setTimeout(() => {
    bubble.hidden = true;
  }, 2200);
}

async function mountPet() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const root = ensureRoot();
  const pet = root.querySelector(`.${PET_CLASS}`) as HTMLButtonElement | null;
  if (!pet) return;

  pet.title = settings.petName;
  setMood(pet, "idle");

  pet.addEventListener("click", () => {
    setMood(pet, "happy");
    if (settings.speechEnabled) {
      speak(root, randomItem(lines));
    }
    window.setTimeout(() => setMood(pet, "idle"), 1200);
  });

  window.setInterval(() => {
    setMood(pet, randomItem(moods));
  }, 5000);
}

void mountPet();
