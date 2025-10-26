import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { InsertarProductoRequest, InsertarProductoResponse } from "../types/producto/producto.type";

/**
 * Controller para insertar una nueva persona en el sistema.
 * 
 * @param req
 * @param res
 * 
 */
export const insertarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    // PASO 1: Extraer todos los datos del body de la petición
    // Usamos destructuring para obtener cada campo del objeto req.body
    const {
      nombre,
      presentacion,
      codigo,
      codigoBarra,
      precio,
      costo,
      idUsuarioAlta
    } = req.body as InsertarProductoRequest;

    // PASO 2: Validar campos obligatorios
    // El nombre y el ID del usuario que da de alta son obligatorios
    if (!nombre || !idUsuarioAlta) {
      res.status(400).json({ 
        success: false,
        message: "El nombre y usuario son obligatorios" 
      });
      return;
    }

    // PASO 5: Preparar los parámetros para el stored procedure
    const inputs = [
      { name: 'nombre', type: sql.VarChar, value: nombre },
      { name: 'presentacion', type: sql.VarChar, value: presentacion || '' },
      { name: 'codigo', type: sql.Int, value: codigo || 0 },
      { name: 'codigoBarra', type: sql.VarChar, value: codigoBarra || '' },
      { name: 'precio', type: sql.Decimal, value: precio || 0 },
      { name: 'costo', type: sql.Decimal, value: costo || 0 },
      { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta }
    ];

    // PASO 6: Ejecutar el stored procedure
    // executeRequest es una función helper que maneja la conexión a la BD
    // - query: nombre del stored procedure
    // - inputs: array de parámetros de entrada
    // - isStoredProcedure: true indica que es un SP y no una query normal
    // Nota: usamos 'as any' porque TypeScript tiene problemas con los tipos de mssql
    // pero en runtime funcionará correctamente
    const result = await executeRequest({
      query: 'sp_insertarProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    // PASO 7: Verificar el resultado y enviar respuesta exitosa
    const rowsAffected = result.rowsAffected[0];
    
    res.status(201).json({ 
      success: true,
      message: "Producto insertado exitosamente",
      rowsAffected: rowsAffected
    } as InsertarProductoResponse);

  } catch (error: any) {
    // Lista de códigos de error de validación del SP
    const validationErrorCodes = [50000, 50001, 50002, 50003, 50004];
    // Verificar si es un error personalizado de validación del stored procedure
    if (validationErrorCodes.includes(error.number)) {
      // Devolver HTTP 400 Bad Request con el mensaje exacto del RAISERROR
      res.status(400).json({ 
        success: false,
        message: error.message || "Error de validación en los datos del producto."
      });
    } else {
      // Error genérico del servidor o de la base de datos
      res.status(500).json({ 
        success: false,
        message: "Error interno del servidor al insertar el producto.",
        error: error.message
      });
    }
  }
};