use curcuma
-- 1. Modificar la tabla de clientes para almacenar coordenadas (latitud y longitud)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cliente') AND name = 'latitud')
BEGIN
    ALTER TABLE cliente ADD latitud DECIMAL(9,6) NULL;
    PRINT 'Columna latitud agregada a la tabla cliente.';
END
ELSE
BEGIN
    PRINT 'La columna latitud ya existe en la tabla cliente.';
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cliente') AND name = 'longitud')
BEGIN
    ALTER TABLE cliente ADD longitud DECIMAL(9,6) NULL;
    PRINT 'Columna longitud agregada a la tabla cliente.';
END
ELSE
BEGIN
    PRINT 'La columna longitud ya existe en la tabla cliente.';
END
-- 2. Tabla de Zonas de Entrega
IF OBJECT_ID('zonaEntrega', 'U') IS NULL
BEGIN
    CREATE TABLE zonaEntrega (
        idZonaEntrega INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        descripcion VARCHAR(255) NULL,
        color VARCHAR(7) NOT NULL DEFAULT '#3f51b5', -- Hexadecimal del color
        limites NVARCHAR(MAX) NOT NULL, -- Coordenadas en formato JSON: [[lat1, lng1], [lat2, lng2], ...]
        costoEnvio MONEY NOT NULL DEFAULT 0,
        idDeliveryDefecto INT NULL, -- Repartidor asignado por defecto
        activo BIT NOT NULL DEFAULT 1,
        idUsuarioAlta INT NOT NULL,
        fechaAlta DATETIME NOT NULL DEFAULT GETDATE(),
        idUsuarioMod INT NULL,
        fechaMod DATETIME NULL,
        FOREIGN KEY (idDeliveryDefecto) REFERENCES delivery(idDelivery)
    );
    PRINT 'Tabla zonaEntrega creada.';
END
ELSE
BEGIN
    PRINT 'La tabla zonaEntrega ya existe.';
END
-- 3. Tabla de Hojas de Ruta (Cabecera)
IF OBJECT_ID('hojaRuta', 'U') IS NULL
BEGIN
    CREATE TABLE hojaRuta (
        idHojaRuta INT IDENTITY(1,1) PRIMARY KEY,
        nroHojaRuta VARCHAR(20) NOT NULL UNIQUE, -- Código autogenerado: HR-YYYYMMDD-XXX
        idDelivery INT NOT NULL, -- Asignado al repartidor
        fechaRuta DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        estado VARCHAR(20) NOT NULL DEFAULT 'Borrador', -- 'Borrador', 'En Camino', 'Completado', 'Anulado'
        observacion VARCHAR(255) NULL,
        idUsuarioAlta INT NOT NULL,
        fechaAlta DATETIME NOT NULL DEFAULT GETDATE(),
        idUsuarioMod INT NULL,
        fechaMod DATETIME NULL,
        FOREIGN KEY (idDelivery) REFERENCES delivery(idDelivery)
    );
    PRINT 'Tabla hojaRuta creada.';
END
ELSE
BEGIN
    PRINT 'La tabla hojaRuta ya existe.';
END
-- 4. Tabla de Detalle de Hoja de Ruta (detHojaRuta)
IF OBJECT_ID('detHojaRuta', 'U') IS NULL
BEGIN
    CREATE TABLE detHojaRuta (
        idDetHojaRuta INT IDENTITY(1,1) PRIMARY KEY,
        idHojaRuta INT NOT NULL,
        idPedido INT NOT NULL,
        orden INT NOT NULL, -- Secuencia de la parada
        activo BIT NOT NULL DEFAULT 1,
        FOREIGN KEY (idHojaRuta) REFERENCES hojaRuta(idHojaRuta),
        FOREIGN KEY (idPedido) REFERENCES pedido(idPedido)
    );
    PRINT 'Tabla detHojaRuta creada.';
END
ELSE
BEGIN
    PRINT 'La tabla detHojaRuta ya existe.';
END
-- ????????????????????????????????????????????????????????????????????????????????
-- STORED PROCEDURES
-- ????????????????????????????????????????????????????????????????????????????????
-- 5. SP para actualizar geolocalización de cliente
IF OBJECT_ID('sp_actualizarGeolocalizacionCliente', 'P') IS NOT NULL
    DROP PROCEDURE sp_actualizarGeolocalizacionCliente;
GO
CREATE PROCEDURE sp_actualizarGeolocalizacionCliente
    @idCliente INT,
    @latitud DECIMAL(9,6),
    @longitud DECIMAL(9,6)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE cliente
    SET latitud = @latitud,
        longitud = @longitud
    WHERE idCliente = @idCliente;
END;
GO
-- 6. SP para guardar/modificar Zonas de Entrega
IF OBJECT_ID('sp_guardarZonaEntrega', 'P') IS NOT NULL
    DROP PROCEDURE sp_guardarZonaEntrega;
GO
CREATE PROCEDURE sp_guardarZonaEntrega
    @idZonaEntrega INT = NULL,
    @nombre VARCHAR(50),
    @descripcion VARCHAR(255) = NULL,
    @color VARCHAR(7),
    @limites NVARCHAR(MAX),
    @costoEnvio MONEY,
    @idDeliveryDefecto INT = NULL,
    @idUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    IF @idZonaEntrega IS NULL OR @idZonaEntrega = 0
    BEGIN
        INSERT INTO zonaEntrega (nombre, descripcion, color, limites, costoEnvio, idDeliveryDefecto, activo, idUsuarioAlta, fechaAlta)
        VALUES (@nombre, @descripcion, @color, @limites, @costoEnvio, @idDeliveryDefecto, 1, @idUsuario, GETDATE());
    END
    ELSE
    BEGIN
        UPDATE zonaEntrega
        SET nombre = @nombre,
            descripcion = @descripcion,
            color = @color,
            limites = @limites,
            costoEnvio = @costoEnvio,
            idDeliveryDefecto = @idDeliveryDefecto,
            idUsuarioMod = @idUsuario,
            fechaMod = GETDATE()
        WHERE idZonaEntrega = @idZonaEntrega;
    END
END;
GO
-- 7. SP para listar Zonas de Entrega
IF OBJECT_ID('sp_listarZonasEntrega', 'P') IS NOT NULL
    DROP PROCEDURE sp_listarZonasEntrega;
GO
CREATE PROCEDURE sp_listarZonasEntrega
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        z.*,
        _vd.nombreDelivery as nombreDeliveryDefecto
    FROM zonaEntrega z inner join v_delivery _vd on z.idDeliveryDefecto=_vd.idDelivery
    WHERE z.activo = 1;
END;
GO
-- 8. SP para obtener pedidos pendientes de despacho por fecha
IF OBJECT_ID('sp_obtenerPedidosPendientesDespacho', 'P') IS NOT NULL
    DROP PROCEDURE sp_obtenerPedidosPendientesDespacho;
GO
CREATE PROCEDURE sp_obtenerPedidosPendientesDespacho
    @fechaEntrega DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.idPedido,
        (row_number() over(order by p.idPedido)),
        p.fechaEntrega,
        p.totalPedido,
        p.direccion as direccionPedido,
        c.idCliente,
        per.idPersona,
        per.nombre + ' ' + perfis.apellido as nombreCliente,
        per.telefono,
        per.celular,
        c.latitud,
        c.longitud,
        p.idDelivery,
        p.observacion
    FROM pedido p
    INNER JOIN cliente c ON p.idCliente = c.idCliente
    INNER JOIN persona per ON c.idPersona = per.idPersona
    INNER JOIN personaFis perfis on per.idPersona=perfis.idPersona
    WHERE p.activo = 1 
      AND p.pendiente = 1 
      AND CAST(p.fechaEntrega AS DATE) = @fechaEntrega;
END;
GO
-- 9. SP para guardar/modificar Hoja de Ruta
IF OBJECT_ID('sp_guardarHojaRuta', 'P') IS NOT NULL
    DROP PROCEDURE sp_guardarHojaRuta;
GO
CREATE PROCEDURE sp_guardarHojaRuta
    @idHojaRuta INT = NULL,
    @nroHojaRuta VARCHAR(20),
    @idDelivery INT,
    @fechaRuta DATE,
    @observacion VARCHAR(255) = NULL,
    @idUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    IF @idHojaRuta IS NULL OR @idHojaRuta = 0
    BEGIN
        INSERT INTO hojaRuta (nroHojaRuta, idDelivery, fechaRuta, estado, observacion, idUsuarioAlta, fechaAlta)
        VALUES (@nroHojaRuta, @idDelivery, @fechaRuta, 'Borrador', @observacion, @idUsuario, GETDATE());
        SELECT SCOPE_IDENTITY() as idHojaRuta;
    END
    ELSE
    BEGIN
        UPDATE hojaRuta
        SET idDelivery = @idDelivery,
            fechaRuta = @fechaRuta,
            observacion = @observacion,
            idUsuarioMod = @idUsuario,
            fechaMod = GETDATE()
        WHERE idHojaRuta = @idHojaRuta;
        SELECT @idHojaRuta as idHojaRuta;
    END
END;
GO
-- 10. SP para limpiar detalles de Hoja de Ruta antes de re-guardar
IF OBJECT_ID('sp_limpiarDetHojaRuta', 'P') IS NOT NULL
    DROP PROCEDURE sp_limpiarDetHojaRuta;
GO
CREATE PROCEDURE sp_limpiarDetHojaRuta
    @idHojaRuta INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE detHojaRuta
    SET activo = 0
    WHERE idHojaRuta = @idHojaRuta;
END;
GO
-- 11. SP para guardar detalle de Hoja de Ruta
IF OBJECT_ID('sp_guardarDetHojaRuta', 'P') IS NOT NULL
    DROP PROCEDURE sp_guardarDetHojaRuta;
GO
CREATE PROCEDURE sp_guardarDetHojaRuta
    @idHojaRuta INT,
    @idPedido INT,
    @orden INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM detHojaRuta WHERE idHojaRuta = @idHojaRuta AND idPedido = @idPedido)
    BEGIN
        UPDATE detHojaRuta
        SET orden = @orden,
            activo = 1
        WHERE idHojaRuta = @idHojaRuta AND idPedido = @idPedido;
    END
    ELSE
    BEGIN
        INSERT INTO detHojaRuta (idHojaRuta, idPedido, orden, activo)
        VALUES (@idHojaRuta, @idPedido, @orden, 1);
    END
    
    -- Vincular el pedido al repartidor de la hoja de ruta
    UPDATE pedido
    SET idDelivery = (SELECT idDelivery FROM hojaRuta WHERE idHojaRuta = @idHojaRuta)
    WHERE idPedido = @idPedido;
END;
GO
-- 12. SP para listar Hojas de Ruta
IF OBJECT_ID('sp_listarHojasRuta', 'P') IS NOT NULL
    DROP PROCEDURE sp_listarHojasRuta;
GO
CREATE PROCEDURE sp_listarHojasRuta
    @fecha DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hr.idHojaRuta,
        hr.nroHojaRuta,
        hr.fechaRuta,
        hr.estado,
        hr.observacion,
        hr.idDelivery,
        _vd.nombreDelivery,
        (SELECT COUNT(*) FROM detHojaRuta dhr WHERE dhr.idHojaRuta = hr.idHojaRuta AND dhr.activo = 1) as cantidadPedidos
    FROM hojaRuta hr inner join v_delivery _vd on _vd.idDelivery=hr.idDelivery
    WHERE @fecha IS NULL OR hr.fechaRuta = @fecha
    ORDER BY hr.fechaAlta DESC;
END;
GO
-- 13. SP para obtener los detalles de una Hoja de Ruta específica (pedidos incluidos)
IF OBJECT_ID('sp_obtenerDetallesHojaRuta', 'P') IS NOT NULL
    DROP PROCEDURE sp_obtenerDetallesHojaRuta;
GO
CREATE PROCEDURE sp_obtenerDetallesHojaRuta
    @idHojaRuta INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        dhr.idDetHojaRuta,
        dhr.orden,
        p.idPedido,
        (row_number() over(order by p.idPedido)),
        p.fechaEntrega,
        p.totalPedido,
        p.direccion as direccionPedido,
        c.idCliente,
        per.nombre as nombreCliente,
        perfis.apellido as apellidoCliente,
        per.telefono,
        per.celular,
        c.latitud,
        c.longitud,
        p.observacion
    FROM detHojaRuta dhr
    INNER JOIN pedido p ON dhr.idPedido = p.idPedido
    INNER JOIN cliente c ON p.idCliente = c.idCliente
    INNER JOIN persona per ON c.idPersona = per.idPersona
    INNER JOIN personaFis perfis on per.idPersona=perfis.idPersona
    WHERE dhr.idHojaRuta = @idHojaRuta 
      AND dhr.activo = 1
    ORDER BY dhr.orden ASC;
END;
GO
