export type Surface = 'pet' | 'settings' | 'diagnostics' | 'lab-preview' | 'splash' | 'onboarding';

export function readSurface(search = window.location.search): Surface {
  const value = new URLSearchParams(search).get('surface');
  return value === 'settings' || value === 'diagnostics' || value === 'lab-preview' || value === 'splash' || value === 'onboarding' ? value : 'pet';
}
