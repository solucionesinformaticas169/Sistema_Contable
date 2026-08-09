import { prisma } from "@/lib/prisma";
import { ActividadesSistemaPanel } from "./actividades-sistema-panel";
import { DatosEmpresaPanel } from "./datos-empresa-panel";
import { buildNombreDbPreview } from "@/lib/empresas";
import { ensurePrimaryUsuarioPermissions } from "@/lib/usuario-permissions";
import { redirect } from "next/navigation";
import { EditEmpresaForm } from "./edit-empresa-form";
import { FormatosFisicosPanel } from "./formatos-fisicos-panel";
import { GestionEmpresasPanel } from "./gestion-empresas-panel";
import { IntegracionesPanel } from "./integraciones-panel";
import { ParametrosContablesPanel } from "./parametros-contables-panel";
import { ParametrosFacturacionPanel } from "./parametros-facturacion-panel";
import { ParametrosFacturacionElectronicaPanel } from "./parametros-facturacion-electronica-panel";
import { ParametrosProductosPanel } from "./parametros-productos-panel";
import { ParametrosSmtpPanel } from "./parametros-smtp-panel";
import { SidebarMenu } from "./sidebar-menu";
import { SucursalesPanel } from "./sucursales-panel";
import { UsuarioPermisosPanel } from "./usuario-permisos-panel";
import { UsuariosPanel } from "./usuarios-panel";
import { VentasAutorizarDocumentosPanel } from "./ventas-autorizar-documentos-panel";
import { VentasClientesPanel } from "./ventas-clientes-panel";
import { VentasEntregasParcialesPanel } from "./ventas-entregas-parciales-panel";
import { VentasFacturacionPanel } from "./ventas-facturacion-panel";
import { VentasEntregasPorFacturarPanel } from "./ventas-entregas-por-facturar-panel";
import { VentasPedidosPanel } from "./ventas-pedidos-panel";
import { VentasProspectoPanel } from "./ventas-prospecto-panel";
import { VentasProformasPanel } from "./ventas-proformas-panel";

const administrationItems = [
  { id: "gestion-empresas", label: "Gestion Empresas" },
  { id: "usuarios", label: "Usuarios" },
  { id: "datos-empresa", label: "Datos Empresa" },
  { id: "parametros-productos", label: "Parametros Productos" },
  { id: "parametros-contables", label: "Parametros Contables" },
  { id: "parametros-facturacion", label: "Parametros Facturacion" },
  {
    id: "parametros-facturacion-electronica",
    label: "Parametros Facturacion Electronica",
  },
  { id: "parametros-smtp", label: "Parametros SMTP" },
  { id: "administrador-sucursales", label: "Administrador Sucursales" },
  { id: "integraciones", label: "Integraciones" },
  { id: "actividades-sistema", label: "Actividades Sistema" },
];

const salesItems = [
  { id: "ventas-facturacion", label: "Facturacion" },
  { id: "ventas-proformas", label: "Proformas" },
  { id: "ventas-pedidos", label: "Pedidos" },
  { id: "ventas-entregas-por-facturar", label: "Entregas por Facturar" },
  { id: "ventas-entregas-parciales", label: "Entregas Parciales" },
  { id: "ventas-autorizar-documentos", label: "Autorizar Documentos" },
  { id: "ventas-clientes", label: "Clientes" },
  { id: "ventas-prospecto", label: "Prospecto" },
  { id: "ventas-marketing-whatsapp", label: "Marketing Whatsapp" },
  { id: "ventas-grupo-clientes", label: "Grupo Clientes" },
  { id: "ventas-zonas-clientes", label: "Zonas Clientes" },
  { id: "ventas-rutas-clientes", label: "Rutas Clientes" },
  { id: "ventas-secuencias", label: "Secuencias" },
  { id: "ventas-agentes-ventas", label: "Agentes Ventas" },
  { id: "ventas-tarjetas-credito", label: "Tarjetas de Credito" },
  { id: "ventas-facturacion-por-lotes", label: "Facturacion por Lotes" },
  { id: "ventas-facturas-servicios", label: "Facturas Servicios" },
  { id: "ventas-localizar-vendedores", label: "Localizar Vendedores" },
  { id: "ventas-despacho", label: "Despacho" },
  { id: "ventas-recepcion", label: "Recepcion" },
];

const secondarySections = [
  "Compras",
  "Tesoreria",
  "Cartera",
  "Pagos",
  "Nomina",
  "Activos",
  "Contabilidad",
  "Produccion",
  "Garantias",
  "Talleres Vehiculos",
  "Restaurante",
  "Informes",
  "Solicitar Soporte",
  "Perseo IA",
  "Tutoriales",
];

const facturacionElectronicaTabs = new Set([
  "generales",
  "facturas",
  "nota-credito",
  "retenciones",
  "guia-remision",
  "nota-debito",
  "liquidacion-compras",
]);

const salesSectionLabels = new Map(salesItems.map((item) => [item.id, item.label]));

type PanelPageProps = {
  searchParams: Promise<{
    empresaId?: string;
    seccion?: string;
    editarEmpresaId?: string;
    editarPermisosUsuarioId?: string;
    vista?: string;
    tab?: string;
    edit?: string;
  }>;
};

type EmpresaPanelRecord = {
  id: number;
  ruc: string;
  razonSocial: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  tipoNegocio: string;
  whatsapp: string;
  correo: string;
  nombreComercial: string;
  telefono1: string;
  telefono2: string;
  telefono3: string;
  representanteIdentificacion: string;
  representanteLegal: string;
  contadorIdentificacion: string;
  contador: string;
  agenteRetencion: string;
  tipoRegimen: string;
  realizaAts: boolean;
  parroquia: string;
  logoPath: string;
  formatoFacturaPath: string;
  formatoRetencionPath: string;
  formatoGuiaRemisionPath: string;
  formatoNotaCreditoPath: string;
  formulaCalculoPrecios: string;
  produccionTipoCosto: string;
  tipoManejoPrecios: string;
  sumarCantidadFacturacion: boolean;
  sumarCantidadTpvOffline: boolean;
  sumarCantidadProforma: boolean;
  sumarCantidadEntrega: boolean;
  ivaPredeterminado: string;
  tipoCalculoCosto: string;
  almacenPredeterminado: string;
  transferenciasConIngreso: boolean;
  permitirTransferenciaStock: boolean;
  actualizarPreciosUltCompra: boolean;
  permitirMultiplesTarifas: boolean;
  tarifaMultimedidas: string;
  etiquetaUrbano: string;
  formatoPrecio: number;
  formatoPrecioIva: number;
  formatoSubtotales: number;
  formatoValorIva: number;
  formatoTotal: number;
  formatoCosto: number;
  formatoCostoSubtotales: number;
  formatoCostoTotal: number;
  formatoCostoValorIva: number;
  formatoCantidad: number;
  generaAsientosContables: boolean;
  tipoModificacionAsientos: string;
  centrosCostos: boolean;
  productosSinIvaInventarioCodigo: string;
  productosSinIvaInventarioNombre: string;
  productosSinIvaVentasCodigo: string;
  productosSinIvaVentasNombre: string;
  productosSinIvaCostoCodigo: string;
  productosSinIvaCostoNombre: string;
  productosConIvaInventarioCodigo: string;
  productosConIvaInventarioNombre: string;
  productosConIvaVentasCodigo: string;
  productosConIvaVentasNombre: string;
  productosConIvaCostoCodigo: string;
  productosConIvaCostoNombre: string;
  tipoContabilizacionIngresos:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  tipoContabilizacionSalidas:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  ccCajasCodigo: string;
  ccCajasNombre: string;
  ccBancosCodigo: string;
  ccBancosNombre: string;
  ccClientesCodigo: string;
  ccClientesNombre: string;
  ccProveedoresCodigo: string;
  ccProveedoresNombre: string;
  ccRecepcionesCodigo: string;
  ccRecepcionesNombre: string;
  ccIvaComprasCodigo: string;
  ccIvaComprasNombre: string;
  ccIvaPresuntivoCodigo: string;
  ccIvaPresuntivoNombre: string;
  ccIrPresuntivoCodigo: string;
  ccIrPresuntivoNombre: string;
  ccIceComprasCodigo: string;
  ccIceComprasNombre: string;
  ccAsumeRetCodigo: string;
  ccAsumeRetNombre: string;
  ccIvaVentasCodigo: string;
  ccIvaVentasNombre: string;
  ccIceVentasCodigo: string;
  ccIceVentasNombre: string;
  ccPropinaVentasCodigo: string;
  ccPropinaVentasNombre: string;
  ccInteresVentasCodigo: string;
  ccInteresVentasNombre: string;
  tipoContabilizacionCajas:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  tipoContabilizacionBancos:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  tipoContabilizacionCompras:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  tipoContabilizacionVentas:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  cobrosAnticiposCodigo: string;
  cobrosAnticiposNombre: string;
  cobrosCruceCodigo: string;
  cobrosCruceNombre: string;
  cobrosRetAtrasadaCodigo: string;
  cobrosRetAtrasadaNombre: string;
  tipoContabilidadCobros:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  pagosAnticiposCodigo: string;
  pagosAnticiposNombre: string;
  pagosCruceCodigo: string;
  pagosCruceNombre: string;
  tipoContabilidadPagos:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  cajaTransitoriaCodigo: string;
  cajaTransitoriaNombre: string;
  bancosTransitoriaCodigo: string;
  bancosTransitoriaNombre: string;
  vouchersComisionCodigo: string;
  vouchersComisionNombre: string;
  tipoContabilizacionDepositos:
    | "no_contabilizar"
    | "contabilizar"
    | "contabilizar_y_ver_asiento";
  nominaSueldoBasico: string;
  tipoContabilidadNomina: string;
  obligarCupoCredito: boolean;
  obligarAperturaCaja: boolean;
  ingresarClaveFacturadorUnaVez: boolean;
  visualizarComboVendedores: boolean;
  controlarSaldosVencidos: boolean;
  verTotalSinDescuento: boolean;
  verTotalConDescuento: boolean;
  porcentajeInteres: string;
  tipoDescuentoAsignado: string;
  permitirEntregasParciales: boolean;
  permitirServiciosGuias: boolean;
  lotesDescontarAutomatico: boolean;
  ocultarFechasControlLotes: boolean;
  envioAutomaticoOffline: boolean;
  enviarMailCobroCliente: boolean;
  enviarMailPagoProveedor: boolean;
  verSaldosEstadoCartera: boolean;
  aprobarPagosDosPasos: boolean;
  crmClientesAgrupados: boolean;
  afectarChequesCupoCredito: boolean;
  obligaSeleccionarMesas: boolean;
  controlaCocina: boolean;
  restauranteCocina: string;
  restauranteBar: string;
  restauranteGrill: string;
  feAmbiente: string;
  feTipoAutorizacion: string;
  feNumeroContribuyenteEspecial: string;
  feFechaCaducaCertificado: string;
  feLlevaContabilidad: string;
  feTiempoEsperaAutorizacion: string;
  feTipoFirmador: string;
  feCorreoComprobacion: string;
  feInformacionFacturas: string;
  feSqlFacturaTipo: string;
  feSqlFacturaContenido: string;
  feSqlNotaCreditoContenido: string;
  feSqlRetencionesContenido: string;
  feSqlGuiaRemisionTipo: string;
  feSqlGuiaRemisionContenido: string;
  feSqlNotaDebitoContenido: string;
  feSqlLiquidacionComprasContenido: string;
  smtpServidor: string;
  smtpUsuario: string;
  smtpCorreoRemitente: string;
  smtpPuerto: string;
  smtpClave: string;
  nombreDb: string | null;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SucursalRecord = {
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
  createdAt: Date;
  updatedAt: Date;
};

type IntegracionRecord = {
  id: number;
  descripcion: string;
  tipo: string;
  servidor: string;
  usuario: string;
  contrasena: string;
  puerto: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ActivitySourceUsuarioRecord = {
  id: number;
  descripcion: string;
  email: string;
  empresa: {
    id: number;
    razonSocial: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

type ActivitySourceSucursalRecord = {
  id: number;
  nombre: string;
  razonSocial: string;
  ciudad: string;
  empresa: {
    id: number;
    razonSocial: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

type ActivitySourceIntegracionRecord = {
  id: number;
  descripcion: string;
  tipo: string;
  usuario: string;
  empresa: {
    id: number;
    razonSocial: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

type GeoProvinciaRecord = {
  nombre: string;
  ciudades: {
    nombre: string;
    parroquias: {
      nombre: string;
    }[];
  }[];
};

function SidebarIcon({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 rounded-[4px] border border-slate-300"
      style={{ backgroundColor: color }}
    />
  );
}

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const params = await searchParams;
  const empresaId = Number(params.empresaId);
  const editarEmpresaId = Number(params.editarEmpresaId);
  const editarPermisosUsuarioId = Number(params.editarPermisosUsuarioId);
  const vistaActual = params.vista || "";
  const seccionActual = params.seccion || "gestion-empresas";
  const facturacionElectronicaTab =
    params.tab && facturacionElectronicaTabs.has(params.tab)
      ? params.tab
      : "generales";
  const facturacionElectronicaEdit = params.edit === "1";
  const smtpEdit = params.edit === "1";
  const isActividadesSistemaSection = seccionActual === "actividades-sistema";

  const [
    empresa,
    totalEmpresas,
    empresaEnEdicion,
    empresasRecientes,
    usuarios,
    geoCatalogRows,
    sucursalesRows,
    integracionesRows,
    activityUsuariosRows,
    activitySucursalesRows,
    activityIntegracionesRows,
  ] = await Promise.all([
    Number.isInteger(empresaId) && empresaId > 0
      ? prisma.empresa.findUnique({
          where: { id: empresaId },
        })
      : prisma.empresa.findFirst({
          orderBy: { createdAt: "desc" },
        }),
    prisma.empresa.count(),
    Number.isInteger(editarEmpresaId) && editarEmpresaId > 0
      ? prisma.empresa.findUnique({
          where: { id: editarEmpresaId },
        })
      : null,
    prisma.empresa.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    Number.isInteger(empresaId) && empresaId > 0
      ? prisma.usuario.findMany({
          where: { empresaId },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        })
      : [],
    prisma.geoProvincia.findMany({
      orderBy: [{ nombre: "asc" }],
      include: {
        ciudades: {
          orderBy: [{ nombre: "asc" }],
          include: {
            parroquias: {
              orderBy: [{ nombre: "asc" }],
            },
          },
        },
      },
    }),
    Number.isInteger(empresaId) && empresaId > 0
      ? prisma.sucursal.findMany({
          where: { empresaId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        })
      : [],
    Number.isInteger(empresaId) && empresaId > 0
      ? prisma.integracion.findMany({
          where: { empresaId },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        })
      : [],
    isActividadesSistemaSection
      ? prisma.usuario.findMany({
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          include: {
            empresa: {
              select: {
                id: true,
                razonSocial: true,
              },
            },
          },
        })
      : [],
    isActividadesSistemaSection
      ? prisma.sucursal.findMany({
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          include: {
            empresa: {
              select: {
                id: true,
                razonSocial: true,
              },
            },
          },
        })
      : [],
    isActividadesSistemaSection
      ? prisma.integracion.findMany({
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          include: {
            empresa: {
              select: {
                id: true,
                razonSocial: true,
              },
            },
          },
        })
      : [],
  ]);

  const empresasRecientesData = empresasRecientes as unknown as EmpresaPanelRecord[];
  const empresaActual = (empresa ?? empresasRecientesData[0] ?? null) as
    | EmpresaPanelRecord
    | null;
  const empresaEdicionActual = empresaEnEdicion as EmpresaPanelRecord | null;
  const sucursalesData = sucursalesRows as unknown as SucursalRecord[];
  const integracionesData = integracionesRows as unknown as IntegracionRecord[];
  const activityUsuariosData =
    activityUsuariosRows as unknown as ActivitySourceUsuarioRecord[];
  const activitySucursalesData =
    activitySucursalesRows as unknown as ActivitySourceSucursalRecord[];
  const activityIntegracionesData =
    activityIntegracionesRows as unknown as ActivitySourceIntegracionRecord[];
  const geoCatalogData = geoCatalogRows as unknown as GeoProvinciaRecord[];
  const geoCatalog = {
    provincias: geoCatalogData.map((provincia) => provincia.nombre),
    ciudadesPorProvincia: Object.fromEntries(
      geoCatalogData.map((provincia) => [
        provincia.nombre,
        provincia.ciudades.map((ciudad) => ciudad.nombre),
      ]),
    ) as Record<string, string[]>,
    parroquiasPorCiudad: Object.fromEntries(
      geoCatalogData.flatMap((provincia) =>
        provincia.ciudades.map((ciudad) => [
          ciudad.nombre,
          ciudad.parroquias.map((parroquia) => parroquia.nombre),
        ]),
      ),
    ) as Record<string, string[]>,
  };

  if (empresaActual?.id) {
    await ensurePrimaryUsuarioPermissions(empresaActual.id);

    if (sucursalesData.length === 0) {
      await prisma.sucursal.create({
        data: {
          empresaId: empresaActual.id,
          nombre: "Principal",
        },
      });

      redirect(
        `/panel?${new URLSearchParams({
          empresaId: String(empresaActual.id),
          ...(seccionActual ? { seccion: seccionActual } : {}),
        }).toString()}`,
      );
    }
  }

  const usuarioEnPermisos =
    Number.isInteger(editarPermisosUsuarioId) && editarPermisosUsuarioId > 0
      ? await prisma.usuario.findUnique({
          where: { id: editarPermisosUsuarioId },
        })
      : null;

  const permisosUsuario = usuarioEnPermisos
    ? await prisma.usuarioPermiso.findMany({
        where: { usuarioId: usuarioEnPermisos.id },
      })
    : [];

  const primaryUsuario = empresaActual?.id
    ? await prisma.usuario.findFirst({
        where: { empresaId: empresaActual.id },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true },
      })
    : null;

  const nombreEmpresa = empresaActual?.razonSocial ?? "Nueva Empresa";
  const rucEmpresa = empresaActual?.ruc ?? "Sin RUC";
  const tipoNegocioEmpresa =
    empresaActual?.tipoNegocio ?? "Sin tipo de negocio registrado.";
  const nombreDbEmpresa =
    empresaActual?.nombreDb ||
    (empresaActual
      ? buildNombreDbPreview(empresaActual.razonSocial, empresaActual.id)
      : "empresa_general");

  const isUsuariosSection = seccionActual === "usuarios";
  const isDatosEmpresaSection = seccionActual === "datos-empresa";
  const isParametrosProductosSection = seccionActual === "parametros-productos";
  const isParametrosContablesSection = seccionActual === "parametros-contables";
  const isParametrosFacturacionSection =
    seccionActual === "parametros-facturacion";
  const isParametrosFacturacionElectronicaSection =
    seccionActual === "parametros-facturacion-electronica";
  const isVentasFacturacionSection = seccionActual === "ventas-facturacion";
  const isVentasEntregasPorFacturarSection =
    seccionActual === "ventas-entregas-por-facturar";
  const isVentasEntregasParcialesSection =
    seccionActual === "ventas-entregas-parciales";
  const isVentasAutorizarDocumentosSection =
    seccionActual === "ventas-autorizar-documentos";
  const isVentasClientesSection = seccionActual === "ventas-clientes";
  const isVentasProspectoSection = seccionActual === "ventas-prospecto";
  const isVentasPedidosSection = seccionActual === "ventas-pedidos";
  const isVentasProformasSection = seccionActual === "ventas-proformas";
  const isParametrosSmtpSection = seccionActual === "parametros-smtp";
  const isAdministradorSucursalesSection =
    seccionActual === "administrador-sucursales";
  const isIntegracionesSection = seccionActual === "integraciones";
  const isPermisosSection = isUsuariosSection && Boolean(usuarioEnPermisos);
  const isFormatosFisicosView = isDatosEmpresaSection && vistaActual === "formatos-fisicos";
  const isParametrosFormatosFisicosView =
    isParametrosProductosSection && vistaActual === "formatos-fisicos";
  const isContablesFormatosFisicosView =
    isParametrosContablesSection && vistaActual === "formatos-fisicos";
  const isFacturacionFormatosFisicosView =
    isParametrosFacturacionSection && vistaActual === "formatos-fisicos";
  const isFacturacionElectronicaFormatosFisicosView =
    isParametrosFacturacionElectronicaSection &&
    vistaActual === "formatos-fisicos";
  const isSmtpFormatosFisicosView =
    isParametrosSmtpSection && vistaActual === "formatos-fisicos";
  const moduleTitle = isPermisosSection
    ? "Permisos de usuario"
    : isFormatosFisicosView
      ? "Formatos fisicos"
      : isParametrosFormatosFisicosView
        ? "Formatos fisicos"
        : isContablesFormatosFisicosView
          ? "Formatos fisicos"
          : isFacturacionFormatosFisicosView
            ? "Formatos fisicos"
            : isFacturacionElectronicaFormatosFisicosView
              ? "Formatos fisicos"
            : isSmtpFormatosFisicosView
              ? "Formatos fisicos"
      : isDatosEmpresaSection
        ? "Datos Empresa"
        : isParametrosProductosSection
          ? "Parametros Productos"
          : isParametrosContablesSection
            ? "Parametros Contables"
            : isParametrosFacturacionSection
              ? "Parametros Facturacion"
              : isParametrosFacturacionElectronicaSection
                  ? "Parametros Facturacion Electronica"
                  : isVentasFacturacionSection
                    ? "Facturacion"
                  : isVentasEntregasPorFacturarSection
                    ? "Entregas por Facturar"
                  : isVentasEntregasParcialesSection
                    ? "Entregas Parciales"
                  : isVentasAutorizarDocumentosSection
                    ? "Autorizar Documentos"
                  : isVentasClientesSection
                    ? "Clientes"
                  : isVentasProspectoSection
                    ? "Prospecto"
                  : isVentasPedidosSection
                    ? "Pedidos"
                  : isVentasProformasSection
                    ? "Proformas"
                  : isParametrosSmtpSection
                    ? "Parametros SMTP"
                    : isAdministradorSucursalesSection
                      ? "Administrador Sucursales"
                      : isIntegracionesSection
                        ? "Integraciones"
                      : isActividadesSistemaSection
                        ? "Actividades Sistema"
                        : salesSectionLabels.get(seccionActual) ?? 
                          (isUsuariosSection ? "Usuarios" : "Gestion Empresas");
  const moduleDescription = isPermisosSection
    ? "Define los accesos por pagina para cada usuario de la empresa activa. El borrado de usuarios es logico para conservar historial."
    : isFormatosFisicosView
      ? "Administra las plantillas fisicas que utilizara la empresa en documentos impresos."
      : isParametrosFormatosFisicosView
        ? "Carga y descarga las plantillas fisicas usadas por el modulo de productos."
      : isContablesFormatosFisicosView
        ? "Carga y descarga las plantillas fisicas usadas por la parametrizacion contable."
      : isFacturacionFormatosFisicosView
        ? "Carga y descarga las plantillas fisicas usadas por la parametrizacion de facturacion."
      : isFacturacionElectronicaFormatosFisicosView
        ? "Carga y descarga las plantillas fisicas usadas por la facturacion electronica."
      : isSmtpFormatosFisicosView
        ? "Carga y descarga las plantillas fisicas usadas por la configuracion SMTP."
      : isDatosEmpresaSection
        ? "Completa los datos generales, contactos, ubicacion y parametros tributarios base de la empresa activa."
      : isParametrosProductosSection
        ? "Configura reglas base de precios, costos, cantidades y comportamiento operativo de productos."
      : isParametrosContablesSection
        ? "Configura cuentas contables y tipos de contabilizacion por pestañas funcionales."
      : isParametrosFacturacionSection
        ? "Configura la operacion de facturacion diaria y el flujo de restaurante."
      : isParametrosFacturacionElectronicaSection
        ? "Configura ambiente, comprobacion y SQL base para comprobantes electronicos."
      : isVentasFacturacionSection
        ? "Registra comprobantes de venta, controla totales, detalle de productos y datos generales del documento."
      : isVentasEntregasPorFacturarSection
        ? "Administra entregas pendientes de facturacion con detalle, totales y controles de series o lotes."
      : isVentasEntregasParcialesSection
        ? "Gestiona entregas parciales por documento, seleccion de lineas, cantidades entregadas y salida hacia guia de remision."
      : isVentasAutorizarDocumentosSection
        ? "Controla documentos por autorizar o autorizados, filtros por fecha y acciones operativas ligadas al flujo SRI."
      : isVentasClientesSection
        ? "Administra clientes con busqueda, registro, edicion, borrado logico, geolocalizacion y utilidades de importacion/exportacion."
      : isVentasProspectoSection
        ? "Administra prospectos con busqueda, registro, edicion y conversion del seguimiento comercial."
      : isVentasPedidosSection
        ? "Administra pedidos comerciales con prioridad, estado, detalle y totales recalculados."
      : isVentasProformasSection
        ? "Prepara proformas comerciales con cliente, detalle, observacion y totales recalculados."
      : isParametrosSmtpSection
        ? "Configura el servidor SMTP usado para correos salientes de la empresa activa."
      : isAdministradorSucursalesSection
        ? "Administra las sucursales de la empresa activa con busqueda, alta, edicion y borrado logico."
      : isIntegracionesSection
        ? "Administra conexiones externas de la empresa activa como SMTP, WhatsApp, Ecommerce y API Key."
      : isActividadesSistemaSection
        ? "Consulta movimientos recientes del sistema y filtralos por texto o por empresa."
      : salesSectionLabels.has(seccionActual)
      ? "Modulo visual inicial listo para continuar con el desarrollo funcional del area comercial."
      : isUsuariosSection
        ? "Administra los usuarios de la empresa activa con identificacion, descripcion y correo."
        : "La empresa superior corresponde a la seleccion activa guardada en la base. El campo Nombre DB ahora se genera con un formato interno legible para identificar mejor cada empresa.";

  const actividadesSistema = isActividadesSistemaSection
    ? [
        ...activityUsuariosData.flatMap((item) => {
          const rows = [
            {
              id: `usuario-create-${item.id}`,
              modulo: "Usuarios",
              accion: "Creacion",
              fecha: item.createdAt.toLocaleString("es-EC"),
              usuario: item.email || item.descripcion,
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Usuario ${item.descripcion} creado en la empresa ${item.empresa.razonSocial}.`,
              sortDate: item.createdAt,
            },
          ];

          if (item.updatedAt.getTime() !== item.createdAt.getTime()) {
            rows.push({
              id: `usuario-update-${item.id}`,
              modulo: "Usuarios",
              accion: "Actualizacion",
              fecha: item.updatedAt.toLocaleString("es-EC"),
              usuario: item.email || item.descripcion,
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Usuario ${item.descripcion} actualizado en la empresa ${item.empresa.razonSocial}.`,
              sortDate: item.updatedAt,
            });
          }

          return rows;
        }),
        ...activitySucursalesData.flatMap((item) => {
          const rows = [
            {
              id: `sucursal-create-${item.id}`,
              modulo: "Administrador Sucursales",
              accion: "Creacion",
              fecha: item.createdAt.toLocaleString("es-EC"),
              usuario: item.razonSocial || item.nombre,
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Sucursal ${item.nombre} creada para ${item.empresa.razonSocial} en ${item.ciudad || "sin ciudad"}.`,
              sortDate: item.createdAt,
            },
          ];

          if (item.updatedAt.getTime() !== item.createdAt.getTime()) {
            rows.push({
              id: `sucursal-update-${item.id}`,
              modulo: "Administrador Sucursales",
              accion: "Actualizacion",
              fecha: item.updatedAt.toLocaleString("es-EC"),
              usuario: item.razonSocial || item.nombre,
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Sucursal ${item.nombre} actualizada para ${item.empresa.razonSocial}.`,
              sortDate: item.updatedAt,
            });
          }

          return rows;
        }),
        ...activityIntegracionesData.flatMap((item) => {
          const rows = [
            {
              id: `integracion-create-${item.id}`,
              modulo: "Integraciones",
              accion: "Creacion",
              fecha: item.createdAt.toLocaleString("es-EC"),
              usuario: item.usuario || "Sistema",
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Integracion ${item.descripcion} de tipo ${item.tipo} creada en ${item.empresa.razonSocial}.`,
              sortDate: item.createdAt,
            },
          ];

          if (item.updatedAt.getTime() !== item.createdAt.getTime()) {
            rows.push({
              id: `integracion-update-${item.id}`,
              modulo: "Integraciones",
              accion: "Actualizacion",
              fecha: item.updatedAt.toLocaleString("es-EC"),
              usuario: item.usuario || "Sistema",
              empresaId: item.empresa.id,
              empresa: item.empresa.razonSocial,
              detalle: `Integracion ${item.descripcion} actualizada en ${item.empresa.razonSocial}.`,
              sortDate: item.updatedAt,
            });
          }

          return rows;
        }),
        ...empresasRecientesData.flatMap((item) => {
          const rows = [
            {
              id: `empresa-create-${item.id}`,
              modulo: "Gestion Empresas",
              accion: "Creacion",
              fecha: item.createdAt.toLocaleString("es-EC"),
              usuario: item.correo || "Sistema",
              empresaId: item.id,
              empresa: item.razonSocial,
              detalle: `Empresa ${item.razonSocial} registrada con RUC ${item.ruc}.`,
              sortDate: item.createdAt,
            },
          ];

          if (item.updatedAt.getTime() !== item.createdAt.getTime()) {
            rows.push({
              id: `empresa-update-${item.id}`,
              modulo: "Gestion Empresas",
              accion: "Actualizacion",
              fecha: item.updatedAt.toLocaleString("es-EC"),
              usuario: item.correo || "Sistema",
              empresaId: item.id,
              empresa: item.razonSocial,
              detalle: `Empresa ${item.razonSocial} actualizada.`,
              sortDate: item.updatedAt,
            });
          }

          return rows;
        }),
      ]
        .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
        .map(({ sortDate: _sortDate, ...item }) => item)
    : [];

  return (
    <main className="min-h-screen bg-[#edf1f5] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="flex w-[380px] border-r border-slate-300 bg-[#f7f7f7] shadow-[6px_0_20px_rgba(15,23,42,0.08)]">
          <div className="flex w-[52px] flex-col items-center gap-7 border-r border-slate-300 bg-[#f2f3f5] py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-[#6285d7] shadow-sm">
              <span className="text-lg font-bold leading-none">|||</span>
            </div>
            {[
              "#9aa3b2",
              "#d6a446",
              "#3b82c4",
              "#97b740",
              "#df9a3c",
              "#d1b54b",
              "#94a3b8",
              "#e6c15d",
              "#5d8fd6",
              "#d4a65c",
              "#7c8aa5",
              "#8b98aa",
            ].map((color) => (
              <SidebarIcon key={color} color={color} />
            ))}
          </div>

          <div className="flex-1">
            <div className="flex h-[68px] items-center gap-4 border-b border-slate-300 bg-white px-6">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[conic-gradient(from_90deg,#f2c94c_0_20%,#e76f51_20%_40%,#5b8def_40%_60%,#7abf6a_60%_80%,#d9e1ef_80%_100%)] shadow-sm">
                <div className="h-4 w-4 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{nombreEmpresa}</p>
                <p className="text-xs text-slate-500">Panel principal</p>
              </div>
            </div>
            <SidebarMenu
              administrationItems={administrationItems}
              salesItems={salesItems}
              secondarySections={secondarySections}
              seccionActual={seccionActual}
              empresaId={empresaActual?.id}
            />
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="flex min-h-[68px] items-center justify-between bg-[#1677c9] px-6 text-white shadow-[0_4px_14px_rgba(22,119,201,0.32)]">
            <p className="text-base font-semibold">{nombreEmpresa}</p>
            <div className="text-right">
              <p className="text-sm font-semibold">Empresa activa</p>
              <p className="text-xs text-blue-100">{rucEmpresa}</p>
            </div>
          </header>

          <section className="flex-1 p-4">
            <div className="min-h-[calc(100vh-100px)] rounded-sm border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Modulo abierto: {moduleTitle}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {moduleDescription}
                  </p>
                </div>

                <div className="rounded-sm border border-slate-200 bg-[#f8fbff] px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    Resumen base
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {totalEmpresas}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Empresas registradas al 5 de agosto de 2026.
                  </p>
                </div>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    RUC
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{rucEmpresa}</p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    Tipo de negocio
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{tipoNegocioEmpresa}</p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    Nombre DB
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-800">
                    {nombreDbEmpresa}
                  </p>
                </div>
              </div>

              {empresaEdicionActual ? (
                <div className="mb-4">
                  <EditEmpresaForm
                    empresa={{
                      id: empresaEdicionActual.id,
                      ruc: empresaEdicionActual.ruc,
                      razonSocial: empresaEdicionActual.razonSocial,
                      direccion: empresaEdicionActual.direccion,
                      provincia: empresaEdicionActual.provincia,
                      ciudad: empresaEdicionActual.ciudad,
                      tipoNegocio: empresaEdicionActual.tipoNegocio,
                      whatsapp: empresaEdicionActual.whatsapp,
                      correo: empresaEdicionActual.correo,
                    }}
                  />
                </div>
              ) : null}

              {isUsuariosSection ? (
                isPermisosSection && empresaActual && usuarioEnPermisos ? (
                  <UsuarioPermisosPanel
                    empresa={{
                      id: empresaActual.id,
                      razonSocial: empresaActual.razonSocial,
                    }}
                    usuario={{
                      id: usuarioEnPermisos.id,
                      identificacion: usuarioEnPermisos.identificacion,
                      descripcion: usuarioEnPermisos.descripcion,
                      email: usuarioEnPermisos.email,
                    }}
                    permisos={permisosUsuario.map((item) => ({
                      paginaKey: item.paginaKey,
                      visualizar: item.visualizar,
                      agregar: item.agregar,
                      modificar: item.modificar,
                      eliminar: item.eliminar,
                      verCosto: item.verCosto,
                    }))}
                    defaultAllChecked={primaryUsuario?.id === usuarioEnPermisos.id}
                  />
                ) : (
                  <UsuariosPanel
                    empresaId={empresaActual?.id}
                    usuarios={usuarios.map((item) => ({
                      id: item.id,
                      identificacion: item.identificacion,
                      descripcion: item.descripcion,
                      email: item.email,
                      activo: item.activo,
                    }))}
                  />
                )
              ) : isDatosEmpresaSection && empresaActual ? (
                isFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="datos-empresa"
                    sectionLabel="Datos Empresa"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <DatosEmpresaPanel
                    empresa={{
                      id: empresaActual.id,
                      ruc: empresaActual.ruc,
                      razonSocial: empresaActual.razonSocial,
                      direccion: empresaActual.direccion,
                      provincia: empresaActual.provincia,
                      ciudad: empresaActual.ciudad,
                      tipoNegocio: empresaActual.tipoNegocio,
                      whatsapp: empresaActual.whatsapp,
                      correo: empresaActual.correo,
                      nombreComercial: empresaActual.nombreComercial,
                      telefono1: empresaActual.telefono1,
                      telefono2: empresaActual.telefono2,
                      telefono3: empresaActual.telefono3,
                      representanteIdentificacion:
                        empresaActual.representanteIdentificacion,
                      representanteLegal: empresaActual.representanteLegal,
                      contadorIdentificacion: empresaActual.contadorIdentificacion,
                      contador: empresaActual.contador,
                      agenteRetencion: empresaActual.agenteRetencion,
                      tipoRegimen: empresaActual.tipoRegimen,
                      realizaAts: empresaActual.realizaAts,
                      parroquia: empresaActual.parroquia,
                      logoPath: empresaActual.logoPath,
                    }}
                    geoCatalog={geoCatalog}
                  />
                )
              ) : isParametrosProductosSection && empresaActual ? (
                isParametrosFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="parametros-productos"
                    sectionLabel="Parametros Productos"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <ParametrosProductosPanel
                    empresa={{
                      id: empresaActual.id,
                      formulaCalculoPrecios: empresaActual.formulaCalculoPrecios,
                      produccionTipoCosto: empresaActual.produccionTipoCosto,
                      tipoManejoPrecios: empresaActual.tipoManejoPrecios,
                      sumarCantidadFacturacion:
                        empresaActual.sumarCantidadFacturacion,
                      sumarCantidadTpvOffline:
                        empresaActual.sumarCantidadTpvOffline,
                      sumarCantidadProforma: empresaActual.sumarCantidadProforma,
                      sumarCantidadEntrega: empresaActual.sumarCantidadEntrega,
                      ivaPredeterminado: empresaActual.ivaPredeterminado,
                      tipoCalculoCosto: empresaActual.tipoCalculoCosto,
                      almacenPredeterminado:
                        empresaActual.almacenPredeterminado,
                      transferenciasConIngreso:
                        empresaActual.transferenciasConIngreso,
                      permitirTransferenciaStock:
                        empresaActual.permitirTransferenciaStock,
                      actualizarPreciosUltCompra:
                        empresaActual.actualizarPreciosUltCompra,
                      permitirMultiplesTarifas:
                        empresaActual.permitirMultiplesTarifas,
                      tarifaMultimedidas: empresaActual.tarifaMultimedidas,
                      etiquetaUrbano: empresaActual.etiquetaUrbano,
                      formatoPrecio: empresaActual.formatoPrecio,
                      formatoPrecioIva: empresaActual.formatoPrecioIva,
                      formatoSubtotales: empresaActual.formatoSubtotales,
                      formatoValorIva: empresaActual.formatoValorIva,
                      formatoTotal: empresaActual.formatoTotal,
                      formatoCosto: empresaActual.formatoCosto,
                      formatoCostoSubtotales:
                        empresaActual.formatoCostoSubtotales,
                      formatoCostoTotal: empresaActual.formatoCostoTotal,
                      formatoCostoValorIva:
                        empresaActual.formatoCostoValorIva,
                      formatoCantidad: empresaActual.formatoCantidad,
                    }}
                  />
                )
              ) : isParametrosContablesSection && empresaActual ? (
                isContablesFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="parametros-contables"
                    sectionLabel="Parametros Contables"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <ParametrosContablesPanel
                    empresa={{
                      id: empresaActual.id,
                      generaAsientosContables:
                        empresaActual.generaAsientosContables,
                      tipoModificacionAsientos:
                        empresaActual.tipoModificacionAsientos,
                      centrosCostos: empresaActual.centrosCostos,
                      productosSinIvaInventarioCodigo:
                        empresaActual.productosSinIvaInventarioCodigo,
                      productosSinIvaInventarioNombre:
                        empresaActual.productosSinIvaInventarioNombre,
                      productosSinIvaVentasCodigo:
                        empresaActual.productosSinIvaVentasCodigo,
                      productosSinIvaVentasNombre:
                        empresaActual.productosSinIvaVentasNombre,
                      productosSinIvaCostoCodigo:
                        empresaActual.productosSinIvaCostoCodigo,
                      productosSinIvaCostoNombre:
                        empresaActual.productosSinIvaCostoNombre,
                      productosConIvaInventarioCodigo:
                        empresaActual.productosConIvaInventarioCodigo,
                      productosConIvaInventarioNombre:
                        empresaActual.productosConIvaInventarioNombre,
                      productosConIvaVentasCodigo:
                        empresaActual.productosConIvaVentasCodigo,
                      productosConIvaVentasNombre:
                        empresaActual.productosConIvaVentasNombre,
                      productosConIvaCostoCodigo:
                        empresaActual.productosConIvaCostoCodigo,
                      productosConIvaCostoNombre:
                        empresaActual.productosConIvaCostoNombre,
                      tipoContabilizacionIngresos:
                        empresaActual.tipoContabilizacionIngresos,
                      tipoContabilizacionSalidas:
                        empresaActual.tipoContabilizacionSalidas,
                      ccCajasCodigo: empresaActual.ccCajasCodigo,
                      ccCajasNombre: empresaActual.ccCajasNombre,
                      ccBancosCodigo: empresaActual.ccBancosCodigo,
                      ccBancosNombre: empresaActual.ccBancosNombre,
                      ccClientesCodigo: empresaActual.ccClientesCodigo,
                      ccClientesNombre: empresaActual.ccClientesNombre,
                      ccProveedoresCodigo:
                        empresaActual.ccProveedoresCodigo,
                      ccProveedoresNombre:
                        empresaActual.ccProveedoresNombre,
                      ccRecepcionesCodigo:
                        empresaActual.ccRecepcionesCodigo,
                      ccRecepcionesNombre:
                        empresaActual.ccRecepcionesNombre,
                      ccIvaComprasCodigo:
                        empresaActual.ccIvaComprasCodigo,
                      ccIvaComprasNombre:
                        empresaActual.ccIvaComprasNombre,
                      ccIvaPresuntivoCodigo:
                        empresaActual.ccIvaPresuntivoCodigo,
                      ccIvaPresuntivoNombre:
                        empresaActual.ccIvaPresuntivoNombre,
                      ccIrPresuntivoCodigo:
                        empresaActual.ccIrPresuntivoCodigo,
                      ccIrPresuntivoNombre:
                        empresaActual.ccIrPresuntivoNombre,
                      ccIceComprasCodigo:
                        empresaActual.ccIceComprasCodigo,
                      ccIceComprasNombre:
                        empresaActual.ccIceComprasNombre,
                      ccAsumeRetCodigo: empresaActual.ccAsumeRetCodigo,
                      ccAsumeRetNombre: empresaActual.ccAsumeRetNombre,
                      ccIvaVentasCodigo: empresaActual.ccIvaVentasCodigo,
                      ccIvaVentasNombre: empresaActual.ccIvaVentasNombre,
                      ccIceVentasCodigo: empresaActual.ccIceVentasCodigo,
                      ccIceVentasNombre: empresaActual.ccIceVentasNombre,
                      ccPropinaVentasCodigo:
                        empresaActual.ccPropinaVentasCodigo,
                      ccPropinaVentasNombre:
                        empresaActual.ccPropinaVentasNombre,
                      ccInteresVentasCodigo:
                        empresaActual.ccInteresVentasCodigo,
                      ccInteresVentasNombre:
                        empresaActual.ccInteresVentasNombre,
                      tipoContabilizacionCajas:
                        empresaActual.tipoContabilizacionCajas,
                      tipoContabilizacionBancos:
                        empresaActual.tipoContabilizacionBancos,
                      tipoContabilizacionCompras:
                        empresaActual.tipoContabilizacionCompras,
                      tipoContabilizacionVentas:
                        empresaActual.tipoContabilizacionVentas,
                      cobrosAnticiposCodigo:
                        empresaActual.cobrosAnticiposCodigo,
                      cobrosAnticiposNombre:
                        empresaActual.cobrosAnticiposNombre,
                      cobrosCruceCodigo: empresaActual.cobrosCruceCodigo,
                      cobrosCruceNombre: empresaActual.cobrosCruceNombre,
                      cobrosRetAtrasadaCodigo:
                        empresaActual.cobrosRetAtrasadaCodigo,
                      cobrosRetAtrasadaNombre:
                        empresaActual.cobrosRetAtrasadaNombre,
                      tipoContabilidadCobros:
                        empresaActual.tipoContabilidadCobros,
                      pagosAnticiposCodigo:
                        empresaActual.pagosAnticiposCodigo,
                      pagosAnticiposNombre:
                        empresaActual.pagosAnticiposNombre,
                      pagosCruceCodigo: empresaActual.pagosCruceCodigo,
                      pagosCruceNombre: empresaActual.pagosCruceNombre,
                      tipoContabilidadPagos:
                        empresaActual.tipoContabilidadPagos,
                      cajaTransitoriaCodigo:
                        empresaActual.cajaTransitoriaCodigo,
                      cajaTransitoriaNombre:
                        empresaActual.cajaTransitoriaNombre,
                      bancosTransitoriaCodigo:
                        empresaActual.bancosTransitoriaCodigo,
                      bancosTransitoriaNombre:
                        empresaActual.bancosTransitoriaNombre,
                      vouchersComisionCodigo:
                        empresaActual.vouchersComisionCodigo,
                      vouchersComisionNombre:
                        empresaActual.vouchersComisionNombre,
                      tipoContabilizacionDepositos:
                        empresaActual.tipoContabilizacionDepositos,
                      nominaSueldoBasico:
                        empresaActual.nominaSueldoBasico,
                      tipoContabilidadNomina:
                        empresaActual.tipoContabilidadNomina,
                    }}
                  />
                )
              ) : isParametrosFacturacionSection && empresaActual ? (
                isFacturacionFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="parametros-facturacion"
                    sectionLabel="Parametros Facturacion"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <ParametrosFacturacionPanel
                    empresa={{
                      id: empresaActual.id,
                      obligarCupoCredito: empresaActual.obligarCupoCredito,
                      obligarAperturaCaja: empresaActual.obligarAperturaCaja,
                      ingresarClaveFacturadorUnaVez:
                        empresaActual.ingresarClaveFacturadorUnaVez,
                      visualizarComboVendedores:
                        empresaActual.visualizarComboVendedores,
                      controlarSaldosVencidos:
                        empresaActual.controlarSaldosVencidos,
                      verTotalSinDescuento:
                        empresaActual.verTotalSinDescuento,
                      verTotalConDescuento:
                        empresaActual.verTotalConDescuento,
                      porcentajeInteres: empresaActual.porcentajeInteres,
                      tipoDescuentoAsignado:
                        empresaActual.tipoDescuentoAsignado,
                      permitirEntregasParciales:
                        empresaActual.permitirEntregasParciales,
                      permitirServiciosGuias:
                        empresaActual.permitirServiciosGuias,
                      lotesDescontarAutomatico:
                        empresaActual.lotesDescontarAutomatico,
                      ocultarFechasControlLotes:
                        empresaActual.ocultarFechasControlLotes,
                      envioAutomaticoOffline:
                        empresaActual.envioAutomaticoOffline,
                      enviarMailCobroCliente:
                        empresaActual.enviarMailCobroCliente,
                      enviarMailPagoProveedor:
                        empresaActual.enviarMailPagoProveedor,
                      verSaldosEstadoCartera:
                        empresaActual.verSaldosEstadoCartera,
                      aprobarPagosDosPasos:
                        empresaActual.aprobarPagosDosPasos,
                      crmClientesAgrupados:
                        empresaActual.crmClientesAgrupados,
                      afectarChequesCupoCredito:
                        empresaActual.afectarChequesCupoCredito,
                      obligaSeleccionarMesas:
                        empresaActual.obligaSeleccionarMesas,
                      controlaCocina: empresaActual.controlaCocina,
                      restauranteCocina: empresaActual.restauranteCocina,
                      restauranteBar: empresaActual.restauranteBar,
                      restauranteGrill: empresaActual.restauranteGrill,
                    }}
                  />
                )
              ) : isParametrosFacturacionElectronicaSection && empresaActual ? (
                isFacturacionElectronicaFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="parametros-facturacion-electronica"
                    sectionLabel="Parametros Facturacion Electronica"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <ParametrosFacturacionElectronicaPanel
                    activeTab={facturacionElectronicaTab as
                      | "generales"
                      | "facturas"
                      | "nota-credito"
                      | "retenciones"
                      | "guia-remision"
                      | "nota-debito"
                      | "liquidacion-compras"}
                    isEditing={facturacionElectronicaEdit}
                    empresa={{
                      id: empresaActual.id,
                      feAmbiente: empresaActual.feAmbiente,
                      feTipoAutorizacion: empresaActual.feTipoAutorizacion,
                      feNumeroContribuyenteEspecial:
                        empresaActual.feNumeroContribuyenteEspecial,
                      feFechaCaducaCertificado:
                        empresaActual.feFechaCaducaCertificado,
                      feLlevaContabilidad: empresaActual.feLlevaContabilidad,
                      feTiempoEsperaAutorizacion:
                        empresaActual.feTiempoEsperaAutorizacion,
                      feTipoFirmador: empresaActual.feTipoFirmador,
                      feCorreoComprobacion:
                        empresaActual.feCorreoComprobacion,
                      feInformacionFacturas:
                        empresaActual.feInformacionFacturas,
                      feSqlFacturaTipo: empresaActual.feSqlFacturaTipo,
                      feSqlFacturaContenido:
                        empresaActual.feSqlFacturaContenido,
                      feSqlNotaCreditoContenido:
                        empresaActual.feSqlNotaCreditoContenido,
                      feSqlRetencionesContenido:
                        empresaActual.feSqlRetencionesContenido,
                      feSqlGuiaRemisionTipo:
                        empresaActual.feSqlGuiaRemisionTipo,
                      feSqlGuiaRemisionContenido:
                        empresaActual.feSqlGuiaRemisionContenido,
                      feSqlNotaDebitoContenido:
                        empresaActual.feSqlNotaDebitoContenido,
                      feSqlLiquidacionComprasContenido:
                        empresaActual.feSqlLiquidacionComprasContenido,
                    }}
                  />
                )
              ) : isVentasFacturacionSection && empresaActual ? (
                <VentasFacturacionPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasEntregasPorFacturarSection && empresaActual ? (
                <VentasEntregasPorFacturarPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasEntregasParcialesSection && empresaActual ? (
                <VentasEntregasParcialesPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasAutorizarDocumentosSection && empresaActual ? (
                <VentasAutorizarDocumentosPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                  }}
                />
              ) : isVentasClientesSection && empresaActual ? (
                <VentasClientesPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasProspectoSection && empresaActual ? (
                <VentasProspectoPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasPedidosSection && empresaActual ? (
                <VentasPedidosPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isVentasProformasSection && empresaActual ? (
                <VentasProformasPanel
                  empresa={{
                    id: empresaActual.id,
                    razonSocial: empresaActual.razonSocial,
                    ciudad: empresaActual.ciudad,
                  }}
                />
              ) : isParametrosSmtpSection && empresaActual ? (
                isSmtpFormatosFisicosView ? (
                  <FormatosFisicosPanel
                    empresaId={empresaActual.id}
                    sectionKey="parametros-smtp"
                    sectionLabel="Parametros SMTP"
                    formatos={{
                      factura: empresaActual.formatoFacturaPath,
                      retencion: empresaActual.formatoRetencionPath,
                      guiaRemision: empresaActual.formatoGuiaRemisionPath,
                      notaCredito: empresaActual.formatoNotaCreditoPath,
                    }}
                  />
                ) : (
                  <ParametrosSmtpPanel
                    isEditing={smtpEdit}
                    empresa={{
                      id: empresaActual.id,
                      smtpServidor:
                        empresaActual.smtpServidor ?? "smtp.zeptomail.com",
                      smtpUsuario: empresaActual.smtpUsuario ?? "emailapikey",
                      smtpCorreoRemitente:
                        empresaActual.smtpCorreoRemitente ??
                        "noresponder@perseo.ec",
                      smtpPuerto: empresaActual.smtpPuerto ?? "587",
                      smtpClave: empresaActual.smtpClave ?? "",
                    }}
                  />
                )
              ) : isAdministradorSucursalesSection ? (
                <SucursalesPanel
                  empresaId={empresaActual?.id}
                  geoCatalog={{
                    ciudades: Array.from(
                      new Set(
                        geoCatalogData.flatMap((provincia) =>
                          provincia.ciudades.map((ciudad) => ciudad.nombre),
                        ),
                      ),
                    ),
                    parroquiasPorCiudad: geoCatalog.parroquiasPorCiudad,
                  }}
                  sucursales={sucursalesData.map((item) => ({
                    id: item.id,
                    nombre: item.nombre,
                    tipo: item.tipo,
                    identificacion: item.identificacion,
                    razonSocial: item.razonSocial,
                    telefono1: item.telefono1,
                    telefono2: item.telefono2,
                    metaVenta: item.metaVenta,
                    comisionProduccion: item.comisionProduccion,
                    comisionDistribucion: item.comisionDistribucion,
                    parroquia: item.parroquia,
                    responsable: item.responsable,
                    ciudad: item.ciudad,
                    direccion: item.direccion,
                    activo: item.activo,
                    visible: item.visible,
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                  }))}
                />
              ) : isIntegracionesSection ? (
                <IntegracionesPanel
                  empresaId={empresaActual?.id}
                  integraciones={integracionesData.map((item) => ({
                    id: item.id,
                    descripcion: item.descripcion,
                    tipo: item.tipo,
                    servidor: item.servidor,
                    usuario: item.usuario,
                    contrasena: item.contrasena,
                    puerto: item.puerto,
                    activo: item.activo,
                  }))}
                />
              ) : isActividadesSistemaSection ? (
                <ActividadesSistemaPanel
                  actividades={actividadesSistema}
                  empresas={empresasRecientesData.map((item) => ({
                    id: item.id,
                    razonSocial: item.razonSocial,
                  }))}
                />
              ) : (
                <GestionEmpresasPanel
                  empresaId={empresaActual?.id}
                  empresas={empresasRecientesData.map((item) => ({
                    id: item.id,
                    ruc: item.ruc,
                    razonSocial: item.razonSocial,
                    direccion: item.direccion,
                    provincia: item.provincia,
                    ciudad: item.ciudad,
                    tipoNegocio: item.tipoNegocio,
                    whatsapp: item.whatsapp,
                    correo: item.correo,
                    nombreDb: item.nombreDb,
                  }))}
                />
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
