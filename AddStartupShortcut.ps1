# Create shortcut in the Startup folder
$WshShell = New-Object -comObject WScript.Shell
$StartupFolder = [Environment]::GetFolderPath('Startup')
$Shortcut = $WshShell.CreateShortcut("$StartupFolder\Screen Keep-Alive.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-WindowStyle Minimized -ExecutionPolicy Bypass -File `"$env:USERPROFILE\Desktop\ScreenKeepAlive.ps1`""
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.Save()

Write-Host "Screen Keep-Alive has been added to startup. It will automatically activate when you log in."
Write-Host "Startup shortcut created at: $StartupFolder\Screen Keep-Alive.lnk"
Write-Host "To remove from startup, delete the shortcut from: $StartupFolder"

