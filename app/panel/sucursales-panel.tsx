"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveSucursalAction,
  toggleSucursalActivoAction,
} from "./sucursales-actions";

type SucursalRow = {
  id: number;
  nombre: string;
  tipo: string;
  identificacion: string;
  razonSocial: string;
  telefono1: string;
  telefono2: string;
  metaVenta: string;
  comisionProduccion: string;
  comisionDistribucion: string;
  parroquia: string;
  responsable: string;
  ciudad: string;
  direccion: string;
  activo: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

type GeoCatalog = {
  ciudades: string[];
  parroquiasPorCiudad: Record<string, string[]>;
};

type SucursalesPanelProps = {
  empresaId?: number;
  sucursales: SucursalRow[];
  geoCatalog: GeoCatalog;
};

type SucursalFormValues = {
  sucursalId: string;
  nombre: string;
  estado: string;
  direccion: string;
  tipo: string;
  ciudad: string;
  parroquia: string;
  identificacion: string;
  razonSocial: string;
  telefono1: string;
  telefono2: string;
  metaVenta: string;
  comisionProduccion: string;
  comisionDistribucion: string;
};

const initialActionState = {
  error: null,
};

const initialFormValues: SucursalFormValues = {
  sucursalId: "",
  nombre: "",
  estado: "activo-visible",
  direccion: "",
  tipo: "agencia",
  ciudad: "QUITO",
  parroquia: "",
  identificacion: "",
  razonSocial: "",
  telefono1: "",
  telefono2: "",
  metaVenta: "",
  comisionProduccion: "",
  comisionDistribucion: "",
};

function SearchButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[#ffbf3f] text-lg font-semibold text-white transition hover:bg-[#efa81f] disabled:cursor-not-allowed disabled:bg-[#f6d992]"
    >
      Q
    </button>
  );
}

export function SucursalesPanel({
  empresaId,
  sucursales,
  geoCatalog,
}: SucursalesPanelProps) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "form">("list");
  const [isEditing, setIsEditing] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState<null | "ciudad" | "parroquia">(
    null,
  );
  const [selectorSearch, setSelectorSearch] = useState("");
  const [state, formAction] = useActionState(
    saveSucursalAction,
    initialActionState,
  );
  const [formValues, setFormValues] = useState<SucursalFormValues>(() => ({
    ...initialFormValues,
    ciudad: geoCatalog.ciudades[0] ?? "QUITO",
    parroquia:
      geoCatalog.parroquiasPorCiudad[geoCatalog.ciudades[0] ?? "QUITO"]?.[0] ?? "",
  }));

  const filteredSucursales = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sucursales;
    }

    return sucursales.filter((sucursal) => {
      return (
        sucursal.nombre.toLowerCase().includes(query) ||
        sucursal.razonSocial.toLowerCase().includes(query) ||
        sucursal.ciudad.toLowerCase().includes(query) ||
        sucursal.direccion.toLowerCase().includes(query)
      );
    });
  }, [search, sucursales]);

  const parroquias = useMemo(() => {
    const current = geoCatalog.parroquiasPorCiudad[formValues.ciudad] ?? [];

    if (current.length > 0) {
      return current;
    }

    return formValues.parroquia ? [formValues.parroquia] : [];
  }, [formValues.ciudad, formValues.parroquia, geoCatalog.parroquiasPorCiudad]);

  const currentSucursal = useMemo(
    () =>
      sucursales.find((item) => String(item.id) === formValues.sucursalId) ?? null,
    [formValues.sucursalId, sucursales],
  );

  const selectorOptions = useMemo(() => {
    if (selectorOpen === "ciudad") {
      return geoCatalog.ciudades;
    }

    if (selectorOpen === "parroquia") {
      return parroquias;
    }

    return [];
  }, [geoCatalog.ciudades, parroquias, selectorOpen]);

  const filteredSelectorOptions = useMemo(() => {
    const query = selectorSearch.trim().toLowerCase();

    if (!query) {
      return selectorOptions;
    }

    return selectorOptions.filter((item) => item.toLowerCase().includes(query));
  }, [selectorOptions, selectorSearch]);

  function updateField<K extends keyof SucursalFormValues>(
    field: K,
    value: SucursalFormValues[K],
  ) {
    setFormValues((current) => {
      if (field === "ciudad") {
        const nextParroquia =
          geoCatalog.parroquiasPorCiudad[String(value)]?.[0] ?? "";

        return {
          ...current,
          ciudad: String(value),
          parroquia: nextParroquia,
        };
      }

      return { ...current, [field]: value };
    });
  }

  function openCreateForm() {
    setFormValues({
      ...initialFormValues,
      ciudad: geoCatalog.ciudades[0] ?? "QUITO",
      parroquia:
        geoCatalog.parroquiasPorCiudad[geoCatalog.ciudades[0] ?? "QUITO"]?.[0] ??
        "",
    });
    setIsEditing(true);
    setAuditOpen(false);
    setMode("form");
  }

  function openEditForm(sucursal: SucursalRow) {
    setFormValues({
      sucursalId: String(sucursal.id),
      nombre: sucursal.nombre,
      estado:
        sucursal.activo && sucursal.visible
          ? "activo-visible"
          : "inactivo-oculto",
      direccion: sucursal.direccion,
      tipo: sucursal.tipo || "agencia",
      ciudad: sucursal.ciudad || geoCatalog.ciudades[0] || "QUITO",
      parroquia: sucursal.parroquia,
      identificacion: sucursal.identificacion,
      razonSocial: sucursal.razonSocial,
      telefono1: sucursal.telefono1,
      telefono2: sucursal.telefono2,
      metaVenta: sucursal.metaVenta,
      comisionProduccion: sucursal.comisionProduccion,
      comisionDistribucion: sucursal.comisionDistribucion,
    });
    setIsEditing(false);
    setAuditOpen(false);
    setMode("form");
  }

  function openSelector(field: "ciudad" | "parroquia") {
    if (!isEditing) {
      return;
    }

    setSelectorOpen(field);
    setSelectorSearch("");
  }

  function assignSelectorValue(value: string) {
    if (selectorOpen === "ciudad") {
      updateField("ciudad", value);
    }

    if (selectorOpen === "parroquia") {
      updateField("parroquia", value);
    }

    setSelectorOpen(null);
    setSelectorSearch("");
  }

  const formId = "sucursales-form";

  if (mode === "form") {
    return (
      <div className="rounded-sm border border-slate-300 bg-white p-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("list")}
            className="inline-flex items-center rounded-sm bg-[#6f7681] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f6671]"
          >
            Volver
          </button>
          <div className={isEditing ? "opacity-100" : "opacity-60"}>
            <SaveSucursalToolbarButton formId={formId} disabled={!isEditing} />
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center rounded-sm bg-[#b3bfd1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9eacc2]"
          >
            Nuevo
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center rounded-sm bg-[#8dd196] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#77c481]"
          >
            Modificar
          </button>
          {formValues.sucursalId ? (
            <form action={toggleSucursalActivoAction}>
              <input type="hidden" name="empresaId" value={empresaId ?? ""} />
              <input type="hidden" name="sucursalId" value={formValues.sucursalId} />
              <button
                type="submit"
                className="inline-flex items-center rounded-sm bg-[#ee9aa0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e5868e]"
              >
                Eliminar
              </button>
            </form>
          ) : null}
        </div>

        <form id={formId} action={formAction} className="space-y-4">
          <input type="hidden" name="empresaId" value={empresaId ?? ""} />
          <input type="hidden" name="sucursalId" value={formValues.sucursalId} />

          <div className="grid gap-4 md:grid-cols-[1fr_260px] md:items-center">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Sucursal</label>
              <input
                name="nombre"
                value={formValues.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Estado</label>
              <select
                name="estado"
                value={formValues.estado}
                onChange={(event) => updateField("estado", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              >
                <option value="activo-visible">Activo / Visible</option>
                <option value="inactivo-oculto">Inactivo / Oculto</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Direccion</label>
            <input
              name="direccion"
              value={formValues.direccion}
              onChange={(event) => updateField("direccion", event.target.value)}
              disabled={!isEditing}
              className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div>
              <label className="mb-2 block text-sm text-slate-700">Tipo</label>
              <div className="flex flex-wrap gap-5">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="tipo"
                    value="agencia"
                    checked={formValues.tipo === "agencia"}
                    onChange={(event) => updateField("tipo", event.target.value)}
                    disabled={!isEditing}
                  />
                  Agencia
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="tipo"
                    value="agenciado"
                    checked={formValues.tipo === "agenciado"}
                    onChange={(event) => updateField("tipo", event.target.value)}
                    disabled={!isEditing}
                  />
                  Agenciado
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-[140px_1fr_44px] items-center gap-3">
                <label className="text-sm text-slate-700">Ciudades:</label>
                <select
                  name="ciudad"
                  value={formValues.ciudad}
                  onChange={(event) => updateField("ciudad", event.target.value)}
                  disabled={!isEditing}
                  className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
                >
                  {geoCatalog.ciudades.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
                <SearchButton
                  disabled={!isEditing}
                  onClick={() => openSelector("ciudad")}
                />
              </div>

              <div className="grid grid-cols-[140px_1fr_44px] items-center gap-3">
                <label className="text-sm text-slate-700">Parroquias:</label>
                <select
                  name="parroquia"
                  value={formValues.parroquia}
                  onChange={(event) =>
                    updateField("parroquia", event.target.value)
                  }
                  disabled={!isEditing}
                  className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
                >
                  {parroquias.map((parroquia) => (
                    <option key={parroquia} value={parroquia}>
                      {parroquia}
                    </option>
                  ))}
                </select>
                <SearchButton
                  disabled={!isEditing}
                  onClick={() => openSelector("parroquia")}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Identificacion:</label>
              <input
                name="identificacion"
                value={formValues.identificacion}
                onChange={(event) =>
                  updateField("identificacion", event.target.value)
                }
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Razon Social</label>
            <input
              name="razonSocial"
              value={formValues.razonSocial}
              onChange={(event) => updateField("razonSocial", event.target.value)}
              disabled={!isEditing}
              className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Telefono 1 :</label>
              <input
                name="telefono1"
                value={formValues.telefono1}
                onChange={(event) => updateField("telefono1", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Telefono 2:</label>
              <input
                name="telefono2"
                value={formValues.telefono2}
                onChange={(event) => updateField("telefono2", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Meta de Venta</label>
              <input
                name="metaVenta"
                value={formValues.metaVenta}
                onChange={(event) => updateField("metaVenta", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">
                Comision Produccion
              </label>
              <input
                name="comisionProduccion"
                value={formValues.comisionProduccion}
                onChange={(event) =>
                  updateField("comisionProduccion", event.target.value)
                }
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">
                Comision Distribucion
              </label>
              <input
                name="comisionDistribucion"
                value={formValues.comisionDistribucion}
                onChange={(event) =>
                  updateField("comisionDistribucion", event.target.value)
                }
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          {state.error ? (
            <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setAuditOpen(true)}
              className="inline-flex items-center rounded-sm bg-[#9ddccf] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#86d0c1]"
            >
              Auditoria
            </button>
          </div>
        </form>

        {selectorOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
                    Busqueda
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                    {selectorOpen === "ciudad" ? "Seleccionar ciudad" : "Seleccionar parroquia"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectorOpen(null)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-4 px-6 py-6">
                <input
                  value={selectorSearch}
                  onChange={(event) => setSelectorSearch(event.target.value)}
                  placeholder={
                    selectorOpen === "ciudad"
                      ? "Buscar ciudad"
                      : "Buscar parroquia"
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />

                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                  {filteredSelectorOptions.length > 0 ? (
                    filteredSelectorOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => assignSelectorValue(item)}
                        className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <span>{item}</span>
                        <span className="text-xs text-slate-400">Seleccionar</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-500">
                      No hay resultados para esta busqueda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {auditOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
                    Auditoria
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                    Historial del registro
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditOpen(false)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-4 px-6 py-6 text-sm text-slate-700">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Sucursal
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {formValues.nombre || "Registro nuevo"}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 px-4 py-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                      Creado
                    </p>
                    <p className="mt-2">
                      {currentSucursal
                        ? new Date(currentSucursal.createdAt).toLocaleString("es-EC")
                        : "Aun no guardado"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                      Ultima actualizacion
                    </p>
                    <p className="mt-2">
                      {currentSucursal
                        ? new Date(currentSucursal.updatedAt).toLocaleString("es-EC")
                        : "Aun no guardado"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Estado actual
                  </p>
                  <p className="mt-2">
                    {formValues.estado === "activo-visible"
                      ? "Activo / Visible"
                      : "Inactivo / Oculto"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 border-b border-slate-300 px-2 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor="buscar-sucursal"
            className="text-[15px] font-semibold text-slate-800"
          >
            Buscar:
          </label>
          <div className="flex flex-1 items-stretch">
            <input
              id="buscar-sucursal"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca por sucursal, razon social, ciudad o direccion"
              className="min-w-0 flex-1 border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1677c9]"
            />
            <span className="inline-flex items-center justify-center border-y border-r border-slate-300 bg-[#ffbf3f] px-4 text-xl text-white">
              O
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateForm}
            disabled={!empresaId}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[#3d67a8] text-3xl leading-none text-white transition hover:bg-[#2f548d] disabled:cursor-not-allowed disabled:bg-[#9db2d7]"
          >
            +
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white text-slate-600">
              <th className="w-40 border border-slate-300 px-3 py-3 text-left font-semibold">
                Acciones
              </th>
              <th className="w-16 border border-slate-300 px-3 py-3 text-left font-semibold">
                #
              </th>
              <th className="w-52 border border-slate-300 px-3 py-3 text-left font-semibold">
                Sucursal
              </th>
              <th className="w-40 border border-slate-300 px-3 py-3 text-left font-semibold">
                Estado
              </th>
              <th className="w-52 border border-slate-300 px-3 py-3 text-left font-semibold">
                Responsable
              </th>
              <th className="w-48 border border-slate-300 px-3 py-3 text-left font-semibold">
                Ciudad
              </th>
              <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                Direccion
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSucursales.length > 0 ? (
              filteredSucursales.map((sucursal, index) => (
                <tr
                  key={sucursal.id}
                  className={
                    sucursal.activo
                      ? index === 0
                        ? "bg-[#dfeaf2]"
                        : "bg-white"
                      : "bg-slate-100 text-slate-500"
                  }
                >
                  <td className="border border-slate-300 px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(sucursal)}
                        className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                      >
                        Editar
                      </button>
                      <form action={toggleSucursalActivoAction}>
                        <input type="hidden" name="empresaId" value={empresaId ?? ""} />
                        <input type="hidden" name="sucursalId" value={sucursal.id} />
                        <button
                          type="submit"
                          className={`inline-flex rounded-sm px-3 py-1.5 text-sm font-semibold transition ${
                            sucursal.activo
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {sucursal.activo ? "Eliminar" : "Restaurar"}
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="border border-slate-300 px-3 py-3">{index + 1}</td>
                  <td className="border border-slate-300 px-3 py-3">
                    {sucursal.nombre}
                  </td>
                  <td className="border border-slate-300 px-3 py-3">
                    {sucursal.activo ? "Activo / Visible" : "Inactivo / Oculto"}
                  </td>
                  <td className="border border-slate-300 px-3 py-3">
                    {sucursal.razonSocial || sucursal.responsable || "-"}
                  </td>
                  <td className="border border-slate-300 px-3 py-3">
                    {sucursal.ciudad || "-"}
                  </td>
                  <td className="border border-slate-300 px-3 py-3">
                    {sucursal.direccion || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                >
                  Aun no hay sucursales registradas para esta empresa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SaveSucursalToolbarButton({
  formId,
  disabled,
}: {
  formId: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      form={formId}
      disabled={pending || disabled}
      className="inline-flex items-center rounded-sm bg-[#1c86ea] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#116fc7] disabled:cursor-not-allowed disabled:bg-[#8ebced]"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}
