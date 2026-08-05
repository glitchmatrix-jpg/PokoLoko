import { useEffect, useState } from 'react';
import type { LivingRuntimeSnapshot } from '../../electron/preload/contracts';

const percent = (value: number) => `${Math.round(value * 100)}%`;

export function LivingRuntimePanel() {
  const [snapshot, setSnapshot] = useState<LivingRuntimeSnapshot | null>(null);
  useEffect(() => {
    let active = true;
    void window.pokoloko.getLivingRuntimeSnapshot().then((value) => { if (active) setSnapshot(value); });
    const unsubscribe = window.pokoloko.onLivingRuntimeSnapshot(setSnapshot);
    return () => { active = false; unsubscribe(); };
  }, []);
  if (!snapshot) return <section className="living-runtime-panel">Living runtime is starting…</section>;
  const drives = [
    ['Energy', snapshot.mind.energy], ['Play', snapshot.mind.playfulness], ['Focus', snapshot.mind.focus],
    ['Curiosity', snapshot.mind.curiosity], ['Comfort', snapshot.mind.comfort], ['Boredom', snapshot.mind.boredom],
  ] as const;
  return (
    <section className="living-runtime-panel" aria-label="Living runtime status">
      <div><p className="settings-kicker">Live orchestration</p><h2>{snapshot.character} · {snapshot.mode}</h2><p>{snapshot.activeId ?? 'No active phrase'} · mood: {snapshot.mind.mood}</p></div>
      <div className="living-drive-grid">{drives.map(([name, value]) => <div key={name}><span>{name}</span><strong>{percent(value)}</strong></div>)}</div>
      <div className="living-runtime-reason"><strong>Last decision</strong><span>{snapshot.lastDecisionReason ?? 'Waiting for a stable decision point.'}</span></div>
    </section>
  );
}
