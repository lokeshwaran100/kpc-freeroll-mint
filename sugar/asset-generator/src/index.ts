import * as fs from 'fs';
import * as path from 'path';

const RELATIVE_ASSET_DIR = "../assets"
const CONFIG_PATH = "../config.json"

// Function to create JSON files and copy the image file
function createJsonFiles(count: number) {
    const collectionImagePath = 'collection.jpg';
    const assetImagePath = 'asset.jpg';

    for (let i = 0; i < count; i++) {
        const jsonData = {
            name: `KPC S1 ${i}`,
            description: "KPC Freeroll Season 1 NFT",
            image: `${i}.jpg`,
            symbol: "KPCS1",
            properties: {
                files: [
                    {
                        uri: `${i}.jpg`,
                        type: "image/jpg"
                    }
                ]
            }
        };

        const newImageJsonPath = path.join(RELATIVE_ASSET_DIR, `${i}.json`);
        fs.writeFileSync(newImageJsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`File ${i}.json created successfully.`);

        const newImagePath = path.join(RELATIVE_ASSET_DIR, `${i}.jpg`);
        fs.copyFileSync(assetImagePath, newImagePath);
        console.log(`Image ${i}.jpg copied successfully.`);
    }

    const collectionJsonData = {
        "name": "KPC Freeroll Season 1",
        "description": "A collection of KPC Freeroll Season 1 NFTs on Solana",
        "image": "collection.jpg",
        "symbol": "KPCS1",
        "properties": {
            "files": [
                {
                    "uri": "collection.jpg",
                    "type": "image/jpg"
                }
            ]
        }
    };

    const newCollectionJsonPath = path.join(RELATIVE_ASSET_DIR, `collection.json`);
    fs.writeFileSync(newCollectionJsonPath, JSON.stringify(collectionJsonData, null, 2));
    console.log(`File collection.json created successfully.`);

    const newCollectionPath = path.join(RELATIVE_ASSET_DIR, `collection.jpg`);
    fs.copyFileSync(collectionImagePath, newCollectionPath);
    console.log(`Image collection.jpg copied successfully.`);
}

function updateConfigFile(count: number, configPath: string) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.number = count;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return config;
}

// Get the count value from command-line arguments
const args = process.argv.slice(2);
const count = parseInt(args[0]);

if (isNaN(count) || count <= 0) {
    console.error('Please provide a valid positive number as the count.');
    process.exit(1);
}

createJsonFiles(count);
updateConfigFile(count, CONFIG_PATH);