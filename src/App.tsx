// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultPage from "./pages/ResultPage";
import FinalResultPage from "./pages/FinalResultPage";  
import './index.css';
import { useEffect, useState } from "react";

function ViewText({ text, speed = 80 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <h1 className="text-4xl font-extrabold text-center uppercase tracking-wide drop-shadow-md text-rose-600 dark:text-black">
      {displayedText}
      <span className="animate-pulse">|</span>
    </h1>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode");
    if (storedMode) {
      setDarkMode(storedMode === "true");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <Router>
      <div className={`min-h-screen w-screen text-gray-900 font-sans ${darkMode ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 text-white' : 'bg-gradient-to-br from-pink-100 via-yellow-100 to-indigo-100'}`}>
        <header className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-md py-6 shadow-md border-b ${darkMode ? 'border-white/10' : 'border-white/30'}`}>
          <ViewText text="Who’s Most Likely To..." />
          <button
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 px-4 py-2 text-sm bg-white/70 hover:bg-white/90 rounded shadow text-black"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        <main className="flex flex-col items-center justify-center px-4 py-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby/:roomId" element={<LobbyPage />} />
            <Route path="/game/:roomId" element={<GamePage />} />
            <Route path="/result/:roomId" element={<ResultPage />} />
            <Route path="/final/:roomId" element={<FinalResultPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
