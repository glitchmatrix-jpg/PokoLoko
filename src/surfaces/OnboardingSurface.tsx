import { useState } from 'react';
import type { CharacterId, LocomotionActivityLevel } from '../../electron/preload/contracts';
import { resolveRuntimeAssetUrl } from '../shared/assetUrl';

const steps = ['meet', 'controls', 'rhythm', 'privacy'] as const;
type Step = typeof steps[number];

export function OnboardingSurface() {
  const [step, setStep] = useState<Step>('meet');
  const [character, setCharacter] = useState<CharacterId>('poko');
  const [activityLevel, setActivityLevel] = useState<LocomotionActivityLevel>('balanced');
  const [contextEnabled, setContextEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const index = steps.indexOf(step);

  async function finish(skipped = false) {
    if (busy) return;
    setBusy(true);
    try {
      await window.pokoloko.sendWindowCommand({
        type: 'complete_onboarding', character, activityLevel,
        contextEnabled: skipped ? false : contextEnabled,
      });
    } finally { setBusy(false); }
  }

  return <main className="onboarding-shell">
    <header className="onboarding-brand">
      <img src={resolveRuntimeAssetUrl('brand/pokoloko_symbol.png')} alt="" />
      <span>PokoLoko.</span>
      <button type="button" onClick={() => void finish(true)} disabled={busy}>Skip</button>
    </header>

    <section className="onboarding-card" aria-live="polite">
      {step === 'meet' && <>
        <p className="onboarding-kicker">Meet your desktop companion</p>
        <h1>Who should move in first?</h1>
        <p className="onboarding-lead">You can switch anytime. They share a home, not a personality.</p>
        <div className="onboarding-characters">
          {(['poko','loko'] as const).map((id) => <button key={id} className={character === id ? 'selected' : ''} onClick={() => setCharacter(id)}>
            <img src={resolveRuntimeAssetUrl(id === 'poko' ? 'assets/runtime/poko/idle/poko_idle_blink/frame_000.png' : 'assets/runtime/loko/idle/loko_idle_front/frame_000.png')} alt="" />
            <strong>{id === 'poko' ? 'Poko' : 'Loko'}</strong>
            <span>{id === 'poko' ? 'Playful, curious, openly affectionate.' : 'Calm, focused, quietly affectionate.'}</span>
          </button>)}
        </div>
      </>}

      {step === 'controls' && <>
        <p className="onboarding-kicker">The basics</p><h1>Small gestures. Clear meaning.</h1>
        <div className="onboarding-feature-grid">
          <article><span>↔</span><h2>Drag to move</h2><p>Pick your companion up and place them anywhere along the desktop floor.</p></article>
          <article><span>♡</span><h2>Click to interact</h2><p>They respond differently depending on mood, posture, and how much attention you give.</p></article>
          <article><span>⋯</span><h2>Use the tray</h2><p>Pause, switch companions, adjust activity, open Settings, or quit.</p></article>
        </div>
      </>}

      {step === 'rhythm' && <>
        <p className="onboarding-kicker">Choose a rhythm</p><h1>How present should they feel?</h1>
        <div className="onboarding-options">
          {(['calm','balanced','lively'] as const).map((level) => <button key={level} className={activityLevel === level ? 'selected' : ''} onClick={() => setActivityLevel(level)}>
            <strong>{level[0].toUpperCase()+level.slice(1)}</strong>
            <span>{level === 'calm' ? 'Long quiet spells and gentle movement.' : level === 'balanced' ? 'A natural mix of rest, wandering, and play.' : 'More spontaneous activity and curious interruptions.'}</span>
          </button>)}
        </div>
      </>}

      {step === 'privacy' && <>
        <p className="onboarding-kicker">Optional context awareness</p><h1>Context, never content.</h1>
        <p className="onboarding-lead">PokoLoko can notice broad local signals such as mouse activity, idle time, fullscreen use, and time of day. It never reads what you type, your clipboard, messages, passwords, screenshots, browser history, or documents.</p>
        <label className="onboarding-context-toggle">
          <input type="checkbox" checked={contextEnabled} onChange={(e) => setContextEnabled(e.target.checked)} />
          <span><strong>Use privacy-safe context awareness</strong><small>You can change or disable every signal later in Settings.</small></span>
        </label>
      </>}
    </section>

    <footer className="onboarding-footer">
      <div className="onboarding-progress" aria-label={`Step ${index + 1} of ${steps.length}`}>{steps.map((item, i) => <span key={item} className={i <= index ? 'active' : ''} />)}</div>
      <div>
        {index > 0 && <button type="button" className="secondary" onClick={() => setStep(steps[index-1])}>Back</button>}
        {index < steps.length - 1 ? <button type="button" onClick={() => setStep(steps[index+1])}>Continue</button> : <button type="button" onClick={() => void finish(false)} disabled={busy}>{busy ? 'Opening…' : `Welcome ${character === 'poko' ? 'Poko' : 'Loko'}`}</button>}
      </div>
    </footer>
  </main>;
}
