import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { BuscarPersonaRequest, InsertarPersonaRequest, InsertarPersonaResponse } from "../types/Persona/persona.type";

/**
 * Controller para insertar una nueva persona en el sistema.
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Recibe los datos del body de la petición HTTP
 * 2. Valida que los campos obligatorios estén presentes
 * 3. Prepara los parámetros para el stored procedure
 * 4. Ejecuta el SP 'sp_insertarPersona' en la base de datos
 * 5. Retorna una respuesta exitosa o maneja los errores
 * 
 * LÓGICA DEL STORED PROCEDURE:
 * - Valida que el RUC no esté duplicado (si se proporciona)
 * - Inserta el registro base en la tabla 'persona'
 * - Si tipoPersonaJur=true: inserta en 'personaJur' y opcionalmente en 'proveedor'
 * - Si tipoPersonaFis=true: inserta en 'personaFis'
 * - Si tipoPersonaCli=true: inserta en 'cliente' (valida código único)
 * - Todo se ejecuta en una transacción (si algo falla, se revierte todo)
 * 
 * @param req - Objeto Request de Express que contiene los datos en req.body
 * @param res - Objeto Response de Express para enviar la respuesta HTTP
 */
export const insertarPersona = async (req: Request, res: Response): Promise<void> => {
  try {
    // PASO 1: Extraer todos los datos del body de la petición
    // Usamos destructuring para obtener cada campo del objeto req.body
    const {
      nombre,
      ruc,
      dv,
      direccion,
      ciudad,
      telefono,
      celular,
      email,
      fechaNacimiento,
      idUsuarioAlta,
      nombreFantasia,
      apellido,
      codigo,
      tipoPersonaJur,
      tipoProveedor,
      responsableProveedor,
      timbrado,
      tipoPersonaFis,
      tipoPersonaCli
    } = req.body as InsertarPersonaRequest;

    // PASO 2: Validar campos obligatorios
    // El nombre y el ID del usuario que da de alta son obligatorios
    if (!nombre || !idUsuarioAlta) {
      res.status(400).json({ 
        success: false,
        message: "Los campos 'nombre' e 'idUsuarioAlta' son obligatorios" 
      });
      return;
    }

    // PASO 3: Validar que al menos un tipo de persona esté seleccionado
    // Una persona debe ser al menos Jurídica o Física
    if (!tipoPersonaJur && !tipoPersonaFis) {
      res.status(400).json({ 
        success: false,
        message: "Debe especificar al menos un tipo de persona (Jurídica o Física)" 
      });
      return;
    }

    // PASO 4: Validaciones específicas según el tipo de persona
    // Si es Persona Jurídica, debe tener nombre de fantasía
    if (tipoPersonaJur && !nombreFantasia) {
      res.status(400).json({ 
        success: false,
        message: "Las Personas Jurídicas requieren 'nombreFantasia'" 
      });
      return;
    }

    // Si es Persona Física, debe tener apellido
    if (tipoPersonaFis && !apellido) {
      res.status(400).json({ 
        success: false,
        message: "Las Personas Físicas requieren 'apellido'" 
      });
      return;
    }

    // PASO 5: Preparar los parámetros para el stored procedure
    const inputs = [
      { name: 'nombre', type: sql.VarChar, value: nombre },
      { name: 'ruc', type: sql.VarChar, value: ruc || '' },
      { name: 'dv', type: sql.VarChar, value: dv || '' },
      { name: 'direccion', type: sql.VarChar, value: direccion || '' },
      { name: 'ciudad', type: sql.VarChar, value: ciudad || '' },
      { name: 'telefono', type: sql.VarChar, value: telefono || '' },
      { name: 'celular', type: sql.VarChar, value: celular || '' },
      { name: 'email', type: sql.VarChar, value: email || '' },
      { name: 'fechaNacimiento', type: sql.VarChar, value: fechaNacimiento || '' },
      { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
      { name: 'nombreFantasia', type: sql.VarChar, value: nombreFantasia || '' },
      { name: 'apellido', type: sql.VarChar, value: apellido || '' },
      { name: 'codigo', type: sql.Int, value: codigo || 0 },
      { name: 'tipoPersonaJur', type: sql.Bit, value: tipoPersonaJur ? 1 : 0 },
      { name: 'tipoProveedor', type: sql.Bit, value: tipoProveedor ? 1 : 0 },
      { name: 'responsableProveedor', type: sql.VarChar, value: responsableProveedor || '' },
      { name: 'timbrado', type: sql.VarChar, value: timbrado || '' },
      { name: 'tipoPersonaFis', type: sql.Bit, value: tipoPersonaFis ? 1 : 0 },
      { name: 'tipoPersonaCli', type: sql.Bit, value: tipoPersonaCli ? 1 : 0 }
    ];

    // PASO 6: Ejecutar el stored procedure
    // executeRequest es una función helper que maneja la conexión a la BD
    // - query: nombre del stored procedure
    // - inputs: array de parámetros de entrada
    // - isStoredProcedure: true indica que es un SP y no una query normal
    // Nota: usamos 'as any' porque TypeScript tiene problemas con los tipos de mssql
    // pero en runtime funcionará correctamente
    const result = await executeRequest({
      query: 'sp_insertarPersona',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    // PASO 7: Verificar el resultado y enviar respuesta exitosa
    // rowsAffected indica cuántas filas fueron modificadas en la BD
    const rowsAffected = result.rowsAffected[0];
    
    res.status(201).json({ 
      success: true,
      message: "Persona insertada exitosamente",
      rowsAffected: rowsAffected
    } as InsertarPersonaResponse);

  } catch (error: any) {
    // PASO 8: Manejo de errores
    console.error("Error en insertarPersona:", error);
    
    // Verificar si es un error personalizado del stored procedure
    // Los errores 50000 y 50001 son errores de validación del SP
    if (error.number === 50000 || error.number === 50001) {
      // Error de validación (RUC duplicado o código duplicado)
      res.status(400).json({ 
        success: false,
        message: error.message || "Error de validación en los datos"
      });
    } else {
      // Error genérico del servidor
      res.status(500).json({ 
        success: false,
        message: "Error al insertar la persona en el servidor",
        error: error.message
      });
    }
  }
};

export const buscarPersona = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipoBusqueda, busqueda } = req.query;

    // Validar que los parámetros existan
    if (!tipoBusqueda || !busqueda) {
      res.status(400).json({
        success: false,
        message: 'Los parámetros tipoBusqueda y busqueda son requeridos'
      });
      return;
    }

    // Convertir tipoBusqueda a número
    const tipoBusquedaNum = parseInt(tipoBusqueda as string, 10);
    if (isNaN(tipoBusquedaNum)) {
      res.status(400).json({
        success: false,
        message: 'El parámetro tipoBusqueda debe ser un número válido'
      });
      return;
    }

    // TODO: Implementar lógica de búsqueda con tipoBusquedaNum y busquedaStr
    const result = await executeRequest({
      query: 'sp_consultaPersona',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'tipoBusqueda',
          type: sql.Int,
          value: tipoBusquedaNum
        },
        {
          name: 'busqueda',
          type: sql.VarChar,
          value: busqueda
        }
      ]
    });

    const rowsAffected = result.rowsAffected[0];

    res.status(200).json({
      succes: true,
      message: 'Busqueda exitosa!',
      result: result.recordset,
      rowsAffected: rowsAffected
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar persona',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

export const buscarInfoPersona = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idPersona } = req.query;
    
    // Validar que el parámetro exista
    if (!idPersona) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idPersona es requeridos'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_consultaInformacionPersona',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idPersona',
          type: sql.Int,
          value: idPersona
        }
      ]
    });

    const rowsAffected = result.rowsAffected[0];

    res.status(200).json({
      succes: true,
      message: 'Busqueda exitosa!',
      result: result.recordset,
      rowsAffected: rowsAffected
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar persona',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}