// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultPage from "./pages/ResultPage";
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-gray-900 font-sans">
        <header className="bg-zinc-800 text-white py-6 shadow-md">
          <h1 className="text-4xl font-extrabold text-center uppercase tracking-wide">
            Who’s Most Likely To...
          </h1>
        </header>

        <main className="flex flex-col items-center justify-center px-4 py-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby/:roomId" element={<LobbyPage />} />
            <Route path="/game/:roomId" element={<GamePage />} />
            <Route path="/result/:roomId" element={<ResultPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
