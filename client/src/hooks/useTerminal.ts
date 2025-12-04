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
 *   const { idTerminalWeb, idDepositoRemision, idSucursal } = useTerminal();
 *   
 *   return (
 *     <div>
 *       <p>Terminal ID: {idTerminalWeb}</p>
 *       <p>Sucursal ID: {idSucursal}</p>
 *       <p>Depósito Remisión: {idDepositoRemision}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useTerminal = () => {
  const terminalInfo = useAppSelector(selectTerminalInfo);
  const isValidated = useAppSelector(selectIsTerminalValidated);

  return {
    isValidated,
    idTerminalWeb: terminalInfo.idTerminalWeb,
    token: terminalInfo.token,
    idSucursal: terminalInfo.idSucursal,
    idFactura: terminalInfo.idFactura,
    idDepositoVenta: terminalInfo.idDepositoVenta,
    idDepositoRemision: terminalInfo.idDepositoRemision,
    idDepositoCompra: terminalInfo.idDepositoCompra,
  };
};

export default useTerminal;
