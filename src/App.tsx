import MazeWorld from "./game/MazeWorld";
import "./App.css";

function App() {
    return (
        <main className="app-root">
            <MazeWorld mazeSize={32} initialTile={{ X: 2, Z: 2 }} />
        </main>
    );
}

export default App;
