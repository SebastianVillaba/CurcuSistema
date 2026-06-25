import { Router } from 'express';
import {
  guardarZona,
  listarZonas,
  eliminarZona,
  obtenerPedidosPendientes,
  guardarHojaRuta,
  listarHojasRuta,
  obtenerDetalleHojaRuta,
  actualizarGeolocalizacion,
  anularHojaRuta,
  imprimirHojaRuta
} from '../controllers/distribucion.controller';

const router = Router();

// Rutas para Zonas de Entrega
router.post('/zonas', guardarZona);
router.get('/zonas', listarZonas);
router.delete('/zonas/:idZonaEntrega', eliminarZona);

// Ruta para Pedidos Pendientes
router.get('/pedidos-pendientes', obtenerPedidosPendientes);

// Rutas para Hojas de Ruta
router.post('/hojas-ruta', guardarHojaRuta);
router.get('/hojas-ruta', listarHojasRuta);
router.get('/hojas-ruta/:idHojaRuta', obtenerDetalleHojaRuta);
router.get('/hojas-ruta/:idHojaRuta/pdf', imprimirHojaRuta);
router.put('/hojas-ruta/:idHojaRuta/anular', anularHojaRuta);

// Ruta para Geolocalización de Clientes
router.put('/cliente-geolocalizacion', actualizarGeolocalizacion);

export default router;
