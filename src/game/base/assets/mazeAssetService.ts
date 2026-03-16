type AssetCategory = "texture" | "sound" | "model";

import { Texture, TextureLoader } from "three";

type AssetCategoryConfig = {
    directory: string;
    defaultExtension: string;
};

const ASSET_CATEGORY_REGISTRY: Readonly<Record<AssetCategory, AssetCategoryConfig>> = {
    texture: {
        directory: "textures",
        defaultExtension: "jpg",
    },
    sound: {
        directory: "sounds",
        defaultExtension: "mp3",
    },
    model: {
        directory: "models",
        defaultExtension: "glb",
    },
};

export class mazeAssetService {
    private readonly rootDirectory: string;
    private readonly textureLoader = new TextureLoader();
    private readonly textureCache = new Map<string, Texture>();

    constructor(rootDirectory = "/assets") {
        this.rootDirectory = rootDirectory;
    }

    getTexture(assetName: string, extension?: string): Texture {
        const texturePath = this.getAssetPath("texture", assetName, extension);
        const cachedTexture = this.textureCache.get(texturePath);
        if (cachedTexture) {
            return cachedTexture;
        }

        const texture = this.textureLoader.load(
            texturePath,
            undefined,
            undefined,
            () => {
                this.textureCache.delete(texturePath);
                throw new Error(`Texture not found or failed to load: ${texturePath}`);
            },
        );
        this.textureCache.set(texturePath, texture);
        return texture;
    }

    getSound(assetName: string, extension?: string): string {
        return this.getAssetPath("sound", assetName, extension);
    }

    getModel(assetName: string, extension?: string): string {
        return this.getAssetPath("model", assetName, extension);
    }

    getAssetPath(category: AssetCategory, assetName: string, extension?: string): string {
        const normalizedAssetName = assetName.trim();
        if (!normalizedAssetName) {
            throw new Error("Asset name cannot be empty.");
        }

        const categoryConfig = ASSET_CATEGORY_REGISTRY[category];
        const normalizedExtension = extension?.trim() || categoryConfig.defaultExtension;

        return `${this.rootDirectory}/${categoryConfig.directory}/${normalizedAssetName}.${normalizedExtension}`;
    }

    dispose(): void {
        for (const texture of this.textureCache.values()) {
            texture.dispose();
        }
        this.textureCache.clear();
    }
}
