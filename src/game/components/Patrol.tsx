import type { mazeStaticObject } from "../base/objects3d/mazeStaticObject";
import mazePatrol, { type MazePatrolPosition, type MazePatrolSpeed } from "../maze/elements3d/mazePatrol";

export type PatrolProps = {
    position: MazePatrolPosition;
    speed: MazePatrolSpeed;
};

export default function Patrol(props: PatrolProps) {
    void props;
    return null;
}

Patrol.toMazeStaticObject = (props: PatrolProps): mazeStaticObject => {
    return new mazePatrol(props.position, props.speed);
};

Patrol.displayName = "Patrol";
