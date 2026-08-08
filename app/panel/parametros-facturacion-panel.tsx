"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveParametrosFacturacionAction,
  type SaveParametrosFacturacionState,
} from "./parametros-facturacion-actions";

type ParametrosFacturacionPanelProps = {
  empresa: {
    id: number;
    obligarCupoCredito: boolean;
    obligarAperturaCaja: boolean;
    ingresarClaveFacturadorUnaVez: boolean;
    visualizarComboVendedores: boolean;
    controlarSaldosVencidos: boolean;
    verTotalSinDescuento: boolean;
    verTotalConDescuento: boolean;
    porcentajeInteres: string;
    tipoDescuentoAsignado: string;
    permitirEntregasParciales: boolean;
    permitirServiciosGuias: boolean;
    lotesDescontarAutomatico: boolean;
    ocultarFechasControlLotes: boolean;
    envioAutomaticoOffline: boolean;
    enviarMailCobroCliente: boolean;
    enviarMailPagoProveedor: boolean;
    verSaldosEstadoCartera: boolean;
    aprobarPagosDosPasos: boolean;
    crmClientesAgrupados: boolean;
    afectarChequesCupoCredito: boolean;
    obligaSeleccionarMesas: boolean;
    controlaCocina: boolean;
    restauranteCocina: string;
    restauranteBar: string;
    restauranteGrill: string;
  };
};

type FormValues = ParametrosFacturacionPanelProps["empresa"];

const tabs = [
  { key: "facturacion", label: "Facturacion" },
  { key: "restaurante", label: "Restaurante" },
] as const;

const restauranteOptions = ["General", "Barra", "Produccion", "Cocina"];

export function ParametrosFacturacionPanel({
  empresa,
}: ParametrosFacturacionPanelProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["key"]>("facturacion");
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [values, setValues] = useState<FormValues>(empresa);
  const [state, formAction] = useActionState<
    SaveParametrosFacturacionState,
    FormData
  >(saveParametrosFacturacionAction, {
    error: null,
    success: null,
  });

  useEffect(() => {
    setValues(empresa);
  }, [empresa]);

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  const fieldClassName = isEditing
    ? "h-8 w-full border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500";

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
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion`}
            className="inline-flex items-center rounded-sm bg-[#30404d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24323d]"
          >
            Menu
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion&vista=formatos-fisicos`}
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

        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            isEditing
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <span>
            {isEditing
              ? "Modo edicion activo. Ya puedes cambiar parametros de facturacion y guardar."
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
            Configura la operacion normal de facturacion y, si aplica, los
            parametros del flujo de restaurante en pestañas separadas.
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

          <div className="min-h-[620px] bg-white p-6">
            {activeTab === "facturacion" ? (
              <div className="grid gap-12 xl:grid-cols-[1fr_0.9fr]">
                <div className="space-y-8">
                  <SectionTitle title="Opciones de Facturación" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <CheckboxLine label="Obligar Cupo de Crédito" name="obligarCupoCredito" checked={values.obligarCupoCredito} disabled={!isEditing} onChange={(checked) => updateField("obligarCupoCredito", checked)} />
                    <CheckboxLine label="Controlar Saldos Vencidos" name="controlarSaldosVencidos" checked={values.controlarSaldosVencidos} disabled={!isEditing} onChange={(checked) => updateField("controlarSaldosVencidos", checked)} />
                    <CheckboxLine label="Obligar Apertura de Caja" name="obligarAperturaCaja" checked={values.obligarAperturaCaja} disabled={!isEditing} onChange={(checked) => updateField("obligarAperturaCaja", checked)} />
                    <span />
                    <CheckboxLine label="Ingresar 1 Sola vez Clave de Facturador" name="ingresarClaveFacturadorUnaVez" checked={values.ingresarClaveFacturadorUnaVez} disabled={!isEditing} onChange={(checked) => updateField("ingresarClaveFacturadorUnaVez", checked)} />
                    <CheckboxLine label="Visualizar Combo Vendedores en facturas detalles" name="visualizarComboVendedores" checked={values.visualizarComboVendedores} disabled={!isEditing} onChange={(checked) => updateField("visualizarComboVendedores", checked)} />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[15px] text-slate-700">Tipo de Descuento Asignado</p>
                    <RadioLine label="Descuento Producto" name="tipoDescuentoAsignado" value="producto" currentValue={values.tipoDescuentoAsignado} disabled={!isEditing} onChange={(value) => updateField("tipoDescuentoAsignado", value)} />
                    <RadioLine label="Descuento Cliente" name="tipoDescuentoAsignado" value="cliente" currentValue={values.tipoDescuentoAsignado} disabled={!isEditing} onChange={(value) => updateField("tipoDescuentoAsignado", value)} />
                    <RadioLine label="Descuento Producto + Descuento Cliente" name="tipoDescuentoAsignado" value="mixto" currentValue={values.tipoDescuentoAsignado} disabled={!isEditing} onChange={(value) => updateField("tipoDescuentoAsignado", value)} />
                  </div>

                  <div className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-3">
                      <SectionTitle title="Entregas Parciales" small />
                      <CheckboxLine label="Permitir entregas parciales en Facturación" name="permitirEntregasParciales" checked={values.permitirEntregasParciales} disabled={!isEditing} onChange={(checked) => updateField("permitirEntregasParciales", checked)} />

                      <SectionTitle title="Control de Lotes Automático" small />
                      <CheckboxLine label="Lotes descontar automático" name="lotesDescontarAutomatico" checked={values.lotesDescontarAutomatico} disabled={!isEditing} onChange={(checked) => updateField("lotesDescontarAutomatico", checked)} />
                      <CheckboxLine label="Ocultar Fechas en Control de Lotes" name="ocultarFechasControlLotes" checked={values.ocultarFechasControlLotes} disabled={!isEditing} onChange={(checked) => updateField("ocultarFechasControlLotes", checked)} />

                      <SectionTitle title="Parámetros Offline" small />
                      <CheckboxLine label="Envío Automático de datos en offline" name="envioAutomaticoOffline" checked={values.envioAutomaticoOffline} disabled={!isEditing} onChange={(checked) => updateField("envioAutomaticoOffline", checked)} />
                    </div>

                    <div className="space-y-3">
                      <SectionTitle title="Guías de Remisión" small />
                      <CheckboxLine label="Permitir Servicios en las Guías de Remisión" name="permitirServiciosGuias" checked={values.permitirServiciosGuias} disabled={!isEditing} onChange={(checked) => updateField("permitirServiciosGuias", checked)} />
                    </div>

                    <div className="space-y-3">
                      <SectionTitle title="Opciones Cobros/Pagos" small />
                      <CheckboxLine label="Enviar notificación por mail de cobro al Cliente" name="enviarMailCobroCliente" checked={values.enviarMailCobroCliente} disabled={!isEditing} onChange={(checked) => updateField("enviarMailCobroCliente", checked)} />
                      <CheckboxLine label="Enviar notificación por mail de pago al Proveedor" name="enviarMailPagoProveedor" checked={values.enviarMailPagoProveedor} disabled={!isEditing} onChange={(checked) => updateField("enviarMailPagoProveedor", checked)} />
                      <CheckboxLine label="Ver Saldos en Estado de Cartera" name="verSaldosEstadoCartera" checked={values.verSaldosEstadoCartera} disabled={!isEditing} onChange={(checked) => updateField("verSaldosEstadoCartera", checked)} />
                      <CheckboxLine label="Aprobar Pagos en 2 Pasos" name="aprobarPagosDosPasos" checked={values.aprobarPagosDosPasos} disabled={!isEditing} onChange={(checked) => updateField("aprobarPagosDosPasos", checked)} />
                      <CheckboxLine label="CRM Clientes Agrupados" name="crmClientesAgrupados" checked={values.crmClientesAgrupados} disabled={!isEditing} onChange={(checked) => updateField("crmClientesAgrupados", checked)} />
                      <CheckboxLine label="Afectar Cheques en cupo de Crédito" name="afectarChequesCupoCredito" checked={values.afectarChequesCupoCredito} disabled={!isEditing} onChange={(checked) => updateField("afectarChequesCupoCredito", checked)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionTitle title="Modo de Visualización del Descuento Facturación" />
                  <CheckboxLine label="Ver el total en detalles sin restar el Descuento" name="verTotalSinDescuento" checked={values.verTotalSinDescuento} disabled={!isEditing} onChange={(checked) => updateField("verTotalSinDescuento", checked)} />
                  <CheckboxLine label="Ver el total en detalles restado Descuento" name="verTotalConDescuento" checked={values.verTotalConDescuento} disabled={!isEditing} onChange={(checked) => updateField("verTotalConDescuento", checked)} />

                  <div className="grid grid-cols-[150px_1fr] items-center gap-3">
                    <label className="text-[15px] text-slate-700">Porcentaje Interés</label>
                    <input
                      name="porcentajeInteres"
                      value={values.porcentajeInteres}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("porcentajeInteres", event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "restaurante" ? (
              <div className="space-y-10">
                <div className="space-y-4">
                  <CheckboxLine label="Obliga Seleccionar Mesas" name="obligaSeleccionarMesas" checked={values.obligaSeleccionarMesas} disabled={!isEditing} onChange={(checked) => updateField("obligaSeleccionarMesas", checked)} />
                  <CheckboxLine label="Controla Cocina" name="controlaCocina" checked={values.controlaCocina} disabled={!isEditing} onChange={(checked) => updateField("controlaCocina", checked)} />
                </div>

                <div className="max-w-[520px] space-y-4">
                  <SectionTitle title="Opciones de Facturación" />
                  <SelectLine label="Cocina" name="restauranteCocina" value={values.restauranteCocina} disabled={!isEditing} onChange={(value) => updateField("restauranteCocina", value)} />
                  <SelectLine label="Bar" name="restauranteBar" value={values.restauranteBar} disabled={!isEditing} onChange={(value) => updateField("restauranteBar", value)} />
                  <SelectLine label="Grill" name="restauranteGrill" value={values.restauranteGrill} disabled={!isEditing} onChange={(value) => updateField("restauranteGrill", value)} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({
  title,
  small = false,
}: {
  title: string;
  small?: boolean;
}) {
  return (
    <p
      className={`font-semibold text-slate-800 ${
        small ? "text-[15px]" : "text-[16px]"
      }`}
    >
      {title}
    </p>
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

function RadioLine({
  label,
  name,
  value,
  currentValue,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  currentValue: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-[15px] ${
        disabled ? "text-slate-400" : "text-slate-700"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={currentValue === value}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

function SelectLine({
  label,
  name,
  value,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
      <label className="text-[15px] text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={
          disabled
            ? "h-8 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500"
            : "h-8 w-full border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
        }
      >
        {restauranteOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
