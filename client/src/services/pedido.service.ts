import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

//#region Interfaces
export interface AgregarDetallePedidoRequest {
    idTerminalWeb: number;
    idProducto: number;
    idStock: number;
    cantidad: number;
    precio: number;
}

export interface GuardarPedidoRequest {
    idUsuarioAlta: number;
    idTerminalWeb: number;
    idPedidoExistente: number;
    idEstadoCobro: number;
    idTipoCobro: number;
    idCliente: number;
    idDelivery: number;
    direccion: string;
}

export interface PedidoDia {
    nro: number;
    idPedido: number;
    nombreCliente: string;
    nombreTipo: string;
    fechaAlta: string;
    total?: number;
}

export interface DetallePedido {
    idDetPedidoTmp: number;
    idProducto: number;
    codigo: string;
    nombreMercaderia: string;
    origen: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    stock: number;
    nombreImpuesto: string;
    nro: number;
}
//#region Interfaces

export const pedidoService = {
    agregarDetallePedido: async (data: AgregarDetallePedidoRequest): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/detalle`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle de pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar producto al pedido');
        }
    },

    consultarDetallePedido: async (idTerminalWeb: number): Promise<DetallePedido[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/detalle`, {
                params: {
                    idTerminalWeb
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar el detalle del pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar el detalle del pedido');
        }
    },

    eliminarDetallePedido: async (idTerminalWeb: number, idDetPedidoTmp: number): Promise<any> => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/pedido/detalle`, {
                params: {
                    idTerminalWeb,
                    idDetPedidoTmp
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle de pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar producto del pedido');
        }
    },

    guardarPedido: async (data: GuardarPedidoRequest): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar el pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al guardar el pedido');
        }
    },

    consultarPedidosDia: async (idTerminalWeb: number): Promise<PedidoDia[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/dia`, {
                params: {
                    idTerminalWeb
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar los pedidos del día:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar los pedidos del día');
        }
    }
};
