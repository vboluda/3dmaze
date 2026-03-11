import { mazeCollisionService } from "./collision/mazeCollisionService";
import { mazeEventBus } from "./eventBus/mazeEventBus";
import { PerspectiveCamera, Scene } from "three";
import type mazeEventOrigin from "./eventOrigin/mazeEventOrigin";

export interface mazeContextDependencies {
    mazeCollisionService: mazeCollisionService;
    mazeEventBus: mazeEventBus;
    scene: Scene;
    camera: PerspectiveCamera;
    eventOrigin: mazeEventOrigin;
}

export class mazeContext {
    private readonly mazeCollisionService: mazeCollisionService;
    private readonly mazeEventBus: mazeEventBus;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private readonly eventOrigin: mazeEventOrigin;

    constructor(dependencies: mazeContextDependencies) {
        this.mazeCollisionService = dependencies.mazeCollisionService;
        this.mazeEventBus = dependencies.mazeEventBus;
        this.scene = dependencies.scene;
        this.camera = dependencies.camera;
        this.eventOrigin = dependencies.eventOrigin;
    }

    getCollisionService(): mazeCollisionService {
        return this.mazeCollisionService;
    }

    getEventBus(): mazeEventBus {
        return this.mazeEventBus;
    }

    getScene(): Scene {
        return this.scene;
    }

    getCamera(): PerspectiveCamera {
        return this.camera;
    }

    getEventOrigin(): mazeEventOrigin {
        return this.eventOrigin;
    }
};



