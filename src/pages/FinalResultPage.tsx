import { useLocation, useNavigate, useParams } from "react-router-dom";

function FinalResultPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { winTally, overallWinners } = location.state || {};

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4">
      <h1 className="text-3xl font-bold">🏁 Final Results – Room {roomId}</h1>
      {overallWinners && (
        <p className="text-xl">
          🎉 Overall Winner{overallWinners.length > 1 ? "s" : ""}:{" "}
          <strong>{overallWinners.join(", ")}</strong>
        </p>
      )}
      <div className="mt-4">
        <h2 className="text-lg font-semibold underline">Total Wins:</h2>
        <ul className="mt-2">
        {winTally &&
            Object.entries(winTally).map(([nickname, count]) => {
            const numCount = Number(count);
            return (
                <li key={nickname}>
                {nickname} – {numCount} win{numCount > 1 ? "s" : ""}
                </li>
            );
            })}
        </ul>
      </div>
      <button
        className="mt-8 bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
}

export default FinalResultPage;