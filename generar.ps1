$CurrentDir = $PSScriptRoot
Set-Location -Path $CurrentDir

# Obtener los identificadores
$NombrePC = (Get-CimInstance Win32_ComputerSystem).Name
$SerialPlaca = (Get-CimInstance Win32_BaseBoard).SerialNumber

# Formatear la salida
$Output = "<nombrePc>$NombrePC</nombrePc><serialPlaca>$SerialPlaca</serialPlaca>"

# Escribir en el archivo
$Output | Out-File -FilePath configpc.txt -Encoding UTF8

Write-Host "---"
Write-Host "✅ Archivo configpc.txt creado exitosamente." -ForegroundColor Green
Write-Host "Ubicacion: $CurrentDir"
Write-Host "Contenido: $Output"
Write-Host "---"

# Mantener la ventana abierta para ver el resultado
Read-Host "Presione Enter para cerrar..."