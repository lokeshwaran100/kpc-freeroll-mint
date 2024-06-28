param (
    [string]$action = "enable"
)

$CONFIG_PATH = "../sugar/config.json"

# Load the JSON content from the file
$jsonFile = $CONFIG_PATH
$jsonContent = Get-Content -Path $jsonFile -Raw | ConvertFrom-Json

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

# Define the year based on the action parameter
if ($action -eq "enable") {
    $newYear = 2024
}
elseif ($action -eq "disable") {
    $newYear = 2023
}
else {
    Write-Error "Invalid action parameter. Please specify 'enable' or 'disable'."
    exit 1
}

# Update the startDate and endDate fields in the JSON structure
$jsonContent.guards.groups | ForEach-Object {
    $_.guards.startDate.date = $_.guards.startDate.date -replace "^(\d{4})", $newYear
    $_.guards.endDate.date = $_.guards.endDate.date -replace "^(\d{4})", $newYear
}

# Convert the updated JSON back to string
$jsonString = $jsonContent | ConvertTo-Json -Depth 10 | Format-Json

# Save the updated JSON back to the file
$jsonString | Set-Content -Path $jsonFile -Force

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
    Write-Output "Minting is ${action}d"
}
catch {
    Write-Error "Failed to execute commands: $_"
    
    Write-Output ""
    Write-Output "Failed to ${action} minting"

    # Return to original directory
    Set-Location -Path $currentDir
}