import { mazeEventBase } from "../eventBus/mazeEventBase";


export const playerPrioority = 100;

export const playerInputState = {
    pressed: 1,
    released: 2,
} as const;

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

export type PlayerAction = typeof playerAction[keyof typeof playerAction];
export type PlayerInputState = typeof playerInputState[keyof typeof playerInputState];

export default class mazePlayerEvent extends mazeEventBase {
    public readonly playerAction: PlayerAction;
    public readonly inputState: PlayerInputState;

    constructor(playerAction: PlayerAction, inputState: PlayerInputState) {
        super(playerPrioority);
        this.playerAction = playerAction;
        this.inputState = inputState;
    }
}