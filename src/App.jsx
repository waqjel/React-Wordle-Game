import React, { useState, useEffect } from 'react';

function App() {
    // UI State
    const [view, setView] = useState('game'); // 'game' or 'leaderboard'
    const [highscores, setHighscores] = useState([]);
    
    // Game State
    const [gameId, setGameId] = useState(null);
    const [rows, setRows] = useState([]);
    const [input, setInput] = useState("");
    const [won, setWon] = useState(false);
    const [settings, setSettings] = useState({ length: 5, unique: false });

    // Fetch highscores from the API
    const fetchHighscores = async () => {
        try {
            const res = await fetch('/api/highscores');
            const data = await res.json();
            setHighscores(data);
            setView('leaderboard');
        } catch (err) {
            console.error("Failed to fetch highscores:", err);
        }
    };

    const startGame = async () => {
        try {
            const res = await fetch('/api/game/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Server error');
            }

            const data = await res.json();
            setGameId(data.gameId);
            setRows([]);
            setWon(false);
            setView('game');
        } catch (err) {
            console.error("Failed to start game:", err);
            alert(err.message);
        }
    };

    const handleGuess = async () => {
        const uppercaseInput = input.toUpperCase();
        if (uppercaseInput.length !== settings.length) {
            return alert(`Guess must be ${settings.length} letters long!`);
        }

        const res = await fetch('/api/game/guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, guess: uppercaseInput })
        });
        const data = await res.json();

        setRows([...rows, { word: uppercaseInput, feedback: data.feedback }]);
        if (data.isCorrect) setWon(true);
        setInput("");
    };

    const submitScore = async () => {
        const name = prompt("Enter your name for the leaderboard:");
        if (!name) return;

        const targetWord = rows[rows.length - 1].word;

        try {
            const response = await fetch('/api/highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: gameId,
                    name: name,
                    guesses: rows.length,
                    word: targetWord
                })
            });

            if (response.ok) {
                fetchHighscores();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (err) {
            console.error("Failed to submit score:", err);
        }
    };

    // Highscore list
    if (view === 'leaderboard') {
        return (
            <div className="game-container">
                <h1>🏆 Highscores</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Time</th>
                            <th>Guesses</th>
                            <th>Length</th>
                            <th>Word</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highscores.length > 0 ? highscores.map((s, i) => (
                            <tr key={i}>
                                <td>{s.name}</td>
                                <td>{s.duration}s</td>
                                <td>{s.guesses}</td>
                                <td>{s.length}</td>
                                <td>{s.word}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No scores yet!</td></tr>
                        )}
                    </tbody>
                </table>
                <button className="start-btn" style={{ marginTop: '20px' }} onClick={() => setView('game')}>
                    Back to Game
                </button>
            </div>
        );
    }

    // Game page
    return (
        <div className="game-container">
            <h1>Wordle Game</h1>

            {!gameId ? (
                <div className="settings-panel">
                    <h2>Game Settings</h2>
                    <div className="setting-item">
                        <label>Word Length: </label>
                        <input
                            type="number"
                            value={settings.length}
                            min="5" max="8"
                            onChange={e => setSettings({ ...settings, length: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="setting-item">
                        <label>Unique Letters Only: </label>
                        <input
                            type="checkbox"
                            checked={settings.unique}
                            onChange={e => setSettings({ ...settings, unique: e.target.checked })}
                        />
                    </div>
                    <button className="start-btn" onClick={startGame}>Start New Game</button>
                </div>
            ) : (
                <div className="board">
                    {rows.map((r, i) => (
                        <div key={i} className="row">
                            {r.word.split('').map((char, j) => (
                                <span key={j} className={`tile ${r.feedback?.[j] || 'incorrect'}`}>
                                    {char}
                                </span>
                            ))}
                        </div>
                    ))}

                    {!won ? (
                        <div className="input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                maxLength={settings.length}
                                placeholder={`Enter ${settings.length} letters...`}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                            />
                            <button onClick={handleGuess}>Guess</button>
                        </div>
                    ) : (
                        <div className="win-message">
                            <h2>You Won!</h2>
                            <button onClick={submitScore}>Submit Highscore</button>
                        </div>
                    )}
                </div>
            )}

            <footer className="footer-nav">
                <a href="/about.html">About Project</a>
                <span> | </span>
                <button 
                    onClick={fetchHighscores} 
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                >
                    Highscores
                </button>
            </footer>
        </div>
    );
}

export default App;