"use client";

import { useEffect, useState } from "react";

type VentasFacturacionPanelProps = {
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

type FacturacionForm = {
  emision: string;
  vence: string;
  facturador: string;
  vendedor: string;
  serieEstablecimiento: string;
  seriePuntoEmision: string;
  secuenciaSerie: string;
  secuenciaNumero: string;
  almacen: string;
  identificacionCliente: string;
  nombreCliente: string;
  tarifa: string;
  sucursal: string;
  codigoProducto: string;
  contabilizado: boolean;
  imprimir: boolean;
  descuentoGeneralPct: string;
  observacion: string;
  informacionAdicional: string;
  formaCobro: string;
  detalle: DetailRow[];
};

type Totals = {
  subtotal: number;
  subtotalNoObj: number;
  descuentoPct: number;
  descuentoValor: number;
  subtotalExento: number;
  totalIce: number;
  subtotalNeto: number;
  totalIva: number;
  subtotalConIva: number;
  totalIva5: number;
  subtotalIva5: number;
  propina: number;
  subtotalIva0: number;
  total: number;
};

const STORAGE_KEY_PREFIX = "ventas-facturacion-draft";

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
  {
    identificacion: "0105280192001",
    nombre: "Soluciones informaticas",
  },
  {
    identificacion: "1790012345001",
    nombre: "Comercial Sierra Norte",
  },
  {
    identificacion: "0998765432001",
    nombre: "Distribuidora Costa Azul",
  },
];

const productPresets = [
  {
    codigo: "PAN-001",
    descripcion: "Pan artesanal",
    medida: "Unidad",
    cantidad: "1",
    precioIva: "0.85",
    descuento: "0",
    iva: "15",
  },
  {
    codigo: "TORTA-010",
    descripcion: "Torta mediana",
    medida: "Unidad",
    cantidad: "1",
    precioIva: "18.50",
    descuento: "0",
    iva: "15",
  },
  {
    codigo: "CAFE-003",
    descripcion: "Cafe filtrado",
    medida: "Unidad",
    cantidad: "2",
    precioIva: "1.50",
    descuento: "0",
    iva: "15",
  },
];

function createEmptyRow(index: number): DetailRow {
  return {
    id: `row-${index}-${Date.now()}`,
    codigo: "",
    descripcion: "",
    medida: "Unidad",
    cantidad: "",
    precioIva: "",
    descuento: "0",
    iva: "15",
  };
}

function createDefaultForm(empresa: VentasFacturacionPanelProps["empresa"]): FacturacionForm {
  return {
    emision: "08/08/2026",
    vence: "08/08/2026",
    facturador: "Cajero 1",
    vendedor: "Vendedor",
    serieEstablecimiento: "001",
    seriePuntoEmision: "001",
    secuenciaSerie: "001-001-000000001",
    secuenciaNumero: "000000001",
    almacen: "Almacen General",
    identificacionCliente: "0105280192001",
    nombreCliente: empresa.razonSocial,
    tarifa: "Precio 1",
    sucursal: empresa.ciudad,
    codigoProducto: "",
    contabilizado: false,
    imprimir: false,
    descuentoGeneralPct: "0",
    observacion: "",
    informacionAdicional: `Factura generada para ${empresa.razonSocial}.`,
    formaCobro: "Contado",
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

function calculateTotals(detail: DetailRow[], descuentoGeneralPct: string): Totals {
  const descuentoGlobal = parseAmount(descuentoGeneralPct);

  const totals = detail.reduce(
    (accumulator, row) => {
      const cantidad = parseAmount(row.cantidad);
      const precio = parseAmount(row.precioIva);
      const descuentoFila = parseAmount(row.descuento);
      const ivaPct = parseAmount(row.iva);

      const bruto = cantidad * precio;
      const descuentoValorFila = bruto * (descuentoFila / 100);
      const netoFila = bruto - descuentoValorFila;
      const baseSinIva = ivaPct > 0 ? netoFila / (1 + ivaPct / 100) : netoFila;
      const ivaValor = netoFila - baseSinIva;

      accumulator.subtotal += bruto;
      accumulator.descuentoValor += descuentoValorFila;
      accumulator.subtotalNeto += netoFila;

      if (ivaPct === 0) {
        accumulator.subtotalIva0 += baseSinIva;
      } else if (ivaPct === 5) {
        accumulator.subtotalIva5 += baseSinIva;
        accumulator.totalIva5 += ivaValor;
      } else {
        accumulator.subtotalConIva += baseSinIva;
        accumulator.totalIva += ivaValor;
      }

      return accumulator;
    },
    {
      subtotal: 0,
      subtotalNoObj: 0,
      descuentoPct: descuentoGlobal,
      descuentoValor: 0,
      subtotalExento: 0,
      totalIce: 0,
      subtotalNeto: 0,
      totalIva: 0,
      subtotalConIva: 0,
      totalIva5: 0,
      subtotalIva5: 0,
      propina: 0,
      subtotalIva0: 0,
      total: 0,
    },
  );

  const descuentoGlobalValor = totals.subtotalNeto * (descuentoGlobal / 100);
  totals.descuentoValor += descuentoGlobalValor;
  totals.subtotalNeto -= descuentoGlobalValor;
  totals.total = totals.subtotalNeto;

  return totals;
}

function buildRowSummary(row: DetailRow) {
  return `${row.codigo || "Sin codigo"} - ${row.descripcion || "Sin descripcion"}`;
}

export function VentasFacturacionPanel({
  empresa,
}: VentasFacturacionPanelProps) {
  const [activeTopTab, setActiveTopTab] = useState<"mantenimiento" | "forma-cobro">(
    "mantenimiento",
  );
  const [activeBottomTab, setActiveBottomTab] = useState<
    "detalles" | "informacion" | "observacion"
  >("detalles");
  const [isEditing, setIsEditing] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [form, setForm] = useState<FacturacionForm>(() => createDefaultForm(empresa));
  const [savedSnapshot, setSavedSnapshot] = useState<FacturacionForm>(() =>
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
      const parsed = JSON.parse(savedDraft) as FacturacionForm;
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

  const totals = calculateTotals(form.detalle, form.descuentoGeneralPct);

  const inputClassName = isEditing
    ? "h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 outline-none";

  const amountClassName =
    "h-8 w-full border border-slate-300 bg-white px-2 text-right text-sm text-slate-700 outline-none";

  function setBanner(nextMessage: string, tone: "success" | "warning" = "success") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function updateField<K extends keyof FacturacionForm>(field: K, value: FacturacionForm[K]) {
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
    setBanner("Nuevo comprobante listo para editar. Completa los datos y guarda.");
  }

  function handleModificar() {
    setIsEditing(true);
    setBanner("Modo edicion activado para la factura actual.");
  }

  function handleGuardar() {
    window.localStorage.setItem(storageKey, JSON.stringify(form));
    setSavedSnapshot(form);
    setIsEditing(false);
    setBanner("Borrador de facturacion guardado localmente en este equipo.");
  }

  function handleCancelar() {
    setForm(savedSnapshot);
    setIsEditing(false);
    setBanner("Se restauraron los datos guardados del comprobante.", "warning");
  }

  function handleEliminar() {
    if (selectedRowId) {
      const filteredRows = form.detalle.filter((row) => row.id !== selectedRowId);
      const nextRows = filteredRows.length > 0 ? filteredRows : [createEmptyRow(1)];
      setForm((current) => ({ ...current, detalle: nextRows }));
      setSelectedRowId(nextRows[0]?.id ?? null);
      setBanner("Se elimino la fila seleccionada del detalle.", "warning");
      return;
    }

    const emptyForm = createDefaultForm(empresa);
    setForm(emptyForm);
    setBanner("Se limpiaron los datos de la factura actual.", "warning");
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
    setBanner(`Producto cargado en detalle: ${nextProduct.descripcion}.`);
  }

  function handleQuitar() {
    handleEliminar();
  }

  function handleInformacion() {
    setActiveBottomTab("informacion");
    setBanner("Pestana de informacion adicional activada.");
  }

  function handleExistencias() {
    const selectedRow = form.detalle.find((row) => row.id === selectedRowId);
    setBanner(
      selectedRow?.codigo
        ? `Existencias consultadas para ${selectedRow.codigo}: 24 unidades disponibles.`
        : "Selecciona una fila o carga un producto para revisar existencias.",
      "warning",
    );
  }

  function handleSeries() {
    const selectedRow = form.detalle.find((row) => row.id === selectedRowId);
    setBanner(
      selectedRow?.codigo
        ? `Series sugeridas para ${selectedRow.codigo}: SER-001, SER-002.`
        : "Primero selecciona una fila con producto para administrar series.",
      "warning",
    );
  }

  function handleLotes() {
    const selectedRow = form.detalle.find((row) => row.id === selectedRowId);
    setBanner(
      selectedRow?.codigo
        ? `Lotes sugeridos para ${selectedRow.codigo}: LOTE-A01 y LOTE-B03.`
        : "Primero selecciona una fila con producto para administrar lotes.",
      "warning",
    );
  }

  function handleAbrirCaja() {
    setBanner("Caja abierta localmente para esta sesion de facturacion.");
  }

  function handleEgresoCaja() {
    setBanner("Modulo de egreso de caja listo para integrarse con tesoreria.", "warning");
  }

  function handleImprimir() {
    window.print();
    setBanner("Se envio la vista actual a impresion.");
  }

  function handleAddRow() {
    const nextRow = createEmptyRow(form.detalle.length + 1);
    setForm((current) => ({
      ...current,
      detalle: [...current.detalle, nextRow],
    }));
    setSelectedRowId(nextRow.id);
    setIsEditing(true);
    setBanner("Se agrego una nueva fila al detalle.");
  }

  const compactButtonClass =
    "rounded-sm bg-[#f39a1f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]";

  const optionsList = [
    "Aplicar datos de ejemplo",
    "Agregar fila al detalle",
    "Cambiar a modo de observacion",
  ];

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setBanner("Busqueda rapida disponible para futuros comprobantes.")}
          className={`${actionBaseClass} ${actionButtonColors.Buscar}`}
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={handleGuardar}
          className={`${actionBaseClass} ${actionButtonColors.Guardar}`}
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={handleNuevo}
          className={`${actionBaseClass} ${actionButtonColors.Nuevo}`}
        >
          Nuevo
        </button>
        <button
          type="button"
          onClick={handleModificar}
          className={`${actionBaseClass} ${actionButtonColors.Modificar}`}
        >
          Modificar
        </button>
        <button
          type="button"
          onClick={handleEliminar}
          className={`${actionBaseClass} ${actionButtonColors.Eliminar}`}
        >
          Eliminar
        </button>
        <button
          type="button"
          onClick={handleCancelar}
          className={`${actionBaseClass} ${actionButtonColors.Cancelar}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleImprimir}
          className={`${actionBaseClass} ${actionButtonColors.Imprimir}`}
        >
          Imprimir
        </button>
        <button
          type="button"
          onClick={() => setShowOptions((current) => !current)}
          className={`${actionBaseClass} ${actionButtonColors.Opciones}`}
        >
          Opciones
        </button>
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
          Esta pantalla ya permite trabajar como borrador local: crear una factura,
          editar filas del detalle, recalcular totales y guardar el estado en el
          navegador. El siguiente paso natural sera conectar estos datos con ventas,
          clientes, productos y caja en la base de datos.
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
              {optionsList[0]}
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {optionsList[1]}
            </button>
            <button
              type="button"
              onClick={() => setActiveBottomTab("observacion")}
              className="rounded-sm border border-[#cfe0f2] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {optionsList[2]}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden border border-slate-300">
        <div className="flex border-b border-slate-300 bg-white">
          {[
            { key: "mantenimiento", label: "Mantenimiento" },
            { key: "forma-cobro", label: "Forma de Cobro" },
          ].map((tab) => {
            const isActive = activeTopTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTopTab(tab.key as "mantenimiento" | "forma-cobro")
                }
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

        <div className="bg-white p-3">
          {activeTopTab === "mantenimiento" ? (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
                <div className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-[64px_1fr_84px_1fr] md:items-center">
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
                        onClick={() => updateField("emision", "08/08/2026")}
                        className="h-8 w-10 border border-slate-300 bg-slate-100 text-xs text-slate-500 disabled:cursor-not-allowed"
                      >
                        CAL
                      </button>
                    </div>
                    <label className="text-sm text-slate-700">Facturador :</label>
                    <select
                      className={inputClassName}
                      value={form.facturador}
                      disabled={!isEditing}
                      onChange={(event) => updateField("facturador", event.target.value)}
                    >
                      <option>Cajero 1</option>
                      <option>Cajero 2</option>
                    </select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[64px_1fr_84px_1fr] md:items-center">
                    <label className="text-sm text-slate-700">Vence:</label>
                    <div className="flex gap-1">
                      <input
                        className={inputClassName}
                        value={form.vence}
                        disabled={!isEditing}
                        onChange={(event) => updateField("vence", event.target.value)}
                      />
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => updateField("vence", "08/08/2026")}
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

                  <div className="grid gap-3 md:grid-cols-[64px_64px_72px_84px_1fr] md:items-center">
                    <label className="text-sm text-slate-700">Serie:</label>
                    <input
                      className={inputClassName}
                      value={form.serieEstablecimiento}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("serieEstablecimiento", event.target.value)
                      }
                    />
                    <input
                      className={inputClassName}
                      value={form.seriePuntoEmision}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("seriePuntoEmision", event.target.value)
                      }
                    />
                    <label className="text-sm text-slate-700">Secuencia :</label>
                    <select
                      className={inputClassName}
                      value={form.secuenciaSerie}
                      disabled={!isEditing}
                      onChange={(event) => updateField("secuenciaSerie", event.target.value)}
                    >
                      <option>001-001-000000001</option>
                      <option>001-001-000000002</option>
                    </select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[64px_1fr_84px_1fr] md:items-center">
                    <label className="text-sm text-slate-700">Secuencia:</label>
                    <input
                      className={inputClassName}
                      value={form.secuenciaNumero}
                      disabled={!isEditing}
                      onChange={(event) => updateField("secuenciaNumero", event.target.value)}
                    />
                    <label className="text-sm text-slate-700">Almacen :</label>
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

                  <div className="grid gap-3 md:grid-cols-[74px_1fr_40px_1fr] md:items-center">
                    <label className="text-sm text-slate-700">C.I./RUC :</label>
                    <input
                      className={inputClassName}
                      value={form.identificacionCliente}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("identificacionCliente", event.target.value)
                      }
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

                  <div className="grid gap-3 md:grid-cols-[64px_1fr_84px_1fr] md:items-center">
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

                  <div className="grid gap-3 md:grid-cols-[64px_1fr_40px_1fr] md:items-center">
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
                        ? buildRowSummary(
                            form.detalle.find((row) => row.id === selectedRowId) ??
                              form.detalle[0],
                          )
                        : "Selecciona una fila del detalle"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="grid gap-1 md:grid-cols-[120px_1fr] md:items-start">
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.contabilizado}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateField("contabilizado", event.target.checked)
                          }
                        />
                        Contabilizado
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.imprimir}
                          disabled={!isEditing}
                          onChange={(event) => updateField("imprimir", event.target.checked)}
                        />
                        Imprimir
                      </label>
                    </div>
                    <div className="rounded-sm bg-[#1f1f1f] px-4 py-3 text-right text-5xl font-semibold text-lime-400">
                      {formatAmount(totals.total)}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-x-3 gap-y-1 md:grid-cols-2">
                    {[
                      ["Sub Total :", formatAmount(totals.subtotal, 4)],
                      ["Sub Total No Obj.", formatAmount(totals.subtotalNoObj, 4)],
                      ["Descuento %:", formatAmount(totals.descuentoPct)],
                      ["Sub Total Exento", formatAmount(totals.subtotalExento, 4)],
                      ["Descuento $:", formatAmount(totals.descuentoValor)],
                      ["Total ICE:", formatAmount(totals.totalIce)],
                      ["Sub Total Neto :", formatAmount(totals.subtotalNeto, 4)],
                      ["Total IVA:", formatAmount(totals.totalIva)],
                      ["Sub Total Con IVA:", formatAmount(totals.subtotalConIva, 4)],
                      ["Total IVA 5%:", formatAmount(totals.totalIva5)],
                      ["Sub Total IVA 5%:", formatAmount(totals.subtotalIva5, 4)],
                      ["Propina:", formatAmount(totals.propina)],
                      ["Sub Total IVA 0%:", formatAmount(totals.subtotalIva0, 4)],
                      ["Total:", formatAmount(totals.total)],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[1fr_116px] items-center gap-2">
                        <label
                          className={`text-sm ${
                            label === "Total:" ? "font-bold text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {label}
                        </label>
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
                <button
                  type="button"
                  onClick={handleQuitar}
                  className="rounded-sm bg-[#f29c9c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#e18787]"
                >
                  Quitar
                </button>
                <button type="button" onClick={handleSeries} className={compactButtonClass}>
                  Series
                </button>
                <button type="button" onClick={handleLotes} className={compactButtonClass}>
                  Lotes
                </button>
                <button
                  type="button"
                  onClick={handleAbrirCaja}
                  className="rounded-sm bg-[#f39a1f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]"
                >
                  Abrir Caja
                </button>
                <button
                  type="button"
                  onClick={handleEgresoCaja}
                  className="rounded-sm bg-[#f5bd7b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#e0aa69]"
                >
                  Egreso Caja
                </button>
              </div>

              <p className="mt-2 text-center text-[18px] font-bold text-red-600">
                MODO DE AUTORIZACION : PRUEBAS
              </p>

              <div className="mt-3 overflow-hidden border border-slate-300">
                <div className="flex border-b border-slate-300 bg-white">
                  {[
                    { key: "detalles", label: "Detalles" },
                    { key: "informacion", label: "Informacion Adicional" },
                    { key: "observacion", label: "Observacion" },
                  ].map((tab) => {
                    const isActive = activeBottomTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() =>
                          setActiveBottomTab(
                            tab.key as "detalles" | "informacion" | "observacion",
                          )
                        }
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
                                  onChange={(event) =>
                                    updateRow(row.id, "descuento", event.target.value)
                                  }
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
                  ) : activeBottomTab === "informacion" ? (
                    <div className="min-h-[390px] p-4">
                      <textarea
                        className={`min-h-[320px] w-full border border-slate-300 px-3 py-2 text-sm outline-none ${
                          isEditing ? "bg-white text-slate-800" : "bg-slate-100 text-slate-500"
                        }`}
                        value={form.informacionAdicional}
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateField("informacionAdicional", event.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className="min-h-[390px] p-4">
                      <textarea
                        className={`min-h-[320px] w-full border border-slate-300 px-3 py-2 text-sm outline-none ${
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
                <p>Creacion: 08/08/2026 10:00</p>
                <p>Modificacion: 08/08/2026 10:15</p>
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Forma de Cobro</p>
                <select
                  className={`${inputClassName} mt-3`}
                  value={form.formaCobro}
                  disabled={!isEditing}
                  onChange={(event) => updateField("formaCobro", event.target.value)}
                >
                  <option>Contado</option>
                  <option>Credito 15 dias</option>
                  <option>Transferencia</option>
                  <option>Tarjeta</option>
                </select>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Esta pestana ya permite dejar definido el modo de cobro del comprobante
                  mientras seguimos desarrollando la integracion completa con caja,
                  cartera y cuentas por cobrar.
                </p>
              </div>

              <div className="rounded-sm border border-slate-200 bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-slate-800">Resumen rapido</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Cliente: {form.nombreCliente || "Sin cliente asignado"}</p>
                  <p>Forma de cobro: {form.formaCobro}</p>
                  <p>Items en detalle: {form.detalle.length}</p>
                  <p>Total estimado: {formatAmount(totals.total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
