param (
    [string]$network = "mainnet"
)

$keypairFile = "Owner.json"

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
