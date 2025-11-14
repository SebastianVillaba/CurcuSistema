# 🖥️ Cómo Usar el Sistema de Terminal

## 📋 Resumen

El sistema de terminal permite identificar cada PC que accede a CurcuSistema mediante un token único. Cada terminal debe estar registrada en la base de datos para poder usar el sistema.

## 🚀 Inicio Rápido

### 1. Al abrir la aplicación por primera vez en una PC nueva

La aplicación automáticamente:
- Genera un token único (UUID)
- Lo guarda en `localStorage`
- Intenta validarlo con el backend
- Muestra una pantalla de advertencia si no está habilitado

### 2. Pantalla de Terminal No Habilitada

Si la terminal no está registrada, verás:
```
¡Este puesto no está habilitado!

Esta terminal no tiene permisos para acceder al sistema.
Por favor, pasa el siguiente token a un administrador para que te añada.

Token de Terminal:
[xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]

[Botón: Copiar Token]
```

### 3. Habilitar una Terminal (Administrador)

1. El usuario te pasa el token
2. Ejecuta el procedimiento almacenado para añadir la terminal:
   ```sql
   EXEC sp_insertarTerminalWeb 
     @terminalToken = 'token-del-usuario',
     @nombreSucursal = 'Sucursal Principal',
     @nombreDeposito = 'Depósito Central'
   ```
3. El usuario recarga la página
4. ¡Listo! Ya puede acceder al sistema

## 💻 Uso en Componentes

### Opción 1: Usar el Hook `useTerminal` (Recomendado)

```tsx
import { useTerminal } from '../hooks/useTerminal';

const MiComponente = () => {
  const { idTerminalWeb, nombreSucursal, nombreDeposito, token, isValidated } = useTerminal();

  return (
    <div>
      <h2>Información de Terminal</h2>
      <p>ID: {idTerminalWeb}</p>
      <p>Sucursal: {nombreSucursal}</p>
      <p>Depósito: {nombreDeposito}</p>
    </div>
  );
};
```

### Opción 2: Usar Redux directamente

```tsx
import { useAppSelector } from '../store/hooks';
import { selectTerminalInfo, selectIsTerminalValidated } from '../store/terminalSlice';

const MiComponente = () => {
  const terminal = useAppSelector(selectTerminalInfo);
  const isValidated = useAppSelector(selectIsTerminalValidated);

  if (!isValidated) {
    return <div>Terminal no validada</div>;
  }

  return (
    <div>
      <p>Terminal ID: {terminal.idTerminalWeb}</p>
      <p>Sucursal: {terminal.nombreSucursal}</p>
    </div>
  );
};
```

### Opción 3: Mostrar Info de Terminal en el Layout

```tsx
import TerminalInfo from '../components/TerminalInfo';

const Layout = () => {
  return (
    <div>
      <header>
        <TerminalInfo />
      </header>
      {/* resto del layout */}
    </div>
  );
};
```

## 🔧 Configuración del Backend

### Variables de Entorno

No se requieren variables adicionales. El sistema usa el procedimiento almacenado `sp_consultaTerminalWeb`.

### Endpoint

```
POST /api/terminal/validar
Body: { terminalToken: "uuid-del-token" }

Respuesta exitosa:
{
  "success": true,
  "message": "Terminal validada correctamente",
  "terminal": {
    "idTerminalWeb": 1,
    "nombreSucursal": "Sucursal Principal",
    "nombreDeposito": "Depósito Central",
    "token": "uuid-del-token"
  }
}

Respuesta de error:
{
  "success": false,
  "message": "Terminal no encontrada o no válida",
  "token": "uuid-del-token"
}
```

## 🔐 Seguridad

- ✅ Token único por PC (UUID v4)
- ✅ Almacenado en `localStorage`
- ✅ Validado contra la base de datos al inicio
- ✅ Información disponible globalmente en Redux
- ✅ No se puede acceder al sistema sin terminal habilitada

## 📊 Estado Global de Redux

El estado de la terminal está disponible globalmente:

```typescript
{
  terminal: {
    isValidated: boolean,
    isLoading: boolean,
    error: string | null,
    terminal: {
      idTerminalWeb: number | null,
      nombreSucursal: string | null,
      nombreDeposito: string | null,
      token: string | null
    }
  }
}
```

## 🎯 Casos de Uso

### 1. Mostrar información de la terminal en el header
```tsx
import { useTerminal } from '../hooks/useTerminal';

const Header = () => {
  const { nombreSucursal, nombreDeposito } = useTerminal();
  
  return (
    <header>
      <h1>CurcuSistema</h1>
      <p>{nombreSucursal} - {nombreDeposito}</p>
    </header>
  );
};
```

### 2. Usar información de terminal en peticiones
```tsx
import { useTerminal } from '../hooks/useTerminal';
import axios from 'axios';

const Productos = () => {
  const { idTerminalWeb } = useTerminal();
  
  const fetchProductos = async () => {
    // Puedes enviar el idTerminalWeb en el body o como parámetro si lo necesitas
    const response = await axios.get('/api/productos', {
      params: { idTerminalWeb }
    });
    return response.data;
  };
  
  // Usar con react-query, useEffect, etc.
};
```

### 3. Logs y auditoría
```tsx
import { useTerminal } from '../hooks/useTerminal';

const registrarAccion = async (accion: string) => {
  const { idTerminalWeb } = useTerminal();
  
  await axios.post('/api/logs', {
    accion,
    idTerminalWeb, // Saber qué terminal realizó la acción
    timestamp: new Date()
  });
};
```

## ❓ Preguntas Frecuentes

### ¿Qué pasa si borro el localStorage?
Se generará un nuevo token y tendrás que pedir al administrador que lo habilite nuevamente.

### ¿Puedo usar la misma terminal en múltiples navegadores?
No, cada navegador tendrá su propio token en `localStorage`. Cada uno debe ser habilitado por separado.

### ¿Cómo desactivo una terminal?
Elimina o desactiva el registro en la base de datos. La próxima vez que intente acceder, verá la pantalla de advertencia.

### ¿El token expira?
Actualmente no. El token es permanente hasta que se elimine del `localStorage` o de la base de datos.

## 🔄 Flujo Completo

```
1. Usuario abre la app
   ↓
2. App.tsx verifica si hay token en localStorage
   ↓
3. Si no hay → genera nuevo UUID
   ↓
4. Envía token al backend para validar
   ↓
5a. Token válido → Guarda info en Redux → Muestra app
5b. Token inválido → Muestra pantalla de advertencia
   ↓
6. Usuario copia token y lo pasa a admin
   ↓
7. Admin ejecuta SP para habilitar terminal
   ↓
8. Usuario recarga → Token ahora es válido → Accede al sistema
```

## 📝 Notas Importantes

- ⚠️ El sistema valida la terminal solo al inicio de la app
- ⚠️ Si necesitas re-validar, recarga la página
- ⚠️ La información de la terminal está en Redux, accesible desde cualquier componente
- ✅ Usa el hook `useTerminal()` para acceder a la info fácilmente
- ✅ Si necesitas enviar el `idTerminalWeb` en peticiones, hazlo manualmente según tu necesidad
