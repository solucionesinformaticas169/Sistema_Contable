"use server";

import { Prisma } from "../../generated/prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type SaveSucursalState = {
  error: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveSucursalAction(
  _prevState: SaveSucursalState,
  formData: FormData,
): Promise<SaveSucursalState> {
  const sucursalIdValue = sanitizeText(formData.get("sucursalId"));
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const nombre = sanitizeText(formData.get("nombre"));
  const tipo = sanitizeText(formData.get("tipo")) || "agencia";
  const identificacion = sanitizeText(formData.get("identificacion"));
  const razonSocial = sanitizeText(formData.get("razonSocial"));
  const telefono1 = sanitizeText(formData.get("telefono1"));
  const telefono2 = sanitizeText(formData.get("telefono2"));
  const metaVenta = sanitizeText(formData.get("metaVenta"));
  const comisionProduccion = sanitizeText(formData.get("comisionProduccion"));
  const comisionDistribucion = sanitizeText(
    formData.get("comisionDistribucion"),
  );
  const ciudad = sanitizeText(formData.get("ciudad"));
  const parroquia = sanitizeText(formData.get("parroquia"));
  const direccion = sanitizeText(formData.get("direccion"));
  const estado = sanitizeText(formData.get("estado"));
  const activo = estado !== "inactivo-oculto";
  const visible = estado === "activo-visible";
  const responsable = razonSocial;

  const empresaId = Number(empresaIdValue);
  const sucursalId = sucursalIdValue ? Number(sucursalIdValue) : null;

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se encontro una empresa activa para registrar sucursales.",
    };
  }

  if (!nombre) {
    return {
      error: "Completa el nombre de la sucursal antes de guardar.",
    };
  }

  try {
    if (sucursalId && Number.isInteger(sucursalId) && sucursalId > 0) {
      await prisma.sucursal.update({
        where: { id: sucursalId },
        data: {
          nombre,
          tipo,
          identificacion,
          razonSocial,
          telefono1,
          telefono2,
          metaVenta,
          comisionProduccion,
          comisionDistribucion,
          parroquia,
          responsable,
          ciudad,
          direccion,
          activo,
          visible,
        },
      });
    } else {
      await prisma.sucursal.create({
        data: {
          empresaId,
          nombre,
          tipo,
          identificacion,
          razonSocial,
          telefono1,
          telefono2,
          metaVenta,
          comisionProduccion,
          comisionDistribucion,
          parroquia,
          responsable,
          ciudad,
          direccion,
          activo,
          visible,
        },
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Ya existe una sucursal con ese nombre dentro de esta empresa.",
      };
    }

    return {
      error: "No se pudo guardar la sucursal en la base de datos.",
    };
  }

  redirect(`/panel?empresaId=${empresaId}&seccion=administrador-sucursales`);
}

export async function toggleSucursalActivoAction(formData: FormData) {
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const sucursalIdValue = sanitizeText(formData.get("sucursalId"));

  const empresaId = Number(empresaIdValue);
  const sucursalId = Number(sucursalIdValue);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return;
  }

  if (!Number.isInteger(sucursalId) || sucursalId <= 0) {
    return;
  }

  const sucursal = await prisma.sucursal.findUnique({
    where: { id: sucursalId },
    select: { activo: true, visible: true },
  });

  if (!sucursal) {
    return;
  }

  const nextActive = !sucursal.activo;

  await prisma.sucursal.update({
    where: { id: sucursalId },
    data: {
      activo: nextActive,
      visible: nextActive,
    },
  });

  redirect(`/panel?empresaId=${empresaId}&seccion=administrador-sucursales`);
}
