import type { mazeContext } from "../mazeContext";
import type { ICollider } from "../collision/ICollider";


export interface mazeStaticObject extends ICollider {
    init(mazeContext: mazeContext): void;

    dispose(mazeContext: mazeContext): void;
}