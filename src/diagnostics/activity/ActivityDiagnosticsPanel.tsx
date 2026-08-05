import type { ActivitySession } from '../../../packages/pet-engine/activities/src/types';

type Props = Readonly<{ session: ActivitySession | null }>;

export function ActivityDiagnosticsPanel({ session }: Props) {
  if (!session) return <section className="diagnostic-card"><h3>Activity</h3><p>No active activity session.</p></section>;
  return (
    <section className="diagnostic-card" aria-label="Activity diagnostics">
      <h3>Activity session</h3>
      <dl>
        <div><dt>Character</dt><dd>{session.character}</dd></div>
        <div><dt>Activity</dt><dd>{session.activityId}</dd></div>
        <div><dt>Phase</dt><dd>{session.phase}</dd></div>
        <div><dt>Generation</dt><dd>{session.generation}</dd></div>
        <div><dt>Animation</dt><dd>{session.activeAnimationId ?? '—'}</dd></div>
        <div><dt>Prop</dt><dd>{session.propVisible ? session.activePropId ?? 'visible' : 'none'}</dd></div>
        <div><dt>Loops</dt><dd>{session.completedLoops}{session.plannedLoopCount ? ` / ${session.plannedLoopCount}` : ''}</dd></div>
        <div><dt>Safe marker</dt><dd>{session.lastSafeMarker ?? '—'}</dd></div>
        <div><dt>Pending interruption</dt><dd>{session.pendingInterruption?.reason ?? '—'}</dd></div>
      </dl>
    </section>
  );
}
