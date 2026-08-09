"use client";

import { useEffect, useState } from "react";

type VentasEntregasPorFacturarPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
    ciudad: string;
  };
};

type DetailRow = {
  id: string;
  codigo: string;
  descripcion: string;
  medida: string;
  cantidad: string;
  precioIva: string;
  descuento: string;
  iva: string;
};

type EntregaForm = {
  numero: string;
  emision: string;
  formaPago: string;
  facturador: string;
  vendedor: string;
  almacen: string;
  contabilizado: boolean;
  identificacionCliente: string;
  nombreCliente: string;
  tarifa: string;
  sucursal: string;
  codigoProducto: string;
  observacion: string;
  detalle: DetailRow[];
};

type Totals = {
  subtotal: number;
  descuentoValor: number;
  subtotalNeto: number;
  subtotalConIva: number;
  subtotalIva0: number;
  totalIva: number;
  totalIva5: number;
  subtotalIva5: number;
  total: number;
};

const STORAGE_KEY_PREFIX = "ventas-entregas-facturar-draft";

const actionBaseClass =
  "inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition";

const actionButtonColors: Record<string, string> = {
  Buscar: "bg-[#f7ad2d] hover:bg-[#e39b1f]",
  Guardar: "bg-[#67b7ef] hover:bg-[#52a5de]",
  Nuevo: "bg-[#3159a8] hover:bg-[#26488b]",
  Modificar: "bg-[#5eb45c] hover:bg-[#509d4f]",
  Eliminar: "bg-[#de4848] hover:bg-[#c53d3d]",
  Cancelar: "bg-[#f29c9c] hover:bg-[#e78888]",
  Imprimir: "bg-[#6f7780] hover:bg-[#5f666e]",
  Opciones: "bg-[#243746] hover:bg-[#1b2935]",
};

const customerPresets = [
  { identificacion: "0105280192001", nombre: "Soluciones informaticas" },
  { identificacion: "1790012345001", nombre: "Comercial Sierra Norte" },
  { identificacion: "0998765432001", nombre: "Distribuidora Costa Azul" },
];

const productPresets = [
  {
    codigo: "PAN-001",
    descripcion: "Pan artesanal entregado",
    medida: "Unidad",
    cantidad: "8",
    precioIva: "0.85",
    descuento: "0",
    iva: "15",
  },
  {
    codigo: "TORTA-010",
    descripcion: "Torta mediana entregada",
    medida: "Unidad",
    cantidad: "1",
    precioIva: "18.50",
    descuento: "5",
    iva: "15",
  },
  {
    codigo: "CAFE-003",
    descripcion: "Cafe entregado",
    medida: "Unidad",
    cantidad: "15",
    precioIva: "1.50",
    descuento: "10",
    iva: "15",
  },
];

function createEmptyRow(index: number): DetailRow {
  return {
    id: `entrega-row-${index}-${Date.now()}`,
    codigo: "",
    descripcion: "",
    medida: "Unidad",
    cantidad: "",
    precioIva: "",
    descuento: "0",
    iva: "15",
  };
}

function createDefaultForm(
  empresa: VentasEntregasPorFacturarPanelProps["empresa"],
): EntregaForm {
  return {
    numero: "ENT-000001",
    emision: "09/08/2026",
    formaPago: "Contado",
    facturador: "Cajero 1",
    vendedor: "Vendedor",
    almacen: "Almacen General",
    contabilizado: false,
    identificacionCliente: "0105280192001",
    nombreCliente: empresa.razonSocial,
    tarifa: "Precio 1",
    sucursal: empresa.ciudad,
    codigoProducto: "",
    observacion: `Entrega por facturar preparada para ${empresa.razonSocial}.`,
    detalle: [createEmptyRow(1)],
  };
}

function parseAmount(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number, digits = 2) {
  return value.toFixed(digits).replace(".", ",");
}

function calculateTotals(detail: DetailRow[]): Totals {
  return detail.reduce<Totals>(
    (accumulator, row) => {
      const cantidad = parseAmount(row.cantidad);
      const precio = parseAmount(row.precioIva);
      const descuentoPct = parseAmount(row.descuento);
      const ivaPct = parseAmount(row.iva);

      const bruto = cantidad * precio;
      const descuentoValor = bruto * (descuentoPct / 100);
      const neto = bruto - descuentoValor;
      const baseSinIva = ivaPct > 0 ? neto / (1 + ivaPct / 100) : neto;
      const ivaValor = neto - baseSinIva;

      accumulator.subtotal += bruto;
      accumulator.descuentoValor += descuentoValor;
      accumulator.subtotalNeto += neto;

      if (ivaPct === 0) {
        accumulator.subtotalIva0 += baseSinIva;
      } else if (ivaPct === 5) {
        accumulator.subtotalIva5 += baseSinIva;
        accumulator.totalIva5 += ivaValor;
      } else {
        accumulator.subtotalConIva += baseSinIva;
        accumulator.totalIva += ivaValor;
      }

      accumulator.total = accumulator.subtotalNeto;
      return accumulator;
    },
    {
      subtotal: 0,
      descuentoValor: 0,
      subtotalNeto: 0,
      subtotalConIva: 0,
      subtotalIva0: 0,
      totalIva: 0,
      totalIva5: 0,
      subtotalIva5: 0,
      total: 0,
    },
  );
}

export function VentasEntregasPorFacturarPanel({
  empresa,
}: VentasEntregasPorFacturarPanelProps) {
  const [activeBottomTab, setActiveBottomTab] = useState<"detalles" | "observacion">(
    "detalles",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [form, setForm] = useState<EntregaForm>(() => createDefaultForm(empresa));
  const [savedSnapshot, setSavedSnapshot] = useState<EntregaForm>(() =>
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
      const parsed = JSON.parse(savedDraft) as EntregaForm;
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

  const totals = calculateTotals(form.detalle);

  const inputClassName = isEditing
    ? "h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 outline-none";

  const amountClassName =
    "h-8 w-full border border-slate-300 bg-white px-2 text-right text-sm text-slate-700 outline-none";

  function setBanner(nextMessage: string, tone: "success" | "warning" = "success") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function updateField<K extends keyof EntregaForm>(field: K, value: EntregaForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateRow(rowId: string, field: keyof DetailRow, value: string) {
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
    setIsEditing(true);
    setSelectedRowId(nextForm.detalle[0]?.id ?? null);
    setBanner("Nueva entrega por facturar lista para editar.");
  }

  function handleModificar() {
    setIsEditing(true);
    setBanner("Modo edicion activado para la entrega por facturar.");
  }

  function handleGuardar() {
    window.localStorage.setItem(storageKey, JSON.stringify(form));
    setSavedSnapshot(form);
    setIsEditing(false);
    setBanner("Entrega por facturar guardada localmente en este navegador.");
  }

  function handleCancelar() {
    setForm(savedSnapshot);
    setIsEditing(false);
    setBanner("Se restauraron los datos guardados de la entrega.", "warning");
  }

  function handleEliminar() {
    if (selectedRowId) {
      const filteredRows = form.detalle.filter((row) => row.id !== selectedRowId);
      const nextRows = filteredRows.length > 0 ? filteredRows : [createEmptyRow(1)];
      setForm((current) => ({ ...current, detalle: nextRows }));
      setSelectedRowId(nextRows[0]?.id ?? null);
      setBanner("Se elimino la fila seleccionada de la entrega.", "warning");
      return;
    }

    const emptyForm = createDefaultForm(empresa);
    setForm(emptyForm);
    setBanner("Se limpiaron los datos de la entrega.", "warning");
  }

  function handleBuscarCliente() {
    const currentIndex = customerPresets.findIndex(
      (item) => item.identificacion === form.identificacionCliente,
    );
    const nextCustomer = customerPresets[(currentIndex + 1) % customerPresets.length];

    setForm((current) => ({
      ...current,
      identificacionCliente: nextCustomer.identificacion,
      nombreCliente: nextCustomer.nombre,
    }));
    setBanner(`Cliente cargado: ${nextCustomer.nombre}.`);
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
      detalle: current.detalle.map((row) =>
        row.id === targetRowId ? { ...row, ...nextProduct } : row,
      ),
    }));
    setBanner(`Producto agregado a la entrega: ${nextProduct.descripcion}.`);
  }

  function handleInformacion() {
    setBanner(
      form.contabilizado
        ? "La entrega ya fue marcada como contabilizada."
        : "Entrega pendiente de contabilizacion.",
    );
  }

  function handleExistencias() {
    setBanner("Consulta de existencias lista para enlazarse con inventario.", "warning");
  }

  function handleSeries() {
    setBanner("Control de series preparado para integrarse con productos.", "warning");
  }

  function handleLotes() {
    setBanner("Control de lotes preparado para integrarse con inventario.", "warning");
  }

  function handleQuitar() {
    handleEliminar();
  }

  function handleAddRow() {
    const nextRow = createEmptyRow(form.detalle.length + 1);
    setForm((current) => ({ ...current, detalle: [...current.detalle, nextRow] }));
    setSelectedRowId(nextRow.id);
    setIsEditing(true);
    setBanner("Se agrego una nueva linea a la entrega.");
  }

  const compactButtonClass =
    "rounded-sm bg-[#f39a1f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]";

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "Buscar", onClick: () => setBanner("Busqueda de entregas lista para conectar.") },
          { label: "Guardar", onClick: handleGuardar },
          { label: "Nuevo", onClick: handleNuevo },
          { label: "Modificar", onClick: handleModificar },
          { label: "Eliminar", onClick: handleEliminar },
          { label: "Cancelar", onClick: handleCancelar },
          { label: "Imprimir", onClick: () => { window.print(); setBanner("Se envio la entrega a impresion."); } },
          { label: "Opciones", onClick: () => setShowOptions((current) => !current) },
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
        <button
          type="button"
          onClick={() => setShowTutorials((current) => !current)}
          className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Tutoriales
        </button>
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

      {showTutorials ? (
        <div className="mt-3 rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
          Esta pantalla permite preparar entregas pendientes de facturacion con
          cliente, detalle editable, observacion y totales recalculados localmente.
        </div>
      ) : null}

      {showOptions ? (
        <div className="mt-3 rounded-sm border border-slate-200 bg-[#f8fbff] px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                handleBuscarCliente();
                handleBuscarProducto();
              }}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Aplicar datos de ejemplo
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Agregar fila
            </button>
            <button
              type="button"
              onClick={() => updateField("contabilizado", !form.contabilizado)}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Alternar contabilizado
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[72px_1fr_84px_1fr_140px] md:items-center">
            <label className="text-sm text-slate-700">Entrega:</label>
            <input
              className={inputClassName}
              value={form.numero}
              disabled={!isEditing}
              onChange={(event) => updateField("numero", event.target.value)}
            />
            <label className="text-sm text-slate-700">Facturador :</label>
            <input
              className={inputClassName}
              value={form.facturador}
              disabled={!isEditing}
              onChange={(event) => updateField("facturador", event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.contabilizado}
                disabled={!isEditing}
                onChange={(event) => updateField("contabilizado", event.target.checked)}
              />
              Contabilizado
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_84px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Emision:</label>
            <div className="flex gap-1">
              <input
                className={inputClassName}
                value={form.emision}
                disabled={!isEditing}
                onChange={(event) => updateField("emision", event.target.value)}
              />
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => updateField("emision", "09/08/2026")}
                className="h-8 w-10 border border-slate-300 bg-slate-100 text-xs text-slate-500 disabled:cursor-not-allowed"
              >
                CAL
              </button>
            </div>
            <label className="text-sm text-slate-700">Vendedor :</label>
            <select
              className={inputClassName}
              value={form.vendedor}
              disabled={!isEditing}
              onChange={(event) => updateField("vendedor", event.target.value)}
            >
              <option>Vendedor</option>
              <option>Mostrador</option>
              <option>Ejecutivo 1</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_84px_1fr] md:items-center">
            <label className="text-sm text-slate-700">F. Pago :</label>
            <select
              className={inputClassName}
              value={form.formaPago}
              disabled={!isEditing}
              onChange={(event) => updateField("formaPago", event.target.value)}
            >
              <option>Contado</option>
              <option>Credito 15 dias</option>
              <option>Transferencia</option>
            </select>
            <label className="text-sm text-slate-700">Almacén :</label>
            <select
              className={inputClassName}
              value={form.almacen}
              disabled={!isEditing}
              onChange={(event) => updateField("almacen", event.target.value)}
            >
              <option>Almacen General</option>
              <option>Bodega Centro</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_40px_1fr] md:items-center">
            <label className="text-sm text-slate-700">C.I./RUC :</label>
            <input
              className={inputClassName}
              value={form.identificacionCliente}
              disabled={!isEditing}
              onChange={(event) => updateField("identificacionCliente", event.target.value)}
            />
            <button
              type="button"
              onClick={handleBuscarCliente}
              className="h-8 rounded-sm bg-[#f7ad2d] text-white transition hover:bg-[#e39b1f]"
            >
              Q
            </button>
            <input
              className={inputClassName}
              value={form.nombreCliente}
              disabled={!isEditing}
              onChange={(event) => updateField("nombreCliente", event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_84px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Tarifa :</label>
            <select
              className={inputClassName}
              value={form.tarifa}
              disabled={!isEditing}
              onChange={(event) => updateField("tarifa", event.target.value)}
            >
              <option>Precio 1</option>
              <option>Precio 2</option>
              <option>Precio Mayorista</option>
            </select>
            <label className="text-sm text-slate-700">Sucursal :</label>
            <input
              className={inputClassName}
              value={form.sucursal}
              disabled={!isEditing}
              onChange={(event) => updateField("sucursal", event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[72px_1fr_40px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Codigo :</label>
            <input
              className={inputClassName}
              value={form.codigoProducto}
              disabled={!isEditing}
              onChange={(event) => updateField("codigoProducto", event.target.value)}
            />
            <button
              type="button"
              onClick={handleBuscarProducto}
              className="h-8 rounded-sm bg-[#f7ad2d] text-white transition hover:bg-[#e39b1f]"
            >
              Q
            </button>
            <div className="text-sm text-slate-500">
              {selectedRowId
                ? (form.detalle.find((row) => row.id === selectedRowId)?.descripcion ||
                    "Fila seleccionada")
                : "Selecciona una fila del detalle"}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-sm bg-[#1f1f1f] px-4 py-3 text-right text-5xl font-semibold text-lime-400">
            {formatAmount(totals.total)}
          </div>

          <div className="mt-2 grid gap-x-3 gap-y-1 md:grid-cols-2">
            {[
              ["Sub Total :", formatAmount(totals.subtotal, 4)],
              ["Sub Total IVA 5%:", formatAmount(totals.subtotalIva5, 4)],
              ["Descuento %:", totals.subtotal > 0 ? formatAmount((totals.descuentoValor / totals.subtotal) * 100, 2) : "0,00 %"],
              ["Sub Total IVA 0%:", formatAmount(totals.subtotalIva0, 4)],
              ["Descuento $:", formatAmount(totals.descuentoValor)],
              ["Total IVA:", formatAmount(totals.totalIva)],
              ["Sub Total Neto :", formatAmount(totals.subtotalNeto, 4)],
              ["Total IVA 5%:", formatAmount(totals.totalIva5)],
              ["Sub Total con IVA:", formatAmount(totals.subtotalConIva, 4)],
              ["", ""],
            ].map(([label, value], index) => (
              <div key={`${label}-${index}`} className="grid grid-cols-[1fr_112px] items-center gap-2">
                <label className="text-sm text-slate-700">{label}</label>
                <input className={amountClassName} value={value} disabled />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleInformacion} className={compactButtonClass}>
          Informacion
        </button>
        <button type="button" onClick={handleExistencias} className={compactButtonClass}>
          Existencias
        </button>
        <button type="button" onClick={handleSeries} className={compactButtonClass}>
          Series
        </button>
        <button type="button" onClick={handleLotes} className={compactButtonClass}>
          Lotes
        </button>
        <button
          type="button"
          onClick={handleQuitar}
          className="rounded-sm bg-[#f29c9c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#e18787]"
        >
          Quitar
        </button>
        <button
          type="button"
          onClick={handleAddRow}
          className="rounded-sm bg-[#9abbb1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#86a89d]"
        >
          Agregar
        </button>
      </div>

      <div className="mt-4 overflow-hidden border border-slate-300">
        <div className="flex border-b border-slate-300 bg-white">
          {[
            { key: "detalles", label: "Detalles" },
            { key: "observacion", label: "Observación" },
          ].map((tab) => {
            const isActive = activeBottomTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveBottomTab(tab.key as "detalles" | "observacion")}
                className={`border-r border-slate-300 px-5 py-2 text-[15px] ${
                  isActive
                    ? "bg-[#dfe7ec] text-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto bg-white">
          {activeBottomTab === "detalles" ? (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["Codigo", "Descripcion", "Medida", "Cantidad", "Precio IVA", "Desc.", "IVA", "Total"].map(
                    (header) => (
                      <th
                        key={header}
                        className="border-b border-r border-slate-300 px-3 py-2 text-left font-semibold text-slate-500 last:border-r-0"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {form.detalle.map((row) => {
                  const rowSubtotal = parseAmount(row.cantidad) * parseAmount(row.precioIva);
                  const rowDiscount = rowSubtotal * (parseAmount(row.descuento) / 100);
                  const rowTotal = rowSubtotal - rowDiscount;
                  const isSelected = row.id === selectedRowId;

                  return (
                    <tr
                      key={row.id}
                      className={isSelected ? "bg-[#eef6ff]" : "bg-white"}
                      onClick={() => setSelectedRowId(row.id)}
                    >
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={inputClassName}
                          value={row.codigo}
                          disabled={!isEditing}
                          onChange={(event) => updateRow(row.id, "codigo", event.target.value)}
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={inputClassName}
                          value={row.descripcion}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateRow(row.id, "descripcion", event.target.value)
                          }
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={inputClassName}
                          value={row.medida}
                          disabled={!isEditing}
                          onChange={(event) => updateRow(row.id, "medida", event.target.value)}
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={amountClassName}
                          value={row.cantidad}
                          disabled={!isEditing}
                          onChange={(event) => updateRow(row.id, "cantidad", event.target.value)}
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={amountClassName}
                          value={row.precioIva}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateRow(row.id, "precioIva", event.target.value)
                          }
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={amountClassName}
                          value={row.descuento}
                          disabled={!isEditing}
                          onChange={(event) => updateRow(row.id, "descuento", event.target.value)}
                        />
                      </td>
                      <td className="border-b border-r border-slate-200 px-2 py-1">
                        <input
                          className={amountClassName}
                          value={row.iva}
                          disabled={!isEditing}
                          onChange={(event) => updateRow(row.id, "iva", event.target.value)}
                        />
                      </td>
                      <td className="border-b border-slate-200 px-3 py-2 text-right text-slate-700">
                        {formatAmount(rowTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="min-h-[420px] p-4">
              <textarea
                className={`min-h-[340px] w-full border border-slate-300 px-3 py-2 text-sm outline-none ${
                  isEditing ? "bg-white text-slate-800" : "bg-slate-100 text-slate-500"
                }`}
                value={form.observacion}
                disabled={!isEditing}
                onChange={(event) => updateField("observacion", event.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-4 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-600 md:grid-cols-3">
        <p>Auditoria</p>
        <p>Creación: 09/08/2026 09:30</p>
        <p>Modificación: 09/08/2026 09:45</p>
      </div>
    </div>
  );
}
