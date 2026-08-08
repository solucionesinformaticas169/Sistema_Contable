"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateEmpresaAction } from "../empresas/nueva/actions";
import { buildNombreDbPreview } from "@/lib/empresas";

type EditEmpresaFormProps = {
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
  };
};

type FormValues = {
  ruc: string;
  razonSocial: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  tipoNegocio: string;
  whatsapp: string;
  correo: string;
  password: string;
};

const initialActionState = {
  error: null,
};

export function EditEmpresaForm({ empresa }: EditEmpresaFormProps) {
  const [values, setValues] = useState<FormValues>({
    ruc: empresa.ruc,
    razonSocial: empresa.razonSocial,
    direccion: empresa.direccion,
    provincia: empresa.provincia,
    ciudad: empresa.ciudad,
    tipoNegocio: empresa.tipoNegocio,
    whatsapp: empresa.whatsapp,
    correo: empresa.correo,
    password: "",
  });
  const [state, formAction] = useActionState(updateEmpresaAction, initialActionState);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
        <Link
          href={`/panel?empresaId=${empresa.id}&seccion=gestion-empresas`}
          className="rounded-sm bg-slate-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
        >
          Volver
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
            Gestion Empresas
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">
            Editar empresa
          </h3>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-5">
        <input type="hidden" name="empresaId" value={empresa.id} />

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-ruc">
            RUC
          </label>
          <input
            id="edit-ruc"
            name="ruc"
            value={values.ruc}
            onChange={(event) => updateField("ruc", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="edit-razon-social"
          >
            Razon social
          </label>
          <input
            id="edit-razon-social"
            name="razonSocial"
            value={values.razonSocial}
            onChange={(event) => updateField("razonSocial", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-direccion">
            Direccion
          </label>
          <input
            id="edit-direccion"
            name="direccion"
            value={values.direccion}
            onChange={(event) => updateField("direccion", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-provincia">
            Provincia
          </label>
          <input
            id="edit-provincia"
            name="provincia"
            value={values.provincia}
            onChange={(event) => updateField("provincia", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-ciudad">
            Ciudad
          </label>
          <input
            id="edit-ciudad"
            name="ciudad"
            value={values.ciudad}
            onChange={(event) => updateField("ciudad", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-correo">
            Correo
          </label>
          <input
            id="edit-correo"
            name="correo"
            type="email"
            value={values.correo}
            onChange={(event) => updateField("correo", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-start">
          <label
            className="pt-3 text-sm font-medium text-slate-700"
            htmlFor="edit-tipo-negocio"
          >
            Tipo de negocio
          </label>
          <input
            id="edit-tipo-negocio"
            name="tipoNegocio"
            value={values.tipoNegocio}
            onChange={(event) => updateField("tipoNegocio", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="edit-whatsapp">
            Whatsapp
          </label>
          <input
            id="edit-whatsapp"
            name="whatsapp"
            value={values.whatsapp}
            onChange={(event) => updateField("whatsapp", event.target.value)}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="edit-password"
          >
            Contrasena
          </label>
          <input
            id="edit-password"
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Deja vacio si no deseas cambiarla"
            className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
          <span className="text-sm font-medium text-slate-700">Nombre DB</span>
          <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
            {buildNombreDbPreview(values.razonSocial, empresa.id)}
          </div>
        </div>

        {state.error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <SaveChangesButton />
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=gestion-empresas`}
            className="rounded-sm bg-[#b9c7df] px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-[#aab9d3]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function SaveChangesButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-[#1677c9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f65ad] disabled:cursor-not-allowed disabled:bg-[#8bbce4]"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}
