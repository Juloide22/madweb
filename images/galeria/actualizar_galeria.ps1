# MADVIZ — Actualizador de Galería General
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$galeriaPath = Join-Path $scriptDir "images\galeria"

if (-not (Test-Path $galeriaPath)) {
    if ((Test-Path (Join-Path $scriptDir "galeria-datos.js")) -or ((Split-Path $scriptDir -Leaf) -eq "galeria")) {
        $galeriaPath = $scriptDir
    } else {
        Write-Host "[ERROR] No se encontro la carpeta images\galeria." -ForegroundColor Red
        exit 1
    }
}

$validExts = @('.jpg', '.jpeg', '.png', '.webp', '.avif')
$files = Get-ChildItem -Path $galeriaPath -File | Where-Object { $validExts -contains $_.Extension.ToLower() } | Sort-Object Name

if ($files.Count -eq 0) {
    Write-Host "[AVISO] No hay imagenes en la carpeta images\galeria." -ForegroundColor Yellow
} else {
    $items = $files | ForEach-Object { '  "' + $_.Name + '"' }
    $joined = $items -join ",`n"
    $dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $content = "// Generado automaticamente por actualizar_galeria.bat`n" +
               "// Ultima actualizacion: $dateStr`n`n" +
               "window.GALERIA_IMAGENES = [`n$joined`n];`n"
    $targetPath = Join-Path $galeriaPath "galeria-datos.js"
    [System.IO.File]::WriteAllText($targetPath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "[EXITO] Se encontraron $($files.Count) imagenes en 'images\galeria\'." -ForegroundColor Green
    Write-Host "[EXITO] 'galeria-datos.js' actualizado correctamente." -ForegroundColor Green
}
