import { DiagnosticControlPanel } from '../diagnostics/DiagnosticControlPanel';
import { AnimationLab } from '../diagnostics/animation-lab/AnimationLab';
export function DiagnosticsSurface(){return <div className="diagnostics-root"><DiagnosticControlPanel/><details className="animation-lab-disclosure"><summary>Open animation laboratory</summary><AnimationLab/></details></div>;}
