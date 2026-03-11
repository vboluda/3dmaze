import { mazeEventBase } from "../eventBus/mazeEventBase";


export const playerPrioority = 100;

export const playerAction = {
    movementFordward: 1,
    movementBackward: 2,
    movementLeft: 3,
    movementRight: 4, 
    rotateLeft: 5,
    rotateRight: 6,
    rotateUp: 7,
    rotateDown: 8,
} as const;

export default class mazePlayerEvent extends mazeEventBase {
    public playerAction: number;

    constructor(playerAction: number) {
        super(playerPrioority);
        this.playerAction = playerAction;
    }
}