import type { mazeEventBase } from "../base/eventBus/mazeEventBase";
import { mazeContext } from "../base/mazeContext";
import type { mazeDynamicObject } from "../base/objects3d/mazeDynamicObject";
import mazePlayerEvent, { playerAction, playerInputState, type PlayerAction } from "../base/eventOrigin/mazePlayerEvent";
import mazeTickEvent from "../base/eventOrigin/mazeTickEvent";
import type { PerspectiveCamera } from "three";

const CAMERA_HEIGHT = 0.5;

export default class mazePlayer implements mazeDynamicObject {
    private camera: PerspectiveCamera | null = null;
    private readonly movementStep = 0.1;
    private readonly rotateStep = 0.08;
    private readonly activeActions: Set<PlayerAction> = new Set();

    constructor() {}

    init(mazeContext: mazeContext): void {
        this.camera = mazeContext.getCamera();
        this.camera.position.set(0, CAMERA_HEIGHT, 10);
        this.camera.lookAt(0, 0, 0);
        mazeContext.getEventBus().insert3dObjectEvent(this);
    }

    dispose(mazeContext: mazeContext): void {
        mazeContext.getEventBus().remove3dObjectEvent(this);
        this.activeActions.clear();
        if (this.camera?.parent) {
            this.camera.parent.remove(this.camera);
        }
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
    }

    private applyPlayerAction(action: PlayerAction): void {
        if (!this.camera) {
            return;
        }

        switch (action) {
            case playerAction.movementFordward:
                this.camera.position.z -= this.movementStep;
                break;
            case playerAction.movementBackward:
                this.camera.position.z += this.movementStep;
                break;
            case playerAction.movementLeft:
                this.camera.position.x -= this.movementStep;
                break;
            case playerAction.movementRight:
                this.camera.position.x += this.movementStep;
                break;
            case playerAction.rotateLeft:
                this.camera.rotation.z += this.rotateStep;
                break;
            case playerAction.rotateRight:
                this.camera.rotation.z -= this.rotateStep;
                break;
            case playerAction.rotateUp:
                this.camera.rotation.x += this.rotateStep;
                break;
            case playerAction.rotateDown:
                this.camera.rotation.x -= this.rotateStep;
                break;
            default:
                break;
        }
    }
}