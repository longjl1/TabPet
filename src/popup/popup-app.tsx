import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../shared/storage";
import type { TabPetSettings } from "../shared/types";
import { defaultSettings } from "../shared/types";

export function App() {
  const [settings, setSettings] = useState<TabPetSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  async function update(next: TabPetSettings) {
    setSettings(next);
    await saveSettings(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  return (
    <main className="popup-shell">
      <div className="popup-card">
        <div>
          <p className="eyebrow">TabPet</p>
          <h1>Browser pet</h1>
        </div>
        <label className="row">
          <span>Enabled</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) =>
              void update({ ...settings, enabled: event.target.checked })
            }
          />
        </label>
        <label className="row">
          <span>Speech bubbles</span>
          <input
            type="checkbox"
            checked={settings.speechEnabled}
            onChange={(event) =>
              void update({ ...settings, speechEnabled: event.target.checked })
            }
          />
        </label>
        <label className="row">
          <span>Roam speed</span>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            value={settings.roamSpeed}
            onChange={(event) =>
              void update({ ...settings, roamSpeed: Number(event.target.value) })
            }
          />
        </label>
        <a className="link" href="options.html" target="_blank" rel="noreferrer">
          Open full settings
        </a>
        <p className="status">{saved ? "Saved" : "Ready"}</p>
      </div>
    </main>
  );
}
