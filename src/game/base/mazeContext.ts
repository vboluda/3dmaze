import { mazeCollisionService } from "./collision/mazeCollisionService";
import { mazeEventBus } from "./eventBus/mazeEventBus";

export class mazeContext {
    private mazeCollisionService: mazeCollisionService;
    private mazeEventBus: mazeEventBus;

    constructor() {
        this.mazeCollisionService = new mazeCollisionService();
        this.mazeEventBus = new mazeEventBus();
    }  

    getCollisionService(): mazeCollisionService {
        return this.mazeCollisionService;
    }

    getEventBus(): mazeEventBus {
        return this.mazeEventBus;
    }
};



