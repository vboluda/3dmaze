import { mazeCollisionService } from "./collision/mazeCollisionService";
import { mazeEventBus } from "./eventBus/mazeEventBus";
import { PerspectiveCamera, Scene } from "three";

interface mazeContextDependencies {
    mazeCollisionService: mazeCollisionService;
    mazeEventBus: mazeEventBus;
    scene: Scene;
    camera: PerspectiveCamera;
}

export class mazeContext {
    private static instance: mazeContext | null = null;

    private mazeCollisionService: mazeCollisionService;
    private mazeEventBus: mazeEventBus;
    private scene: Scene;
    private camera: PerspectiveCamera;

    private constructor(dependencies: mazeContextDependencies) {
        this.mazeCollisionService = dependencies.mazeCollisionService;
        this.mazeEventBus = dependencies.mazeEventBus;
        this.scene = dependencies.scene;
        this.camera = dependencies.camera;
    }

    static initialize(dependencies: mazeContextDependencies): void {
        if (mazeContext.instance) {
            throw new Error("mazeContext has already been initialized.");
        }

        mazeContext.instance = new mazeContext(dependencies);
    }

    static getInstance(): mazeContext {
        if (!mazeContext.instance) {
            throw new Error("mazeContext has not been initialized. Call initialize() first.");
        }

        return mazeContext.instance;
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



