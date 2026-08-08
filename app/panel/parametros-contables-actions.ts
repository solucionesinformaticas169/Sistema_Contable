"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SaveParametrosContablesState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveParametrosContablesAction(
  _prevState: SaveParametrosContablesState,
  formData: FormData,
): Promise<SaveParametrosContablesState> {
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
        generaAsientosContables:
          sanitizeText(formData.get("generaAsientosContables")) !== "no",
        tipoModificacionAsientos:
          sanitizeText(formData.get("tipoModificacionAsientos")) || "eliminar",
        centrosCostos: formData.get("centrosCostos") === "on",
        productosSinIvaInventarioCodigo:
          sanitizeText(formData.get("productosSinIvaInventarioCodigo")) ||
          "1.1.03.01.02",
        productosSinIvaInventarioNombre:
          sanitizeText(formData.get("productosSinIvaInventarioNombre")) ||
          "Inventarios De Prod. Terminados Sin Iva",
        productosSinIvaVentasCodigo:
          sanitizeText(formData.get("productosSinIvaVentasCodigo")) || "4.1.01.02",
        productosSinIvaVentasNombre:
          sanitizeText(formData.get("productosSinIvaVentasNombre")) ||
          "Ventas Bienes Sin Iva",
        productosSinIvaCostoCodigo:
          sanitizeText(formData.get("productosSinIvaCostoCodigo")) ||
          "5.1.01.01.02",
        productosSinIvaCostoNombre:
          sanitizeText(formData.get("productosSinIvaCostoNombre")) ||
          "Costo De Ventas Mercaderia Sin Iva",
        productosConIvaInventarioCodigo:
          sanitizeText(formData.get("productosConIvaInventarioCodigo")) ||
          "1.1.03.01.01",
        productosConIvaInventarioNombre:
          sanitizeText(formData.get("productosConIvaInventarioNombre")) ||
          "Inventarios De Prod. Terminados Con Iva",
        productosConIvaVentasCodigo:
          sanitizeText(formData.get("productosConIvaVentasCodigo")) || "4.1.01.01",
        productosConIvaVentasNombre:
          sanitizeText(formData.get("productosConIvaVentasNombre")) ||
          "Ventas Bienes Con Iva",
        productosConIvaCostoCodigo:
          sanitizeText(formData.get("productosConIvaCostoCodigo")) ||
          "5.1.01.01.01",
        productosConIvaCostoNombre:
          sanitizeText(formData.get("productosConIvaCostoNombre")) ||
          "Costo De Ventas Mercaderia Con Iva",
        tipoContabilizacionIngresos:
          sanitizeText(formData.get("tipoContabilizacionIngresos")) ||
          "no_contabilizar",
        tipoContabilizacionSalidas:
          sanitizeText(formData.get("tipoContabilizacionSalidas")) ||
          "no_contabilizar",
        ccCajasCodigo: sanitizeText(formData.get("ccCajasCodigo")) || "1.1.01.01.01",
        ccCajasNombre: sanitizeText(formData.get("ccCajasNombre")) || "Caja General",
        ccBancosCodigo:
          sanitizeText(formData.get("ccBancosCodigo")) || "1.1.01.02.01",
        ccBancosNombre:
          sanitizeText(formData.get("ccBancosNombre")) || "Banco Pichincha",
        ccClientesCodigo:
          sanitizeText(formData.get("ccClientesCodigo")) || "1.1.02.05.01",
        ccClientesNombre: sanitizeText(formData.get("ccClientesNombre")) || "Clientes",
        ccProveedoresCodigo:
          sanitizeText(formData.get("ccProveedoresCodigo")) || "2.1.03.01.01",
        ccProveedoresNombre:
          sanitizeText(formData.get("ccProveedoresNombre")) || "Proveedores Locales",
        ccRecepcionesCodigo:
          sanitizeText(formData.get("ccRecepcionesCodigo")) || "1.1.03.01.06",
        ccRecepcionesNombre:
          sanitizeText(formData.get("ccRecepcionesNombre")) ||
          "Inventario Transitorio Recepciones de Compras",
        ccIvaComprasCodigo:
          sanitizeText(formData.get("ccIvaComprasCodigo")) || "1.1.05.01.01",
        ccIvaComprasNombre:
          sanitizeText(formData.get("ccIvaComprasNombre")) || "Iva En Compras",
        ccIvaPresuntivoCodigo:
          sanitizeText(formData.get("ccIvaPresuntivoCodigo")) || "1.1.05.01.01",
        ccIvaPresuntivoNombre:
          sanitizeText(formData.get("ccIvaPresuntivoNombre")) || "Iva En Compras",
        ccIrPresuntivoCodigo:
          sanitizeText(formData.get("ccIrPresuntivoCodigo")) || "1.1.05.01.01",
        ccIrPresuntivoNombre:
          sanitizeText(formData.get("ccIrPresuntivoNombre")) || "Iva En Compras",
        ccIceComprasCodigo:
          sanitizeText(formData.get("ccIceComprasCodigo")) || "5.3.01.20.08",
        ccIceComprasNombre:
          sanitizeText(formData.get("ccIceComprasNombre")) ||
          "Ga- Impuesto Consumos Especiales Ice",
        ccAsumeRetCodigo:
          sanitizeText(formData.get("ccAsumeRetCodigo")) || "5.2.01.27.12",
        ccAsumeRetNombre:
          sanitizeText(formData.get("ccAsumeRetNombre")) ||
          "Gv - Gastos Retenciones Asumidas",
        ccIvaVentasCodigo:
          sanitizeText(formData.get("ccIvaVentasCodigo")) || "2.1.07.01.02.01",
        ccIvaVentasNombre:
          sanitizeText(formData.get("ccIvaVentasNombre")) ||
          "Iva En Ventas O Servicios",
        ccIceVentasCodigo:
          sanitizeText(formData.get("ccIceVentasCodigo")) || "2.1.07.01.04.01",
        ccIceVentasNombre:
          sanitizeText(formData.get("ccIceVentasNombre")) || "ICE En Ventas",
        ccPropinaVentasCodigo:
          sanitizeText(formData.get("ccPropinaVentasCodigo")) || "2.1.09.02.99",
        ccPropinaVentasNombre:
          sanitizeText(formData.get("ccPropinaVentasNombre")) ||
          "Otras Cuentas Por Pagar Propinas",
        ccInteresVentasCodigo:
          sanitizeText(formData.get("ccInteresVentasCodigo")) || "4.2.01.99",
        ccInteresVentasNombre:
          sanitizeText(formData.get("ccInteresVentasNombre")) ||
          "Intereses Diferidos",
        tipoContabilizacionCajas:
          sanitizeText(formData.get("tipoContabilizacionCajas")) ||
          "no_contabilizar",
        tipoContabilizacionBancos:
          sanitizeText(formData.get("tipoContabilizacionBancos")) ||
          "no_contabilizar",
        tipoContabilizacionCompras:
          sanitizeText(formData.get("tipoContabilizacionCompras")) ||
          "no_contabilizar",
        tipoContabilizacionVentas:
          sanitizeText(formData.get("tipoContabilizacionVentas")) ||
          "no_contabilizar",
        cobrosAnticiposCodigo:
          sanitizeText(formData.get("cobrosAnticiposCodigo")) || "2.1.10.01.01",
        cobrosAnticiposNombre:
          sanitizeText(formData.get("cobrosAnticiposNombre")) ||
          "Anticipo De Cliente Cobro Cartera",
        cobrosCruceCodigo:
          sanitizeText(formData.get("cobrosCruceCodigo")) || "1.1.02.05.04",
        cobrosCruceNombre:
          sanitizeText(formData.get("cobrosCruceNombre")) ||
          "Transitoria Cruce Clientes (Siempre Cero)",
        cobrosRetAtrasadaCodigo:
          sanitizeText(formData.get("cobrosRetAtrasadaCodigo")) || "1.1.02.05.01",
        cobrosRetAtrasadaNombre:
          sanitizeText(formData.get("cobrosRetAtrasadaNombre")) || "Clientes",
        tipoContabilidadCobros:
          sanitizeText(formData.get("tipoContabilidadCobros")) ||
          "no_contabilizar",
        pagosAnticiposCodigo:
          sanitizeText(formData.get("pagosAnticiposCodigo")) || "1.1.04.03.03",
        pagosAnticiposNombre:
          sanitizeText(formData.get("pagosAnticiposNombre")) ||
          "Anticipo Otros Proveedores",
        pagosCruceCodigo:
          sanitizeText(formData.get("pagosCruceCodigo")) || "2.1.03.01.03",
        pagosCruceNombre:
          sanitizeText(formData.get("pagosCruceNombre")) ||
          "Transitoria Cruce Proveedores (Siempre Cero)",
        tipoContabilidadPagos:
          sanitizeText(formData.get("tipoContabilidadPagos")) ||
          "no_contabilizar",
        cajaTransitoriaCodigo:
          sanitizeText(formData.get("cajaTransitoriaCodigo")) || "1.1.01.01.05",
        cajaTransitoriaNombre:
          sanitizeText(formData.get("cajaTransitoriaNombre")) ||
          "Transferencias Internas (Cero)",
        bancosTransitoriaCodigo:
          sanitizeText(formData.get("bancosTransitoriaCodigo")) || "1.1.01.01.05",
        bancosTransitoriaNombre:
          sanitizeText(formData.get("bancosTransitoriaNombre")) ||
          "Transferencias Internas (Cero)",
        vouchersComisionCodigo:
          sanitizeText(formData.get("vouchersComisionCodigo")) || "5.2.01.27.04",
        vouchersComisionNombre:
          sanitizeText(formData.get("vouchersComisionNombre")) ||
          "Gv - Comisiones Tarjetas De Credito",
        tipoContabilizacionDepositos:
          sanitizeText(formData.get("tipoContabilizacionDepositos")) ||
          "no_contabilizar",
        nominaSueldoBasico: sanitizeText(formData.get("nominaSueldoBasico")),
        tipoContabilidadNomina:
          sanitizeText(formData.get("tipoContabilidadNomina")) ||
          "departamentos",
      },
    });
  } catch {
    return {
      error: "No se pudieron guardar los parametros contables.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "Los parametros contables se guardaron correctamente.",
  };
}
