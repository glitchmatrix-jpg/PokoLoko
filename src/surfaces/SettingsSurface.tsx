import { useEffect, useMemo, useState } from 'react';
import type {
  AppInfo,
  CharacterId,
  ContextPrivacySettings,
  ContextSnapshot,
  FullscreenBehavior,
  LivingRuntimeSnapshot,
  LocomotionActivityLevel,
  PublicSettings,
  SafeIntegerScale,
  StaticPetPresentation,
} from '../../electron/preload/contracts';
import { resolveRuntimeAssetUrl } from '../shared/assetUrl';

const scales: SafeIntegerScale[] = [1, 2, 3];
const rhythms: ReadonlyArray<{ id: LocomotionActivityLevel; label: string; description: string }> = [
  { id: 'calm', label: 'Calm', description: 'Long quiet spells, fewer spontaneous routines.' },
  { id: 'balanced', label: 'Balanced', description: 'A natural mix of rest, wandering, and play.' },
  { id: 'lively', label: 'Lively', description: 'More curious movement and playful interruptions.' },
];
const walkingSpeeds: ReadonlyArray<{ id: LocomotionActivityLevel; label: string }> = [
  { id: 'calm', label: 'Gentle' }, { id: 'balanced', label: 'Natural' }, { id: 'lively', label: 'Brisk' },
];
const fullscreenOptions: ReadonlyArray<{ id: FullscreenBehavior; label: string; description: string }> = [
  { id: 'quiet', label: 'Settle down', description: 'Remain visible, but stop energetic behavior.' },
  { id: 'hide', label: 'Step away', description: 'Hide while fullscreen is active, then return.' },
  { id: 'unchanged', label: 'Stay the same', description: 'Do not alter behavior for fullscreen apps.' },
];

const previewFrames: Record<CharacterId, string> = {
  poko: 'assets/runtime/poko/idle/poko_idle_blink/frame_000.png',
  loko: 'assets/runtime/loko/idle/loko_idle_front/frame_000.png',
};

function Toggle({ checked, onChange, label, description, disabled = false }: { checked: boolean; onChange(value: boolean): void; label: string; description?: string; disabled?: boolean }) {
  return <label className={`setting-toggle-row${disabled ? ' disabled' : ''}`}>
    <span><strong>{label}</strong>{description && <small>{description}</small>}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} aria-label={label} />
    <span className="switch" aria-hidden="true"><span /></span>
  </label>;
}

export function SettingsSurface() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [pet, setPet] = useState<StaticPetPresentation | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [context, setContext] = useState<ContextSnapshot | null>(null);
  const [living, setLiving] = useState<LivingRuntimeSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([
      window.pokoloko.getAppInfo(), window.pokoloko.getStaticPetPresentation(),
      window.pokoloko.getPublicSettings(), window.pokoloko.getContextSnapshot(),
      window.pokoloko.getLivingRuntimeSnapshot(),
    ]).then(([appInfo, presentation, publicSettings, snapshot, runtime]) => {
      if (!active) return;
      setInfo(appInfo); setPet(presentation); setSettings(publicSettings); setContext(snapshot); setLiving(runtime);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
    const unsubPet = window.pokoloko.onStaticPetPresentation(setPet);
    const unsubSettings = window.pokoloko.onPublicSettings(setSettings);
    const unsubContext = window.pokoloko.onContextSnapshot(setContext);
    const unsubLiving = window.pokoloko.onLivingRuntimeSnapshot(setLiving);
    return () => { active = false; unsubPet(); unsubSettings(); unsubContext(); unsubLiving(); };
  }, []);

  async function command(value: Parameters<typeof window.pokoloko.sendWindowCommand>[0]): Promise<void> {
    setBusy(true); setError(null); setSaved(false);
    try {
      await window.pokoloko.sendWindowCommand(value);
      setSettings(await window.pokoloko.getPublicSettings());
      setSaved(true); window.setTimeout(() => setSaved(false), 1400);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }

  async function updatePrivacy(patch: Partial<ContextPrivacySettings>): Promise<void> {
    if (!settings) return;
    await command({ type: 'set_context_privacy', settings: { ...settings.contextAwareness, ...patch } });
  }

  const selectedCharacter = settings?.selectedCharacter ?? pet?.character ?? 'poko';
  const rhythmDescription = useMemo(() => rhythms.find((item) => item.id === settings?.activityLevel)?.description, [settings?.activityLevel]);

  if (!settings) return <main className="settings-loading" aria-busy="true"><img src={resolveRuntimeAssetUrl('brand/pokoloko_symbol.png')} alt="" /><p>Waking PokoLoko…</p></main>;

  return <main className={`settings-app${settings.reducedMotion ? ' reduced-motion' : ''}`}>
    <aside className="settings-brand" aria-label="PokoLoko settings navigation">
      <img className="settings-wordmark" src={resolveRuntimeAssetUrl('brand/pokoloko_wordmark_horizontal.png')} alt="PokoLoko" />
      <div className="brand-copy"><p>Your desktop, gently alive.</p></div>
      <nav>
        <a href="#companion">Companion</a><a href="#presence">Presence</a><a href="#privacy">Privacy</a><a href="#system">System</a>
      </nav>
      <div className="brand-status" aria-live="polite">
        <span className={`status-dot ${living?.mode ?? 'idle'}`} />
        <div><strong>{selectedCharacter === 'poko' ? 'Poko' : 'Loko'} is {living?.mode ?? 'settling in'}</strong><small>{saved ? 'Saved' : 'Changes save instantly'}</small></div>
      </div>
    </aside>

    <div className="settings-content">
      <header className="settings-topbar">
        <div><p className="settings-kicker">Personalize your companion</p><h1>Make the desktop feel like yours.</h1></div>
        <button className="close-button" type="button" onClick={() => window.close()} aria-label="Close settings">Done</button>
      </header>

      {error && <div className="settings-error" role="alert"><strong>That change did not save.</strong><span>{error}</span></div>}

      <section id="companion" className="settings-section" aria-labelledby="companion-title">
        <div className="section-heading"><span>01</span><div><h2 id="companion-title">Choose your companion</h2><p>They share a home, not a personality.</p></div></div>
        <div className="character-grid" role="radiogroup" aria-label="Character selection">
          {(['poko', 'loko'] as const).map((character) => <button key={character} type="button" role="radio" aria-checked={selectedCharacter === character} disabled={busy}
            className={`character-card${selectedCharacter === character ? ' selected' : ''}`}
            onClick={() => void command({ type: 'set_static_character', character })}>
            <div className="character-preview"><img src={resolveRuntimeAssetUrl(previewFrames[character])} alt="" /></div>
            <div><strong>{character === 'poko' ? 'Poko' : 'Loko'}</strong><span>{character === 'poko' ? 'Playful, curious, openly affectionate.' : 'Calm, focused, quietly affectionate.'}</span></div>
            <span className="selection-mark" aria-hidden="true">✓</span>
          </button>)}
        </div>
        <div className="control-card">
          <div><h3>Activity rhythm</h3><p>{rhythmDescription}</p></div>
          <div className="choice-pills" role="radiogroup" aria-label="Activity rhythm">
            {rhythms.map((item) => <button key={item.id} role="radio" aria-checked={settings.activityLevel === item.id} className={settings.activityLevel === item.id ? 'selected' : ''} disabled={busy}
              onClick={() => void command({ type: 'set_locomotion_activity_level', level: item.id })}>{item.label}</button>)}
          </div>
        </div>
        <div className="two-column-controls">
          <div className="control-card compact"><div><h3>Walking pace</h3><p>How quickly they travel, separate from how often they act.</p></div><div className="choice-pills compact" role="radiogroup" aria-label="Walking pace">{walkingSpeeds.map((item) => <button key={item.id} role="radio" aria-checked={settings.walkingSpeed === item.id} className={settings.walkingSpeed === item.id ? 'selected' : ''} onClick={() => void command({ type: 'set_walking_speed', level: item.id })}>{item.label}</button>)}</div></div>
          <div className="control-card compact"><div><h3>Pixel size</h3><p>Integer scales keep every edge crisp.</p></div><div className="choice-pills compact" role="radiogroup" aria-label="Pet size">{scales.map((scale) => <button key={scale} role="radio" aria-checked={settings.sizeScale === scale} className={settings.sizeScale === scale ? 'selected' : ''} onClick={() => void command({ type: 'set_static_scale', scale })}>{scale}×</button>)}</div></div>
        </div>
      </section>

      <section id="presence" className="settings-section" aria-labelledby="presence-title">
        <div className="section-heading"><span>02</span><div><h2 id="presence-title">Presence and comfort</h2><p>Keep them charming, never demanding.</p></div></div>
        <div className="settings-list">
          <Toggle checked={settings.paused} onChange={(paused) => void command({ type: 'set_pet_paused', paused })} label="Pause companion" description="Freeze autonomous behavior until you are ready." />
          <Toggle checked={settings.quietMode} onChange={(quiet) => void command({ type: 'set_quiet_mode', quiet })} label="Quiet mode" description="Reduce play, wandering, and attention-seeking without hiding them." />
          <Toggle checked={settings.reducedMotion} onChange={(enabled) => void command({ type: 'set_reduced_motion', enabled })} label="Reduced motion" description="Slower sprite playback and fewer abrupt visual changes." />
          <Toggle checked={settings.alwaysOnTop} onChange={(enabled) => void command({ type: 'set_always_on_top', enabled })} label="Stay above other windows" description="Keep Poko or Loko visible while you work." />
          <Toggle checked={settings.soundEnabled} onChange={(enabled) => void command({ type: 'set_sound_enabled', enabled })} label="Gentle sounds" description="Saved now; audio cues become active only after the sound system is approved." />
        </div>
        <div className="control-card fullscreen-card"><div><h3>During fullscreen apps</h3><p>Choose how your companion behaves while you watch, present, or play.</p></div><div className="fullscreen-options">{fullscreenOptions.map((item) => <label key={item.id} className={settings.fullscreenBehavior === item.id ? 'selected' : ''}><input type="radio" name="fullscreen" checked={settings.fullscreenBehavior === item.id} onChange={() => void command({ type: 'set_fullscreen_behavior', behavior: item.id })} /><span><strong>{item.label}</strong><small>{item.description}</small></span></label>)}</div></div>
      </section>

      <section id="privacy" className="settings-section" aria-labelledby="privacy-title">
        <div className="section-heading"><span>03</span><div><h2 id="privacy-title">Context, without surveillance</h2><p>Signals describe activity presence—never content.</p></div></div>
        <div className="privacy-master">
          <div><h3>Context awareness</h3><p>Let broad, local desktop signals gently influence behavior. Everything stays on this computer.</p></div>
          <Toggle checked={settings.contextAwareness.enabled} onChange={(enabled) => void updatePrivacy({ enabled })} label={settings.contextAwareness.enabled ? 'Enabled' : 'Disabled'} />
        </div>
        {settings.contextAwareness.enabled && <div className="privacy-grid">
          {([
            ['mouseActivity', 'Pointer activity', 'Coarse movement level, sampled conservatively.'],
            ['systemIdle', 'System idle', 'Only how long the computer has been inactive.'],
            ['timeOfDay', 'Time of day', 'Morning, day, evening, or late-night bands.'],
            ['fullscreenState', 'Fullscreen state', 'Supports the fullscreen behavior you chose above.'],
            ['lockAndResume', 'Lock and resume', 'Pauses safely and returns gently.'],
            ['recentPetInteraction', 'Recent interaction', 'Briefly remembers clicks and drags this session.'],
          ] as const).map(([key, label, description]) => <Toggle key={key} checked={settings.contextAwareness[key]} onChange={(enabled) => void updatePrivacy({ [key]: enabled })} label={label} description={description} />)}
          <div className="privacy-note"><strong>Typing and audio awareness remain unavailable.</strong><p>No key identity, typed text, audio content, clipboard, screenshot, browser history, document, password, or message is ever read.</p></div>
          <div className="context-readout" aria-live="polite"><span>Current coarse context</span><strong>{context?.screenLocked ? 'Screen locked' : context?.fullscreenActive ? 'Fullscreen active' : context?.systemIdle ? 'System idle' : context?.mouseActivity === 'busy' ? 'Active desktop' : 'Quiet desktop'}</strong><small>{context?.timeBand?.replace('_', ' ') ?? 'day'} · stored only for this session</small></div>
        </div>}
      </section>

      <section id="system" className="settings-section" aria-labelledby="system-title">
        <div className="section-heading"><span>04</span><div><h2 id="system-title">System and resets</h2><p>Simple controls for startup, diagnostics, and a clean slate.</p></div></div>
        <div className="settings-list">
          <Toggle checked={settings.launchAtStartup} onChange={(enabled) => void command({ type: 'set_launch_at_startup', enabled })} label="Open PokoLoko when I sign in" description="Uses the standard Windows startup setting." />
          <Toggle checked={settings.splashEnabled} onChange={(enabled) => void command({ type: 'set_splash_enabled', enabled })} label="Show the PokoLoko welcome" description="Play the brief meeting animation when the app opens." />
          <Toggle checked={settings.diagnosticsEnabled} onChange={(enabled) => void command({ type: 'set_diagnostics_enabled', enabled })} label="Developer diagnostics" description="Shows technical tools in the tray. Leave this off for normal use." />
        </div>
        <div className="reset-row">
          <button type="button" onClick={() => { if (window.confirm(`Reset ${selectedCharacter}'s recent behavior and session memory?`)) void command({ type: 'reset_character_behavior', character: selectedCharacter }); }}>Reset {selectedCharacter === 'poko' ? 'Poko' : 'Loko'}’s rhythm</button>
          <button type="button" className="danger-quiet" onClick={() => { if (window.confirm('Restore every PokoLoko setting to its default?')) void command({ type: 'reset_settings_defaults' }); }}>Restore all defaults</button>
        </div>
      </section>

      <footer className="settings-footer-new"><img src={resolveRuntimeAssetUrl('brand/pokoloko_symbol.png')} alt="" /><div><strong>PokoLoko.</strong><span>Version {info?.version ?? '…'} · {info?.packaged ? 'Installed build' : 'Development build'}</span></div><button type="button" onClick={() => window.close()}>Done</button></footer>
    </div>
  </main>;
}
