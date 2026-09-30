import React, { useState, useEffect } from "react";
import "../App.css";

const items = [
  "tap", "cup", "coop", "cup", "coop", "coop",
  "coop", "tape", "tape", "tape", "tap", "cup",
  "tap", "cup", "tap", "coop", "cup", "tap",
  "coop", "tape", "cup", "tape", "tape", "coop",
  "cup", "tape", "tap", "coop", "tape", "cup",
  "tape", "coop", "cup", "tap", "cup", "tap"
];

const createBoard = () => {
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => {
      const word = items[row * 6 + col];
      return {
        word,
        imageUrl: `/images/${word}.png`
      };
    })
  );
};

const truePath = [
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
  { row: 1, col: 3 },
  { row: 1, col: 4 },
  { row: 2, col: 4 },
  { row: 3, col: 4 },
  { row: 3, col: 3 },
  { row: 4, col: 3 },
  { row: 5, col: 3 },
  { row: 5, col: 4 },
  { row: 5, col: 5 },
  { row: 4, col: 5 },
  { row: 3, col: 5 },
  { row: 3, col: 6 }
];

function Set1Test2({ onComplete }) {
  const [board] = useState(createBoard());
  const [current, setCurrent] = useState(truePath[0]);
  const [path, setPath] = useState([truePath[0]]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(360);
  const [stopwatchMode, setStopwatchMode] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;

    const handleKeyDown = (e) => {
      if (e.key === "Backspace") handleUndo();
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timerRunning, current, path]);

  useEffect(() => {
    if (!timerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (!stopwatchMode) {
          if (prev > 0) return prev - 1;
          setStopwatchMode(true);
          return 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, stopwatchMode]);

  useEffect(() => {
    if (stopwatchMode) {
      const blinkInterval = setInterval(() => {
        setBlink(prev => !prev);
      }, 500);
      return () => clearInterval(blinkInterval);
    }
  }, [stopwatchMode]);

  const startGame = () => {
    setTimerRunning(true);
    setTimeLeft(360);
    setShowSuccess(false);
    setStopwatchMode(false);
    setCurrent(truePath[0]);
    setPath([truePath[0]]);
  };

  const handleMove = (dir) => {
    if (showSuccess || !timerRunning) return;

    let newRow = current.row;
    let newCol = current.col;

    if (dir === "up") newRow -= 1;
    if (dir === "down") newRow += 1;
    if (dir === "left") newCol -= 1;
    if (dir === "right") newCol += 1;

    if (newRow < 0 || newRow > 6 || newCol < 0 || newCol > 6) return;

    const next = { row: newRow, col: newCol };
    const newPath = [...path, next];

    setCurrent(next);
    setPath(newPath);

    if (
      newPath.length === truePath.length &&
      JSON.stringify(newPath) === JSON.stringify(truePath)
    ) {
      setShowSuccess(true);
      setTimerRunning(false);
      if (onComplete) onComplete(); // ✅ Mark completion for tab
    }
  };

  const handleUndo = () => {
    if (path.length > 1 && timerRunning) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      setCurrent(newPath[newPath.length - 1]);
      setShowSuccess(false);
    }
  };

  const renderGrid = () => {
    return board.flatMap((row, r) =>
      row.map((cell, c) => (
        <div
          key={`cell-${r}-${c}`}
          style={{
            width: 100,
            height: 100,
            border: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            backgroundColor: "white"
          }}
        >
          <img
            src={cell.imageUrl}
            alt={cell.word}
            style={{ width: 50, height: 50 }}
          />
          {(r < 2 && c < 2) && cell.word}
        </div>
      ))
    );
  };

  const renderPath = () => {
    return path.slice(0, -1).map((point, i) => {
      const nextPoint = path[i + 1];
      const top = (point.row + nextPoint.row) / 2 * 101.5 - 3;
      const left = (point.col + nextPoint.col) / 2 * 100;
      const isVertical = point.col === nextPoint.col;

      return (
        <div
          key={`path-${i}`}
          style={{
            position: "absolute",
            top,
            left,
            width: isVertical ? 6 : 101,
            height: isVertical ? 101.5 : 6,
            backgroundColor: "black",
            transform: "translate(-50%, -50%)",
            zIndex: 5
          }}
        />
      );
    });
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return stopwatchMode ? `-${formatted}` : formatted;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      position: "relative"
    }}>
      {(!timerRunning || showSuccess) && (
        <div style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: "rgba(0,0,0,0.4)", zIndex: 25
        }} />
      )}

      {timerRunning && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 36,
          fontWeight: "bold",
          backgroundColor: stopwatchMode
            ? `rgba(255, 100, 100, ${blink ? 0.3 : 0.6})`
            : (timeLeft <= 120 ? "rgba(255, 255, 100, 0.6)" : "rgba(255, 255, 255, 0.6)"),
          padding: "10px 25px",
          borderRadius: 12,
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 50
        }}>
          {formatTime()}
        </div>
      )}

      {showSuccess && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px 40px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          zIndex: 30,
          textAlign: "center"
        }}>
          <h2>🎉 Maze complete!</h2>
        </div>
      )}

      {!timerRunning && !showSuccess && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "30px 40px",
          borderRadius: 10,
          boxShadow: "0 0 30px rgba(0,0,0,0.3)",
          zIndex: 30,
          textAlign: "center"
        }}>
          <h2>Are you ready to start test 2?</h2>
          <button onClick={startGame} style={{ fontSize: 18, padding: "10px 20px", marginTop: 10 }}>
            Start Game
          </button>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 100px)",
        gridTemplateRows: "repeat(6, 100px)",
        position: "relative"
      }}>
        {renderGrid()}
        {renderPath()}

        <div style={{
          position: "absolute",
          top: truePath[0].row * 101.5 + 1,
          left: truePath[0].col * 100 - 22,
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}>
          <img src="/images/startleft.png" alt="Start" style={{ width: 40, height: 40 }} />
        </div>

        <div style={{
          position: "absolute",
          top: truePath[truePath.length - 1].row * 101.5,
          left: truePath[truePath.length - 1].col * 100,
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}>
          <img src="/images/end.png" alt="End" style={{ width: 40, height: 40 }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 15 }}>
        <button onClick={() => handleMove("up")}>⬆️</button>
        <button onClick={() => handleMove("left")}>⬅️</button>
        <button onClick={() => handleMove("down")}>⬇️</button>
        <button onClick={() => handleMove("right")}>➡️</button>
        <button onClick={handleUndo}>Undo (Backspace)</button>
      </div>
    </div>
  );
}

export default Set1Test2;