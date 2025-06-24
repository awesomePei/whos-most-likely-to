// src/pages/GamePage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

interface Player {
  id: string;
  nickname: string;
}

function GamePage() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [question, setQuestion] = useState("Who's most likely to... become a millionaire?");
  const [players, setPlayers] = useState<Player[]>([]);
  const [voted, setVoted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on("players", (players: Player[]) => {
        setPlayers(players);
    });

    socket.on("newQuestion", (q: string) => {
      setQuestion(q);
      setVoted(false);
    });

    socket.on("votingResults", ({ tally, winners }) => {
        console.log("Voting results:", tally);
        navigate(`/result/${roomId}`, { state: { winners, tally, players } });
    });

    socket.on("gameOver", () => {
      alert("🎉 Game Over! Thanks for playing!");
      navigate("/");
    });

    if (roomId) {
      socket.emit("getPlayers", { roomId });
      socket.emit("getCurrentQuestion", { roomId }); 
    }

    return () => {
      socket.off("players");
      socket.off("newQuestion");
      socket.off("votingResults");
      socket.off("gameOver");
    };
  }, [socket, navigate, roomId]);

  const handleVote = (playerId: string) => {
    if (socket && !voted) {
      socket.emit("vote", {
        roomId,
        votedFor: playerId,
      });
      setVoted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
      <h1 className="text-2xl font-semibold">Room: {roomId}</h1>
      <h2 className="text-2xl font-medium mb-10 text-center tracking-wide">{question}</h2>

      {!voted ? (
        <div className="grid grid-cols-3 gap-4">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handleVote(player.id)}
              className="bg-gray-200 hover:bg-gray-300 text-black text-xl font-bold px-8 py-4 rounded-md shadow transition-all duration-150"
            >
              {player.nickname}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-green-700 font-semibold text-xl mt-8">✅ Vote submitted. Waiting for others...</p>
      )}
    </div>
  );
}

export default GamePage;
