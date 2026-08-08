"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SaveParametrosFacturacionState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveParametrosFacturacionAction(
  _prevState: SaveParametrosFacturacionState,
  formData: FormData,
): Promise<SaveParametrosFacturacionState> {
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
        obligarCupoCredito: formData.get("obligarCupoCredito") === "on",
        obligarAperturaCaja: formData.get("obligarAperturaCaja") === "on",
        ingresarClaveFacturadorUnaVez:
          formData.get("ingresarClaveFacturadorUnaVez") === "on",
        visualizarComboVendedores:
          formData.get("visualizarComboVendedores") === "on",
        controlarSaldosVencidos:
          formData.get("controlarSaldosVencidos") === "on",
        verTotalSinDescuento: formData.get("verTotalSinDescuento") === "on",
        verTotalConDescuento: formData.get("verTotalConDescuento") === "on",
        porcentajeInteres: sanitizeText(formData.get("porcentajeInteres")),
        tipoDescuentoAsignado:
          sanitizeText(formData.get("tipoDescuentoAsignado")) || "producto",
        permitirEntregasParciales:
          formData.get("permitirEntregasParciales") === "on",
        permitirServiciosGuias:
          formData.get("permitirServiciosGuias") === "on",
        lotesDescontarAutomatico:
          formData.get("lotesDescontarAutomatico") === "on",
        ocultarFechasControlLotes:
          formData.get("ocultarFechasControlLotes") === "on",
        envioAutomaticoOffline:
          formData.get("envioAutomaticoOffline") === "on",
        enviarMailCobroCliente:
          formData.get("enviarMailCobroCliente") === "on",
        enviarMailPagoProveedor:
          formData.get("enviarMailPagoProveedor") === "on",
        verSaldosEstadoCartera:
          formData.get("verSaldosEstadoCartera") === "on",
        aprobarPagosDosPasos: formData.get("aprobarPagosDosPasos") === "on",
        crmClientesAgrupados: formData.get("crmClientesAgrupados") === "on",
        afectarChequesCupoCredito:
          formData.get("afectarChequesCupoCredito") === "on",
        obligaSeleccionarMesas:
          formData.get("obligaSeleccionarMesas") === "on",
        controlaCocina: formData.get("controlaCocina") === "on",
        restauranteCocina:
          sanitizeText(formData.get("restauranteCocina")) || "General",
        restauranteBar:
          sanitizeText(formData.get("restauranteBar")) || "General",
        restauranteGrill:
          sanitizeText(formData.get("restauranteGrill")) || "General",
      },
    });
  } catch {
    return {
      error: "No se pudieron guardar los parametros de facturacion.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "Los parametros de facturacion se guardaron correctamente.",
  };
}
