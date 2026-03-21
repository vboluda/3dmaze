import { BoxGeometry, CapsuleGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import type { mazeCollisionService } from "../../base/collision/mazeCollisionService";
import type { AABB } from "../../base/collision/ICollider";
import type { mazeEventBase } from "../../base/eventBus/mazeEventBase";
import type { mazeContext } from "../../base/mazeContext";
import mazeTickEvent from "../../base/eventOrigin/mazeTickEvent";
import type { mazeDynamicObject } from "../../base/objects3d/mazeDynamicObject";

export type MazePatrolPosition = {
    x: number;
    z: number;
    y?: number;
};

export type MazePatrolSpeed = {
    x: number;
    z: number;
};

const PATROL_RADIUS = 0.25;
const PATROL_LENGTH = 0.5;
const PATROL_HEIGHT = PATROL_LENGTH + PATROL_RADIUS * 2;
const BODY_COLOR = 0x7cff2b;
const DETAIL_COLOR = 0x111111;
const EYE_COLOR = 0xff3b30;
const POSITION_EPSILON = 0.0001;

export default class mazePatrol implements mazeDynamicObject {
    private mesh: Mesh<CapsuleGeometry, MeshStandardMaterial> | null = null;
    private collisionService: mazeCollisionService | null = null;
    private readonly position: MazePatrolPosition;
    private readonly speed: MazePatrolSpeed;
    private readonly velocity = new Vector3();
    private readonly playerPushDelta = new Vector3();
    private minBound = Number.NEGATIVE_INFINITY;
    private maxBound = Number.POSITIVE_INFINITY;
    private lastTickTimestampMs: number | null = null;
    private aabb: AABB | null = null;

    constructor(position: MazePatrolPosition, speed: MazePatrolSpeed) {
        this.position = position;
        this.speed = speed;
        this.velocity.set(speed.x, 0, speed.z);
    }

    getAABB(): Readonly<AABB> | null {
        return this.aabb;
    }

    getPlayerPushDelta(): Readonly<{ x: number; z: number }> {
        return {
            x: this.playerPushDelta.x * 2,
            z: this.playerPushDelta.z * 2,
        };
    }

    init(mazeContext: mazeContext): void {
        if (this.mesh) {
            this.dispose(mazeContext);
        }

        this.collisionService = mazeContext.getCollisionService();

        const geometry = new CapsuleGeometry(PATROL_RADIUS, PATROL_LENGTH, 8, 16);
        const material = new MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.85, metalness: 0.05 });
        this.mesh = new Mesh(geometry, material);
        this.attachEnemyDetails(this.mesh);
        this.syncFacingRotation();

        const mazePosition = mazeContext.calculateXZCoors({
            X: this.position.x,
            Z: this.position.z,
        });
        const elevation = this.position.y ?? PATROL_HEIGHT / 2;
        this.mesh.position.set(mazePosition.x, elevation, mazePosition.z);

        const halfMaze = mazeContext.getMazeSize() / 2;
        this.minBound = -halfMaze + PATROL_RADIUS;
        this.maxBound = halfMaze - PATROL_RADIUS;
        this.lastTickTimestampMs = null;
        this.playerPushDelta.set(0, 0, 0);

        this.syncAABB();
        mazeContext.getScene().add(this.mesh);
        this.collisionService.register(this);
        mazeContext.getEventBus().insert3dObjectEvent(this);
    }

    dispose(mazeContext: mazeContext): void {
        mazeContext.getEventBus().remove3dObjectEvent(this);

        if (this.collisionService) {
            this.collisionService.unregister(this);
        }

        if (this.mesh) {
            mazeContext.getScene().remove(this.mesh);
            this.disposeMeshTree(this.mesh);
        }

        this.mesh = null;
        this.collisionService = null;
        this.aabb = null;
        this.lastTickTimestampMs = null;
        this.minBound = Number.NEGATIVE_INFINITY;
        this.maxBound = Number.POSITIVE_INFINITY;
        this.playerPushDelta.set(0, 0, 0);
        this.velocity.set(this.speed.x, 0, this.speed.z);
    }

    update(mazeEvent: mazeEventBase): void {
        if (!this.mesh || !(mazeEvent instanceof mazeTickEvent)) {
            return;
        }

        if (this.lastTickTimestampMs === null) {
            this.lastTickTimestampMs = mazeEvent.timestampMs;
            return;
        }

        const deltaSeconds = Math.max(0, (mazeEvent.timestampMs - this.lastTickTimestampMs) / 1000);
        this.lastTickTimestampMs = mazeEvent.timestampMs;

        if (deltaSeconds === 0) {
            this.playerPushDelta.set(0, 0, 0);
            return;
        }

        const previousPosition = this.mesh.position.clone();
        this.moveOnAxis("x", deltaSeconds);
        this.moveOnAxis("z", deltaSeconds);
        this.playerPushDelta.copy(this.mesh.position).sub(previousPosition);
        this.syncAABB();
    }

    private moveOnAxis(axis: "x" | "z", deltaSeconds: number): void {
        if (!this.mesh) {
            return;
        }

        const velocityComponent = axis === "x" ? this.velocity.x : this.velocity.z;
        if (velocityComponent === 0) {
            return;
        }

        const nextValue = (axis === "x" ? this.mesh.position.x : this.mesh.position.z) + velocityComponent * deltaSeconds;
        const boundedValue = Math.min(this.maxBound, Math.max(this.minBound, nextValue));

        if (Math.abs(boundedValue - nextValue) > POSITION_EPSILON) {
            this.invertAxisVelocity(axis);
        }

        if (axis === "x") {
            this.mesh.position.x = boundedValue;
        } else {
            this.mesh.position.z = boundedValue;
        }

        const resolvedPosition = this.resolvePatrolPosition();
        const resolvedValue = axis === "x" ? resolvedPosition.x : resolvedPosition.z;
        const currentValue = axis === "x" ? this.mesh.position.x : this.mesh.position.z;

        if (Math.abs(resolvedValue - currentValue) > POSITION_EPSILON) {
            if (axis === "x") {
                this.mesh.position.x = resolvedValue;
            } else {
                this.mesh.position.z = resolvedValue;
            }
            this.invertAxisVelocity(axis);
        }
    }

    private resolvePatrolPosition(): Vector3 {
        if (!this.mesh || !this.collisionService) {
            return this.mesh?.position.clone() ?? new Vector3();
        }

        this.collisionService.unregister(this);
        const resolvedPosition = this.collisionService.resolvePosition(
            this.mesh.position,
            PATROL_RADIUS,
            PATROL_HEIGHT,
        );
        this.collisionService.register(this);
        return resolvedPosition;
    }

    private invertAxisVelocity(axis: "x" | "z"): void {
        if (axis === "x") {
            this.velocity.x *= -1;
            this.syncFacingRotation();
            return;
        }

        this.velocity.z *= -1;
        this.syncFacingRotation();
    }

    private syncAABB(): void {
        if (!this.mesh) {
            this.aabb = null;
            return;
        }

        this.aabb = {
            minX: this.mesh.position.x - PATROL_RADIUS,
            maxX: this.mesh.position.x + PATROL_RADIUS,
            minY: this.mesh.position.y - PATROL_HEIGHT / 2,
            maxY: this.mesh.position.y + PATROL_HEIGHT / 2,
            minZ: this.mesh.position.z - PATROL_RADIUS,
            maxZ: this.mesh.position.z + PATROL_RADIUS,
        };
    }

    private attachEnemyDetails(bodyMesh: Mesh<CapsuleGeometry, MeshStandardMaterial>): void {
        const detailMaterial = new MeshStandardMaterial({
            color: DETAIL_COLOR,
            roughness: 1,
            metalness: 0,
        });
        const eyeMaterial = new MeshStandardMaterial({
            color: EYE_COLOR,
            emissive: EYE_COLOR,
            emissiveIntensity: 0.9,
            roughness: 0.35,
            metalness: 0.05,
        });

        // Visor ring around the upper/front area to make the head readable at distance.
        const visorBand = new Mesh(
            new CylinderGeometry(PATROL_RADIUS * 0.92, PATROL_RADIUS * 0.92, 0.12, 16, 1, true),
            detailMaterial,
        );
        visorBand.position.set(0, PATROL_HEIGHT * 0.18, 0);
        visorBand.rotation.x = Math.PI / 2;
        bodyMesh.add(visorBand);

        const eye = new Mesh(new SphereGeometry(0.045, 10, 8), eyeMaterial);
        eye.position.set(0, PATROL_HEIGHT * 0.2, PATROL_RADIUS * 0.9);
        bodyMesh.add(eye);

        const eyebrowGeometry = new BoxGeometry(0.12, 0.02, 0.02);
        const leftEyebrow = new Mesh(eyebrowGeometry, detailMaterial);
        leftEyebrow.position.set(-0.07, PATROL_HEIGHT * 0.27, PATROL_RADIUS * 0.94);
        leftEyebrow.rotation.z = -0.35;
        bodyMesh.add(leftEyebrow);

        const rightEyebrow = new Mesh(eyebrowGeometry, detailMaterial);
        rightEyebrow.position.set(0.07, PATROL_HEIGHT * 0.27, PATROL_RADIUS * 0.94);
        rightEyebrow.rotation.z = 0.35;
        bodyMesh.add(rightEyebrow);

        const mouthLeft = new Mesh(new BoxGeometry(0.07, 0.016, 0.02), detailMaterial);
        mouthLeft.position.set(-0.03, PATROL_HEIGHT * 0.06, PATROL_RADIUS * 0.96);
        mouthLeft.rotation.z = 0.45;
        bodyMesh.add(mouthLeft);

        const mouthRight = new Mesh(new BoxGeometry(0.07, 0.016, 0.02), detailMaterial);
        mouthRight.position.set(0.03, PATROL_HEIGHT * 0.06, PATROL_RADIUS * 0.96);
        mouthRight.rotation.z = -0.45;
        bodyMesh.add(mouthRight);
    }

    private disposeMeshTree(rootMesh: Mesh<CapsuleGeometry, MeshStandardMaterial>): void {
        rootMesh.traverse((child) => {
            const mesh = child as Mesh;
            if (!("geometry" in mesh) || !("material" in mesh)) {
                return;
            }

            mesh.geometry.dispose();

            if (Array.isArray(mesh.material)) {
                for (const material of mesh.material) {
                    material.dispose();
                }
                return;
            }

            mesh.material.dispose();
        });
    }

    private syncFacingRotation(): void {
        if (!this.mesh) {
            return;
        }

        if (this.velocity.x === 0 && this.velocity.z === 0) {
            return;
        }

        // The face is modeled looking towards local +Z, so align that axis with the movement vector.
        this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
    }
}
