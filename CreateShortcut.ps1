#
# Script to create a desktop shortcut for the Screen Keep-Alive functionality
# This script creates a shortcut that launches the ScreenKeepAlive.ps1 script
# in a minimized window with execution policy bypassed
#

# Create a shell object to work with shortcuts
$WshShell = New-Object -comObject WScript.Shell

# Define the shortcut path using the user's profile environment variable
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Toggle Screen Keep-Alive.lnk")

# Set the target to PowerShell executable
$Shortcut.TargetPath = "powershell.exe"

# Configure the arguments to run our script minimized with execution policy bypassed
$Shortcut.Arguments = "-WindowStyle Minimized -ExecutionPolicy Bypass -File `"$env:USERPROFILE\Desktop\ScreenKeepAlive.ps1`""

# Use the default PowerShell icon
$Shortcut.IconLocation = "powershell.exe,0"

# Save the shortcut
$Shortcut.Save()

Write-Host "Shortcut created successfully at '$env:USERPROFILE\Desktop\Toggle Screen Keep-Alive.lnk'"

