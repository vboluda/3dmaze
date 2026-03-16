import { Children, Fragment, isValidElement, useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { mazeCollisionService } from "./base/collision/mazeCollisionService";
import { mazeAssetService } from "./base/assets/mazeAssetService";
import { mazeEventBus } from "./base/eventBus/mazeEventBus";
import mazeEventOrigin from "./base/eventOrigin/mazeEventOrigin";
import { mazeContext, type mazeTile } from "./base/mazeContext";
import mazeContainer from "./base/objects3d/mazeContainer";
import type { mazeStaticObject } from "./base/objects3d/mazeStaticObject";
import Box, { type BoxProps } from "./components/Box";
import mazeLights from "./maze/elements3d/mazeLights";
import mazeBox from "./maze/elements3d/mazeBox";
import mazePlane from "./maze/elements3d/mazePlane";
import mazePlayer from "./maze/mazePlayer";

export type MazeWorldProps = {
    mazeSize: number;
    initialTile: mazeTile;
    children?: ReactNode;
};

function resolveStaticObjects(children: ReactNode): mazeStaticObject[] {
    const staticObjects: mazeStaticObject[] = [];

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
            return;
        }

        if (child.type === Fragment) {
            const fragment = child as ReactElement<{ children?: ReactNode }>;
            staticObjects.push(...resolveStaticObjects(fragment.props.children));
            return;
        }

        if (child.type === Box) {
            const props = child.props as BoxProps;
            staticObjects.push(
                new mazeBox(props.position, {
                    color: props.color,
                    height: props.height,
                }),
            );
        }
    });

    return staticObjects;
}

export default function MazeWorld({ mazeSize, initialTile, children }: MazeWorldProps) {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mountElement = mountRef.current;
        if (!mountElement) {
            return;
        }

        const scene = new Scene();
        scene.background = new Color(0x1b1f1a);

        const camera = new PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.set(18, 18, 18);
        camera.lookAt(0, 0, 0);

        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;

        const eventBus = new mazeEventBus();
        const eventOrigin = new mazeEventOrigin(eventBus);
        const collisionService = new mazeCollisionService();
        const assetService = new mazeAssetService();
        const context = new mazeContext(mazeSize, {
            mazeCollisionService: collisionService,
            mazeAssetService: assetService,
            mazeEventBus: eventBus,
            scene,
            camera,
            eventOrigin,
        });

        const container = new mazeContainer();
        container.addStaticObject(new mazePlane());
        container.addStaticObject(new mazeLights());
        for (const staticObject of resolveStaticObjects(children)) {
            container.addStaticObject(staticObject);
        }
        container.init(context);

        const player = new mazePlayer(initialTile);
        player.init(context);

        eventOrigin.registerEventListeners(window);

        const resize = () => {
            const width = Math.max(mountElement.clientWidth, 1);
            const height = Math.max(mountElement.clientHeight, 1);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        };

        resize();
        mountElement.appendChild(renderer.domElement);

        let animationFrameId = 0;
        const renderLoop = () => {
            renderer.render(scene, camera);
            animationFrameId = window.requestAnimationFrame(renderLoop);
        };

        animationFrameId = window.requestAnimationFrame(renderLoop);
        window.addEventListener("resize", resize);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
            eventOrigin.unregisterEventListeners(window);
            player.dispose(context);
            container.dispose(context);
            assetService.dispose();
            renderer.dispose();
            if (renderer.domElement.parentElement === mountElement) {
                mountElement.removeChild(renderer.domElement);
            }
        };
    }, [children, initialTile, mazeSize]);

    return <div className="maze-world" ref={mountRef} />;
}
