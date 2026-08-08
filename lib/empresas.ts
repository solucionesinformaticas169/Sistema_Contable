export function buildNombreDbBase(razonSocial: string) {
  const normalized = razonSocial
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const safeName = normalized || "general";
  return `empresa_${safeName}`.slice(0, 45);
}

export function buildNombreDbPreview(razonSocial: string, fallbackId?: number) {
  const baseName = buildNombreDbBase(razonSocial);
  return fallbackId ? `${baseName}_${fallbackId}` : baseName;
}
