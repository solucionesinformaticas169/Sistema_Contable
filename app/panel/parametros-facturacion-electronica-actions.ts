"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SaveParametrosFacturacionElectronicaState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveParametrosFacturacionElectronicaAction(
  _prevState: SaveParametrosFacturacionElectronicaState,
  formData: FormData,
): Promise<SaveParametrosFacturacionElectronicaState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa activa.",
      success: null,
    };
  }

  try {
    await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        feAmbiente: sanitizeText(formData.get("feAmbiente")) || "Pruebas",
        feTipoAutorizacion:
          sanitizeText(formData.get("feTipoAutorizacion")) ||
          "Autorizacion Offline",
        feNumeroContribuyenteEspecial: sanitizeText(
          formData.get("feNumeroContribuyenteEspecial"),
        ),
        feFechaCaducaCertificado: sanitizeText(
          formData.get("feFechaCaducaCertificado"),
        ),
        feLlevaContabilidad:
          sanitizeText(formData.get("feLlevaContabilidad")) || "SI",
        feTiempoEsperaAutorizacion:
          sanitizeText(formData.get("feTiempoEsperaAutorizacion")) || "3s",
        feTipoFirmador:
          sanitizeText(formData.get("feTipoFirmador")) || "Net",
        feCorreoComprobacion: sanitizeText(
          formData.get("feCorreoComprobacion"),
        ),
        feInformacionFacturas: sanitizeText(
          formData.get("feInformacionFacturas"),
        ),
        feSqlFacturaTipo:
          sanitizeText(formData.get("feSqlFacturaTipo")) || "SQL Estandar",
        feSqlFacturaContenido: sanitizeText(
          formData.get("feSqlFacturaContenido"),
        ),
        feSqlNotaCreditoContenido: sanitizeText(
          formData.get("feSqlNotaCreditoContenido"),
        ),
        feSqlRetencionesContenido: sanitizeText(
          formData.get("feSqlRetencionesContenido"),
        ),
        feSqlGuiaRemisionTipo:
          sanitizeText(formData.get("feSqlGuiaRemisionTipo")) ||
          "Seleccione una Opcion",
        feSqlGuiaRemisionContenido: sanitizeText(
          formData.get("feSqlGuiaRemisionContenido"),
        ),
        feSqlNotaDebitoContenido: sanitizeText(
          formData.get("feSqlNotaDebitoContenido"),
        ),
        feSqlLiquidacionComprasContenido: sanitizeText(
          formData.get("feSqlLiquidacionComprasContenido"),
        ),
      },
    });
  } catch {
    return {
      error:
        "No se pudieron guardar los parametros de facturacion electronica.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success:
      "Los parametros de facturacion electronica se guardaron correctamente.",
  };
}
