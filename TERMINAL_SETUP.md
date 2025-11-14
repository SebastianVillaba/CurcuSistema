# Sistema de Validación de Terminal

Este documento explica cómo funciona el sistema de validación de terminales en CurcuSistema.

## 🎯 Objetivo

Identificar y validar cada PC/terminal que accede al sistema mediante un token único almacenado en `localStorage`.

## 🔧 Arquitectura

### Backend

1. **Controller**: `server/src/controllers/terminal.controller.ts`
   - Endpoint: `POST /api/terminal/validar`
   - Valida el token contra la base de datos usando `sp_consultaTerminalWeb`
   - Retorna información de la terminal si es válida

### Frontend

1. **Redux Store**: `client/src/store/terminalSlice.ts`
   - Gestiona el estado global de la terminal
   - Estados: `isValidated`, `isLoading`, `error`, `terminal`

2. **Servicio**: `client/src/services/terminal.service.ts`
   - `obtenerOgenerarToken()`: Obtiene o genera un token único
   - `validarTerminal(token)`: Valida el token con el backend

3. **Componentes**:
   - `TerminalNotEnabled`: Pantalla de advertencia cuando la terminal no está habilitada
   - `App.tsx`: Valida la terminal al iniciar la aplicación

## 🚀 Flujo de Funcionamiento

1. **Al iniciar la aplicación**:
   ```
   App.tsx → obtenerOgenerarToken() → validarTerminal() → Redux Store
   ```

2. **Si el token es válido**:
   - Se guarda la información en Redux
   - Se muestra la aplicación normal
   - La información de la terminal está disponible globalmente vía Redux

3. **Si el token NO es válido**:
   - Se muestra `TerminalNotEnabled` con el token
   - El usuario puede copiar el token
   - Debe contactar a un administrador para habilitar la terminal

## 📝 Uso en Componentes

### Acceder a la información de la terminal

```tsx
import { useTerminal } from '../hooks/useTerminal';

const MyComponent = () => {
  const { idTerminalWeb, nombreSucursal, nombreDeposito, token, isValidated } = useTerminal();

  return (
    <div>
      <p>Terminal ID: {idTerminalWeb}</p>
      <p>Sucursal: {nombreSucursal}</p>
      <p>Depósito: {nombreDeposito}</p>
    </div>
  );
};
```

### Acceder directamente al store de Redux

```tsx
import { useAppSelector } from '../store/hooks';
import { selectTerminalInfo } from '../store/terminalSlice';

const MyComponent = () => {
  const terminal = useAppSelector(selectTerminalInfo);
  
  // terminal.idTerminalWeb
  // terminal.nombreSucursal
  // terminal.nombreDeposito
  // terminal.token
};
```

## 🔐 Seguridad

- El token se genera con `crypto.randomUUID()` (UUID v4)
- Se almacena en `localStorage` con la clave `terminalToken`
- El token se valida una vez al inicio de la aplicación
- La información de la terminal está disponible en Redux para toda la aplicación

## 🛠️ Administración

Para habilitar una nueva terminal:

1. El usuario abre la aplicación en la PC nueva
2. Se genera un token automáticamente
3. Se muestra la pantalla de advertencia con el token
4. El usuario copia el token y lo pasa al administrador
5. El administrador añade el token a la base de datos usando el procedimiento almacenado correspondiente
6. El usuario recarga la página y ya puede acceder al sistema

## 📦 Dependencias

- `@reduxjs/toolkit`: Gestión de estado
- `react-redux`: Integración de Redux con React
- `axios`: Cliente HTTP
- `@mui/material`: Componentes UI

## 🔄 Próximas Mejoras

- [ ] Panel de administración para gestionar terminales
- [ ] Logs de actividad por terminal
- [ ] Expiración de tokens
- [ ] Renovación automática de tokens
- [ ] Re-validación periódica de terminal
