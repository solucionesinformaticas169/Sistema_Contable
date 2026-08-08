"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEmpresaAction } from "../empresas/nueva/actions";
import { buildNombreDbPreview } from "@/lib/empresas";

type EmpresaRow = {
  id: number;
  ruc: string;
  razonSocial: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  tipoNegocio: string;
  whatsapp: string;
  correo: string;
  nombreDb: string | null;
};

type GestionEmpresasPanelProps = {
  empresas: EmpresaRow[];
  empresaId?: number;
};

const initialFormValues = {
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

export function GestionEmpresasPanel({
  empresas,
  empresaId,
}: GestionEmpresasPanelProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction] = useActionState(createEmpresaAction, initialActionState);

  const filteredEmpresas = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return empresas;
    }

    return empresas.filter((empresa) => {
      const businessType = empresa.tipoNegocio.toLowerCase();
      const nombreDb = empresa.nombreDb?.toLowerCase() ?? "";

      return (
        empresa.razonSocial.toLowerCase().includes(query) ||
        empresa.ruc.toLowerCase().includes(query) ||
        empresa.correo.toLowerCase().includes(query) ||
        businessType.includes(query) ||
        nombreDb.includes(query)
      );
    });
  }, [empresas, search]);

  function updateField(
    field: keyof typeof initialFormValues,
    value: string,
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-300 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="buscar-empresa"
              className="text-[15px] font-semibold text-slate-800"
            >
              Buscar:
            </label>
            <div className="flex flex-1 items-stretch">
              <input
                id="buscar-empresa"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca por negocio, RUC, correo o nombre DB"
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[#3d67a8] text-3xl leading-none text-white transition hover:bg-[#2f548d]"
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
                  Descripcion
                </th>
                <th className="w-72 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Nombre DB
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpresas.length > 0 ? (
                filteredEmpresas.map((empresa, index) => (
                  <tr
                    key={empresa.id}
                    className={index === 0 ? "bg-[#dfeaf2]" : "bg-white"}
                  >
                    <td className="border border-slate-300 px-3 py-3">
                      <Link
                        href={`/panel?${new URLSearchParams({
                          seccion: "gestion-empresas",
                          editarEmpresaId: String(empresa.id),
                          ...(empresaId ? { empresaId: String(empresaId) } : {}),
                        }).toString()}`}
                        className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                      >
                        Editar
                      </Link>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      <div>
                        <p className="font-medium">{empresa.razonSocial}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {empresa.tipoNegocio} - {empresa.ruc}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {empresa.correo}
                        </p>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 font-mono text-[13px] text-slate-700">
                      {empresa.nombreDb ||
                        buildNombreDbPreview(empresa.razonSocial, empresa.id)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay empresas que coincidan con la busqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
                  Gestion Empresas
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                  Nueva empresa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <form
              action={formAction}
              className="space-y-5 px-6 py-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <input type="hidden" name="redirectTo" value="/panel" />

                <div className="space-y-2">
                  <label
                    htmlFor="gestion-ruc"
                    className="text-sm font-medium text-slate-700"
                  >
                    RUC
                  </label>
                  <input
                    id="gestion-ruc"
                    name="ruc"
                    value={formValues.ruc}
                    onChange={(event) => updateField("ruc", event.target.value)}
                    placeholder="0999999999001"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gestion-razon-social"
                    className="text-sm font-medium text-slate-700"
                  >
                    Razon social
                  </label>
                  <input
                    id="gestion-razon-social"
                    name="razonSocial"
                    value={formValues.razonSocial}
                    onChange={(event) => updateField("razonSocial", event.target.value)}
                    placeholder="Panaderia Central"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gestion-direccion"
                  className="text-sm font-medium text-slate-700"
                >
                  Direccion
                </label>
                <input
                  id="gestion-direccion"
                  name="direccion"
                  value={formValues.direccion}
                  onChange={(event) => updateField("direccion", event.target.value)}
                  placeholder="Direccion principal"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="gestion-provincia"
                    className="text-sm font-medium text-slate-700"
                  >
                    Provincia
                  </label>
                  <input
                    id="gestion-provincia"
                    name="provincia"
                    value={formValues.provincia}
                    onChange={(event) => updateField("provincia", event.target.value)}
                    placeholder="Pichincha"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gestion-ciudad"
                    className="text-sm font-medium text-slate-700"
                  >
                    Ciudad
                  </label>
                  <input
                    id="gestion-ciudad"
                    name="ciudad"
                    value={formValues.ciudad}
                    onChange={(event) => updateField("ciudad", event.target.value)}
                    placeholder="Quito"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="gestion-tipo-negocio"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tipo de negocio
                  </label>
                  <input
                    id="gestion-tipo-negocio"
                    name="tipoNegocio"
                    value={formValues.tipoNegocio}
                    onChange={(event) => updateField("tipoNegocio", event.target.value)}
                    placeholder="Panaderia, software, restaurante"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gestion-whatsapp"
                    className="text-sm font-medium text-slate-700"
                  >
                    Whatsapp
                  </label>
                  <input
                    id="gestion-whatsapp"
                    name="whatsapp"
                    value={formValues.whatsapp}
                    onChange={(event) => updateField("whatsapp", event.target.value)}
                    placeholder="0999999999"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gestion-correo"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo electronico
                </label>
                <input
                  id="gestion-correo"
                  name="correo"
                  type="email"
                  value={formValues.correo}
                  onChange={(event) => updateField("correo", event.target.value)}
                  placeholder="empresa@dominio.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gestion-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contrasena de ingreso
                </label>
                <input
                  id="gestion-password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Minimo 6 caracteres"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gestion-tipo-negocio-resumen"
                  className="text-sm font-medium text-slate-700"
                >
                  Tipo de negocio y ubicacion
                </label>
                <div
                  id="gestion-tipo-negocio-resumen"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
                >
                  {formValues.tipoNegocio || "Tipo de negocio pendiente"}
                  <br />
                  {formValues.direccion || "Direccion pendiente"}
                  <br />
                  {formValues.provincia || "Provincia pendiente"} / {formValues.ciudad || "Ciudad pendiente"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Nombre DB generado
                </p>
                <p className="mt-2 font-mono text-sm text-slate-800">
                  {buildNombreDbPreview(formValues.razonSocial)}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Este nombre es interno y ahora se genera de forma legible para
                  identificar mejor cada empresa.
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Correo: {formValues.correo || "Pendiente"}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Whatsapp: {formValues.whatsapp || "Pendiente"}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Acceso inicial: {formValues.password ? "Contrasena configurada" : "Pendiente"}
                </p>
              </div>

              {state.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {state.error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
                >
                  Cancelar
                </button>
                <SaveButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#1677c9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f65ad] disabled:cursor-not-allowed disabled:bg-[#8bbce4]"
    >
      {pending ? "Guardando..." : "Guardar empresa"}
    </button>
  );
}
