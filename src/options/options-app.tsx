import { useEffect, useState } from "react";
import { defaultSettings, type TabPetSettings } from "../shared/types";
import { getSettings, saveSettings } from "../shared/storage";

export function OptionsApp() {
  const [settings, setSettings] = useState<TabPetSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  async function handleSave() {
    await saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main className="options-shell">
      <section className="options-card">
        <div>
          <p className="eyebrow">TabPet Settings</p>
          <h1>Configure your companion</h1>
        </div>

        <label className="field">
          <span>Pet name</span>
          <input
            value={settings.petName}
            onChange={(event) =>
              setSettings({ ...settings, petName: event.target.value })
            }
          />
        </label>

        <label className="field">
          <span>Custom asset URL</span>
          <input
            value={settings.customAssetUrl}
            placeholder="https://example.com/pet.png"
            onChange={(event) =>
              setSettings({ ...settings, customAssetUrl: event.target.value })
            }
          />
        </label>

        <label className="field">
          <span>Pet scale</span>
          <input
            type="range"
            min="0.7"
            max="1.8"
            step="0.1"
            value={settings.petScale}
            onChange={(event) =>
              setSettings({ ...settings, petScale: Number(event.target.value) })
            }
          />
        </label>

        <label className="field">
          <span>Roam speed</span>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            value={settings.roamSpeed}
            onChange={(event) =>
              setSettings({ ...settings, roamSpeed: Number(event.target.value) })
            }
          />
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) =>
              setSettings({ ...settings, enabled: event.target.checked })
            }
          />
          <span>Show TabPet on websites</span>
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={settings.speechEnabled}
            onChange={(event) =>
              setSettings({ ...settings, speechEnabled: event.target.checked })
            }
          />
          <span>Allow speech bubbles</span>
        </label>

        <button className="save-button" type="button" onClick={() => void handleSave()}>
          Save settings
        </button>

        <p className="status">{saved ? "Settings saved." : "Change the basics here."}</p>
      </section>
    </main>
  );
}
