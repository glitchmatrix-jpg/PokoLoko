import { DiagnosticsSurface } from './surfaces/DiagnosticsSurface';
import { PetSurface } from './surfaces/PetSurface';
import { SettingsSurface } from './surfaces/SettingsSurface';
import { readSurface } from './shared/surface';
import { TransparentPreview } from './diagnostics/animation-lab/TransparentPreview';
import { SplashSurface } from './surfaces/SplashSurface';
import { OnboardingSurface } from './surfaces/OnboardingSurface';

export function App() {
  const surface = readSurface();
  if (surface === 'settings') return <SettingsSurface />;
  if (surface === 'diagnostics') return <DiagnosticsSurface />;
  if (surface === 'lab-preview') return <TransparentPreview />;
  if (surface === 'splash') return <SplashSurface />;
  if (surface === 'onboarding') return <OnboardingSurface />;
  return <PetSurface />;
}
