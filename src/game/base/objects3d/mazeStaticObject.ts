import type { mazeContext } from "../mazeContext";


export interface mazeStaticObject {
    init(mazeContext: mazeContext): void;

    dispose(mazeContext: mazeContext): void;
}