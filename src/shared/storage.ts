import { defaultSettings, type TabPetSettings } from "./types";

const SETTINGS_KEY = "tabpet:settings";

export async function getSettings(): Promise<TabPetSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return {
    ...defaultSettings,
    ...(result[SETTINGS_KEY] as Partial<TabPetSettings> | undefined)
  };
}

export async function saveSettings(settings: TabPetSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
