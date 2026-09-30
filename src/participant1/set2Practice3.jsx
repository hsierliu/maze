import React, { useState, useEffect } from "react";
import "../App.css";

const items = [
  "cup", "tap", "coop", "tap",
  "tape", "coop", "tape", "coop",
  "cup", "tap", "cup", "tap",
  "tape", "coop", "tape", "cup"
];

const createBoard = () => {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => {
      const word = items[row * 4 + col];
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
  { row: 3, col: 1 },
  { row: 3, col: 2 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
  { row: 2, col: 4 } // allowed even though it's outside grid
];

function PracticeApp3({ onComplete }) {
  const [board] = useState(createBoard());
  const [pathIndex, setPathIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameDone, setGameDone] = useState(false);

  const CELL_SIZE = 120;
  const GRID_OFFSET = CELL_SIZE / 2;
  const current = truePath[pathIndex];

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
      document.title = "✅ Practice 3";
      if (onComplete) onComplete(); // ✅ mark tab complete
    }
  }, [gameDone]);

  const startGame = () => {
    setGameStarted(true);
    setGameDone(false);
    setPathIndex(0);
    setAttempts([]);
    document.title = "Practice 3";
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
    const success = expectedNext && next.row === expectedNext.row && next.col === expectedNext.col;

    setAttempts((prev) => [...prev, { from: current, to: next, success }]);

    if (success) {
      setPathIndex(pathIndex + 1);
      if (pathIndex + 1 === truePath.length - 1) {
        setGameDone(true);
      }
    }
  };

  const renderGrid = () => {
    const labeledCells = [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 }
    ];

    return board.flatMap((row, r) =>
      row.map((cell, c) => {
        const showLabel = labeledCells.some(pos => pos.row === r && pos.col === c);
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
              fontSize: 16,
              backgroundColor: "white"
            }}
          >
            <img
              src={cell.imageUrl}
              alt={cell.word}
              style={{ width: 60, height: 60, marginBottom: showLabel ? 4 : 0 }}
            />
            {showLabel && <div style={{ fontSize: 14 }}>{cell.word}</div>}
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
      {/* Gray overlay */}
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
          <h2>Are you ready to start practice 3?</h2>
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

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(4, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(4, ${CELL_SIZE}px)`,
        width: CELL_SIZE * 4,
        height: CELL_SIZE * 4,
        position: "relative",
        zIndex: 1,
        marginTop: 30,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        {renderGrid()}
        {renderOverlay()}

        {/* Start arrow */}
        <div style={{
          position: "absolute",
          top: 1 * CELL_SIZE + CELL_SIZE / 2 - GRID_OFFSET + 3,
          left: 0 * CELL_SIZE + 20 - GRID_OFFSET + 15,
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}>
          <img src="/images/startleft.png" alt="Start" style={{ width: 40, height: 40 }} />
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

export default PracticeApp3;