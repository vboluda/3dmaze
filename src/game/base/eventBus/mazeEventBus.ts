
import type { mazeDynamicObject } from "../objects3d/mazeDynamicObject";
import type { mazeEventBase } from "./mazeEventBase";

const PROCESS_TICK_MS = 10;
const MAX_EVENTS_PER_TICK = 8;
const PENDING_EVENTS_PRIORITY_INCREMENT = 1;

interface queuedMazeEvent {
    event: mazeEventBase;
    order: number;
    effectivePriority: number;
}

export class mazeEventBus {
    private readonly subscribers: Set<mazeDynamicObject> = new Set();
    private readonly queue: queuedMazeEvent[] = [];
    private nextOrder = 0;
    private isProcessing = false;
    private pendingTickTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {}

    insert3dObjectEvent(object: mazeDynamicObject): void {
        this.subscribers.add(object);
    }

    remove3dObjectEvent(object: mazeDynamicObject): void {
        this.subscribers.delete(object);
    }

    send(event: mazeEventBase): void {
        this.queue.push({
            event,
            order: this.nextOrder++,
            effectivePriority: event.priority,
        });
        this.scheduleNextTick();
    }

    private scheduleNextTick(): void {
        if (this.pendingTickTimer !== null || this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.pendingTickTimer = setTimeout(() => {
            this.pendingTickTimer = null;
            this.processQueueTick();
        }, PROCESS_TICK_MS);
    }

    private processQueueTick(): void {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        try {
            this.queue.sort((a, b) => {
                if (a.effectivePriority === b.effectivePriority) {
                    return a.order - b.order;
                }
                return b.effectivePriority - a.effectivePriority;
            });

            let processed = 0;
            while (this.queue.length > 0 && processed < MAX_EVENTS_PER_TICK) {
                const queuedEvent = this.queue.shift();
                if (!queuedEvent) {
                    break;
                }

                for (const object of this.subscribers) {
                    object.update(queuedEvent.event);
                }

                processed++;
            }

            // Age remaining queued events to reduce starvation.
            for (const pendingEvent of this.queue) {
                pendingEvent.effectivePriority += PENDING_EVENTS_PRIORITY_INCREMENT;
            }
        } finally {
            this.isProcessing = false;
            this.scheduleNextTick();
        }
    }
}