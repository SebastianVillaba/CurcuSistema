export interface Persona {
  idPersona?: number;
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

export interface PersonaFormData extends Persona {}

export interface PersonaSearchParams {
  searchTerm?: string;
  searchBy?: 'nombre' | 'codigo' | 'ruc';
}
