import React, { useState, useEffect } from "react";
import "../App.css";

const items = [
  "cup", "tap", "cup", "tap",
  "tape", "coop", "tape", "coop",
  "cup", "tap", "cup", "tap",
  "tape", "coop", "tape", "coop"
];

const truePath = [
  { row: 2, col: 0 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 1, col: 2 },
  { row: 1, col: 3 },
  { row: 2, col: 3 },
  { row: 3, col: 3 },
  { row: 4, col: 3 }
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

function Set2Practice1({ onComplete }) {
  const [board] = useState(createBoard());
  const [current, setCurrent] = useState(truePath[0]);
  const [path, setPath] = useState([truePath[0]]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const CELL_SIZE = 120;
  const GRID_OFFSET = CELL_SIZE / 2;

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      if (e.key === "Backspace") handleUndo();
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, current, path]);

  const startGame = () => {
    setGameStarted(true);
    setShowSuccess(false);
    setCurrent(truePath[0]);
    setPath([truePath[0]]);
  };

  const handleMove = (dir) => {
    if (showSuccess || !gameStarted) return;

    let newRow = current.row;
    let newCol = current.col;

    if (dir === "up") newRow -= 1;
    if (dir === "down") newRow += 1;
    if (dir === "left") newCol -= 1;
    if (dir === "right") newCol += 1;

    if (newRow < 0 || newRow > 4 || newCol < 0 || newCol >= 4) return;

    const next = { row: newRow, col: newCol };
    const newPath = [...path, next];

    setCurrent(next);
    setPath(newPath);

    if (
      newPath.length === truePath.length &&
      JSON.stringify(newPath) === JSON.stringify(truePath)
    ) {
      setShowSuccess(true);
      if (onComplete) onComplete(); // ✅ Notify completion
    }
  };

  const handleUndo = () => {
    if (path.length > 1 && gameStarted) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      setCurrent(newPath[newPath.length - 1]);
      setShowSuccess(false);
    }
  };

  const renderGrid = () => {
    const labeledCells = [
      { row: 2, col: 2 },
      { row: 3, col: 2 },
      { row: 2, col: 3 },
      { row: 3, col: 3 }
    ];

    const isLabeled = (r, c) =>
      labeledCells.some(pos => pos.row === r && pos.col === c);

    return board.flatMap((row, r) =>
      row.map((cell, c) => (
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
            style={{ width: 60, height: 60, marginBottom: isLabeled(r, c) ? 4 : 0 }}
          />
          {isLabeled(r, c) && (
            <div style={{ fontSize: 14 }}>{cell.word}</div>
          )}
        </div>
      ))
    );
  };

  const renderPath = () =>
    path.slice(0, -1).map((point, i) => {
      const next = path[i + 1];
      const isVertical = point.col === next.col;

      const top = ((point.row + next.row + 1) / 2) * CELL_SIZE - GRID_OFFSET;
      const left = ((point.col + next.col + 1) / 2) * CELL_SIZE - GRID_OFFSET;

      return (
        <div
          key={`path-${i}`}
          style={{
            position: "absolute",
            top,
            left,
            width: isVertical ? 6 : CELL_SIZE,
            height: isVertical ? CELL_SIZE : 6,
            backgroundColor: "black",
            transform: "translate(-50%, -50%)",
            zIndex: 5
          }}
        />
      );
    });

  return (
    <div style={{ position: "relative", padding: "10px 20px", height: "100%" }}>
      {(!gameStarted || showSuccess) && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 20
        }} />
      )}

      {!gameStarted && !showSuccess && (
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
          <h2>Are you ready to start practice 1?</h2>
          <button onClick={startGame} style={{ fontSize: 18, padding: "10px 20px", marginTop: 10 }}>
            Start Game
          </button>
        </div>
      )}

      {showSuccess && (
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
        {renderPath()}

        {/* Start arrow */}
        <div style={{
          position: "absolute",
          top: 3 * CELL_SIZE + CELL_SIZE / 2 - GRID_OFFSET - 118,
          left: 4 * CELL_SIZE + 20 - GRID_OFFSET - 460,
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}>
          <img src="/images/startleft.png" alt="Start" style={{ width: 40, height: 40 }} />
        </div>

        {/* End star */}
        <div style={{
          position: "absolute",
          top: 460,
          left: 2 * CELL_SIZE + CELL_SIZE / 2 +60,
          transform: "translate(-50%, 0)",
          zIndex: 10
        }}>
          <img src="/images/end.png" alt="Goal" style={{ width: 40, height: 40 }} />
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
        <button onClick={handleUndo}>Undo (Backspace)</button>
      </div>
    </div>
  );
}

export default Set2Practice1;