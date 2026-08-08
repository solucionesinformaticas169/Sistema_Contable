"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SaveParametrosSmtpState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveParametrosSmtpAction(
  _prevState: SaveParametrosSmtpState,
  formData: FormData,
): Promise<SaveParametrosSmtpState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa activa.",
      success: null,
    };
  }

  const smtpServidor =
    sanitizeText(formData.get("smtpServidor")) || "smtp.zeptomail.com";
  const smtpUsuario =
    sanitizeText(formData.get("smtpUsuario")) || "emailapikey";
  const smtpCorreoRemitente =
    sanitizeText(formData.get("smtpCorreoRemitente")) ||
    "noresponder@perseo.ec";
  const smtpPuerto = sanitizeText(formData.get("smtpPuerto")) || "587";
  const smtpClave = sanitizeText(formData.get("smtpClave"));
  const smtpClaveVerificacion = sanitizeText(
    formData.get("smtpClaveVerificacion"),
  );

  if (!smtpServidor || !smtpUsuario || !smtpCorreoRemitente || !smtpPuerto) {
    return {
      error: "Completa todos los campos SMTP antes de guardar.",
      success: null,
    };
  }

  if (smtpClave || smtpClaveVerificacion) {
    if (!smtpClave || !smtpClaveVerificacion) {
      return {
        error: "Completa la contrasena y la verificacion antes de guardar.",
        success: null,
      };
    }

    if (smtpClave !== smtpClaveVerificacion) {
      return {
        error: "La contrasena SMTP y su verificacion no coinciden.",
        success: null,
      };
    }
  }

  try {
    await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        smtpServidor,
        smtpUsuario,
        smtpCorreoRemitente,
        smtpPuerto,
        ...(smtpClave ? { smtpClave } : {}),
      },
    });
  } catch {
    return {
      error: "No se pudieron guardar los parametros SMTP.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "Los parametros SMTP se guardaron correctamente.",
  };
}
