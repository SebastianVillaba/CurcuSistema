import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
// Si la URL ya termina en '/delivery', recortarla para evitar duplicaciones
const API_URL = API_BASE.endsWith('/delivery') 
  ? API_BASE.substring(0, API_BASE.length - 9) 
  : API_BASE;

export const deliveryService = {
  getDeliveryActivo: async () => {
    // Apuntamos correctamente a /delivery/activo de forma robusta
    const response = await axios.get(`${API_URL}/delivery/activo`);
    return response.data;
  },
};
