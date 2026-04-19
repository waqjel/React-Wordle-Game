import express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { wordleAlgorithm } from './algorithm.js';
import path from 'path'; // directory paths
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MonogDB
const MONGO_URI = 'mongodb://localhost:27017/wordleDB'; 
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB: wordleDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Highscore Schema
const highscoreSchema = new mongoose.Schema({
    name: String,
    duration: Number,
    guesses: Number,
    length: Number,
    unique: Boolean,
    date: { type: Date, default: Date.now },
    word: String
}, { collection: 'highscores' }); 

const Highscore = mongoose.model('Highscore', highscoreSchema, 'highscores');

// In-memory store for active sessions
const activeGames = new Map();
let wordList = [];
const wordListURL = 'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json'
const loadWords = async () => {
    try {
        console.log('Fetching dictionary...');
        const response = await fetch(wordListURL);
        const data = await response.json();
        wordList = Object.keys(data)
            .map(word => word.toUpperCase())
            .filter(word => /^[A-Z]+$/.test(word));
        console.log(`Loaded ${wordList.length} words from Github link\n${wordListURL}`);
    } catch (err) {
        console.error('Failed to load dictionary:', err);
        wordList = ["APPLE", "REACT", "NODE", "VITE", "CODE", "JAVA"];
    }
};
loadWords();

// API Routes
app.post('/api/game/start', (req, res) => {
    const length = parseInt(req.body.length) || 5;
    const { unique } = req.body;
    let possibleWords = wordList.filter(w => w.length === length);
    if (unique) {
        possibleWords = possibleWords.filter(w => new Set(w).size === w.length);
    }
    if (possibleWords.length === 0) {
        return res.status(400).json({ error: "No words found for these settings." });
    }
    const targetWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    const gameId = uuidv4();
    activeGames.set(gameId, {
        word: targetWord.toUpperCase(),
        startTime: Date.now(),
        settings: { length, unique }
    });
    console.log(`Game Started: ${gameId} | Target: ${targetWord}`);
    res.json({ gameId, length: targetWord.length });
});

app.post('/api/game/guess', (req, res) => {
    const { gameId, guess } = req.body;
    const game = activeGames.get(gameId);
    if (!game) return res.status(404).json({ error: "Game session not found" });

    const upperGuess = (guess || "").toUpperCase();
    const feedback = wordleAlgorithm(game.word, upperGuess);
    if (!feedback) return res.status(400).json({ error: "Invalid guess" });

    const isCorrect = upperGuess === game.word;
    res.json({ feedback, isCorrect });
});

app.post('/api/highscore', async (req, res) => {
    const { gameId, name, guesses, word  } = req.body;
    const game = activeGames.get(gameId);
    if (!game) return res.status(400).json({ error: "Invalid session" });

    try {
        const newScore = new Highscore({
            name: name || "Anonymous",
            duration: parseFloat(((Date.now() - game.startTime) / 1000).toFixed(2)),
            guesses: parseInt(guesses) || 0,
            length: game.settings.length,
            unique: game.settings.unique,
            word: game.word
        });
        await newScore.save(); 
        activeGames.delete(gameId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to save score" });
    }
});

app.get('/api/highscores', async (req, res) => {
    try {
        const scores = await Highscore.find({})
            .sort({ guesses: 1, duration: 1 })
            .limit(10)
            .lean(); 
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: "Error loading highscores" });
    }
});

// Catch-all route to serve index.html for any non-API request
app.use((req, res, next) => {
    // If the request is for an API that doesn't exist, don't send HTML
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API route not found" });
    }
    // Otherwise, send the frontend
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(5080, () => console.log('Server running at http://localhost:5080'));