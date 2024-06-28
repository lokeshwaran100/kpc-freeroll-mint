# Define the target directory
$targetDir = "../sugar"

# Create the directory if it doesn't exist
if (-not (Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

# Download the file
$url = "https://github.com/metaplex-foundation/sugar/releases/download/v2.0.0-beta.1/sugar-windows-latest.exe"
$outputFile = Join-Path -Path $targetDir -ChildPath "sugar.exe"
Invoke-WebRequest -Uri $url -OutFile $outputFile

# Check if download was successful
if (Test-Path -Path $outputFile) {
    Write-Output "Downloaded sugar-windows-latest.exe to $outputFile"
} else {
    Write-Error "Failed to download sugar-windows-latest.exe"
    exit 1
}

# Define the directory and file paths
$directory = "tmp"
$filePath = "$directory\solana-install-init.exe"

# Create the directory if it doesn't exist
if (-not (Test-Path -Path $directory)) {
    New-Item -ItemType Directory -Path $directory
}

# Download the file
Invoke-WebRequest -Uri "https://release.solana.com/v1.18.17/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile $filePath

# Execute the downloaded file with the specified version
Start-Process -FilePath $filePath -ArgumentList "v1.18.17" -Wait

Write-Output ""
Write-Output "Installed solana package"