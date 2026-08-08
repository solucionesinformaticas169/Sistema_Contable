"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export type LoginState = {
  error: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginEmpresaAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const accessId = sanitizeText(formData.get("accessId"));
  const password = sanitizeText(formData.get("password"));

  if (!accessId || !password) {
    return {
      error: "Ingresa el RUC o la identificacion y la contrasena para continuar.",
    };
  }

  const empresaByRuc = await prisma.empresa.findUnique({
    where: { ruc: accessId },
  });

  const usuario = empresaByRuc
    ? null
    : await prisma.usuario.findFirst({
        where: {
          identificacion: accessId,
          activo: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });

  const empresa = empresaByRuc
    ? empresaByRuc
    : usuario
      ? await prisma.empresa.findUnique({
          where: { id: usuario.empresaId },
        })
      : null;

  if (!empresa) {
    return {
      error: "No existe una empresa o usuario registrado con ese dato de acceso.",
    };
  }

  if (!empresa.passwordHash) {
    return {
      error: "Esta empresa no tiene contrasena inicial configurada todavia.",
    };
  }

  const isValidPassword = await verifyPassword(password, empresa.passwordHash);

  if (!isValidPassword) {
    return {
      error: "La contrasena ingresada no es correcta.",
    };
  }

  redirect(`/panel?empresaId=${empresa.id}&seccion=gestion-empresas`);
}
