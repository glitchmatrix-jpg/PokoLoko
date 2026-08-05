import { app } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export type Surface = 'pet' | 'settings' | 'diagnostics' | 'lab-preview' | 'splash' | 'onboarding';

export function rendererUrl(surface: Surface): string {
  const devServer = process.env.VITE_DEV_SERVER_URL;
  const query = new URLSearchParams({ surface }).toString();
  if (devServer) return `${devServer}?${query}`;
  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
  return `${pathToFileURL(indexPath).toString()}?${query}`;
}

export function packagedAssetPath(...segments: string[]): string {
  const root = process.env.VITE_DEV_SERVER_URL
    ? path.join(app.getAppPath(), 'public')
    : path.join(app.getAppPath(), 'dist');
  return path.join(root, ...segments);
}
