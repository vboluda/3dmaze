import type { mazeContext } from "../../base/mazeContext";
import type { mazeStaticObject } from "../../base/objects3d/mazeStaticObject";
import { AmbientLight, DirectionalLight } from "three";

type MazeLightsOptions = {
    ambientIntensity?: number;
    directionalIntensity?: number;
};

export default class mazeLights implements mazeStaticObject {
    private ambientLight: AmbientLight | null = null;
    private directionalLight: DirectionalLight | null = null;
    private readonly ambientIntensity: number;
    private readonly directionalIntensity: number;

    constructor(options?: MazeLightsOptions) {
        this.ambientIntensity = options?.ambientIntensity ?? 0.5;
        this.directionalIntensity = options?.directionalIntensity ?? 0.8;
    }

    getAABB(): null {
        return null;
    }

    init(mazeContext: mazeContext): void {
        if (this.ambientLight || this.directionalLight) {
            this.dispose(mazeContext);
        }

        const scene = mazeContext.getScene();

        this.ambientLight = new AmbientLight(0xffffff, this.ambientIntensity);

        this.directionalLight = new DirectionalLight(0xffffff, this.directionalIntensity);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = false;

        scene.add(this.ambientLight);
        scene.add(this.directionalLight);
    }

    dispose(mazeContext: mazeContext): void {
        const scene = mazeContext.getScene();

        if (this.ambientLight) {
            scene.remove(this.ambientLight);
            this.ambientLight = null;
        }

        if (this.directionalLight) {
            scene.remove(this.directionalLight);
            this.directionalLight = null;
        }
    }
}
