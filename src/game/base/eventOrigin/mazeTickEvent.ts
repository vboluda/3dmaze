import { mazeEventBase } from "../eventBus/mazeEventBase";

export const tickPriority = 10;

export default class mazeTickEvent extends mazeEventBase {
    public readonly timestampMs: number;

    constructor(timestampMs: number = performance.now()) {
        super(tickPriority);
        this.timestampMs = timestampMs;
    }
}