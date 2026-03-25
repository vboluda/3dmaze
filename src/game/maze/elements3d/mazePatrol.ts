import { CapsuleGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";
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
const PATROL_BARREL_RADIUS = 0.06;
const PATROL_BARREL_LENGTH = 0.9;
const PATROL_BARREL_TURN_PER_TICK = Math.PI / 12;
const FACE_DIRECTION_OFFSET = - Math.PI / 2;
const POSITION_EPSILON = 0.0001;
const MAX_MOVEMENT_STEP_SECONDS = 1 / 60;

export default class mazePatrol implements mazeDynamicObject {
    private mesh: Mesh<CapsuleGeometry, MeshStandardMaterial> | null = null;
    private barrelMesh: Mesh<CylinderGeometry, MeshStandardMaterial> | null = null;
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
        const material = new MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.85,
            metalness: 0.05,
        });
        this.mesh = new Mesh(geometry, material);
        const barrelGeometry = new CylinderGeometry(PATROL_BARREL_RADIUS, PATROL_BARREL_RADIUS, PATROL_BARREL_LENGTH, 12);
        const barrelMaterial = new MeshStandardMaterial({
            color: 0xaa0000,
            roughness: 0.7,
            metalness: 0.1,
        });
        this.barrelMesh = new Mesh(barrelGeometry, barrelMaterial);
        this.barrelMesh.rotation.z = Math.PI / 2;
        this.barrelMesh.position.set(0, 0, 0);
        this.mesh.add(this.barrelMesh);
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
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        if (this.barrelMesh) {
            this.barrelMesh.geometry.dispose();
            this.barrelMesh.material.dispose();
        }

        this.mesh = null;
        this.barrelMesh = null;
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

        if (this.barrelMesh) {
            this.barrelMesh.rotation.y += PATROL_BARREL_TURN_PER_TICK;
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
        let remainingSeconds = deltaSeconds;

        while (remainingSeconds > 0) {
            const stepSeconds = Math.min(remainingSeconds, MAX_MOVEMENT_STEP_SECONDS);
            this.moveOnAxis("x", stepSeconds);
            this.moveOnAxis("z", stepSeconds);
            remainingSeconds -= stepSeconds;
        }

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
                this.mesh.position.x = this.clampToBounds(resolvedValue);
            } else {
                this.mesh.position.z = this.clampToBounds(resolvedValue);
            }
            this.invertAxisVelocity(axis);
        }
    }

    private clampToBounds(value: number): number {
        return Math.min(this.maxBound, Math.max(this.minBound, value));
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

    private syncFacingRotation(): void {
        if (!this.mesh) {
            return;
        }

        if (this.velocity.x === 0 && this.velocity.z === 0) {
            return;
        }

        this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z) + FACE_DIRECTION_OFFSET;
    }
}
