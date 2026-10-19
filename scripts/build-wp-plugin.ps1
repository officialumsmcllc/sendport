$pluginDir = "c:\Users\officialum1 llc\Desktop\sendport\plugins\wordpress"
$slug = "sendport-smtp-email-deliverability"
$targetDir = Join-Path $pluginDir $slug
$zipPath = Join-Path $pluginDir "$slug.zip"

if (Test-Path $targetDir) {
    Remove-Item -Recurse -Force $targetDir
}
New-Item -ItemType Directory -Path (Join-Path $targetDir "assets") -Force | Out-Null

Copy-Item (Join-Path $pluginDir "sendport-smtp\readme.txt") (Join-Path $targetDir "readme.txt")
Copy-Item (Join-Path $pluginDir "sendport-smtp\sendport-smtp.php") (Join-Path $targetDir "$slug.php")
Copy-Item (Join-Path $pluginDir "sendport-smtp\assets\icon-128x128.png") (Join-Path $targetDir "assets\icon-128x128.png")

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Push-Location $pluginDir
Compress-Archive -Path $slug -DestinationPath $zipPath -Force
Pop-Location

Write-Host "Created $zipPath successfully"
Get-Item $zipPath | Select-Object Name, Length
