import type { mazeEventBase } from "../base/eventBus/mazeEventBase";
import { mazeContext } from "../base/mazeContext";
import type { mazeDynamicObject } from "../base/objects3d/mazeDynamicObject";
import mazePlayerEvent, { playerAction } from "../base/eventOrigin/mazePlayerEvent";
import type { PerspectiveCamera } from "three";


export default class mazePlayer implements mazeDynamicObject {
    private camera: PerspectiveCamera | null = null;
    private readonly movementStep = 0.5;
    private readonly rotateStep = 0.08;

    constructor() {}

    init(mazeContext: mazeContext): void {
        this.camera = mazeContext.getCamera();
        this.camera.position.set(0, 8, 10);
        this.camera.lookAt(0, 0, 0);
        mazeContext.getEventBus().insert3dObjectEvent(this);
    }

    dispose(mazeContext: mazeContext): void {
        mazeContext.getEventBus().remove3dObjectEvent(this);
        if (this.camera?.parent) {
            this.camera.parent.remove(this.camera);
        }
        this.camera = null;
    }

    update(mazeEvent: mazeEventBase): void {
        if (!this.camera || !(mazeEvent instanceof mazePlayerEvent)) {
            return;
        }

        switch (mazeEvent.playerAction) {
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