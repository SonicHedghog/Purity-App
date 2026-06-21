export type BookFormat = 'pdf' | 'epub' | 'txt' | 'audiobook';

export type BookStatus = 'scanning' | 'processing' | 'completed' | 'paused';

export type PageStatus = 'captured' | 'processing' | 'ocr_complete' | 'error';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  formats: BookFormat[];
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  totalPages: number;
  processedPages: number;
}

export interface Page {
  id: string;
  bookId: string;
  pageNumber: number;
  imageUri: string;
  ocrText: string;
  correctedText: string;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExportFile {
  id: string;
  bookId: string;
  format: BookFormat;
  filePath: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  NewBook: undefined;
  BookDetail: { bookId: string };
  Camera: { bookId: string };
  PageEditor: { bookId: string; pageId: string };
};
