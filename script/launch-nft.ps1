# Save current directory
$currentDir = Get-Location

# Change to ../sugar directory
Set-Location -Path "../sugar"

try {
    # Run sugar.exe launch
    Start-Process -FilePath ".\sugar.exe" -ArgumentList "launch" -Wait -NoNewWindow

    # Run sugar.exe guard add
    Start-Process -FilePath ".\sugar.exe" -ArgumentList "guard", "add" -Wait -NoNewWindow

    # Run sugar.exe guard sjow
    Start-Process -FilePath ".\sugar.exe" -ArgumentList "guard", "show" -Wait -NoNewWindow

    Write-Output "Launched Candy Machine NFT successfully."

    # Return to original directory
    Set-Location -Path $currentDir
}
catch {
    Write-Error "Failed to execute commands: $_"

    # Return to original directory
    Set-Location -Path $currentDir
}
