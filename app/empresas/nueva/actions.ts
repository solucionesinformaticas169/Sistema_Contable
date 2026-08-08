"use server";

import { Prisma } from "../../../generated/prisma/client";
import { redirect } from "next/navigation";
import { buildNombreDbBase } from "@/lib/empresas";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { buildPrimaryUsuarioData } from "@/lib/usuarios";

export type CreateEmpresaState = {
  error: string | null;
};

export type UpdateEmpresaState = {
  error: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function resolveUniqueNombreDb(razonSocial: string, excludeEmpresaId?: number) {
  const baseName = buildNombreDbBase(razonSocial);
  const existingNames = await prisma.empresa.findMany({
    where: {
      ...(excludeEmpresaId ? { id: { not: excludeEmpresaId } } : {}),
      nombreDb: {
        startsWith: baseName,
      },
    },
    select: {
      nombreDb: true,
    },
  });

  const usedNames = new Set(
    existingNames
      .map((item) => item.nombreDb)
      .filter((item): item is string => Boolean(item)),
  );

  if (!usedNames.has(baseName)) {
    return baseName;
  }

  let suffix = 2;
  while (usedNames.has(`${baseName}_${suffix}`)) {
    suffix += 1;
  }

  return `${baseName}_${suffix}`;
}

export async function createEmpresaAction(
  _prevState: CreateEmpresaState,
  formData: FormData,
): Promise<CreateEmpresaState> {
  const ruc = sanitizeText(formData.get("ruc"));
  const razonSocial = sanitizeText(formData.get("razonSocial"));
  const direccion = sanitizeText(formData.get("direccion"));
  const provincia = sanitizeText(formData.get("provincia"));
  const ciudad = sanitizeText(formData.get("ciudad"));
  const tipoNegocio = sanitizeText(formData.get("tipoNegocio"));
  const whatsapp = sanitizeText(formData.get("whatsapp"));
  const correo = sanitizeText(formData.get("correo"));
  const password = sanitizeText(formData.get("password"));
  const redirectTo = sanitizeText(formData.get("redirectTo")) || "/ingresar";

  if (
    !ruc ||
    !razonSocial ||
    !direccion ||
    !provincia ||
    !ciudad ||
    !tipoNegocio ||
    !whatsapp ||
    !correo ||
    !password
  ) {
    return {
      error:
        "Completa RUC, razon social, direccion, provincia, ciudad, tipo de negocio, whatsapp, correo y contrasena antes de guardar.",
    };
  }

  if (!/^\d{13}$/.test(ruc)) {
    return {
      error: "El RUC debe tener exactamente 13 digitos numericos.",
    };
  }

  if (password.length < 6) {
    return {
      error: "La contrasena debe tener al menos 6 caracteres.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return {
      error: "Ingresa un correo electronico valido.",
    };
  }

  if (!/^\d{10,13}$/.test(whatsapp)) {
    return {
      error: "Ingresa un numero de whatsapp valido de 10 a 13 digitos.",
    };
  }

  let empresaId: number;
  let empresaRuc: string;

  try {
    const nombreDb = await resolveUniqueNombreDb(razonSocial);
    const passwordHash = await hashPassword(password);
    const usuarioBase = buildPrimaryUsuarioData({
      ruc,
      razonSocial,
      correo,
    });
    const empresa = await prisma.$transaction(async (tx) => {
      const empresaDelegate = tx.empresa as unknown as {
        create: (args: { data: Record<string, unknown> }) => Promise<{
          id: number;
          ruc: string;
        }>;
      };
      const createdEmpresa = await empresaDelegate.create({
        data: {
          ruc,
          razonSocial,
          direccion,
          provincia,
          ciudad,
          tipoNegocio,
          whatsapp,
          correo,
          nombreComercial: tipoNegocio,
          telefono1: whatsapp,
          parroquia: ciudad,
          nombreDb,
          passwordHash,
        },
      });

      await tx.usuario.create({
        data: {
          empresaId: createdEmpresa.id,
          identificacion: usuarioBase.identificacion,
          descripcion: usuarioBase.descripcion,
          email: usuarioBase.email,
        },
      });

      return createdEmpresa;
    });
    empresaId = empresa.id;
    empresaRuc = empresa.ruc;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Ya existe una empresa registrada con ese RUC o nombre interno.",
      };
    }

    return {
      error: "No se pudo guardar la empresa en la base de datos.",
    };
  }

  if (redirectTo === "/panel") {
    redirect(`/panel?empresaId=${empresaId}&seccion=gestion-empresas`);
  }

  redirect(`/ingresar?ruc=${empresaRuc}&creada=1`);
}

export async function updateEmpresaAction(
  _prevState: UpdateEmpresaState,
  formData: FormData,
): Promise<UpdateEmpresaState> {
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const empresaId = Number(empresaIdValue);
  const ruc = sanitizeText(formData.get("ruc"));
  const razonSocial = sanitizeText(formData.get("razonSocial"));
  const direccion = sanitizeText(formData.get("direccion"));
  const provincia = sanitizeText(formData.get("provincia"));
  const ciudad = sanitizeText(formData.get("ciudad"));
  const tipoNegocio = sanitizeText(formData.get("tipoNegocio"));
  const whatsapp = sanitizeText(formData.get("whatsapp"));
  const correo = sanitizeText(formData.get("correo"));
  const password = sanitizeText(formData.get("password"));

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa a editar.",
    };
  }

  if (!ruc || !razonSocial || !direccion || !provincia || !ciudad || !tipoNegocio || !whatsapp || !correo) {
    return {
      error:
        "Completa RUC, razon social, direccion, provincia, ciudad, tipo de negocio, whatsapp y correo antes de guardar.",
    };
  }

  if (!/^\d{13}$/.test(ruc)) {
    return {
      error: "El RUC debe tener exactamente 13 digitos numericos.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return {
      error: "Ingresa un correo electronico valido.",
    };
  }

  if (!/^\d{10,13}$/.test(whatsapp)) {
    return {
      error: "Ingresa un numero de whatsapp valido de 10 a 13 digitos.",
    };
  }

  if (password && password.length < 6) {
    return {
      error: "Si deseas cambiar la contrasena, debe tener al menos 6 caracteres.",
    };
  }

  try {
    const nombreDb = await resolveUniqueNombreDb(razonSocial, empresaId);
    const usuarioBase = buildPrimaryUsuarioData({
      ruc,
      razonSocial,
      correo,
    });
    const data: {
      ruc: string;
      razonSocial: string;
      direccion: string;
      provincia: string;
      ciudad: string;
      tipoNegocio: string;
      whatsapp: string;
      correo: string;
      nombreDb: string;
      passwordHash?: string;
    } = {
      ruc,
      razonSocial,
      direccion,
      provincia,
      ciudad,
      tipoNegocio,
      whatsapp,
      correo,
      nombreDb,
    };

    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    await prisma.$transaction(async (tx) => {
      const empresaDelegate = tx.empresa as unknown as {
        update: (args: {
          where: { id: number };
          data: Record<string, unknown>;
        }) => Promise<unknown>;
      };
      await empresaDelegate.update({
        where: { id: empresaId },
        data,
      });

      const totalUsuarios = await tx.usuario.count({
        where: { empresaId },
      });

      if (totalUsuarios === 0) {
        await tx.usuario.create({
          data: {
            empresaId,
            identificacion: usuarioBase.identificacion,
            descripcion: usuarioBase.descripcion,
            email: usuarioBase.email,
          },
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Ya existe otra empresa registrada con ese RUC o nombre interno.",
      };
    }

    return {
      error: "No se pudo actualizar la empresa en la base de datos.",
    };
  }

  redirect(`/panel?empresaId=${empresaId}&seccion=gestion-empresas`);
}
