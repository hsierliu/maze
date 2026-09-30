import React, { useState, useEffect } from 'react';
import '../App.css';

const icons = [
  { word: 'cup', image: '/images/cup.png' },
  { word: 'tap', image: '/images/tap.png' },
  { word: 'tape', image: '/images/tape.png' },
  { word: 'coop', image: '/images/coop.png' },
];

const CELL_SIZE = 120;

function drawerTraining2() {
  const [page, setPage] = useState(1);
  const [inputText, setInputText] = useState('');
  const [showSecondPath, setShowSecondPath] = useState(false);
  const [showInvalidPath, setShowInvalidPath] = useState(false);
  const [showPath7, setShowPath7] = useState(false);
  const [showPath8, setShowPath8] = useState(false);
  const [showPath9, setShowPath9] = useState(false);
  const [showPath10, setShowPath10] = useState(false);
  const [showPath11, setShowPath11] = useState(false);

  // 2×2 grid
  const grid = [
    [icons[0], icons[1]],
    [icons[2], icons[3]],
  ];

  // 3×3 grid
  const grid3x3 = [
    [icons[3], icons[2], icons[3]],
    [icons[1], icons[0], icons[2]],
    [icons[0], icons[1], icons[3]],
  ];

  // Validation function 
  const isValidAnswer = (answer, expectedIcons, includePreviousPath = false, previousIcons = []) => {
    const normalized = answer.trim().toLowerCase();
    const cleanAnswer = normalized.replace(/[.,;!?]$/, '');
    
    if (includePreviousPath && previousIcons.length === 2) {
      const [prevIcon1, prevIcon2] = previousIcons;
      const [currIcon1, currIcon2] = expectedIcons;
      
      const prevPatterns = [
        `${prevIcon1} and (?:the )?${prevIcon2}`,
        `${prevIcon2} and (?:the )?${prevIcon1}`
      ];
      
      const currPatterns = [
        `${currIcon1} and (?:the )?${currIcon2}`,
        `${currIcon2} and (?:the )?${currIcon1}`
      ];
      
      const pattern = new RegExp(
        `^(?:we went )?between the (?:${prevPatterns.join('|')})(?:,? and now,? we'?re going between the (?:${currPatterns.join('|')})(?:,? and (?:it'?s|it is|its) green))$`,
        'i'
      );
      return pattern.test(cleanAnswer);
    } else {
      const [icon1, icon2] = expectedIcons;
      const pattern = new RegExp(
        `^(?:we went )?between the (?:${icon1} and (?:the )?${icon2}|${icon2} and (?:the )?${icon1})(?:,? and (?:it'?s|it is|its) green)$`,
        'i'
      );
      return pattern.test(cleanAnswer);
    }
  };

  // Specific validation functions using the unified function
  const isValidAnswerCase5 = (answer) => isValidAnswer(answer, ['cup', 'tape']);
  const isValidAnswerCase7 = (answer) => isValidAnswer(answer, ['coop', 'tape']);
  const isValidAnswerCase9 = (answer) => isValidAnswer(answer, ['tape', 'cup'], true, ['coop', 'tape']);
  const isValidAnswerCase10 = (answer) => isValidAnswer(answer, ['cup', 'tape'], true, ['tape', 'cup']);
  const isValidAnswerCase11 = (answer) => isValidAnswer(answer, ['tap', 'coop'], true, ['cup', 'tape']);

  const linePositions2x2 = [
    { top: 120, left: 180, width: 120, height: 6 }, // tap and coop (horizontal) - GREEN
    { top: 60, left: 120, width: 6, height: 120 }, // cup and tap (vertical) - RED 
    { top: 120, left: 60, width: 120, height: 6 }, // cup and tape (horizontal) - GREEN
  ];

  const linePositions3x3 = [
    { top: 60, left: 120, width: 6, height: 120 },   // path 1 - coop and tape (vertical) - GREEN
    { top: 180, left: 120, width: 6, height: 120 },  // path 2 - tap and cup (vertical) - RED
    { top: 120, left: 180, width: 120, height: 6 }, // path 3 - tape and cup (horizontal) - GREEN
    { top: 180, left: 240, width: 6, height: 120 }, // path 4 - cup and tape (vertical) - GREEN
    { top: 300, left: 240, width: 6, height: 120 }, // path 5 - tap and coop (vertical) - GREEN
  ];

  useEffect(() => {
    setShowSecondPath(false);
    setShowInvalidPath(false);
    setShowPath7(false);
    setShowPath8(false);
    setShowPath9(false);
    setShowPath10(false);
    setShowPath11(false);
    setInputText('');
  }, [page]);

  const handleMove = (direction) => {
    if (page === 3 && (direction === 'left' || direction === 'right')) {
      setShowSecondPath(true);
    } else if (page === 4 && direction === 'up') {
      setShowInvalidPath(true);
    } else if (page === 5 && (direction === 'left' || direction === 'right')) {
      setShowSecondPath(true);
    } else if (page === 7 && direction === 'down') {
      setShowPath7(true);
    } else if (page === 8 && direction === 'down') {
      setShowPath8(true);
    } else if (page === 9 && direction === 'right') {
      setShowPath9(true);
    } else if (page === 10 && direction === 'down') {
      setShowPath10(true);
    } else if (page === 11 && direction === 'down') {
      setShowPath11(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace") return; // Remove backspace functionality
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  const handleNext = () => {
    if (page < 12) setPage(page + 1);
  };

  const handleBack = () => {
    if (page > 1) setPage(page - 1);
  };

  const NavigationButtons = () => {
    if (page < 7 || page > 11) return null;
    
    return (
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
    );
  };

  const renderGrid = ({ gridData, size = 2, showStartEnd = false, highlightStep = 0, showInvalid = false, cumulativePaths = [], startImage = '/images/startright.png' }) => {
    let lines = [];
    
    if (size === 2) {
      if (highlightStep === 1) {
        lines = [linePositions2x2[0]];
      } else if (highlightStep === 3) {
        lines = [linePositions2x2[0], linePositions2x2[2]];
      } else {
        lines = linePositions2x2.slice(0, highlightStep);
      }
      
      if (showInvalid) {
        lines.push({...linePositions2x2[1], backgroundColor: 'red'});
      }
    } else {
      // For 3x3, show cumulative paths
      lines = cumulativePaths.map(pathIndex => {
        const path = linePositions3x3[pathIndex - 1];
        return {
          ...path,
          backgroundColor: pathIndex === 2 ? 'red' : 'green' 
        };
      });
    }
  
    const startPos = { top: size === 2 ? 125 : -5, left: size === 2 ? 260 : 120 };
  
    return (
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${size}, ${CELL_SIZE}px)`,
          width: CELL_SIZE * size,
          height: CELL_SIZE * size,
          margin: '0 auto',
          marginTop: 20,
          border: '2px solid #ccc',
        }}
      >
        {gridData.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`cell-${r}-${c}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                border: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                position: 'relative',
              }}
            >
              <img src={cell.image} alt={cell.word} style={{ width: 50, height: 50, marginBottom: 5 }} />
              <div style={{ fontSize: 14 }}>{cell.word}</div>
            </div>
          ))
        )}
  
        {showStartEnd && (
          <>
            <div style={{ position: 'absolute', top: startPos.top, left: startPos.left, transform: 'translate(-50%, -50%)' }}>
              <img src={startImage} alt="Start" style={{ width: 40, height: 40 }} />
            </div>
          </>
        )}
  
        {lines.map((line, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: line.top,
              left: line.left,
              width: line.width,
              height: line.height,
              backgroundColor: line.backgroundColor || 'green',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          />
        ))}
      </div>
    );
  };

  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Let's switch roles! Instead of telling your partner how to move through the maze,
                you will now be checking to see if the path is valid or not. Let's practice.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Unlike before, you will no longer see the end star point, so make sure to listen carefully to what your partner
                says. Just like before, you and your partner should try to find the shortest valid path. Therefore, for this task:
                <br /><br />
                (1) your partner will describe a step they want to take using the icon names,
                <br />
                (2) you will check whether the step is valid or invalid, and
                <br />
                (3) both of you will repeat 1 and 2 until both of you see the completed maze.
              </p>
              {renderGrid({ gridData: grid, showStartEnd: true, size: 2 })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showSecondPath ? (
                  <>
                    Your partner says: 
                    <br />
                    <b>"Let's go between the tap and the coop"</b>
                    <br /><br />
                    It's your turn! Press the left arrow key to check the step.
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 0, size: 2 })}
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. Now, inform your partner by saying:
                    <br />
                    <b>"We went between the tap and the coop, and it's green"</b>
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 1, size: 2 })}
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showInvalidPath ? (
                  <>
                    Let's take another step. Your partner says: 
                    <br />
                    <b>"Let's go between the cup and the tap"</b>
                    <br /><br />
                    It's your turn! Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 1, size: 2 })}
                  </>
                ) : (
                  <>
                    The path is red, so it's invalid. Now, inform your partner by saying:
                    <br /> <br />
                    <b>"We went between the cup and the tap, and it's red"</b>
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 1, showInvalid: true, size: 2 })}
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showSecondPath ? (
                  <>
                    Let's try another step instead. Your partner says: 
                    <br />
                    <b>"Let's go between the cup and the tape"</b>
                    <br /><br />
                    It's your turn! Press one of the arrow keys to check the step.
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 1, showInvalid: true, size: 2 })}
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. 
                    <br />
                    What should you say to inform your partner? Type in the box.
                    <br />
                    {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 3, showInvalid: true, size: 2 })}
                    <br /> 
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went between ..., and it's green"
                      className="typing-input"
                      style={{ marginTop: 20, width: '60%' }}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                You've completed the first maze! Now, let's practice with a 3 by 3 maze.
              </p>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showPath7 ? (
                  <>
                    Your partner says: 
                    <br />
                    <b>"Let's go between the coop and the tape"</b>
                    <br /><br />
                    Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
                    <NavigationButtons />
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. 
                    <br /> <br />
                    What should you say to inform your partner? Type in the box.
                    <br />
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1], startImage: '/images/startup.png' })}
                    <br />
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went . . ."
                      className="typing-input"
                      style={{ marginTop: 20, width: '60%' }}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showPath8 ? (
                  <>
                    Let's continue. Your partner says: 
                    <br />
                    <b>"Let's go between the tap and the cup"</b>
                    <br /><br />
                    Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1], startImage: '/images/startup.png' })}
                    <NavigationButtons />
                  </>
                ) : (
                  <>
                    The path is red, so it's invalid. 
                    <br />
                    Now, rather than just saying the present path, you should mention the previous path to make sure you and your partner are on the same page. You should say: 
                    <br /><br />
                    <b>"We went between the coop and the tape, and now, we're going between the tap and the cup, and it's red."</b>
                    <br />
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2], startImage: '/images/startup.png' })}
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showPath9 ? (
                  <>
                    Your partner says: 
                    <br />
                    <b>"Let's go between the tape and the cup"</b>
                    <br /><br />
                    Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2], startImage: '/images/startup.png' })}
                    <NavigationButtons />
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. 
                    <br /> 
                    What should you say to inform your partner? Type in the box.
                    <br />
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2, 3], startImage: '/images/startup.png' })}
                    <br />
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went between ..., and now, we're going between ..., and it's green"
                      className="typing-input"
                      style={{ marginTop: 20, width: '100%' }}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showPath10 ? (
                  <>
                    Your partner says: 
                    <br />
                    <b>"Let's go between the cup and the tape"</b>
                    <br /><br />
                    Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2, 3], startImage: '/images/startup.png' })}
                    <NavigationButtons />
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. 
                    <br />
                    What should you say to inform your partner? Type in the box.
                    <br />
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2, 3, 4], startImage: '/images/startup.png' })}
                    <br />
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went . . ."
                      className="typing-input"
                      style={{ marginTop: 20, width: '60%' }}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {!showPath11 ? (
                  <>
                    Your partner says: 
                    <br />
                    <b>"Let's go between the tap and the coop"</b>
                    <br /><br />
                    Press one of the arrow keys to check this step.
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2, 3, 4], startImage: '/images/startup.png' })}
                    <NavigationButtons />
                  </>
                ) : (
                  <>
                    The path is green, so it's valid. 
                    <br />
                    What should you say to inform your partner? Type in the box.
                    <br />
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, cumulativePaths: [1, 2, 3, 4, 5], startImage: '/images/startup.png' })}
                    <br />
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went . . ."
                      className="typing-input"
                      style={{ marginTop: 20, width: '60%' }}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 12:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">🎉 You have completed the training! Please continue on to Practice 1 (under Set 2).</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canGoNext =
    page === 1 || page === 2 || 
    (page === 3 && showSecondPath) ||
    (page === 4 && showInvalidPath) ||
    (page === 5 && showSecondPath && isValidAnswerCase5(inputText)) ||
    page === 6 ||
    (page === 7 && showPath7 && isValidAnswerCase7(inputText)) ||
    (page === 8 && showPath8) || // No need for input validation on case 8
    (page === 9 && showPath9 && isValidAnswerCase9(inputText)) ||
    (page === 10 && showPath10 && isValidAnswerCase10(inputText)) ||
    (page === 11 && showPath11 && isValidAnswerCase11(inputText)) ||
    page === 12;

  return (
    <div className="App">
      {renderPage()}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', margin: '20px auto' }}>
        {page > 1 && <button className="back-button" onClick={handleBack} style={{ backgroundColor: '#e8e8e8' }}>←</button>}
        {canGoNext && page < 12 && (
          <button 
            className="back-button" 
            onClick={handleNext}
            style={{ marginLeft: page === 1 ? 'auto' : '0', backgroundColor: '#e8e8e8' }}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}

export default drawerTraining2;