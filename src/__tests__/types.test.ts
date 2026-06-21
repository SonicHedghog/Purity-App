import { Book, Page, ExportFile, BookFormat, BookStatus, PageStatus } from '../types';

describe('Type definitions', () => {
  it('should create a valid Book object', () => {
    const book: Book = {
      id: 'test-id-123',
      title: 'Test Book',
      author: 'Test Author',
      description: 'A test book',
      formats: ['pdf', 'epub', 'txt', 'audiobook'],
      status: 'scanning',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      totalPages: 0,
      processedPages: 0,
    };

    expect(book.id).toBe('test-id-123');
    expect(book.title).toBe('Test Book');
    expect(book.formats).toHaveLength(4);
    expect(book.status).toBe('scanning');
  });

  it('should create a valid Page object', () => {
    const page: Page = {
      id: 'page-id-123',
      bookId: 'book-id-123',
      pageNumber: 1,
      imageUri: '/path/to/image.jpg',
      ocrText: 'Some extracted text',
      correctedText: 'Some corrected text',
      status: 'ocr_complete',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    expect(page.pageNumber).toBe(1);
    expect(page.status).toBe('ocr_complete');
    expect(page.correctedText).toBe('Some corrected text');
  });

  it('should create a valid ExportFile object', () => {
    const exportFile: ExportFile = {
      id: 'export-id-123',
      bookId: 'book-id-123',
      format: 'pdf',
      filePath: '/path/to/export.pdf',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    expect(exportFile.format).toBe('pdf');
    expect(exportFile.status).toBe('completed');
  });

  it('should enforce valid BookFormat values', () => {
    const validFormats: BookFormat[] = ['pdf', 'epub', 'txt', 'audiobook'];
    expect(validFormats).toHaveLength(4);
  });

  it('should enforce valid BookStatus values', () => {
    const validStatuses: BookStatus[] = ['scanning', 'processing', 'completed', 'paused'];
    expect(validStatuses).toHaveLength(4);
  });

  it('should enforce valid PageStatus values', () => {
    const validStatuses: PageStatus[] = ['captured', 'processing', 'ocr_complete', 'error'];
    expect(validStatuses).toHaveLength(4);
  });
});
