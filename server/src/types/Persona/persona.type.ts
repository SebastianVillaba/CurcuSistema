

export interface InsertarPersonaRequest {
  nombre: string;                    
  ruc?: string;                      
  dv?: string;                       
  direccion?: string;                
  ciudad?: string;                   
  telefono?: string;                 
  celular?: string;                  
  email?: string;                    
  fechaNacimiento?: string;          
  idUsuarioAlta: number;             
  nombreFantasia?: string;           
  apellido?: string;                 
  codigo?: number;
  tipoPersonaJur: boolean;           
  tipoProveedor: boolean;            
  responsableProveedor?: string;     
  timbrado?: string;                 
  tipoPersonaFis: boolean;           
  tipoPersonaCli: boolean;           
}

export interface InsertarPersonaResponse {
  success: boolean;                  // Indica si la operación fue exitosa
  message: string;                   // Mensaje descriptivo del resultado
  rowsAffected?: number;             // Número de filas afectadas (opcional)
}

export interface BuscarPersonaRequest {
  tipoBusqueda: number;
  busqueda: string;
}