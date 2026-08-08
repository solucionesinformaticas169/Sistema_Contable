"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveUsuarioAction,
  toggleUsuarioActivoAction,
} from "./usuarios-actions";

type UsuarioRow = {
  id: number;
  identificacion: string;
  descripcion: string;
  email: string;
  activo: boolean;
};

type UsuariosPanelProps = {
  empresaId?: number;
  usuarios: UsuarioRow[];
};

type UsuarioFormValues = {
  usuarioId: string;
  identificacion: string;
  descripcion: string;
  email: string;
};

const initialActionState = {
  error: null,
};

const initialFormValues: UsuarioFormValues = {
  usuarioId: "",
  identificacion: "",
  descripcion: "",
  email: "",
};

export function UsuariosPanel({ empresaId, usuarios }: UsuariosPanelProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<UsuarioFormValues>(initialFormValues);
  const [state, formAction] = useActionState(saveUsuarioAction, initialActionState);

  const filteredUsuarios = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      return (
        usuario.identificacion.toLowerCase().includes(query) ||
        usuario.descripcion.toLowerCase().includes(query) ||
        usuario.email.toLowerCase().includes(query)
      );
    });
  }, [usuarios, search]);

  function updateField<K extends keyof UsuarioFormValues>(
    field: K,
    value: UsuarioFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setFormValues(initialFormValues);
    setIsModalOpen(true);
  }

  function openEditModal(usuario: UsuarioRow) {
    setFormValues({
      usuarioId: String(usuario.id),
      identificacion: usuario.identificacion,
      descripcion: usuario.descripcion,
      email: usuario.email,
    });
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-300 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="buscar-usuario"
              className="text-[15px] font-semibold text-slate-800"
            >
              Buscar:
            </label>
            <div className="flex flex-1 items-stretch">
              <input
                id="buscar-usuario"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca por identificacion, descripcion o email"
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
              onClick={openCreateModal}
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
                <th className="w-40 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Acciones
                </th>
                <th className="w-16 border border-slate-300 px-3 py-3 text-left font-semibold">
                  #
                </th>
                <th className="w-52 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Identificacion
                </th>
                <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                  Descripcion
                </th>
                <th className="w-80 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    className={
                      usuario.activo
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
                          onClick={() => openEditModal(usuario)}
                          className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                        >
                          Editar
                        </button>
                        <Link
                          href={`/panel?${new URLSearchParams({
                            seccion: "usuarios",
                            editarPermisosUsuarioId: String(usuario.id),
                            ...(empresaId ? { empresaId: String(empresaId) } : {}),
                          }).toString()}`}
                          className="inline-flex rounded-sm bg-[#85c1ff] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#72b4f6]"
                        >
                          Permisos
                        </Link>
                        <form action={toggleUsuarioActivoAction}>
                          <input type="hidden" name="empresaId" value={empresaId ?? ""} />
                          <input type="hidden" name="usuarioId" value={usuario.id} />
                          <button
                            type="submit"
                            className={`inline-flex rounded-sm px-3 py-1.5 text-sm font-semibold transition ${
                              usuario.activo
                                ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            }`}
                          >
                            {usuario.activo ? "Eliminar" : "Restaurar"}
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {usuario.identificacion}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      <div>
                        <p>{usuario.descripcion}</p>
                        <p className="mt-1 text-xs">
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </p>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {usuario.email}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Aun no hay usuarios registrados para esta empresa.
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
                  Usuarios
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                  {formValues.usuarioId ? "Editar usuario" : "Nuevo usuario"}
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

            <form action={formAction} className="space-y-5 px-6 py-6">
              <input type="hidden" name="empresaId" value={empresaId ?? ""} />
              <input type="hidden" name="usuarioId" value={formValues.usuarioId} />

              <div className="space-y-2">
                <label
                  htmlFor="usuario-identificacion"
                  className="text-sm font-medium text-slate-700"
                >
                  Identificacion
                </label>
                <input
                  id="usuario-identificacion"
                  name="identificacion"
                  value={formValues.identificacion}
                  onChange={(event) => updateField("identificacion", event.target.value)}
                  placeholder="0104919477001"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="usuario-descripcion"
                  className="text-sm font-medium text-slate-700"
                >
                  Descripcion
                </label>
                <input
                  id="usuario-descripcion"
                  name="descripcion"
                  value={formValues.descripcion}
                  onChange={(event) => updateField("descripcion", event.target.value)}
                  placeholder="Nombre completo o descripcion del usuario"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="usuario-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="usuario-email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1677c9]"
                />
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
                <SaveUsuarioButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SaveUsuarioButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#1677c9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f65ad] disabled:cursor-not-allowed disabled:bg-[#8bbce4]"
    >
      {pending ? "Guardando..." : "Guardar usuario"}
    </button>
  );
}
