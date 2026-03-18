import MazeWorld from "./game/MazeWorld";
import Box from "./game/components/Box";
import WallH from "./game/components/WallH";
import "./App.css";
import WallV from "./game/components/WallV";

function App() {
    return (
        <main className="app-root">
            <MazeWorld mazeSize={32} initialTile={{ X: 1, Z: 1 }} wall={1}>
                {/* TODO: la API actual usa position.y como coordenada Z de la tesela. Si se quiere una altura opcional, habrá que separar tile (x/z) de elevación (y). */}
                <Box position={{ x: 10, z: 3 }} />
                <Box position={{ x: 10, z: 3, y: 1 }} />
                <Box position={{ x: 10, z: 4 }} />
                <Box position={{ x: 10, z: 5 }} />
                <Box position={{ x: 10, z: 6 }} />
                <Box position={{ x: 5, z: 5, y: 1 }} />
                <WallH position={{ x: 10, z: 11 }} length={5} />
                <WallH position={{ x: 10, z: 11, y: 1 }} length={5} />
                <WallH position={{ x: 10, z: 13 }} length={5} />
                <WallH position={{ x: 10, z: 13, y: 1 }} length={5} />
                <WallH position={{ x: 10, z: 12, y: 1 }} length={5} />
                <WallV position={{ x: 11, z: 20 }} length={5} />
                <WallV position={{ x: 11, z: 20, y: 1 }} length={5} />
                <WallV position={{ x: 13, z: 20 }} length={5} />
                <WallV position={{ x: 13, z: 20, y: 1 }} length={5} />
                <WallV position={{ x: 12, z: 20, y: 1 }} length={5} />

                <WallV position={{ x: 2, z: 1}} length={3} />
                <WallV position={{ x: 2, z: 1, y: 1 }} length={3} />
                <WallV position={{ x: 1, z: 1, y: 1 }} length={3} />
                <WallV position={{ x: 0, z: 0, y: 1 }} length={5} />
                <WallH position={{ x: 1, z: 5 }} length={3} />
                <WallH position={{ x: 1, z: 5, y: 1 }} length={3} />
                <WallH position={{ x: 1, z: 4, y: 1 }} length={3} />
            </MazeWorld>
        </main>
    );
}

export default App;
