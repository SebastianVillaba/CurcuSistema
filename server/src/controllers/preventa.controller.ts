import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * Controller para guardar una preventa (guardar temporal como preventa)
 */
export const guardarPreventa = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idUsuarioAlta,
      idTerminalWeb,
      idCliente,
      ruc,
      nombreCliente,
      totalVenta,
      totalDescuento
    } = req.body;

    // Validar parámetros obligatorios
    if (!idUsuarioAlta || !idTerminalWeb || totalVenta === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos para guardar la preventa.'
      });
      return;
    }

    const inputs = [
      { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
      { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
      { name: 'idCliente', type: sql.Int, value: idCliente || null },
      { name: 'ruc', type: sql.VarChar(15), value: ruc || '' },
      { name: 'nombreCliente', type: sql.VarChar(60), value: nombreCliente || '' },
      { name: 'totalVenta', type: sql.Money, value: totalVenta },
      { name: 'totalDescuento', type: sql.Money, value: totalDescuento || 0 }
    ];

    const result = await executeRequest({
      query: 'sp_guardarPreventa',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    const idPreventa = result.recordset && result.recordset[0] ? result.recordset[0].idPreventa : null;

    res.status(201).json({
      success: true,
      message: 'Preventa guardada exitosamente',
      idPreventa: idPreventa
    });

  } catch (error: any) {
    console.error('Error al guardar preventa:', error);
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al guardar la preventa',
        error: error.message
      });
    }
  }
};

/**
 * Controller para recargar una preventa (cargar items de preventa al carrito)
 */
export const recargarPreventa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTerminalWeb, idUsuario, idPreventa } = req.body;

    if (!idTerminalWeb || !idUsuario || !idPreventa) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos para recargar la preventa.'
      });
      return;
    }

    const inputs = [
      { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
      { name: 'idUsuario', type: sql.Int, value: idUsuario },
      { name: 'idPreventa', type: sql.Int, value: idPreventa }
    ];

    const result = await executeRequest({
      query: 'sp_recargarPreventa',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      message: 'Preventa recargada exitosamente',
      clienteData: result.recordset && result.recordset[0] ? result.recordset[0] : null
    });

  } catch (error: any) {
    console.error('Error al recargar preventa:', error);
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al recargar la preventa',
        error: error.message
      });
    }
  }
};

/**
 * Controller para listar preventas pendientes (no procesadas y activas)
 */
export const listarPreventasPendientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'sp_listarPreventasPendientes',
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    console.error('Error al listar preventas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar preventas pendientes',
      error: error.message
    });
  }
};

/**
 * Controller para obtener datos de ticket de preventa para reporte
 */
export const reporteTicketPreventa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idPreventa } = req.query;

    if (!idPreventa) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idPreventa es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketPreventa',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idPreventa',
          type: sql.Int,
          value: parseInt(idPreventa as string)
        }
      ]
    });

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de preventa generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error: any) {
    console.error('Error al generar reporte de ticket de preventa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ticket de preventa',
      error: error.message
    });
  }
};
