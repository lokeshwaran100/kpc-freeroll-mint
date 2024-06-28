param (
    [string]$merkleroot
)

$CONFIG_PATH = "../sugar/config.json"

# Define the path to your JSON file
$jsonFile = $CONFIG_PATH

function Format-Json([Parameter(Mandatory, ValueFromPipeline)][String] $json) {
    $indent = 0;
    ($json -Split "`n" | % {
        if ($_ -match '[\}\]]\s*,?\s*$') {
            # This line ends with ] or }, decrement the indentation level
            $indent--
        }
        $line = ('  ' * $indent) + $($_.TrimStart() -replace '":  (["{[])', '": $1' -replace ':  ', ': ')
        if ($_ -match '[\{\[]\s*$') {
            # This line ends with [ or {, increment the indentation level
            $indent++
        }
        $line
    }) -Join "`n"
}

try {
    # Load the JSON content from the file
    $jsonContent = Get-Content -Path $jsonFile -Raw | ConvertFrom-Json

    # Update the merkleRoot field in the allowList section
    $jsonContent.guards.groups | ForEach-Object {
        if ($_.guards.allowList -and $_.guards.allowList.merkleRoot) {
            $_.guards.allowList.merkleRoot = $merkleRoot
        }
    }

    # Convert the updated JSON back to string
    $jsonString = $jsonContent | ConvertTo-Json -Depth 10 | Format-Json

    # Save the updated JSON back to the file
    $jsonString | Set-Content -Path $jsonFile -Force

    # Write-Output "Whitelisted wallets updated successfully."
}
catch {
    Write-Error "Failed to update whitelisted wallets in config file: $_"
    exit 1
}


# Save current directory
$currentDir = Get-Location

# Change to ../sugar directory
Set-Location -Path "../sugar"

try {
    # Run sugar.exe guard add
    $pro = Start-Process -FilePath ".\sugar.exe" -ArgumentList "guard", "update" -Wait -NoNewWindow -PassThru
    if ($pro.ExitCode -ne 0) {
        throw "Failed to update candy guard"
    }

    # Run sugar.exe guard show
    $pro = Start-Process -FilePath ".\sugar.exe" -ArgumentList "guard", "show" -Wait -NoNewWindow -PassThru
    if ($pro.ExitCode -ne 0) {
        throw "Failed to show candy guard configuration"
    }

    # Return to original directory
    $pro = Set-Location -Path $currentDir

    Write-Output ""
    Write-Output "Updated whitelisted wallets"
}
catch {
    Write-Error "Failed to execute commands: $_"
    
    Write-Output ""
    Write-Output "Failed to update whitelisted wallets"

    # Return to original directory
    Set-Location -Path $currentDir
}