"use client";

import { useMemo, useState } from "react";

type VentasProspectoPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
    ciudad: string;
  };
};

type ProspectoTipo = "Cédula" | "RUC" | "Pasaporte";

type ProspectoRow = {
  id: string;
  tipo: ProspectoTipo;
  identificacion: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  email: string;
  whatsapp: string;
  convencional: string;
  grupo: string;
  estado: string;
  ciudad: string;
  vendedor: string;
  activo: boolean;
};

type CiudadLookup = {
  id: string;
  value: string;
  label: string;
};

const STORAGE_KEY_PREFIX = "ventas-prospecto-draft";
const grupoOptions = ["Grupo General", "Mayoristas", "Frecuentes"] as const;
const estadoOptions = ["Prospecto", "Calificado", "Seguimiento"] as const;
const vendedorOptions = ["Vendedor", "Ejecutivo 1", "Ejecutivo 2"] as const;
const ciudadOptions = ["QUITO", "CUENCA", "GUAYAQUIL"] as const;

const ciudadLookupItems: CiudadLookup[] = [
  { id: "ciu-1", value: "QUITO", label: "Quito" },
  { id: "ciu-2", value: "CUENCA", label: "Cuenca" },
  { id: "ciu-3", value: "GUAYAQUIL", label: "Guayaquil" },
];

function createDefaultProspectos(
  empresa: VentasProspectoPanelProps["empresa"],
): ProspectoRow[] {
  return [
    {
      id: "prospecto-1",
      tipo: "RUC",
      identificacion: "1792450012001",
      razonSocial: empresa.razonSocial,
      nombreComercial: empresa.razonSocial,
      direccion: empresa.ciudad.toUpperCase(),
      email: "prospecto@empresa.ec",
      whatsapp: "0999999999",
      convencional: "022345678",
      grupo: "Grupo General",
      estado: "Prospecto",
      ciudad: empresa.ciudad.toUpperCase(),
      vendedor: "Vendedor",
      activo: true,
    },
  ];
}

function createEmptyProspecto(
  empresa: VentasProspectoPanelProps["empresa"],
): ProspectoRow {
  return {
    id: `prospecto-${Date.now()}`,
    tipo: "Cédula",
    identificacion: "",
    razonSocial: "",
    nombreComercial: "",
    direccion: empresa.ciudad.toUpperCase(),
    email: "",
    whatsapp: "",
    convencional: "",
    grupo: "Grupo General",
    estado: "Prospecto",
    ciudad: empresa.ciudad.toUpperCase(),
    vendedor: "Vendedor",
    activo: true,
  };
}

export function VentasProspectoPanel({
  empresa,
}: VentasProspectoPanelProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}-${empresa.id}`;
  const [prospectos, setProspectos] = useState<ProspectoRow[]>(() => {
    if (typeof window === "undefined") {
      return createDefaultProspectos(empresa);
    }

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return createDefaultProspectos(empresa);
    }

    try {
      const parsed = JSON.parse(saved) as ProspectoRow[];
      return parsed.length > 0 ? parsed : createDefaultProspectos(empresa);
    } catch {
      return createDefaultProspectos(empresa);
    }
  });
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "form">("list");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProspecto, setEditingProspecto] = useState<ProspectoRow>(() =>
    createEmptyProspecto(empresa),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">(
    "success",
  );
  const [isCiudadModalOpen, setIsCiudadModalOpen] = useState(false);
  const [ciudadSearch, setCiudadSearch] = useState("");

  const filteredProspectos = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return prospectos;
    }

    return prospectos.filter((prospecto) => {
      return (
        prospecto.identificacion.toLowerCase().includes(query) ||
        prospecto.razonSocial.toLowerCase().includes(query) ||
        prospecto.nombreComercial.toLowerCase().includes(query)
      );
    });
  }, [prospectos, search]);

  const filteredCiudades = useMemo(() => {
    const query = ciudadSearch.trim().toLowerCase();

    if (!query) {
      return ciudadLookupItems;
    }

    return ciudadLookupItems.filter((item) => {
      return (
        item.value.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query)
      );
    });
  }, [ciudadSearch]);

  function setBanner(
    nextMessage: string,
    tone: "success" | "warning" = "success",
  ) {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function persistRows(nextRows: ProspectoRow[]) {
    setProspectos(nextRows);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
    }
  }

  function updateEditingProspecto<K extends keyof ProspectoRow>(
    field: K,
    value: ProspectoRow[K],
  ) {
    setEditingProspecto((current) => ({ ...current, [field]: value }));
  }

  function openCreateForm() {
    setEditingProspecto(createEmptyProspecto(empresa));
    setMode("form");
    setIsEditing(true);
    setBanner("Nuevo prospecto listo para registrar.");
  }

  function openEditForm(prospecto: ProspectoRow) {
    setEditingProspecto(prospecto);
    setMode("form");
    setIsEditing(false);
    setBanner("Ficha del prospecto cargada. Pulsa Modificar para editar.");
  }

  function handleGuardar() {
    if (
      !editingProspecto.identificacion.trim() ||
      !editingProspecto.razonSocial.trim()
    ) {
      setBanner("Identificación y razón social son obligatorios.", "warning");
      return;
    }

    const exists = prospectos.some(
      (prospecto) => prospecto.id === editingProspecto.id,
    );
    const nextRows = exists
      ? prospectos.map((prospecto) =>
          prospecto.id === editingProspecto.id ? editingProspecto : prospecto,
        )
      : [editingProspecto, ...prospectos];

    persistRows(nextRows);
    setIsEditing(false);
    setBanner("Prospecto guardado correctamente.");
  }

  function handleNuevoDesdeFicha() {
    setEditingProspecto(createEmptyProspecto(empresa));
    setIsEditing(true);
    setBanner("Nueva ficha de prospecto preparada.");
  }

  function handleToggleActive(prospectoId: string) {
    const nextRows = prospectos.map((prospecto) =>
      prospecto.id === prospectoId
        ? { ...prospecto, activo: !prospecto.activo }
        : prospecto,
    );

    persistRows(nextRows);
    const prospecto = nextRows.find((row) => row.id === prospectoId);
    setBanner(
      prospecto?.activo
        ? "Prospecto restaurado al listado activo."
        : "Prospecto marcado como inactivo.",
      "warning",
    );
  }

  function handleExportExcel() {
    const link = document.createElement("a");
    link.href = "/api/download?file=listado-clientes-prospectos.xlsx";
    link.download = "Listado clientes_prospectos.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setBanner("Se descargó la plantilla de prospectos compartida.");
  }

  function openCiudadLookup() {
    setCiudadSearch("");
    setIsCiudadModalOpen(true);
  }

  function handleSelectCiudad(value: string) {
    updateEditingProspecto("ciudad", value);
    setIsCiudadModalOpen(false);
    setBanner(`Ciudad seleccionada: ${value}.`);
  }

  const disabledInputClass = isEditing
    ? "h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 outline-none";

  if (mode === "form") {
    return (
      <>
        <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 px-2 py-3">
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setIsEditing(false);
              }}
              className="inline-flex items-center rounded-sm bg-[#6f7681] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f6671]"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={!isEditing}
              className="inline-flex items-center rounded-sm bg-[#0f8fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b7ee0] disabled:cursor-not-allowed disabled:bg-[#9dc8f1]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleNuevoDesdeFicha}
              className="inline-flex items-center rounded-sm bg-[#b3bfd1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9eacc2]"
            >
              Nuevo
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setBanner("Edición habilitada para la ficha del prospecto.");
              }}
              className="inline-flex items-center rounded-sm bg-[#8dd196] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#77c481]"
            >
              Modificar
            </button>
          </div>

          {message ? (
            <div
              className={`mx-2 mt-3 rounded-sm border px-4 py-3 text-sm ${
                messageTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {message}
            </div>
          ) : null}

          <div className="grid gap-3 px-4 py-5 md:max-w-4xl md:grid-cols-[110px_160px_120px_1fr] md:items-center">
            <label className="text-sm text-slate-700">Tipo:</label>
            <select
              className={disabledInputClass}
              value={editingProspecto.tipo}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto(
                  "tipo",
                  event.target.value as ProspectoTipo,
                )
              }
            >
              <option>Cédula</option>
              <option>RUC</option>
              <option>Pasaporte</option>
            </select>
            <span />
            <span />

            <label className="text-sm text-slate-700">Identificación:</label>
            <input
              className={disabledInputClass}
              value={editingProspecto.identificacion}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("identificacion", event.target.value)
              }
            />
            <span />
            <span />

            <label className="text-sm text-slate-700">Razón Social</label>
            <input
              className="md:col-span-3 h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              value={editingProspecto.razonSocial}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("razonSocial", event.target.value)
              }
            />

            <label className="text-sm text-slate-700">Nombre Comercial</label>
            <input
              className="md:col-span-3 h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              value={editingProspecto.nombreComercial}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("nombreComercial", event.target.value)
              }
            />

            <label className="text-sm text-slate-700">Dirección</label>
            <input
              className="md:col-span-3 h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              value={editingProspecto.direccion}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("direccion", event.target.value)
              }
            />

            <label className="text-sm text-slate-700">Email</label>
            <input
              className="md:col-span-3 h-8 w-full border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              value={editingProspecto.email}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("email", event.target.value)
              }
            />

            <label className="text-sm text-slate-700">WhatsApp :</label>
            <input
              className={disabledInputClass}
              value={editingProspecto.whatsapp}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("whatsapp", event.target.value)
              }
            />
            <label className="text-sm text-slate-700">Convencional :</label>
            <input
              className={disabledInputClass}
              value={editingProspecto.convencional}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("convencional", event.target.value)
              }
            />

            <label className="text-sm text-slate-700">Grupo:</label>
            <select
              className={disabledInputClass}
              value={editingProspecto.grupo}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("grupo", event.target.value)
              }
            >
              {grupoOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <label className="text-sm text-slate-700">Estado:</label>
            <select
              className={disabledInputClass}
              value={editingProspecto.estado}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("estado", event.target.value)
              }
            >
              {estadoOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <label className="text-sm text-slate-700">Ciudades:</label>
            <div className="flex gap-2">
              <select
                className={disabledInputClass}
                value={editingProspecto.ciudad}
                disabled={!isEditing}
                onChange={(event) =>
                  updateEditingProspecto("ciudad", event.target.value)
                }
              >
                {ciudadOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={openCiudadLookup}
                className="h-8 rounded-sm bg-[#f7b53b] px-3 text-lg font-bold text-white transition hover:bg-[#e2a32f]"
              >
                Q
              </button>
            </div>
            <span />
            <span />

            <label className="text-sm text-slate-700">Vendedor:</label>
            <select
              className={disabledInputClass}
              value={editingProspecto.vendedor}
              disabled={!isEditing}
              onChange={(event) =>
                updateEditingProspecto("vendedor", event.target.value)
              }
            >
              {vendedorOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <span />
            <span />
          </div>
        </div>

        {isCiudadModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-2xl rounded-sm border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Buscar ciudad
                  </h3>
                  <p className="text-sm text-slate-500">
                    Selecciona una ciudad para cargarla en el prospecto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCiudadModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
                >
                  X
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4 flex items-center gap-3">
                  <input
                    value={ciudadSearch}
                    onChange={(event) => setCiudadSearch(event.target.value)}
                    placeholder="Buscar ciudad"
                    className="h-10 min-w-0 flex-1 border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBanner(
                        filteredCiudades.length > 0
                          ? `${filteredCiudades.length} ciudad(es) disponibles.`
                          : "No se encontraron ciudades para esa búsqueda.",
                        filteredCiudades.length > 0 ? "success" : "warning",
                      )
                    }
                    className="rounded-sm bg-[#f6a21a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de9014]"
                  >
                    Buscar
                  </button>
                </div>

                <div className="overflow-hidden rounded-sm border border-slate-300">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="w-40 border border-slate-300 px-3 py-2 text-left font-semibold">
                          Código
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                          Ciudad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCiudades.length > 0 ? (
                        filteredCiudades.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => handleSelectCiudad(item.value)}
                            className="cursor-pointer bg-white transition hover:bg-[#edf6ff]"
                          >
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {item.value}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {item.label}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="border border-slate-300 px-4 py-10 text-center text-sm text-slate-500"
                          >
                            No se encontraron ciudades para esta búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="rounded-sm border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-300 px-2 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-[15px] font-semibold text-slate-800">
              Buscar:
            </label>
            <div className="flex flex-1 items-stretch">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1677c9]"
              />
              <button
                type="button"
                onClick={() =>
                  setBanner(
                    filteredProspectos.length > 0
                      ? `${filteredProspectos.length} prospecto(s) encontrados.`
                      : "No se encontraron prospectos con ese criterio.",
                    filteredProspectos.length > 0 ? "success" : "warning",
                  )
                }
                className="inline-flex items-center justify-center border-y border-r border-slate-300 bg-[#ffbf3f] px-4 text-xl text-white"
              >
                O
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[#3d67a8] text-3xl leading-none text-white transition hover:bg-[#2f548d]"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="rounded-sm bg-[#136b4f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105940]"
            >
              Excel
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`mx-2 mt-3 rounded-sm border px-4 py-3 text-sm ${
              messageTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="overflow-x-auto px-2 py-4">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white text-slate-600">
                <th className="w-40 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Acciones
                </th>
                <th className="w-14 border border-slate-300 px-3 py-3 text-left font-semibold">
                  #
                </th>
                <th className="w-56 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Identificación
                </th>
                <th className="border border-slate-300 px-3 py-3 text-left font-semibold">
                  Razón Social
                </th>
                <th className="w-72 border border-slate-300 px-3 py-3 text-left font-semibold">
                  Nombre Comercial
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProspectos.length > 0 ? (
                filteredProspectos.map((prospecto, index) => (
                  <tr
                    key={prospecto.id}
                    className={
                      prospecto.activo
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
                          onClick={() => openEditForm(prospecto)}
                          className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prospecto.id)}
                          className={`inline-flex rounded-sm px-3 py-1.5 text-sm font-semibold transition ${
                            prospecto.activo
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {prospecto.activo ? "Eliminar" : "Restaurar"}
                        </button>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {prospecto.identificacion}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      <div>
                        <p>{prospecto.razonSocial}</p>
                        <p className="mt-1 text-xs">
                          {prospecto.activo ? "Activo" : "Inactivo"}
                        </p>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {prospecto.nombreComercial}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay prospectos registrados para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
