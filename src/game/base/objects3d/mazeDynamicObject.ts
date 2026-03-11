import type { mazeEventBase } from "../eventBus/mazeEventBase";
import type { mazeStaticObject } from "./mazeStaticObject";

export interface mazeDynamicObject extends mazeStaticObject {
    update(mazeEventBase: mazeEventBase): void;
}

