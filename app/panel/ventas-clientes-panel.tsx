"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

type VentasClientesPanelProps = {
  empresa: {
    id: number;
    razonSocial: string;
    ciudad: string;
  };
};

type ClienteTipo = "Cédula" | "RUC" | "Pasaporte";
type ClienteTab = "datos" | "imagenes";
type ClienteServicioRow = {
  id: string;
  codigo: string;
  descripcion: string;
  precio: string;
  precioIva: string;
  descuento: string;
};

type LookupType = "cuenta" | "provincia" | "ciudad" | "parroquia";

type LookupItem = {
  id: string;
  value: string;
  label: string;
  extra?: string;
  provincia?: string;
  ciudad?: string;
};

type CuentaBancariaRow = {
  id: string;
  cuenta: string;
  banco: string;
  tipo: string;
  principal: boolean;
};

type ClienteRow = {
  id: string;
  tipo: ClienteTipo;
  identificacion: string;
  codigo: string;
  clave: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  referencia: string;
  email: string;
  telefono1: string;
  telefono2: string;
  whatsapp: string;
  descuento: string;
  diasCredito: string;
  cupoCredito: string;
  saldoCartera: string;
  cupoDisponible: string;
  vendedor: string;
  cobrador: string;
  zona: string;
  grupo: string;
  ruta: string;
  tipoCliente: string;
  tarifa: string;
  regimen: string;
  tipoVenta: string;
  origenIngresos: string;
  sexo: string;
  estadoCivil: string;
  provincia: string;
  ciudad: string;
  parroquia: string;
  latitud: string;
  longitud: string;
  activo: boolean;
  entidadBancaria: boolean;
  realizaRetenciones: boolean;
  contribuyenteEspecial: boolean;
  geolocalizado: boolean;
  imagenNombre: string;
};

const STORAGE_KEY_PREFIX = "ventas-clientes-draft";

const vendedorOptions = ["Vendedor", "Ejecutivo 1", "Ejecutivo 2"] as const;
const zonaOptions = ["Zona General", "Norte", "Centro", "Sur"] as const;
const grupoOptions = ["Grupo General", "Mayoristas", "Frecuentes"] as const;
const rutaOptions = ["General", "Ruta Norte", "Ruta Centro"] as const;
const provinciaOptions = ["Pichincha", "Azuay", "Guayas"] as const;
const ciudadOptions = ["QUITO", "CUENCA", "GUAYAQUIL"] as const;
const parroquiaOptions = [
  "QUITO DISTRITO METF",
  "CUENCA URBANA",
  "GUAYAQUIL CENTRO",
] as const;

const cuentaLookupItems: LookupItem[] = [
  { id: "cuenta-1", value: "1.1.02.05.01", label: "Clientes", extra: "Cuenta por cobrar clientes" },
  { id: "cuenta-2", value: "1.1.02.05.02", label: "Clientes Frecuentes", extra: "Cuenta segmento frecuente" },
  { id: "cuenta-3", value: "1.1.02.05.03", label: "Clientes Mayoristas", extra: "Cuenta segmento mayorista" },
];

const provinciaLookupItems: LookupItem[] = [
  { id: "prov-1", value: "Pichincha", label: "Pichincha" },
  { id: "prov-2", value: "Azuay", label: "Azuay" },
  { id: "prov-3", value: "Guayas", label: "Guayas" },
];

const ciudadLookupItems: LookupItem[] = [
  { id: "ciu-1", value: "QUITO", label: "Quito", provincia: "Pichincha" },
  { id: "ciu-2", value: "CUENCA", label: "Cuenca", provincia: "Azuay" },
  { id: "ciu-3", value: "GUAYAQUIL", label: "Guayaquil", provincia: "Guayas" },
];

const parroquiaLookupItems: LookupItem[] = [
  { id: "par-1", value: "QUITO DISTRITO METF", label: "Quito Distrito Metf", provincia: "Pichincha", ciudad: "QUITO" },
  { id: "par-2", value: "CUENCA URBANA", label: "Cuenca Urbana", provincia: "Azuay", ciudad: "CUENCA" },
  { id: "par-3", value: "GUAYAQUIL CENTRO", label: "Guayaquil Centro", provincia: "Guayas", ciudad: "GUAYAQUIL" },
];
const bancoOptions = [
  "Pichincha",
  "Produbanco",
  "Pacífico",
  "Machala",
  "Guayaquil",
  "Banecuador",
  "Internacional",
  "Procredit",
  "Austro",
  "Bolivariano",
  "Loja",
  "Amazonas",
  "Rumiñahui",
  "Cooperativa JEP",
  "Mutualista Pichincha",
] as const;
const tipoCuentaOptions = ["Ahorros", "Corriente"] as const;

function createDefaultRows(
  empresa: VentasClientesPanelProps["empresa"],
): ClienteRow[] {
  return [
    {
      id: "cliente-1",
      tipo: "Cédula",
      identificacion: "9999999999999",
      codigo: "CL00000001",
      clave: "",
      cuentaCodigo: "1.1.02.05.01",
      cuentaNombre: "Clientes",
      razonSocial: "CONSUMIDOR FINAL",
      nombreComercial: "CONSUMIDOR FINAL",
      direccion: "Sin direccion",
      referencia: "",
      email: "",
      telefono1: "",
      telefono2: "",
      whatsapp: "",
      descuento: "0",
      diasCredito: "0",
      cupoCredito: "0",
      saldoCartera: "0",
      cupoDisponible: "0",
      vendedor: "Vendedor",
      cobrador: "Vendedor",
      zona: "Zona General",
      grupo: "Grupo General",
      ruta: "General",
      tipoCliente: "Persona Natural",
      tarifa: "Precio 1",
      regimen: "GENERAL",
      tipoVenta: "Local",
      origenIngresos: "Empleado Público",
      sexo: "Masculino",
      estadoCivil: "Soltero(a)",
      provincia: "Pichincha",
      ciudad: empresa.ciudad.toUpperCase(),
      parroquia: "QUITO DISTRITO METF",
      latitud: "",
      longitud: "",
      activo: true,
      entidadBancaria: false,
      realizaRetenciones: false,
      contribuyenteEspecial: false,
      geolocalizado: false,
      imagenNombre: "",
    },
    {
      id: "cliente-2",
      tipo: "RUC",
      identificacion: "0105280192001",
      codigo: "CL00000002",
      clave: "",
      cuentaCodigo: "1.1.02.05.01",
      cuentaNombre: "Clientes",
      razonSocial: empresa.razonSocial,
      nombreComercial: empresa.razonSocial,
      direccion: "Av. Principal y Calle 10",
      referencia: "Frente al parque central",
      email: "cliente@solucionesinformaticas.ec",
      telefono1: "0999999999",
      telefono2: "022345678",
      whatsapp: "0999999999",
      descuento: "5",
      diasCredito: "15",
      cupoCredito: "1500",
      saldoCartera: "250",
      cupoDisponible: "1250",
      vendedor: "Ejecutivo 1",
      cobrador: "Vendedor",
      zona: "Centro",
      grupo: "Frecuentes",
      ruta: "Ruta Centro",
      tipoCliente: "Persona Natural",
      tarifa: "Precio 1",
      regimen: "GENERAL",
      tipoVenta: "Local",
      origenIngresos: "Empleado Público",
      sexo: "Masculino",
      estadoCivil: "Soltero(a)",
      provincia: "Pichincha",
      ciudad: empresa.ciudad.toUpperCase(),
      parroquia: "QUITO DISTRITO METF",
      latitud: "-0.1807",
      longitud: "-78.4678",
      activo: true,
      entidadBancaria: false,
      realizaRetenciones: false,
      contribuyenteEspecial: false,
      geolocalizado: true,
      imagenNombre: "",
    },
  ];
}

function createEmptyClient(empresa: VentasClientesPanelProps["empresa"]): ClienteRow {
  const codeSeed = Date.now().toString().slice(-6);

  return {
    id: `cliente-${Date.now()}`,
    tipo: "Cédula",
    identificacion: "",
    codigo: `CL${codeSeed.padStart(8, "0")}`,
    clave: "",
    cuentaCodigo: "1.1.02.05.01",
    cuentaNombre: "Clientes",
    razonSocial: "",
    nombreComercial: "",
    direccion: "",
    referencia: "",
    email: "",
    telefono1: "",
    telefono2: "",
    whatsapp: "",
    descuento: "",
    diasCredito: "0",
    cupoCredito: "",
    saldoCartera: "",
    cupoDisponible: "",
    vendedor: "Vendedor",
    cobrador: "Vendedor",
    zona: "Zona General",
    grupo: "Grupo General",
    ruta: "General",
    tipoCliente: "Persona Natural",
    tarifa: "Precio 1",
    regimen: "GENERAL",
    tipoVenta: "Local",
    origenIngresos: "Empleado Público",
    sexo: "Masculino",
    estadoCivil: "Soltero(a)",
    provincia: "Pichincha",
    ciudad: empresa.ciudad.toUpperCase(),
    parroquia: "QUITO DISTRITO METF",
    latitud: "",
    longitud: "",
    activo: true,
    entidadBancaria: false,
    realizaRetenciones: false,
    contribuyenteEspecial: false,
    geolocalizado: false,
    imagenNombre: "",
  };
}

export function VentasClientesPanel({ empresa }: VentasClientesPanelProps) {
  const [clientes, setClientes] = useState<ClienteRow[]>(() =>
    createDefaultRows(empresa),
  );
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "form">("list");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<ClienteTab>("datos");
  const [editingClient, setEditingClient] = useState<ClienteRow>(() =>
    createEmptyClient(empresa),
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isServiciosModalOpen, setIsServiciosModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCuentasModalOpen, setIsCuentasModalOpen] = useState(false);
  const [activeLookup, setActiveLookup] = useState<LookupType | null>(null);
  const [lookupSearch, setLookupSearch] = useState("");
  const [importMode, setImportMode] = useState<"replace" | "append">(
    "replace",
  );
  const [serviciosSearch, setServiciosSearch] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [clienteServicios, setClienteServicios] = useState<ClienteServicioRow[]>([
    {
      id: "servicio-1",
      codigo: "SRV-001",
      descripcion: "Mantenimiento mensual",
      precio: "25.00",
      precioIva: "28.75",
      descuento: "0",
    },
  ]);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">(
    "success",
  );
  const [cuentaBancariaInput, setCuentaBancariaInput] = useState("");
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>("Pichincha");
  const [tipoCuentaSeleccionado, setTipoCuentaSeleccionado] =
    useState<string>("Ahorros");
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaRow[]>([]);
  const [selectedCuentaBancariaId, setSelectedCuentaBancariaId] = useState<string | null>(
    null,
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}-${empresa.id}`;

  useEffect(() => {
    const fallback = createDefaultRows(empresa);
    const savedDraft = window.localStorage.getItem(storageKey);

    if (!savedDraft) {
      setClientes(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as ClienteRow[];
      setClientes(parsed.length > 0 ? parsed : fallback);
    } catch {
      setClientes(fallback);
    }
  }, [empresa, storageKey]);

  const filteredClientes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      return (
        cliente.identificacion.toLowerCase().includes(query) ||
        cliente.razonSocial.toLowerCase().includes(query) ||
        cliente.nombreComercial.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query)
      );
    });
  }, [clientes, search]);

  const filteredServicios = useMemo(() => {
    const query = serviciosSearch.trim().toLowerCase();
    if (!query) {
      return clienteServicios;
    }

    return clienteServicios.filter((servicio) => {
      return (
        servicio.codigo.toLowerCase().includes(query) ||
        servicio.descripcion.toLowerCase().includes(query)
      );
    });
  }, [clienteServicios, serviciosSearch]);

  const mapEmbedUrl = useMemo(() => {
    const query = mapQuery.trim() || "Quito, Ecuador";
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
  }, [mapQuery]);

  const lookupItems = useMemo(() => {
    if (activeLookup === "cuenta") {
      return cuentaLookupItems;
    }

    if (activeLookup === "provincia") {
      return provinciaLookupItems;
    }

    if (activeLookup === "ciudad") {
      return ciudadLookupItems.filter(
        (item) => item.provincia === editingClient.provincia,
      );
    }

    if (activeLookup === "parroquia") {
      return parroquiaLookupItems.filter(
        (item) =>
          item.provincia === editingClient.provincia &&
          item.ciudad === editingClient.ciudad,
      );
    }

    return [];
  }, [activeLookup, editingClient.ciudad, editingClient.provincia]);

  const filteredLookupItems = useMemo(() => {
    const query = lookupSearch.trim().toLowerCase();

    if (!query) {
      return lookupItems;
    }

    return lookupItems.filter((item) => {
      return (
        item.value.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.extra?.toLowerCase().includes(query)
      );
    });
  }, [lookupItems, lookupSearch]);

  function setBanner(
    nextMessage: string,
    tone: "success" | "warning" = "success",
  ) {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function persistRows(nextRows: ClienteRow[]) {
    setClientes(nextRows);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
  }

  function updateEditingClient<K extends keyof ClienteRow>(
    field: K,
    value: ClienteRow[K],
  ) {
    setEditingClient((current) => ({ ...current, [field]: value }));
  }

  function openLookup(type: LookupType) {
    setActiveLookup(type);
    setLookupSearch("");
  }

  function closeLookup() {
    setActiveLookup(null);
    setLookupSearch("");
  }

  function handleSelectLookupItem(item: LookupItem) {
    if (activeLookup === "cuenta") {
      updateEditingClient("cuentaCodigo", item.value);
      updateEditingClient("cuentaNombre", item.label);
      setBanner(`Cuenta seleccionada: ${item.value} - ${item.label}.`);
      closeLookup();
      return;
    }

    if (activeLookup === "provincia") {
      updateEditingClient("provincia", item.value);
      const firstCity =
        ciudadLookupItems.find((city) => city.provincia === item.value)?.value ??
        editingClient.ciudad;
      const firstParish =
        parroquiaLookupItems.find(
          (parish) => parish.provincia === item.value && parish.ciudad === firstCity,
        )?.value ?? editingClient.parroquia;
      updateEditingClient("ciudad", firstCity);
      updateEditingClient("parroquia", firstParish);
      setBanner(`Provincia seleccionada: ${item.label}.`);
      closeLookup();
      return;
    }

    if (activeLookup === "ciudad") {
      updateEditingClient("ciudad", item.value);
      if (item.provincia) {
        updateEditingClient("provincia", item.provincia);
      }
      const firstParish =
        parroquiaLookupItems.find(
          (parish) =>
            parish.provincia === (item.provincia ?? editingClient.provincia) &&
            parish.ciudad === item.value,
        )?.value ?? editingClient.parroquia;
      updateEditingClient("parroquia", firstParish);
      setBanner(`Ciudad seleccionada: ${item.label}.`);
      closeLookup();
      return;
    }

    if (activeLookup === "parroquia") {
      updateEditingClient("parroquia", item.value);
      if (item.provincia) {
        updateEditingClient("provincia", item.provincia);
      }
      if (item.ciudad) {
        updateEditingClient("ciudad", item.ciudad);
      }
      setBanner(`Parroquia seleccionada: ${item.label}.`);
      closeLookup();
    }
  }

  function parseCoordinates(value: string) {
    const match = value.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
    );

    if (!match) {
      return null;
    }

    return {
      latitud: match[1],
      longitud: match[2],
    };
  }

  function openMapModal() {
    const currentCoords =
      editingClient.latitud && editingClient.longitud
        ? `${editingClient.latitud}, ${editingClient.longitud}`
        : `${editingClient.ciudad || empresa.ciudad}, ${editingClient.provincia || "Ecuador"}, Ecuador`;

    setMapQuery(currentCoords);
    setIsMapModalOpen(true);
  }

  function handleApplyMapLocation() {
    const coordinates = parseCoordinates(mapQuery);

    if (!coordinates) {
      setBanner(
        "Para guardar coordenadas, escribe el punto como latitud,longitud. Ejemplo: -2.8974,-79.0045",
        "warning",
      );
      return;
    }

    updateEditingClient("latitud", coordinates.latitud);
    updateEditingClient("longitud", coordinates.longitud);
    updateEditingClient("geolocalizado", true);
    setIsMapModalOpen(false);
    setBanner("Ubicación del cliente actualizada desde el mapa.");
  }

  function handleMapSearch() {
    const nextQuery = mapQuery.trim();

    if (!nextQuery) {
      setMapQuery(`${editingClient.ciudad || empresa.ciudad}, Ecuador`);
      setBanner("Ingresa una dirección o coordenadas para buscar en el mapa.", "warning");
      return;
    }

    const coordinates = parseCoordinates(nextQuery);
    if (coordinates) {
      setBanner(
        `Coordenadas detectadas: ${coordinates.latitud}, ${coordinates.longitud}. Si deseas guardarlas, pulsa Usar coordenadas.`,
      );
      return;
    }

    setBanner(`Mapa centrado en la búsqueda: ${nextQuery}.`);
  }

  function openCuentasModal() {
    setIsCuentasModalOpen(true);
    setSelectedCuentaBancariaId(null);
    setCuentaBancariaInput("");
    setBancoSeleccionado("Pichincha");
    setTipoCuentaSeleccionado("Ahorros");
  }

  function handleAgregarCuentaBancaria() {
    if (!cuentaBancariaInput.trim()) {
      setBanner("Ingresa un número o referencia de cuenta bancaria.", "warning");
      return;
    }

    const nextRow: CuentaBancariaRow = {
      id: `cuenta-bancaria-${Date.now()}`,
      cuenta: cuentaBancariaInput.trim(),
      banco: bancoSeleccionado,
      tipo: tipoCuentaSeleccionado,
      principal: cuentasBancarias.length === 0,
    };

    setCuentasBancarias((current) => [...current, nextRow]);
    setSelectedCuentaBancariaId(nextRow.id);
    setCuentaBancariaInput("");
    setBanner(`Cuenta bancaria agregada: ${nextRow.cuenta}.`);
  }

  function handleEliminarCuentaBancaria() {
    if (!selectedCuentaBancariaId) {
      setBanner("Selecciona una cuenta bancaria para eliminar.", "warning");
      return;
    }

    const nextRows = cuentasBancarias.filter(
      (cuenta) => cuenta.id !== selectedCuentaBancariaId,
    );
    setCuentasBancarias(
      nextRows.map((cuenta, index) => ({
        ...cuenta,
        principal: index === 0 ? true : cuenta.principal,
      })),
    );
    setSelectedCuentaBancariaId(nextRows[0]?.id ?? null);
    setBanner("Cuenta bancaria eliminada.", "warning");
  }

  function handleVaciarCuentasBancarias() {
    setCuentasBancarias([]);
    setSelectedCuentaBancariaId(null);
    setBanner("Se vació el listado de cuentas bancarias.", "warning");
  }

  function handleGuardarCuentasBancarias() {
    setIsCuentasModalOpen(false);
    updateEditingClient("entidadBancaria", cuentasBancarias.length > 0);
    setBanner("Gestión de cuentas bancarias guardada correctamente.");
  }

  function handleCancelarCuentasBancarias() {
    setIsCuentasModalOpen(false);
    setBanner("Gestión de cuentas bancarias cancelada.", "warning");
  }

  function openCreateForm() {
    setEditingClient(createEmptyClient(empresa));
    setActiveTab("datos");
    setIsEditing(true);
    setMode("form");
    setBanner("Nuevo cliente listo para registrar.");
  }

  function openEditForm(cliente: ClienteRow) {
    setEditingClient(cliente);
    setActiveTab("datos");
    setIsEditing(false);
    setMode("form");
    setBanner("Ficha del cliente cargada. Pulsa Modificar para editar.");
  }

  function handleGuardarCliente() {
    if (!editingClient.identificacion.trim() || !editingClient.razonSocial.trim()) {
      setBanner("Identificación y razón social son obligatorios.", "warning");
      return;
    }

    const exists = clientes.some((cliente) => cliente.id === editingClient.id);
    const nextRows = exists
      ? clientes.map((cliente) =>
          cliente.id === editingClient.id ? editingClient : cliente,
        )
      : [editingClient, ...clientes];

    persistRows(nextRows);
    setIsEditing(false);
    setBanner("Cliente guardado correctamente.");
  }

  function handleNuevoDesdeFicha() {
    setEditingClient(createEmptyClient(empresa));
    setActiveTab("datos");
    setIsEditing(true);
    setBanner("Nueva ficha de cliente preparada.");
  }

  function handleToggleActive(clienteId: string) {
    const nextRows = clientes.map((cliente) =>
      cliente.id === clienteId ? { ...cliente, activo: !cliente.activo } : cliente,
    );
    persistRows(nextRows);
    const cliente = nextRows.find((row) => row.id === clienteId);
    setBanner(
      cliente?.activo
        ? "Cliente restaurado al listado activo."
        : "Cliente marcado como inactivo.",
      "warning",
    );
  }

  function handleGeoToggle(clienteId: string) {
    const nextRows = clientes.map((cliente) =>
      cliente.id === clienteId
        ? { ...cliente, geolocalizado: !cliente.geolocalizado }
        : cliente,
    );
    persistRows(nextRows);
    const cliente = nextRows.find((row) => row.id === clienteId);
    setBanner(
      cliente?.geolocalizado
        ? `Cliente ${cliente.razonSocial} marcado con geolocalización.`
        : `Geolocalización retirada de ${cliente?.razonSocial}.`,
    );
  }

  function handleExportClientes() {
    const rows = clientes.map((cliente) => ({
      Tipo: cliente.tipo,
      Identificación: cliente.identificacion,
      Código: cliente.codigo,
      Clave: cliente.clave,
      "Cuenta Código": cliente.cuentaCodigo,
      "Cuenta Nombre": cliente.cuentaNombre,
      "Razón Social": cliente.razonSocial,
      "Nombre Comercial": cliente.nombreComercial,
      Referencia: cliente.referencia,
      Correo: cliente.email,
      "Teléfono 1": cliente.telefono1,
      "Teléfono 2": cliente.telefono2,
      Dirección: cliente.direccion,
      Ciudad: cliente.ciudad,
      Provincia: cliente.provincia,
      Parroquia: cliente.parroquia,
      WhatsApp: cliente.whatsapp,
      Descuento: cliente.descuento,
      "Días de Crédito": cliente.diasCredito,
      "Cupo Crédito": cliente.cupoCredito,
      "Saldo Cartera": cliente.saldoCartera,
      "Cupo Disponible": cliente.cupoDisponible,
      Vendedor: cliente.vendedor,
      Cobrador: cliente.cobrador,
      Zona: cliente.zona,
      Grupo: cliente.grupo,
      Ruta: cliente.ruta,
      "Tipo de Cliente": cliente.tipoCliente,
      Tarifa: cliente.tarifa,
      Régimen: cliente.regimen,
      "Tipo Venta": cliente.tipoVenta,
      "Origen de Ingresos": cliente.origenIngresos,
      Sexo: cliente.sexo,
      "Estado Civil": cliente.estadoCivil,
      Latitud: cliente.latitud,
      Longitud: cliente.longitud,
      Activo: cliente.activo ? "SI" : "NO",
      "Entidad Bancaria": cliente.entidadBancaria ? "SI" : "NO",
      "Realiza Retenciones": cliente.realizaRetenciones ? "SI" : "NO",
      "Contribuyente Especial": cliente.contribuyenteEspecial ? "SI" : "NO",
      Geolocalizado: cliente.geolocalizado ? "SI" : "NO",
      Imagen: cliente.imagenNombre,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "Listado Clientes.xlsx");
    setBanner("Se descargó la lista de clientes en formato XLSX.");
  }

  function handleTemplateDownload() {
    const link = document.createElement("a");
    link.href = "/api/download?file=importar-clientes.xlsx";
    link.download = "Importar Clientes.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setBanner("Se descargó la plantilla Excel compartida.");
  }

  function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedImportFile(file);

    if (file) {
      setBanner(`Archivo seleccionado: ${file.name}`);
    }
  }

  function buildImportedRows(fileName: string): ClienteRow[] {
    const baseId = Date.now();

    return [
      {
        ...createEmptyClient(empresa),
        id: `cliente-importado-${baseId}`,
        identificacion: "1792450012001",
        razonSocial: `Cliente importado ${fileName.replace(/\.[^.]+$/, "")}`,
        nombreComercial: "Cliente importado 1",
        email: "importado1@clientes.ec",
        telefono1: "0980000001",
        direccion: "Dirección importada 1",
        whatsapp: "0980000001",
      },
      {
        ...createEmptyClient(empresa),
        id: `cliente-importado-${baseId + 1}`,
        identificacion: "1792450012002",
        razonSocial: "Cliente importado secundario",
        nombreComercial: "Cliente importado 2",
        email: "importado2@clientes.ec",
        telefono1: "0980000002",
        direccion: "Dirección importada 2",
        whatsapp: "0980000002",
      },
    ];
  }

  function handleProcessImport() {
    if (!selectedImportFile) {
      setBanner("Seleccione un archivo antes de procesar la carga.", "warning");
      return;
    }

    const importedRows = buildImportedRows(selectedImportFile.name);
    const nextRows =
      importMode === "replace" ? importedRows : [...importedRows, ...clientes];

    persistRows(nextRows);
    setIsImportModalOpen(false);
    setSelectedImportFile(null);

    if (importInputRef.current) {
      importInputRef.current.value = "";
    }

    setBanner(
      importMode === "replace"
        ? `Se vació el listado y se cargaron ${importedRows.length} clientes desde ${selectedImportFile.name}.`
        : `Se agregaron ${importedRows.length} clientes desde ${selectedImportFile.name}.`,
    );
  }

  function handleBuscarServicio() {
    const query = serviciosSearch.trim().toLowerCase();

    if (!query) {
      setBanner("Escribe un código o descripción para buscar en clientes servicios.", "warning");
      return;
    }

    const match = clienteServicios.find((servicio) => {
      return (
        servicio.codigo.toLowerCase().includes(query) ||
        servicio.descripcion.toLowerCase().includes(query)
      );
    });

    if (!match) {
      setBanner("No se encontraron servicios con ese criterio de búsqueda.", "warning");
      return;
    }

    setSelectedServicioId(match.id);
    setBanner(`Servicio encontrado: ${match.descripcion}.`);
  }

  function handleQuitarServicio() {
    if (!selectedServicioId) {
      setBanner("Selecciona una línea de servicio para quitar.", "warning");
      return;
    }

    const nextRows = clienteServicios.filter(
      (servicio) => servicio.id !== selectedServicioId,
    );
    setClienteServicios(nextRows);
    setSelectedServicioId(nextRows[0]?.id ?? null);
    setBanner("Se quitó la línea de servicio seleccionada.", "warning");
  }

  function handleAddServicioLinea() {
    const next = {
      id: `servicio-${Date.now()}`,
      codigo: "",
      descripcion: "",
      precio: "0.00",
      precioIva: "0.00",
      descuento: "0",
    };
    setClienteServicios((current) => [...current, next]);
    setSelectedServicioId(next.id);
    setBanner("Se agregó una nueva línea de servicio.");
  }

  function updateServicioRow(
    servicioId: string,
    field: keyof ClienteServicioRow,
    value: string,
  ) {
    setClienteServicios((current) =>
      current.map((servicio) =>
        servicio.id === servicioId ? { ...servicio, [field]: value } : servicio,
      ),
    );
  }

  const totalServicios = filteredServicios.reduce((accumulator, servicio) => {
    const value = Number.parseFloat(servicio.precioIva || "0");
    return accumulator + (Number.isFinite(value) ? value : 0);
  }, 0);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      return;
    }

    updateEditingClient("imagenNombre", file.name);
    setBanner(`Imagen seleccionada: ${file.name}`);
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
              onClick={handleGuardarCliente}
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
                setBanner("Edición habilitada para la ficha del cliente.");
              }}
              className="inline-flex items-center rounded-sm bg-[#8dd196] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#77c481]"
            >
              Modificar
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setBanner(
                    "Gráfico listo para conectarse con historial comercial del cliente.",
                    "warning",
                  )
                }
                className="rounded-sm bg-[#f6a21a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de9014]"
              >
                Gráfico
              </button>
              <button
                type="button"
                onClick={() => setIsServiciosModalOpen(true)}
                className="rounded-sm bg-[#f28f12] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#db7f10]"
              >
                Clientes Servicios
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

          <div className="px-2 pt-3">
            <div className="flex border-b border-slate-300">
              {[
                { id: "datos", label: "Datos" },
                { id: "imagenes", label: "Imágenes" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ClienteTab)}
                  className={`border-x border-t border-slate-300 px-8 py-2 text-sm ${
                    activeTab === tab.id
                      ? "bg-[#eaf1f6] text-slate-800"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "datos" ? (
            <div className="grid gap-4 px-2 py-3 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3">
                <div className="grid gap-2 md:grid-cols-[120px_1fr_64px] md:items-center">
                  <label className="text-sm text-slate-700">Tipo:</label>
                  <select
                    className={disabledInputClass}
                    value={editingClient.tipo}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("tipo", event.target.value as ClienteTipo)
                    }
                  >
                    <option>Cédula</option>
                    <option>RUC</option>
                    <option>Pasaporte</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingClient.activo}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient("activo", event.target.checked)
                      }
                    />
                    Activo
                  </label>
                </div>

                <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">Identificación:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.identificacion}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("identificacion", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-[120px_1fr_100px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">Código:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.codigo}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("codigo", event.target.value)
                    }
                  />
                  <label className="text-sm text-slate-700">Clave:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.clave}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("clave", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-[120px_1fr_32px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">Cuenta:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.cuentaCodigo}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("cuentaCodigo", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => openLookup("cuenta")}
                    className="h-8 rounded-sm bg-[#f7b53b] text-lg font-bold text-white transition hover:bg-[#e2a32f]"
                  >
                    Q
                  </button>
                  <input
                    className="h-8 w-full cursor-not-allowed border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 outline-none"
                    value={editingClient.cuentaNombre}
                    disabled
                  />
                </div>

                {[
                  ["Razón Social", "razonSocial"],
                  ["Nombre Comercial", "nombreComercial"],
                  ["Dirección", "direccion"],
                  ["Referencia", "referencia"],
                  ["Email", "email"],
                ].map(([label, field]) => (
                  <div
                    key={field}
                    className="grid gap-2 md:grid-cols-[120px_1fr] md:items-center"
                  >
                    <label className="text-sm text-slate-700">{label}:</label>
                    <input
                      className={disabledInputClass}
                      value={editingClient[field as keyof ClienteRow] as string}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient(
                          field as keyof ClienteRow,
                          event.target.value as never,
                        )
                      }
                    />
                  </div>
                ))}

                <div className="grid gap-2 md:grid-cols-[120px_1fr_110px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">Teléfono 1:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.telefono1}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("telefono1", event.target.value)
                    }
                  />
                  <label className="text-sm text-slate-700">Descuento:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.descuento}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("descuento", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-[120px_1fr_110px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">Teléfono 2:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.telefono2}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("telefono2", event.target.value)
                    }
                  />
                  <label className="text-sm text-slate-700">Días de Crédito:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.diasCredito}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("diasCredito", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-[120px_1fr_110px_1fr] md:items-center">
                  <label className="text-sm text-slate-700">WhatsApp:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.whatsapp}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("whatsapp", event.target.value)
                    }
                  />
                  <label className="text-sm text-slate-700">Cupo Crédito:</label>
                  <input
                    className={disabledInputClass}
                    value={editingClient.cupoCredito}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateEditingClient("cupoCredito", event.target.value)
                    }
                  />
                </div>

                {[
                  ["Vendedor:", "vendedor", vendedorOptions],
                  ["Cobrador:", "cobrador", vendedorOptions],
                  ["Zona:", "zona", zonaOptions],
                  ["Grupo:", "grupo", grupoOptions],
                  ["Rutas:", "ruta", rutaOptions],
                ].map(([label, field, options]) => (
                  <div
                    key={String(field)}
                    className="grid gap-2 md:grid-cols-[120px_1fr_110px_1fr] md:items-center"
                  >
                    <label className="text-sm text-slate-700">{label}</label>
                    <select
                      className={disabledInputClass}
                      value={editingClient[field as keyof ClienteRow] as string}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient(
                          field as keyof ClienteRow,
                          event.target.value as never,
                        )
                      }
                    >
                      {(options as readonly string[]).map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <label className="text-sm text-slate-700">
                      {field === "vendedor"
                        ? "Saldo Cartera:"
                        : field === "cobrador"
                          ? "Cupo Disponible:"
                          : field === "zona"
                            ? "Provincias:"
                            : field === "grupo"
                              ? "Ciudades:"
                              : "Parroquias:"}
                    </label>
                    {field === "zona" ? (
                      <div className="flex gap-2">
                        <select
                          className={disabledInputClass}
                          value={editingClient.provincia}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateEditingClient("provincia", event.target.value)
                          }
                        >
                          {provinciaOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => openLookup("provincia")}
                          className="h-8 rounded-sm bg-[#f7b53b] px-3 text-lg font-bold text-white transition hover:bg-[#e2a32f]"
                        >
                          Q
                        </button>
                      </div>
                    ) : field === "grupo" ? (
                      <div className="flex gap-2">
                        <select
                          className={disabledInputClass}
                          value={editingClient.ciudad}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateEditingClient("ciudad", event.target.value)
                          }
                        >
                          {ciudadOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => openLookup("ciudad")}
                          className="h-8 rounded-sm bg-[#f7b53b] px-3 text-lg font-bold text-white transition hover:bg-[#e2a32f]"
                        >
                          Q
                        </button>
                      </div>
                    ) : field === "ruta" ? (
                      <div className="flex gap-2">
                        <select
                          className={disabledInputClass}
                          value={editingClient.parroquia}
                          disabled={!isEditing}
                          onChange={(event) =>
                            updateEditingClient("parroquia", event.target.value)
                          }
                        >
                          {parroquiaOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => openLookup("parroquia")}
                          className="h-8 rounded-sm bg-[#f7b53b] px-3 text-lg font-bold text-white transition hover:bg-[#e2a32f]"
                        >
                          Q
                        </button>
                      </div>
                    ) : (
                      <input
                        className={disabledInputClass}
                        value={
                          field === "vendedor"
                            ? editingClient.saldoCartera
                            : editingClient.cupoDisponible
                        }
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateEditingClient(
                            field === "vendedor"
                              ? "saldoCartera"
                              : "cupoDisponible",
                            event.target.value,
                          )
                        }
                      />
                    )}
                  </div>
                ))}

                {[
                  ["Tipo de Cliente:", "tipoCliente", ["Persona Natural", "Empresa"]],
                  ["Tarifa:", "tarifa", ["Precio 1", "Precio 2"]],
                  ["Régimen:", "regimen", ["GENERAL", "RIMPE"]],
                  ["Tipo Venta:", "tipoVenta", ["Local", "Exterior"]],
                  ["Origen de ingresos:", "origenIngresos", ["Empleado Público", "Privado", "Independiente"]],
                ].map(([label, field, options]) => (
                  <div
                    key={String(field)}
                    className="grid gap-2 md:grid-cols-[120px_1fr_110px_1fr] md:items-center"
                  >
                    <label className="text-sm text-slate-700">{label}</label>
                    <select
                      className={disabledInputClass}
                      value={editingClient[field as keyof ClienteRow] as string}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient(
                          field as keyof ClienteRow,
                          event.target.value as never,
                        )
                      }
                    >
                      {(options as string[]).map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <label className="text-sm text-slate-700">
                      {field === "tipoCliente"
                        ? "Sexo:"
                        : field === "tarifa"
                          ? "Estado civil:"
                          : field === "regimen"
                            ? "Latitud:"
                            : field === "tipoVenta"
                              ? "Longitud:"
                              : ""}
                    </label>
                    {field === "tipoCliente" ? (
                      <select
                        className={disabledInputClass}
                        value={editingClient.sexo}
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateEditingClient("sexo", event.target.value)
                        }
                      >
                        <option>Masculino</option>
                        <option>Femenino</option>
                      </select>
                    ) : field === "tarifa" ? (
                      <select
                        className={disabledInputClass}
                        value={editingClient.estadoCivil}
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateEditingClient("estadoCivil", event.target.value)
                        }
                      >
                        <option>Soltero(a)</option>
                        <option>Casado(a)</option>
                      </select>
                    ) : field === "regimen" ? (
                      <input
                        className={disabledInputClass}
                        value={editingClient.latitud}
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateEditingClient("latitud", event.target.value)
                        }
                      />
                    ) : field === "tipoVenta" ? (
                      <input
                        className={disabledInputClass}
                        value={editingClient.longitud}
                        disabled={!isEditing}
                        onChange={(event) =>
                          updateEditingClient("longitud", event.target.value)
                        }
                      />
                    ) : (
                      <span />
                    )}
                  </div>
                ))}

                <div className="flex flex-wrap gap-8 pt-2 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingClient.entidadBancaria}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient("entidadBancaria", event.target.checked)
                      }
                    />
                    Entidad Bancaria
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingClient.realizaRetenciones}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient("realizaRetenciones", event.target.checked)
                      }
                    />
                    Realiza Retenciones
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingClient.contribuyenteEspecial}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateEditingClient(
                          "contribuyenteEspecial",
                          event.target.checked,
                        )
                      }
                    />
                    Contribuyente Especial
                  </label>
                </div>
              </div>

              <div className="grid content-start gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Cuentas", enabled: true },
                    { label: "Vehículos", enabled: false },
                    { label: "Adjuntos", enabled: false },
                    { label: "Sucursales", enabled: false },
                  ].map(({ label, enabled }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={!enabled}
                      onClick={() =>
                        enabled
                          ? openCuentasModal()
                          : setBanner(
                              `${label} quedará habilitado en la siguiente fase del formulario.`,
                              "warning",
                            )
                      }
                      className={`rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${
                        enabled
                          ? "bg-[#8dd196] hover:bg-[#77c481]"
                          : "cursor-not-allowed bg-[#b8ddb9] opacity-70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="rounded-sm border border-slate-300 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">
                    Ubicación del cliente
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      className="h-9 w-full cursor-not-allowed border border-slate-300 bg-white px-3 text-sm text-slate-700"
                      value={editingClient.latitud || "Latitud"}
                      disabled
                    />
                    <input
                      className="h-9 w-full cursor-not-allowed border border-slate-300 bg-white px-3 text-sm text-slate-700"
                      value={editingClient.longitud || "Longitud"}
                      disabled
                    />
                    <button
                      type="button"
                      onClick={openMapModal}
                      className="rounded-sm bg-[#f39a1f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de8d1f]"
                    >
                      Mapa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">
                  {editingClient.imagenNombre
                    ? `Imagen cargada: ${editingClient.imagenNombre}`
                    : "No hay imagen cargada para este cliente."}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="rounded-sm bg-[#1677c9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f67b0]"
                  >
                    Seleccionar imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateEditingClient("imagenNombre", "");
                      setBanner("Imagen retirada de la ficha del cliente.", "warning");
                    }}
                    className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeLookup ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-3xl rounded-sm border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {activeLookup === "cuenta"
                      ? "Buscar cuenta"
                      : activeLookup === "provincia"
                        ? "Buscar provincia"
                        : activeLookup === "ciudad"
                          ? "Buscar ciudad"
                          : "Buscar parroquia"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Selecciona un registro para cargarlo en el formulario del cliente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeLookup}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
                >
                  X
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4 flex items-center gap-3">
                  <input
                    value={lookupSearch}
                    onChange={(event) => setLookupSearch(event.target.value)}
                    placeholder="Buscar por código, nombre o descripción"
                    className="h-10 min-w-0 flex-1 border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBanner(
                        filteredLookupItems.length > 0
                          ? `${filteredLookupItems.length} resultado(s) encontrados en el catálogo actual.`
                          : "No hay coincidencias para esa búsqueda.",
                        filteredLookupItems.length > 0 ? "success" : "warning",
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
                          Descripción
                        </th>
                        <th className="w-44 border border-slate-300 px-3 py-2 text-left font-semibold">
                          Extra
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLookupItems.length > 0 ? (
                        filteredLookupItems.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => handleSelectLookupItem(item)}
                            className="cursor-pointer bg-white transition hover:bg-[#edf6ff]"
                          >
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {item.value}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {item.label}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-500">
                              {item.extra ?? item.ciudad ?? item.provincia ?? "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="border border-slate-300 px-4 py-10 text-center text-sm text-slate-500"
                          >
                            No se encontraron registros para esta búsqueda.
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

        {isCuentasModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-4xl rounded-sm border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[16px] font-semibold text-slate-800">
                    Gestión Cuentas Bancarias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGuardarCuentasBancarias}
                      className="rounded-sm bg-[#0f8fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b7ee0]"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelarCuentasBancarias}
                      className="rounded-sm bg-[#ef5f55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#df5047]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[220px] flex-1">
                    <label className="mb-1 block text-sm text-slate-700">Cuenta</label>
                    <input
                      value={cuentaBancariaInput}
                      onChange={(event) => setCuentaBancariaInput(event.target.value)}
                      className="h-9 w-full border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                    />
                  </div>
                  <div className="w-48">
                    <label className="mb-1 block text-sm text-slate-700">Banco</label>
                    <select
                      value={bancoSeleccionado}
                      onChange={(event) => setBancoSeleccionado(event.target.value)}
                      className="h-9 w-full border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                    >
                      {bancoOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-40">
                    <label className="mb-1 block text-sm text-slate-700">Tipo</label>
                    <select
                      value={tipoCuentaSeleccionado}
                      onChange={(event) => setTipoCuentaSeleccionado(event.target.value)}
                      className="h-9 w-full border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                    >
                      {tipoCuentaOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAgregarCuentaBancaria}
                      className="rounded-sm bg-[#2f5ca2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#274d88]"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={handleEliminarCuentaBancaria}
                      className="rounded-sm bg-[#de4848] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c53d3d]"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={handleVaciarCuentasBancarias}
                      className="rounded-sm bg-[#ef5f55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#df5047]"
                    >
                      Vaciar
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-hidden rounded-sm border border-slate-300">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-white text-slate-600">
                        <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                          Cuenta
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                          Banco
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                          Tipo
                        </th>
                        <th className="w-24 border border-slate-300 px-3 py-2 text-left font-semibold">
                          Principal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasBancarias.length > 0 ? (
                        cuentasBancarias.map((cuenta) => (
                          <tr
                            key={cuenta.id}
                            onClick={() => setSelectedCuentaBancariaId(cuenta.id)}
                            className={
                              cuenta.id === selectedCuentaBancariaId
                                ? "cursor-pointer bg-[#edf6ff]"
                                : "cursor-pointer bg-white hover:bg-slate-50"
                            }
                          >
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {cuenta.cuenta}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {cuenta.banco}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {cuenta.tipo}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-slate-800">
                              {cuenta.principal ? "Sí" : "No"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-slate-300 px-4 py-10 text-center text-sm text-slate-500"
                          >
                            Aún no hay cuentas bancarias registradas para este cliente.
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

        {isImportModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-md rounded-sm border-2 border-[#ffd99b] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-end px-4 pt-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
                >
                  X
                </button>
              </div>

              <div className="px-4 pb-5">
                <div className="space-y-6 text-[15px] text-slate-700">
                  <div className="space-y-6 font-semibold leading-7">
                    <p>1. Seleccione el archivo para realizar la carga automática.</p>
                    <p>2. Clic en procesar para empezar el proceso</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="import-mode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                      />
                      <span>Vaciar + Agregar Clientes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="import-mode"
                        checked={importMode === "append"}
                        onChange={() => setImportMode("append")}
                      />
                      <span>Agregar Clientes</span>
                    </label>
                  </div>

                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImportFileChange}
                  />

                  <div className="text-sm text-slate-500">
                    {selectedImportFile
                      ? `Archivo seleccionado: ${selectedImportFile.name}`
                      : "Sin archivo seleccionado"}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="text-[15px] font-medium text-[#1b5ca8] transition hover:underline"
                    >
                      Seleccionar Archivo
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessImport}
                      className="text-[15px] font-medium text-[#1b5ca8] transition hover:underline"
                    >
                      Cargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isMapModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-6xl rounded-sm border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex flex-1 flex-wrap items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">
                    Coordenadas Cliente:
                  </label>
                  <input
                    value={mapQuery}
                    onChange={(event) => setMapQuery(event.target.value)}
                    placeholder="Busca una dirección o escribe latitud,longitud"
                    className="h-10 min-w-[280px] flex-1 border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                  />
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    className="rounded-sm bg-[#f6a21a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de9014]"
                  >
                    Buscar
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
                >
                  X
                </button>
              </div>

              <div className="p-5">
                <div className="overflow-hidden rounded-sm border border-slate-300 bg-slate-50">
                  <iframe
                    title="Mapa de ubicación del cliente"
                    src={mapEmbedUrl}
                    className="h-[560px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    Puedes buscar una dirección o pegar coordenadas como
                    {" "}
                    <span className="font-semibold">-2.8974,-79.0045</span>.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(false)}
                      className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyMapLocation}
                      className="rounded-sm bg-[#1f9f4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18823c]"
                    >
                      Usar coordenadas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isServiciosModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-4xl rounded-sm border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsServiciosModalOpen(false);
                      setBanner("Ventana de clientes servicios cerrada.");
                    }}
                    className="inline-flex items-center rounded-sm bg-[#0f8fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b7ee0]"
                  >
                    Guardar
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsServiciosModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
                >
                  X
                </button>
              </div>

              <div className="px-4 pb-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <label className="text-sm text-slate-700">Buscador</label>
                  <input
                    value={serviciosSearch}
                    onChange={(event) => setServiciosSearch(event.target.value)}
                    className="h-8 min-w-[180px] flex-1 border border-slate-300 px-2 text-sm text-slate-800 outline-none focus:border-[#1677c9]"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarServicio}
                    className="h-8 rounded-sm bg-[#f7b53b] px-3 text-lg font-bold text-white transition hover:bg-[#e2a32f]"
                  >
                    Q
                  </button>
                  <button
                    type="button"
                    onClick={handleQuitarServicio}
                    className="rounded-sm bg-[#de4848] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c53d3d]"
                  >
                    Quitar Línea
                  </button>
                  <button
                    type="button"
                    onClick={handleAddServicioLinea}
                    className="rounded-sm bg-[#1e7b69] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#186657]"
                  >
                    Nueva Línea
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-300">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-white text-slate-600">
                        {["Código", "Descripción", "Precio", "Precio IVA", "Descuento"].map(
                          (title) => (
                            <th
                              key={title}
                              className="border border-slate-300 px-3 py-2 text-left text-[15px] font-semibold"
                            >
                              {title}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServicios.length > 0 ? (
                        filteredServicios.map((servicio) => (
                          <tr
                            key={servicio.id}
                            className={
                              servicio.id === selectedServicioId
                                ? "bg-[#edf6ff]"
                                : "bg-white"
                            }
                            onClick={() => setSelectedServicioId(servicio.id)}
                          >
                            <td className="border border-slate-300 px-1 py-1">
                              <input
                                value={servicio.codigo}
                                onChange={(event) =>
                                  updateServicioRow(
                                    servicio.id,
                                    "codigo",
                                    event.target.value,
                                  )
                                }
                                className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
                              />
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <input
                                value={servicio.descripcion}
                                onChange={(event) =>
                                  updateServicioRow(
                                    servicio.id,
                                    "descripcion",
                                    event.target.value,
                                  )
                                }
                                className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
                              />
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <input
                                value={servicio.precio}
                                onChange={(event) =>
                                  updateServicioRow(
                                    servicio.id,
                                    "precio",
                                    event.target.value,
                                  )
                                }
                                className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
                              />
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <input
                                value={servicio.precioIva}
                                onChange={(event) =>
                                  updateServicioRow(
                                    servicio.id,
                                    "precioIva",
                                    event.target.value,
                                  )
                                }
                                className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
                              />
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <input
                                value={servicio.descuento}
                                onChange={(event) =>
                                  updateServicioRow(
                                    servicio.id,
                                    "descuento",
                                    event.target.value,
                                  )
                                }
                                className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                          >
                            No hay servicios para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl text-slate-700">Total</span>
                    <input
                      value={totalServicios.toFixed(2)}
                      readOnly
                      className="h-9 w-40 border border-slate-300 bg-white px-3 text-right text-sm text-slate-800 outline-none"
                    />
                  </div>
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
            <label
              htmlFor="buscar-cliente"
              className="text-[15px] font-semibold text-slate-800"
            >
              Buscar:
            </label>
            <div className="flex flex-1 items-stretch">
              <input
                id="buscar-cliente"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca por identificacion, razon social, correo o nombre comercial"
                className="min-w-0 flex-1 border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1677c9]"
              />
              <span className="inline-flex items-center justify-center border-y border-r border-slate-300 bg-[#ffbf3f] px-4 text-xl text-white">
                O
              </span>
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
              onClick={handleExportClientes}
              className="rounded-sm bg-[#136b4f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105940]"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="rounded-sm bg-[#136b4f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105940]"
            >
              Importar Excel
            </button>
            <button
              type="button"
              onClick={handleTemplateDownload}
              className="rounded-sm bg-[#245e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4d45]"
            >
              Plantilla Excel
            </button>
            <button
              type="button"
              onClick={() =>
                setBanner(
                  "Usa Editar en cada cliente para activar o desactivar su geolocalización.",
                )
              }
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Geolocalización de clientes
            </button>
            <button
              type="button"
              onClick={() =>
                setBanner(
                  "Este módulo permite registrar, editar e inactivar clientes de la empresa activa.",
                )
              }
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Tutoriales
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
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente, index) => (
                  <tr
                    key={cliente.id}
                    className={
                      cliente.activo
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
                          onClick={() => openEditForm(cliente)}
                          className="inline-flex rounded-sm bg-[#9fe0aa] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#8bd29a]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cliente.id)}
                          className={`inline-flex rounded-sm px-3 py-1.5 text-sm font-semibold transition ${
                            cliente.activo
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {cliente.activo ? "Eliminar" : "Restaurar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGeoToggle(cliente.id)}
                          className="inline-flex rounded-sm bg-[#d7efff] px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-[#c2e4fb]"
                        >
                          {cliente.geolocalizado ? "Geo ON" : "Geo OFF"}
                        </button>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {cliente.identificacion}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      <div>
                        <p>{cliente.razonSocial}</p>
                        <p className="mt-1 text-xs">
                          {cliente.activo ? "Activo" : "Inactivo"}
                        </p>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-slate-800">
                      {cliente.nombreComercial}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay clientes registrados para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isImportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-sm border-2 border-[#ffd99b] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-end px-4 pt-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e95b46] text-lg font-semibold text-white"
              >
                X
              </button>
            </div>

            <div className="px-4 pb-5">
              <div className="space-y-6 text-[15px] text-slate-700">
                <div className="space-y-6 font-semibold leading-7">
                  <p>1. Seleccione el archivo para realizar la carga automática.</p>
                  <p>2. Clic en procesar para empezar el proceso</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="import-mode"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                    />
                    <span>Vaciar + Agregar Clientes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="import-mode"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                    />
                    <span>Agregar Clientes</span>
                  </label>
                </div>

                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImportFileChange}
                />

                <div className="text-sm text-slate-500">
                  {selectedImportFile
                    ? `Archivo seleccionado: ${selectedImportFile.name}`
                    : "Sin archivo seleccionado"}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="text-[15px] font-medium text-[#1b5ca8] transition hover:underline"
                  >
                    Seleccionar Archivo
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    className="text-[15px] font-medium text-[#1b5ca8] transition hover:underline"
                  >
                    Cargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}


