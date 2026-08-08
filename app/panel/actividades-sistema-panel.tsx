"use client";

import { useMemo, useState } from "react";

type ActividadRow = {
  id: string;
  modulo: string;
  accion: string;
  fecha: string;
  usuario: string;
  empresaId: number | null;
  empresa: string;
  detalle: string;
};

type EmpresaOption = {
  id: number;
  razonSocial: string;
};

type ActividadesSistemaPanelProps = {
  actividades: ActividadRow[];
  empresas: EmpresaOption[];
};

export function ActividadesSistemaPanel({
  actividades,
  empresas,
}: ActividadesSistemaPanelProps) {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [empresaDraft, setEmpresaDraft] = useState("todas");
  const [empresaFilter, setEmpresaFilter] = useState("todas");
  const [selectedActividad, setSelectedActividad] = useState<ActividadRow | null>(
    null,
  );

  const filteredActividades = useMemo(() => {
    const query = search.trim().toLowerCase();

    return actividades.filter((actividad) => {
      const matchesSearch =
        !query ||
        actividad.modulo.toLowerCase().includes(query) ||
        actividad.accion.toLowerCase().includes(query) ||
        actividad.usuario.toLowerCase().includes(query) ||
        actividad.empresa.toLowerCase().includes(query) ||
        actividad.detalle.toLowerCase().includes(query);

      const matchesEmpresa =
        empresaFilter === "todas" ||
        String(actividad.empresaId ?? "") === empresaFilter;

      return matchesSearch && matchesEmpresa;
    });
  }, [actividades, empresaFilter, search]);

  function applyFilters() {
    setSearch(searchDraft);
    setEmpresaFilter(empresaDraft);
  }

  return (
    <>
      <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-300 px-2 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center">
            <label
              htmlFor="buscar-actividad"
              className="text-[15px] font-semibold text-slate-800"
            >
              Buscar:
            </label>
            <div className="flex min-w-0 flex-1 items-stretch">
              <input
                id="buscar-actividad"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                className="min-w-0 flex-1 border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1677c9]"
              />
              <button
                type="button"
                onClick={applyFilters}
                className="inline-flex items-center justify-center border-y border-r border-slate-300 bg-[#ffbf3f] px-4 text-xl text-white transition hover:bg-[#efa81f]"
              >
                O
              </button>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center rounded-sm bg-[#f0a332] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#dc9122]"
            >
              Filtrar
            </button>

            <label className="text-[15px] font-semibold text-slate-800">
              Empresa
            </label>
            <select
              value={empresaDraft}
              onChange={(event) => setEmpresaDraft(event.target.value)}
              className="min-w-[220px] border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1677c9]"
            >
              <option value="todas">TODAS</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={String(empresa.id)}>
                  {empresa.razonSocial}
                </option>
              ))}
            </select>

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
                <th className="w-20 border border-slate-300 px-3 py-3 text-center font-semibold">
                  Ver
                </th>
                <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                  Modulo
                </th>
                <th className="w-44 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Acción
                </th>
                <th className="w-48 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Fecha
                </th>
                <th className="w-44 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Usuario
                </th>
                <th className="w-56 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Empresa
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredActividades.length > 0 ? (
                filteredActividades.map((actividad, index) => (
                  <tr
                    key={actividad.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="border border-slate-300 px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedActividad(actividad)}
                        className="inline-flex rounded-sm bg-[#d9eaf8] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#c5ddf3]"
                      >
                        Ver
                      </button>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {actividad.modulo}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {actividad.accion}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {actividad.fecha}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {actividad.usuario}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {actividad.empresa}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-slate-300 px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron registros para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedActividad ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#1677c9] uppercase">
                  Actividad Sistema
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                  Detalle del movimiento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActividad(null)}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <DetailCard label="Modulo" value={selectedActividad.modulo} />
              <DetailCard label="Accion" value={selectedActividad.accion} />
              <DetailCard label="Fecha" value={selectedActividad.fecha} />
              <DetailCard label="Usuario" value={selectedActividad.usuario} />
              <DetailCard label="Empresa" value={selectedActividad.empresa} />
              <DetailCard label="Detalle" value={selectedActividad.detalle} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
