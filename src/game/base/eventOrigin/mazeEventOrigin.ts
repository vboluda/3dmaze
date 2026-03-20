import type { mazeEventBus } from "../eventBus/mazeEventBus";
import mazePlayerEvent, { playerAction, playerInputState } from "./mazePlayerEvent";
import mazeTickEvent from "./mazeTickEvent";

const TICK_INTERVAL_MS = 10;

const keyTranslator = {
    "ArrowUp": playerAction.movementFordward,
    "ArrowLeft": playerAction.movementLeft,
    "ArrowDown": playerAction.movementBackward,
    "ArrowRight": playerAction.movementRight,
    "KeyA": playerAction.rotateLeft,
    "KeyD": playerAction.rotateRight,
    "KeyW":playerAction.rotateUp,
    "KeyS": playerAction.rotateDown
} as const;

type movementKey = keyof typeof keyTranslator;

function isMovementKey(key: string): key is movementKey {
    return key in keyTranslator;
}

export default class mazeEventOrigin {
    public readonly mazeEventBus: mazeEventBus;
    private readonly pressedKeys: Set<movementKey> = new Set();
    private tickIntervalId: ReturnType<typeof setInterval> | null = null;

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
        const playerEvent = new mazePlayerEvent(action, playerInputState.pressed);
        this.mazeEventBus.send(playerEvent);
    }

    public keyboardReleaseEventHandler(event: KeyboardEvent): void {
        const key = event.code;
        if (!isMovementKey(key)) {
            return;
        }

        if (!this.pressedKeys.delete(key)) {
            return;
        }

        const action = keyTranslator[key];
        const playerEvent = new mazePlayerEvent(action, playerInputState.released);
        this.mazeEventBus.send(playerEvent);
    }

    registerEventListeners(target: Window | HTMLElement = window): void {
        target.addEventListener("keydown", this.keydownListener as EventListener);
        target.addEventListener("keyup", this.keyupListener as EventListener);
        this.startTickGenerator();
    }

    unregisterEventListeners(target: Window | HTMLElement = window): void {
        target.removeEventListener("keydown", this.keydownListener as EventListener);
        target.removeEventListener("keyup", this.keyupListener as EventListener);
        this.stopTickGenerator();
        this.pressedKeys.clear();
    }

    private startTickGenerator(): void {
        if (this.tickIntervalId !== null) {
            return;
        }

        this.tickIntervalId = setInterval(() => {
            this.mazeEventBus.send(new mazeTickEvent());
        }, TICK_INTERVAL_MS);
    }

    private stopTickGenerator(): void {
        if (this.tickIntervalId === null) {
            return;
        }

        clearInterval(this.tickIntervalId);
        this.tickIntervalId = null;
    }
}