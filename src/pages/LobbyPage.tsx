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

  const handleStart = () => {
    if (socket && roomId) {
      socket.emit("startGame", { roomId });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-4">
      <h2 className="text-2xl font-semibold">Room: {roomId}</h2>

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
          <ul className="mb-4 space-y-1">
            {players.map((player) => (
              <li
                key={player.id}
                className={`px-4 py-1 rounded ${
                  player.id === hostId ? "bg-yellow-300 font-bold" : "bg-gray-300"
                }`}
              >
                {player.nickname} {player.id === hostId && "(Host)"}
              </li>
            ))}
          </ul>

          {socket?.id === hostId && (
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Start Game
            </button>
          )}
          {socket?.id !== hostId && <p>Waiting for host to start the game...</p>}
        </>
      )}
    </div>
  );
}

export default LobbyPage;
