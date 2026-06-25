-- 1. Modificar sp_insertarPersona para aceptar latitud y longitud
ALTER PROCEDURE [dbo].[sp_insertarPersona]
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
END
GO

-- 2. Modificar sp_modificarPersona para aceptar latitud y longitud
ALTER PROCEDURE [dbo].[sp_modificarPersona]
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
END
