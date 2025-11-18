import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

export const agregarDetPedidoTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idProducto, idStock, cantidad, precio } = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idProducto', type: sql.Int, value: idProducto },
                { name: 'idStock', type: sql.Int, value: idStock },
                { name: 'cantidad', type: sql.Numeric(10, 4), value: cantidad },
                { name: 'precio', type: sql.Money, value: precio }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido agregado correctamente.' });
    } catch (error) {
        console.error('Error al agregar detalle de pedido temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al agregar detalle de pedido temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al agregar detalle de pedido temporal', error: 'An unknown error occurred' });
        }
    }
};

export const consultarDetallePedido = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar el detalle del pedido:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar el detalle del pedido', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar el detalle del pedido', error: 'An unknown error occurred' });
        }
    }
};

export const eliminarDetallePedido = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetPedidoTmp } = req.query;

    try {
        await executeRequest({
            query: 'sp_eliminarDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) },
                { name: 'idDetPedidoTmp', type: sql.Int, value: Number(idDetPedidoTmp) }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar detalle de pedido temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al eliminar detalle de pedido temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al eliminar detalle de pedido temporal', error: 'An unknown error occurred' });
        }
    }
};

export const guardarPedidoFinal = async (req: Request, res: Response) => {
    const { idUsuarioAlta, idTerminalWeb, idPedidoExistente, idEstadoCobro, idTipoCobro, idCliente, idDelivery, direccion } = req.body;

    try {
        const result = await executeRequest({
            query: 'sp_guardarPedidoFinal',
            isStoredProcedure: true,
            inputs: [
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idPedidoExistente', type: sql.Int, value: idPedidoExistente },
                { name: 'idEstadoCobro', type: sql.Int, value: idEstadoCobro },
                { name: 'idTipoCobro', type: sql.Int, value: idTipoCobro },
                { name: 'idCliente', type: sql.Int, value: idCliente },
                { name: 'idDelivery', type: sql.Int, value: idDelivery },
                { name: 'direccion', type: sql.VarChar(60), value: direccion }
            ]
        });
        res.status(200).json({ message: 'Pedido guardado correctamente.', idPedido: result.recordset[0].idPedido });
    } catch (error) {
        console.error('Error al guardar el pedido final:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al guardar el pedido final', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al guardar el pedido final', error: 'An unknown error occurred' });
        }
    }
};

export const consultaPedidosDia = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaPedidosDia',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar los pedidos del día:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar los pedidos del día', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar los pedidos del día', error: 'An unknown error occurred' });
        }
    }
};


