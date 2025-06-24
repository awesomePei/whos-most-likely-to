import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LandingPage() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    const newRoom = Math.random().toString(36).substring(2, 6).toUpperCase();
    navigate(`/lobby/${newRoom}?host=true`);
  };

  const handleJoin = () => {
    if (roomCode.trim()) {
      navigate(`/lobby/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <button onClick={handleCreate} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-lg rounded-lg shadow-md transition">
        Start New Game
      </button>
      <input
        className="border px-2 py-1 rounded"
        placeholder="Enter room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={handleJoin} className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-lg rounded-lg shadow-md transition">
        Join Game
      </button>
    </div>
  );
}

export default LandingPage;
