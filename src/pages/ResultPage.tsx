// src/pages/ResultPage.tsx
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function ResultPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  const { winners, tally } = location.state || {};
  const [hostId, setHostId] = useState<string | null>(null);
  const [playerList, setPlayerList] = useState<any[]>([]); 

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for updated player list and host info
    socket.on("players", (_players, hostId) => {
      setPlayerList(_players);
      setHostId(hostId);
    });

    socket.emit("getPlayers", { roomId });

    // Listen for game over
    socket.on("gameOver", () => {
      alert("🎉 Game Over! Thanks for playing!");
    //   navigate("/");
    });

    socket.on("newQuestion", () => {
      navigate(`/game/${roomId}`);
    });

    socket.on("finalResults", (data) => {
      navigate(`/final/${roomId}`, { state: data });
    });

    return () => {
      socket.off("players");
      socket.off("gameOver");
      socket.off("newQuestion");
      socket.off("finalResults");
    };
  }, [socket, roomId, navigate]);

  const isHost = socket?.id === hostId;

  const getNickname = (id: string) =>
    playerList?.find((p: any) => p.id === id)?.nickname || id;

  const handleNext = () => {
    if (socket && roomId) {
      socket.emit("nextQuestion", { roomId });
    //   navigate(`/game/${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-indigo-100 pt-12 md:pt-20 px-4">
      <div className="max-w-3xl w-full bg-white/60 ring-1 ring-white/40 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
          🎉 Results – Room {roomId}
        </h1>

        {winners ? (
          <>
            <p className="text-xl md:text-2xl font-semibold text-purple-800 bg-white/50 px-4 py-2 rounded-xl shadow-md">
              🏆 Most likely: <strong>{winners.join(", ")}</strong>
            </p>

            <div className="w-full flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-indigo-700 mt-4">🗳️ Votes:</h2>
              <ul className="mt-2 flex flex-col gap-2 w-full max-w-sm">
                {tally &&
                  Object.entries(tally).map(([id, count]: any) => (
                    <li
                      key={id}
                      className="flex justify-between px-4 py-2 rounded-lg text-gray-800 bg-white/30 w-full"
                    >
                      <span className="truncate">{getNickname(id)}</span>
                      <span>{count} vote{count > 1 ? "s" : ""}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {!isHost && (
              <div className="mt-4 text-center text-sm text-purple-700 font-medium">
                ⏳ Waiting for the host to go to the next question...
              </div>
            )}
            {isHost && (
              <button
                onClick={handleNext}
                className="bg-purple-500 hover:scale-105 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow transition"
              >
                Next Question →
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic text-center">No results available.</p>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
