"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  buildPermissionKey,
  permissionActions,
  permissionCatalog,
  type PermissionActionKey,
} from "@/lib/permissions";
import { saveUsuarioPermisosAction } from "./usuarios-actions";

type UsuarioPermisoRow = {
  paginaKey: string;
  visualizar: boolean;
  agregar: boolean;
  modificar: boolean;
  eliminar: boolean;
  verCosto: boolean;
};

type UsuarioPermisosPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
  };
  usuario: {
    id: number;
    identificacion: string;
    descripcion: string;
    email: string;
  };
  permisos: UsuarioPermisoRow[];
  defaultAllChecked: boolean;
};

type PermissionMatrixState = Record<string, Record<PermissionActionKey, boolean>>;

const initialActionState = {
  error: null,
};

function createInitialMatrix(
  permisos: UsuarioPermisoRow[],
  defaultAllChecked: boolean,
): PermissionMatrixState {
  const existingMap = new Map(permisos.map((item) => [item.paginaKey, item]));

  return Object.fromEntries(
    permissionCatalog.flatMap((group) =>
      group.pages.map((page) => {
        const paginaKey = buildPermissionKey(group.category, page);
        const current = existingMap.get(paginaKey);

        return [
          paginaKey,
          {
            visualizar: current?.visualizar ?? defaultAllChecked,
            agregar: current?.agregar ?? defaultAllChecked,
            modificar: current?.modificar ?? defaultAllChecked,
            eliminar: current?.eliminar ?? defaultAllChecked,
            verCosto: current?.verCosto ?? defaultAllChecked,
          },
        ];
      }),
    ),
  );
}

export function UsuarioPermisosPanel({
  empresa,
  usuario,
  permisos,
  defaultAllChecked,
}: UsuarioPermisosPanelProps) {
  const [mode, setMode] = useState<"todos" | "ninguno">(
    defaultAllChecked ? "todos" : "ninguno",
  );
  const [matrix, setMatrix] = useState<PermissionMatrixState>(() =>
    createInitialMatrix(permisos, defaultAllChecked),
  );
  const [state, formAction] = useActionState(
    saveUsuarioPermisosAction,
    initialActionState,
  );

  function updateCell(
    paginaKey: string,
    action: PermissionActionKey,
    value: boolean,
  ) {
    setMatrix((current) => ({
      ...current,
      [paginaKey]: {
        ...current[paginaKey],
        [action]: value,
      },
    }));
  }

  function applyMode(nextMode: "todos" | "ninguno") {
    setMode(nextMode);
    const nextValue = nextMode === "todos";

    setMatrix((current) =>
      Object.fromEntries(
        Object.entries(current).map(([paginaKey]) => [
          paginaKey,
          {
            visualizar: nextValue,
            agregar: nextValue,
            modificar: nextValue,
            eliminar: nextValue,
            verCosto: nextValue,
          },
        ]),
      ),
    );
  }

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=usuarios`}
            className="rounded-sm bg-slate-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
          >
            Volver
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
              Permisos de usuario
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">
              {usuario.descripcion}
            </h3>
          </div>
        </div>

        <div className="rounded-sm bg-[#ff9f1a] px-4 py-2 text-sm font-semibold text-white">
          Datos Usuario
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-5">
        <input type="hidden" name="empresaId" value={empresa.id} />
        <input type="hidden" name="usuarioId" value={usuario.id} />

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm font-semibold text-slate-900">Marcar permisos Paginas</p>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              checked={mode === "todos"}
              onChange={() => applyMode("todos")}
            />
            Todos
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              checked={mode === "ninguno"}
              onChange={() => applyMode("ninguno")}
            />
            Ninguno
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Empresa</span>
            <div className="min-w-[220px] rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800">
              {empresa.razonSocial}
            </div>
          </div>
        </div>

        {state.error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        <div className="overflow-x-auto border border-slate-300">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white text-slate-600">
                <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                  Pagina
                </th>
                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                  Visualizar
                </th>
                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                  Agregar
                </th>
                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                  Modificar
                </th>
                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                  Eliminar
                </th>
                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                  Ver Costo
                </th>
              </tr>
            </thead>
            <tbody>
              {permissionCatalog.map((group) => (
                <Fragment key={group.category}>
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-slate-300 bg-[#f6b63d] px-3 py-2 text-left font-semibold text-slate-900"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.pages.map((page) => {
                    const paginaKey = buildPermissionKey(group.category, page);
                    const pageState = matrix[paginaKey];

                    return (
                      <tr key={paginaKey} className="bg-white">
                        <td className="border border-slate-300 px-3 py-2 text-slate-800">
                          {page}
                        </td>
                        {permissionActions.map((action) => (
                          <td
                            key={`${paginaKey}-${action}`}
                            className="border border-slate-300 px-3 py-2 text-center"
                          >
                            <input
                              type="checkbox"
                              name={`${paginaKey}__${action}`}
                              checked={pageState?.[action] ?? false}
                              onChange={(event) =>
                                updateCell(paginaKey, action, event.target.checked)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <SavePermissionsButton />
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=usuarios`}
            className="rounded-sm bg-[#2f79d2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2368ba]"
          >
            Nuevo
          </Link>
          <div className="rounded-sm bg-[#62b04f] px-4 py-2.5 text-sm font-semibold text-white">
            Permisos Reportes
          </div>
        </div>
      </form>
    </div>
  );
}

function SavePermissionsButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-[#1677c9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f65ad] disabled:cursor-not-allowed disabled:bg-[#8bbce4]"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}
