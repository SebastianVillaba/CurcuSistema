import PDFDocument from 'pdfkit-table';
import { Response } from 'express';
import https from 'https';

// Helper nativo de Node para obtener un buffer de imagen vía HTTPS
const fetchImageBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: any[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

export const generateVentasProductoPdf = (res: Response, data: any[], fecha: string) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Configurar las cabeceras de respuesta para descargar el PDF
  res.setHeader('Content-disposition', `attachment; filename="Reporte_Ventas_${fecha}.pdf"`);
  res.setHeader('Content-type', 'application/pdf');
  
  doc.pipe(res);

  // Título del Reporte
  doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Productos Vendidos`, { align: 'center' });
  doc.fontSize(12).text(`Fecha: ${fecha}`, { align: 'center' });
  doc.moveDown(2);

  // Calcular los totales generales
  const totalMonto = data.reduce((sum, item) => sum + Number(item.totalMontoVendido || 0), 0);

  const formatOptions = { minimumFractionDigits: 0 };
  
  const mappedData = data.map(item => ({
    nombre: item.nombre,
    TotalVendido: Number(item.TotalVendido).toFixed(2),
    totalMontoVendido: Number(item.totalMontoVendido).toLocaleString('es-PY', formatOptions)
  }));

  // Agregar la fila de totales
  mappedData.push({
    nombre: 'TOTAL GENERAL',
    TotalVendido: '',
    totalMontoVendido: totalMonto.toLocaleString('es-PY', formatOptions)
  });

  // Opciones y datos para la tabla
  const tableData = {
    headers: [
      { label: "Nombre del Producto", property: 'nombre', width: 250 },
      { label: "Total Vendido", property: 'TotalVendido', width: 100, align: 'right' as const },
      { label: "Monto Vendido ($)", property: 'totalMontoVendido', width: 120, align: 'right' as const }
    ],
    datas: mappedData
  };

  // Dibujar la tabla
  doc.table(tableData, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, iColumn, iRow, rectRow, rectCell) => {
      // Hacer la fila de TOTAL GENERAL en negrita
      if (row.nombre === 'TOTAL GENERAL') {
        doc.font("Helvetica-Bold").fontSize(10);
      } else {
        doc.font("Helvetica").fontSize(10);
      }
      return doc;
    }
  });

  // Finalizar el documento
  doc.end();
};

export const generateHojaRutaPdf = async (
  res: Response,
  cabecera: { nroHojaRuta: string; fechaRuta: string; nombreDelivery: string; observacion?: string },
  pedidos: any[]
) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const fechaStr = new Date(cabecera.fechaRuta).toLocaleDateString('es-PY');

  // Configurar las cabeceras de respuesta para descargar el PDF
  res.setHeader('Content-disposition', `attachment; filename="Hoja_Ruta_${cabecera.nroHojaRuta}.pdf"`);
  res.setHeader('Content-type', 'application/pdf');
  
  doc.pipe(res);

  // 1. Cabecera y Título del Reporte
  doc.font('Helvetica-Bold').fontSize(18).text(`HOJA DE RUTA DE ENTREGAS`, 40, 40);
  doc.font('Helvetica').fontSize(10).text(`Nro. Planilla: ${cabecera.nroHojaRuta}`, 40, 65);
  doc.text(`Fecha: ${fechaStr}`, 40, 80);
  doc.text(`Repartidor: ${cabecera.nombreDelivery}`, 40, 95);
  if (cabecera.observacion) {
    doc.text(`Obs: ${cabecera.observacion}`, 40, 110);
  }

  // 2. Construcción de la URL de Google Maps para el Código QR
  // Filtramos pedidos que tengan coordenadas válidas
  const pedidosConCoordenadas = pedidos.filter(p => p.latitud && p.longitud);
  let googleMapsUrl = '';
  
  if (pedidosConCoordenadas.length > 0) {
    const coords = pedidosConCoordenadas.map(p => `${p.latitud},${p.longitud}`);
    if (coords.length === 1) {
      // Un solo punto de entrega
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]}`;
    } else {
      // Multipunto: la última parada es el destino, las anteriores son waypoints
      const destination = coords[coords.length - 1];
      const waypoints = coords.slice(0, -1).join('|');
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}`;
    }
  }

  // 3. Obtener e integrar el código QR
  if (googleMapsUrl) {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(googleMapsUrl)}`;
      const qrBuffer = await fetchImageBuffer(qrApiUrl);
      
      // Dibujar QR en la esquina superior derecha (X: 430, Y: 40)
      doc.image(qrBuffer, 430, 40, { width: 100 });
      doc.font('Helvetica-Bold').fontSize(7).text('ESCANEAR CON CELULAR', 430, 145, { width: 100, align: 'center' });
      doc.font('Helvetica').fontSize(7).text('Para iniciar navegación GPS', 430, 155, { width: 100, align: 'center' });
    } catch (error) {
      console.error('Error al generar código QR para el PDF:', error);
      // Si falla, agregamos un mensaje de texto con el link o simplemente omitimos el QR
      doc.font('Helvetica-Oblique').fontSize(8).text('No se pudo cargar el código QR (Sin conexión)', 400, 40, { width: 150 });
    }
  }

  doc.moveDown(4);

  // 4. Mapear los datos de pedidos para la tabla
  const formatOptions = { minimumFractionDigits: 0 };
  const mappedData = pedidos.map((item, index) => ({
    orden: (index + 1).toString(),
    nroPedido: item.nroPedido || `Ped. #${item.idPedido}`,
    cliente: `${item.nombreCliente}${item.apellidoCliente ? ' ' + item.apellidoCliente : ''}`.trim(),
    direccion: item.direccionPedido || 'Sin dirección registrada',
    contacto: `${item.celular || item.telefono || 'Sin tel.'}`,
    total: Number(item.totalPedido || item.total || 0).toLocaleString('es-PY', formatOptions),
    firma: '' // Columna en blanco para la firma
  }));

  // Opciones y datos para la tabla
  const tableData = {
    headers: [
      { label: "Ord.", property: 'orden', width: 30, align: 'center' as const },
      { label: "Nro. Pedido", property: 'nroPedido', width: 70 },
      { label: "Cliente", property: 'cliente', width: 110 },
      { label: "Dirección de Entrega", property: 'direccion', width: 170 },
      { label: "Contacto", property: 'contacto', width: 60 },
      { label: "Monto", property: 'total', width: 60, align: 'right' as const },
      { label: "Firma / Aclaración", property: 'firma', width: 60 }
    ],
    datas: mappedData
  };

  // Dibujar la tabla
  doc.table(tableData, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, iColumn, iRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(8);
      return doc;
    }
  });

  // 5. Finalizar el documento
  doc.end();
};
