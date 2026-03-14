import { mazeCollisionService } from "./collision/mazeCollisionService";
import { mazeEventBus } from "./eventBus/mazeEventBus";
import { PerspectiveCamera, Scene } from "three";
import type mazeEventOrigin from "./eventOrigin/mazeEventOrigin";


export type mazeTile = {
    X: number;
    Z: number;
    Y?: number;
};

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
    private readonly mazeSize: number;

    constructor(mazeSize: number, dependencies: mazeContextDependencies) {
        this.mazeCollisionService = dependencies.mazeCollisionService;
        this.mazeEventBus = dependencies.mazeEventBus;
        this.scene = dependencies.scene;
        this.camera = dependencies.camera;
        this.eventOrigin = dependencies.eventOrigin;
        this.mazeSize = mazeSize;
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

    getMazeSize(): number {
        return this.mazeSize;
    }

    calculateXZCoors(tile: mazeTile): { x: number; z: number } {
        const cellSize = 1;
        const halfMaze = this.mazeSize / 2;

        const tileX = Math.round(tile.X);
        const tileZ = Math.round(tile.Z);

        return {
            x: -halfMaze + (tileX + 0.5) * cellSize,
            z: halfMaze - (tileZ + 0.5) * cellSize,
        };
    }
};



