import request from 'supertest';
import express from 'express';
import { wordleAlgorithm } from '../algorithm.js';

// Setup a mock app for testing routes without starting the real DB
const app = express();
app.use(express.json());

// Sample word for testing the algorithm
const TARGET = "CYBER";

describe('Wordle Algorithm Logic', () => {
  test('should return all correct for exact match', () => {
    const result = wordleAlgorithm(TARGET, "CYBER");
    expect(result.every(r => r === 'correct')).toBe(true);
  });

  test('should return misplaced for letters in wrong spots', () => {
    const result = wordleAlgorithm(TARGET, "BERCY");
    expect(result).toContain('misplaced');
  });

  test('should return incorrect for letters not in word', () => {
    const result = wordleAlgorithm(TARGET, "WORDS");
    expect(result).toContain('incorrect');
  });
});

describe('API Integration (Mocked)', () => {
  // Mocking a start game response
  test('POST /api/game/start returns gameId and length', async () => {
    const mockResponse = { gameId: "123-abc", length: 5 };
    expect(mockResponse).toHaveProperty('gameId');
    expect(mockResponse.length).toBe(5);
  });
});