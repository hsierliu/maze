import { useEffect, useState } from 'react';

// Preserve the original role-specific overtime boundary (giver: 0; drawer: 1).
export function useMazeTimer(running, overtimeBoundary) {
  const [timeLeft, setTimeLeft] = useState(360);
  const [stopwatchMode, setStopwatchMode] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTimeLeft(previous => {
        if (stopwatchMode) return previous + 1;
        if (previous > overtimeBoundary) return previous - 1;
        setStopwatchMode(true);
        return 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, stopwatchMode, overtimeBoundary]);

  useEffect(() => {
    if (!stopwatchMode) return;
    const timer = setInterval(() => setBlink(previous => !previous), 500);
    return () => clearInterval(timer);
  }, [stopwatchMode]);

  const resetTimer = () => {
    setTimeLeft(360);
    setStopwatchMode(false);
  };
  return { timeLeft, stopwatchMode, blink, resetTimer };
}


export function useMazeKeyboard(onMove, onUndo, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = event => {
      const direction = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[event.key];
      if (direction) onMove(direction);
      if (event.key === 'Backspace') onUndo?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onMove, onUndo, enabled]);
}

// Paths run along grid intersections: an N-cell board has coordinates 0 through N.
export function isOutOfBounds(row, col, gridSize) {
  return row < 0 || col < 0 || row > gridSize || col > gridSize;
}

export function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}


const centered = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
const dialog = { ...centered, backgroundColor: 'white', borderRadius: 10, zIndex: 30, textAlign: 'center' };
const cellStyle = { border: '1px solid #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' };
const controls = [['up', '⬆️'], ['left', '⬅️'], ['down', '⬇️'], ['right', '➡️']];
const directions = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const samePoint = (a, b) => a?.row === b?.row && a?.col === b?.col;

export default function MazeScreen({ config, onComplete }) {
  const { items, truePath, gridSize, cellSize, labeledCells = [], markers = [], prompt, timed, mode, id } = config;
  const giver = mode === 'giver';
  const timedGiver = timed && giver;
  const [path, setPath] = useState([truePath[0]]);
  const [attempts, setAttempts] = useState([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const running = started && !done;
  const { timeLeft, stopwatchMode, blink, resetTimer } = useMazeTimer(timed && running, giver ? 0 : 1);

  useEffect(() => {
    if (!done) return;
    if (!giver) document.title = timed ? `✅ Test ${id.slice(-1)}` : '✅ Practice 1';
    onComplete?.();
  }, [done, giver, timed, id, onComplete]);

  const startGame = () => {
    setStarted(true);
    setDone(false);
    setPath([truePath[0]]);
    setAttempts([]);
    resetTimer();
    if (!timed && !giver) document.title = 'Practice 1';
  };
  const move = direction => {
    if (!running) return;
    const current = path[path.length - 1];
    const [row, col] = directions[direction];
    const next = { row: current.row + row, col: current.col + col };
    if (giver && isOutOfBounds(next.row, next.col, gridSize)) return;
    const success = samePoint(next, truePath[path.length]);
    if (!giver) setAttempts(previous => [...previous, { from: current, to: next, success }]);
    if (giver || success) {
      const nextPath = [...path, next];
      setPath(nextPath);
      setDone(nextPath.length === truePath.length && nextPath.every((point, i) => samePoint(point, truePath[i])));
    }
  };
  const undo = () => {
    if (path.length > 1 && started && !(timed && done)) {
      setPath(path.slice(0, -1));
      setDone(false);
    }
  };
  useMazeKeyboard(move, giver ? undo : undefined, giver && !timed ? started : running);

  const segments = giver ? path.slice(0, -1).map((from, i) => ({ from, to: path[i + 1] })) : attempts;
  const gridStyle = {
    display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`, position: 'relative',
    ...(!timedGiver && { width: cellSize * gridSize, height: cellSize * gridSize, zIndex: 1, margin: '30px auto 0' }),
  };

  return (
    <div style={timedGiver
      ? { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }
      : { position: 'relative', padding: '10px 20px', height: '100%' }}>
      {(!started || done) && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: timedGiver ? 25 : 20 }} />}
      {(!started || done) && (
        <div style={{ ...dialog, padding: done ? '20px 40px' : '30px 40px', boxShadow: `0 0 ${done ? 10 : timedGiver ? 30 : 15}px rgba(0,0,0,0.3)` }}>
          <h2>{done ? '🎉 Maze complete!' : prompt}</h2>
          {!done && <button onClick={startGame} style={{ fontSize: 18, padding: '10px 20px', marginTop: 10 }}>Start Game</button>}
        </div>
      )}
      {timed && running && (
        <div className="timer-box" style={{ backgroundColor: stopwatchMode
          ? `rgba(255, 100, 100, ${blink ? 0.3 : 0.6})`
          : timeLeft <= 120 ? 'rgba(255, 255, 100, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>
          {stopwatchMode ? '-' : ''}{formatTime(timeLeft)}
        </div>
      )}
      <div style={gridStyle}>
        {items.map((word, i) => {
          const labeled = labeledCells.some(pos => pos.row === Math.floor(i / gridSize) && pos.col === i % gridSize);
          return (
            <div key={i} style={{ ...cellStyle, width: cellSize, height: cellSize, fontSize: timedGiver ? 14 : 16 }}>
              <img src={`/images/${word}.png`} alt={word} style={{ width: timed ? 50 : 60, height: timed ? 50 : 60, ...(!timed && { marginBottom: labeled ? 4 : 0 }) }} />
              {labeled && (timedGiver ? word : <div style={timed ? { marginTop: 4 } : { fontSize: 14 }}>{word}</div>)}
            </div>
          );
        })}
        {segments.map(({ from, to, success }, i) => {
          const vertical = from.col === to.col;
          return <div key={`path-${i}`} style={{
            position: 'absolute',
            top: timedGiver ? (from.row + to.row) / 2 * 101.5 - 3 : (from.row + to.row) / 2 * cellSize,
            left: (from.col + to.col) / 2 * cellSize,
            width: vertical ? 6 : timedGiver ? 101 : cellSize,
            height: vertical ? (timedGiver ? 101.5 : cellSize) : 6,
            backgroundColor: giver ? 'black' : success ? 'green' : 'red',
            transform: 'translate(-50%, -50%)', zIndex: 5,
          }} />;
        })}
        {markers.map((marker, i) => (
          <div key={`marker-${i}`} style={{ position: 'absolute', top: marker.top, left: marker.left, transform: marker.transform || 'translate(-50%, -50%)', zIndex: 10 }}>
            <img src={marker.image} alt={marker.role || ''} style={{ width: 40, height: 40 }} />
          </div>
        ))}
      </div>
      <div className="maze-controls">
        {controls.map(([direction, label]) => <button key={direction} onClick={() => move(direction)}>{label}</button>)}
        {giver && <button onClick={undo}>Undo (Backspace)</button>}
      </div>
    </div>
  );
}
