import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import mazeBox from "../maze/elements3d/mazeBox";
import type { mazeStaticObject } from "../base/objects3d/mazeStaticObject";

export type BoxPosition = {
    x: number;
    y?: number;
    z: number;
};

export type BoxProps = {
    position: BoxPosition;
    color?: number;
    height?: number;
};

type mazeStaticFactoryComponent = {
    toMazeStaticObject?: (props: unknown) => mazeStaticObject;
};

type mazeRenderableComponent = (props: unknown) => ReactNode;

export default function Box(props: BoxProps) {
    void props;
    return null;
}

Box.toMazeStaticObject = (props: BoxProps): mazeStaticObject => {
    return new mazeBox(props.position, {
        color: props.color,
        height: props.height,
    });
};

export function resolveStaticObjectsFromChildren(children: ReactNode): mazeStaticObject[] {
    const staticObjects: mazeStaticObject[] = [];

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
            return;
        }

        if (child.type === Fragment) {
            const fragment = child as ReactElement<{ children?: ReactNode }>;
            staticObjects.push(...resolveStaticObjectsFromChildren(fragment.props.children));
            return;
        }

        const staticFactory = child.type as mazeStaticFactoryComponent;
        if (staticFactory.toMazeStaticObject) {
            staticObjects.push(staticFactory.toMazeStaticObject(child.props));
            return;
        }

        if (typeof child.type === "function") {
            const renderableComponent = child.type as mazeRenderableComponent;
            staticObjects.push(...resolveStaticObjectsFromChildren(renderableComponent(child.props)));
        }
    });

    return staticObjects;
}

Box.displayName = "Box";
