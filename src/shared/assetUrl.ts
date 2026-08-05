export function resolveRuntimeAssetUrl(assetPath: string): string {
  const relativePath = assetPath.replace(/^\/+/, '');
  return new URL(relativePath, document.baseURI).toString();
}
