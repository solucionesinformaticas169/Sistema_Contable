"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveParametrosProductosAction,
  type SaveParametrosProductosState,
} from "./parametros-productos-actions";

type ParametrosProductosPanelProps = {
  empresa: {
    id: number;
    formulaCalculoPrecios: string;
    produccionTipoCosto: string;
    tipoManejoPrecios: string;
    sumarCantidadFacturacion: boolean;
    sumarCantidadTpvOffline: boolean;
    sumarCantidadProforma: boolean;
    sumarCantidadEntrega: boolean;
    ivaPredeterminado: string;
    tipoCalculoCosto: string;
    almacenPredeterminado: string;
    transferenciasConIngreso: boolean;
    permitirTransferenciaStock: boolean;
    actualizarPreciosUltCompra: boolean;
    permitirMultiplesTarifas: boolean;
    tarifaMultimedidas: string;
    etiquetaUrbano: string;
    formatoPrecio: number;
    formatoPrecioIva: number;
    formatoSubtotales: number;
    formatoValorIva: number;
    formatoTotal: number;
    formatoCosto: number;
    formatoCostoSubtotales: number;
    formatoCostoTotal: number;
    formatoCostoValorIva: number;
    formatoCantidad: number;
  };
};

type FormValues = ParametrosProductosPanelProps["empresa"];

const ivaOptions = ["15%", "12%", "0%"];
const costoOptions = ["Costo Ultima Compra", "Costo Promedio", "Costo Estandar"];
const almacenOptions = ["Almacen General", "Bodega Principal", "Matriz"];
const tarifaOptions = ["Precio 1", "Precio 2", "Precio 3"];
const etiquetaOptions = ["1", "2", "3", "4", "5", "6"];
const decimalOptions = ["0", "1", "2", "3", "4", "5", "6"];

export function ParametrosProductosPanel({
  empresa,
}: ParametrosProductosPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [state, formAction] = useActionState<
    SaveParametrosProductosState,
    FormData
  >(saveParametrosProductosAction, {
    error: null,
    success: null,
  });
  const [values, setValues] = useState<FormValues>(empresa);

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

  const disabledFieldClassName = useMemo(
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

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <SaveToolbarButton enabled={isEditing} />
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center rounded-sm bg-[#60b95c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#50a64c]"
            >
              Modificar
            </button>
            <Link
              href={`/panel?empresaId=${empresa.id}&seccion=parametros-productos`}
              className="inline-flex items-center rounded-sm bg-[#30404d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24323d]"
            >
              Menu
            </Link>
            <Link
              href={`/panel?empresaId=${empresa.id}&seccion=parametros-productos&vista=formatos-fisicos`}
              className="inline-flex items-center rounded-sm bg-[#f49b16] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e18b0d]"
            >
              Cargar Formatos Fisicos
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#numeradores"
              className="inline-flex items-center rounded-sm bg-[#1d967c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#167c66]"
            >
              Numeradores
            </a>
            <button
              type="button"
              onClick={() => setShowHelp((current) => !current)}
              className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Tutoriales
            </button>
          </div>
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
              ? "Modo edicion activo. Ya puedes actualizar parametros de precios, costos y cantidades."
              : "Modo lectura. Pulsa Modificar para habilitar los campos y el boton Guardar."}
          </span>
          <span className="font-semibold">
            {isEditing ? "Edicion habilitada" : "Formulario bloqueado"}
          </span>
        </div>

        {showHelp ? (
          <div className="mb-5 rounded-xl border border-[#d7e6f7] bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Guia rapida</p>
            <p className="mt-2">
              Usa <strong>Modificar</strong> para habilitar cambios, luego guarda la
              configuracion general de precios, costos y cantidades. El boton
              <strong> Cargar Formatos Fisicos</strong> abre la pantalla para subir y
              descargar plantillas.
            </p>
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <RadioGroup
                title="Formula Calculo Precios"
                name="formulaCalculoPrecios"
                value={values.formulaCalculoPrecios}
                disabled={!isEditing}
                options={[
                  { value: "precio", label: "1 Calcular Utilidad sobre el Precio" },
                  { value: "costo", label: "2 Calcular Utilidad sobre el Costo" },
                ]}
                onChange={(value) => updateField("formulaCalculoPrecios", value)}
              />

              <RadioGroup
                title="Produccion Tipo costo"
                name="produccionTipoCosto"
                value={values.produccionTipoCosto}
                disabled={!isEditing}
                options={[
                  { value: "op", label: "1 Tomar Costo de la OP" },
                  { value: "estandar", label: "2 Tomar Costo Estandar" },
                ]}
                onChange={(value) => updateField("produccionTipoCosto", value)}
              />
            </div>

            <RadioGroup
              title="Tipo Manejo Precios"
              name="tipoManejoPrecios"
              value={values.tipoManejoPrecios}
              disabled={!isEditing}
              options={[
                { value: "incluido_iva", label: "1 Precios incluido IVA" },
                { value: "desglosado_iva", label: "2 Precios desglosados IVA" },
              ]}
              onChange={(value) => updateField("tipoManejoPrecios", value)}
            />

            <div className="space-y-3">
              <CheckboxRow
                label="Sumar cantidad en Facturacion"
                name="sumarCantidadFacturacion"
                checked={values.sumarCantidadFacturacion}
                disabled={!isEditing}
                onChange={(checked) =>
                  updateField("sumarCantidadFacturacion", checked)
                }
              />
              <CheckboxRow
                label="Sumar cantidad en TPV (Offline)"
                name="sumarCantidadTpvOffline"
                checked={values.sumarCantidadTpvOffline}
                disabled={!isEditing}
                onChange={(checked) => updateField("sumarCantidadTpvOffline", checked)}
              />
              <CheckboxRow
                label="Sumar cantidad en Proforma/Pedidos"
                name="sumarCantidadProforma"
                checked={values.sumarCantidadProforma}
                disabled={!isEditing}
                onChange={(checked) => updateField("sumarCantidadProforma", checked)}
              />
              <CheckboxRow
                label="Sumar cantidad en Entrega"
                name="sumarCantidadEntrega"
                checked={values.sumarCantidadEntrega}
                disabled={!isEditing}
                onChange={(checked) => updateField("sumarCantidadEntrega", checked)}
              />
            </div>

            <div className="space-y-3">
              <SelectRow
                label="IVA Predeterminado"
                name="ivaPredeterminado"
                value={values.ivaPredeterminado}
                options={ivaOptions}
                disabled={!isEditing}
                onChange={(value) => updateField("ivaPredeterminado", value)}
              />
              <SelectRow
                label="Tipo Calculo Costo"
                name="tipoCalculoCosto"
                value={values.tipoCalculoCosto}
                options={costoOptions}
                disabled={!isEditing}
                onChange={(value) => updateField("tipoCalculoCosto", value)}
              />
              <SelectRow
                label="Almacen"
                name="almacenPredeterminado"
                value={values.almacenPredeterminado}
                options={almacenOptions}
                disabled={!isEditing}
                onChange={(value) => updateField("almacenPredeterminado", value)}
              />
            </div>

            <div className="space-y-3">
              <CheckboxRow
                label="En transferencias generar ingreso automaticamente"
                name="transferenciasConIngreso"
                checked={values.transferenciasConIngreso}
                disabled={!isEditing}
                onChange={(checked) =>
                  updateField("transferenciasConIngreso", checked)
                }
              />
              <CheckboxRow
                label="Permitir Transferencia solo si hay stock"
                name="permitirTransferenciaStock"
                checked={values.permitirTransferenciaStock}
                disabled={!isEditing}
                onChange={(checked) =>
                  updateField("permitirTransferenciaStock", checked)
                }
              />
              <CheckboxRow
                label="Permitir Actualizar Precios Ultima Compra"
                name="actualizarPreciosUltCompra"
                checked={values.actualizarPreciosUltCompra}
                disabled={!isEditing}
                onChange={(checked) =>
                  updateField("actualizarPreciosUltCompra", checked)
                }
              />
              <CheckboxRow
                label="Permitir Multiples Tarifas por Medida Superior e Inferior"
                name="permitirMultiplesTarifas"
                checked={values.permitirMultiplesTarifas}
                disabled={!isEditing}
                onChange={(checked) =>
                  updateField("permitirMultiplesTarifas", checked)
                }
              />
            </div>

            <div className="space-y-3">
              <SelectRow
                label="Tarifa Multimedidas"
                name="tarifaMultimedidas"
                value={values.tarifaMultimedidas}
                options={tarifaOptions}
                disabled={!isEditing}
                onChange={(value) => updateField("tarifaMultimedidas", value)}
              />
              <SelectRow
                label="Etiqueta Urbano"
                name="etiquetaUrbano"
                value={values.etiquetaUrbano}
                options={etiquetaOptions}
                disabled={!isEditing}
                onChange={(value) => updateField("etiquetaUrbano", value)}
              />
            </div>
          </div>

          <div id="numeradores" className="space-y-5">
            <FormatCard title="Formato de Ventas">
              <NumericSelectRow
                label="Formato Precio"
                name="formatoPrecio"
                value={String(values.formatoPrecio)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoPrecio", Number(value))}
              />
              <NumericSelectRow
                label="Formato Precio Incluido IVA"
                name="formatoPrecioIva"
                value={String(values.formatoPrecioIva)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoPrecioIva", Number(value))}
              />
              <NumericSelectRow
                label="Formato Subtotales"
                name="formatoSubtotales"
                value={String(values.formatoSubtotales)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) =>
                  updateField("formatoSubtotales", Number(value))
                }
              />
              <NumericSelectRow
                label="Formato Valor IVA"
                name="formatoValorIva"
                value={String(values.formatoValorIva)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoValorIva", Number(value))}
              />
              <NumericSelectRow
                label="Formato Total"
                name="formatoTotal"
                value={String(values.formatoTotal)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoTotal", Number(value))}
              />
            </FormatCard>

            <FormatCard title="Formato de Costos">
              <NumericSelectRow
                label="Formato Costo"
                name="formatoCosto"
                value={String(values.formatoCosto)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoCosto", Number(value))}
              />
              <NumericSelectRow
                label="Formato Costo Subtotales"
                name="formatoCostoSubtotales"
                value={String(values.formatoCostoSubtotales)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) =>
                  updateField("formatoCostoSubtotales", Number(value))
                }
              />
              <NumericSelectRow
                label="Formato Costo Total"
                name="formatoCostoTotal"
                value={String(values.formatoCostoTotal)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoCostoTotal", Number(value))}
              />
              <NumericSelectRow
                label="Formato Valor IVA"
                name="formatoCostoValorIva"
                value={String(values.formatoCostoValorIva)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) =>
                  updateField("formatoCostoValorIva", Number(value))
                }
              />
            </FormatCard>

            <FormatCard title="Formato de Cantidades">
              <NumericSelectRow
                label="Formato Cantidad"
                name="formatoCantidad"
                value={String(values.formatoCantidad)}
                options={decimalOptions}
                disabled={!isEditing}
                className={disabledFieldClassName}
                onChange={(value) => updateField("formatoCantidad", Number(value))}
              />
            </FormatCard>
          </div>
        </div>
      </form>
    </div>
  );
}

function RadioGroup({
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
    <div>
      <p className="mb-2 text-[15px] font-semibold text-slate-800">{title}</p>
      <div className="space-y-2">
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
    </div>
  );
}

function CheckboxRow({
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
      className={`flex items-center gap-3 text-[15px] ${
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

function SelectRow({
  label,
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[145px_1fr] items-center gap-3">
      <label className="text-[15px] text-slate-700">{label}:</label>
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormatCard({
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
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function NumericSelectRow({
  label,
  name,
  value,
  options,
  disabled,
  className,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  disabled: boolean;
  className: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[210px_160px] items-center gap-3">
      <label className="text-[15px] text-slate-700">{label}:</label>
      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        {options.map((option) => (
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
