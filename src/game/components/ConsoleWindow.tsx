import type { mazeStaticObject } from "../base/objects3d/mazeStaticObject";
import mazeConsoleWindow from "../maze/elements3d/mazeConsoleWindow";

export default function ConsoleWindow() {
    return null;
}

ConsoleWindow.toMazeStaticObject = (): mazeStaticObject => {
    return new mazeConsoleWindow();
};

ConsoleWindow.displayName = "ConsoleWindow";
