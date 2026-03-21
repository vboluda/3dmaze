import type { mazeEventBase } from "../base/eventBus/mazeEventBase";
import { mazeContext, type mazeTile } from "../base/mazeContext";
import type { mazeDynamicObject } from "../base/objects3d/mazeDynamicObject";
import mazeEventHurt from "../base/eventOrigin/mazeEventHurt";
import mazePlayerEvent, { playerAction, playerInputState, type PlayerAction } from "../base/eventOrigin/mazePlayerEvent";
import mazeTickEvent from "../base/eventOrigin/mazeTickEvent";
import { PerspectiveCamera, Vector3 } from "three";
import type { mazeCollisionService } from "../base/collision/mazeCollisionService";

const CAMERA_HEIGHT = 0.3;
const PLAYER_RADIUS = 0.2;
const PLAYER_HEIGHT = 1.0;
const PLAYER_HURT_IMPACT = 1;
const PLAYER_DAMAGE_COOLDOWN_MS = 350;
const MAX_LOOK_UP_PITCH = Math.PI / 3; // +60 deg
const MIN_LOOK_DOWN_PITCH = -Math.PI / 6; // -30 deg

export default class mazePlayer implements mazeDynamicObject {
    private camera: PerspectiveCamera | null = null;
    private collisionService: mazeCollisionService | null = null;
    private context: mazeContext | null = null;
    private readonly forwardBackwardStep = 0.05;
    private readonly strafeStep = 0.045;
    private readonly rotationStep = 0.02;
    private readonly activeActions: Set<PlayerAction> = new Set();
    private readonly spawnTile: mazeTile;
    private minBound = Number.NEGATIVE_INFINITY;
    private maxBound = Number.POSITIVE_INFINITY;
    private yaw = 0;
    private pitch = 0;
    private lastDamageTimestampMs = Number.NEGATIVE_INFINITY;

    getAABB(): null {
        return null;
    }

    constructor(spawnTile: mazeTile) {
        this.spawnTile = spawnTile;
    }

    init(mazeContext: mazeContext): void {
        this.context = mazeContext;
        this.camera = mazeContext.getCamera();
        this.collisionService = mazeContext.getCollisionService();
        const halfMaze = mazeContext.getMazeSize() / 2;
        const halfTile = 0.5;
        this.minBound = -halfMaze + halfTile;
        this.maxBound = halfMaze - halfTile;

        const spawnPosition = mazeContext.calculateXZCoors(this.spawnTile);
        this.camera.position.set(spawnPosition.x, CAMERA_HEIGHT, spawnPosition.z);
        this.clampToPlaneBounds();
        this.camera.lookAt(spawnPosition.x, CAMERA_HEIGHT, spawnPosition.z - 1);
        this.camera.rotation.order = "YXZ";
        this.yaw = this.camera.rotation.y;
        this.pitch = this.clampPitch(this.camera.rotation.x);
        this.syncCameraRotation();
        mazeContext.getEventBus().insert3dObjectEvent(this);
    }

    dispose(mazeContext: mazeContext): void {
        mazeContext.getEventBus().remove3dObjectEvent(this);
        this.activeActions.clear();
        if (this.camera?.parent) {
            this.camera.parent.remove(this.camera);
        }
        this.yaw = 0;
        this.pitch = 0;
        this.minBound = Number.NEGATIVE_INFINITY;
        this.maxBound = Number.POSITIVE_INFINITY;
        this.lastDamageTimestampMs = Number.NEGATIVE_INFINITY;
        this.collisionService = null;
        this.context = null;
        this.camera = null;
    }

    update(mazeEvent: mazeEventBase): void {
        if (!this.camera) {
            return;
        }

        if (mazeEvent instanceof mazePlayerEvent) {
            if (mazeEvent.inputState === playerInputState.pressed) {
                this.activeActions.add(mazeEvent.playerAction);
            } else if (mazeEvent.inputState === playerInputState.released) {
                this.activeActions.delete(mazeEvent.playerAction);
            }
            return;
        }

        if (!(mazeEvent instanceof mazeTickEvent)) {
            return;
        }

        for (const activeAction of this.activeActions) {
            this.applyPlayerAction(activeAction);
        }

        this.applyEnemyPush(mazeEvent.timestampMs);
    }

    private applyPlayerAction(action: PlayerAction): void {
        if (!this.camera) {
            return;
        }

        switch (action) {
            case playerAction.movementFordward:
                this.moveRelative(this.forwardBackwardStep, 0);
                break;
            case playerAction.movementBackward:
                this.moveRelative(-this.forwardBackwardStep, 0);
                break;
            case playerAction.movementLeft:
                this.moveRelative(0, -this.strafeStep);
                break;
            case playerAction.movementRight:
                this.moveRelative(0, this.strafeStep);
                break;
            case playerAction.rotateLeft:
                this.yaw += this.rotationStep;
                this.syncCameraRotation();
                break;
            case playerAction.rotateRight:
                this.yaw -= this.rotationStep;
                this.syncCameraRotation();
                break;
            case playerAction.rotateUp:
                this.pitch = Math.min(MAX_LOOK_UP_PITCH, this.pitch + this.rotationStep);
                this.syncCameraRotation();
                break;
            case playerAction.rotateDown:
                this.pitch = Math.max(MIN_LOOK_DOWN_PITCH, this.pitch - this.rotationStep);
                this.syncCameraRotation();
                break;
            default:
                break;
        }
    }

    private syncCameraRotation(): void {
        if (!this.camera) {
            return;
        }

        this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
    }

    private clampPitch(value: number): number {
        return Math.min(MAX_LOOK_UP_PITCH, Math.max(MIN_LOOK_DOWN_PITCH, value));
    }

    private moveRelative(forwardStep: number, rightStep: number): void {
        if (!this.camera) {
            return;
        }

        const worldUp = new Vector3(0, 1, 0);
        const forward = new Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;

        if (forward.lengthSq() === 0) {
            return;
        }

        forward.normalize();
        const right = new Vector3().crossVectors(forward, worldUp).normalize();

        this.camera.position.addScaledVector(forward, forwardStep);
        this.camera.position.addScaledVector(right, rightStep);
        if (this.collisionService) {
            const resolved = this.collisionService.resolvePosition(this.camera.position, PLAYER_RADIUS, PLAYER_HEIGHT);
            this.camera.position.copy(resolved);
        }
        this.clampToPlaneBounds();
        this.camera.position.y = CAMERA_HEIGHT;
    }

    private clampToPlaneBounds(): void {
        if (!this.camera) {
            return;
        }

        this.camera.position.x = Math.min(this.maxBound, Math.max(this.minBound, this.camera.position.x));
        this.camera.position.z = Math.min(this.maxBound, Math.max(this.minBound, this.camera.position.z));
    }

    private applyEnemyPush(timestampMs: number): void {
        if (!this.camera || !this.collisionService) {
            return;
        }

        const pushResult = this.collisionService.applyPlayerPush(
            this.camera.position,
            PLAYER_RADIUS,
            PLAYER_HEIGHT,
        );

        this.camera.position.copy(pushResult.position);
        this.clampToPlaneBounds();
        this.camera.position.y = CAMERA_HEIGHT;

        if (pushResult.wasPushed) {
            this.applyDamage(timestampMs);
        }
    }

    private applyDamage(timestampMs: number): void {
        if (!this.context || timestampMs - this.lastDamageTimestampMs < PLAYER_DAMAGE_COOLDOWN_MS) {
            return;
        }

        this.lastDamageTimestampMs = timestampMs;
        this.context.getEventBus().send(new mazeEventHurt(PLAYER_HURT_IMPACT));
    }
}
