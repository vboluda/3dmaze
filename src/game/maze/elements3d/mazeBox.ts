import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import type { mazeContext } from "../../base/mazeContext";
import type { mazeStaticObject } from "../../base/objects3d/mazeStaticObject";
import type { BoxPosition } from "../../components/Box";

type MazeBoxOptions = {
    color?: number;
    height?: number;
};

const DEFAULT_BOX_COLOR = 0x8f5f3f;
const DEFAULT_BOX_HEIGHT = 1;

export default class mazeBox implements mazeStaticObject {
    private mesh: Mesh<BoxGeometry, MeshStandardMaterial> | null = null;
    private readonly position: BoxPosition;
    private readonly color: number;
    private readonly height: number;

    constructor(position: BoxPosition, options?: MazeBoxOptions) {
        this.position = position;
        this.color = options?.color ?? DEFAULT_BOX_COLOR;
        this.height = options?.height ?? DEFAULT_BOX_HEIGHT;
    }

    init(mazeContext: mazeContext): void {
        if (this.mesh) {
            this.dispose(mazeContext);
        }

        const scene = mazeContext.getScene();
        const mazePosition = mazeContext.calculateXZCoors({
            X: this.position.x,
            Z: this.position.z,
        });

        const geometry = new BoxGeometry(1, this.height, 1);
        const material = new MeshStandardMaterial({ color: this.color });

        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(mazePosition.x, this.height / 2, mazePosition.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);
    }

    dispose(mazeContext: mazeContext): void {
        if (!this.mesh) {
            return;
        }

        const scene = mazeContext.getScene();
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
    }
}