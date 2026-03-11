import { useEffect, useRef } from "react";
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { mazeCollisionService } from "./base/collision/mazeCollisionService";
import { mazeEventBus } from "./base/eventBus/mazeEventBus";
import { mazeContext } from "./base/mazeContext";
import mazeContainer from "./base/objects3d/mazeContainer";
import mazeLights from "./maze/elements3d/mazeLights";
import mazePlane from "./maze/elements3d/mazePlane";

export default function MazeWorld() {
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
        const collisionService = new mazeCollisionService();
        const context = new mazeContext({
            mazeCollisionService: collisionService,
            mazeEventBus: eventBus,
            scene,
            camera,
        });

        const container = new mazeContainer();
        container.addStaticObject(new mazePlane());
        container.addStaticObject(new mazeLights());
        container.init(context);

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
            container.dispose(context);
            renderer.dispose();
            if (renderer.domElement.parentElement === mountElement) {
                mountElement.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div className="maze-world" ref={mountRef} />;
}
