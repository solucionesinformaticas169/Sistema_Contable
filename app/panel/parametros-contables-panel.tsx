"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveParametrosContablesAction,
  type SaveParametrosContablesState,
} from "./parametros-contables-actions";

type ContabilizacionTipo =
  | "no_contabilizar"
  | "contabilizar"
  | "contabilizar_y_ver_asiento";

type AccountCatalogItem = {
  codigo: string;
  nombre: string;
};

type ParametrosContablesPanelProps = {
  empresa: {
    id: number;
    generaAsientosContables: boolean;
    tipoModificacionAsientos: string;
    centrosCostos: boolean;
    productosSinIvaInventarioCodigo: string;
    productosSinIvaInventarioNombre: string;
    productosSinIvaVentasCodigo: string;
    productosSinIvaVentasNombre: string;
    productosSinIvaCostoCodigo: string;
    productosSinIvaCostoNombre: string;
    productosConIvaInventarioCodigo: string;
    productosConIvaInventarioNombre: string;
    productosConIvaVentasCodigo: string;
    productosConIvaVentasNombre: string;
    productosConIvaCostoCodigo: string;
    productosConIvaCostoNombre: string;
    tipoContabilizacionIngresos: ContabilizacionTipo;
    tipoContabilizacionSalidas: ContabilizacionTipo;
    ccCajasCodigo: string;
    ccCajasNombre: string;
    ccBancosCodigo: string;
    ccBancosNombre: string;
    ccClientesCodigo: string;
    ccClientesNombre: string;
    ccProveedoresCodigo: string;
    ccProveedoresNombre: string;
    ccRecepcionesCodigo: string;
    ccRecepcionesNombre: string;
    ccIvaComprasCodigo: string;
    ccIvaComprasNombre: string;
    ccIvaPresuntivoCodigo: string;
    ccIvaPresuntivoNombre: string;
    ccIrPresuntivoCodigo: string;
    ccIrPresuntivoNombre: string;
    ccIceComprasCodigo: string;
    ccIceComprasNombre: string;
    ccAsumeRetCodigo: string;
    ccAsumeRetNombre: string;
    ccIvaVentasCodigo: string;
    ccIvaVentasNombre: string;
    ccIceVentasCodigo: string;
    ccIceVentasNombre: string;
    ccPropinaVentasCodigo: string;
    ccPropinaVentasNombre: string;
    ccInteresVentasCodigo: string;
    ccInteresVentasNombre: string;
    tipoContabilizacionCajas: ContabilizacionTipo;
    tipoContabilizacionBancos: ContabilizacionTipo;
    tipoContabilizacionCompras: ContabilizacionTipo;
    tipoContabilizacionVentas: ContabilizacionTipo;
    cobrosAnticiposCodigo: string;
    cobrosAnticiposNombre: string;
    cobrosCruceCodigo: string;
    cobrosCruceNombre: string;
    cobrosRetAtrasadaCodigo: string;
    cobrosRetAtrasadaNombre: string;
    tipoContabilidadCobros: ContabilizacionTipo;
    pagosAnticiposCodigo: string;
    pagosAnticiposNombre: string;
    pagosCruceCodigo: string;
    pagosCruceNombre: string;
    tipoContabilidadPagos: ContabilizacionTipo;
    cajaTransitoriaCodigo: string;
    cajaTransitoriaNombre: string;
    bancosTransitoriaCodigo: string;
    bancosTransitoriaNombre: string;
    vouchersComisionCodigo: string;
    vouchersComisionNombre: string;
    tipoContabilizacionDepositos: ContabilizacionTipo;
    nominaSueldoBasico: string;
    tipoContabilidadNomina: string;
  };
};

type FormValues = ParametrosContablesPanelProps["empresa"];
type AccountFieldKey = {
  [K in keyof FormValues]: FormValues[K] extends string ? K : never;
}[keyof FormValues];
type SearchTarget = {
  codeField: AccountFieldKey;
  descField: AccountFieldKey;
  title: string;
};

const tabs = [
  { key: "generales", label: "Generales" },
  { key: "productos", label: "Productos" },
  { key: "compras-ventas", label: "Compras & Ventas" },
  { key: "cobros", label: "Cobros" },
  { key: "pagos", label: "Pagos" },
  { key: "caja-bancos", label: "Caja & Bancos" },
  { key: "nomina", label: "Nomina" },
] as const;

const contabilizacionOptions = [
  { value: "no_contabilizar", label: "No Contabilizar" },
  { value: "contabilizar", label: "Contabilizar" },
  {
    value: "contabilizar_y_ver_asiento",
    label: "Contabilizar y ver Asiento Contable",
  },
] as const;

const baseAccountCatalog: AccountCatalogItem[] = [
  { codigo: "1.1.03.01.02", nombre: "Inventarios De Prod. Terminados Sin Iva" },
  { codigo: "4.1.01.02", nombre: "Ventas Bienes Sin Iva" },
  { codigo: "5.1.01.01.02", nombre: "Costo De Ventas Mercaderia Sin Iva" },
  { codigo: "1.1.03.01.01", nombre: "Inventarios De Prod. Terminados Con Iva" },
  { codigo: "4.1.01.01", nombre: "Ventas Bienes Con Iva" },
  { codigo: "5.1.01.01.01", nombre: "Costo De Ventas Mercaderia Con Iva" },
  { codigo: "1.1.01.01.01", nombre: "Caja General" },
  { codigo: "1.1.01.02.01", nombre: "Banco Pichincha" },
  { codigo: "1.1.02.05.01", nombre: "Clientes" },
  { codigo: "2.1.03.01.01", nombre: "Proveedores Locales" },
  { codigo: "1.1.03.01.06", nombre: "Inventario Transitorio Recepciones de Compras" },
  { codigo: "1.1.05.01.01", nombre: "Iva En Compras" },
  { codigo: "5.3.01.20.08", nombre: "Ga- Impuesto Consumos Especiales Ice" },
  { codigo: "5.2.01.27.12", nombre: "Gv - Gastos Retenciones Asumidas" },
  { codigo: "2.1.07.01.02.01", nombre: "Iva En Ventas O Servicios" },
  { codigo: "2.1.07.01.04.01", nombre: "ICE En Ventas" },
  { codigo: "2.1.09.02.99", nombre: "Otras Cuentas Por Pagar Propinas" },
  { codigo: "4.2.01.99", nombre: "Intereses Diferidos" },
  { codigo: "2.1.10.01.01", nombre: "Anticipo De Cliente Cobro Cartera" },
  { codigo: "1.1.02.05.04", nombre: "Transitoria Cruce Clientes (Siempre Cero)" },
  { codigo: "1.1.04.03.03", nombre: "Anticipo Otros Proveedores" },
  { codigo: "2.1.03.01.03", nombre: "Transitoria Cruce Proveedores (Siempre Cero)" },
  { codigo: "1.1.01.01.05", nombre: "Transferencias Internas (Cero)" },
  { codigo: "5.2.01.27.04", nombre: "Gv - Comisiones Tarjetas De Credito" },
];

export function ParametrosContablesPanel({
  empresa,
}: ParametrosContablesPanelProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["key"]>("generales");
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(empresa);
  const [state, formAction] = useActionState<
    SaveParametrosContablesState,
    FormData
  >(saveParametrosContablesAction, {
    error: null,
    success: null,
  });

  useEffect(() => {
    setValues(empresa);
  }, [empresa]);

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
      setAssignmentNotice(null);
    }
  }, [state.success]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function openAccountSearch(
    codeField: AccountFieldKey,
    descField: AccountFieldKey,
    title: string,
  ) {
    if (!isEditing) {
      return;
    }

    setSearchTarget({ codeField, descField, title });
    setSearchTerm("");
  }

  function assignAccount(account: AccountCatalogItem) {
    if (!searchTarget) {
      return;
    }

    setValues((current) => ({
      ...current,
      [searchTarget.codeField]: account.codigo,
      [searchTarget.descField]: account.nombre,
    }));
    setSearchTarget(null);
    setSearchTerm("");
  }

  function assignProductAccounts() {
    if (!isEditing) {
      return;
    }

    setValues((current) => ({
      ...current,
      productosSinIvaInventarioCodigo: "1.1.03.01.02",
      productosSinIvaInventarioNombre:
        "Inventarios De Prod. Terminados Sin Iva",
      productosSinIvaVentasCodigo: "4.1.01.02",
      productosSinIvaVentasNombre: "Ventas Bienes Sin Iva",
      productosSinIvaCostoCodigo: "5.1.01.01.02",
      productosSinIvaCostoNombre: "Costo De Ventas Mercaderia Sin Iva",
      productosConIvaInventarioCodigo: "1.1.03.01.01",
      productosConIvaInventarioNombre:
        "Inventarios De Prod. Terminados Con Iva",
      productosConIvaVentasCodigo: "4.1.01.01",
      productosConIvaVentasNombre: "Ventas Bienes Con Iva",
      productosConIvaCostoCodigo: "5.1.01.01.01",
      productosConIvaCostoNombre: "Costo De Ventas Mercaderia Con Iva",
      tipoContabilizacionIngresos: "contabilizar",
      tipoContabilizacionSalidas: "contabilizar",
    }));
    setAssignmentNotice(
      "Se cargaron cuentas base para la pestana Productos. Revisa y luego guarda.",
    );
  }

  function assignComprasVentasAccounts() {
    if (!isEditing) {
      return;
    }

    setValues((current) => ({
      ...current,
      ccCajasCodigo: "1.1.01.01.01",
      ccCajasNombre: "Caja General",
      ccBancosCodigo: "1.1.01.02.01",
      ccBancosNombre: "Banco Pichincha",
      ccClientesCodigo: "1.1.02.05.01",
      ccClientesNombre: "Clientes",
      ccProveedoresCodigo: "2.1.03.01.01",
      ccProveedoresNombre: "Proveedores Locales",
      ccRecepcionesCodigo: "1.1.03.01.06",
      ccRecepcionesNombre: "Inventario Transitorio Recepciones de Compras",
      ccIvaComprasCodigo: "1.1.05.01.01",
      ccIvaComprasNombre: "Iva En Compras",
      ccIvaPresuntivoCodigo: "1.1.05.01.01",
      ccIvaPresuntivoNombre: "Iva En Compras",
      ccIrPresuntivoCodigo: "1.1.05.01.01",
      ccIrPresuntivoNombre: "Iva En Compras",
      ccIceComprasCodigo: "5.3.01.20.08",
      ccIceComprasNombre: "Ga- Impuesto Consumos Especiales Ice",
      ccAsumeRetCodigo: "5.2.01.27.12",
      ccAsumeRetNombre: "Gv - Gastos Retenciones Asumidas",
      ccIvaVentasCodigo: "2.1.07.01.02.01",
      ccIvaVentasNombre: "Iva En Ventas O Servicios",
      ccIceVentasCodigo: "2.1.07.01.04.01",
      ccIceVentasNombre: "ICE En Ventas",
      ccPropinaVentasCodigo: "2.1.09.02.99",
      ccPropinaVentasNombre: "Otras Cuentas Por Pagar Propinas",
      ccInteresVentasCodigo: "4.2.01.99",
      ccInteresVentasNombre: "Intereses Diferidos",
      tipoContabilizacionCajas: "contabilizar",
      tipoContabilizacionBancos: "contabilizar",
      tipoContabilizacionCompras: "contabilizar",
      tipoContabilizacionVentas: "contabilizar",
    }));
    setAssignmentNotice(
      "Se cargaron cuentas base para la pestana Compras & Ventas. Revisa y luego guarda.",
    );
  }

  const accountCatalog = useMemo(() => {
    const dynamicPairs: AccountCatalogItem[] = [
      {
        codigo: values.productosSinIvaInventarioCodigo,
        nombre: values.productosSinIvaInventarioNombre,
      },
      {
        codigo: values.productosSinIvaVentasCodigo,
        nombre: values.productosSinIvaVentasNombre,
      },
      {
        codigo: values.productosSinIvaCostoCodigo,
        nombre: values.productosSinIvaCostoNombre,
      },
      {
        codigo: values.productosConIvaInventarioCodigo,
        nombre: values.productosConIvaInventarioNombre,
      },
      {
        codigo: values.productosConIvaVentasCodigo,
        nombre: values.productosConIvaVentasNombre,
      },
      {
        codigo: values.productosConIvaCostoCodigo,
        nombre: values.productosConIvaCostoNombre,
      },
      { codigo: values.ccCajasCodigo, nombre: values.ccCajasNombre },
      { codigo: values.ccBancosCodigo, nombre: values.ccBancosNombre },
      { codigo: values.ccClientesCodigo, nombre: values.ccClientesNombre },
      { codigo: values.ccProveedoresCodigo, nombre: values.ccProveedoresNombre },
      { codigo: values.ccRecepcionesCodigo, nombre: values.ccRecepcionesNombre },
      { codigo: values.ccIvaComprasCodigo, nombre: values.ccIvaComprasNombre },
      {
        codigo: values.ccIvaPresuntivoCodigo,
        nombre: values.ccIvaPresuntivoNombre,
      },
      { codigo: values.ccIrPresuntivoCodigo, nombre: values.ccIrPresuntivoNombre },
      { codigo: values.ccIceComprasCodigo, nombre: values.ccIceComprasNombre },
      { codigo: values.ccAsumeRetCodigo, nombre: values.ccAsumeRetNombre },
      { codigo: values.ccIvaVentasCodigo, nombre: values.ccIvaVentasNombre },
      { codigo: values.ccIceVentasCodigo, nombre: values.ccIceVentasNombre },
      {
        codigo: values.ccPropinaVentasCodigo,
        nombre: values.ccPropinaVentasNombre,
      },
      {
        codigo: values.ccInteresVentasCodigo,
        nombre: values.ccInteresVentasNombre,
      },
      {
        codigo: values.cobrosAnticiposCodigo,
        nombre: values.cobrosAnticiposNombre,
      },
      { codigo: values.cobrosCruceCodigo, nombre: values.cobrosCruceNombre },
      {
        codigo: values.cobrosRetAtrasadaCodigo,
        nombre: values.cobrosRetAtrasadaNombre,
      },
      { codigo: values.pagosAnticiposCodigo, nombre: values.pagosAnticiposNombre },
      { codigo: values.pagosCruceCodigo, nombre: values.pagosCruceNombre },
      {
        codigo: values.cajaTransitoriaCodigo,
        nombre: values.cajaTransitoriaNombre,
      },
      {
        codigo: values.bancosTransitoriaCodigo,
        nombre: values.bancosTransitoriaNombre,
      },
      {
        codigo: values.vouchersComisionCodigo,
        nombre: values.vouchersComisionNombre,
      },
    ];
    const map = new Map<string, AccountCatalogItem>();

    [...baseAccountCatalog, ...dynamicPairs].forEach((item) => {
      if (!item.codigo || !item.nombre) {
        return;
      }
      map.set(`${item.codigo}::${item.nombre}`, item);
    });

    return Array.from(map.values());
  }, [values]);

  const filteredAccounts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return accountCatalog;
    }

    return accountCatalog.filter(
      (item) =>
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term),
    );
  }, [accountCatalog, searchTerm]);

  const inputClassName = useMemo(
    () =>
      isEditing
        ? "h-8 w-full border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
        : "h-8 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500",
    [isEditing],
  );

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <form action={formAction}>
        <input type="hidden" name="empresaId" value={empresa.id} />

        <div className="flex flex-wrap items-center gap-2 pb-4">
          <SaveToolbarButton enabled={isEditing} />
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center rounded-sm bg-[#60b95c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#50a64c]"
          >
            Modificar
          </button>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-contables`}
            className="inline-flex items-center rounded-sm bg-[#30404d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24323d]"
          >
            Menu
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-contables&vista=formatos-fisicos`}
            className="inline-flex items-center rounded-sm bg-[#f49b16] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e18b0d]"
          >
            Cargar Formatos Fisicos
          </Link>
        </div>

        {state.error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        {assignmentNotice ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {assignmentNotice}
          </div>
        ) : null}

        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            isEditing
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <span>
            {isEditing
              ? "Modo edicion activo. Ya puedes cambiar las cuentas y la forma de contabilizacion."
              : "Modo lectura. Pulsa Modificar para habilitar los campos y el boton Guardar."}
          </span>
          <button
            type="button"
            onClick={() => setShowHelp((current) => !current)}
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Tutoriales
          </button>
        </div>

        {showHelp ? (
          <div className="mb-5 rounded-xl border border-[#d7e6f7] bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
            Cada pestana agrupa una parte distinta de la configuracion contable.
            Puedes revisar todo bloqueado y solo habilitar edicion cuando realmente
            vayas a cambiar cuentas o tipos de contabilizacion.
          </div>
        ) : null}

        <div className="overflow-hidden border border-slate-300">
          <div className="flex flex-wrap border-b border-slate-300 bg-white">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-r border-slate-300 px-4 py-2 text-[15px] transition ${
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

          <div className="min-h-[640px] bg-white p-6">
            {activeTab === "generales" ? (
              <div className="grid gap-8 xl:grid-cols-[1fr_180px]">
                <div className="space-y-8">
                  <RadioBlock
                    title="Genera Asientos Contables"
                    name="generaAsientosContables"
                    value={values.generaAsientosContables ? "si" : "no"}
                    disabled={!isEditing}
                    options={[
                      { value: "si", label: "SI" },
                      { value: "no", label: "NO" },
                    ]}
                    onChange={(value) =>
                      updateField("generaAsientosContables", value === "si")
                    }
                  />

                  <RadioBlock
                    title="Tipo Modificación de Asientos"
                    name="tipoModificacionAsientos"
                    value={values.tipoModificacionAsientos}
                    disabled={!isEditing}
                    options={[
                      {
                        value: "eliminar",
                        label: "Eliminar Asientos Anterior",
                      },
                      {
                        value: "anular",
                        label: "Anular Asiento Anterior",
                      },
                    ]}
                    onChange={(value) =>
                      updateField("tipoModificacionAsientos", value)
                    }
                  />

                  <CheckboxLine
                    label="Centros de Costos"
                    name="centrosCostos"
                    checked={values.centrosCostos}
                    disabled={!isEditing}
                    onChange={(checked) => updateField("centrosCostos", checked)}
                  />
                </div>
              </div>
            ) : null}

            {activeTab === "productos" ? (
              <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-8">
                  <AccountGroup title="Cuentas Contables Productos sin IVA">
                    <AccountRow
                      label="C.C. Inventario:"
                      codeName="productosSinIvaInventarioCodigo"
                      codeValue={values.productosSinIvaInventarioCodigo}
                      descName="productosSinIvaInventarioNombre"
                      descValue={values.productosSinIvaInventarioNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosSinIvaInventarioCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosSinIvaInventarioNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosSinIvaInventarioCodigo",
                          "productosSinIvaInventarioNombre",
                          "Buscar cuenta de inventario sin IVA",
                        )
                      }
                    />
                    <AccountRow
                      label="C.C. Ventas:"
                      codeName="productosSinIvaVentasCodigo"
                      codeValue={values.productosSinIvaVentasCodigo}
                      descName="productosSinIvaVentasNombre"
                      descValue={values.productosSinIvaVentasNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosSinIvaVentasCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosSinIvaVentasNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosSinIvaVentasCodigo",
                          "productosSinIvaVentasNombre",
                          "Buscar cuenta de ventas sin IVA",
                        )
                      }
                    />
                    <AccountRow
                      label="C.C. Costo:"
                      codeName="productosSinIvaCostoCodigo"
                      codeValue={values.productosSinIvaCostoCodigo}
                      descName="productosSinIvaCostoNombre"
                      descValue={values.productosSinIvaCostoNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosSinIvaCostoCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosSinIvaCostoNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosSinIvaCostoCodigo",
                          "productosSinIvaCostoNombre",
                          "Buscar cuenta de costo sin IVA",
                        )
                      }
                    />
                  </AccountGroup>

                  <AccountGroup title="Cuentas Contables Productos con IVA">
                    <AccountRow
                      label="C.C. Inventario:"
                      codeName="productosConIvaInventarioCodigo"
                      codeValue={values.productosConIvaInventarioCodigo}
                      descName="productosConIvaInventarioNombre"
                      descValue={values.productosConIvaInventarioNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosConIvaInventarioCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosConIvaInventarioNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosConIvaInventarioCodigo",
                          "productosConIvaInventarioNombre",
                          "Buscar cuenta de inventario con IVA",
                        )
                      }
                    />
                    <AccountRow
                      label="C.C. Ventas:"
                      codeName="productosConIvaVentasCodigo"
                      codeValue={values.productosConIvaVentasCodigo}
                      descName="productosConIvaVentasNombre"
                      descValue={values.productosConIvaVentasNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosConIvaVentasCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosConIvaVentasNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosConIvaVentasCodigo",
                          "productosConIvaVentasNombre",
                          "Buscar cuenta de ventas con IVA",
                        )
                      }
                    />
                    <AccountRow
                      label="C.C. Costo:"
                      codeName="productosConIvaCostoCodigo"
                      codeValue={values.productosConIvaCostoCodigo}
                      descName="productosConIvaCostoNombre"
                      descValue={values.productosConIvaCostoNombre}
                      disabled={!isEditing}
                      inputClassName={inputClassName}
                      onCodeChange={(value) =>
                        updateField("productosConIvaCostoCodigo", value)
                      }
                      onDescChange={(value) =>
                        updateField("productosConIvaCostoNombre", value)
                      }
                      onSearch={() =>
                        openAccountSearch(
                          "productosConIvaCostoCodigo",
                          "productosConIvaCostoNombre",
                          "Buscar cuenta de costo con IVA",
                        )
                      }
                    />
                  </AccountGroup>
                </div>

                <div className="space-y-8">
                  <ContabilizacionCard
                    title="Tipo Contabilización Ingresos"
                    name="tipoContabilizacionIngresos"
                    value={values.tipoContabilizacionIngresos}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateField("tipoContabilizacionIngresos", value)
                    }
                  />
                  <ContabilizacionCard
                    title="Tipo Contabilización Salidas"
                    name="tipoContabilizacionSalidas"
                    value={values.tipoContabilizacionSalidas}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateField("tipoContabilizacionSalidas", value)
                    }
                  />
                  <BrownButton
                    label="Asignar Cuentas"
                    disabled={!isEditing}
                    onClick={assignProductAccounts}
                  />
                </div>
              </div>
            ) : null}

            {activeTab === "compras-ventas" ? (
              <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <AccountRow label="C.C. Cajas:" codeName="ccCajasCodigo" codeValue={values.ccCajasCodigo} descName="ccCajasNombre" descValue={values.ccCajasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccCajasCodigo", value)} onDescChange={(value) => updateField("ccCajasNombre", value)} onSearch={() => openAccountSearch("ccCajasCodigo", "ccCajasNombre", "Buscar cuenta de cajas")} />
                    <AccountRow label="C.C. Bancos:" codeName="ccBancosCodigo" codeValue={values.ccBancosCodigo} descName="ccBancosNombre" descValue={values.ccBancosNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccBancosCodigo", value)} onDescChange={(value) => updateField("ccBancosNombre", value)} onSearch={() => openAccountSearch("ccBancosCodigo", "ccBancosNombre", "Buscar cuenta de bancos")} />
                    <AccountRow label="C.C. Clientes:" codeName="ccClientesCodigo" codeValue={values.ccClientesCodigo} descName="ccClientesNombre" descValue={values.ccClientesNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccClientesCodigo", value)} onDescChange={(value) => updateField("ccClientesNombre", value)} onSearch={() => openAccountSearch("ccClientesCodigo", "ccClientesNombre", "Buscar cuenta de clientes")} />
                    <AccountRow label="C.C. Proveedores:" codeName="ccProveedoresCodigo" codeValue={values.ccProveedoresCodigo} descName="ccProveedoresNombre" descValue={values.ccProveedoresNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccProveedoresCodigo", value)} onDescChange={(value) => updateField("ccProveedoresNombre", value)} onSearch={() => openAccountSearch("ccProveedoresCodigo", "ccProveedoresNombre", "Buscar cuenta de proveedores")} />
                    <AccountRow label="C.C. Recepciones:" codeName="ccRecepcionesCodigo" codeValue={values.ccRecepcionesCodigo} descName="ccRecepcionesNombre" descValue={values.ccRecepcionesNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccRecepcionesCodigo", value)} onDescChange={(value) => updateField("ccRecepcionesNombre", value)} onSearch={() => openAccountSearch("ccRecepcionesCodigo", "ccRecepcionesNombre", "Buscar cuenta de recepciones")} />
                  </div>

                  <AccountGroup title="Cuentas Contables Compras">
                    <AccountRow label="C.C. IVA Compras:" codeName="ccIvaComprasCodigo" codeValue={values.ccIvaComprasCodigo} descName="ccIvaComprasNombre" descValue={values.ccIvaComprasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIvaComprasCodigo", value)} onDescChange={(value) => updateField("ccIvaComprasNombre", value)} onSearch={() => openAccountSearch("ccIvaComprasCodigo", "ccIvaComprasNombre", "Buscar cuenta IVA compras")} />
                    <AccountRow label="C.C. IVA Presuntivo:" codeName="ccIvaPresuntivoCodigo" codeValue={values.ccIvaPresuntivoCodigo} descName="ccIvaPresuntivoNombre" descValue={values.ccIvaPresuntivoNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIvaPresuntivoCodigo", value)} onDescChange={(value) => updateField("ccIvaPresuntivoNombre", value)} onSearch={() => openAccountSearch("ccIvaPresuntivoCodigo", "ccIvaPresuntivoNombre", "Buscar cuenta IVA presuntivo")} />
                    <AccountRow label="C.C. IR Presuntivo:" codeName="ccIrPresuntivoCodigo" codeValue={values.ccIrPresuntivoCodigo} descName="ccIrPresuntivoNombre" descValue={values.ccIrPresuntivoNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIrPresuntivoCodigo", value)} onDescChange={(value) => updateField("ccIrPresuntivoNombre", value)} onSearch={() => openAccountSearch("ccIrPresuntivoCodigo", "ccIrPresuntivoNombre", "Buscar cuenta IR presuntivo")} />
                    <AccountRow label="C.C. ICE:" codeName="ccIceComprasCodigo" codeValue={values.ccIceComprasCodigo} descName="ccIceComprasNombre" descValue={values.ccIceComprasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIceComprasCodigo", value)} onDescChange={(value) => updateField("ccIceComprasNombre", value)} onSearch={() => openAccountSearch("ccIceComprasCodigo", "ccIceComprasNombre", "Buscar cuenta ICE compras")} />
                    <AccountRow label="C.C. Asume Ret.:" codeName="ccAsumeRetCodigo" codeValue={values.ccAsumeRetCodigo} descName="ccAsumeRetNombre" descValue={values.ccAsumeRetNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccAsumeRetCodigo", value)} onDescChange={(value) => updateField("ccAsumeRetNombre", value)} onSearch={() => openAccountSearch("ccAsumeRetCodigo", "ccAsumeRetNombre", "Buscar cuenta retenciones asumidas")} />
                  </AccountGroup>

                  <AccountGroup title="Cuentas Contables Ventas">
                    <AccountRow label="C.C. IVA Ventas:" codeName="ccIvaVentasCodigo" codeValue={values.ccIvaVentasCodigo} descName="ccIvaVentasNombre" descValue={values.ccIvaVentasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIvaVentasCodigo", value)} onDescChange={(value) => updateField("ccIvaVentasNombre", value)} onSearch={() => openAccountSearch("ccIvaVentasCodigo", "ccIvaVentasNombre", "Buscar cuenta IVA ventas")} />
                    <AccountRow label="C.C. ICE Ventas:" codeName="ccIceVentasCodigo" codeValue={values.ccIceVentasCodigo} descName="ccIceVentasNombre" descValue={values.ccIceVentasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccIceVentasCodigo", value)} onDescChange={(value) => updateField("ccIceVentasNombre", value)} onSearch={() => openAccountSearch("ccIceVentasCodigo", "ccIceVentasNombre", "Buscar cuenta ICE ventas")} />
                    <AccountRow label="C.C. Propina Ventas:" codeName="ccPropinaVentasCodigo" codeValue={values.ccPropinaVentasCodigo} descName="ccPropinaVentasNombre" descValue={values.ccPropinaVentasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccPropinaVentasCodigo", value)} onDescChange={(value) => updateField("ccPropinaVentasNombre", value)} onSearch={() => openAccountSearch("ccPropinaVentasCodigo", "ccPropinaVentasNombre", "Buscar cuenta propina ventas")} />
                    <AccountRow label="C.C. Interes Ventas:" codeName="ccInteresVentasCodigo" codeValue={values.ccInteresVentasCodigo} descName="ccInteresVentasNombre" descValue={values.ccInteresVentasNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("ccInteresVentasCodigo", value)} onDescChange={(value) => updateField("ccInteresVentasNombre", value)} onSearch={() => openAccountSearch("ccInteresVentasCodigo", "ccInteresVentasNombre", "Buscar cuenta interes ventas")} />
                  </AccountGroup>
                </div>

                <div className="space-y-8">
                  <ContabilizacionCard title="Tipo Contabilización Cajas" name="tipoContabilizacionCajas" value={values.tipoContabilizacionCajas} disabled={!isEditing} onChange={(value) => updateField("tipoContabilizacionCajas", value)} />
                  <ContabilizacionCard title="Tipo Contabilización Bancos" name="tipoContabilizacionBancos" value={values.tipoContabilizacionBancos} disabled={!isEditing} onChange={(value) => updateField("tipoContabilizacionBancos", value)} />
                  <BrownButton
                    label="Asignar Cuentas"
                    disabled={!isEditing}
                    onClick={assignComprasVentasAccounts}
                  />
                  <ContabilizacionCard title="Tipo Contabilización Compras" name="tipoContabilizacionCompras" value={values.tipoContabilizacionCompras} disabled={!isEditing} onChange={(value) => updateField("tipoContabilizacionCompras", value)} />
                  <ContabilizacionCard title="Tipo Contabilización Ventas" name="tipoContabilizacionVentas" value={values.tipoContabilizacionVentas} disabled={!isEditing} onChange={(value) => updateField("tipoContabilizacionVentas", value)} />
                </div>
              </div>
            ) : null}

            {activeTab === "cobros" ? (
              <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-8">
                  <AccountGroup title="Cuentas Contables Anticipo">
                    <AccountRow label="C.C. Anticipos:" codeName="cobrosAnticiposCodigo" codeValue={values.cobrosAnticiposCodigo} descName="cobrosAnticiposNombre" descValue={values.cobrosAnticiposNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("cobrosAnticiposCodigo", value)} onDescChange={(value) => updateField("cobrosAnticiposNombre", value)} onSearch={() => openAccountSearch("cobrosAnticiposCodigo", "cobrosAnticiposNombre", "Buscar cuenta anticipos cobros")} />
                    <AccountRow label="C.C. Transitoria Cruce:" codeName="cobrosCruceCodigo" codeValue={values.cobrosCruceCodigo} descName="cobrosCruceNombre" descValue={values.cobrosCruceNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("cobrosCruceCodigo", value)} onDescChange={(value) => updateField("cobrosCruceNombre", value)} multilineLabel onSearch={() => openAccountSearch("cobrosCruceCodigo", "cobrosCruceNombre", "Buscar cuenta transitoria cobros")} />
                  </AccountGroup>
                  <AccountRow label="C.C. Ret. Atrasada:" codeName="cobrosRetAtrasadaCodigo" codeValue={values.cobrosRetAtrasadaCodigo} descName="cobrosRetAtrasadaNombre" descValue={values.cobrosRetAtrasadaNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("cobrosRetAtrasadaCodigo", value)} onDescChange={(value) => updateField("cobrosRetAtrasadaNombre", value)} onSearch={() => openAccountSearch("cobrosRetAtrasadaCodigo", "cobrosRetAtrasadaNombre", "Buscar cuenta retencion atrasada")} />
                </div>
                <div>
                  <ContabilizacionCard title="Tipo Contabilidad Cobros" name="tipoContabilidadCobros" value={values.tipoContabilidadCobros} disabled={!isEditing} onChange={(value) => updateField("tipoContabilidadCobros", value)} />
                </div>
              </div>
            ) : null}

            {activeTab === "pagos" ? (
              <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-8">
                  <AccountGroup title="Cuentas Contables Anticipo">
                    <AccountRow label="C.C. Anticipos:" codeName="pagosAnticiposCodigo" codeValue={values.pagosAnticiposCodigo} descName="pagosAnticiposNombre" descValue={values.pagosAnticiposNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("pagosAnticiposCodigo", value)} onDescChange={(value) => updateField("pagosAnticiposNombre", value)} onSearch={() => openAccountSearch("pagosAnticiposCodigo", "pagosAnticiposNombre", "Buscar cuenta anticipos pagos")} />
                    <AccountRow label="C.C. Transitoria Cruce:" codeName="pagosCruceCodigo" codeValue={values.pagosCruceCodigo} descName="pagosCruceNombre" descValue={values.pagosCruceNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("pagosCruceCodigo", value)} onDescChange={(value) => updateField("pagosCruceNombre", value)} multilineLabel onSearch={() => openAccountSearch("pagosCruceCodigo", "pagosCruceNombre", "Buscar cuenta transitoria pagos")} />
                  </AccountGroup>
                </div>
                <div>
                  <ContabilizacionCard title="Tipo Contabilidad Pagos" name="tipoContabilidadPagos" value={values.tipoContabilidadPagos} disabled={!isEditing} onChange={(value) => updateField("tipoContabilidadPagos", value)} />
                </div>
              </div>
            ) : null}

            {activeTab === "caja-bancos" ? (
              <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-8">
                  <AccountRow label="C.C. Transitoria Cajas:" codeName="cajaTransitoriaCodigo" codeValue={values.cajaTransitoriaCodigo} descName="cajaTransitoriaNombre" descValue={values.cajaTransitoriaNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("cajaTransitoriaCodigo", value)} onDescChange={(value) => updateField("cajaTransitoriaNombre", value)} onSearch={() => openAccountSearch("cajaTransitoriaCodigo", "cajaTransitoriaNombre", "Buscar cuenta transitoria cajas")} />
                  <AccountRow label="C.C. Transitoria Bancos:" codeName="bancosTransitoriaCodigo" codeValue={values.bancosTransitoriaCodigo} descName="bancosTransitoriaNombre" descValue={values.bancosTransitoriaNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("bancosTransitoriaCodigo", value)} onDescChange={(value) => updateField("bancosTransitoriaNombre", value)} onSearch={() => openAccountSearch("bancosTransitoriaCodigo", "bancosTransitoriaNombre", "Buscar cuenta transitoria bancos")} />

                  <AccountGroup title="Cuentas Contables Vouchers">
                    <AccountRow label="C.C. Comisión Bancaria:" codeName="vouchersComisionCodigo" codeValue={values.vouchersComisionCodigo} descName="vouchersComisionNombre" descValue={values.vouchersComisionNombre} disabled={!isEditing} inputClassName={inputClassName} onCodeChange={(value) => updateField("vouchersComisionCodigo", value)} onDescChange={(value) => updateField("vouchersComisionNombre", value)} onSearch={() => openAccountSearch("vouchersComisionCodigo", "vouchersComisionNombre", "Buscar cuenta comision bancaria")} />
                  </AccountGroup>
                </div>
                <div>
                  <ContabilizacionCard title="Tipo Contabilización Depósitos" name="tipoContabilizacionDepositos" value={values.tipoContabilizacionDepositos} disabled={!isEditing} onChange={(value) => updateField("tipoContabilizacionDepositos", value)} />
                </div>
              </div>
            ) : null}

            {activeTab === "nomina" ? (
              <div className="space-y-16">
                <div className="grid max-w-[420px] grid-cols-[140px_1fr] items-center gap-3">
                  <label className="text-[15px] text-slate-700">Sueldo Basico:</label>
                  <input
                    name="nominaSueldoBasico"
                    value={values.nominaSueldoBasico}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateField("nominaSueldoBasico", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <RadioBlock
                  title="Tipo de Contabilidad"
                  name="tipoContabilidadNomina"
                  value={values.tipoContabilidadNomina}
                  disabled={!isEditing}
                  options={[
                    { value: "general", label: "Contabilidad General" },
                    {
                      value: "departamentos",
                      label: "Contabilidad por Departamentos",
                    },
                  ]}
                  onChange={(value) => updateField("tipoContabilidadNomina", value)}
                />
              </div>
            ) : null}
          </div>
        </div>
        {searchTarget ? (
          <AccountSearchModal
            title={searchTarget.title}
            searchTerm={searchTerm}
            accounts={filteredAccounts}
            onSearchTermChange={setSearchTerm}
            onClose={() => {
              setSearchTarget(null);
              setSearchTerm("");
            }}
            onSelect={assignAccount}
          />
        ) : null}
      </form>
    </div>
  );
}

function AccountGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="bg-[#ffd1cc] px-3 py-1.5 text-[15px] text-[#d44f3a]">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function AccountRow({
  label,
  codeName,
  codeValue,
  descName,
  descValue,
  disabled,
  inputClassName,
  onCodeChange,
  onDescChange,
  onSearch,
  multilineLabel = false,
}: {
  label: string;
  codeName: string;
  codeValue: string;
  descName: string;
  descValue: string;
  disabled: boolean;
  inputClassName: string;
  onCodeChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSearch: () => void;
  multilineLabel?: boolean;
}) {
  return (
    <div className="grid grid-cols-[150px_190px_40px_1fr] items-center gap-2">
      <label
        className={`text-[15px] text-slate-700 ${multilineLabel ? "leading-5" : ""}`}
      >
        {label}
      </label>
      <input
        name={codeName}
        value={codeValue}
        disabled={disabled}
        onChange={(event) => onCodeChange(event.target.value)}
        className={inputClassName}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={onSearch}
        className={`h-8 rounded-none text-lg font-semibold text-white ${
          disabled ? "bg-[#f6d89a]" : "bg-[#f4c27b] hover:bg-[#e6b15f]"
        }`}
        aria-label={`Buscar ${label}`}
      >
        🔍
      </button>
      <input
        name={descName}
        value={descValue}
        disabled={disabled}
        onChange={(event) => onDescChange(event.target.value)}
        className={`${inputClassName} border-x-0 border-t-0 bg-transparent px-0 ${
          disabled
            ? "border-slate-200 bg-transparent text-slate-500"
            : "border-slate-300 bg-transparent text-slate-700"
        }`}
      />
    </div>
  );
}

function RadioBlock({
  title,
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  title: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[15px] font-semibold text-slate-800">{title}</p>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 text-[15px] ${
            disabled ? "text-slate-400" : "text-slate-700"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxLine({
  label,
  name,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-[15px] ${
        disabled ? "text-slate-400" : "text-slate-700"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function ContabilizacionCard({
  title,
  name,
  value,
  disabled,
  onChange,
}: {
  title: string;
  name: string;
  value: ContabilizacionTipo;
  disabled: boolean;
  onChange: (value: ContabilizacionTipo) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[15px] font-semibold text-slate-800">{title}</p>
      {contabilizacionOptions.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 text-[15px] ${
            disabled ? "text-slate-400" : "text-slate-700"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function BrownButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex w-fit items-center px-8 py-2 text-sm font-semibold ${
        disabled
          ? "bg-[#8e7751] text-white/80"
          : "bg-[#6f5732] text-white hover:bg-[#5f4a2b]"
      }`}
    >
      {label}
    </button>
  );
}

function AccountSearchModal({
  title,
  searchTerm,
  accounts,
  onSearchTermChange,
  onClose,
  onSelect,
}: {
  title: string;
  searchTerm: string;
  accounts: AccountCatalogItem[];
  onSearchTermChange: (value: string) => void;
  onClose: () => void;
  onSelect: (account: AccountCatalogItem) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.3)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Buscador de cuentas
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Buscar por codigo o descripcion"
            className="h-11 w-full rounded-xl border border-[#c8d4e3] bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
          />

          <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3">Codigo</th>
                  <th className="px-4 py-3">Descripcion</th>
                  <th className="px-4 py-3">Accion</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length ? (
                  accounts.map((account) => (
                    <tr key={`${account.codigo}-${account.nombre}`} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-slate-700">{account.codigo}</td>
                      <td className="px-4 py-3 text-slate-700">{account.nombre}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onSelect(account)}
                          className="rounded-lg bg-[#1677c9] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1167ae]"
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron cuentas para la busqueda actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveToolbarButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className={`inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${
        enabled && !pending
          ? "bg-[#82c3ff] hover:bg-[#74b6f2]"
          : "cursor-not-allowed bg-[#cfe2f7] text-white/90"
      }`}
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}
