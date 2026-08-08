"use server";

import { Prisma } from "../../generated/prisma/client";
import { redirect } from "next/navigation";
import {
  buildPermissionKey,
  permissionActions,
  permissionCatalog,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type SaveUsuarioState = {
  error: string | null;
};

export type SaveUsuarioPermisosState = {
  error: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveUsuarioAction(
  _prevState: SaveUsuarioState,
  formData: FormData,
): Promise<SaveUsuarioState> {
  const usuarioIdValue = sanitizeText(formData.get("usuarioId"));
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const identificacion = sanitizeText(formData.get("identificacion"));
  const descripcion = sanitizeText(formData.get("descripcion"));
  const email = sanitizeText(formData.get("email"));

  const empresaId = Number(empresaIdValue);
  const usuarioId = usuarioIdValue ? Number(usuarioIdValue) : null;

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se encontro una empresa activa para registrar usuarios.",
    };
  }

  if (!identificacion || !descripcion || !email) {
    return {
      error: "Completa identificacion, descripcion y email antes de guardar.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: "Ingresa un correo electronico valido.",
    };
  }

  try {
    if (usuarioId && Number.isInteger(usuarioId) && usuarioId > 0) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          identificacion,
          descripcion,
          email,
        },
      });
    } else {
      await prisma.usuario.create({
        data: {
          empresaId,
          identificacion,
          descripcion,
          email,
        },
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Ya existe un usuario con esa identificacion dentro de esta empresa.",
      };
    }

    return {
      error: "No se pudo guardar el usuario en la base de datos.",
    };
  }

  redirect(`/panel?empresaId=${empresaId}&seccion=usuarios`);
}

export async function toggleUsuarioActivoAction(formData: FormData) {
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const usuarioIdValue = sanitizeText(formData.get("usuarioId"));

  const empresaId = Number(empresaIdValue);
  const usuarioId = Number(usuarioIdValue);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return;
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { activo: true },
  });

  if (!usuario) {
    return;
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      activo: !usuario.activo,
    },
  });

  redirect(`/panel?empresaId=${empresaId}&seccion=usuarios`);
}

export async function saveUsuarioPermisosAction(
  _prevState: SaveUsuarioPermisosState,
  formData: FormData,
): Promise<SaveUsuarioPermisosState> {
  const empresaIdValue = sanitizeText(formData.get("empresaId"));
  const usuarioIdValue = sanitizeText(formData.get("usuarioId"));

  const empresaId = Number(empresaIdValue);
  const usuarioId = Number(usuarioIdValue);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se encontro una empresa activa para guardar permisos.",
    };
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return {
      error: "No se encontro el usuario para editar permisos.",
    };
  }

  const permissionRows = permissionCatalog.flatMap((group) =>
    group.pages.map((page) => {
      const paginaKey = buildPermissionKey(group.category, page);

      return {
        usuarioId,
        paginaKey,
        categoria: group.category,
        pagina: page,
        visualizar: formData.get(`${paginaKey}__visualizar`) === "on",
        agregar: formData.get(`${paginaKey}__agregar`) === "on",
        modificar: formData.get(`${paginaKey}__modificar`) === "on",
        eliminar: formData.get(`${paginaKey}__eliminar`) === "on",
        verCosto: formData.get(`${paginaKey}__verCosto`) === "on",
      };
    }),
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.usuarioPermiso.deleteMany({
        where: { usuarioId },
      });

      if (permissionRows.length > 0) {
        await tx.usuarioPermiso.createMany({
          data: permissionRows,
        });
      }
    });
  } catch {
    return {
      error: "No se pudieron guardar los permisos del usuario.",
    };
  }

  redirect(
    `/panel?empresaId=${empresaId}&seccion=usuarios&editarPermisosUsuarioId=${usuarioId}`,
  );
}
