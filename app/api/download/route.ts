import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

const DOWNLOADABLE_FILES = {
  "importar-clientes.xlsx": {
    diskName: "importar-clientes.xlsx",
    downloadName: "Importar Clientes.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "listado-clientes-prospectos.xlsx": {
    diskName: "listado-clientes-prospectos.xlsx",
    downloadName: "Listado clientes_prospectos.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "listado-clientes.xlsx": {
    diskName: "listado-clientes.xlsx",
    downloadName: "Listado Clientes.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
} as const;

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file");

  if (!file || !(file in DOWNLOADABLE_FILES)) {
    return NextResponse.json(
      { error: "Archivo no disponible para descarga." },
      { status: 404 },
    );
  }

  const selectedFile = DOWNLOADABLE_FILES[file as keyof typeof DOWNLOADABLE_FILES];
  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    selectedFile.diskName,
  );

  try {
    const fileBuffer = await readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": selectedFile.contentType,
        "Content-Disposition": `attachment; filename="${selectedFile.downloadName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo solicitado." },
      { status: 500 },
    );
  }
}
