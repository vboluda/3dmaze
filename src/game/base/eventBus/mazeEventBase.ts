
export class mazeEventBase {
    priority: number;
    basePriority: number;
    eventID: string;

    constructor(
        priority: number,
    ){
        this.priority = priority;
        this.basePriority = priority;
        this.eventID = crypto.randomUUID();
    }
}