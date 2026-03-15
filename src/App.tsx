import MazeWorld from "./game/MazeWorld";
import Box from "./game/components/Box";
import "./App.css";

function App() {
    return (
        <main className="app-root">
            <MazeWorld mazeSize={32} initialTile={{ X: 2, Z: 2 }} >
                {/* TODO: la API actual usa position.y como coordenada Z de la tesela. Si se quiere una altura opcional, habrá que separar tile (x/z) de elevación (y). */}
                <Box position={{ x: 10, z: 3 }} />
                <Box position={{ x: 10, z: 3, y: 1 }} />
            </MazeWorld>
        </main>
    );
}

export default App;