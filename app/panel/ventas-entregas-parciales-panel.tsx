"use client";

import { useEffect, useState } from "react";

type VentasEntregasParcialesPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
    ciudad: string;
  };
};

type DetailRow = {
  id: string;
  marca: boolean;
  codigo: string;
  descripcion: string;
  medida: string;
  cantidad: string;
  cantidadEntregada: string;
  almacen: string;
};

type EntregaParcialForm = {
  factura: string;
  codigoProducto: string;
  descripcionProducto: string;
  concepto: string;
  emisionFactura: string;
  entrega: string;
  emisionEntrega: string;
  facturador: string;
  almacen: string;
  observacion: string;
  detalle: DetailRow[];
};

const STORAGE_KEY_PREFIX = "ventas-entregas-parciales-draft";

const actionBaseClass =
  "inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition";

const actionButtonColors: Record<string, string> = {
  Nuevo: "bg-[#3159a8] hover:bg-[#26488b]",
  Guardar: "bg-[#67b7ef] hover:bg-[#52a5de]",
  Cancelar: "bg-[#f29c9c] hover:bg-[#e78888]",
  Imprimir: "bg-[#6f7780] hover:bg-[#5f666e]",
  "Guia de Remision": "bg-[#243746] hover:bg-[#1b2935]",
};

const productPresets = [
  {
    codigo: "PAN-001",
    descripcion: "Pan artesanal",
    medida: "Unidad",
    cantidad: "24",
    cantidadEntregada: "8",
    almacen: "Almacen General",
  },
  {
    codigo: "TORTA-010",
    descripcion: "Torta mediana",
    medida: "Unidad",
    cantidad: "3",
    cantidadEntregada: "1",
    almacen: "Almacen Frio",
  },
  {
    codigo: "CAFE-003",
    descripcion: "Cafe filtrado",
    medida: "Unidad",
    cantidad: "20",
    cantidadEntregada: "6",
    almacen: "Almacen General",
  },
];

function createEmptyRow(index: number): DetailRow {
  return {
    id: `entrega-parcial-row-${index}-${Date.now()}`,
    marca: false,
    codigo: "",
    descripcion: "",
    medida: "Unidad",
    cantidad: "",
    cantidadEntregada: "",
    almacen: "",
  };
}

function createDefaultForm(
  empresa: VentasEntregasParcialesPanelProps["empresa"],
): EntregaParcialForm {
  return {
    factura: "FAC-000001",
    codigoProducto: "",
    descripcionProducto: "",
    concepto: `Entrega parcial para ${empresa.razonSocial}`,
    emisionFactura: "09/08/2026",
    entrega: "ENTP-000001",
    emisionEntrega: "09/08/2026",
    facturador: "Cajero 1",
    almacen: "Almacen General",
    observacion: "Sin observaciones.",
    detalle: [createEmptyRow(1)],
  };
}

export function VentasEntregasParcialesPanel({
  empresa,
}: VentasEntregasParcialesPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [form, setForm] = useState<EntregaParcialForm>(() => createDefaultForm(empresa));
  const [savedSnapshot, setSavedSnapshot] = useState<EntregaParcialForm>(() =>
    createDefaultForm(empresa),
  );

  const storageKey = `${STORAGE_KEY_PREFIX}-${empresa.id}`;

  useEffect(() => {
    const fallback = createDefaultForm(empresa);
    const savedDraft = window.localStorage.getItem(storageKey);

    if (!savedDraft) {
      setForm(fallback);
      setSavedSnapshot(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as EntregaParcialForm;
      if (!parsed.detalle?.length) {
        parsed.detalle = [createEmptyRow(1)];
      }
      setForm(parsed);
      setSavedSnapshot(parsed);
    } catch {
      setForm(fallback);
      setSavedSnapshot(fallback);
    }
  }, [empresa, storageKey]);

  const inputClassName = isEditing
    ? "h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 outline-none";

  function setBanner(nextMessage: string, tone: "success" | "warning" = "success") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function updateField<K extends keyof EntregaParcialForm>(
    field: K,
    value: EntregaParcialForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateRow(rowId: string, field: keyof DetailRow, value: string | boolean) {
    setForm((current) => ({
      ...current,
      detalle: current.detalle.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function handleNuevo() {
    const nextForm = createDefaultForm(empresa);
    setForm(nextForm);
    setSelectedRowId(nextForm.detalle[0]?.id ?? null);
    setIsEditing(true);
    setBanner("Nueva entrega parcial lista para editar.");
  }

  function handleGuardar() {
    window.localStorage.setItem(storageKey, JSON.stringify(form));
    setSavedSnapshot(form);
    setIsEditing(false);
    setBanner("Entrega parcial guardada localmente en este navegador.");
  }

  function handleCancelar() {
    setForm(savedSnapshot);
    setIsEditing(false);
    setBanner("Se restauraron los datos guardados de la entrega parcial.", "warning");
  }

  function handleBuscarProducto() {
    const currentIndex = productPresets.findIndex(
      (item) => item.codigo === form.codigoProducto,
    );
    const nextProduct = productPresets[(currentIndex + 1) % productPresets.length];
    const targetRowId = selectedRowId ?? form.detalle[0]?.id;

    if (!targetRowId) {
      return;
    }

    setForm((current) => ({
      ...current,
      codigoProducto: nextProduct.codigo,
      descripcionProducto: nextProduct.descripcion,
      detalle: current.detalle.map((row) =>
        row.id === targetRowId
          ? {
              ...row,
              codigo: nextProduct.codigo,
              descripcion: nextProduct.descripcion,
              medida: nextProduct.medida,
              cantidad: nextProduct.cantidad,
              cantidadEntregada: nextProduct.cantidadEntregada,
              almacen: nextProduct.almacen,
            }
          : row,
      ),
    }));
    setBanner(`Producto cargado para entrega parcial: ${nextProduct.descripcion}.`);
  }

  function handleToggleAllMarks() {
    const shouldMarkAll = form.detalle.some((row) => !row.marca);
    setForm((current) => ({
      ...current,
      detalle: current.detalle.map((row) => ({ ...row, marca: shouldMarkAll })),
    }));
    setBanner(
      shouldMarkAll
        ? "Se marcaron todas las lineas de la entrega parcial."
        : "Se desmarcaron todas las lineas de la entrega parcial.",
      "warning",
    );
  }

  function handleAddRow() {
    const nextRow = createEmptyRow(form.detalle.length + 1);
    setForm((current) => ({ ...current, detalle: [...current.detalle, nextRow] }));
    setSelectedRowId(nextRow.id);
    setIsEditing(true);
    setBanner("Se agrego una nueva linea para la entrega parcial.");
  }

  function compactBanner(messageText: string) {
    setBanner(messageText, "warning");
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "Nuevo", onClick: handleNuevo },
          { label: "Guardar", onClick: handleGuardar },
          { label: "Cancelar", onClick: handleCancelar },
          {
            label: "Imprimir",
            onClick: () => {
              window.print();
              setBanner("Se envio la entrega parcial a impresion.");
            },
          },
          {
            label: "Guia de Remision",
            onClick: () =>
              compactBanner(
                "La generacion de guia de remision queda lista para conectarse con facturacion electronica.",
              ),
          },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`${actionBaseClass} ${actionButtonColors[action.label]}`}
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

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[72px_1fr_72px_132px] md:items-center">
            <label className="text-sm text-slate-700">Factura</label>
            <input
              className={inputClassName}
              value={form.factura}
              disabled={!isEditing}
              onChange={(event) => updateField("factura", event.target.value)}
            />
            <label className="text-sm text-slate-700">Emision:</label>
            <input
              className={inputClassName}
              value={form.emisionFactura}
              disabled={!isEditing}
              onChange={(event) => updateField("emisionFactura", event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_44px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Codigo:</label>
            <input
              className={inputClassName}
              value={form.codigoProducto}
              disabled={!isEditing}
              onChange={(event) => updateField("codigoProducto", event.target.value)}
            />
            <button
              type="button"
              onClick={handleBuscarProducto}
              className="h-8 rounded-sm bg-[#f7b53b] text-lg font-bold text-white transition hover:bg-[#e2a32f]"
            >
              Q
            </button>
            <input
              className={inputClassName}
              value={form.descripcionProducto}
              disabled={!isEditing}
              onChange={(event) => updateField("descripcionProducto", event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Concepto:</label>
            <input
              className={inputClassName}
              value={form.concepto}
              disabled={!isEditing}
              onChange={(event) => updateField("concepto", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[84px_1fr_90px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Entrega :</label>
            <input
              className={inputClassName}
              value={form.entrega}
              disabled={!isEditing}
              onChange={(event) => updateField("entrega", event.target.value)}
            />
            <label className="text-sm text-slate-700">Facturador :</label>
            <select
              className={inputClassName}
              value={form.facturador}
              disabled={!isEditing}
              onChange={(event) => updateField("facturador", event.target.value)}
            >
              <option>Cajero 1</option>
              <option>Cajero 2</option>
              <option>Supervisor</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[84px_1fr_90px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Emision:</label>
            <input
              className={inputClassName}
              value={form.emisionEntrega}
              disabled={!isEditing}
              onChange={(event) => updateField("emisionEntrega", event.target.value)}
            />
            <label className="text-sm text-slate-700">Almacen :</label>
            <select
              className={inputClassName}
              value={form.almacen}
              disabled={!isEditing}
              onChange={(event) => updateField("almacen", event.target.value)}
            >
              <option>Almacen General</option>
              <option>Almacen Frio</option>
              <option>Punto Norte</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[84px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Observacion</label>
            <input
              className={inputClassName}
              value={form.observacion}
              disabled={!isEditing}
              onChange={(event) => updateField("observacion", event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleToggleAllMarks}
          className="text-sm text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline"
        >
          Desmarcar Todo
        </button>
        <button
          type="button"
          onClick={() => compactBanner("Consulta de existencias disponible para integracion con inventario.")}
          className="rounded-sm bg-[#f39a1f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]"
        >
          Existencias
        </button>
        <button
          type="button"
          onClick={() => compactBanner("Control de series preparado para conectarse con el catalogo de productos.")}
          className="rounded-sm bg-[#67b7ef] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#52a5de]"
        >
          Series
        </button>
        <button
          type="button"
          onClick={() => compactBanner("Control de lotes preparado para conectarse con trazabilidad de inventario.")}
          className="rounded-sm bg-[#f39a1f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]"
        >
          Lotes
        </button>
        <button
          type="button"
          onClick={handleAddRow}
          className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Agregar fila
        </button>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-300">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-white text-slate-600">
            <tr>
              {["Marca", "Codigo", "Descripcion", "Medida", "Cantidad", "Cant Ent", "Almacen"].map(
                (title) => (
                  <th
                    key={title}
                    className="border border-slate-300 px-3 py-2 text-left text-[15px] font-semibold"
                  >
                    {title}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {form.detalle.map((row) => {
              const isSelected = row.id === selectedRowId;

              return (
                <tr
                  key={row.id}
                  className={isSelected ? "bg-[#edf6ff]" : "bg-white"}
                  onClick={() => setSelectedRowId(row.id)}
                >
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.marca}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "marca", event.target.checked)}
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.codigo}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "codigo", event.target.value)}
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.descripcion}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "descripcion", event.target.value)}
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.medida}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "medida", event.target.value)}
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.cantidad}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "cantidad", event.target.value)}
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.cantidadEntregada}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateRow(row.id, "cantidadEntregada", event.target.value)
                      }
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      className={inputClassName}
                      value={row.almacen}
                      disabled={!isEditing}
                      onChange={(event) => updateRow(row.id, "almacen", event.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
