"use server";

import { Prisma } from "../../generated/prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type SaveIntegracionState = {
  error: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveIntegracionAction(
  _prevState: SaveIntegracionState,
  formData: FormData,
): Promise<SaveIntegracionState> {
  const integracionIdValue = sanitizeText(formData.get("integracionId"));
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const descripcion = sanitizeText(formData.get("descripcion"));
  const tipo = sanitizeText(formData.get("tipo")) || "SMTP";
  const servidor = sanitizeText(formData.get("servidor"));
  const usuario = sanitizeText(formData.get("usuario"));
  const contrasena = sanitizeText(formData.get("contrasena"));
  const puerto = sanitizeText(formData.get("puerto"));

  const empresaId = Number(empresaIdValue);
  const integracionId = integracionIdValue ? Number(integracionIdValue) : null;

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se encontro una empresa activa para registrar integraciones.",
    };
  }

  if (!descripcion) {
    return {
      error: "Completa la descripcion antes de guardar.",
    };
  }

  try {
    if (integracionId && Number.isInteger(integracionId) && integracionId > 0) {
      await prisma.integracion.update({
        where: { id: integracionId },
        data: {
          descripcion,
          tipo,
          servidor,
          usuario,
          contrasena,
          puerto,
        },
      });
    } else {
      await prisma.integracion.create({
        data: {
          empresaId,
          descripcion,
          tipo,
          servidor,
          usuario,
          contrasena,
          puerto,
        },
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Ya existe una integracion con esa descripcion dentro de esta empresa.",
      };
    }

    return {
      error: "No se pudo guardar la integracion en la base de datos.",
    };
  }

  redirect(`/panel?empresaId=${empresaId}&seccion=integraciones`);
}

export async function toggleIntegracionActivaAction(formData: FormData) {
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const integracionIdValue = sanitizeText(formData.get("integracionId"));

  const empresaId = Number(empresaIdValue);
  const integracionId = Number(integracionIdValue);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return;
  }

  if (!Number.isInteger(integracionId) || integracionId <= 0) {
    return;
  }

  const integracion = await prisma.integracion.findUnique({
    where: { id: integracionId },
    select: { activo: true },
  });

  if (!integracion) {
    return;
  }

  await prisma.integracion.update({
    where: { id: integracionId },
    data: {
      activo: !integracion.activo,
    },
  });

  redirect(`/panel?empresaId=${empresaId}&seccion=integraciones`);
}
