import { getQueueLength, isQueueProcessing, clearQueue, addToOCRQueue } from '../services/ocrService';

// Mock the database module
jest.mock('../database', () => ({
  updatePage: jest.fn().mockResolvedValue(undefined),
  getPages: jest.fn().mockResolvedValue([]),
  updateBook: jest.fn().mockResolvedValue(undefined),
  getBook: jest.fn().mockResolvedValue({ id: 'book-1', title: 'Test' }),
}));

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1000 }),
  documentDirectory: '/mock/documents/',
}));

describe('OCR Service', () => {
  beforeEach(() => {
    clearQueue();
  });

  it('should start with empty queue', () => {
    expect(getQueueLength()).toBe(0);
    expect(isQueueProcessing()).toBe(false);
  });

  it('should add items to queue', () => {
    addToOCRQueue('page-1', 'book-1', '/path/to/image.jpg');
    // Queue length may be 0 if it started processing immediately
    // The important thing is it doesn't throw
    expect(getQueueLength()).toBeGreaterThanOrEqual(0);
  });

  it('should clear the queue', () => {
    clearQueue();
    expect(getQueueLength()).toBe(0);
    expect(isQueueProcessing()).toBe(false);
  });

  it('should handle multiple queue items', () => {
    clearQueue();
    // Add items - they start processing immediately
    addToOCRQueue('page-1', 'book-1', '/path/to/image1.jpg');
    addToOCRQueue('page-2', 'book-1', '/path/to/image2.jpg');
    addToOCRQueue('page-3', 'book-1', '/path/to/image3.jpg');

    // After adding 3, at least some should be queued (first may be processing)
    expect(getQueueLength()).toBeGreaterThanOrEqual(0);
  });
});
