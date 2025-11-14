import { useAppSelector } from '../store/hooks';
import { selectTerminalInfo, selectIsTerminalValidated } from '../store/terminalSlice';

/**
 * Hook personalizado para acceder a la información de la terminal
 * desde cualquier componente de la aplicación.
 * 
 * @returns Información de la terminal validada
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { idTerminalWeb, nombreSucursal, nombreDeposito, token } = useTerminal();
 *   
 *   return (
 *     <div>
 *       <p>Terminal ID: {idTerminalWeb}</p>
 *       <p>Sucursal: {nombreSucursal}</p>
 *       <p>Depósito: {nombreDeposito}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useTerminal = () => {
  const terminalInfo = useAppSelector(selectTerminalInfo);
  const isValidated = useAppSelector(selectIsTerminalValidated);

  return {
    ...terminalInfo,
    isValidated,
  };
};

export default useTerminal;
