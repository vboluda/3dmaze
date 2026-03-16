import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import type { mazeContext } from "../../base/mazeContext";
import type { mazeStaticObject } from "../../base/objects3d/mazeStaticObject";
import type { BoxPosition } from "../../components/Box";
import type { AABB } from "../../base/collision/ICollider";

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
    private aabb: AABB | null = null;

    getAABB(): Readonly<AABB> | null {
        return this.aabb;
    }

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
        const elevation = this.position.y ?? 0;

        this.mesh = new Mesh(geometry, material);
        // Position is centered in tile (x/z) and elevated in world Y by `position.y`.
        this.mesh.position.set(mazePosition.x, elevation + this.height / 2, mazePosition.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);

        this.aabb = {
            minX: mazePosition.x - 0.5,
            maxX: mazePosition.x + 0.5,
            minY: elevation,
            maxY: elevation + this.height,
            minZ: mazePosition.z - 0.5,
            maxZ: mazePosition.z + 0.5,
        };
        mazeContext.getCollisionService().register(this);
    }

    dispose(mazeContext: mazeContext): void {
        if (!this.mesh) {
            return;
        }

        mazeContext.getCollisionService().unregister(this);
        this.aabb = null;

        const scene = mazeContext.getScene();
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
    }
}