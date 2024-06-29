param (
    [string]$network = "mainnet"
)

$CONFIG_PATH = "../sugar/config.json"
$keypairFile = "Owner.json"


function UpdatedCreatorAddress {
    param (
        [string]$address,
        [string]$configPath
    )

    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json

    $config = Get-Content -Path $configPath | ConvertFrom-Json
    $config.creators | ForEach-Object {
        if($_.address) {
            $_.address = $address
        }
    }
    $config.guards.groups | ForEach-Object {
        if ($_.guards.solPayment -and $_.guards.solPayment.destination) {
            $_.guards.solPayment.destination = $address
        }
    }
    $config = $config | ConvertTo-Json -Depth 10 | Format-Json
    $config | Set-Content -Path $configPath -Force
    Write-Output "Updated ${configPath} with the creator wallet address."
}

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
    # Check if keypair file exists
    if (-not (Test-Path -Path $keypairFile)) {
        # Generate a new keypair and suppress output
        solana-keygen new --outfile $keypairFile --no-bip39-passphrase > $null
    }

    # Get the pubkey from the keypair file and suppress output
    $pubkey = & solana-keygen pubkey $keypairFile

    # Get the absolute path of the keypair file
    $absoluteKeypairPath = Resolve-Path -Path $keypairFile

    # Set URL based on network argument
    switch ($network) {
        "devnet" {
            $url = "https://api.devnet.solana.com/"
        }
        "mainnet" {
            $url = "https://api.mainnet-beta.solana.com/"
        }
        "testnet" {
            $url = "https://api.testnet.solana.com/"
        }
        default {
            Write-Error "Unsupported network: $network"
            exit 1
        }
    }

    # Set the keypair configuration using the absolute path and suppress output
    solana config set --keypair $absoluteKeypairPath > $null

    # Set the URL configuration based on selected network and suppress output
    solana config set --url $url > $null

    # Display current configuration for verification
    solana config get

    # Update the creator address in config.json
    UpdatedCreatorAddress -address $pubkey -configPath $CONFIG_PATH

    # Output the extracted pubkey and absolute path
    Write-Output ""
    Write-Output "Configured environment for solana $network"
    Write-Output "Owner wallet keypair file : $absoluteKeypairPath"
    Write-Output "Fund owner wallet address : $pubkey"
}
catch {
    Write-Error "Failed to complete the script: $_"
    exit 1
}