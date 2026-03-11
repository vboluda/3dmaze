import type { mazeEventBus } from "../eventBus/mazeEventBus";
import mazePlayerEvent, { playerAction } from "./mazePlayerEvent";

const keyTranslator = {
    "KeyW": playerAction.movementFordward,
    "KeyA": playerAction.movementLeft,
    "KeyS": playerAction.movementBackward,
    "KeyD": playerAction.movementRight,
} as const;

type movementKey = keyof typeof keyTranslator;

function isMovementKey(key: string): key is movementKey {
    return key in keyTranslator;
}

export default class mazeEventOrigin {
    public readonly mazeEventBus: mazeEventBus;
    private readonly pressedKeys: Set<movementKey> = new Set();

    private readonly keydownListener = (event: KeyboardEvent): void => {
        this.keyboardPressEventHandler(event);
    };

    private readonly keyupListener = (event: KeyboardEvent): void => {
        this.keyboardReleaseEventHandler(event);
    };
    
    constructor(mazeEventBus: mazeEventBus) {
        this.mazeEventBus = mazeEventBus;
    }

    public keyboardPressEventHandler(event: KeyboardEvent): void {
        const key = event.code;
        if (!isMovementKey(key)) {
            return;
        }

        if (this.pressedKeys.has(key)) {
            return;
        }

        this.pressedKeys.add(key);
        const action = keyTranslator[key];

        if (action) {
            const playerEvent = new mazePlayerEvent(action);
            this.mazeEventBus.send(playerEvent);
        }
    }

    public keyboardReleaseEventHandler(event: KeyboardEvent): void {
        const key = event.code;
        if (!isMovementKey(key)) {
            return;
        }

        this.pressedKeys.delete(key);
    }

    registerEventListeners(target: Window | HTMLElement = window): void {
        target.addEventListener("keydown", (e) => this.keydownListener(e as KeyboardEvent));
        target.addEventListener("keyup", (e) => this.keyupListener(e as KeyboardEvent));
    }

    unregisterEventListeners(target: Window | HTMLElement = window): void {
        target.removeEventListener("keydown", (e) => this.keydownListener(e as KeyboardEvent));
        target.removeEventListener("keyup", (e) => this.keyupListener(e as KeyboardEvent));
        this.pressedKeys.clear();
    }
}