"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveDatosEmpresaAction,
  type SaveDatosEmpresaState,
  uploadEmpresaLogoAction,
  type UploadLogoEmpresaState,
} from "./datos-empresa-actions";

type DatosEmpresaPanelProps = {
  empresa: {
    id: number;
    ruc: string;
    razonSocial: string;
    direccion: string;
    provincia: string;
    ciudad: string;
    tipoNegocio: string;
    whatsapp: string;
    correo: string;
    nombreComercial: string;
    telefono1: string;
    telefono2: string;
    telefono3: string;
    representanteIdentificacion: string;
    representanteLegal: string;
    contadorIdentificacion: string;
    contador: string;
    agenteRetencion: string;
    tipoRegimen: string;
    realizaAts: boolean;
    parroquia: string;
    logoPath: string;
  };
  geoCatalog: {
    provincias: string[];
    ciudadesPorProvincia: Record<string, string[]>;
    parroquiasPorCiudad: Record<string, string[]>;
  };
};

type DatosEmpresaFormValues = {
  tipoIdentificacion: string;
  identificacion: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  correo: string;
  telefono1: string;
  telefono2: string;
  telefono3: string;
  representanteIdentificacion: string;
  representanteLegal: string;
  contadorIdentificacion: string;
  contador: string;
  agenteRetencion: string;
  tipoRegimen: string;
  realizaAts: boolean;
  provincia: string;
  ciudad: string;
  parroquia: string;
};

type GeoSearchTarget = {
  field: "provincia" | "ciudad" | "parroquia";
  label: string;
  options: string[];
};

const initialFormValues = (
  empresa: DatosEmpresaPanelProps["empresa"],
): DatosEmpresaFormValues => ({
  tipoIdentificacion: "RUC",
  identificacion: empresa.ruc,
  razonSocial: empresa.razonSocial,
  nombreComercial: empresa.nombreComercial || empresa.tipoNegocio,
  direccion: empresa.direccion,
  correo: empresa.correo,
  telefono1: empresa.telefono1 || empresa.whatsapp,
  telefono2: empresa.telefono2,
  telefono3: empresa.telefono3,
  representanteIdentificacion: empresa.representanteIdentificacion,
  representanteLegal: empresa.representanteLegal,
  contadorIdentificacion: empresa.contadorIdentificacion,
  contador: empresa.contador,
  agenteRetencion: empresa.agenteRetencion || "Ninguno",
  tipoRegimen: empresa.tipoRegimen || "GENERAL",
  realizaAts: empresa.realizaAts,
  provincia: empresa.provincia,
  ciudad: empresa.ciudad,
  parroquia:
    empresa.parroquia || `${empresa.ciudad.toUpperCase()} DISTRITO METROPOLITANO`,
});

function ToolbarButton({
  href,
  label,
  className,
}: {
  href?: string;
  label: string;
  className: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${className}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${className}`}
    >
      {label}
    </button>
  );
}

export function DatosEmpresaPanel({
  empresa,
  geoCatalog,
}: DatosEmpresaPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLogoName, setSelectedLogoName] = useState("");
  const [geoSearchTarget, setGeoSearchTarget] = useState<GeoSearchTarget | null>(
    null,
  );
  const [geoSearchTerm, setGeoSearchTerm] = useState("");
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [values, setValues] = useState<DatosEmpresaFormValues>(() =>
    initialFormValues(empresa),
  );
  const [state, formAction] = useActionState<SaveDatosEmpresaState, FormData>(
    saveDatosEmpresaAction,
    {
      error: null,
      success: null,
    },
  );
  const [logoState, logoFormAction] = useActionState<
    UploadLogoEmpresaState,
    FormData
  >(uploadEmpresaLogoAction, {
    error: null,
    success: null,
  });

  const ciudades = useMemo(
    () => geoCatalog.ciudadesPorProvincia[values.provincia] ?? [values.ciudad],
    [geoCatalog.ciudadesPorProvincia, values.provincia, values.ciudad],
  );
  const parroquias = useMemo(
    () => geoCatalog.parroquiasPorCiudad[values.ciudad] ?? [values.parroquia],
    [geoCatalog.parroquiasPorCiudad, values.ciudad, values.parroquia],
  );

  function updateField<K extends keyof DatosEmpresaFormValues>(
    field: K,
    value: DatosEmpresaFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function openGeoSearch(
    field: GeoSearchTarget["field"],
    label: string,
    options: string[],
  ) {
    if (!isEditing) {
      return;
    }

    setGeoSearchTarget({ field, label, options });
    setGeoSearchTerm("");
  }

  function assignGeoValue(selectedValue: string) {
    if (!geoSearchTarget) {
      return;
    }

    if (geoSearchTarget.field === "provincia") {
      const nextCiudad =
        geoCatalog.ciudadesPorProvincia[selectedValue]?.[0] ?? values.ciudad;
      const nextParroquia =
        geoCatalog.parroquiasPorCiudad[nextCiudad]?.[0] ?? values.parroquia;

      setValues((current) => ({
        ...current,
        provincia: selectedValue,
        ciudad: nextCiudad,
        parroquia: nextParroquia,
      }));
    } else if (geoSearchTarget.field === "ciudad") {
      const nextParroquia =
        geoCatalog.parroquiasPorCiudad[selectedValue]?.[0] ?? values.parroquia;

      setValues((current) => ({
        ...current,
        ciudad: selectedValue,
        parroquia: nextParroquia,
      }));
    } else {
      updateField("parroquia", selectedValue);
    }

    setGeoSearchTarget(null);
    setGeoSearchTerm("");
  }

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  const filteredGeoOptions = useMemo(() => {
    if (!geoSearchTarget) {
      return [];
    }

    const term = geoSearchTerm.trim().toLowerCase();

    if (!term) {
      return geoSearchTarget.options;
    }

    return geoSearchTarget.options.filter((option) =>
      option.toLowerCase().includes(term),
    );
  }, [geoSearchTarget, geoSearchTerm]);

  const fieldClassName = isEditing
    ? "h-8 w-full border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500";

  const compactFieldClassName = isEditing
    ? "h-8 w-[45%] border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "h-8 w-[45%] cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500";

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
            <ToolbarButton
              label="Menu"
              className="bg-[#30404d] hover:bg-[#24323d]"
            />
            <ToolbarButton
              href={`/panel?empresaId=${empresa.id}&seccion=datos-empresa&vista=formatos-fisicos`}
              label="Cargar Formatos Fisicos"
              className="bg-[#f49b16] hover:bg-[#e18b0d]"
            />
          </div>

          <button
            type="button"
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Tutoriales
          </button>
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
              ? "Modo edicion activo. Ya puedes cambiar datos y guardar."
              : "Modo lectura. Pulsa Modificar para habilitar los campos y el boton Guardar."}
          </span>
          <span className="font-semibold">
            {isEditing ? "Edicion habilitada" : "Formulario bloqueado"}
          </span>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <FormRow label="Tipo:">
              <select
                name="tipoIdentificacion"
                value={values.tipoIdentificacion}
                onChange={(event) =>
                  updateField("tipoIdentificacion", event.target.value)
                }
                disabled={!isEditing}
                className={
                  isEditing
                    ? "h-8 w-[90px] border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
                    : "h-8 w-[90px] cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500"
                }
              >
                <option>RUC</option>
                <option>Cedula</option>
              </select>
            </FormRow>

            <FormRow label="Identificacion:">
              <input
                name="identificacion"
                value={values.identificacion}
                onChange={(event) =>
                  updateField("identificacion", event.target.value)
                }
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Razon Social:">
              <input
                name="razonSocial"
                value={values.razonSocial}
                onChange={(event) => updateField("razonSocial", event.target.value)}
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Nombre Comercial:">
              <input
                name="nombreComercial"
                value={values.nombreComercial}
                onChange={(event) =>
                  updateField("nombreComercial", event.target.value)
                }
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Direccion:">
              <input
                name="direccion"
                value={values.direccion}
                onChange={(event) => updateField("direccion", event.target.value)}
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Correo:">
              <input
                name="correo"
                value={values.correo}
                onChange={(event) => updateField("correo", event.target.value)}
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Identificacion:">
              <input
                name="representanteIdentificacion"
                value={values.representanteIdentificacion}
                onChange={(event) =>
                  updateField("representanteIdentificacion", event.target.value)
                }
                disabled={!isEditing}
                className={compactFieldClassName}
              />
            </FormRow>

            <FormRow label="Representante Legal:">
              <input
                name="representanteLegal"
                value={values.representanteLegal}
                onChange={(event) =>
                  updateField("representanteLegal", event.target.value)
                }
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>

            <FormRow label="Identificacion:">
              <input
                name="contadorIdentificacion"
                value={values.contadorIdentificacion}
                onChange={(event) =>
                  updateField("contadorIdentificacion", event.target.value)
                }
                disabled={!isEditing}
                className={compactFieldClassName}
              />
            </FormRow>

            <FormRow label="Contador:">
              <input
                name="contador"
                value={values.contador}
                onChange={(event) => updateField("contador", event.target.value)}
                disabled={!isEditing}
                className={fieldClassName}
              />
            </FormRow>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <FormRow label="Telefono" compactLabel>
                <input
                  name="telefono1"
                  value={values.telefono1}
                  onChange={(event) => updateField("telefono1", event.target.value)}
                  disabled={!isEditing}
                  className={fieldClassName}
                />
              </FormRow>

              <FormRow label="Telefono" compactLabel>
                <input
                  name="telefono2"
                  value={values.telefono2}
                  onChange={(event) => updateField("telefono2", event.target.value)}
                  disabled={!isEditing}
                  className={fieldClassName}
                />
              </FormRow>

              <FormRow label="Telefono" compactLabel>
                <input
                  name="telefono3"
                  value={values.telefono3}
                  onChange={(event) => updateField("telefono3", event.target.value)}
                  disabled={!isEditing}
                  className={fieldClassName}
                />
              </FormRow>

              <FormRow label="Agente Retencion:" compactLabel>
                <select
                  name="agenteRetencion"
                  value={values.agenteRetencion}
                  onChange={(event) =>
                    updateField("agenteRetencion", event.target.value)
                  }
                  disabled={!isEditing}
                  className={fieldClassName}
                >
                  <option>Ninguno</option>
                  <option>Microempresa</option>
                  <option>Contribuyente especial</option>
                </select>
              </FormRow>

              <FormRow label="Tipo Regimen:" compactLabel>
                <select
                  name="tipoRegimen"
                  value={values.tipoRegimen}
                  onChange={(event) => updateField("tipoRegimen", event.target.value)}
                  disabled={!isEditing}
                  className={fieldClassName}
                >
                  <option>GENERAL</option>
                  <option>RIMPE</option>
                  <option>POPULAR</option>
                </select>
              </FormRow>

              <div className="flex items-center justify-end gap-2 pr-2 text-sm text-slate-600">
                <input
                  name="realizaAts"
                  type="checkbox"
                  checked={values.realizaAts}
                  onChange={(event) =>
                    updateField("realizaAts", event.target.checked)
                  }
                  disabled={!isEditing}
                />
                <span>Realiza ATS</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="w-[200px] space-y-1">
                <form action={logoFormAction} className="space-y-2">
                  <input type="hidden" name="empresaId" value={empresa.id} />
                  <input
                    ref={logoInputRef}
                    type="file"
                    name="logo"
                    accept=".png,.jpg,.jpeg,.webp,.svg"
                    className="hidden"
                    onChange={(event) =>
                      setSelectedLogoName(event.target.files?.[0]?.name ?? "")
                    }
                  />
                  <div className="grid h-[150px] place-items-center overflow-hidden border border-slate-300 bg-white text-slate-400">
                    {empresa.logoPath ? (
                      <img
                        src={empresa.logoPath}
                        alt={`Logo de ${empresa.razonSocial}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span>Logo</span>
                    )}
                  </div>
                  <div className="min-h-5 text-xs text-slate-500">
                    {selectedLogoName || "Sin archivo seleccionado"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Enviar guarda el logo seleccionado para esta empresa.
                  </div>
                  {logoState.error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      {logoState.error}
                    </div>
                  ) : null}
                  {logoState.success ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      {logoState.success}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="rounded-sm bg-[#f7b733] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e4a720]"
                    >
                      Agregar Logo
                    </button>
                    <UploadLogoButton enabled={Boolean(selectedLogoName)} />
                  </div>
                </form>
              </div>

              <div className="flex-1 space-y-3">
                <SelectSearchRow
                  label="Provincias:"
                  name="provincia"
                  value={values.provincia}
                  options={geoCatalog.provincias}
                  disabled={!isEditing}
                  onSearch={() =>
                    openGeoSearch(
                      "provincia",
                      "Buscar provincia",
                      geoCatalog.provincias,
                    )
                  }
                  onChange={(nextProvincia) => {
                    const nextCiudad =
                      geoCatalog.ciudadesPorProvincia[nextProvincia]?.[0] ??
                      values.ciudad;
                    const nextParroquia =
                      geoCatalog.parroquiasPorCiudad[nextCiudad]?.[0] ??
                      values.parroquia;

                    setValues((current) => ({
                      ...current,
                      provincia: nextProvincia,
                      ciudad: nextCiudad,
                      parroquia: nextParroquia,
                    }));
                  }}
                />

                <SelectSearchRow
                  label="Ciudades:"
                  name="ciudad"
                  value={values.ciudad}
                  options={ciudades}
                  disabled={!isEditing}
                  onSearch={() =>
                    openGeoSearch("ciudad", "Buscar ciudad", ciudades)
                  }
                  onChange={(nextCiudad) => {
                    const nextParroquia =
                      geoCatalog.parroquiasPorCiudad[nextCiudad]?.[0] ??
                      values.parroquia;

                    setValues((current) => ({
                      ...current,
                      ciudad: nextCiudad,
                      parroquia: nextParroquia,
                    }));
                  }}
                />

                <SelectSearchRow
                  label="Parroquias:"
                  name="parroquia"
                  value={values.parroquia}
                  options={parroquias}
                  disabled={!isEditing}
                  onSearch={() =>
                    openGeoSearch("parroquia", "Buscar parroquia", parroquias)
                  }
                  onChange={(nextParroquia) =>
                    updateField("parroquia", nextParroquia)
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {geoSearchTarget ? (
          <GeoSearchModal
            title={geoSearchTarget.label}
            searchTerm={geoSearchTerm}
            options={filteredGeoOptions}
            onClose={() => {
              setGeoSearchTarget(null);
              setGeoSearchTerm("");
            }}
            onSearchTermChange={setGeoSearchTerm}
            onSelect={assignGeoValue}
          />
        ) : null}
      </form>
    </div>
  );
}

function FormRow({
  label,
  children,
  compactLabel = false,
}: {
  label: string;
  children: React.ReactNode;
  compactLabel?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-3 ${
        compactLabel ? "grid-cols-[140px_1fr]" : "grid-cols-[145px_1fr]"
      }`}
    >
      <label className="text-[15px] text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function SelectSearchRow({
  label,
  name,
  value,
  options,
  disabled,
  onSearch,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  disabled: boolean;
  onSearch: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr_42px] items-center gap-3">
      <label className="text-[15px] text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
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
      <button
        type="button"
        disabled={disabled}
        onClick={onSearch}
        aria-label={`Buscar ${label}`}
        className={`h-8 rounded-sm text-lg font-semibold text-white transition ${
          disabled
            ? "cursor-not-allowed bg-[#f6d89a]"
            : "bg-[#ffb422] hover:bg-[#eba315]"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="mx-auto h-4 w-4 fill-current"
        >
          <path d="M8.5 2a6.5 6.5 0 1 0 4.03 11.6l3.44 3.45 1.06-1.06-3.45-3.44A6.5 6.5 0 0 0 8.5 2Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
        </svg>
      </button>
    </div>
  );
}

function GeoSearchModal({
  title,
  searchTerm,
  options,
  onClose,
  onSearchTermChange,
  onSelect,
}: {
  title: string;
  searchTerm: string;
  options: string[];
  onClose: () => void;
  onSearchTermChange: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.3)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Buscador
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
            placeholder="Buscar opcion"
            className="h-11 w-full rounded-xl border border-[#c8d4e3] bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
          />

          <div className="max-h-[360px] overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3">Opcion</th>
                  <th className="px-4 py-3">Accion</th>
                </tr>
              </thead>
              <tbody>
                {options.length ? (
                  options.map((option) => (
                    <tr key={option} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700">{option}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onSelect(option)}
                          className="rounded-lg bg-[#1677c9] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1167ae]"
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron resultados para la busqueda actual.
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

function UploadLogoButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className={`rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${
        enabled && !pending
          ? "bg-[#14bf16] hover:bg-[#11aa13]"
          : "cursor-not-allowed bg-[#84d985]"
      }`}
    >
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}
