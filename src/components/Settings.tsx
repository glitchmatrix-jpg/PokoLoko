import { useEffect, useState } from 'react';
import type { AppSettings, PetName } from '../types/animation';

const fallback: AppSettings = {
  pet: 'poko',
  alwaysOnTop: true,
  paused: false,
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(fallback);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void window.pokoAPI.getSettings().then(setSettings);
    return window.pokoAPI.onSettingsChanged(setSettings);
  }, []);

  const selectPet = async (pet: PetName) => {
    setBusy(true);
    try {
      setSettings(await window.pokoAPI.setPet(pet));
    } finally {
      setBusy(false);
    }
  };

  const toggleTop = async () => {
    setBusy(true);
    try {
      setSettings(await window.pokoAPI.toggleAlwaysOnTop());
    } finally {
      setBusy(false);
    }
  };

  const togglePause = async () => {
    setBusy(true);
    try {
      setSettings(await window.pokoAPI.togglePause());
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="settings">
      <div className="brand">
        <img src={new URL('icons/poko-64.png', document.baseURI).toString()} alt="Poko" />
        <div>
          <h1>Poko</h1>
          <p>Alive on Desktop · v0.1.1</p>
        </div>
      </div>

      <section>
        <h2>Choose your pet</h2>
        <div className="pet-options">
          <button
            type="button"
            disabled={busy}
            className={settings.pet === 'poko' ? 'selected' : ''}
            onClick={() => void selectPet('poko')}
          >
            <strong>🐱 Poko</strong>
            <span>Playful and quick</span>
          </button>
          <button
            type="button"
            disabled={busy}
            className={settings.pet === 'loko' ? 'selected' : ''}
            onClick={() => void selectPet('loko')}
          >
            <strong>🐰 Loko</strong>
            <span>Calm and cozy</span>
          </button>
        </div>
      </section>

      <section>
        <label>
          <span>
            <b>Always on top</b>
            <small>Keep your pet above other windows</small>
          </span>
          <input
            type="checkbox"
            disabled={busy}
            checked={settings.alwaysOnTop}
            onChange={() => void toggleTop()}
          />
        </label>
        <label>
          <span>
            <b>Pause pet</b>
            <small>Stop autonomous movement while keeping interactions active</small>
          </span>
          <input
            type="checkbox"
            disabled={busy}
            checked={settings.paused}
            onChange={() => void togglePause()}
          />
        </label>
      </section>

      <p className="tip">
        Drag your pet to move it. Left-click for a reaction, right-click for controls, and
        double-click to reopen this panel.
      </p>
    </main>
  );
}
