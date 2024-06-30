param (
[int] $count = 2000
)

# Define the relative paths
$RELATIVE_ASSET_DIR = "../sugar/assets"
$CONFIG_PATH = "../sugar/config.json"
$COLLECTION_IMAGE_PATH = "../asset/collection.jpg"
$ASSET_IMAGE_PATH = "../asset/asset.jpg"

# Function to create JSON files and copy the image file
function CreateJsonFiles {
    param (
        [int]$count
    )

    $collectionImagePath = $COLLECTION_IMAGE_PATH
    $assetImagePath = $ASSET_IMAGE_PATH

    for ($i = 0; $i -lt $count; $i++) {
        $jsonData = @{
            name = "KryptoPoker.io FS 1 #$i"
            description = "Access pass to freeroll season 1"
            image = "$i.jpg"
            symbol = "KPCFS1"
            properties = @{
                files = @(@{
                    uri = "$i.jpg"
                    type = "image/jpg"
                })
                category = "image"
            }
        }

        $newImageJsonPath = Join-Path -Path $RELATIVE_ASSET_DIR -ChildPath "$i.json"
        $jsonData | ConvertTo-Json -Depth 10 | Format-Json | Set-Content -Path $newImageJsonPath
        Write-Output "File $i.json created successfully."

        $newImagePath = Join-Path -Path $RELATIVE_ASSET_DIR -ChildPath "$i.jpg"
        Copy-Item -Path $assetImagePath -Destination $newImagePath
        Write-Output "Image $i.jpg copied successfully."
    }

    $collectionJsonData = @{
        name = "KryptoPoker.io FS 1"
        description = "Access pass to freeroll season 1"
        image = "collection.jpg"
        symbol = "KPCFS1"
        properties = @{
            files = @(@{
                uri = "collection.jpg"
                type = "image/jpg"
            })
            category = "image"
        }
    }

    $newCollectionJsonPath = Join-Path -Path $RELATIVE_ASSET_DIR -ChildPath "collection.json"
    $collectionJsonData | ConvertTo-Json -Depth 10 | Format-Json | Set-Content -Path $newCollectionJsonPath
    Write-Output "File collection.json created successfully."

    $newCollectionPath = Join-Path -Path $RELATIVE_ASSET_DIR -ChildPath "collection.jpg"
    Copy-Item -Path $collectionImagePath -Destination $newCollectionPath
    Write-Output "Image collection.jpg copied successfully."
}

function UpdateConfigFile {
    param (
        [int]$count,
        [string]$configPath
    )

    $config = Get-Content -Path $configPath | ConvertFrom-Json
    $config.number = $count
    $config | ConvertTo-Json -Depth 10 | Format-Json | Set-Content -Path $configPath
    Write-Output "Updated ${configPath} with number of mints successfully."
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


if ($count -le 0) {
    Write-Error "Please provide a valid positive number as the count."
    exit 1
}

CreateJsonFiles -count $count
UpdateConfigFile -count $count -configPath $CONFIG_PATH
