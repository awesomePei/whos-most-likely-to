import { useLocation, useNavigate, useParams } from "react-router-dom";

function FinalResultPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { winTally, overallWinners } = location.state || {};

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-indigo-100 pt-12 md:pt-20 px-4">
      <div className="max-w-3xl w-full bg-white/60 ring-1 ring-white/40 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm text-center animate-pulse">
          🏁 Final Results – Room {roomId}
        </h1>
        {overallWinners && (
          <p className="text-2xl font-bold text-purple-800 bg-white/50 px-4 py-2 rounded-xl shadow-md text-center">
            🎉 Overall Winner{overallWinners.length > 1 ? "s" : ""}:{" "}
            <strong>{overallWinners.join(", ")}</strong>
          </p>
        )}
        <div className="mt-4 w-full flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold underline">Total Wins:</h2>
          <ul className="mt-2 flex flex-col gap-2 w-full max-w-sm">
            {winTally &&
              Object.entries(winTally)
                .sort(([, a], [, b]) => Number(b) - Number(a))
                .map(([nickname, count]) => {
                  const numCount = Number(count);
                  return (
                    <li
                      key={nickname}
                      className="flex justify-between px-4 py-2 rounded-lg text-gray-800 bg-white/30 w-full"
                    >
                      <span className="truncate">{nickname}</span>
                      <span>{numCount} win{numCount > 1 ? "s" : ""}</span>
                    </li>
                  );
                })}
          </ul>
        </div>
        <button
          className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:brightness-110 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default FinalResultPage;