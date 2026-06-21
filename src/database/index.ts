import * as SQLite from 'expo-sqlite';
import { Book, Page, ExportFile, BookFormat, BookStatus, PageStatus } from '../types';

type SQLiteBindValue = string | number | null | boolean;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('virtufy_books.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      formats TEXT NOT NULL DEFAULT '["pdf","epub","txt","audiobook"]',
      status TEXT NOT NULL DEFAULT 'scanning',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      totalPages INTEGER NOT NULL DEFAULT 0,
      processedPages INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      pageNumber INTEGER NOT NULL,
      imageUri TEXT NOT NULL,
      ocrText TEXT NOT NULL DEFAULT '',
      correctedText TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'captured',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS export_files (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      format TEXT NOT NULL,
      filePath TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
  `);
}

// Book operations
export async function createBook(book: Book): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO books (id, title, author, description, formats, status, createdAt, updatedAt, totalPages, processedPages)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [book.id, book.title, book.author, book.description, JSON.stringify(book.formats), book.status, book.createdAt, book.updatedAt, book.totalPages, book.processedPages]
  );
}

export async function getAllBooks(): Promise<Book[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM books ORDER BY updatedAt DESC');
  return (rows as Array<Record<string, unknown>>).map(mapRowToBook);
}

export async function getBook(id: string): Promise<Book | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM books WHERE id = ?', [id]);
  return row ? mapRowToBook(row as Record<string, unknown>) : null;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.author !== undefined) { fields.push('author = ?'); values.push(updates.author); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.formats !== undefined) { fields.push('formats = ?'); values.push(JSON.stringify(updates.formats)); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.totalPages !== undefined) { fields.push('totalPages = ?'); values.push(updates.totalPages); }
  if (updates.processedPages !== undefined) { fields.push('processedPages = ?'); values.push(updates.processedPages); }

  fields.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await database.runAsync(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values as SQLiteBindValue[]);
}

export async function deleteBook(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM pages WHERE bookId = ?', [id]);
  await database.runAsync('DELETE FROM export_files WHERE bookId = ?', [id]);
  await database.runAsync('DELETE FROM books WHERE id = ?', [id]);
}

// Page operations
export async function createPage(page: Page): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO pages (id, bookId, pageNumber, imageUri, ocrText, correctedText, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [page.id, page.bookId, page.pageNumber, page.imageUri, page.ocrText, page.correctedText, page.status, page.createdAt, page.updatedAt]
  );
}

export async function getPages(bookId: string): Promise<Page[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM pages WHERE bookId = ? ORDER BY pageNumber ASC', [bookId]);
  return (rows as Array<Record<string, unknown>>).map(mapRowToPage);
}

export async function getPage(id: string): Promise<Page | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM pages WHERE id = ?', [id]);
  return row ? mapRowToPage(row as Record<string, unknown>) : null;
}

export async function updatePage(id: string, updates: Partial<Page>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.imageUri !== undefined) { fields.push('imageUri = ?'); values.push(updates.imageUri); }
  if (updates.ocrText !== undefined) { fields.push('ocrText = ?'); values.push(updates.ocrText); }
  if (updates.correctedText !== undefined) { fields.push('correctedText = ?'); values.push(updates.correctedText); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }

  fields.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await database.runAsync(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, values as SQLiteBindValue[]);
}

export async function deletePage(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM pages WHERE id = ?', [id]);
}

// Export file operations
export async function createExportFile(exportFile: ExportFile): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO export_files (id, bookId, format, filePath, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [exportFile.id, exportFile.bookId, exportFile.format, exportFile.filePath, exportFile.status, exportFile.createdAt]
  );
}

export async function getExportFiles(bookId: string): Promise<ExportFile[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM export_files WHERE bookId = ?', [bookId]);
  return (rows as Array<Record<string, unknown>>).map(mapRowToExportFile);
}

export async function updateExportFile(id: string, updates: Partial<ExportFile>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (updates.filePath !== undefined) { fields.push('filePath = ?'); values.push(updates.filePath); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  values.push(id);

  await database.runAsync(`UPDATE export_files SET ${fields.join(', ')} WHERE id = ?`, values as SQLiteBindValue[]);
}

// Mapping helpers
function mapRowToBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    description: row.description as string,
    formats: JSON.parse(row.formats as string) as BookFormat[],
    status: row.status as BookStatus,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    totalPages: row.totalPages as number,
    processedPages: row.processedPages as number,
  };
}

function mapRowToPage(row: Record<string, unknown>): Page {
  return {
    id: row.id as string,
    bookId: row.bookId as string,
    pageNumber: row.pageNumber as number,
    imageUri: row.imageUri as string,
    ocrText: row.ocrText as string,
    correctedText: row.correctedText as string,
    status: row.status as PageStatus,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function mapRowToExportFile(row: Record<string, unknown>): ExportFile {
  return {
    id: row.id as string,
    bookId: row.bookId as string,
    format: row.format as BookFormat,
    filePath: row.filePath as string,
    status: row.status as 'pending' | 'generating' | 'completed' | 'error',
    createdAt: row.createdAt as string,
  };
}
