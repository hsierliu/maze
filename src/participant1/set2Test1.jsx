import React, { useState, useEffect } from "react";
import "../App.css";

const items = [
  "cup", "tap", "tape", "coop", "tap", "coop",
  "coop", "tape", "tap", "tape", "cup", "tape",
  "tap", "cup", "tap", "coop", "tap", "coop",
  "coop", "tape", "coop", "cup", "cup", "tape",
  "cup", "tap", "tap", "tape", "tap", "coop",
  "tape", "coop", "cup", "coop", "cup", "tape"
];


const truePath = [
  { row: 0, col: 1 },
  { row: 1, col: 1 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 3, col: 2 },
  { row: 4, col: 2 },
  { row: 4, col: 3 },
  { row: 5, col: 3 },
  { row: 5, col: 4 },
  { row: 5, col: 5 },
  { row: 4, col: 5 },
  { row: 3, col: 5 },
  { row: 3, col: 4 },
  { row: 2, col: 4 },
  { row: 1, col: 4 },
  { row: 1, col: 5 },
  { row: 1, col: 6 }
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

function Set2Test1({ onComplete }) {
  const [board] = useState(createBoard());
  const [pathIndex, setPathIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameDone, setGameDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(360);
  const [stopwatchMode, setStopwatchMode] = useState(false);
  const [blink, setBlink] = useState(false);

  const CELL_SIZE = 100;
  const GRID_OFFSET = CELL_SIZE / 2;
  const current = truePath[pathIndex];

  useEffect(() => {
    if (!gameStarted || gameDone) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (!stopwatchMode) {
          if (prev <= 1) {
            setStopwatchMode(true);
            return 1;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameDone, stopwatchMode]);

  useEffect(() => {
    if (stopwatchMode) {
      const blinkInterval = setInterval(() => {
        setBlink(prev => !prev);
      }, 500);
      return () => clearInterval(blinkInterval);
    }
  }, [stopwatchMode]);

  useEffect(() => {
    if (!gameStarted || gameDone) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, current, pathIndex]);

  useEffect(() => {
    if (gameDone) {
      document.title = "✅ Test 1";
      if (onComplete) onComplete();
    }
  }, [gameDone]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const formatted = `${min}:${sec.toString().padStart(2, "0")}`;
    return stopwatchMode ? `-${formatted}` : formatted;
  };

  const startGame = () => {
    setGameStarted(true);
    setGameDone(false);
    setPathIndex(0);
    setAttempts([]);
    setTimeLeft(360);
    setStopwatchMode(false);
  };

  const handleMove = (dir) => {
    if (!gameStarted || gameDone) return;

    let newRow = current.row;
    let newCol = current.col;

    if (dir === "up") newRow -= 1;
    if (dir === "down") newRow += 1;
    if (dir === "left") newCol -= 1;
    if (dir === "right") newCol += 1;

    const next = { row: newRow, col: newCol };
    const expectedNext = truePath[pathIndex + 1];

    const success =
      expectedNext &&
      next.row === expectedNext.row &&
      next.col === expectedNext.col;

    setAttempts(prev => [...prev, { from: current, to: next, success }]);

    if (success) {
      setPathIndex(pathIndex + 1);
      if (pathIndex + 1 === truePath.length - 1) {
        setGameDone(true);
      }
    }
  };

  const renderGrid = () => {
    return board.flatMap((row, r) =>
      row.map((cell, c) => {
        const showText = (r < 2 && c < 2);
        return (
          <div
            key={`cell-${r}-${c}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              fontSize: 16
            }}
          >
            <img src={cell.imageUrl} alt={cell.word} style={{ width: 50, height: 50 }} />
            {showText && <div style={{ marginTop: 4 }}>{cell.word}</div>}
          </div>
        );
      })
    );
  };

  const renderOverlay = () =>
    attempts.map((a, i) => {
      const { from, to, success } = a;
      const isVertical = from.col === to.col;

      const top = ((from.row + to.row + 1) / 2) * CELL_SIZE - GRID_OFFSET;
      const left = ((from.col + to.col + 1) / 2) * CELL_SIZE - GRID_OFFSET;

      return (
        <div
          key={`path-${i}`}
          style={{
            position: "absolute",
            top,
            left,
            width: isVertical ? 6 : CELL_SIZE,
            height: isVertical ? CELL_SIZE : 6,
            backgroundColor: success ? "green" : "red",
            transform: "translate(-50%, -50%)",
            zIndex: 5
          }}
        />
      );
    });

  return (
    <div style={{ position: "relative", padding: "10px 20px", height: "100%" }}>
      {(!gameStarted || gameDone) && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 20
        }} />
      )}

      {!gameStarted && !gameDone && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "30px 40px",
          borderRadius: 10,
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
          zIndex: 30,
          textAlign: "center"
        }}>
          <h2>Are you ready to start test 1?</h2>
          <button onClick={startGame} style={{ fontSize: 18, padding: "10px 20px", marginTop: 10 }}>
            Start Game
          </button>
        </div>
      )}

      {gameDone && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
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

      {gameStarted && !gameDone && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
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

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(6, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(6, ${CELL_SIZE}px)`,
        width: CELL_SIZE * 6,
        height: CELL_SIZE * 6,
        position: "relative",
        zIndex: 1,
        margin: "30px auto 0"
      }}>
        {renderGrid()}
        {renderOverlay()}

        {/* Start Icon */}
        <div style={{
          position: "absolute",
          top: truePath[0].row * CELL_SIZE + CELL_SIZE / 2 - 70,
          left: truePath[0].col * CELL_SIZE + CELL_SIZE / 2 - 50,
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}>
          <img src="/images/startup.png" alt="Start" style={{ width: 40, height: 40 }} />
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 20,
        gap: 15
      }}>
        <button onClick={() => handleMove("up")}>⬆️</button>
        <button onClick={() => handleMove("left")}>⬅️</button>
        <button onClick={() => handleMove("down")}>⬇️</button>
        <button onClick={() => handleMove("right")}>➡️</button>
      </div>
    </div>
  );
}

export default Set2Test1;