import type { mazeStaticObject } from "../base/objects3d/mazeStaticObject";
import mazeBox from "./elements3d/mazeBox";

export default function createPerimeterWalls(mazeSize: number, wall: number): mazeStaticObject[] {
    const wallLevels = Number.isFinite(wall) ? Math.max(0, Math.floor(wall)) : 0;
    if (wallLevels < 1 || mazeSize < 1) {
        return [];
    }

    const max = mazeSize - 1;
    const walls: mazeStaticObject[] = [];

    for (let level = 0; level < wallLevels; level++) {
        for (let z = 0; z < mazeSize; z++) {
            walls.push(new mazeBox({ x: 0, z, y: level }));
            if (max > 0) {
                walls.push(new mazeBox({ x: max, z, y: level }));
            }
        }

        for (let x = 1; x < max; x++) {
            walls.push(new mazeBox({ x, z: 0, y: level }));
            walls.push(new mazeBox({ x, z: max, y: level }));
        }
    }

    return walls;
}
