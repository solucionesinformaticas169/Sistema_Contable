"use client";

import { useEffect, useMemo, useState } from "react";

type VentasAutorizarDocumentosPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
  };
};

type DocumentType =
  | "Facturas"
  | "Retenciones"
  | "Notas de Credito"
  | "Guias de Remision"
  | "Notas de Debito"
  | "Liquidacion Compras";

type DocumentStatus = "Por Autorizar" | "Autorizados";

type AuthorizationRow = {
  id: string;
  selected: boolean;
  tipo: DocumentType;
  enviado: boolean;
  emision: string;
  serie: string;
  secuencia: string;
  cliente: string;
  importe: number;
  error: string;
  estado: DocumentStatus;
  correoEnviado: boolean;
};

type PanelForm = {
  tipoDocumento: DocumentType;
  estadoDocumento: DocumentStatus;
  fechaDesde: string;
  fechaHasta: string;
  rangoRapido: string;
  enviarCorreo: boolean;
  rows: AuthorizationRow[];
};

const STORAGE_KEY_PREFIX = "ventas-autorizar-documentos-draft";

const baseButtonClass =
  "inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition";

const buttonColors: Record<string, string> = {
  Consultar: "bg-[#f39a1f] hover:bg-[#de8d1f]",
  Todos: "bg-[#1db81d] hover:bg-[#16a016]",
  Autorizar: "bg-[#188a73] hover:bg-[#14735f]",
  Opciones: "bg-[#243746] hover:bg-[#1b2935]",
  LogsAutorizacionSRI: "bg-[#f39a1f] hover:bg-[#de8d1f]",
  CargarAutorizacionSRI: "bg-[#f39a1f] hover:bg-[#de8d1f]",
};

function createDefaultRows(empresa: string): AuthorizationRow[] {
  return [
    {
      id: "auth-1",
      selected: false,
      tipo: "Facturas",
      enviado: false,
      emision: "09/08/2026",
      serie: "001-001",
      secuencia: "000000125",
      cliente: empresa,
      importe: 182.5,
      error: "Pendiente de revision previa al envio.",
      estado: "Por Autorizar",
      correoEnviado: false,
    },
    {
      id: "auth-2",
      selected: false,
      tipo: "Facturas",
      enviado: true,
      emision: "08/08/2026",
      serie: "001-001",
      secuencia: "000000124",
      cliente: "Comercial Sierra Norte",
      importe: 96.2,
      error: "",
      estado: "Autorizados",
      correoEnviado: true,
    },
    {
      id: "auth-3",
      selected: false,
      tipo: "Retenciones",
      enviado: false,
      emision: "08/08/2026",
      serie: "001-002",
      secuencia: "000000051",
      cliente: "Distribuidora Costa Azul",
      importe: 44.9,
      error: "Documento listo para consulta SRI.",
      estado: "Por Autorizar",
      correoEnviado: false,
    },
    {
      id: "auth-4",
      selected: false,
      tipo: "Guias de Remision",
      enviado: true,
      emision: "07/08/2026",
      serie: "002-001",
      secuencia: "000000019",
      cliente: "Panaderia Central",
      importe: 0,
      error: "",
      estado: "Autorizados",
      correoEnviado: true,
    },
  ];
}

function createDefaultForm(empresa: string): PanelForm {
  return {
    tipoDocumento: "Facturas",
    estadoDocumento: "Por Autorizar",
    fechaDesde: "09/07/2026",
    fechaHasta: "09/08/2026",
    rangoRapido: "Mes Actual",
    enviarCorreo: true,
    rows: createDefaultRows(empresa),
  };
}

function formatMoney(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export function VentasAutorizarDocumentosPanel({
  empresa,
}: VentasAutorizarDocumentosPanelProps) {
  const [form, setForm] = useState<PanelForm>(() => createDefaultForm(empresa.razonSocial));
  const [savedSnapshot, setSavedSnapshot] = useState<PanelForm>(() =>
    createDefaultForm(empresa.razonSocial),
  );
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");

  const storageKey = `${STORAGE_KEY_PREFIX}-${empresa.id}`;

  useEffect(() => {
    const fallback = createDefaultForm(empresa.razonSocial);
    const savedDraft = window.localStorage.getItem(storageKey);

    if (!savedDraft) {
      setForm(fallback);
      setSavedSnapshot(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as PanelForm;
      setForm(parsed);
      setSavedSnapshot(parsed);
    } catch {
      setForm(fallback);
      setSavedSnapshot(fallback);
    }
  }, [empresa.razonSocial, storageKey]);

  const filteredRows = useMemo(
    () =>
      form.rows.filter(
        (row) =>
          row.tipo === form.tipoDocumento && row.estado === form.estadoDocumento,
      ),
    [form.estadoDocumento, form.rows, form.tipoDocumento],
  );

  function setBanner(nextMessage: string, tone: "success" | "warning" = "success") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function updateField<K extends keyof PanelForm>(field: K, value: PanelForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateRow(rowId: string, updater: (row: AuthorizationRow) => AuthorizationRow) {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === rowId ? updater(row) : row)),
    }));
  }

  function handleConsultar() {
    setBanner(
      `Consulta aplicada para ${form.tipoDocumento} en estado ${form.estadoDocumento}.`,
    );
  }

  function handleToggleAll() {
    const shouldSelectAll = filteredRows.some((row) => !row.selected);
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.tipo === form.tipoDocumento && row.estado === form.estadoDocumento
          ? { ...row, selected: shouldSelectAll }
          : row,
      ),
    }));
    setBanner(
      shouldSelectAll
        ? "Se marcaron todos los documentos visibles."
        : "Se desmarcaron todos los documentos visibles.",
      "warning",
    );
  }

  function handleAutorizar() {
    const selectedIds = filteredRows.filter((row) => row.selected).map((row) => row.id);

    if (selectedIds.length === 0) {
      setBanner("Selecciona al menos un documento antes de autorizar.", "warning");
      return;
    }

    setForm((current) => ({
      ...current,
      estadoDocumento: "Autorizados",
      rows: current.rows.map((row) =>
        selectedIds.includes(row.id)
          ? {
              ...row,
              selected: false,
              enviado: true,
              estado: "Autorizados",
              error: "",
              correoEnviado: form.enviarCorreo,
            }
          : row,
      ),
    }));

    setBanner(
      `${selectedIds.length} documento(s) pasaron a estado Autorizados${
        form.enviarCorreo ? " y se marco envio de correo." : "."
      }`,
    );
  }

  function handleGuardar() {
    window.localStorage.setItem(storageKey, JSON.stringify(form));
    setSavedSnapshot(form);
    setBanner("Configuracion de autorizacion guardada localmente.");
  }

  function handleRestaurar() {
    setForm(savedSnapshot);
    setBanner("Se restauraron los datos guardados del panel.", "warning");
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_1.1fr]">
        <div className="grid gap-4">
          <div>
            <p className="text-[15px] font-medium text-slate-700">Tipos de Documentos</p>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] text-slate-700">
              {[
                "Facturas",
                "Retenciones",
                "Notas de Credito",
                "Guias de Remision",
                "Notas de Debito",
                "Liquidacion Compras",
              ].map((tipo) => (
                <label key={tipo} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tipo-documento"
                    checked={form.tipoDocumento === tipo}
                    onChange={() => updateField("tipoDocumento", tipo as DocumentType)}
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <p className="text-[15px] font-medium text-slate-700">Tipo Documentos</p>
            <div className="mt-2 grid gap-2 text-[15px] text-slate-700">
              {["Por Autorizar", "Autorizados"].map((estado) => (
                <label key={estado} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="estado-documento"
                    checked={form.estadoDocumento === estado}
                    onChange={() =>
                      updateField("estadoDocumento", estado as DocumentStatus)
                    }
                  />
                  <span>{estado}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-[52px_1fr_52px_1fr] items-center gap-2">
            <label className="text-[15px] text-slate-700">Desde:</label>
            <input
              value={form.fechaDesde}
              onChange={(event) => updateField("fechaDesde", event.target.value)}
              className="h-8 border border-slate-300 px-2 text-sm text-slate-700 outline-none focus:border-[#1677c9]"
            />
            <label className="text-[15px] text-slate-700">Hasta:</label>
            <input
              value={form.fechaHasta}
              onChange={(event) => updateField("fechaHasta", event.target.value)}
              className="h-8 border border-slate-300 px-2 text-sm text-slate-700 outline-none focus:border-[#1677c9]"
            />
          </div>
          <div className="grid grid-cols-[52px_1fr] items-center gap-2">
            <span className="text-[15px] text-slate-700"> </span>
            <select
              value={form.rangoRapido}
              onChange={(event) => updateField("rangoRapido", event.target.value)}
              className="h-8 border border-slate-300 px-2 text-sm text-slate-700 outline-none focus:border-[#1677c9]"
            >
              <option>Mes Actual</option>
              <option>Ultimos 7 dias</option>
              <option>Ultimos 30 dias</option>
            </select>
          </div>
          <div>
            <p className="text-[15px] font-medium text-slate-700">Enviar Correo</p>
            <div className="mt-2 flex gap-6 text-[15px] text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correo"
                  checked={form.enviarCorreo}
                  onChange={() => updateField("enviarCorreo", true)}
                />
                <span>SI</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correo"
                  checked={!form.enviarCorreo}
                  onChange={() => updateField("enviarCorreo", false)}
                />
                <span>NO</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {[
          { label: "Consultar", onClick: handleConsultar },
          { label: "Todos", onClick: handleToggleAll },
          { label: "Autorizar", onClick: handleAutorizar },
          { label: "Opciones", onClick: () => setShowOptions((current) => !current) },
          {
            label: "LogsAutorizacionSRI",
            onClick: () =>
              setBanner(
                "Bitacora SRI preparada para integrarse con recepcion y autorizacion oficial.",
                "warning",
              ),
          },
          {
            label: "CargarAutorizacionSRI",
            onClick: () =>
              setBanner(
                "Carga manual de autorizaciones preparada para conectarse con respuestas oficiales del SRI.",
                "warning",
              ),
          },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`${baseButtonClass} ${buttonColors[action.label]}`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {message ? (
        <div
          className={`mt-3 rounded-sm border px-4 py-3 text-sm ${
            messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {message}
        </div>
      ) : null}

      {showOptions ? (
        <div className="mt-3 rounded-sm border border-slate-200 bg-[#f8fbff] px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGuardar}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Guardar filtros
            </button>
            <button
              type="button"
              onClick={handleRestaurar}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Restaurar
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 overflow-x-auto border border-slate-300">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-white text-slate-600">
            <tr>
              {[
                "Marca",
                "Enviado",
                "Emision",
                "Serie",
                "Secuencia",
                "Nombre del Cliente",
                "Importe",
                "Mensaje Error",
              ].map((title) => (
                <th
                  key={title}
                  className="border border-slate-300 px-3 py-2 text-left text-[15px] font-semibold"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                >
                  No hay documentos para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className={row.selected ? "bg-[#edf6ff]" : "bg-white"}>
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(event) =>
                        updateRow(row.id, (current) => ({
                          ...current,
                          selected: event.target.checked,
                        }))
                      }
                    />
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                    {row.enviado ? "SI" : "NO"}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700">
                    {row.emision}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700">
                    {row.serie}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700">
                    {row.secuencia}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700">
                    {row.cliente}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right text-slate-700">
                    {formatMoney(row.importe)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700">
                    {row.error || (row.correoEnviado ? "Correo listo/enviado." : "Sin novedades.")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
