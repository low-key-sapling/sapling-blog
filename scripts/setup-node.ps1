$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$version = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
$runtime = Join-Path $projectRoot '.runtime'
$file = "node-v$version-win-x64.zip"
$archive = Join-Path $runtime $file
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
Invoke-WebRequest -Uri "https://nodejs.org/dist/v$version/$file" -OutFile $archive
$hashes = (Invoke-WebRequest -Uri "https://nodejs.org/dist/v$version/SHASUMS256.txt").Content
$expected = (($hashes -split "`n" | Where-Object { $_ -match "  $([regex]::Escape($file))$" }) -split '\s+')[0]
if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'Node 下载校验失败。' }
Expand-Archive -LiteralPath $archive -DestinationPath $runtime -Force
Write-Output "已准备项目 Node $version。运行 ./scripts/npm.ps1 ci 安装依赖。"
