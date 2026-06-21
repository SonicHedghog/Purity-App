import { stopAudiobook } from '../services/exportService';

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/mock/documents/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock database
jest.mock('../database', () => ({
  getPages: jest.fn().mockResolvedValue([]),
  createExportFile: jest.fn().mockResolvedValue(undefined),
  updateExportFile: jest.fn().mockResolvedValue(undefined),
  getExportFiles: jest.fn().mockResolvedValue([]),
}));

describe('Export Service', () => {
  it('should stop audiobook playback', () => {
    const Speech = require('expo-speech');
    stopAudiobook();
    expect(Speech.stop).toHaveBeenCalled();
  });

  it('should check if audiobook is playing', async () => {
    const { isAudiobookPlaying } = require('../services/exportService');
    const result = await isAudiobookPlaying();
    expect(result).toBe(false);
  });

  it('should handle export book with no pages', async () => {
    const { exportBook } = require('../services/exportService');
    const book = {
      id: 'book-1',
      title: 'Test Book',
      author: 'Author',
      formats: ['txt'],
      status: 'completed',
    };

    // Should not throw even with no pages
    await expect(exportBook(book)).resolves.not.toThrow();
  });
});
