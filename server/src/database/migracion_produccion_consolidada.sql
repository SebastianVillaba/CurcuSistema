USE curcuma;
GO

-- =================================================================================
-- SECCIÓN 1: MODIFICACIONES DE TABLAS E INSERCIONES DE COLUMNAS
-- =================================================================================

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
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cliente') AND name = 'longitud')
BEGIN
    ALTER TABLE cliente ADD longitud DECIMAL(9,6) NULL;
    PRINT 'Columna longitud agregada a la tabla cliente.';
END
ELSE
BEGIN
    PRINT 'La columna longitud ya existe en la tabla cliente.';
END
GO

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
GO

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
GO

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
GO


-- =================================================================================
-- SECCIÓN 2: NUEVOS STORED PROCEDURES (LOGÍSTICA Y DISTRIBUCIÓN)
-- =================================================================================

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


-- =================================================================================
-- SECCIÓN 3: MODIFICACIÓN DE STORED PROCEDURES EXISTENTES (CLIENTES Y PERSONAS)
-- =================================================================================

-- 14. Modificar sp_insertarPersona para soportar coordenadas de geolocalización
IF OBJECT_ID('sp_insertarPersona', 'P') IS NOT NULL
    DROP PROCEDURE sp_insertarPersona;
GO
CREATE PROCEDURE [dbo].[sp_insertarPersona]
	@nombre			 varchar(40),
	@apellido		 varchar(40),
	@ruc			 varchar(15),
	@dv				 varchar(2),
	@direccion		 varchar(50),
	@idCiudad		 varchar(30),
	@pais			 varchar(25),
	@telefono		 varchar(20),
	@celular		 varchar(20),
	@email			 varchar(50),
	@fechaNacimiento varchar(15),
	@idUsuarioAlta	 int,
	@idTipoDocumento int,
	-- para la persona juridica
	@nombreFantasia	 varchar(50),
	-- para el cliente
	@codigo					int,
	@idGrupoCliente			int,
	-- la variable del tipo de persona que se dara de alta
	@tipoPersonaJur			bit,
	-- si es persona juridica colocar como proveedor
	@tipoProveedor			bit,
	@responsableProveedor	varchar(30),
	@timbrado				varchar(20),
	@tipoPersonaFis			bit,
	@tipoPersonaCli			bit,
	@tipoPersonal			bit,
	@tipoDelivery			bit,
	-- nuevos parametros para geolocalizacion de cliente
	@latitud                decimal(9,6) = NULL,
	@longitud               decimal(9,6) = NULL
AS
BEGIN 
	declare @verrno int, @verrmsg varchar(255),@fechaNaci date
	begin tran
		--Validar
		--Si ya existe una persona con el mismo numero de ruc que no sea cero
		If Exists(Select * From persona Where ruc=@ruc and (@ruc <> '' or @ruc is null)) 
			begin 
				select @verrno=50000,
						@verrmsg='El RUC ingresado ya existe con otra persona!'
				goto error
			end 
	
		-- convertir la fecha de nacimiento
		if SUBSTRING(@fechaNacimiento,1,1)=''
		begin
			set @fechaNacimiento=''
		end 
		
		set @fechaNaci=CONVERT(date,@fechaNacimiento,103)
		

		Declare @idPersona int
		Insert Into persona(nombre,ruc,dv,direccion,idCiudad,fechaNacimiento,telefono,celular,
		email,idUsuarioAlta,idUsuarioMod,fechaMod,idTipoDocumento,pais)
		Values(@nombre,@ruc,@dv,@direccion,@idCiudad,@fechaNaci,@telefono,@celular,
		@email,@idUsuarioAlta,@idUsuarioAlta,getdate(),@idTipoDocumento,@pais)
		
		set @verrno=@@error
		if (@verrno <> 0)
			goto error

			-- traer el id de la persona dada de alta
			set @idPersona=SCOPE_IDENTITY(); -- Obtener el ID generated
			-----------------------------------------------------
			--  validar el tipo de persona que es la ingresada --
			-----------------------------------------------------
			-- Insertar la Persona Juridica
			if @tipoPersonaJur=1
			begin 
				Declare @idPersonaJur int
				Set @idPersonaJur = (Select IsNull(Max(idPersonaJur)+1,1) From PersonaJur)		
				Insert Into personaJur(idPersonaJur,idPersona,nombreFantasia,idUsuarioAlta,idUsuarioMod,fechaMod)
				Values(@idPersonaJur,@idPersona,@nombreFantasia,@idUsuarioAlta,@idUsuarioAlta,getdate())		
				set @verrno=@@error
				if (@verrno <> 0)
					goto error
				-- si es una persona juridica verificar si se le da de alta como proveedor
				if @tipoProveedor=1
				begin 
					set @idPersonaJur=(select max(idPersonaJur) from personaJur)
					Declare @idProveedor int
					Set @idProveedor = (Select IsNull(Max(idProveedor)+1,1) From proveedor)		
					insert into proveedor(idProveedor,idPersonaJur,responsable,timbrado,idUsuarioAlta,idUsuarioMod,fechaMod)
					values(@idProveedor,@idPersonaJur,@responsableProveedor,@timbrado,@idUsuarioAlta,@idUsuarioAlta,getdate())
					set @verrno=@@error
					if (@verrno <> 0)
						goto error
				end 						
				
			end 
			-- Insertar la Persona Fisica
			if @tipoPersonaFis=1
			begin 
				Declare @idPersonaFis int
				Set @idPersonaFis = (Select IsNull(Max(idPersonaFis)+1,1) From personaFis)		
				Insert Into personaFis(idPersonaFis,idPersona,apellido,idUsuarioAlta,idUsuarioMod,fechaMod)
				Values(@idPersonaFis,@idPersona,@apellido,@idUsuarioAlta,@idUsuarioAlta,getdate())		
				set @verrno=@@error
				if (@verrno <> 0)
					goto error	
				--Insertar el personal y vendedor	
				if @tipoPersonal=1 or @tipoDelivery=1
				begin
					Declare @idPersonal int
					insert into personal(idPersonaFis,idUsuarioAlta,fechaAlta,activo)
					values(@idPersonaFis,@idUsuarioAlta,GETDATE(),1)
					
					set @idPersonal = SCOPE_IDENTITY()
					
					if @tipoDelivery=1
					begin
						insert into delivery(idPersonaFis,activo,idUsuarioAlta,fechaAlta)
						values(@idPersonaFis,1,@idUsuarioAlta,GETDATE())
					end
				end
			end 
			-- Insertar Cliente
			if @tipoPersonaCli=1
			begin 
				-- si ya existe el codigo ingresado y no es cero
				if exists(select * from cliente where codigo=@codigo and @codigo > 0)
				begin
					select @verrno=50001,
					@verrmsg='El Codigo Ingresado ya existe con otra persona!'
				goto error				
				end 			
				-- si el codigo el cero
				if @codigo=0
				begin
					set @codigo=(select ISNULL(max(codigo)+1,1) from cliente)
				end 
				----------------------------------
				Declare @idCliente int
				Set @idCliente = (Select IsNull(Max(idCliente)+1,1) From cliente)		
				
				-- Se agregaron las columnas latitud y longitud a la inserción
				Insert Into cliente(idCliente,idPersona,codigo,idUsuarioAlta,idUsuarioMod,fechaMod,idGrupoCliente,latitud,longitud)
				Values(@idCliente,@idPersona,@codigo,@idUsuarioAlta,@idUsuarioAlta,getdate(),@idGrupoCliente,@latitud,@longitud)		
				set @verrno=@@error
				if (@verrno <> 0)
					goto error				
			end 
			
	commit transaction 
	Return @@rowcount
	error:
		raiserror @verrno @verrmsg
		rollback transaction
END;
GO

-- 15. Modificar sp_modificarPersona para soportar coordenadas de geolocalización
IF OBJECT_ID('sp_modificarPersona', 'P') IS NOT NULL
    DROP PROCEDURE sp_modificarPersona;
GO
CREATE PROCEDURE [dbo].[sp_modificarPersona]
	@idPersona       int,
	@nombre			 varchar(40),
	@apellido		 varchar(40),
	@ruc			 varchar(15),
	@dv				 varchar(2),
	@direccion		 varchar(50),
	@idCiudad		 int,
	@pais			 varchar(25),
	@telefono		 varchar(20),
	@celular		 varchar(20),
	@email			 varchar(50),
	@fechaNacimiento varchar(15),
	@idUsuarioMod	 int,
	@idTipoDocumento int,
	@activo          tinyint,
	
	@nombreFantasia	 varchar(50) = NULL,
	
	@responsableProveedor varchar(30) = NULL,
	@timbrado             varchar(20) = NULL,

	@tipoPersonal         bit = 0,
	@tipoPersonaJur       bit = 0,
	@tipoProveedor        bit = 0,
	@tipoPersonaFis       bit = 0,
	@tipoPersonaCli       bit = 0,
	@codigo               int = NULL,
	@idGrupoCliente       int = NULL,
	@tipoDelivery		  int = 0,
	-- nuevos parametros para geolocalizacion de cliente
	@latitud              decimal(9,6) = NULL,
	@longitud             decimal(9,6) = NULL
AS
BEGIN 
	declare @verrno int, @verrmsg varchar(255), @fechaNaci date
	begin tran
		
		If Exists(Select * From persona Where ruc=@ruc and (@ruc <> '' and @ruc is not null) and idPersona <> @idPersona) 
		begin 
			select @verrno=50000, @verrmsg='El RUC ingresado ya pertenece a otra persona.'
			goto error
		end 
		
		if SUBSTRING(@fechaNacimiento,1,1)='' OR @fechaNacimiento IS NULL
			set @fechaNaci = NULL
		else
			set @fechaNaci = CONVERT(date,@fechaNacimiento,103)

		UPDATE persona
		SET 
			nombre = @nombre,
			ruc = @ruc,
			dv = @dv,
			direccion = @direccion,
			idCiudad = @idCiudad,
			fechaNacimiento = @fechaNaci,
			telefono = @telefono,
			celular = @celular,
			email = @email,
			idTipoDocumento = @idTipoDocumento,
			pais = @pais,
			activo = @activo,
			idUsuarioMod = @idUsuarioMod,
			fechaMod = GETDATE()
		WHERE idPersona = @idPersona;

		set @verrno=@@error; if (@verrno <> 0) goto error

		-- 1. Persona Fisica / Personal
		DECLARE @idPersonaFis int
		SELECT @idPersonaFis = idPersonaFis FROM personaFis WHERE idPersona = @idPersona

		-- Si se marcó tipoPersonaFis=1 o tipoPersonal=1 o tipoDelivery=1 y no existe registro en personaFis, se inserta
		IF (@tipoPersonaFis = 1 OR @tipoPersonal = 1 OR @tipoDelivery = 1) AND @idPersonaFis IS NULL
		BEGIN
			SET @idPersonaFis = (Select IsNull(Max(idPersonaFis)+1,1) From personaFis)		
			Insert Into personaFis(idPersonaFis,idPersona,apellido,idUsuarioAlta,idUsuarioMod,fechaMod)
			Values(@idPersonaFis,@idPersona,@apellido,@idUsuarioMod,@idUsuarioMod,getdate())
			set @verrno=@@error; if (@verrno <> 0) goto error
		END
		
		-- Si existe registro en personaFis, actualizamos o hacemos seguimiento
		IF @idPersonaFis IS NOT NULL
		BEGIN
			UPDATE personaFis 
			SET idUsuarioMod = @idUsuarioMod,
				fechaMod = GETDATE()
			WHERE idPersona = @idPersona
			set @verrno=@@error; if (@verrno <> 0) goto error

			DECLARE @idPersonal int
			SELECT @idPersonal = idPersonal FROM personal WHERE idPersonaFis = @idPersonaFis
			
			DECLARE @idDelivery int
			select @idDelivery=idDelivery from delivery where idPersonaFis=@idPersonaFis

			-- LÓGICA PARA PERSONAL (INDEPENDIENTE)
			IF @tipoPersonal = 1
			BEGIN
				IF @idPersonal IS NULL
				BEGIN
					INSERT INTO personal(idPersonaFis, idUsuarioAlta, fechaAlta, activo)
					VALUES(@idPersonaFis, @idUsuarioMod, GETDATE(), 1)
					SET @idPersonal = SCOPE_IDENTITY()
				END
				ELSE
				BEGIN
					UPDATE personal
					SET activo = 1
					WHERE idPersonal = @idPersonal
				END
				set @verrno=@@error; if (@verrno <> 0) goto error
			END
			ELSE
			BEGIN
				IF @idPersonal IS NOT NULL
				BEGIN
					UPDATE personal
					SET activo = 0
					WHERE idPersonal = @idPersonal
				END
				set @verrno=@@error; if (@verrno <> 0) goto error
			END

			-- LÓGICA PARA DELIVERY (INDEPENDIENTE)
			IF @tipoDelivery = 1
			BEGIN
				IF NOT EXISTS(SELECT 1 FROM delivery WHERE idDelivery = @idDelivery)
				BEGIN
					INSERT INTO delivery(idPersonaFis, activo, fechaAlta, idUsuarioAlta)
					VALUES(@idPersonaFis, 1, GETDATE(), @idUsuarioMod)
				END
				ELSE
				BEGIN
					UPDATE delivery
					SET activo = 1,
						idUsuarioMod = @idUsuarioMod,
						fechaMod = GETDATE()
					WHERE idDelivery = @idDelivery
				END
				set @verrno=@@error; if (@verrno <> 0) goto error
			END
			ELSE
			BEGIN
				IF @idDelivery IS NOT NULL
				BEGIN
					IF EXISTS(SELECT 1 FROM delivery WHERE idDelivery = @idDelivery)
					BEGIN
						UPDATE delivery
						SET activo = 0,
							idUsuarioMod = @idUsuarioMod,
							fechaMod = GETDATE()
						WHERE idDelivery = @idDelivery
					END
				END
				set @verrno=@@error; if (@verrno <> 0) goto error
			END
		END

		-- 2. Persona Juridica / Proveedor
		DECLARE @idPersonaJur int
		SELECT @idPersonaJur = idPersonaJur FROM personaJur WHERE idPersona = @idPersona

		IF @tipoPersonaJur = 1 AND @idPersonaJur IS NULL
		BEGIN
			SET @idPersonaJur = (Select IsNull(Max(idPersonaJur)+1,1) From PersonaJur)		
			Insert Into personaJur(idPersonaJur,idPersona,nombreFantasia,idUsuarioAlta,idUsuarioMod,fechaMod)
			Values(@idPersonaJur,@idPersona,@nombreFantasia,@idUsuarioMod,@idUsuarioMod,getdate())
			set @verrno=@@error; if (@verrno <> 0) goto error
		END

		IF @idPersonaJur IS NOT NULL
		BEGIN
			UPDATE personaJur
			SET nombreFantasia = ISNULL(@nombreFantasia, nombreFantasia),
			    idUsuarioMod = @idUsuarioMod,
				fechaMod = GETDATE()
			WHERE idPersona = @idPersona
			set @verrno=@@error; if (@verrno <> 0) goto error
            
            -- Si es proveedor
            IF @tipoProveedor = 1
            BEGIN
                IF NOT EXISTS(SELECT 1 FROM proveedor WHERE idPersonaJur = @idPersonaJur)
                BEGIN
                    DECLARE @idProveedor int
                    Set @idProveedor = (Select IsNull(Max(idProveedor)+1,1) From proveedor)		
                    insert into proveedor(idProveedor,idPersonaJur,responsable,timbrado,idUsuarioAlta,idUsuarioMod,fechaMod)
                    values(@idProveedor,@idPersonaJur,@responsableProveedor,@timbrado,@idUsuarioMod,@idUsuarioMod,getdate())
                END
                ELSE
                BEGIN
                    UPDATE proveedor
                    SET responsable = ISNULL(@responsableProveedor, responsable),
                        timbrado = ISNULL(@timbrado, timbrado),
                        idUsuarioMod = @idUsuarioMod,
                        fechaMod = GETDATE()
                    WHERE idPersonaJur = @idPersonaJur
                END
                set @verrno=@@error; if (@verrno <> 0) goto error
            END
		END

		-- 3. Cliente
		IF @tipoPersonaCli = 1
		BEGIN
			IF NOT EXISTS(SELECT 1 FROM cliente WHERE idPersona = @idPersona)
			BEGIN
				-- Si el código ya existe y es mayor a 0
				IF EXISTS(SELECT 1 FROM cliente WHERE codigo = @codigo AND @codigo > 0)
				BEGIN
					SELECT @verrno=50001, @verrmsg='El Codigo Ingresado ya existe con otra persona!'
					GOTO error
				END

				IF @codigo = 0 OR @codigo IS NULL
				BEGIN
					SET @codigo = (SELECT ISNULL(MAX(codigo)+1,1) FROM cliente)
				END

				DECLARE @idCliente int
				SET @idCliente = (SELECT ISNULL(MAX(idCliente)+1,1) FROM cliente)

				-- Se agregaron las columnas latitud y longitud a la inserción
				INSERT INTO cliente(idCliente, idPersona, codigo, idUsuarioAlta, idUsuarioMod, fechaMod, idGrupoCliente, latitud, longitud)
				VALUES(@idCliente, @idPersona, @codigo, @idUsuarioMod, @idUsuarioMod, GETDATE(), @idGrupoCliente, @latitud, @longitud)
				set @verrno=@@error; if (@verrno <> 0) goto error
			END
			ELSE
			BEGIN
				-- Se agregaron las columnas latitud y longitud a la actualización
				UPDATE cliente
				SET codigo = ISNULL(NULLIF(@codigo, 0), codigo),
					idGrupoCliente = @idGrupoCliente,
					idUsuarioMod = @idUsuarioMod,
					fechaMod = GETDATE(),
					latitud = @latitud,
					longitud = @longitud
				WHERE idPersona = @idPersona
				set @verrno=@@error; if (@verrno <> 0) goto error
			END
		END

	commit transaction 
	Return @@rowcount

	error:
		raiserror @verrno @verrmsg
		rollback transaction
END;
GO

-- 16. Modificar sp_consultaInformacionPersona para retornar coordenadas
IF OBJECT_ID('sp_consultaInformacionPersona', 'P') IS NOT NULL
    DROP PROCEDURE sp_consultaInformacionPersona;
GO
CREATE PROCEDURE [dbo].[sp_consultaInformacionPersona]
	@idPersona	INT
AS
BEGIN
	SET NOCOUNT ON;
	
	select 
		p.idPersona, p.nombre, pf.apellido, p.ruc, p.dv, p.direccion, p.fechaNacimiento,
		p.telefono, p.celular, p.email, c.idCiudad, c.nombreCiudad, di.idDistrito, di.nombre as nombreDistrito, d.idDepartamento, d.nombre as nombreDepartamento,
		pf.idPersonaFis,
		pj.nombreFantasia,
		pro.responsable,
		pro.timbrado,
		cli.codigo,
		cli.latitud,
		cli.longitud,
		gc.idGrupoCliente,
		gc.nombreGrupoCliente,
		pe.idPersonal,
		del.idDelivery,
		tp.idTipoDocumento
	from persona p
	left join personaFis pf
		on p.idPersona=pf.idPersona
	left join personaJur pj
		on p.idPersona=pj.idPersona
	left join proveedor pro
		on pj.idPersonaJur=pro.idPersonaJur
	left join cliente cli
		on p.idPersona=cli.idPersona
	left join grupoCliente gc
		on cli.idGrupoCliente=gc.idGrupoCliente
	inner join ciudad c
		on p.idCiudad=c.idCiudad
	inner join distrito di
		on c.idDistrito=di.idDistrito
	inner join departamento d
		on di.idDepartamento=d.idDepartamento
	left join personal pe 
		on pe.idPersonaFis = pf.idPersonaFis and pe.activo = 1
	left join delivery del 
		on del.idPersonaFis = pf.idPersonaFis and del.activo = 1
	inner join tipoDocumento tp
		on tp.idTipoDocumento=p.idTipoDocumento
	where p.idPersona=@idPersona
END;
GO
