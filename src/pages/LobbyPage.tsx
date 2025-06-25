// src/pages/LobbyPage.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import qs from "query-string"; 

interface Player {
  id: string;
  nickname: string;
}

function LobbyPage() {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const query = qs.parse(location.search);
  const isHost = query.host === "true";

  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("basic");
  const [genres, setGenres] = useState<string[]>([]);
  // Copy Room ID button state
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.emit("getGenres");
    socket.on("genres", (genreList: string[]) => setGenres(genreList));
    return () => {
        socket.off("genres");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for player list updates
    socket.on("players", (players: Player[], hostId: string) => {
      setPlayers(players);
      setHostId(hostId);
    });

    // Listen for game start
    socket.on("gameStarted", () => {
      navigate(`/game/${roomId}`);
    });

    // Clean up listeners on unmount or socket change
    return () => {
      socket.off("players");
      socket.off("gameStarted");
    };
  }, [socket, roomId, navigate]);

  const handleJoin = () => {
    if (socket && roomId && nickname.trim()) {
      socket.emit("joinRoom", { roomId, nickname: nickname.trim(), isHost, });
      setJoined(true);
    }
  };

  const handleStart = (genre: string) => {
    if (socket && roomId) {
      socket.emit("startGame", { roomId, genre });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-indigo-100 pt-12 md:pt-20 px-4">
      <div className="max-w-4xl w-full bg-white/60 ring-1 ring-white/40 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Room: {roomId}</h2>
          <button
            onClick={() => {
              if (roomId) {
                navigator.clipboard.writeText(roomId);
                setCopied(true);
                setShowToast(true);
                setTimeout(() => {
                  setCopied(false);
                  setShowToast(false);
                }, 1000);
              }
            }}
            className="px-3 py-1 bg-white/70 border rounded hover:scale-105 transition"
            title="Copy Room ID"
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>

        {!joined ? (
          <>
            <input
              type="text"
              placeholder="Enter your nickname"
              className="border px-3 py-2 rounded w-64 text-center"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={!nickname.trim()}
              onClick={handleJoin}
            >
              Join Lobby
            </button>
          </>
        ) : (
          <>
            <p className="mb-2">Players in room:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
              {players.map((player) => (
                <li
                  key={player.id}
                  className={`flex items-center justify-center px-4 py-2 rounded-xl shadow-md transition-transform duration-200 hover:scale-105 ${
                    player.id === hostId
                      ? "bg-yellow-200/80 text-yellow-900 font-bold"
                      : "bg-white/70 text-gray-800"
                  }`}
                >
                  {player.nickname} {player.id === hostId && "(Host)"}
                </li>
              ))}
            </ul>

            {socket?.id === hostId && (
              <div className="flex flex-col items-center gap-2">
                  <label htmlFor="genre" className="text-sm">Choose Question Genre:</label>
                  <select
                  id="genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="border rounded px-3 py-1"
                  >
                  {genres.map((g) => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                  ))}
                  </select>

                  <button
                  onClick={() => handleStart(selectedGenre)}
                  className="px-6 py-2 bg-green-600 text-white rounded"
                  >
                  Start Game
                  </button>
              </div>
            )}
            {socket?.id !== hostId && <p>Waiting for host to start the game...</p>}
          </>
        )}
      </div>
      {showToast && (
        <div className="fixed bottom-5 bg-black/80 text-white px-4 py-2 rounded shadow text-sm">
          已複製！
        </div>
      )}
    </div>
  );
}

export default LobbyPage;
