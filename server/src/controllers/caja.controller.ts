import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * Controller para consultar las cajas disponibles
 */
export const consultarCajas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idUsuario } = req.query as any;

    if (!idUsuario) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idUsuario' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idUsuario', type: sql.Int, value: parseInt(idUsuario) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaCajas',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al consultar las cajas",
      error: error.message
    });
  }
};

/**
 * Controller para abrir una caja
 */
export const abrirCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCaja, idUsuario, montoInicial } = req.body;

    if (!idCaja || !idUsuario || montoInicial === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos (idCaja, idUsuario, montoInicial).'
      });
      return;
    }

    const inputs = [
      { name: 'idCaja', type: sql.Int, value: idCaja },
      { name: 'idUsuario', type: sql.Int, value: idUsuario },
      { name: 'montoInicial', type: sql.Money, value: montoInicial }
    ];

    const result = await executeRequest({
      query: 'sp_abrirCaja',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    // El SP debe devolver el idMovimientoCaja creado
    const idMovimientoCaja = result.recordset && result.recordset[0] ? result.recordset[0].idMovimientoCaja : null;

    res.status(201).json({
      success: true,
      message: 'Caja abierta exitosamente',
      idMovimientoCaja: idMovimientoCaja
    });

  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al abrir la caja",
        error: error.message
      });
    }
  }
};

/**
 * Controller para cerrar una caja
 */
export const cerrarCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCaja, idMovimientoCaja, idUsuarioCierre, montoFinalContado } = req.body;

    if (!idCaja || !idMovimientoCaja || !idUsuarioCierre || montoFinalContado === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos (idCaja, idMovimientoCaja, idUsuarioCierre, montoFinalContado).'
      });
      return;
    }

    const inputs = [
      { name: 'idCaja', type: sql.Int, value: idCaja },
      { name: 'idMovimientoCaja', type: sql.Int, value: idMovimientoCaja },
      { name: 'idUsuarioCierre', type: sql.Int, value: idUsuarioCierre },
      { name: 'montoFinalContado', type: sql.Money, value: montoFinalContado }
    ];

    await executeRequest({
      query: 'sp_cerrarCaja',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      message: 'Caja cerrada exitosamente'
    });

  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al cerrar la caja",
        error: error.message
      });
    }
  }
};

/**
 * Controller para agregar un gasto a la caja
 */
export const agregarGastoCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idMovimientoCaja, idUsuario, concepto, montoGasto } = req.body;

    if (!idMovimientoCaja || !idUsuario || !concepto || montoGasto === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos (idMovimientoCaja, idUsuario, concepto, montoGasto).'
      });
      return;
    }

    const inputs = [
      { name: 'idMovimientoCaja', type: sql.Int, value: idMovimientoCaja },
      { name: 'idUsuario', type: sql.Int, value: idUsuario },
      { name: 'concepto', type: sql.VarChar(100), value: concepto },
      { name: 'montoGasto', type: sql.Money, value: montoGasto }
    ];

    await executeRequest({
      query: 'sp_agregarGastoCaja',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(201).json({
      success: true,
      message: 'Gasto agregado exitosamente'
    });

  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al agregar el gasto",
        error: error.message
      });
    }
  }
};

/**
 * Controller para consultar los movimientos de una caja específica
 */
export const consultarMovimientosPorCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCaja } = req.query as any;

    if (!idCaja) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idCaja' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idCaja', type: sql.Int, value: parseInt(idCaja) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaMovimientoCajaPorCaja',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al consultar los movimientos de la caja",
      error: error.message
    });
  }
};
