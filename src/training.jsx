import { useState, useEffect } from 'react';
import { useMazeKeyboard } from './maze';

const icons = [
  { word: 'cup', image: '/images/cup.png' },
  { word: 'tap', image: '/images/tap.png' },
  { word: 'tape', image: '/images/tape.png' },
  { word: 'coop', image: '/images/coop.png' },
];

// Ignore punctuation while preserving the required words and their order.
function normalizeAnswer(answer) {
  return answer.toLowerCase().replace(/['’‘]/g, '').replace(/\p{P}/gu, ' ').replace(/\s+/g, ' ').trim();
}

const iconPair = ([first, second]) => `(?:${first} and (?:the )?${second}|${second} and (?:the )?${first})`;

function validateGiverAnswer(answer, expectedIcons) {
  const previous = iconPair(expectedIcons);
  const pattern = expectedIcons.length === 4
    ? `we went between the ${previous} and now lets go between the ${iconPair(expectedIcons.slice(2))}`
    : `(?:lets go )?between the ${previous}`;
  return new RegExp(`^${pattern}$`).test(normalizeAnswer(answer));
}

function validateDrawerAnswer(answer, expectedIcons, includePreviousPath = false, previousIcons = []) {
  const current = iconPair(expectedIcons);
  const path = includePreviousPath && previousIcons.length === 2
    ? `${iconPair(previousIcons)} and now were going between the ${current}`
    : current;
  return new RegExp(`^(?:we went )?between the ${path} and (?:its|it is) green$`).test(normalizeAnswer(answer));
}

const quizData = icons.map(item => ({
  correct: item.word,
  image: item.image,
  choices: shuffle(['cup', 'tap', 'tape', 'coop']),
}));

const typingData = shuffle([...icons]); // randomized order for typing phase

function shuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function IconTraining({ participant, onComplete }) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (page === 10) onComplete?.();
  }, [page, onComplete]);
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [typingInputs, setTypingInputs] = useState(Array(icons.length).fill(""));

  const handleNext = () => {
    if (page === 2) {
      if (wordIndex < icons.length - 1) {
        setWordIndex(wordIndex + 1);
      } else {
        setPage(3);
      }
    } else if (page === 3) {
      setPage(4);
    } else if (page === 4) {
      if (quizIndex < quizData.length - 1) {
        setQuizIndex(quizIndex + 1);
        setSelected(null);
        setIsCorrect(false);
      } else {
        setPage(6); // Start typing section
      }
    } else {
      setPage(page + 1);
    }
  };

  const handleChoice = (choice) => {
    setSelected(choice);
    setIsCorrect(choice === quizData[quizIndex].correct);
  };

  const handleTypingChange = (index, value) => {
    const updated = [...typingInputs];
    updated[index] = value;
    setTypingInputs(updated);
  };

  const renderTypingPage = (index) => {
    const item = typingData[index];
    const input = typingInputs[index];
    const isTypingCorrect = input.trim().toLowerCase() === item.word;

    return (
      <div className="page">
        <div className="container">
          <p className="instruction">Please type in the name of the icon.</p>
          <div className="centered">
            <div className="item">
              <img src={item.image} alt={item.word} className="icon" />
            </div>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => handleTypingChange(index, e.target.value)}
            className="typing-input"
            style={{
              borderColor: isTypingCorrect ? 'green' : '#ccc',
              backgroundColor: isTypingCorrect ? '#e6ffe6' : 'white'
            }}
          />
        </div>
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
                Please study each word and icon pair. <br />
                Click the arrow symbol once you understand how each icon represents the corresponding word.
              </p>
              <div className="grid">
                {icons.map((item, index) => (
                  <div key={index} className="item">
                    <img src={item.image} alt={item.word} className="icon" />
                    <p>{item.word}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Please study this icon and word pair. <br />
                Repeat the word aloud 5 times.
              </p>
              <div className="centered">
                <div className="item">
                  <img src={icons[wordIndex].image} alt={icons[wordIndex].word} className="icon" />
                  <p>{icons[wordIndex].word}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                Next, you will see 4 slides with an icon and 4 choices. <br />
                Please click on the word associated with the icon.
              </p>
            </div>
          </div>
        );

      case 4: {
        const current = quizData[quizIndex];
        return (
          <div className="page">
            <div className="container">
              <div className="quiz-box">
                <p className="instruction">Which word does this icon refer to?</p>
              </div>
              <div className="centered">
                <div className="item">
                  <img src={current.image} alt="quiz icon" className="icon" />
                </div>
              </div>
              <div className="quiz-box">
                <div className="choices">
                  {current.choices.map((choice, idx) => {
                    const isThisCorrect = choice === current.correct;
                    let className = 'choice';
                    if (selected === choice) {
                      className += isThisCorrect ? ' correct' : ' incorrect';
                    }
                    return (
                      <button
                        key={idx}
                        className={className}
                        onClick={() => handleChoice(choice)}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      }
      case 6:
      case 7:
      case 8:
      case 9:
        return renderTypingPage(page - 6);

      case 10:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">{participant === 1 ? "🎉 You’ve completed the training! Please continue on to Training 1 (under Set 1)." : "🎉 You’ve completed the training."}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const typingDone =
    page >= 6 && page <= 9 &&
    typingInputs[page - 6].trim().toLowerCase() === typingData[page - 6].word;

  const canAdvance = page < 10 && (page === 4 ? isCorrect : page >= 6 ? typingDone : true);

  return (
    <div className="App">
      {renderPage()}
      <div className="training-navigation icon-navigation">
        <button
          className="back-button"
          onClick={handleNext}
          disabled={!canAdvance}
          aria-hidden={!canAdvance}
          style={{ visibility: canAdvance ? 'visible' : 'hidden' }}
        >→</button>
      </div>
    </div>
  );
}



const grid = [[icons[0], icons[1]], [icons[2], icons[3]]];

function TrainingGrid({ gridData, size, showStartEnd, startImage, lines, giver }) {
  return (
    <div className="training-grid" style={{ gridTemplateColumns: `repeat(${size}, 120px)`, gridTemplateRows: `repeat(${size}, 120px)`, width: size * 120, height: size * 120 }}>
      {gridData.flatMap((row, r) => row.map((cell, c) => (
        <div key={`${r}-${c}`} className="training-cell" style={{ borderTopWidth: r === 0 ? 1 : 0, borderLeftWidth: c === 0 ? 1 : 0 }}>
          <img src={cell.image} alt={cell.word} />
          <div>{cell.word}</div>
        </div>
      )))}
      {showStartEnd && (
        <>
          <div style={{ position: 'absolute', top: size === 2 ? 125 : -5, left: size === 2 ? 260 : 120, transform: 'translate(-50%, -50%)', ...(giver && { zIndex: 10 }) }}>
            <img src={startImage} alt="Start" className="training-marker" />
          </div>
          {giver && <div style={{ position: 'absolute', top: size === 2 ? 100 : 335, left: size === 2 ? 0 : 240, transform: 'translate(-50%, 0)', zIndex: 10 }}>
            <img src="/images/end.png" alt="Goal" className="training-marker" />
          </div>}
        </>
      )}
      {lines.map((line, i) => <div key={i} style={{ position: 'absolute', top: line.top, left: line.left, width: line.width, height: line.height,
        backgroundColor: giver ? 'black' : line.backgroundColor || 'green', transform: 'translate(-50%, -50%)', zIndex: 5 }} />)}
    </div>
  );
}

export function GiverTraining({ switchingRoles = false, onComplete }) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (page === 12) onComplete?.();
  }, [page, onComplete]);
  const [inputText, setInputText] = useState('');
  const [paths3x3, setPaths3x3] = useState([]);
  const [pathDeleted, setPathDeleted] = useState(false); // NEW state


  // 3×3 grid
  const grid3x3 = [
    [icons[3], icons[2], icons[0]],
    [icons[1], icons[0], icons[2]],
    [icons[3], icons[1], icons[3]],
  ];

  // validation function
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
    if (page < 12) setPage(switchingRoles && page === 1 ? 3 : page + 1);
  };

  const handleBack = () => {
    if (page > 1) setPage(switchingRoles && page === 3 ? 1 : page - 1);
  };

  const handleDeletePath = () => {
    if (page === 9 && paths3x3.includes(2)) {
      setPaths3x3(paths3x3.filter((p) => p !== 2));
      setPathDeleted(true); // mark as deleted
    }
  };

  useMazeKeyboard(() => {}, handleDeletePath);

  const renderGrid = ({ gridData, size = 2, showStartEnd = false, highlightStep = 0, startImage = '/images/startright.png' }) => {
    const lines = size === 2
      ? linePositions2x2.slice(0, highlightStep)
      : paths3x3.map((p) => linePositions3x3[p - 1]);

    return <TrainingGrid gridData={gridData} size={size} showStartEnd={showStartEnd} startImage={startImage} lines={lines} giver={true} />;
  };

  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {switchingRoles
                  ? "Let's switch roles! Instead of checking to see if the path is valid or not, you will now practice telling your partner how to move through the maze. Let's practice!"
                  : "Next, you will see a sample maze, and you will practice telling your partner how to move through the maze using the icons as landmarks."}
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
                {switchingRoles ? "Unlike before, you can now see the arrow and star. To find the shortest valid path, you must work with your " : "To find the shortest valid path from the arrow to the star, you must work with your "} 
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
                className="typing-input training-answer"
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
                className="typing-input training-answer"
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
                      className="typing-input training-answer"
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
                className="typing-input training-answer"
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
                className="typing-input training-answer"
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
    (page === 5 && validateGiverAnswer(inputText, ['cup', 'tape'])) ||
    page === 6 || 
    (page === 7 && validateGiverAnswer(inputText, ['coop', 'tape'])) ||
    page === 8 || 
    (page === 9 && pathDeleted && validateGiverAnswer(inputText, ['coop', 'tape', 'tap', 'cup'])) || // must delete first
    (page === 10 && validateGiverAnswer(inputText, ['tap', 'cup', 'cup', 'tap'])) ||
    (page === 11 && validateGiverAnswer(inputText, ['cup', 'tap', 'tap', 'coop'])) ||
    page === 12;

  return (
    <div className="App">
      {renderPage()}
      <div className="training-navigation">
        {page > 1 && <button className="back-button" onClick={handleBack}>←</button>}
        {canGoNext && page < 12 && (
          <button 
            className="back-button" 
            onClick={handleNext}
            style={{ marginLeft: page === 1 ? 'auto' : '0' }}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}



export function DrawerTraining({ switchingRoles = false, onComplete }) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (page === 13) onComplete?.();
  }, [page, onComplete]);
  const [inputText, setInputText] = useState('');
  const [showSecondPath, setShowSecondPath] = useState(false);
  const [showInvalidPath, setShowInvalidPath] = useState(false);
  const [showPath7, setShowPath7] = useState(false);
  const [showPath8, setShowPath8] = useState(false);
  const [showPath9, setShowPath9] = useState(false);
  const [showPath10, setShowPath10] = useState(false);
  const [showPath11, setShowPath11] = useState(false);


  // 3×3 grid
  const grid3x3 = [
    [icons[3], icons[2], icons[3]],
    [icons[1], icons[0], icons[2]],
    [icons[0], icons[1], icons[3]],
  ];

  // Validation function 
  // Unified validation function for both 2x2 and 3x3 mazes
  // Specific validation functions using the unified function
  const isValidAnswerCase5 = (answer) => validateDrawerAnswer(answer, ['cup', 'tape']);
  const isValidAnswerCase7 = (answer) => validateDrawerAnswer(answer, ['coop', 'tape']);
  const isValidAnswerCase9 = (answer) => validateDrawerAnswer(answer, ['tape', 'cup'], true, ['coop', 'tape']);
  const isValidAnswerCase10 = (answer) => validateDrawerAnswer(answer, ['cup', 'tape'], true, ['tape', 'cup']);
  const isValidAnswerCase11 = (answer) => validateDrawerAnswer(answer, ['tap', 'coop'], true, ['cup', 'tape']);

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
    if (page === 4 && (direction === 'left' || direction === 'right')) {
      setShowSecondPath(true);
    } else if (page === 5 && direction === 'up') {
      setShowInvalidPath(true);
    } else if (page === 6 && (direction === 'left' || direction === 'right')) {
      setShowSecondPath(true);
    } else if (page === 8 && direction === 'down') {
      setShowPath7(true);
    } else if (page === 9 && direction === 'down') {
      setShowPath8(true);
    } else if (page === 10 && direction === 'right') {
      setShowPath9(true);
    } else if (page === 11 && direction === 'down') {
      setShowPath10(true);
    } else if (page === 12 && direction === 'down') {
      setShowPath11(true);
    }
  };

  useMazeKeyboard(handleMove);

  const handleNext = () => {
    if (page < 13) setPage(switchingRoles && page === 1 ? 3 : page + 1);
  };

  const handleBack = () => {
    if (page > 1) setPage(switchingRoles && page === 3 ? 1 : page - 1);
  };

  const NavigationButtons = () => {
    if (page < 8 || page > 12) return null;
    
    return (
      <div className="maze-controls">
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
  
    return <TrainingGrid gridData={gridData} size={size} showStartEnd={showStartEnd} startImage={startImage} lines={lines} giver={false} />;
  };

  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                {switchingRoles
                  ? "Let's switch roles! Instead of telling your partner how to move through the maze, you will now be checking to see if the path is valid or not. Let's practice."
                  : "Next, you will see a sample maze and practice checking to see if a path is valid or not while your partner tells you how to move through the maze using the icons as landmarks."}
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                To find the shortest valid path, you will see mazes of different sizes. The one below is an example of a
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
      case 4:
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
      case 5:
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
      case 6:
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
                      className="typing-input training-answer"
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">
                You've completed the first maze! Now, let's practice with a 3 by 3 maze.
              </p>
            </div>
          </div>
        );
      case 8:
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
                      className="typing-input training-answer"
                    />
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
      case 10:
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
                      className="typing-input training-answer"
                      style={{ marginTop: 20, width: '100%' }}
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
                      className="typing-input training-answer"
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
                      className="typing-input training-answer"
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        );
      case 13:
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
    page === 1 || page === 2 || page === 3 ||
    (page === 4 && showSecondPath) ||
    (page === 5 && showInvalidPath) ||
    (page === 6 && showSecondPath && isValidAnswerCase5(inputText)) ||
    page === 7 ||
    (page === 8 && showPath7 && isValidAnswerCase7(inputText)) ||
    (page === 9 && showPath8) || // No need for input validation on case 9
    (page === 10 && showPath9 && isValidAnswerCase9(inputText)) ||
    (page === 11 && showPath10 && isValidAnswerCase10(inputText)) ||
    (page === 12 && showPath11 && isValidAnswerCase11(inputText)) ||
    page === 13;

  return (
    <div className="App">
      {renderPage()}
      <div className="training-navigation">
        {page > 1 && <button className="back-button" onClick={handleBack}>←</button>}
        {canGoNext && page < 13 && (
          <button 
            className="back-button" 
            onClick={handleNext}
            style={{ marginLeft: page === 1 ? 'auto' : '0' }}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}

