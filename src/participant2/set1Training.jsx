import React, { useState } from 'react';
import '../App.css'; 

const data = [
  { word: 'cup', image: '/images/cup.png' },
  { word: 'tap', image: '/images/tap.png' },
  { word: 'tape', image: '/images/tape.png' },
  { word: 'coop', image: '/images/coop.png' },
];

const quizData = data.map(item => ({
  correct: item.word,
  image: item.image,
  choices: shuffle(['cup', 'tap', 'tape', 'coop']),
}));

const typingData = shuffle([...data]); // randomized order for typing phase

function shuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [page, setPage] = useState(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [typingInputs, setTypingInputs] = useState(Array(data.length).fill(""));

  const handleNext = () => {
    if (page === 2) {
      if (wordIndex < data.length - 1) {
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
    } else if (page >= 6 && page <= 9) {
      setPage(page + 1);
    } else if (page === 10) {
      setPage(11); // Final page after typing
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
                ​Click the arrow symbol once you understand how each icon represents the corresponding word.​
              </p>
              <div className="grid">
                {data.map((item, index) => (
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
                Please study this icon and word pair.​ <br />
                Repeat the word aloud 5 times.​
              </p>
              <div className="centered">
                <div className="item">
                  <img src={data[wordIndex].image} alt={data[wordIndex].word} className="icon" />
                  <p>{data[wordIndex].word}</p>
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
                ​Please click on the word associated with the icon.​
              </p>
            </div>
          </div>
        );

      case 4:
        const current = quizData[quizIndex];
        return (
          <div className="page">
            <div className="container">
              <div className="quiz-box">
                <p className="instruction">Which word does this icon refer to?​</p>
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

      case 6:
      case 7:
      case 8:
      case 9:
        return renderTypingPage(page - 6);

      case 10:
        return (
          <div className="page">
            <div className="container">
              <p className="instruction">🎉 You’ve completed the training.</p>
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

  return (
    <div className="App">
      {renderPage()}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '80%', margin: '20px auto' }}>
        {(
          (page === 4 && isCorrect) ||
          (page >= 6 && page <= 9 && typingDone) ||
          (page !== 4 && page < 5 && page !== 6 && page !== 7 && page !== 8 && page !== 9)
        ) && (
          <button className="back-button" onClick={handleNext} style={{ backgroundColor: '#e8e8e8' }}>→</button>
        )}
        {page === 10 && (
          <button className="back-button" onClick={handleNext} style={{ backgroundColor: '#e8e8e8' }}>→</button>
        )}
      </div>
    </div>
  );
}

export default App;