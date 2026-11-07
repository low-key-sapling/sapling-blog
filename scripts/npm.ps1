$NpmArguments = $args
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$version = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
$runtime = Join-Path $projectRoot ".runtime/node-v$version-win-x64"
if (-not (Test-Path -LiteralPath (Join-Path $runtime 'node.exe'))) {
  throw '项目 Node 环境尚未准备，请运行 ./scripts/setup-node.ps1，或在 Node 24 环境直接使用 npm。'
}
$env:Path = "$runtime;$env:Path"
if ($NpmArguments.Count -gt 2 -and $NpmArguments[0] -eq 'run' -and $NpmArguments[2] -ne '--') {
  $NpmArguments = @($NpmArguments[0], $NpmArguments[1], '--') + $NpmArguments[2..($NpmArguments.Count - 1)]
}
Push-Location -LiteralPath $projectRoot
try { & (Join-Path $runtime 'npm.cmd') @NpmArguments; exit $LASTEXITCODE }
finally { Pop-Location }
