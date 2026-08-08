"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  uploadFormatoFisicoAction,
  type UploadFormatoFisicoState,
} from "./datos-empresa-actions";

type FormatosFisicosPanelProps = {
  empresaId: number;
  sectionKey?:
    | "datos-empresa"
    | "parametros-productos"
    | "parametros-contables"
    | "parametros-facturacion"
    | "parametros-facturacion-electronica"
    | "parametros-smtp";
  sectionLabel?: string;
  formatos: {
    factura: string;
    retencion: string;
    guiaRemision: string;
    notaCredito: string;
  };
};

const formatosConfig = [
  { key: "factura", label: "Factura Fisica" },
  { key: "retencion", label: "Retencion Fisica" },
  { key: "guiaRemision", label: "Guia Remision Fisica" },
  { key: "notaCredito", label: "Nota Credito Fisica" },
] as const;

export function FormatosFisicosPanel({
  empresaId,
  sectionKey = "datos-empresa",
  sectionLabel = "Datos Empresa",
  formatos,
}: FormatosFisicosPanelProps) {
  const [lastSelectedFile, setLastSelectedFile] = useState("");

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/panel?empresaId=${empresaId}&seccion=${sectionKey}`}
          className="rounded-sm bg-slate-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
        >
          Volver
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
            {sectionLabel}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">
            Cargar formatos fisicos
          </h3>
        </div>
      </div>

      <div className="max-w-[580px] space-y-3">
        {formatosConfig.map((formato) => (
          <FormatoFisicoRow
            key={formato.key}
            empresaId={empresaId}
            formatoKey={formato.key}
            label={formato.label}
            filePath={formatos[formato.key]}
            lastSelectedFile={lastSelectedFile}
            onFileSelected={setLastSelectedFile}
          />
        ))}
      </div>
    </div>
  );
}

function FormatoFisicoRow({
  empresaId,
  formatoKey,
  label,
  filePath,
  lastSelectedFile,
  onFileSelected,
}: {
  empresaId: number;
  formatoKey: "factura" | "retencion" | "guiaRemision" | "notaCredito";
  label: string;
  filePath: string;
  lastSelectedFile: string;
  onFileSelected: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction] = useActionState<UploadFormatoFisicoState, FormData>(
    uploadFormatoFisicoAction,
    {
      error: null,
      success: null,
    },
  );

  const formatoActionKey =
    formatoKey === "guiaRemision"
      ? "guia_remision"
      : formatoKey === "notaCredito"
        ? "nota_credito"
        : formatoKey;

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="empresaId" value={empresaId} />
      <input type="hidden" name="formatoKey" value={formatoActionKey} />
      <input
        ref={inputRef}
        type="file"
        name="archivo"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(event) =>
          onFileSelected(
            event.target.files?.[0]?.name
              ? `${label}: ${event.target.files[0].name}`
              : "",
          )
        }
      />
      <div className="grid grid-cols-[1fr_110px_110px] gap-2">
        <div className="flex items-center border border-slate-800 bg-white px-3 py-2 text-[15px] font-semibold text-slate-800">
          {label}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-none bg-[#dc8d00] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#c67f00]"
        >
          Cargar
        </button>
        {filePath ? (
          <a
            href={filePath}
            download
            className="rounded-none bg-[#dc8d00] px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#c67f00]"
          >
            Descargar
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-none bg-[#efc278] px-3 py-2 text-sm font-semibold text-white"
          >
            Descargar
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 pl-1 text-xs text-slate-500">
        <span>{lastSelectedFile || "Sin archivo seleccionado"}</span>
        {filePath ? <span>Archivo disponible</span> : <span>Aun no cargado</span>}
      </div>
      {state.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.success}
        </div>
      ) : null}
      <div className="pl-1">
        <UploadFormatoButton />
      </div>
    </form>
  );
}

function UploadFormatoButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-[#30404d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#24323d] disabled:cursor-not-allowed disabled:bg-[#81909a]"
    >
      {pending ? "Subiendo..." : "Confirmar carga"}
    </button>
  );
}
