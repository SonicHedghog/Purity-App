import * as FileSystem from 'expo-file-system/legacy';
import { updatePage, getPages, updateBook, getBook } from '../database';

// Simple on-device OCR using image analysis
// In production, this would use ML Kit or Tesseract
// For now, we use a local approach that works offline

interface OCRResult {
  text: string;
  confidence: number;
}

// Queue for processing pages
let processingQueue: Array<{ pageId: string; bookId: string; imageUri: string }> = [];
let isProcessing = false;

export function addToOCRQueue(pageId: string, bookId: string, imageUri: string): void {
  processingQueue.push({ pageId, bookId, imageUri });
  if (!isProcessing) {
    processNextInQueue();
  }
}

async function processNextInQueue(): Promise<void> {
  if (processingQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const item = processingQueue.shift()!;

  try {
    await updatePage(item.pageId, { status: 'processing' });

    const result = await performOCR(item.imageUri);

    await updatePage(item.pageId, {
      ocrText: result.text,
      correctedText: result.text,
      status: 'ocr_complete',
    });

    // Update book processed pages count
    const book = await getBook(item.bookId);
    if (book) {
      const pages = await getPages(item.bookId);
      const processedCount = pages.filter(p => p.status === 'ocr_complete').length;
      await updateBook(item.bookId, { processedPages: processedCount });
    }
  } catch (error) {
    console.error('OCR processing error:', error);
    await updatePage(item.pageId, { status: 'error' });
  }

  // Process next item
  processNextInQueue();
}

async function performOCR(imageUri: string): Promise<OCRResult> {
  // Verify the image exists
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) {
    throw new Error('Image file not found');
  }

  // On-device OCR placeholder
  // In a real implementation, this would use:
  // - react-native-mlkit-ocr for ML Kit text recognition
  // - or Tesseract.js running locally
  // For the MVP, we provide a structure that works offline
  // and can be swapped with a real OCR engine

  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return placeholder text indicating the page was captured
  // Real OCR engine integration point
  return {
    text: `[Page captured - OCR text will appear here when ML Kit is configured]\n\nImage: ${imageUri.split('/').pop()}`,
    confidence: 0.0,
  };
}

export function getQueueLength(): number {
  return processingQueue.length;
}

export function isQueueProcessing(): boolean {
  return isProcessing;
}

export function clearQueue(): void {
  processingQueue = [];
  isProcessing = false;
}
