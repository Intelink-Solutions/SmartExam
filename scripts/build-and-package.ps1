$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$artifactsDir = Join-Path $root 'artifacts'
$frontendStage = Join-Path $artifactsDir 'frontend'
$backendStage = Join-Path $artifactsDir 'backend'

Write-Host '==> Cleaning artifacts...'
if (Test-Path $artifactsDir) {
    Remove-Item -Path $artifactsDir -Recurse -Force
}
New-Item -Path $artifactsDir -ItemType Directory | Out-Null
New-Item -Path $frontendStage -ItemType Directory | Out-Null
New-Item -Path $backendStage -ItemType Directory | Out-Null

Write-Host '==> Building frontend (Vite production build)...'
Push-Location $root
npm run build
Pop-Location

Write-Host '==> Staging frontend files...'
Copy-Item -Path (Join-Path $root 'dist\*') -Destination $frontendStage -Recurse -Force
if (Test-Path (Join-Path $root 'cpanel\frontend.htaccess.example')) {
    Copy-Item -Path (Join-Path $root 'cpanel\frontend.htaccess.example') -Destination (Join-Path $frontendStage '.htaccess') -Force
}

Write-Host '==> Staging backend files...'
$backendRoot = Join-Path $root 'backend'
$backendExcludeTop = @(
    '.env',
    'vendor',
    'node_modules',
    'storage\logs',
    'storage\framework\cache',
    'storage\framework\sessions',
    'storage\framework\views',
    '.phpunit.result.cache'
)

Get-ChildItem -Path $backendRoot -Force | ForEach-Object {
    $name = $_.Name
    if ($backendExcludeTop -contains $name) { return }

    $destination = Join-Path $backendStage $name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $destination -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination $destination -Force
    }
}

if (Test-Path (Join-Path $backendRoot '.env.cpanel.example')) {
    Copy-Item -Path (Join-Path $backendRoot '.env.cpanel.example') -Destination (Join-Path $backendStage '.env.example') -Force
}

Write-Host '==> Creating zip archives...'
$frontendZip = Join-Path $artifactsDir 'frontend-cpanel.zip'
$backendZip = Join-Path $artifactsDir 'backend-cpanel.zip'

Compress-Archive -Path (Join-Path $frontendStage '*') -DestinationPath $frontendZip -Force
Compress-Archive -Path (Join-Path $backendStage '*') -DestinationPath $backendZip -Force

Write-Host '==> Done.'
Write-Host "Frontend package: $frontendZip"
Write-Host "Backend package:  $backendZip"
Write-Host 'Upload frontend ZIP contents to public_html and backend ZIP contents to your backend app folder in cPanel.'
