"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEmpresaAction } from "./actions";

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

const initialValues: FormValues = {
  ruc: "",
  razonSocial: "",
  direccion: "",
  provincia: "",
  ciudad: "",
  tipoNegocio: "",
  whatsapp: "",
  correo: "",
  password: "",
};

const initialActionState = {
  error: null,
};

export function EmpresaForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const [state, formAction] = useActionState(createEmpresaAction, initialActionState);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    setSubmitted(values);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_18px_45px_rgba(103,74,20,0.10)]"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase">
            Nueva empresa
          </p>
          <h2 className="font-serif text-3xl text-slate-950">
            Ingresa los datos principales
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            Este formulario es el punto de partida para registrar una empresa dentro del
            sistema.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <input type="hidden" name="redirectTo" value="/ingresar" />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="ruc">
              RUC
            </label>
            <input
              id="ruc"
              name="ruc"
              value={values.ruc}
              onChange={(event) => updateField("ruc", event.target.value)}
              placeholder="0999999999001"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="razonSocial">
              Razon social
            </label>
            <input
              id="razonSocial"
              name="razonSocial"
              value={values.razonSocial}
              onChange={(event) => updateField("razonSocial", event.target.value)}
              placeholder="Soluciones Informaticas S.A."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="correo">
              Correo electronico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={values.correo}
              onChange={(event) => updateField("correo", event.target.value)}
              placeholder="empresa@dominio.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="direccion">
              Direccion
            </label>
            <input
              id="direccion"
              name="direccion"
              value={values.direccion}
              onChange={(event) => updateField("direccion", event.target.value)}
              placeholder="Direccion principal de la empresa"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="provincia">
                Provincia
              </label>
              <input
                id="provincia"
                name="provincia"
                value={values.provincia}
                onChange={(event) => updateField("provincia", event.target.value)}
                placeholder="Pichincha"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="ciudad">
                Ciudad
              </label>
              <input
                id="ciudad"
                name="ciudad"
                value={values.ciudad}
                onChange={(event) => updateField("ciudad", event.target.value)}
                placeholder="Quito"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="tipoNegocio"
              >
                Tipo de negocio
              </label>
              <input
                id="tipoNegocio"
                name="tipoNegocio"
                value={values.tipoNegocio}
                onChange={(event) => updateField("tipoNegocio", event.target.value)}
                placeholder="Panaderia, ferreteria, software, restaurante"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="whatsapp">
                Whatsapp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                value={values.whatsapp}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                placeholder="0999999999"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Contrasena de ingreso
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Minimo 6 caracteres"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </div>
        </div>

        {state.error ? (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <SubmitButton />
        </div>
      </form>

      <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.22)]">
        <p className="text-xs font-semibold tracking-[0.22em] text-amber-300 uppercase">
          Vista previa
        </p>
        <h3 className="mt-3 font-serif text-3xl">Resumen del registro</h3>
        <div className="mt-6 space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">RUC</p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.ruc || "Aun no ingresado"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Razon social
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.razonSocial || "Aun no ingresada"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Direccion
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.direccion || "Aun no ingresada"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Ubicacion
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.provincia || "Provincia pendiente"} / {values.ciudad || "Ciudad pendiente"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Tipo de negocio
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.tipoNegocio || "Aun no ingresado"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Correo
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.correo || "Aun no ingresado"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Whatsapp
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.whatsapp || "Aun no ingresado"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Acceso inicial
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {values.password ? "Contrasena configurada" : "Aun no configurada"}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-100">
            Empresa preparada para registrarse:
            <br />
            {submitted.razonSocial} - {submitted.ruc}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200"
    >
      {pending ? "Guardando..." : "Guardar empresa"}
    </button>
  );
}
