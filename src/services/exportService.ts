import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { Book, Page, BookFormat } from '../types';
import { getPages, createExportFile, updateExportFile } from '../database';
import { generateId } from '../utils/uuid';

const EXPORT_DIR = `${FileSystem.documentDirectory}exports/`;

async function ensureExportDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(EXPORT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
  }
}

export async function exportBook(book: Book): Promise<void> {
  await ensureExportDir();
  const pages = await getPages(book.id);

  for (const format of book.formats) {
    try {
      await generateFormat(book, pages, format);
    } catch (error) {
      console.error(`Error generating ${format} for book ${book.id}:`, error);
    }
  }
}

async function generateFormat(book: Book, pages: Page[], format: BookFormat): Promise<void> {
  const exportId = generateId();
  const timestamp = new Date().toISOString();

  await createExportFile({
    id: exportId,
    bookId: book.id,
    format,
    filePath: '',
    status: 'generating',
    createdAt: timestamp,
  });

  try {
    let filePath: string;

    switch (format) {
      case 'pdf':
        filePath = await generatePDF(book, pages);
        break;
      case 'epub':
        filePath = await generateEPUB(book, pages);
        break;
      case 'txt':
        filePath = await generateTXT(book, pages);
        break;
      case 'audiobook':
        filePath = await generateAudiobook(book, pages);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    await updateExportFile(exportId, { filePath, status: 'completed' });
  } catch (error) {
    await updateExportFile(exportId, { status: 'error' });
    throw error;
  }
}

function getPageText(page: Page): string {
  return page.correctedText || page.ocrText || '';
}

async function generatePDF(book: Book, pages: Page[]): Promise<string> {
  const fileName = `${sanitizeFileName(book.title)}.pdf`;
  const filePath = `${EXPORT_DIR}${fileName}`;

  // Generate HTML content for the PDF
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: serif; padding: 40px; line-height: 1.6; }
          h1 { text-align: center; margin-bottom: 10px; }
          h2 { text-align: center; color: #666; margin-bottom: 40px; }
          .page { page-break-after: always; margin-bottom: 30px; }
          .page:last-child { page-break-after: auto; }
          .page-header { color: #999; font-size: 12px; margin-bottom: 10px; }
          .page-content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(book.title)}</h1>
        ${book.author ? `<h2>by ${escapeHtml(book.author)}</h2>` : ''}
        ${pages.map((page, index) => `
          <div class="page">
            <div class="page-header">Page ${index + 1}</div>
            <div class="page-content">${escapeHtml(getPageText(page))}</div>
          </div>
        `).join('')}
      </body>
    </html>
  `;

  // Save as HTML (PDF generation requires native module like react-native-html-to-pdf)
  // For now, save as HTML which can be printed to PDF on device
  const htmlPath = filePath.replace('.pdf', '.html');
  await FileSystem.writeAsStringAsync(htmlPath, htmlContent);

  return htmlPath;
}

async function generateEPUB(book: Book, pages: Page[]): Promise<string> {
  const fileName = `${sanitizeFileName(book.title)}.epub`;
  const filePath = `${EXPORT_DIR}${fileName}`;

  // EPUB is a zip file with specific structure
  // For local generation, we create the content in a structured format
  const epubContent = {
    title: book.title,
    author: book.author,
    chapters: pages.map((page, index) => ({
      title: `Page ${index + 1}`,
      content: getPageText(page),
    })),
  };

  // Save EPUB metadata as JSON (full EPUB zip generation would need a native module)
  // This gives users the structured content that can be converted
  const jsonPath = filePath.replace('.epub', '_epub_content.json');
  await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(epubContent, null, 2));

  return jsonPath;
}

async function generateTXT(book: Book, pages: Page[]): Promise<string> {
  const fileName = `${sanitizeFileName(book.title)}.txt`;
  const filePath = `${EXPORT_DIR}${fileName}`;

  const separator = '\n' + '='.repeat(50) + '\n';
  const header = `${book.title}\n${book.author ? `by ${book.author}\n` : ''}${separator}`;

  const content = pages.map((page, index) => {
    return `--- Page ${index + 1} ---\n\n${getPageText(page)}`;
  }).join('\n\n');

  const fullText = header + content;
  await FileSystem.writeAsStringAsync(filePath, fullText);

  return filePath;
}

async function generateAudiobook(book: Book, pages: Page[]): Promise<string> {
  const fileName = `${sanitizeFileName(book.title)}_audiobook.txt`;
  const filePath = `${EXPORT_DIR}${fileName}`;

  // Compile all text for TTS
  const fullText = pages.map(page => getPageText(page)).join('\n\n');

  // Save the text script for the audiobook
  await FileSystem.writeAsStringAsync(filePath, fullText);

  // The actual audio playback uses expo-speech which reads text aloud on-device
  // We save the script and provide a "play" function
  return filePath;
}

export async function playAudiobook(book: Book): Promise<void> {
  const pages = await getPages(book.id);
  const fullText = pages.map(page => getPageText(page)).join('. ');

  if (!fullText.trim()) {
    throw new Error('No text available to read');
  }

  // Use device TTS to read the book aloud
  Speech.speak(fullText, {
    language: 'en-US',
    rate: 0.9,
    pitch: 1.0,
    onDone: () => { /* playback complete */ },
    onError: (error) => console.error('TTS error:', error),
  });
}

export function stopAudiobook(): void {
  Speech.stop();
}

export async function isAudiobookPlaying(): Promise<boolean> {
  return await Speech.isSpeakingAsync();
}

export async function shareExport(filePath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(filePath);
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
