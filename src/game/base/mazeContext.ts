import { mazeCollisionService } from "./collision/mazeCollisionService";
import { mazeEventBus } from "./eventBus/mazeEventBus";
import { PerspectiveCamera, Scene } from "three";

export interface mazeContextDependencies {
    mazeCollisionService: mazeCollisionService;
    mazeEventBus: mazeEventBus;
    scene: Scene;
    camera: PerspectiveCamera;
}

export class mazeContext {
    private readonly mazeCollisionService: mazeCollisionService;
    private readonly mazeEventBus: mazeEventBus;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;

    constructor(dependencies: mazeContextDependencies) {
        this.mazeCollisionService = dependencies.mazeCollisionService;
        this.mazeEventBus = dependencies.mazeEventBus;
        this.scene = dependencies.scene;
        this.camera = dependencies.camera;
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
};



