import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { GuardarZonaRequest, GuardarHojaRutaRequest } from '../types/distribucion.type';
import { generateHojaRutaPdf } from '../utils/pdfGenerator';

// 1. Guardar o modificar Zona de Entrega
export const guardarZona = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idZonaEntrega,
      nombre,
      descripcion,
      color,
      limites,
      costoEnvio,
      idDeliveryDefecto,
      idUsuario
    } = req.body as GuardarZonaRequest;

    if (!nombre || !limites || !idUsuario) {
      res.status(400).json({
        success: false,
        message: "Los campos 'nombre', 'limites' e 'idUsuario' son obligatorios"
      });
      return;
    }

    // Convertir límites a cadena JSON para guardar en la BD
    const limitesJson = JSON.stringify(limites);

    const result = await executeRequest({
      query: 'sp_guardarZonaEntrega',
      isStoredProcedure: true,
      inputs: [
        { name: 'idZonaEntrega', type: sql.Int, value: idZonaEntrega || null },
        { name: 'nombre', type: sql.VarChar(50), value: nombre },
        { name: 'descripcion', type: sql.VarChar(255), value: descripcion || null },
        { name: 'color', type: sql.VarChar(7), value: color },
        { name: 'limites', type: sql.NVarChar(sql.MAX), value: limitesJson },
        { name: 'costoEnvio', type: sql.Money, value: costoEnvio },
        { name: 'idDeliveryDefecto', type: sql.Int, value: idDeliveryDefecto || null },
        { name: 'idUsuario', type: sql.Int, value: idUsuario }
      ]
    });

    res.status(200).json({
      success: true,
      message: idZonaEntrega ? "Zona modificada exitosamente" : "Zona creada exitosamente",
      rowsAffected: result.rowsAffected[0]
    });
  } catch (error: any) {
    console.error("Error en guardarZona:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar la zona de entrega",
      error: error.message
    });
  }
};

// 2. Listar Zonas de Entrega
export const listarZonas = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'sp_listarZonasEntrega',
      isStoredProcedure: true
    });

    // Parsear límites de JSON a Array
    const zonas = result.recordset.map(zona => {
      try {
        return {
          ...zona,
          limites: zona.limites ? JSON.parse(zona.limites) : []
        };
      } catch (e) {
        return {
          ...zona,
          limites: []
        };
      }
    });

    res.status(200).json({
      success: true,
      message: "Zonas de entrega obtenidas exitosamente",
      result: zonas
    });
  } catch (error: any) {
    console.error("Error en listarZonas:", error);
    res.status(500).json({
      success: false,
      message: "Error al listar las zonas de entrega",
      error: error.message
    });
  }
};

// 3. Eliminar (desactivar) Zona de Entrega
export const eliminarZona = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idZonaEntrega } = req.params;
    const { idUsuario } = req.query;

    if (!idZonaEntrega || !idUsuario) {
      res.status(400).json({
        success: false,
        message: "El 'idZonaEntrega' y el 'idUsuario' son requeridos"
      });
      return;
    }

    await executeRequest({
      query: `UPDATE zonaEntrega SET activo = 0, idUsuarioMod = ${idUsuario}, fechaMod = GETDATE() WHERE idZonaEntrega = ${idZonaEntrega}`,
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Zona de entrega eliminada exitosamente"
    });
  } catch (error: any) {
    console.error("Error en eliminarZona:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la zona de entrega",
      error: error.message
    });
  }
};

// 4. Obtener pedidos pendientes de despacho por fecha
export const obtenerPedidosPendientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'fecha' (YYYY-MM-DD) es requerido"
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_obtenerPedidosPendientesDespacho',
      isStoredProcedure: true,
      inputs: [
        { name: 'fechaEntrega', type: sql.Date, value: fecha }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Pedidos pendientes de despacho obtenidos exitosamente",
      result: result.recordset
    });
  } catch (error: any) {
    console.error("Error en obtenerPedidosPendientes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener pedidos pendientes de despacho",
      error: error.message
    });
  }
};

// 5. Guardar o modificar Hoja de Ruta
export const guardarHojaRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idHojaRuta,
      nroHojaRuta,
      idDelivery,
      fechaRuta,
      observacion,
      idUsuario,
      pedidos
    } = req.body as GuardarHojaRutaRequest;

    if (!idDelivery || !fechaRuta || !idUsuario || !pedidos || pedidos.length === 0) {
      res.status(400).json({
        success: false,
        message: "Los campos 'idDelivery', 'fechaRuta', 'idUsuario' y la lista de 'pedidos' son obligatorios"
      });
      return;
    }

    let finalNroHojaRuta = nroHojaRuta;
    if (!idHojaRuta && !finalNroHojaRuta) {
      // Auto-generar número de Hoja de Ruta: HR-YYYYMMDD-XXX
      const dateStr = fechaRuta.replace(/-/g, '');
      const countResult = await executeRequest({
        query: `SELECT COUNT(*) as total FROM hojaRuta WHERE fechaRuta = '${fechaRuta}'`,
        isStoredProcedure: false
      });
      const sequence = (countResult.recordset[0]?.total || 0) + 1;
      finalNroHojaRuta = `HR-${dateStr}-${sequence.toString().padStart(3, '0')}`;
    }

    // 1. Guardar cabecera de la Hoja de Ruta
    const headerResult = await executeRequest({
      query: 'sp_guardarHojaRuta',
      isStoredProcedure: true,
      inputs: [
        { name: 'idHojaRuta', type: sql.Int, value: idHojaRuta || null },
        { name: 'nroHojaRuta', type: sql.VarChar(20), value: finalNroHojaRuta },
        { name: 'idDelivery', type: sql.Int, value: idDelivery },
        { name: 'fechaRuta', type: sql.Date, value: fechaRuta },
        { name: 'observacion', type: sql.VarChar(255), value: observacion || null },
        { name: 'idUsuario', type: sql.Int, value: idUsuario }
      ]
    });

    const activeIdHojaRuta = headerResult.recordset[0].idHojaRuta;

    // 2. Si se está editando, limpiar detalles anteriores
    if (idHojaRuta) {
      await executeRequest({
        query: 'sp_limpiarDetHojaRuta',
        isStoredProcedure: true,
        inputs: [
          { name: 'idHojaRuta', type: sql.Int, value: activeIdHojaRuta }
        ]
      });
    }

    // 3. Insertar los nuevos detalles
    for (const item of pedidos) {
      await executeRequest({
        query: 'sp_guardarDetHojaRuta',
        isStoredProcedure: true,
        inputs: [
          { name: 'idHojaRuta', type: sql.Int, value: activeIdHojaRuta },
          { name: 'idPedido', type: sql.Int, value: item.idPedido },
          { name: 'orden', type: sql.Int, value: item.orden }
        ]
      });
    }

    res.status(200).json({
      success: true,
      message: idHojaRuta ? "Hoja de Ruta modificada exitosamente" : "Hoja de Ruta creada exitosamente",
      result: {
        idHojaRuta: activeIdHojaRuta,
        nroHojaRuta: finalNroHojaRuta
      }
    });
  } catch (error: any) {
    console.error("Error en guardarHojaRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar la hoja de ruta",
      error: error.message
    });
  }
};

// 6. Listar Hojas de Ruta
export const listarHojasRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha } = req.query;

    const result = await executeRequest({
      query: 'sp_listarHojasRuta',
      isStoredProcedure: true,
      inputs: [
        { name: 'fecha', type: sql.Date, value: fecha || null }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Hojas de ruta obtenidas exitosamente",
      result: result.recordset
    });
  } catch (error: any) {
    console.error("Error en listarHojasRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error al listar las hojas de ruta",
      error: error.message
    });
  }
};

// 7. Obtener detalles de una Hoja de Ruta específica
export const obtenerDetalleHojaRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idHojaRuta } = req.params;

    if (!idHojaRuta) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idHojaRuta' es requerido"
      });
      return;
    }

    // Obtener cabecera
    const headerResult = await executeRequest({
      query: `
        SELECT 
            hr.idHojaRuta,
            hr.nroHojaRuta,
            hr.fechaRuta,
            hr.estado,
            hr.observacion,
            hr.idDelivery,
            (SELECT p.nombre + ' ' + pf.apellido FROM delivery d INNER JOIN personaFis pf ON d.idPersonaFis = pf.idPersonaFis INNER JOIN persona p ON pf.idPersona = p.idPersona WHERE d.idDelivery = hr.idDelivery) as nombreDelivery
        FROM hojaRuta hr
        WHERE hr.idHojaRuta = ${idHojaRuta}
      `,
      isStoredProcedure: false
    });

    if (headerResult.recordset.length === 0) {
      res.status(404).json({
        success: false,
        message: "Hoja de Ruta no encontrada"
      });
      return;
    }

    const cabecera = headerResult.recordset[0];

    // Obtener detalles (pedidos vinculados)
    const detailsResult = await executeRequest({
      query: 'sp_obtenerDetallesHojaRuta',
      isStoredProcedure: true,
      inputs: [
        { name: 'idHojaRuta', type: sql.Int, value: Number(idHojaRuta) }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Detalles de Hoja de Ruta obtenidos exitosamente",
      result: {
        ...cabecera,
        pedidos: detailsResult.recordset
      }
    });
  } catch (error: any) {
    console.error("Error en obtenerDetalleHojaRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el detalle de la hoja de ruta",
      error: error.message
    });
  }
};

// 8. Actualizar geolocalización de un cliente de forma individual
export const actualizarGeolocalizacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idPersona, latitud, longitud } = req.body;

    if (!idPersona || latitud === undefined || longitud === undefined) {
      res.status(400).json({
        success: false,
        message: "Los campos 'idPersona', 'latitud' y 'longitud' son obligatorios"
      });
      return;
    }

    await executeRequest({
      query: 'sp_actualizarGeolocalizacionCliente',
      isStoredProcedure: true,
      inputs: [
        { name: 'idCliente', type: sql.Int, value: idPersona },
        { name: 'latitud', type: sql.Decimal(9, 6), value: latitud },
        { name: 'longitud', type: sql.Decimal(9, 6), value: longitud }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Geolocalización del cliente actualizada correctamente"
    });
  } catch (error: any) {
    console.error("Error en actualizarGeolocalizacion:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la geolocalización del cliente",
      error: error.message
    });
  }
};

// 9. Anular Hoja de Ruta
export const anularHojaRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idHojaRuta } = req.params;
    const { idUsuario } = req.body;

    if (!idHojaRuta || !idUsuario) {
      res.status(400).json({
        success: false,
        message: "El 'idHojaRuta' y el 'idUsuario' son requeridos"
      });
      return;
    }

    // Actualizar el estado de la hoja de ruta a Anulado
    await executeRequest({
      query: `UPDATE hojaRuta SET estado = 'Anulado', idUsuarioMod = ${idUsuario}, fechaMod = GETDATE() WHERE idHojaRuta = ${idHojaRuta}`,
      isStoredProcedure: false
    });

    // Desvincular los pedidos de la hoja de ruta
    await executeRequest({
      query: `UPDATE detHojaRuta SET activo = 0 WHERE idHojaRuta = ${idHojaRuta}`,
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Hoja de Ruta anulada exitosamente"
    });
  } catch (error: any) {
    console.error("Error en anularHojaRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error al anular la hoja de ruta",
      error: error.message
    });
  }
};

// 10. Imprimir Hoja de Ruta en PDF
export const imprimirHojaRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idHojaRuta } = req.params;

    if (!idHojaRuta) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idHojaRuta' es requerido"
      });
      return;
    }

    // Obtener cabecera
    const headerResult = await executeRequest({
      query: `
        SELECT 
            hr.idHojaRuta,
            hr.nroHojaRuta,
            hr.fechaRuta,
            hr.estado,
            hr.observacion,
            hr.idDelivery,
            (SELECT p.nombre + ' ' + pf.apellido FROM delivery d INNER JOIN personaFis pf ON d.idPersonaFis = pf.idPersonaFis INNER JOIN persona p ON pf.idPersona = p.idPersona WHERE d.idDelivery = hr.idDelivery) as nombreDelivery
        FROM hojaRuta hr
        WHERE hr.idHojaRuta = ${idHojaRuta}
      `,
      isStoredProcedure: false
    });

    if (headerResult.recordset.length === 0) {
      res.status(404).json({
        success: false,
        message: "Hoja de Ruta no encontrada"
      });
      return;
    }

    const cabecera = headerResult.recordset[0];

    // Obtener detalles (pedidos vinculados)
    const detailsResult = await executeRequest({
      query: 'sp_obtenerDetallesHojaRuta',
      isStoredProcedure: true,
      inputs: [
        { name: 'idHojaRuta', type: sql.Int, value: Number(idHojaRuta) }
      ]
    });

    // Generar e imprimir el PDF
    await generateHojaRutaPdf(res, cabecera, detailsResult.recordset);

  } catch (error: any) {
    console.error("Error en imprimirHojaRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF de la hoja de ruta",
      error: error.message
    });
  }
};
