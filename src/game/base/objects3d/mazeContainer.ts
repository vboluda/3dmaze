import type { mazeContext } from "../mazeContext";
import type { mazeStaticObject } from "./mazeStaticObject";


export default class mazeContainer {
    private staticObjects: mazeStaticObject[] = [];


    constructor() {}    

    addStaticObject(object: mazeStaticObject): void {
        this.staticObjects.push(object);
    }

    init(mazeContext: mazeContext): void {
        for (const object of this.staticObjects) {
            object.init(mazeContext);
        }
    }

    dispose(mazeContext: mazeContext): void {
        for (const object of this.staticObjects) {
            object.dispose(mazeContext);
        }
    }

}