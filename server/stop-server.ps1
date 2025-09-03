$pid = Get-Content -Path ".pidfile"
Stop-Process -Id $pid -Force
Remove-Item -Path ".pidfile"
Write-Host "Servidor detenido."
