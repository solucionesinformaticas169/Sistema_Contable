"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveIntegracionAction,
  toggleIntegracionActivaAction,
} from "./integraciones-actions";

type IntegracionRow = {
  id: number;
  descripcion: string;
  tipo: string;
  servidor: string;
  usuario: string;
  contrasena: string;
  puerto: string;
  activo: boolean;
};

type IntegracionesPanelProps = {
  empresaId?: number;
  integraciones: IntegracionRow[];
};

type IntegracionFormValues = {
  integracionId: string;
  descripcion: string;
  tipo: string;
  servidor: string;
  usuario: string;
  contrasena: string;
  puerto: string;
};

const initialActionState = {
  error: null,
};

const initialFormValues: IntegracionFormValues = {
  integracionId: "",
  descripcion: "",
  tipo: "SMTP",
  servidor: "",
  usuario: "",
  contrasena: "",
  puerto: "",
};

const tipoOptions = ["SMTP", "WhatsApp", "Ecommerce", "API Key"] as const;

export function IntegracionesPanel({
  empresaId,
  integraciones,
}: IntegracionesPanelProps) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "form">("list");
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(
    saveIntegracionAction,
    initialActionState,
  );
  const [formValues, setFormValues] =
    useState<IntegracionFormValues>(initialFormValues);

  const filteredIntegraciones = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return integraciones;
    }

    return integraciones.filter((integracion) => {
      return (
        integracion.descripcion.toLowerCase().includes(query) ||
        integracion.tipo.toLowerCase().includes(query) ||
        integracion.servidor.toLowerCase().includes(query) ||
        integracion.usuario.toLowerCase().includes(query)
      );
    });
  }, [integraciones, search]);

  function updateField<K extends keyof IntegracionFormValues>(
    field: K,
    value: IntegracionFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function openCreateForm() {
    setFormValues(initialFormValues);
    setIsEditing(true);
    setMode("form");
  }

  function openEditForm(integracion: IntegracionRow) {
    setFormValues({
      integracionId: String(integracion.id),
      descripcion: integracion.descripcion,
      tipo: integracion.tipo,
      servidor: integracion.servidor,
      usuario: integracion.usuario,
      contrasena: integracion.contrasena,
      puerto: integracion.puerto,
    });
    setIsEditing(false);
    setMode("form");
  }

  const formId = "integraciones-form";

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
          <SaveIntegracionToolbarButton formId={formId} disabled={!isEditing} />
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
          {formValues.integracionId ? (
            <form action={toggleIntegracionActivaAction}>
              <input type="hidden" name="empresaId" value={empresaId ?? ""} />
              <input
                type="hidden"
                name="integracionId"
                value={formValues.integracionId}
              />
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
          <input
            type="hidden"
            name="integracionId"
            value={formValues.integracionId}
          />

          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Descripción:</label>
            <input
              name="descripcion"
              value={formValues.descripcion}
              onChange={(event) =>
                updateField("descripcion", event.target.value)
              }
              disabled={!isEditing}
              className="max-w-[420px] border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Integración :</label>
            <select
              name="tipo"
              value={formValues.tipo}
              onChange={(event) => updateField("tipo", event.target.value)}
              disabled={!isEditing}
              className="max-w-[170px] border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
            >
              {tipoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 pt-3 md:max-w-[420px]">
            <div className="grid grid-cols-[90px_1fr] items-center gap-3">
              <label className="text-sm text-slate-700">Servidor:</label>
              <input
                name="servidor"
                value={formValues.servidor}
                onChange={(event) => updateField("servidor", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid grid-cols-[90px_1fr] items-center gap-3">
              <label className="text-sm text-slate-700">Usuario:</label>
              <input
                name="usuario"
                value={formValues.usuario}
                onChange={(event) => updateField("usuario", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid grid-cols-[90px_1fr] items-center gap-3">
              <label className="text-sm text-slate-700">Contraseña:</label>
              <input
                name="contrasena"
                value={formValues.contrasena}
                onChange={(event) =>
                  updateField("contrasena", event.target.value)
                }
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
            <div className="grid grid-cols-[90px_1fr] items-center gap-3">
              <label className="text-sm text-slate-700">Puerto:</label>
              <input
                name="puerto"
                value={formValues.puerto}
                onChange={(event) => updateField("puerto", event.target.value)}
                disabled={!isEditing}
                className="border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          {state.error ? (
            <div className="max-w-[420px] rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 border-b border-slate-300 px-2 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor="buscar-integracion"
            className="text-[15px] font-semibold text-slate-800"
          >
            Buscar:
          </label>
          <div className="flex flex-1 items-stretch">
            <input
              id="buscar-integracion"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
          <button
            type="button"
            className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Tutoriales
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white text-slate-600">
              <th className="w-28 border border-slate-300 px-3 py-3 text-left font-semibold">
                Acciones
              </th>
              <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIntegraciones.length > 0 ? (
              filteredIntegraciones.map((integracion) => (
                <tr
                  key={integracion.id}
                  className={integracion.activo ? "bg-white" : "bg-slate-100 text-slate-500"}
                >
                  <td className="border border-slate-300 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(integracion)}
                      className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                    >
                      Editar
                    </button>
                  </td>
                  <td className="border border-slate-300 px-3 py-3 text-slate-800">
                    {integracion.descripcion}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="border border-slate-300 px-4 py-10 text-center text-[18px] font-semibold text-[#8b0000]"
                >
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SaveIntegracionToolbarButton({
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
