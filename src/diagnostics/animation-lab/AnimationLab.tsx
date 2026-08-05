import { useEffect, useMemo, useRef, useState } from 'react';
import manifestJson from '../../../public/assets/runtime/runtime_manifest.json';
import metricsJson from '../../../public/assets/diagnostics/animation_metrics.json';
import { AnimationViewport } from './AnimationViewport';
import { buildPlaybackOrder, frameAtElapsed } from './player';
import { createDefaultChain, reviewChain } from './transitionComposer';
import type { AnimationMetrics, ChainSegment, CharacterId, PlaybackMode, RuntimeManifest } from './types';

const manifest = manifestJson as unknown as RuntimeManifest;
const metrics = metricsJson as Record<string, AnimationMetrics>;
const animationMap = new Map(manifest.animations.map((animation) => [animation.id, animation]));

export function AnimationLab() {
  const [character, setCharacter] = useState<CharacterId>('poko');
  const options = useMemo(() => manifest.animations.filter((animation) => animation.character === character), [character]);
  const [animationId, setAnimationId] = useState('poko_idle_blink');
  const [compareId, setCompareId] = useState('poko_walk_left');
  const animation = animationMap.get(animationId) ?? options[0]!;
  const compare = animationMap.get(compareId) ?? options[0]!;
  const [playing, setPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [fps, setFps] = useState(animation.fps);
  const [loop, setLoop] = useState(animation.loop);
  const [playback, setPlayback] = useState<PlaybackMode>(animation.playback);
  const [scale, setScale] = useState(3);
  const [guides, setGuides] = useState({ canvas: true, ground: true, center: true, bounds: true });
  const [chain, setChain] = useState<ChainSegment[]>(createDefaultChain('poko'));
  const [interruptionResult, setInterruptionResult] = useState('Not simulated.');
  const startedAt = useRef(performance.now());
  const accumulatedAtStart = useRef(0);

  useEffect(() => {
    const next = options[0];
    if (!next) return;
    setAnimationId(next.id);
    setCompareId(options.find((item) => item.generatedByMirroring) ? options.find((item) => item.generatedByMirroring)!.id : next.id);
    setChain(createDefaultChain(character));
  }, [character, options]);

  useEffect(() => {
    setFrameIndex(0); setSequenceIndex(0); setFps(animation.fps); setLoop(animation.loop); setPlayback(animation.playback); accumulatedAtStart.current = 0; startedAt.current = performance.now();
  }, [animation.id]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = accumulatedAtStart.current + (now - startedAt.current);
      const result = frameAtElapsed(elapsed, animation.frameCount, fps, playback, loop);
      setFrameIndex(result.frameIndex);
      setSequenceIndex(result.sequenceIndex);
      if (!result.completed || loop) raf = requestAnimationFrame(tick); else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animation.frameCount, fps, loop, playback, playing]);

  const resetClock = () => { accumulatedAtStart.current = 0; startedAt.current = performance.now(); setFrameIndex(0); setSequenceIndex(0); };
  const togglePlaying = () => {
    const now = performance.now();
    if (playing) accumulatedAtStart.current += now - startedAt.current;
    else startedAt.current = now;
    setPlaying((value) => !value);
  };
  const step = (delta: number) => {
    setPlaying(false);
    const order = buildPlaybackOrder(animation.frameCount, playback);
    if (!order.length) return;
    const nextSequence = (sequenceIndex + delta + order.length) % order.length;
    const nextFrame = order[nextSequence] ?? 0;
    accumulatedAtStart.current = nextSequence * (1000 / fps);
    startedAt.current = performance.now();
    setSequenceIndex(nextSequence);
    setFrameIndex(nextFrame);
  };
  const chainReview = reviewChain(chain, animationMap);
  const addAnimation = () => setChain((current) => [...current, { id: crypto.randomUUID(), kind: 'animation', animationId: animation.id, loops: 1 }]);
  const addHold = () => setChain((current) => [...current, { id: crypto.randomUUID(), kind: 'hold', durationMs: 300, label: 'runtime hold' }]);
  const simulateInterruption = () => {
    const rule = animation.interruptionLevel === 'immediate' ? 'cancel now and route to neutral recovery' : animation.interruptionLevel === 'soft' ? 'exit at next phrase boundary' : animation.interruptionLevel === 'deferred' ? 'wait for prop/posture-safe marker' : 'finish locked micro-transition unless drag/system interruption';
    setInterruptionResult(`Frame ${frameIndex + 1}: ${animation.interruptionLevel.toUpperCase()} â€” ${rule}. ${animation.interruptionRule}`);
  };
  const selectedMetrics = metrics[animation.id];

  return <main className="animation-lab">
    <aside className="lab-sidebar">
      <p className="eyebrow">POKOLOKO / ANIMATION LAB</p>
      <h1>Motion, under glass.</h1>
      <p className="lab-intro">Inspect every approved frame, anchor, loop seam and transition phrase before the living engine gets permission to touch it.</p>
      <label>Character<select value={character} onChange={(event) => setCharacter(event.target.value as CharacterId)}><option value="poko">Poko</option><option value="loko">Loko</option></select></label>
      <label>Primary animation<select value={animation.id} onChange={(event) => setAnimationId(event.target.value)}>{options.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>
      <label>Comparison<select value={compare.id} onChange={(event) => setCompareId(event.target.value)}>{options.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>
      <div className="control-grid">
        <button onClick={togglePlaying}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={resetClock}>Restart</button><button onClick={() => step(-1)}>â† Frame</button><button onClick={() => step(1)}>Frame â†’</button>
      </div>
      <button className="wide-button" onClick={() => void window.pokoloko.sendWindowCommand({ type: 'open_lab_preview', animationId: animation.id })}>Open transparent preview</button>
      <button className="wide-button" onClick={simulateInterruption}>Simulate interruption here</button>
      <p className="interrupt-result">{interruptionResult}</p>
      <label>FPS <output>{fps.toFixed(1)}</output><input type="range" min="1" max="20" step="0.5" value={fps} onChange={(event) => setFps(Number(event.target.value))} /></label>
      <label>Integer scale<select value={scale} onChange={(event) => setScale(Number(event.target.value))}><option value="1">1Ã—</option><option value="2">2Ã—</option><option value="3">3Ã—</option><option value="4">4Ã—</option></select></label>
      <label>Playback<select value={playback} onChange={(event) => setPlayback(event.target.value as PlaybackMode)}><option value="forward">Forward</option><option value="reverse">Reverse</option><option value="ping_pong">Ping-pong</option></select></label>
      <label className="check"><input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} /> Loop</label>
      {Object.entries(guides).map(([key, value]) => <label className="check" key={key}><input type="checkbox" checked={value} onChange={() => setGuides((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))} /> {key}</label>)}
    </aside>

    <section className="lab-workspace">
      <div className="lab-summary"><div><span>Action</span><strong>{animation.visibleAction}</strong></div><div><span>Verdict</span><strong className={`verdict ${selectedMetrics?.verdict}`}>{selectedMetrics?.verdict ?? 'unmeasured'}</strong></div><div><span>Loop seam</span><strong>{selectedMetrics?.loopSeamScore.toFixed(3) ?? 'â€”'}</strong></div><div><span>Interrupt</span><strong>{animation.interruptionLevel}</strong></div></div>
      <div className="viewport-grid">
        <AnimationViewport animation={animation} frameIndex={frameIndex} scale={scale} showCanvas={guides.canvas} showGround={guides.ground} showBodyCenter={guides.center} showBounds={guides.bounds} metrics={selectedMetrics} label="Primary" />
        <AnimationViewport animation={compare} frameIndex={Math.min(frameIndex, compare.frameCount - 1)} scale={scale} showCanvas={guides.canvas} showGround={guides.ground} showBodyCenter={guides.center} showBounds={guides.bounds} metrics={metrics[compare.id]} label={compare.generatedByMirroring ? 'Mirrored comparison' : 'Comparison'} />
      </div>
      <section className="chain-panel">
        <header><div><p className="eyebrow">TRANSITION COMPOSER</p><h2>Phrase before behavior.</h2></div><div className="chain-actions"><button onClick={addAnimation}>Add selected</button><button onClick={addHold}>Add hold</button><button onClick={() => setChain((current) => current.slice(0,-1))}>Remove last</button><button onClick={() => setChain(createDefaultChain(character))}>Reset</button></div></header>
        <div className="chain-strip">{chain.map((segment, index) => <div className={`chain-node ${segment.kind}`} key={segment.id}><span>{index + 1}</span><strong>{segment.kind === 'animation' ? segment.animationId : segment.kind}</strong><small>{segment.kind === 'animation' ? `${segment.loops}Ã—` : `${segment.durationMs} ms`}</small></div>)}</div>
        <div className={`chain-review ${chainReview.valid ? 'pass' : 'warn'}`}><strong>{chainReview.valid ? 'Chain is structurally valid' : 'Chain requires choreography'}</strong><span>{(chainReview.totalDurationMs / 1000).toFixed(1)} s</span>{chainReview.warnings.length ? <ul>{chainReview.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p>No posture, prop or missing-asset warnings detected.</p>}</div>
      </section>
      <section className="metrics-table"><h2>Frame stability</h2><table><thead><tr><th>Frame</th><th>Ground Î”</th><th>Centroid Î”</th><th>Area Î”</th><th>Bounds</th></tr></thead><tbody>{selectedMetrics?.frames.map((item) => <tr key={item.frame}><td>{item.frame + 1}</td><td>{item.groundDelta.toFixed(2)}</td><td>{item.centroidDelta.toFixed(2)}</td><td>{(item.visibleAreaDeltaRatio * 100).toFixed(1)}%</td><td>{item.bounds.width}Ã—{item.bounds.height} @ {item.bounds.x},{item.bounds.y}</td></tr>)}</tbody></table></section>
    </section>
  </main>;
}


