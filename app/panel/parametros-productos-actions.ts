"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SaveParametrosProductosState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseInteger(value: FormDataEntryValue | null, fallback: number) {
  const numericValue = Number(sanitizeText(value));

  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 9) {
    return fallback;
  }

  return numericValue;
}

export async function saveParametrosProductosAction(
  _prevState: SaveParametrosProductosState,
  formData: FormData,
): Promise<SaveParametrosProductosState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa activa.",
      success: null,
    };
  }

  const data = {
    formulaCalculoPrecios:
      sanitizeText(formData.get("formulaCalculoPrecios")) || "precio",
    produccionTipoCosto:
      sanitizeText(formData.get("produccionTipoCosto")) || "op",
    tipoManejoPrecios:
      sanitizeText(formData.get("tipoManejoPrecios")) || "incluido_iva",
    sumarCantidadFacturacion: formData.get("sumarCantidadFacturacion") === "on",
    sumarCantidadTpvOffline: formData.get("sumarCantidadTpvOffline") === "on",
    sumarCantidadProforma: formData.get("sumarCantidadProforma") === "on",
    sumarCantidadEntrega: formData.get("sumarCantidadEntrega") === "on",
    ivaPredeterminado: sanitizeText(formData.get("ivaPredeterminado")) || "15%",
    tipoCalculoCosto:
      sanitizeText(formData.get("tipoCalculoCosto")) || "Costo Ultima Compra",
    almacenPredeterminado:
      sanitizeText(formData.get("almacenPredeterminado")) || "Almacen General",
    transferenciasConIngreso:
      formData.get("transferenciasConIngreso") === "on",
    permitirTransferenciaStock:
      formData.get("permitirTransferenciaStock") === "on",
    actualizarPreciosUltCompra:
      formData.get("actualizarPreciosUltCompra") === "on",
    permitirMultiplesTarifas:
      formData.get("permitirMultiplesTarifas") === "on",
    tarifaMultimedidas:
      sanitizeText(formData.get("tarifaMultimedidas")) || "Precio 1",
    etiquetaUrbano: sanitizeText(formData.get("etiquetaUrbano")) || "3",
    formatoPrecio: parseInteger(formData.get("formatoPrecio"), 6),
    formatoPrecioIva: parseInteger(formData.get("formatoPrecioIva"), 2),
    formatoSubtotales: parseInteger(formData.get("formatoSubtotales"), 4),
    formatoValorIva: parseInteger(formData.get("formatoValorIva"), 3),
    formatoTotal: parseInteger(formData.get("formatoTotal"), 2),
    formatoCosto: parseInteger(formData.get("formatoCosto"), 6),
    formatoCostoSubtotales: parseInteger(
      formData.get("formatoCostoSubtotales"),
      4,
    ),
    formatoCostoTotal: parseInteger(formData.get("formatoCostoTotal"), 2),
    formatoCostoValorIva: parseInteger(formData.get("formatoCostoValorIva"), 4),
    formatoCantidad: parseInteger(formData.get("formatoCantidad"), 1),
  };

  try {
    await prisma.empresa.update({
      where: { id: empresaId },
      data,
    });
  } catch {
    return {
      error: "No se pudieron guardar los parametros de productos.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "Los parametros de productos se guardaron correctamente.",
  };
}
