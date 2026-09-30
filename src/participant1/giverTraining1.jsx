import React, { useState, useEffect } from 'react';
import '../App.css';

const icons = [
  { word: 'cup', image: '/images/cup.png' },
  { word: 'tap', image: '/images/tap.png' },
  { word: 'tape', image: '/images/tape.png' },
  { word: 'coop', image: '/images/coop.png' },
];

const CELL_SIZE = 120;

function giverTraining1() {
  const [page, setPage] = useState(1);
  const [inputText, setInputText] = useState('');
  const [paths3x3, setPaths3x3] = useState([]);
  const [pathDeleted, setPathDeleted] = useState(false); // NEW state

  // 2×2 grid
  const grid = [
    [icons[0], icons[1]],
    [icons[2], icons[3]],
  ];

  // 3×3 grid
  const grid3x3 = [
    [icons[3], icons[2], icons[0]],
    [icons[1], icons[0], icons[2]],
    [icons[3], icons[1], icons[3]],
  ];

  // validation function
  const isValidAnswer = (answer, expectedIcons) => {
    const normalized = answer.trim().toLowerCase();
    const cleanAnswer = normalized.replace(/[.,;!?]$/, '');
    
    // handle new 4-icon pattern
    if (expectedIcons.length === 4) {
      const [icon1, icon2, icon3, icon4] = expectedIcons;
      const pattern = new RegExp(
        `^we went between the (${icon1} and (the )?${icon2}|${icon2} and (the )?${icon1}),? and now(,)? let's go between the (${icon3} and (the )?${icon4}|${icon4} and (the )?${icon3})$`
      );
      return pattern.test(cleanAnswer);
    }

    // handle old 2-icon pattern
    const [icon1, icon2] = expectedIcons;
    const pattern = new RegExp(
      `^(let's go )?between the (${icon1} and (the )?${icon2}|${icon2} and (the )?${icon1})$`
    );
    
    return pattern.test(cleanAnswer);
  };

  const linePositions2x2 = [
    { top: 120, left: 180, width: 120, height: 6 }, // first
    { top: 120, left: 60, width: 120, height: 6 }, // second
  ];

  const linePositions3x3 = [
    { top: 60, left: 120, width: 6, height: 120 },   // path 1
    { top: 120, left: 180, width: 120, height: 6 },  // path 2
    { top: 180, left: 120, width: 6, height: 120 }, // path 3
    { top: 240, left: 180, width: 120, height: 6 }, // path 4
  ];

  useEffect(() => {
    // update paths3x3 based on page
    switch (page) {
      case 7:
        setPaths3x3([1]);
        break;
      case 8:
        setPaths3x3([1, 2]);
        break;
      case 9:
        setPaths3x3([1, 2]);
        setPathDeleted(false); // reset deletion state
        break;
      case 10:
        setPaths3x3([1, 3]);
        break;
      case 11:
        setPaths3x3([1, 3, 4]);
        break;
      default:
        setPaths3x3([]);
    }
    setInputText('');
  }, [page]);

  const handleNext = () => {
    if (page < 12) setPage(page + 1);
  };

  const handleBack = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleDeletePath = () => {
    if (page === 9 && paths3x3.includes(2)) {
      setPaths3x3(paths3x3.filter((p) => p !== 2));
      setPathDeleted(true); // mark as deleted
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeletePath();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paths3x3]);

  const renderGrid = ({ gridData, size = 2, showStartEnd = false, highlightStep = 0, startImage = '/images/startright.png' }) => {
    const lines = size === 2
      ? linePositions2x2.slice(0, highlightStep)
      : paths3x3.map((p) => linePositions3x3[p - 1]);

    const startPos = { top: size === 2 ? 125 : -5, left: size === 2 ? 260 : 120 };
    const endPos = { top: size === 2 ? 100 : 335, left: size === 2 ? 0 : 240 };

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
            <div style={{ position: 'absolute', top: startPos.top, left: startPos.left, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <img src={startImage} alt="Start" style={{ width: 40, height: 40 }} />
            </div>
            <div style={{ position: 'absolute', top: endPos.top, left: endPos.left, transform: 'translate(-50%, 0)', zIndex: 10 }}>
              <img src="/images/end.png" alt="Goal" style={{ width: 40, height: 40 }} />
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
              backgroundColor: 'black',
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
                Next, you will see a sample maze, and you will practice telling your partner how to move through the maze using the icons as landmarks.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                In this task, you will see mazes of different sizes. The one below is an example of a
                2 by 2 maze. Notice how each cell has an icon.
              </p>
              {renderGrid({ gridData: grid, size: 2 })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                To find the shortest valid path from the arrow to the star, you must work with your 
                partner by clearly describing the icons and connections in your respective mazes. 
                Since your partner can see which specific moves are invalid, you need to rely on their 
                guidance to eliminate dead ends and incorrect routes. Therefore, for this task:
                <br /><br />
                (1) you will describe the next step in the path you want to take using the icon names,
                <br />
                (2) your partner will check whether the step is valid or invalid, and
                <br />
                (3) you will repeat 1 and 2 until both of you see the completed maze.
              </p>
              {renderGrid({ gridData: grid, showStartEnd: true, size: 2 })}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Look at the highlighted path (in black). <br />
                To inform your partner this step is the one you want to take, you should say:
                <br /><br />
                <b>“Let's go between the tap and the coop"</b>
              </p>
              {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 1, size: 2 })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Now, look at the next highlighted section (in black).
                <br />
                What should you say to tell your partner to check this path? Type in the box below:
              </p>
              {renderGrid({ gridData: grid, showStartEnd: true, highlightStep: 2, size: 2 })}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Let's go ..."
                className="typing-input"
                style={{ marginTop: 20, width: '60%' }}
              />
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
                Look at the highlighted step (in black). What should you say to tell your partner to check this path? Type in the box below:
              </p>
              {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Let's go ..."
                className="typing-input"
                style={{ marginTop: 20, width: '60%' }}
              /> 
            </div>
          </div>
        );
      case 8:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Now, rather than just saying the present path, you should mention the previous path to make sure you and your partner are on the same page. You should say:
              <br /><br />
                <b>“We went between the coop and the tape, and now, let's go between the tape and the cup."</b>
                </p>
              {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
            </div>
          </div>
        );
        case 9:
          return (
            <div className="page">
              <div className="container">
                {!pathDeleted ? (
                  <>
                    <p className="instruction">
                      Your partner says: "We went between the tape and the cup, and it's red." Therefore, the step is invalid. 
                      Press the backspace button on your keyboard to remove the step.
                    </p>
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
                  </>
                ) : (
                  <>
                    <p className="instruction">
                      Propose a new step to take. Remember that you are trying to find the shortest path. 
                      Ask your partner to check this new step. Type in the box below:
                    </p>
                    {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="We went between ... and now, let's go between ..."
                      className="typing-input"
                      style={{ marginTop: 20, width: '60%' }}
                    />
                  </>
                )}
              </div>
            </div>
          );  
      case 10:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Your partner says "it's green." Therefore, this step is valid. 
                <br /><br />
                Propose another step to take. Remember that steps on the outer boundary are not allowed. Type in the box below:
              </p>
              {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="We went between ... and now, let's go between ..."
                className="typing-input"
                style={{ marginTop: 20, width: '60%' }}
              />
            </div>
          </div>
        );
      case 11:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
              Your partner says "it's green." Therefore, this step is valid. 
              <br></br>
              Propose a new step to take:
              </p>
              {renderGrid({ gridData: grid3x3, showStartEnd: true, size: 3, startImage: '/images/startup.png' })}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="We went between ..."
                className="typing-input"
                style={{ marginTop: 20, width: '60%' }}
              />
            </div>
          </div>
        );
      case 12:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">🎉 You have completed the training! Please continue on to Practice 1 (under Set 1).</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canGoNext =
    page === 1 || page === 2 || page === 3 || page === 4 ||
    (page === 5 && isValidAnswer(inputText, ['cup', 'tape'])) ||
    page === 6 || 
    (page === 7 && isValidAnswer(inputText, ['coop', 'tape'])) ||
    page === 8 || 
    (page === 9 && pathDeleted && isValidAnswer(inputText, ['coop', 'tape', 'tap', 'cup'])) || // must delete first
    (page === 10 && isValidAnswer(inputText, ['tap', 'cup', 'cup', 'tap'])) ||
    (page === 11 && isValidAnswer(inputText, ['cup', 'tap', 'tap', 'coop'])) ||
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

export default giverTraining1;
