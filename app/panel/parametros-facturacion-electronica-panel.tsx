"use client";

import Link from "next/link";
import { type ReactNode, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveParametrosFacturacionElectronicaAction,
  type SaveParametrosFacturacionElectronicaState,
} from "./parametros-facturacion-electronica-actions";

type ParametrosFacturacionElectronicaPanelProps = {
  activeTab: (typeof tabs)[number]["key"];
  isEditing: boolean;
  empresa: {
    id: number;
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
  };
};

type FormValues = ParametrosFacturacionElectronicaPanelProps["empresa"];

const tabs = [
  { key: "generales", label: "Generales" },
  { key: "facturas", label: "Facturas" },
  { key: "nota-credito", label: "Nota de Credito" },
  { key: "retenciones", label: "Retenciones" },
  { key: "guia-remision", label: "Guia de Remision" },
  { key: "nota-debito", label: "Nota de Debito" },
  { key: "liquidacion-compras", label: "Liquidacion en Compras" },
] as const;

const facturaSqlOptions = [
  "SQL Estándar",
  "SQL Estándar + Observación Factura",
  "SQL Estándar Exportadoras",
  "SQL Gas y Gasolineras",
  "SQL Cambio",
  "SQL Estándar Almacenes",
  "SQL Transportistas",
  "SQL Ferreterias",
];

const guiaSqlOptions = [
  "Seleccione una Opcion",
  "SQL Email Transportista",
  "SQL Email Cliente",
] as const;

const sqlTemplates = {
  factura: `select  
forma_pago_sri.forma_pago_sri_codigo                                           				as formapago,
facturas.facturasid                                                            					as facturasid,
facturas.forma_pago_empresaid                                                   				as formapagoid,
facturas.emision                                                                					as fechaemision,
facturas.vence                                                                  					as fechavence,
facturas.fechacreacion                                                          				as fechacreacion,
facturas.autorizacionfecha                                                      				as autorizacionfecha,
facturas.autorizacionintentos                                                   				as autorizacionintentos,
facturas.establecimiento                                                        				as estable, 
facturas.puntoemision                                                           				as ptoemi,
facturas.secuencial                                     						as secuencial,
ROUND(facturas.subtotalconiva,2)              						AS subtotalconiva,
facturas.total                                           						as importetotal,
round(facturas.subtotal,2)                       						as subtotal,  
round(facturas.subtotalneto,2)                       						as totalsinimpuestos, 
round(facturas.subtotalconiva,2)+ROUND(facturas.subtotalconiva2,2)  		as baseimponible,
round(facturas.subtotalsiniva,2)              						as basesiniva,
round(facturas.subtotalnoobjetoiva,2)              					as subtotalnoobjetoiva,
round(facturas.subtotalexentoiva,2)              						as subtotalexentoiva,
round(facturas.total_iva,2)+ROUND(facturas.total_iva2,2)      			as fvalor, 
ROUND(facturas.total_iva,2)                   						AS total_iva, 
facturas.total_ice                            							as ice,
facturas.numeroautorizacion                        						as numeroautorizacion,
facturas.claveacceso                          							as claveacceso,
facturas.total_descuento                      						as totaldescuento,
facturas.propina													as propina,
productos.productocodigo                                  					as codigoprincipal,  
productos.productosid 											as productosid,		
productos.auxiliar											as codigoauxiliar,
productos.barras												as barras, 
productos.descripcion                                  						as descripcion,
productos.servicio                                       						as servicio,
productos.sri_tipos_ivas_codigo							as tipoiva,
productos.series                                         						as series,
productos.vehiculos                                     						as vehiculos,
productos.lotes,
productos.factorsuperior                      						as factorsuperior,
productos.factorinferior                      							as factorinferior,
productos.unidadinterna                       						as unidadinterna,
productos.peso_bruto                                                as peso_bruto,
                productos.peso_neto                                                 as peso_neto,
                productos.alterno1                                                  as codigoalterno,
                productos_subcategoria.descripcion as subcategoria,
                case when ciudades.ciudad<>'' then ciudades.ciudad else cs.ciudad end as ciudadcliente,
                provincias.provincia as provincia,
medidas.descripcion								as medida,
clientes.nombrecomercial                                            as nombrecomercial,
clientes.razonsocial                                       						as razonsocialcomprador, 
clientes.identificacion                                              					as identificacioncomprador, 
(case when clientes_sucursales.clientes_sucursalesid>0 then clientes_sucursales.direccion else clientes.direccion end) as direccioncomprador,
clientes.email                                            						as email, 
clientes.tipodestino                                 						as tipodestino,
facturas_detalles.cantidad                      						as cantidad,
facturas_detalles.cantidaddigitada              						as cantidad_d,
facturas_detalles.cantidadfactor                						as cantidadfactor,
facturas_detalles.precio                        						as precio, 
facturas_detalles.precioiva                     						as fdvalor,
facturas_detalles.preciovisible                 						as preciovisible,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)*(1+(facturas_detalles.iva/100))) as total_detallenetosconiva,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)) as total_detallenetossiniva,
(facturas_detalles.cantidaddigitada*(facturas_detalles.precioiva)) 				as total_detalleconiva,
(facturas_detalles.cantidad*facturas_detalles.precio) 				as total_detallesiniva,
facturas_detalles.iva                           							as tarifa, 
facturas_detalles.descuento                     						as descuento,
facturas_detalles.descuentovalor                  						as descuentovalor,
facturas_detalles.informacion                   						as detadicional,
facturas_detalles.informaciondetalle            						as detalleadicional,
secuencias.sri_documentoscodigo,
secuencias.direccionestablecimiento           						as direstablecimiento,
secuencias.telefono                           							as telestablecimiento,
secuencias.logo															as logo,
secuencias.secuenciasid,
fact.nombres                                  							as facturador, 
ven.nombres                                   							as vendedor,
3 as codigoice,
productos.ice_codigo as codigoporcentajeice,
productos.ice_porcentaje as tarifaice,
(facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)) as baseimponibleice,
(((facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)))*(productos.ice_porcentaje/100)) as total_ice,
(productos.ice_valor*facturas_detalles.cantidad-(productos.ice_valor*facturas_detalles.cantidad*(facturas_detalles.descuento/100))) as total_ice_valor,                
clientes.tipoidentificacion                   							as tipoide,
concat(clientes.telefono1,'-',clientes.telefono2,'-',clientes.telefono3) as numcliente,
secuencias.tiporegimen,
secuencias.agentederetencion,
ROUND(facturas.subtotalconiva2,2) as subtotalconiva2,
ROUND(facturas.total_iva2,2) as total_iva2,
facturas.observacion as observacion,
facturas.placa,			
concat('vendedor : ',ven.nombres)            						as infoadicional1,
concat('correo : ',clientes.email)            						as infoadicional2,
concat('ciudad : ',case when ciudades.ciudad<>'' then ciudades.ciudad else cs.ciudad end) as infoadicional3,
case    when clientes.direccionreferencia<>'' then concat('referencia : ',clientes.direccionreferencia) else '' end  as infoadicional4,
''                                                      as infoadicional5,
''                                                      as infoadicional6,
''                                                      as infoadicional7,
''                                                      as infoadicional8,
''                                                      as infoadicional9, 
''                                                      as infoadicional10   
from 
provincias,
productos_subcategoria,
secuencias,
productos, 
medidas,
facturas_detalles, 
forma_pago_sri,
facturadores fact,
facturadores ven,
(
ciudades
right outer join
(
clientes
inner join 

facturas on facturas.clientesid = clientes.clientesid
left outer join
clientes_sucursales
on clientes_sucursales.clientes_sucursalesid = facturas.clientes_sucursalesid


and  clientes_sucursales.clientesid = clientes.clientesid
)
on clientes_sucursales.ciudadesid = ciudades.ciudadesid
)
left outer join
ciudades cs
on clientes.ciudadesid = cs.ciudadesid
where 
forma_pago_sri.forma_pago_sri_codigo = facturas.forma_pago_sri_codigo
and  secuencias.secuenciasid=facturas.secuenciasid
and  facturas.facturasid = facturas_detalles.facturasid
and  fact.facturadoresid = facturas.facturadoresid 
and  ven.facturadoresid = facturas.vendedoresid 
and  medidas.medidasid = facturas_detalles.medidasid 
and  productos.productosid = facturas_detalles.productosid
and  productos.productos_subcategoriasid=productos_subcategoria.productos_subcategoriasid
and  clientes.provinciasid=provincias.provinciasid
and	facturas.anulado = 0
AND	facturas_detalles.compuestoid = 0
and  secuencias.sri_documentoscodigo IN ('01','41')
and 	facturas.facturasid=%1
order by
facturas_detalles.facturas_detallesid`,
  notaCredito: `select 	
forma_pago_sri.forma_pago_sri_codigo    				                                                               as formapago,
facturas.forma_pago_empresaid    				                                                                               as formapagoid,
facturas.relaciondocumentoid					                                                               as iddesustento,
facturas.facturasid					                                                                                               as facturasid,
facturas.emision 	   									               as fechaemision,
facturas.autorizacionfecha										as autorizacionfecha,
facturas.fechacreacion				                                                                                               as fechacreacion,
facturas.puntoemision 				                                                                                               as ptoemi,	
facturas.establecimiento 			                                                                                                               as establecimiento,	
facturas.secuencial 				                                                                                               as secuencial,	
productos.productocodigo                                 							as codigoprincipal,  
productos.productosid 											as productosid,		
productos.auxiliar											as codigoauxiliar,
productos.barras												as barras,
productos.descripcion 				                                                                                               as descripcion,
productos.series					                                                                                               as series,
productos.vehiculos				                                                                                               as vehiculos,
productos.lotes,
clientes.nombrecomercial                                            as nombrecomercial,	
clientes.razonsocial 					                                                                               as razonsocialcomprador,	
clientes.identificacion 					                                                                               as identificacioncomprador,	
(case when clientes_sucursales.clientes_sucursalesid>0 then clientes_sucursales.direccion else clientes.direccion end) as direccioncomprador,
clientes.email					                                                                                               as email,
medidas.descripcioncorta			                                                                                                               as medida,
ROUND(facturas.subtotalconiva,2)                                          AS subtotalconiva,	
facturas.total 					                                                                                               as importetotal,	
round(facturas.subtotal	,2)			                                                                                               as subtotal,
round(facturas.subtotalneto,2)                                                                                                                                        as totalsinimpuestos, 	
round(facturas.subtotalconiva,2)+ROUND(facturas.subtotalconiva2,2)                                          as baseimponible,	
round(facturas.subtotalsiniva,2)			                                                                                               as basesiniva,
round(facturas.total_descuento,2)			                                                                                               as totaldescuento,	
round(facturas.subtotalnoobjetoiva,2)              								as subtotalnoobjetoiva,
round(facturas.subtotalexentoiva,2)              									as subtotalexentoiva,
facturas_detalles.cantidad 				                                                                                               as cantidad,
facturas_detalles.cantidaddigitada 			                                                                                               as cantidad_d,
facturas_detalles.cantidadfactor				                                                                               as cantidadfactor,
productos.servicio					                                                                                               as servicio,
productos.sri_tipos_ivas_codigo							as tipoiva,
facturas_detalles.precio 				                                                                                               as precio,	
facturas_detalles.precioiva 				                                                                                               as fdvalor,	
round(facturas.total_iva,2)+ROUND(facturas.total_iva2,2)                                     as fvalor,	
ROUND(facturas.total_iva,2)                                     AS total_iva,	
facturas_detalles.iva 				                                                                                               as tarifa,
facturas.total_ice					                                                                                               as ice,
facturas_detalles.descuento 				                                                                               as descuento,
facturas_detalles.descuentovalor                  						as descuentovalor,
facturas_detalles.informacion				                                                                               as detadicional,
facturas_detalles.informaciondetalle			                                                                                               as detalleadicional,
facturas.numeroautorizacion				                                                                               as numeroautorizacion,
facturas.claveacceso				                                                                                               as claveacceso,
facturas.propina												as propina,
3 as codigoice,
productos.ice_codigo as codigoporcentajeice,
productos.ice_porcentaje as tarifaice,
(facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)) as baseimponibleice,
(((facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)))*(productos.ice_porcentaje/100)) as total_ice,
(productos.ice_valor*facturas_detalles.cantidad-(productos.ice_valor*facturas_detalles.cantidad*(facturas_detalles.descuento/100))) as total_ice_valor,                
productos.factorsuperior			                                                                                                               as factorsuperior,
productos.factorinferior				                                                                                               as factorinferior,
facturas_detalles.preciovisible				                                                                               as preciovisible,
productos.unidadinterna					                                                                               as unidadinterna,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)*(1+(facturas_detalles.iva/100))) as total_detallenetosconiva,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)) as total_detallenetossiniva,
(facturas_detalles.cantidaddigitada*(facturas_detalles.precioiva)) 				as total_detalleconiva,
(facturas_detalles.cantidad*(facturas_detalles.precio)) 				as total_detallesiniva,
concat(facturas.relacionestablecimiento,'-',facturas.relacionpuentoemision,'-',facturas.relacionsecuencia)          as numdocmodificado,
facturas.relacionemision                                                                                                                                                      as  fechaemisiondocsustento,
facturas.concepto                                                                                                                                                                 as  razon,
secuencias.sri_documentoscodigo,
secuencias.direccionestablecimiento			                                                                                                as direstablecimiento,
secuencias.telefono				                                                                                                as telestablecimiento,
secuencias.logo															as logo,
secuencias.secuenciasid,
clientes.tipoidentificacion                                                                                                                                                    as tipoide,
fact.nombres					                                                                                                as facturador,  
concat(clientes.telefono1,'-',clientes.telefono2,'-',clientes.telefono3) 	                                                                as numcliente,
secuencias.tiporegimen,
secuencias.agentederetencion,
ROUND(facturas.subtotalconiva2,2) as subtotalconiva2,
ROUND(facturas.total_iva2,2) as total_iva2,	
facturas.observacion as observacion,
facturas.placa,
concat('vendedor : ',facturadores.nombres) 		                             as infoadicional1,
concat('correo : ',clientes.email)			                                                  as infoadicional2,
concat('ciudad : ',case when cs.ciudad<>'' then cs.ciudad else ciudades.ciudad end)			as infoadicional3,
''						as infoadicional4,
''						as infoadicional5,
''						as infoadicional6,
''						as infoadicional7,
''						as infoadicional8,
''						as infoadicional9,	
''						as infoadicional10
from
secuencias,
facturadores,
productos,	
facturas_detalles,	
medidas,	
forma_pago_sri,
facturadores fact,	
(
ciudades
right outer join
(
clientes
inner join 

facturas on facturas.clientesid = clientes.clientesid
left outer join
clientes_sucursales
on clientes_sucursales.clientes_sucursalesid = facturas.clientes_sucursalesid
and  clientes_sucursales.clientesid = clientes.clientesid
)
on clientes_sucursales.ciudadesid = ciudades.ciudadesid
)
left outer join
ciudades cs
on clientes.ciudadesid = cs.ciudadesid	
where 
forma_pago_sri.forma_pago_sri_codigo = facturas.forma_pago_sri_codigo
and		secuencias.secuenciasid=facturas.secuenciasid
and		fact.facturadoresid = facturas.facturadoresid
and		facturas.vendedoresid = facturadores.facturadoresid
and		facturas.facturasid = facturas_detalles.facturasid
and		medidas.medidasid = facturas_detalles.medidasid
and		productos.productosid = facturas_detalles.productosid
and 	secuencias.sri_documentoscodigo IN ('04','372')
and		facturas.anulado = 0
AND		facturas_detalles.compuestoid = 0
and 	facturas.facturasid=%1
order by
facturas_detalles.facturas_detallesid`,
  retenciones: `SELECT
compras.comprasid,
secuencias.secuenciasid,
proveedores.razonsocial 								AS razonsocialcomprador,
proveedores.identificacion 								AS identificacioncomprador,
proveedores.direccion 								AS direccioncomprador,
proveedores.tipoidentificacion							AS tipoide,
proveedores.email									AS email,
proveedores.sri_tipo_proveedor AS tiposujetoretenido,
(CASE WHEN proveedores.sri_relacionado=1 THEN 'SI' ELSE 'NO' END)  AS parterel,
compras.sri_documentoscodigo							AS tipo,
compras.sri_sustentoscodigo AS docsustento,
compras.sri_documentoscodigo							AS coddocdustento,
CONCAT(compras.establecimiento,compras.puntoemision,compras.secuencia) AS numdocsustento,
compras.establecimiento								AS estabc,
compras.puntoemision								AS pemic,
compras.secuencia								AS secuenciac,
compras.emision                         							AS fechaemisiondocsustento,
compras.fechacontable 												AS fecharegistrocontable,
compras.autorizacion 										AS numautdocsustento,
compras.subtotalneto AS totalsinImpuestos,
compras.total_neto                                           						AS importetotal,
compras.forma_pago_sri_codigo AS forma_pago_sri_codigo,
compras.pagoresidente AS pagolocext,
compras.pagoregimenexterior AS tiporegi,
compras.pagopais_pago AS paisefecpago,
compras.pagoaplicaconvenio AS aplicconvdobtrib,
compras.pagoexteriorsujetoretencion AS pagextsujretnorleg,
'SI'AS pagoregfis,
compras.emision AS fechapagodiv,
compras.retencionemision								AS fechaemision,
compras.retencionestablecimiento 							AS estab,
compras.retencionpuntoemision 							AS ptoemi,
compras.retencionsecuencia 							AS secuencial,
compras.retencionautorizacion							AS autorizacion,
compras.claveacceso								AS claveacceso,
compras.autorizacionfecha						AS autorizacionfecha,
compras.autorizacionintentos					AS autorizacionintentos,
compras_retenciones.baseimponible 				as baseimponible,
compras_retenciones.porcentaje 							AS porcentajeretener,
compras_retenciones.valor 								AS valorretenido,
sri_impuestos.sri_codigo_impuestos 						AS codigoretencion,
sri_impuestos.sri_codigo_impuestos						AS impuesto,
compras_retenciones.tipo								AS tipoimpuestocompras,
sri_impuestos.tipo 								AS tipoimpuesto,
ROUND(compras.subtotalconiva,2)             							AS subtotalconiva,
ROUND(compras.subtotalconiva,2)+ROUND(compras.subtotalconiva2,2)		AS baseimponibledoc,
ROUND(compras.subtotalsiniva,2)              							AS basesiniva,
ROUND(compras.subtotalnoobjetoiva,2)              						AS subtotalnoobjetoiva,
ROUND(compras.subtotalexentoiva,2)             							AS subtotalexentoiva,
secuencias.direccionestablecimiento							AS direstablecimiento,
secuencias.telefono								AS telestablecimiento,
secuencias.logo															AS logo,
(SELECT SUM(DISTINCT compras_detalles.iva) FROM compras_detalles WHERE compras_detalles.comprasid=compras.comprasid) AS tarifa,
compras.total_iva,
compras.total_ice,
secuencias.tiporegimen,
secuencias.agentederetencion,
ROUND(compras.subtotalconiva2,2) AS subtotalconiva2,
ROUND(compras.total_iva2,2) AS total_iva2,	
CONCAT('proveedor : ',proveedores.razonsocial) 		AS infoadicional1,
CONCAT('correo : ',proveedores.email)			AS infoadicional2,
''							AS infoadicional3,
''							AS infoadicional4,
''							AS infoadicional5,
''							AS infoadicional6,
''							AS infoadicional7,
''							AS infoadicional8,
''							AS infoadicional9,	
''							AS infoadicional10
FROM
sri_impuestos,
compras,
secuencias,
compras_retenciones,
proveedores
WHERE
compras.comprasid = compras_retenciones.comprasid
AND compras.proveedoresid = proveedores.proveedoresid
AND compras.secuenciasid_retencion = secuencias.secuenciasid
AND compras_retenciones.sri_impuestosid = sri_impuestos.sri_impuestosid
AND compras_retenciones.anulado=0
AND secuencias.sri_documentoscodigo = '07'
AND CONCAT(compras.secuenciasid_retencion,compras.retencionsecuencia) ='%1'`,
  guiaRemision: `select 
guias_remision_documentos.nombres			                                                                as nombres,	
guias_remision_documentos.direccion			                                                                as direccion,	
guias_remision_documentos.identificacion			                                                                as identificacion,	
guias_remision_documentos.origen			                                                                                as origen,	
guias_remision_documentos.tipodocumento			                                                                as tipodocumentosustento,	
guias_remision_documentos.fechaemision			                                                                as fechaemision,
concat(guias_remision_documentos.establecimiento,'-',guias_remision_documentos.puntoemision,'-',guias_remision_documentos.secuencial) as numdocsustento,	
guias_remision_documentos.numeroautorizacion			                                               as numeroautorizacion,	
guias_remision_documentos.secuencial			                                                               as secuencial,	
guias_remision_documentos.puntoemision			                                                               as puntoemision,	
guias_remision_documentos.establecimiento			                                                               as establecimiento,	
guias_remision_documentos.motivo			                                                                               as motivo,	
transportistas.nombres			                                                                                               as razonsocialtransportista,	
transportistas.direccion			                                                                                               as direccion_tr,
transportistas.identificacion			                                                                               as identificacion_transportista,	
transportistas.tipoidentificacion			                                                                               as tipoidentificacion,
transportistas.llevacontabilidad			                                                                               as llevacontabilidad,
transportistas.placa 					                                                               as placa_transportista,	
transportistas.vehiculo 					                                                               as vehiculo,	
transportistas.observacion 					                                                               as observacion,
guias_remision.fechahorallegada			                                                                               as fechahorallegada,	
guias_remision.fechahorasalida			                                                                               as fechahorasalida,	
guias_remision_detalles.cantidad			                                                                               as cantidaddigitada,	
guias_remision_documentos.documentosid			                                                               as documentosid,	
guias_remision.autorizacionfecha			                                                                               as autorizacionfecha,
guias_remision.guias_remisionid			                                                                               as guias_remisionid,	
guias_remision.secuenciasid			                                                                               as secuenciasid,	
guias_remision.puntoemision			                                                                               as puntoemiguia,	
guias_remision.establecimiento                                                                                                                         as estableguia,	
guias_remision.secuencial			                                                                                               as secuencialguia,	
guias_remision.autorizacion                                                                                                                               as autorizacion,
guias_remision.placa as placa,	
(case when guias_remision.email='' then transportistas.email else guias_remision.email end)            as email,	
transportistas.telefono 					                                                              as telefono,
productos.productocodigo 					                                                              as codigoprincipal,	
productos.productosid 											as productosid,		
productos.productocodigo											as codigoauxiliar,
productos.barras												as barras,
productos.descripcion 					                                                              as producto,
productos.series						                                                              as series,
productos.vehiculos					                                                              as vehiculos,
productos.lotes,
productos.servicio						                                                              as servicio,
productos.unidadinterna					                                                              as unidadinterna,
guias_remision.claveacceso 				                                                                              as claveacceso,	
transportistas.placa					                                                              as placa,
guias_remision.fechahorallegada 				                                                              as fechahorallegada,	
guias_remision.fechahorasalida 				                                                              as fechahorasalida,	
secuencias.sri_documentoscodigo					                                              as tipodocumento,
secuencias.direccionestablecimiento				                                                              as direstablecimiento,
secuencias.telefono      					                                                              as telestablecimiento,
secuencias.logo															as logo,
secuencias.secuenciasid,	
guias_remision.direccionpartida 					                                              as direccionpartida,
guias_remision.direccionllegada 					                                              as direccionllegada,
guias_remision.ruta																				as ruta,
secuencias.tiporegimen,
secuencias.agentederetencion,
concat('info 1 : ',guias_remision.infadicional1)			as infoadicional1,
concat('info 2 : ',guias_remision.infadicional2)			as infoadicional2,
''								as infoadicional3,
''								as infoadicional4,
''								as infoadicional5,
''								as infoadicional6,
''								as infoadicional7,
''								as infoadicional8,
''								as infoadicional9,	
''								as infoadicional10
from 
secuencias,
transportistas,	
guias_remision,	
guias_remision_documentos,	
guias_remision_detalles,	
productos
where 
productos.productosid = guias_remision_detalles.productosid

and		guias_remision_detalles.guias_remisionid = guias_remision.guias_remisionid
and		guias_remision.guias_remisionid = guias_remision_documentos.guias_remisionid
and		transportistas.transportistasid = guias_remision.transportistasid
and		secuencias.secuenciasid=guias_remision.secuenciasid
and 	                secuencias.sri_documentoscodigo = '06'
and  	                guias_remision.guias_remisionid =  %1
group by productos.productosid
ORDER BY
guias_remision_detalles.guias_remision_detallesid`,
  notaDebito: `select 	
forma_pago_sri.forma_pago_sri_codigo 			                                                                        as formapago,
facturas.forma_pago_sri_codigo    			                                                                                        as formapagoid,
facturas.relaciondocumentoid					                                                        as iddesustento,	
facturas.emision 					                                                                                        as fechaemision,
facturas.facturasid					                                                                                        as facturaid,
facturas.fechacreacion				                                                                                        as fechacreacion,	
facturas.establecimiento 			                                                                                                       as estab,	
facturas.secuencial 									       as secuencial,								
facturas.autorizacionfecha				                                                                                       as autorizacionfecha, 	
productos.productosid 											as productosid,		
productos.auxiliar											as codigoauxiliar,
productos.barras												as barras,
productos.productocodigo                                                                              as codigoprincipal,
productos.descripcion 				                                                                                       as descripcion,
productos.servicio					                                                                                       as servicio,
productos.sri_tipos_ivas_codigo							as tipoiva,
productos.series					                                                                                       as series,
productos.vehiculos				                                                                                       as vehiculos,
productos.lotes,
clientes.nombrecomercial                                            as nombrecomercial,
clientes.razonsocial 					                                                                       as razonsocialcomprador,	
clientes.identificacion 					                                                                       as identificacioncomprador,	
(case when clientes_sucursales.clientes_sucursalesid>0 then clientes_sucursales.direccion else clientes.direccion end) as direccioncomprador,
clientes.email					                                                                                      as email,
facturas.total 					                                                                                      as importetotal,
ROUND(facturas.subtotalconiva,2)			                            AS subtotalconiva,
medidas.descripcioncorta		                                                                                                                      as medida,	
round(facturas.subtotal	,2)			                                                                                      as subtotal,
round(facturas.subtotalneto,2)                                                                                                                               as totalsinimpuestos, 	
round(facturas.subtotalconiva,2)+ROUND(facturas.subtotalconiva2,2)			                            as baseimponible,	
round(facturas.subtotalsiniva,2)			                                                                                      as basesiniva,
round(facturas.total_descuento,2)			                                                                                      as totaldescuento,		
round(facturas.subtotalnoobjetoiva,2)              								as subtotalnoobjetoiva,
round(facturas.subtotalexentoiva,2)              									as subtotalexentoiva,
facturas_detalles.cantidad 				                                                                                      as cantidad,
facturas_detalles.cantidaddigitada 		                                                                                                      as cantidad_d,
facturas_detalles.cantidadfactor				                                                                      as cantidadfactor,
facturas.puntoemision 	                                                                                   as ptoemi,	
facturas_detalles.precio 				                                                                                      as precio,
productos.factorsuperior                                                                                                                                           as factorsuperior,
productos.factorinferior                                                                                                                                             as factorinferior,
facturas_detalles.preciovisible                                                                                                                                   as preciovisible,
(facturas_detalles.cantidad*(1+(facturas_detalles.iva/100))*(facturas_detalles.precio-((facturas_detalles.precio*facturas_detalles.descuento)/100))) as total_detalleconiva,
(facturas_detalles.cantidad*(facturas_detalles.precio-((facturas_detalles.precio*facturas_detalles.descuento)/100))) as total_detalle,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)*(1+(facturas_detalles.iva/100))) as total_detallenetosconiva,
(facturas_detalles.cantidad*(facturas_detalles.precio-facturas_detalles.descuentovalor)) as total_detallenetossiniva,
facturas_detalles.precioiva 				                                                                                     as fdvalor,	
round(facturas.total_iva,2)					                        as total_iva,
ROUND(facturas.total_iva,2)+ROUND(facturas.total_iva2,2)					                        AS fvalor,	
facturas_detalles.iva 				                                                                                     as tarifa,
facturas.total_ice					                                                                                     as ice,
facturas_detalles.descuento 				                                                                     as descuento,
facturas_detalles.descuentovalor                  						as descuentovalor,
facturas_detalles.informacion				                                                                     as detadicional,
facturas_detalles.informaciondetalle		                                                                                                     as detalleadicional,
facturas.numeroautorizacion				                                                                     as numeroautorizacion,
facturas.claveacceso				                                                                                     as claveacceso,
concat(facturas.relacionestablecimiento,'-',facturas.relacionpuentoemision,'-',facturas.relacionsecuencia)         as numdocmodificado,
facturas.relacionemision                                                                                                                                           as  fechaemisiondocsustento,
facturas.concepto                                                                                                                                                      as  razon,
facturas.propina																								as propina,
secuencias.sri_documentoscodigo,
secuencias.direccionestablecimiento	                                                                                                                    as direstablecimiento,
secuencias.telefono				                                                                                    as telestablecimiento,
secuencias.logo															as logo,
secuencias.secuenciasid,
3 as codigoice,
productos.ice_codigo as codigoporcentajeice,
productos.ice_porcentaje as tarifaice,
Round(facturas.subtotalconiva,2) AS subtotalconiva,
Round(facturas.total_iva,2)	as total_iva,
ROUND(facturas.subtotalconiva2,2) as subtotalconiva2,
ROUND(facturas.total_iva2,2) as total_iva2,
facturas.observacion as observacion,
(facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)) as baseimponibleice,
(((facturas_detalles.precio*facturas_detalles.cantidad)-(facturas_detalles.precio*facturas_detalles.cantidad*(facturas_detalles.descuento/100)))*(productos.ice_porcentaje/100)) as total_ice,
(productos.ice_valor*facturas_detalles.cantidad-(productos.ice_valor*facturas_detalles.cantidad*(facturas_detalles.descuento/100))) as total_ice_valor,                
clientes.tipoidentificacion                                                                                                                                       as tipoide,
fact.nombres					                                                                                   as facturador,  
concat(clientes.telefono1,'-',clientes.telefono2,'-',clientes.telefono3) 	                                                   as numcliente,
secuencias.tiporegimen,
secuencias.agentederetencion,
facturas.placa,
concat('vendedor : ',facturadores.nombres) 		as infoadicional1,
concat('correo : ',clientes.email)			as infoadicional2,
concat('ciudad : ',ciudades.ciudad)			as infoadicional3,
''						as infoadicional4,
''						as infoadicional5,
''						as infoadicional6,
''						as infoadicional7,
''						as infoadicional8,
''						as infoadicional9,	
''						as infoadicional10
from
secuencias,
facturadores,
productos,	
facturas_detalles,	
medidas,	
(
ciudades
right outer join
(
clientes
inner join
facturas on facturas.clientesid = clientes.clientesid
left outer join
clientes_sucursales
on clientes_sucursales.clientes_sucursalesid = facturas.clientes_sucursalesid
and  clientes_sucursales.clientesid = clientes.clientesid
)
on clientes_sucursales.ciudadesid = ciudades.ciudadesid
)
left outer join
ciudades cs
on clientes.ciudadesid = cs.ciudadesid,
forma_pago_sri,
facturadores fact
where 
forma_pago_sri.forma_pago_sri_codigo = facturas.forma_pago_sri_codigo

and		secuencias.secuenciasid=facturas.secuenciasid
and		fact.facturadoresid = facturas.facturadoresid
and		facturas.vendedoresid = facturadores.facturadoresid
and		clientes.clientesid = facturas.clientesid
and		facturas.facturasid = facturas_detalles.facturasid
and		medidas.medidasid = facturas_detalles.medidasid
and		productos.productosid = facturas_detalles.productosid
and 	secuencias.sri_documentoscodigo= '05'
and		facturas.anulado = 0
AND		facturas_detalles.compuestoid = 0
and 		facturas.facturasid='%1'
order by
facturas_detalles.facturas_detallesid`,
  liquidacionCompras: `select
compras.comprasid                                                                                                                                                                           as comprasid,
compras.sri_documentoscodigo                                                                                                                                                     as codigodocumento,
compras.establecimiento                                                                                                                                                                 as establecimiento,
compras.puntoemision                                                                                                                                                                    as puntoemision,
compras.secuencia                                                                                                                                                                           as secuencia,
compras.emision                                                                                                                                                                              as fechaemision,
compras.vence                                                                                                                                                                                  as fechavence,
compras.autorizacion as numeroautorizacion,
compras.liq_claveacceso								as claveacceso,
compras.liq_fechaautorizacion						as autorizacionfecha,
compras.liq_autorizacionintentos					as autorizacionintentos,
proveedores.tipoidentificacion                                                                                                                                                      as tipoide,
proveedores.razonsocial                                                                                                                                                                 as razonsocialproveedor,
proveedores.identificacion                                                                                                                                                             as identificacionproveedor,
proveedores.direccion                                                                                                                                                                     as direccionproveedor,
round(compras.subtotalneto,2)                                                                                                                                                   as totalsinimpuestos,
round(compras.total_descuento,2)                                                                                                                                              as totaldescuento,
round(compras.subtotal,2)                       								           as subtotal,  
round(compras.subtotalconiva,2)              								           as subtotalconiva,
ROUND(compras.subtotalconiva,2)+ROUND(compras.subtotalconiva2,2) 	           AS baseimponible,
round(compras.subtotalsiniva,2)              								           as basesiniva,
round(compras.subtotalnoobjetoiva,2)              							           as subtotalnoobjetoiva,
round(compras.subtotalexentoiva,2)              								           as subtotalexentoiva,
round(compras.total_ice,2)                                                                                       as totalice,
round(compras.total_iva,2)                                                     as total_iva,
ROUND(compras.total_iva,2)+ROUND(compras.total_iva2,2)                                AS totaliva,
round(compras.total,2)                                                                                                 as importetotal,
productos.productosid 									                          as codigoprincipal,		
Case when productos.venta=0 then productos.cuentacontable_inventarios else productos.productocodigo end          as codigoauxiliar,	
productos.descripcion 										          as descripcion,
productos.servicio											          as servicio,
productos.series											          as series,
productos.vehiculos										          as vehiculos,
productos.lotes,
productos.unidadinterna										          as unidadinterna,
productos.factorsuperior										          as factorsuperior,
productos.factorinferior										          as factorinferior,
productos.subsidio 										          as subsidio,
productos.sri_tipos_ivas_codigo							as tipoiva,
compras_detalles.cantidadfactor									          as cantidadfactor,
compras_detalles.informacion									                                          as detadicional,
compras_detalles.informaciondetalle								 	                                          as detalleadicional,
compras_detalles.cantidad 										          as cantidad,
compras_detalles.cantidaddigitada 								                          as cantidad_d,
compras_detalles.costo 										          as precio,
compras_detalles.costoneto										          as precioneto,
(compras_detalles.cantidad*(compras_detalles.costo-compras_detalles.descuentovalor)*(1+(compras_detalles.iva/100))) as total_detallenetosconiva,
(compras_detalles.cantidad*(compras_detalles.costo-compras_detalles.descuentovalor))                                                      as total_detallenetossiniva,
(compras_detalles.cantidad*compras_detalles.costo*(1+(compras_detalles.iva/100))) 				           as total_detalleconiva,
(compras_detalles.cantidad*(compras_detalles.costo)) 				                                                           as total_detallesiniva,
compras_detalles.iva 									                           as tarifa,	
compras_detalles.descuento 									           as descuento,
compras_detalles.informacion                   						AS detAdicional,
compras_detalles.informaciondetalle            						AS DetalleAdicional,
compras_detalles.descuentovalor                                                                                                                                                  as descuentovalor,
secuencias.sri_documentoscodigo                                                                                                                                                as sri_codigo_impuestosliquidacion,
secuencias.direccionestablecimiento									          as direstablecimientoliquidacion,
secuencias.telefono										          as telestablecimientoliquidacion,
secuencias.logo															as logo,
secuencias.secuenciasid,
secuencias.tiporegimen,
secuencias.agentederetencion,
ROUND(compras.subtotalconiva2,2) AS subtotalconiva2,
ROUND(compras.total_iva2,2) AS total_iva2,
concat(proveedores.telefono1,'-',proveedores.telefono2)                                                                                                      as numproveedor,
concat('proveedor : ',proveedores.razonsocial) 		                                                                                          as infoadicional1,
concat('correo : ',proveedores.email)			                                                                                          as infoadicional2,
''                                   as infoadicional3,
''	                                                                                                                                                                                          as infoadicional4,
''   				                as infoadicional5,
''					as infoadicional6,
''					as infoadicional7,
''					as infoadicional8,
''					as infoadicional9,	
''					as infoadicional10


from
compras,
compras_detalles,
proveedores,
productos,
secuencias
where
compras.comprasid=compras_detalles.comprasid
and compras.proveedoresid=proveedores.proveedoresid
and compras_detalles.productosid=productos.productosid
and compras.secuenciasid_liquidacion=secuencias.secuenciasid
and secuencias.sri_documentoscodigo='03'
and compras.comprasid=%1`,
} as const;

export function ParametrosFacturacionElectronicaPanel({
  activeTab,
  isEditing,
  empresa,
}: ParametrosFacturacionElectronicaPanelProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(empresa),
  );
  const [state, formAction] = useActionState<
    SaveParametrosFacturacionElectronicaState,
    FormData
  >(saveParametrosFacturacionElectronicaAction, {
    error: null,
    success: null,
  });

  useEffect(() => {
    setValues(buildInitialValues(empresa));
  }, [empresa]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  const fieldClassName = isEditing
    ? "h-8 w-full border border-[#c8d4e3] bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "h-8 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-2 text-sm text-slate-500";

  const textAreaClassName = isEditing
    ? "min-h-[560px] w-full resize-none border border-[#c8d4e3] bg-white p-3 font-mono text-[14px] text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "min-h-[560px] w-full cursor-not-allowed resize-none border border-slate-200 bg-slate-100 p-3 font-mono text-[14px] text-slate-500";

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <form action={formAction}>
        <input type="hidden" name="empresaId" value={empresa.id} />

        <div className="flex flex-wrap items-center gap-2 pb-4">
          <SaveToolbarButton enabled={isEditing} />
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion-electronica&tab=${activeTab}&edit=1`}
            className="inline-flex items-center rounded-sm bg-[#60b95c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#50a64c]"
          >
            Modificar
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion-electronica`}
            className="inline-flex items-center rounded-sm bg-[#30404d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24323d]"
          >
            Menu
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion-electronica&vista=formatos-fisicos`}
            className="inline-flex items-center rounded-sm bg-[#f49b16] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e18b0d]"
          >
            Cargar Formatos Fisicos
          </Link>
        </div>

        {state.error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            isEditing
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <span>
            {isEditing
              ? "Modo edicion activo. Ya puedes cambiar parametros de facturacion electronica y guardar."
              : "Modo lectura. Pulsa Modificar para habilitar los campos y el boton Guardar."}
          </span>
          <button
            type="button"
            onClick={() => setShowHelp((current) => !current)}
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Tutoriales
          </button>
        </div>

        {showHelp ? (
          <div className="mb-5 rounded-xl border border-[#d7e6f7] bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
            Esta pantalla concentra la configuracion base del ambiente
            electronico y las plantillas SQL usadas para cada comprobante.
          </div>
        ) : null}

        <div className="overflow-hidden border border-slate-300">
          <div className="flex flex-wrap border-b border-slate-300 bg-white">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <Link
                  key={tab.key}
                  href={`/panel?empresaId=${empresa.id}&seccion=parametros-facturacion-electronica&tab=${tab.key}${isEditing ? "&edit=1" : ""}`}
                  className={`border-r border-slate-300 px-4 py-2 text-[15px] transition ${
                    isActive
                      ? "bg-[#dfe7ec] text-slate-900"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="min-h-[650px] bg-white p-6">
            {activeTab === "generales" ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
                <div className="space-y-5">
                  <FormRow label="Ambiente">
                    <select
                      name="feAmbiente"
                      value={values.feAmbiente}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("feAmbiente", event.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="Pruebas">Pruebas</option>
                      <option value="Produccion">Produccion</option>
                    </select>
                  </FormRow>

                  <FormRow label="Tipo Autorizacion">
                    <select
                      name="feTipoAutorizacion"
                      value={values.feTipoAutorizacion}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("feTipoAutorizacion", event.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="Autorizacion Offline">
                        Autorizacion Offline
                      </option>
                      <option value="Autorizacion Online">
                        Autorizacion Online
                      </option>
                    </select>
                  </FormRow>

                  <FormRow label="Numero Contribuyente Especial">
                    <input
                      name="feNumeroContribuyenteEspecial"
                      value={values.feNumeroContribuyenteEspecial}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField(
                          "feNumeroContribuyenteEspecial",
                          event.target.value,
                        )
                      }
                      className={fieldClassName}
                    />
                  </FormRow>

                  <FormRow label="Fecha Caduca Certificado">
                    <input
                      name="feFechaCaducaCertificado"
                      type="date"
                      value={values.feFechaCaducaCertificado}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField(
                          "feFechaCaducaCertificado",
                          event.target.value,
                        )
                      }
                      className={fieldClassName}
                    />
                  </FormRow>

                  <div className="pt-5" />

                  <FormRow label="Lleva Contabilidad">
                    <select
                      name="feLlevaContabilidad"
                      value={values.feLlevaContabilidad}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("feLlevaContabilidad", event.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </FormRow>

                  <div className="pt-5" />

                  <FormRow label="Tiempo de espera Autorizacion">
                    <select
                      name="feTiempoEsperaAutorizacion"
                      value={values.feTiempoEsperaAutorizacion}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField(
                          "feTiempoEsperaAutorizacion",
                          event.target.value,
                        )
                      }
                      className={fieldClassName}
                    >
                      <option value="3s">3s</option>
                      <option value="5s">5s</option>
                      <option value="10s">10s</option>
                    </select>
                  </FormRow>

                  <FormRow label="Tipo Firmador">
                    <select
                      name="feTipoFirmador"
                      value={values.feTipoFirmador}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("feTipoFirmador", event.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="Net">Net</option>
                      <option value="Java">Java</option>
                    </select>
                  </FormRow>

                  <div className="pt-5" />

                  <FormRow label="Correo Comprobacion" wide>
                    <input
                      name="feCorreoComprobacion"
                      value={values.feCorreoComprobacion}
                      disabled={!isEditing}
                      onChange={(event) =>
                        updateField("feCorreoComprobacion", event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </FormRow>

                  <div className="space-y-2">
                    <label className="text-[15px] text-slate-700">
                      Informacion en Facturas Electronicas
                    </label>
                    <textarea
                      name="feInformacionFacturas"
                      value={values.feInformacionFacturas}
                      disabled={!isEditing}
                      maxLength={800}
                      onChange={(event) =>
                        updateField("feInformacionFacturas", event.target.value)
                      }
                      className={
                        isEditing
                          ? "min-h-[140px] w-full resize-none border border-[#c8d4e3] bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
                          : "min-h-[140px] w-full cursor-not-allowed resize-none border border-slate-200 bg-slate-100 p-3 text-sm text-slate-500"
                      }
                    />
                    <div className="flex justify-end">
                      <span className="bg-rose-100 px-2 py-1 text-xs text-rose-600">
                        {values.feInformacionFacturas.length}/800
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 xl:pt-0">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowHelp((current) => !current)}
                      className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Tutoriales
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "facturas" ? (
              <SqlEditorTab
                disabled={!isEditing}
                selectName="feSqlFacturaTipo"
                selectValue={values.feSqlFacturaTipo}
                selectOptions={facturaSqlOptions}
                onSelectChange={(value) => updateField("feSqlFacturaTipo", value)}
                textareaName="feSqlFacturaContenido"
                textareaValue={values.feSqlFacturaContenido}
                onTextareaChange={(value) =>
                  updateField("feSqlFacturaContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}

            {activeTab === "nota-credito" ? (
              <SqlOnlyTab
                disabled={!isEditing}
                name="feSqlNotaCreditoContenido"
                value={values.feSqlNotaCreditoContenido}
                onChange={(value) =>
                  updateField("feSqlNotaCreditoContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}

            {activeTab === "retenciones" ? (
              <SqlOnlyTab
                disabled={!isEditing}
                name="feSqlRetencionesContenido"
                value={values.feSqlRetencionesContenido}
                onChange={(value) =>
                  updateField("feSqlRetencionesContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}

            {activeTab === "guia-remision" ? (
              <SqlEditorTab
                disabled={!isEditing}
                selectName="feSqlGuiaRemisionTipo"
                selectValue={values.feSqlGuiaRemisionTipo}
                selectOptions={guiaSqlOptions}
                selectLabel="Tipos de SQL Guia Remision :"
                onSelectChange={(value) =>
                  updateField("feSqlGuiaRemisionTipo", value)
                }
                textareaName="feSqlGuiaRemisionContenido"
                textareaValue={values.feSqlGuiaRemisionContenido}
                onTextareaChange={(value) =>
                  updateField("feSqlGuiaRemisionContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}

            {activeTab === "nota-debito" ? (
              <SqlOnlyTab
                disabled={!isEditing}
                name="feSqlNotaDebitoContenido"
                value={values.feSqlNotaDebitoContenido}
                onChange={(value) =>
                  updateField("feSqlNotaDebitoContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}

            {activeTab === "liquidacion-compras" ? (
              <SqlOnlyTab
                disabled={!isEditing}
                name="feSqlLiquidacionComprasContenido"
                value={values.feSqlLiquidacionComprasContenido}
                onChange={(value) =>
                  updateField("feSqlLiquidacionComprasContenido", value)
                }
                textareaClassName={textAreaClassName}
              />
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}

function FormRow({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide
          ? "grid grid-cols-[220px_1fr] items-center gap-4"
          : "grid max-w-[650px] grid-cols-[220px_190px] items-center gap-4"
      }
    >
      <label className="text-[15px] text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function SqlEditorTab({
  disabled,
  selectName,
  selectValue,
  selectOptions,
  onSelectChange,
  textareaName,
  textareaValue,
  onTextareaChange,
  textareaClassName,
  selectLabel = "Tipos de SQL Factura:",
}: {
  disabled: boolean;
  selectName: string;
  selectValue: string;
  selectOptions: readonly string[];
  onSelectChange: (value: string) => void;
  textareaName: string;
  textareaValue: string;
  onTextareaChange: (value: string) => void;
  textareaClassName: string;
  selectLabel?: string;
}) {
  const selectClassName = disabled
    ? "h-10 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
    : "h-10 w-full border border-[#c8d4e3] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]";

  return (
    <div className="space-y-4">
      <div className="grid max-w-[640px] grid-cols-[180px_1fr] items-center gap-3">
        <label className="text-[15px] text-slate-700">{selectLabel}</label>
        <select
          name={selectName}
          value={selectValue}
          disabled={disabled}
          onChange={(event) => onSelectChange(event.target.value)}
          className={selectClassName}
        >
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name={textareaName}
        value={textareaValue}
        disabled={disabled}
        onChange={(event) => onTextareaChange(event.target.value)}
        className={textareaClassName}
      />
    </div>
  );
}

function SqlOnlyTab({
  disabled,
  name,
  value,
  onChange,
  textareaClassName,
}: {
  disabled: boolean;
  name: string;
  value: string;
  onChange: (value: string) => void;
  textareaClassName: string;
}) {
  return (
    <textarea
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={textareaClassName}
    />
  );
}

function SaveToolbarButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className={`inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${
        enabled && !pending
          ? "bg-[#82c3ff] hover:bg-[#74b6f2]"
          : "cursor-not-allowed bg-[#cfe2f7] text-white/90"
      }`}
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

function buildInitialValues(
  empresa: ParametrosFacturacionElectronicaPanelProps["empresa"],
) {
  return {
    ...empresa,
    feSqlFacturaContenido:
      empresa.feSqlFacturaContenido === "select"
        ? sqlTemplates.factura
        : empresa.feSqlFacturaContenido,
    feSqlNotaCreditoContenido:
      empresa.feSqlNotaCreditoContenido === "select"
        ? sqlTemplates.notaCredito
        : empresa.feSqlNotaCreditoContenido,
    feSqlRetencionesContenido:
      empresa.feSqlRetencionesContenido === "select"
        ? sqlTemplates.retenciones
        : empresa.feSqlRetencionesContenido,
    feSqlGuiaRemisionContenido:
      empresa.feSqlGuiaRemisionContenido === "select"
        ? sqlTemplates.guiaRemision
        : empresa.feSqlGuiaRemisionContenido,
    feSqlNotaDebitoContenido:
      empresa.feSqlNotaDebitoContenido === "select"
        ? sqlTemplates.notaDebito
        : empresa.feSqlNotaDebitoContenido,
    feSqlLiquidacionComprasContenido:
      empresa.feSqlLiquidacionComprasContenido === "select"
        ? sqlTemplates.liquidacionCompras
        : empresa.feSqlLiquidacionComprasContenido,
  };
}
