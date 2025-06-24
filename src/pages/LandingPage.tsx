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
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-indigo-100">
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 w-[90%] max-w-md">
        <h2 className="text-3xl font-bold text-rose-600 drop-shadow text-center">Welcome!</h2>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 hover:brightness-110 text-white text-lg font-semibold rounded-full shadow-lg transition-transform duration-200"
        >
          🎉 Start New Game
        </button>
        <input
          className="border-2 border-gray-300 focus:border-pink-400 px-4 py-2 rounded-full shadow-sm w-full text-center text-lg transition"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-lg font-semibold rounded-full shadow-lg transition-transform hover:scale-105 duration-200"
        >
          🚪 Join Game
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
