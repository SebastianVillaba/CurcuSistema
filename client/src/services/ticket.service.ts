import type { ItemFactura, DatosFactura, ItemTicket, DatosTicket, DatosTicketPedido, DatosCierreCaja, ItemTicketRemision, DatosTicketRemision } from "../types/ticket.types";
import jsPDF from "jspdf";


class TicketService {

    private readonly ANCHO_TICKET = 80; // Ancho del ticket para impresoras de 80mm
    private readonly MARGEN_IZQ = 2;
    private posY = 10; // Posición Y inicial

    /**
     * Generar el ticket e imprime automaticamente
     */


    public async generarTicket(datos: DatosTicket): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });


        this.posY = 10;


        // Dibujar el encabezado
        this.dibujarEncabezado(doc, datos);

        // Dibujar información del cliente
        this.dibujarInfoCliente(doc, datos);

        // Dibujar encabezado de tabla de items
        this.dibujarEncabezadoTabla(doc);

        // Dibujar items
        this.dibujarItems(doc, datos.items);

        // Dibujar totales
        this.dibujarTotales(doc, datos);

        // Dibujar footer
        this.dibujarFooter(doc, datos);

        // Pie de página
        this.dibujarLinea(doc);

        // Abrir el PDF en una nueva ventana para imprimir
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    public async generarTicketPedido(datos: DatosTicketPedido): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });

        this.posY = 10;

        this.dibujarEncabezadoPedido(doc, datos);
        this.dibujarTablaPedido(doc, datos);
        this.dibujarTotalesPedido(doc, datos);

        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    public async generarTicketCierreCaja(datos: DatosCierreCaja): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });

        this.posY = 10;

        this.dibujarEncabezadoCierreCaja(doc, datos);
        this.dibujarResumenCierreCaja(doc, datos);
        this.dibujarGastosCierreCaja(doc, datos);
        this.dibujarFooterCierreCaja(doc);

        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    public async generarTicketRemision(datos: DatosTicketRemision): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });

        this.posY = 10;

        this.dibujarEncabezadoRemision(doc, datos);
        this.dibujarInfoRemision(doc, datos);
        this.dibujarEncabezadoTablaRemision(doc);
        this.dibujarItemsRemision(doc, datos.items);
        this.dibujarFooterRemision(doc);

        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    private dibujarEncabezadoRemision(doc: jsPDF, datos: DatosTicketRemision): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('NOTA DE REMISION', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;

        doc.setFontSize(10);
        doc.text(`${datos.nroDocumento}`, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${datos.referenciaDocumento}`, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    private dibujarInfoRemision(doc: jsPDF, datos: DatosTicketRemision): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        doc.text(`Fecha: ${this.formatearFecha(datos.fechaEmision)}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('ORIGEN:', this.MARGEN_IZQ, this.posY);
        doc.setFont('helvetica', 'normal');
        this.posY += 4;
        doc.text(`${datos.sucursalOrigen} - ${datos.depositoOrigen}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('DESTINO:', this.MARGEN_IZQ, this.posY);
        doc.setFont('helvetica', 'normal');
        this.posY += 4;
        doc.text(`${datos.sucursalDestino} - ${datos.depositoDestino}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        if (datos.observacion) {
            doc.text(`Obs: ${this.truncarTexto(datos.observacion, 40)}`, this.MARGEN_IZQ, this.posY);
            this.posY += 5;
        }

        doc.text(`Emitido por: ${datos.emitidoPor}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        doc.text(`Estado: ${datos.estadoActual}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    private dibujarEncabezadoTablaRemision(doc: jsPDF): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        doc.text('Cant.', this.MARGEN_IZQ, this.posY);
        doc.text('Código', this.MARGEN_IZQ + 12, this.posY);
        doc.text('Descripción', this.MARGEN_IZQ + 30, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    private dibujarItemsRemision(doc: jsPDF, items: ItemTicketRemision[]): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        items.forEach(item => {
            doc.text(String(item.codigo || ''), this.MARGEN_IZQ + 12, this.posY);
            doc.text(String(item.cantidadEnviada || 0), this.MARGEN_IZQ, this.posY);

            const lineasMercaderia = this.dividirTexto(item.mercaderia || '', 25);
            lineasMercaderia.forEach((linea, index) => {
                doc.text(linea, this.MARGEN_IZQ + 30, this.posY);
                this.posY += 4;
            });

            // Control fisico (el checkbox [ ])
           //doc.text(item.controlFisico || '[   ]', this.MARGEN_IZQ + 30, this.posY);

            if (lineasMercaderia.length === 0) {
                this.posY += 4;
            }
        });

        this.dibujarLinea(doc);
    }

    private dibujarFooterRemision(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('*** FIN DEL DOCUMENTO ***', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;

        // Espacio para firma
        this.posY += 10;
        doc.text('__________________________', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 4;
        doc.text('Recibido Conforme', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;
    }

    /**
     * 
     * ESTOS ES PARA EL TICKET DE PEDIDOS 
     *  
     */

    private dibujarEncabezadoPedido(doc: jsPDF, datos: DatosTicketPedido): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Pedido N°', this.MARGEN_IZQ, this.posY);
        doc.setFontSize(24);
        doc.text(String(datos.numeroPedido ?? ''), this.ANCHO_TICKET - 20, this.posY + 4, { align: 'center' });
        doc.rect(this.ANCHO_TICKET - 27, this.posY - 6, 15, 15);

        this.posY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cliente: ${datos.cliente || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        doc.text(`Dirección: ${datos.direccion || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        doc.text(`Celular: ${datos.celular || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        doc.text(`Fecha: ${this.formatearFecha(datos.fechaHora)}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;
        this.dibujarLinea(doc);

    }

    private dibujarTablaPedido(doc: jsPDF, datos: DatosTicketPedido): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Cantidad', this.MARGEN_IZQ, this.posY);
        doc.text('Mercaderia', this.MARGEN_IZQ + 18, this.posY);
        doc.text('Precio', this.MARGEN_IZQ + 48, this.posY);
        doc.text('Subtotal', this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 4;
        this.dibujarLinea(doc);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        datos.items.forEach((item) => {
            doc.text(String(item.cantidad ?? ''), this.MARGEN_IZQ + 5, this.posY);

            const mercaderiaLineas = this.dividirTexto(item.mercaderia ?? '', 14);
            doc.text(mercaderiaLineas[0] || '', this.MARGEN_IZQ + 18, this.posY);
            doc.text(this.formatearNumero(item.precio ?? 0, 0), this.MARGEN_IZQ + 48, this.posY);
            doc.text(this.formatearNumero(item.subtotal ?? 0, 0), this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
            this.posY += 4;

            if (mercaderiaLineas.length > 1) {
                mercaderiaLineas.slice(1).forEach((linea) => {
                    doc.text(linea, this.MARGEN_IZQ + 18, this.posY);
                    this.posY += 4;
                });
            }

            this.posY += 2;
        });
        this.dibujarLinea(doc);
    }

    private dibujarTotalesPedido(doc: jsPDF, datos: DatosTicketPedido): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Monto total: ${this.formatearNumero(datos.total ?? 0, 0)}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Delivery: ${datos.delivery || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;
    }

    /**
     * 
     * ESTOS ES PARA EL TICKET DE CAJA 
     *  
     */

    private dibujarEncabezadoCierreCaja(doc: jsPDF, datos: DatosCierreCaja): void {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('CIERRE DE CAJA', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;

        doc.setFontSize(10);
        doc.text(datos.resumen.nombreCaja || 'Caja', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;

        this.dibujarLinea(doc);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Cajero Apertura: ${datos.resumen.cajeroApertura || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        doc.text(`Cajero Cierre: ${datos.resumen.cajeroCierre || ''}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        const fechaApertura = datos.resumen.fechaApertura ? this.formatearFecha(new Date(datos.resumen.fechaApertura)) : '';
        doc.text(`Apertura: ${fechaApertura}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        const fechaCierre = datos.resumen.fechaCierre ? this.formatearFecha(new Date(datos.resumen.fechaCierre)) : '';
        doc.text(`Cierre: ${fechaCierre}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    private dibujarResumenCierreCaja(doc: jsPDF, datos: DatosCierreCaja): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        this.dibujarFilaResumen(doc, 'Monto Inicial:', datos.resumen.montoInicial);
        this.dibujarFilaResumen(doc, 'Total Ventas:', datos.resumen.totalVentas);
        this.dibujarFilaResumen(doc, 'Total Cobranza:', datos.resumen.totalCobranza);
        this.dibujarFilaResumen(doc, 'Total Gastos:', datos.resumen.totalGastos);

        this.dibujarLinea(doc);

        this.dibujarFilaResumen(doc, 'Saldo Teorico:', datos.resumen.saldoTeorico);
        this.dibujarFilaResumen(doc, 'Saldo Real (Cierre):', datos.resumen.saldoReal);
        this.dibujarFilaResumen(doc, 'Diferencia:', datos.resumen.diferencia);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${datos.resumen.estadoCierre || ''}`, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    private dibujarFilaResumen(doc: jsPDF, etiqueta: string, valor: number): void {
        doc.text(etiqueta, this.MARGEN_IZQ, this.posY);
        doc.text(this.formatearNumero(valor || 0), this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 5;
    }

    private dibujarGastosCierreCaja(doc: jsPDF, datos: DatosCierreCaja): void {
        if (datos.gastos && datos.gastos.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('DETALLE DE GASTOS', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
            this.posY += 5;

            doc.setFontSize(8);
            doc.text('Desc.', this.MARGEN_IZQ, this.posY);
            doc.text('Monto', this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
            this.posY += 4;

            doc.setFont('helvetica', 'normal');
            datos.gastos.forEach(gasto => {
                doc.text(this.truncarTexto(gasto.concepto || 'Gasto', 25), this.MARGEN_IZQ, this.posY);
                doc.text(this.formatearNumero(gasto.montoGasto || 0), this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
                this.posY += 4;
            });

            this.dibujarLinea(doc);
        }
    }

    private dibujarFooterCierreCaja(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('*** FIN DEL REPORTE ***', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;
    }


    /**
     * Dibuja el encabezado del reporte
     */
    private dibujarEncabezado(doc: jsPDF, datos: DatosTicket): void {
        // Nombre fantasia - negrita y centrado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const nombreFantasia = this.truncarTexto(datos.nombreFantasia, 50);
        doc.text(nombreFantasia, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;


        // RUC
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`RUC: ${datos.ruc}`, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;


        // SUCURSAL
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Sucursal: ${datos.nombreSucursal}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // TIPO PAGO
        doc.text(`Forma de Pago: ${datos.nombreTipoPago}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Línea separadora
        this.dibujarLinea(doc);
    }



    /**
     * Dibuja la información del cliente
    */
    private dibujarInfoCliente(doc: jsPDF, datos: DatosTicket): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);


        // Fecha/Hora
        const fechaFormateada = this.formatearFecha(datos.fechaHora);
        doc.text(`Fecha/Hora: ${fechaFormateada}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // IDVENTA
        doc.text(`ID Venta: ${datos.idVenta}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Cliente
        const lineasCliente = this.dividirTexto(datos.cliente, 50);
        for (let linea = 0; linea < lineasCliente.length; linea++) {
            if (linea === 0) {
                doc.text(`Cliente: ${lineasCliente[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
            else {
                doc.text(lineasCliente[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
        }

        // CI/RUC Cliente
        doc.text(`CI/RUC: ${datos.rucCliente}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Vendedor
        doc.text(`Vendedor/a: ${datos.vendedor}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja el encabezado de la tabla de items
    */
    private dibujarEncabezadoTabla(doc: jsPDF): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        // Encabezados de columnas
        doc.text('Cant.', this.MARGEN_IZQ, this.posY);
        doc.text('Mercaderia', this.MARGEN_IZQ + 12, this.posY);
        doc.text('Prec.Unit.', this.MARGEN_IZQ + 40, this.posY);
        doc.text('SubtTotal', this.MARGEN_IZQ + 60, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los items de la factura
    */
    private dibujarItems(doc: jsPDF, items: ItemTicket[]): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        items.forEach(item => {
            // Código
            doc.text(item.codigo.toString(), this.MARGEN_IZQ, this.posY);
            this.posY += 4;

            // Cantidad, Mercadería y Precio
            doc.text(item.cantidad.toString(), this.MARGEN_IZQ, this.posY);
            this.posY -= 4;

            // Dividir mercadería si es muy larga
            const lineasMercaderia = this.dividirTexto(item.mercaderia, 14);
            lineasMercaderia.forEach((linea, index) => {
                if (index === 0) {
                    doc.text(linea, this.MARGEN_IZQ + 12, this.posY);
                    doc.text(this.formatearNumero(item.precio, 0), this.MARGEN_IZQ + 41, this.posY);
                } else {
                    this.posY += 4;
                    doc.text(linea, this.MARGEN_IZQ + 12, this.posY);
                }
            });

            this.posY -= 4;
            // Subtotal - alineado a la derecha
            const subtotalStr = this.formatearNumero(item.subtotal, 0);
            doc.text(subtotalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
            this.posY += 9;
        });

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los totales
     */
    private dibujarTotales(doc: jsPDF, datos: DatosTicket): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        const totalStr = this.formatearNumero(datos.total, 0);
        doc.text('TOTAL Gs.:', this.MARGEN_IZQ, this.posY);
        doc.text(totalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(datos.totalLetra, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    private dibujarFooter(doc: jsPDF, datos: DatosTicket): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text('GRACIAS POR SU COMPRA!', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;
        this.dibujarLinea(doc);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(datos.leyenda, this.MARGEN_IZQ, this.posY)
        this.posY += 6;
    }

    /**
     * Formatea fecha a string
    */
    private formatearFecha(fecha: Date): string {
        const fechaObj = new Date(fecha);
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaObj.getFullYear();
        const horas = fechaObj.getHours().toString().padStart(2, '0');
        const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }
    /**
     * Dibuja una línea separadora
     */
    private dibujarLinea(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('------------------------------------------------------------------------', this.MARGEN_IZQ, this.posY);
        this.posY += 5;
    }

    /**
     * Formatea números con separadores de miles
     */
    private formatearNumero(numero: number, decimales: number = 0): string {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        }).format(numero);
    }

    /**
     * Trunca texto si excede el límite
     */
    private truncarTexto(texto: string, maxLength: number): string {
        if (!texto) return '';
        return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
    }

    /**
     * Divide texto en múltiples líneas
     */
    private dividirTexto(texto: string, maxLength: number): string[] {
        if (!texto) return [''];

        const palabras = texto.split(' ');
        const lineas: string[] = [];
        let lineaActual = '';

        palabras.forEach(palabra => {
            if ((lineaActual + palabra).length <= maxLength) {
                lineaActual += (lineaActual ? ' ' : '') + palabra;
            } else {
                if (lineaActual) lineas.push(lineaActual);
                lineaActual = palabra;
            }
        });

        if (lineaActual) lineas.push(lineaActual);
        return lineas;
    }
}

class FacturaService {


    private readonly ANCHO_TICKET = 80; // Ancho del ticket para impresoras de 80mm
    private readonly MARGEN_IZQ = 2;
    private posY = 10; // Posición Y inicial


    /**
     * Generar el ticket e imprime automaticamente
     */


    public async generarTicket(datos: DatosFactura): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });


        this.posY = 10;


        // Dibujar el encabezado
        this.dibujarEncabezado(doc, datos);

        // Dibujar información del cliente
        this.dibujarInfoCliente(doc, datos);

        // Dibujar información de la venta
        this.dibujarInfoVenta(doc, datos);

        // Dibujar número de factura
        this.dibujarNumeroFactura(doc, datos);

        // Dibujar encabezado de tabla de items
        this.dibujarEncabezadoTabla(doc);

        // Dibujar items
        this.dibujarItems(doc, datos.items);

        // Dibujar totales
        this.dibujarTotales(doc, datos);

        // Dibujar liquidación del IVA
        this.dibujarLiquidacionIVA(doc, datos);

        // Pie de página
        this.dibujarLinea(doc);

        // Abrir el PDF en una nueva ventana para imprimir
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }


    /**
     * Dibuja el encabezado del reporte
     */
    private dibujarEncabezado(doc: jsPDF, datos: DatosFactura): void {
        // Nombre fantasia - negrita y centrado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const nombreFantasia = this.truncarTexto(datos.nombreFantasia, 50);
        doc.text(nombreFantasia, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;


        // Empresa contable - cursiva y centrado
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        const empresaContable = this.truncarTexto(datos.empresaContable, 50);
        doc.text(empresaContable, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 6;


        // RUC
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`RUC: ${datos.ruc}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;


        // Dirección
        const lineasDireccion = this.dividirTexto(datos.direccion, 40);
        for (let linea = 0; linea < lineasDireccion.length; linea++) {
            if (linea === 0) {
                doc.text(`Dirección: ${lineasDireccion[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
            else {
                doc.text(lineasDireccion[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
        }


        // Teléfono y Rubro
        doc.text(`Telef.: ${datos.telefono}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;
        doc.text(datos.rubro, this.MARGEN_IZQ, this.posY);
        this.posY += 6;


        // Línea separadora
        this.dibujarLinea(doc);
    }



    /**
     * Dibuja la información del cliente
    */
    private dibujarInfoCliente(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);


        // Fecha/Hora
        const fechaFormateada = this.formatearFecha(datos.fechaHora);
        doc.text(`Fecha/Hora: ${fechaFormateada}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;


        // Cliente
        const lineasCliente = this.dividirTexto(datos.cliente, 50);
        for (let linea = 0; linea < lineasCliente.length; linea++) {
            if (linea === 0) {
                doc.text(`Cliente: ${lineasCliente[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
            else {
                doc.text(lineasCliente[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
        }

        // RUC Cliente
        doc.text(`RUC: ${datos.rucCliente}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Dirección Cliente
        const lineasDirCliente = this.dividirTexto(datos.direccionCliente || '', 40);
        for (let linea = 0; linea < lineasDirCliente.length; linea++) {
            if (linea === 0) {
                doc.text(`Dirección: ${lineasDirCliente[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
            else {
                doc.text(lineasDirCliente[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 5;
            }
        }

        // Teléfono Cliente
        doc.text(`Telef.: ${datos.telefonoCliente || 'N/A'}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Vendedor
        doc.text(`Vendedor/a: ${datos.vendedor}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja la información de la venta
     */
    private dibujarInfoVenta(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        // Forma de Venta
        doc.text(`Forma de Venta: ${datos.formaVenta}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Timbrado
        doc.setFont("helvetica", "normal");
        doc.text(`Timbrado: ${datos.timbrado}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Fecha Inicio Vigencia
        const fechaVigencia = this.formatearFecha(datos.fechaInicioVigencia);
        doc.text(`Fecha Inicio Vigencia: ${fechaVigencia}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja el número de factura
    */
    private dibujarNumeroFactura(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Nro.Factura: ${datos.nroFactura}`, this.MARGEN_IZQ, this.posY);
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja el encabezado de la tabla de items
    */
    private dibujarEncabezadoTabla(doc: jsPDF): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        // Encabezados de columnas
        doc.text('Cant.', this.MARGEN_IZQ, this.posY);
        doc.text('Mercaderia', this.MARGEN_IZQ + 12, this.posY);
        doc.text('Prec.Unit.', this.MARGEN_IZQ + 40, this.posY);
        doc.text('SubtTotal', this.MARGEN_IZQ + 60, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los items de la factura
    */
    private dibujarItems(doc: jsPDF, items: ItemFactura[]): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        items.forEach(item => {
            // Código
            doc.text(item.codigo.toString(), this.MARGEN_IZQ, this.posY);
            this.posY += 4;

            // Cantidad, Mercadería y Precio
            doc.text(item.cantidad.toString(), this.MARGEN_IZQ, this.posY);
            this.posY -= 4;

            // Dividir mercadería si es muy larga
            const lineasMercaderia = this.dividirTexto(item.mercaderia, 14);
            lineasMercaderia.forEach((linea, index) => {
                if (index === 0) {
                    doc.text(linea, this.MARGEN_IZQ + 12, this.posY);
                    doc.text(this.formatearNumero(item.precio, 0), this.MARGEN_IZQ + 43, this.posY);
                } else {
                    this.posY += 4;
                    doc.text(linea, this.MARGEN_IZQ + 12, this.posY);
                }
            });


            // IVA
            doc.text(`${item.porcentajeImpuesto}%`, this.MARGEN_IZQ + 43, this.posY);
            this.posY -= 4;

            // Subtotal - alineado a la derecha
            const subtotalStr = this.formatearNumero(item.subtotal, 0);
            doc.text(subtotalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
            this.posY += 9;
        });

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los totales
     */
    private dibujarTotales(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        const totalStr = this.formatearNumero(datos.total, 0);
        doc.text('TOTAL Gs.:', this.MARGEN_IZQ, this.posY);
        doc.text(totalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 6;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja la liquidación del IVA
    */
    private dibujarLiquidacionIVA(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text('Liquidación del IVA', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        // Gravadas 10%
        const grav10Str = this.formatearNumero(datos.gravada10, 0);
        doc.text(`Gravadas 10%: `, this.MARGEN_IZQ, this.posY);
        doc.text(grav10Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 4;

        // Gravadas 5%
        const grav5Str = this.formatearNumero(datos.gravada5, 0);
        doc.text(`Gravadas 5%: `, this.MARGEN_IZQ, this.posY);
        doc.text(grav5Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 4;

        // Exenta
        const exentaStr = this.formatearNumero(datos.exenta, 0);
        doc.text(`Exenta: `, this.MARGEN_IZQ, this.posY);
        doc.text(exentaStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 5;

        this.dibujarLinea(doc);

        // IVA 10%
        const iva10Str = this.formatearNumero(datos.iva10, 0);
        doc.text(`I.V.A. 10%: `, this.MARGEN_IZQ, this.posY);
        doc.text(iva10Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 4;

        // IVA 5%
        const iva5Str = this.formatearNumero(datos.iva5, 0);
        doc.text(`I.V.A. 5%: `, this.MARGEN_IZQ, this.posY);
        doc.text(iva5Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 4;

        // Total IVA
        doc.setFont("helvetica", "bold");
        const totalIvaStr = this.formatearNumero(datos.totalIva, 0);
        doc.text(`Total I.V.A.: `, this.MARGEN_IZQ, this.posY);
        doc.text(totalIvaStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 6;
    }

    /**
     * Formatea fecha a string
    */
    private formatearFecha(fecha: Date): string {
        const fechaObj = new Date(fecha);
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaObj.getFullYear();
        const horas = fechaObj.getHours().toString().padStart(2, '0');
        const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }
    /**
     * Dibuja una línea separadora
     */
    private dibujarLinea(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('------------------------------------------------------------------------', this.MARGEN_IZQ, this.posY);
        this.posY += 5;
    }

    /**
     * Formatea números con separadores de miles
     */
    private formatearNumero(numero: number, decimales: number = 0): string {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        }).format(numero);
    }

    /**
     * Trunca texto si excede el límite
     */
    private truncarTexto(texto: string, maxLength: number): string {
        if (!texto) return '';
        return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
    }

    /**
     * Divide texto en múltiples líneas
     */
    private dividirTexto(texto: string, maxLength: number): string[] {
        if (!texto) return [''];

        const palabras = texto.split(' ');
        const lineas: string[] = [];
        let lineaActual = '';

        palabras.forEach(palabra => {
            if ((lineaActual + palabra).length <= maxLength) {
                lineaActual += (lineaActual ? ' ' : '') + palabra;
            } else {
                if (lineaActual) lineas.push(lineaActual);
                lineaActual = palabra;
            }
        });

        if (lineaActual) lineas.push(lineaActual);
        return lineas;
    }
}


// Exportar instancias únicas de los servicios
export const ticketService = new TicketService();
export const facturaService = new FacturaService();
export default facturaService;
