import axios from 'axios';
import type { Persona } from '../types/persona.types';

// URL base del API - ajusta según tu configuración
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Interface para la respuesta del endpoint persona/info
 */
interface PersonaInfoResponse {
  succes: boolean;
  message: string;
  result: PersonaInfo[];
}

/**
 * Interface para la respuesta del API al insertar una persona
 */
interface InsertarPersonaResponse {
  success: boolean;
  message: string;
  rowsAffected?: number;
}

/**
 * Interface para los datos completos de persona desde persona/info
 * Actualizada según sp_consultaInformacionPersona
 */
interface PersonaInfo {
  // Campos de persona
  idPersona: number;
  nombre: string;
  ruc?: string;
  dv?: string;
  direccion?: string;
  fechaNacimiento?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  
  // Campos de ubicación
  idCiudad: number;
  nombreCiudad: string;
  idDistrito: number;
  nombreDistrito: string;      // Nombre del distrito
  idDepartamento: number;
  nombreDepartamento: string;  // Nombre del departamento
  
  // Campos de personaFis
  apellido?: string;
  
  // Campos de personaJur
  nombreFantasia?: string | null;
  
  // Campos de proveedor
  responsable?: string | null;
  timbrado?: string | null;
  
  // Campos de cliente
  codigo?: number;
  idGrupoCliente?: number;
  nombreGrupoCliente?: string;
}

/**
 * Servicio para manejar las operaciones relacionadas con Personas
 */
export const personaService = {
  /**
   * Inserta una nueva persona en el sistema
   * @param persona - Datos de la persona a insertar
   * @returns Respuesta del servidor
   */
  insertarPersona: async (persona: Persona): Promise<InsertarPersonaResponse> => {
    try {
      const response = await axios.post<InsertarPersonaResponse>(
        `${API_BASE_URL}/persona`,
        persona
      );
      return response.data;
    } catch (error: any) {
      // Manejar errores del servidor
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al insertar la persona');
      }
      throw new Error('Error de conexión con el servidor');
    }
  },

  /**
   * Busca personas por término de búsqueda
   * @param searchTerm - Término a buscar
   * @param searchBy - Campo por el cual buscar
   * @returns Lista de personas encontradas
   */
  buscarPersonas: async (
    searchTerm: string,
    searchBy: number
  ): Promise<Persona[]> => {
    try {
      // TODO: Implementar endpoint de búsqueda en el backend
      const response = await axios.get<Persona[]>(
        `${API_BASE_URL}/persona/consulta`,
        {
          params: {
            "tipoBusqueda": searchBy, 
            "busqueda": searchTerm
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar personas:', error);
      throw new Error('Error al buscar personas');
    }
  },

  /**
   * Obtiene información detallada de una persona por su ID
   * @param idPersona - ID de la persona
   * @returns Información completa de la persona
   */
  obtenerInfoPersona: async (idPersona: number): Promise<PersonaInfo[]> => {
    try {
      const response = await axios.get<PersonaInfoResponse>(
        `${API_BASE_URL}/persona/info`,
        {
          params: {
            idPersona: idPersona
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al obtener información de la persona:', error);
      throw new Error('Error al obtener información de la persona');
    }
  },

  /**
   * Consulta una persona por su RUC
   * @param ruc - RUC de la persona a buscar
   * @returns Información completa de la persona
   */
  consultarPersonaPorRuc: async (ruc: string): Promise<PersonaInfo[]> => {
    try {
      const response = await axios.get<PersonaInfoResponse>(
        `${API_BASE_URL}/persona/consultaRuc`,
        {
          params: {
            ruc: ruc
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar persona por RUC:', error);
      throw new Error('Error al consultar persona por RUC');
    }
  }
};
