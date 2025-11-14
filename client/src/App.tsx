import { useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import AppRouter from './AppRouter';
import './App.css';
import { obtenerOgenerarToken, validarTerminal } from './services/terminal.service';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setLoading, setTerminalValidated, setTerminalError, selectIsTerminalValidated, selectTerminalLoading, selectTerminalError, selectTerminalInfo } from './store/terminalSlice';
import TerminalNotEnabled from './components/TerminalNotEnabled';

function App() {
  const dispatch = useAppDispatch();
  const isValidated = useAppSelector(selectIsTerminalValidated);
  const isLoading = useAppSelector(selectTerminalLoading);
  const error = useAppSelector(selectTerminalError);
  const terminalInfo = useAppSelector(selectTerminalInfo);

  useEffect(() => {
    const inicializarTerminal = async () => {
      dispatch(setLoading(true));
      
      try {
        const token = obtenerOgenerarToken();
        console.log('Token de terminal:', token);
        
        const response = await validarTerminal(token);
        console.log('Respuesta de validación:', response);
        
        if (response.success && response.terminal) {
          dispatch(setTerminalValidated({
            idTerminalWeb: response.terminal.idTerminalWeb,
            nombreSucursal: response.terminal.nombreSucursal,
            nombreDeposito: response.terminal.nombreDeposito,
            token: response.terminal.token,
          }));
        }
      } catch (error: any) {
        console.error('Error de validación de terminal:', error);
        const token = obtenerOgenerarToken();
        const errorMessage = error.response?.data?.message || 'Terminal no encontrada o no válida';
        dispatch(setTerminalError({ error: errorMessage, token }));
      }
    };

    inicializarTerminal();
  }, [dispatch]);

  // Mostrar loading mientras se valida
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <div>Validando terminal...</div>
      </Box>
    );
  }

  // Mostrar pantalla de error si la terminal no está habilitada
  if (error && !isValidated) {
    return <TerminalNotEnabled token={terminalInfo.token || ''} />;
  }

  // Mostrar la aplicación si la terminal está validada
  return (
    <div>
      <AppRouter />
    </div>
  );
}

export default App;