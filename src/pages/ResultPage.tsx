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
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4">
      <h1 className="text-2xl font-bold">Results – Room {roomId}</h1>

      {winners ? (
        <>
          <p className="text-xl">🏆 Most likely: <strong>{winners.join(", ")}</strong></p>

          <div className="mt-4">
            <h2 className="text-lg font-semibold underline">Votes:</h2>
            <ul className="mt-2">
              {tally &&
                Object.entries(tally).map(([id, count]: any) => (
                  <li key={id}>
                    {getNickname(id)} – {count} vote{count > 1 ? "s" : ""}
                  </li>
                ))}
            </ul>
          </div>

          {isHost && (
            <button
              onClick={handleNext}
              className="mt-8 bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded"
            >
              Next Question →
            </button>
          )}
        </>
      ) : (
        <p className="text-gray-500">No results available.</p>
      )}
    </div>
  );
}

export default ResultPage;
