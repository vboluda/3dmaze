import { mazeEventBase } from "../eventBus/mazeEventBase";

const PLAYER_HURT_PRIORITY = 90;

export default class mazeEventHurt extends mazeEventBase {
    public readonly impact: number;

    constructor(impact: number) {
        super(PLAYER_HURT_PRIORITY);
        this.impact = impact;
    }
}
