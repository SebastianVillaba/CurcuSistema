import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * Controller para obtener el reporte de factura de venta
 * @param req - Request con el parámetro idVenta
 * @param res - Response con los datos de la factura
 */
export const reporteFacturaVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idVenta } = req.query;

    if (!idVenta) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idVenta es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteFacturaVenta',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idVenta',
          type: sql.Int,
          value: parseInt(idVenta as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Cabecera y liquidación
    // recordset[1] = Detalle de items
    
    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de factura',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte del ticket de un pedido
 */
export const reporteTicketPedidoDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idPedido, nro } = req.query;

    if (!idPedido || !nro) {
      res.status(400).json({
        success: false,
        message: 'Los parámetros idPedido y nro son requeridos'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketPedidoDia',
      isStoredProcedure: true,
      inputs: [
        { name: 'idPedido', type: sql.Int, value: parseInt(idPedido as string, 10) },
        { name: 'nro', type: sql.Int, value: parseInt(nro as string, 10) }
      ]
    });

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de ticket de pedido generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de ticket de pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el ticket del pedido',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de ticket de venta
 * @param req - Request con el parámetro idVenta
 * @param res - Response con los datos del ticket
 */
export const reporteTicketVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idVenta } = req.query;

    if (!idVenta) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idVenta es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketVenta',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idVenta',
          type: sql.Int,
          value: parseInt(idVenta as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Cabecera
    // recordset[1] = Detalle de items
    
    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de ticket generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ticket',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
