"use server";

import { revalidatePath } from "next/cache";
import path from "node:path";
import { unlink, writeFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";

export type SaveDatosEmpresaState = {
  error: string | null;
  success: string | null;
};

export type UploadLogoEmpresaState = {
  error: string | null;
  success: string | null;
};

export type UploadFormatoFisicoState = {
  error: string | null;
  success: string | null;
};

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getEmpresaDelegate() {
  return prisma.empresa as unknown as {
    findUnique: (args: {
      where: { id: number };
      select: Record<string, boolean>;
    }) => Promise<Record<string, unknown> | null>;
    update: (args: {
      where: { id: number };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
}

export async function saveDatosEmpresaAction(
  _prevState: SaveDatosEmpresaState,
  formData: FormData,
): Promise<SaveDatosEmpresaState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));
  const tipoIdentificacion = sanitizeText(formData.get("tipoIdentificacion"));
  const identificacion = sanitizeText(formData.get("identificacion"));
  const razonSocial = sanitizeText(formData.get("razonSocial"));
  const nombreComercial = sanitizeText(formData.get("nombreComercial"));
  const direccion = sanitizeText(formData.get("direccion"));
  const correo = sanitizeText(formData.get("correo"));
  const telefono1 = sanitizeText(formData.get("telefono1"));
  const telefono2 = sanitizeText(formData.get("telefono2"));
  const telefono3 = sanitizeText(formData.get("telefono3"));
  const representanteIdentificacion = sanitizeText(
    formData.get("representanteIdentificacion"),
  );
  const representanteLegal = sanitizeText(formData.get("representanteLegal"));
  const contadorIdentificacion = sanitizeText(
    formData.get("contadorIdentificacion"),
  );
  const contador = sanitizeText(formData.get("contador"));
  const agenteRetencion = sanitizeText(formData.get("agenteRetencion"));
  const tipoRegimen = sanitizeText(formData.get("tipoRegimen"));
  const provincia = sanitizeText(formData.get("provincia"));
  const ciudad = sanitizeText(formData.get("ciudad"));
  const parroquia = sanitizeText(formData.get("parroquia"));
  const realizaAts = formData.get("realizaAts") === "on";

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa activa.",
      success: null,
    };
  }

  if (
    !tipoIdentificacion ||
    !identificacion ||
    !razonSocial ||
    !nombreComercial ||
    !direccion ||
    !correo ||
    !provincia ||
    !ciudad
  ) {
    return {
      error:
        "Completa tipo, identificacion, razon social, nombre comercial, direccion, correo, provincia y ciudad antes de guardar.",
      success: null,
    };
  }

  if (tipoIdentificacion === "RUC" && !/^\d{13}$/.test(identificacion)) {
    return {
      error: "La identificacion tipo RUC debe tener exactamente 13 digitos.",
      success: null,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return {
      error: "Ingresa un correo electronico valido.",
      success: null,
    };
  }

  for (const telefono of [telefono1, telefono2, telefono3]) {
    if (telefono && !/^\d{7,13}$/.test(telefono)) {
      return {
        error: "Los telefonos deben contener entre 7 y 13 digitos numericos.",
        success: null,
      };
    }
  }

  try {
    const empresaDelegate = getEmpresaDelegate();
    await empresaDelegate.update({
      where: { id: empresaId },
      data: {
        ruc: identificacion,
        razonSocial,
        nombreComercial,
        direccion,
        correo,
        telefono1,
        telefono2,
        telefono3,
        representanteIdentificacion,
        representanteLegal,
        contadorIdentificacion,
        contador,
        agenteRetencion: agenteRetencion || "Ninguno",
        tipoRegimen: tipoRegimen || "GENERAL",
        realizaAts,
        provincia,
        ciudad,
        parroquia,
        tipoNegocio: nombreComercial,
        whatsapp: telefono1,
      },
    });
  } catch {
    return {
      error: "No se pudieron guardar los datos de la empresa.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "Los datos de la empresa se guardaron correctamente.",
  };
}

export async function uploadEmpresaLogoAction(
  _prevState: UploadLogoEmpresaState,
  formData: FormData,
): Promise<UploadLogoEmpresaState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));
  const file = formData.get("logo");

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa para subir el logo.",
      success: null,
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Selecciona un archivo de logo antes de enviar.",
      success: null,
    };
  }

  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
    return {
      error: "El logo debe ser PNG, JPG, WEBP o SVG.",
      success: null,
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return {
      error: "El logo no debe superar 2 MB.",
      success: null,
    };
  }

  const empresaActual = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: {
      logoPath: true,
      nombreDb: true,
      razonSocial: true,
    },
  });

  if (!empresaActual) {
    return {
      error: "La empresa activa no existe.",
      success: null,
    };
  }

  const extension = path.extname(file.name).toLowerCase() || ".png";
  const baseName = normalizeFileName(
    empresaActual.nombreDb || empresaActual.razonSocial || `empresa-${empresaId}`,
  );
  const fileName = `${baseName}-${Date.now()}${extension}`;
  const relativePath = `/uploads/logos/${fileName}`;
  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "logos",
    fileName,
  );
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(absolutePath, buffer);

    const empresaDelegate = getEmpresaDelegate();

    await empresaDelegate.update({
      where: { id: empresaId },
      data: {
        logoPath: relativePath,
      },
    });

    if (empresaActual.logoPath) {
      const previousPath = path.join(
        process.cwd(),
        "public",
        empresaActual.logoPath.replace(/^\//, "").replace(/\//g, path.sep),
      );

      if (previousPath !== absolutePath) {
        await unlink(previousPath).catch(() => undefined);
      }
    }
  } catch {
    return {
      error: "No se pudo subir el logo de la empresa.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "El logo de la empresa se subio correctamente.",
  };
}

const formatoFieldMap = {
  factura: "formatoFacturaPath",
  retencion: "formatoRetencionPath",
  guia_remision: "formatoGuiaRemisionPath",
  nota_credito: "formatoNotaCreditoPath",
} as const;

type FormatoKey = keyof typeof formatoFieldMap;

export async function uploadFormatoFisicoAction(
  _prevState: UploadFormatoFisicoState,
  formData: FormData,
): Promise<UploadFormatoFisicoState> {
  const empresaId = Number(sanitizeText(formData.get("empresaId")));
  const formatoKey = sanitizeText(formData.get("formatoKey")) as FormatoKey;
  const file = formData.get("archivo");

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return {
      error: "No se pudo identificar la empresa para subir el formato.",
      success: null,
    };
  }

  if (!(formatoKey in formatoFieldMap)) {
    return {
      error: "No se pudo identificar el tipo de formato fisico.",
      success: null,
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Selecciona un archivo antes de cargar el formato.",
      success: null,
    };
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      error: "El formato debe ser PDF, DOC, DOCX, PNG, JPG o WEBP.",
      success: null,
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      error: "El formato no debe superar 5 MB.",
      success: null,
    };
  }

  const storageField = formatoFieldMap[formatoKey];
  const empresaDelegate = getEmpresaDelegate();
  const empresaActual = (await empresaDelegate.findUnique({
    where: { id: empresaId },
    select: {
      [storageField]: true,
      nombreDb: true,
      razonSocial: true,
    },
  })) as
    | {
        [key: string]: unknown;
        nombreDb?: string;
        razonSocial?: string;
      }
    | null;

  if (!empresaActual) {
    return {
      error: "La empresa activa no existe.",
      success: null,
    };
  }

  const extension = path.extname(file.name).toLowerCase() || ".pdf";
  const baseName = normalizeFileName(
    empresaActual.nombreDb || empresaActual.razonSocial || `empresa-${empresaId}`,
  );
  const fileName = `${baseName}-${formatoKey}-${Date.now()}${extension}`;
  const relativePath = `/uploads/formatos/${fileName}`;
  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "formatos",
    fileName,
  );
  const buffer = Buffer.from(await file.arrayBuffer());
  const previousStoredPath =
    typeof empresaActual[storageField] === "string" ? empresaActual[storageField] : "";

  try {
    await writeFile(absolutePath, buffer);

    await empresaDelegate.update({
      where: { id: empresaId },
      data: {
        [storageField]: relativePath,
      },
    });

    if (previousStoredPath) {
      const previousPath = path.join(
        process.cwd(),
        "public",
        previousStoredPath.replace(/^\//, "").replace(/\//g, path.sep),
      );

      if (previousPath !== absolutePath) {
        await unlink(previousPath).catch(() => undefined);
      }
    }
  } catch {
    return {
      error: "No se pudo cargar el formato fisico.",
      success: null,
    };
  }

  revalidatePath("/panel");

  return {
    error: null,
    success: "El formato fisico se cargo correctamente.",
  };
}
