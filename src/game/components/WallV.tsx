import { Fragment, type ReactElement } from "react";
import Box, { type BoxPosition } from "./Box";

export type WallHProps = {
    position: BoxPosition;
    length: number;
};

export default function WallV({ position, length }: WallHProps) {
    const boxes: ReactElement[] = [];
    const y = position.y ?? 0;

    for (let index = 0; index < length; index += 1) {
        boxes.push(
            <Box
                key={`wall-v-${position.x}-${position.z}-${y}-${index}`}
                position={{ x: position.x, z: position.z + index, y }}
            />,
        );
    }

    return <Fragment>{boxes}</Fragment>;
}
