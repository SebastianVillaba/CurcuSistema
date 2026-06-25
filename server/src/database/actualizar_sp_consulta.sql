ALTER PROCEDURE [dbo].[sp_consultaInformacionPersona]
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
END
