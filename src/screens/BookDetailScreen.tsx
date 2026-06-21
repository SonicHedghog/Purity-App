import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Book, Page } from '../types';
import { getBook, getPages, updateBook } from '../database';
import { exportBook, playAudiobook, stopAudiobook, isAudiobookPlaying, shareExport } from '../services/exportService';
import { getExportFiles } from '../database';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
      checkAudioStatus();
    }, [bookId])
  );

  async function loadData() {
    const bookData = await getBook(bookId);
    setBook(bookData);
    if (bookData) {
      const pageData = await getPages(bookId);
      setPages(pageData);
    }
  }

  async function checkAudioStatus() {
    const playing = await isAudiobookPlaying();
    setIsPlaying(playing);
  }

  async function handleResumeScan() {
    await updateBook(bookId, { status: 'scanning' });
    navigation.navigate('Camera', { bookId });
  }

  async function handleExport() {
    if (!book) return;

    const ocrPages = pages.filter(p => p.status === 'ocr_complete');
    if (ocrPages.length === 0) {
      Alert.alert(
        'No Processed Pages',
        'Wait for at least one page to finish OCR processing before exporting.'
      );
      return;
    }

    setIsExporting(true);
    try {
      await exportBook(book);
      await updateBook(bookId, { status: 'completed' });
      await loadData();
      Alert.alert('Export Complete', 'Your book has been exported in the selected formats.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'There was a problem generating some formats.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handlePlayAudiobook() {
    if (!book) return;

    if (isPlaying) {
      stopAudiobook();
      setIsPlaying(false);
    } else {
      try {
        await playAudiobook(book);
        setIsPlaying(true);
      } catch (error) {
        Alert.alert('Playback Error', (error as Error).message);
      }
    }
  }

  async function handleShare() {
    const exports = await getExportFiles(bookId);
    const completed = exports.filter(e => e.status === 'completed');

    if (completed.length === 0) {
      Alert.alert('No Exports', 'Export the book first before sharing.');
      return;
    }

    // Share the first available export
    try {
      await shareExport(completed[0].filePath);
    } catch (error) {
      Alert.alert('Share Error', (error as Error).message);
    }
  }

  function getStatusInfo(): { text: string; color: string } {
    if (!book) return { text: '', color: '#999' };
    const processed = pages.filter(p => p.status === 'ocr_complete').length;
    const total = pages.length;

    if (book.status === 'completed') {
      return { text: 'Completed - All formats generated', color: '#7ED321' };
    }
    if (book.status === 'paused') {
      return { text: `Paused - ${total} pages captured`, color: '#9B9B9B' };
    }
    if (processed < total) {
      return { text: `Processing OCR: ${processed}/${total} pages`, color: '#F5A623' };
    }
    return { text: `${total} pages ready for export`, color: '#4A90D9' };
  }

  function renderPage({ item }: { item: Page }) {
    return (
      <TouchableOpacity
        style={styles.pageCard}
        onPress={() => navigation.navigate('PageEditor', { bookId, pageId: item.id })}
      >
        <Image source={{ uri: item.imageUri }} style={styles.pageThumb} />
        <View style={styles.pageInfo}>
          <Text style={styles.pageNumber}>Page {item.pageNumber}</Text>
          <Text style={styles.pageStatus}>
            {item.status === 'captured' && 'Waiting for OCR...'}
            {item.status === 'processing' && 'Processing...'}
            {item.status === 'ocr_complete' && 'Text extracted'}
            {item.status === 'error' && 'OCR failed - tap to retry'}
          </Text>
          {item.ocrText ? (
            <Text style={styles.pagePreview} numberOfLines={2}>
              {item.correctedText || item.ocrText}
            </Text>
          ) : null}
        </View>
        <Text style={styles.editArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  if (!book) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      {/* Book Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{book.title}</Text>
        {book.author ? <Text style={styles.author}>by {book.author}</Text> : null}
        <View style={[styles.statusBar, { backgroundColor: statusInfo.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleResumeScan}>
            <Text style={styles.actionButtonText}>
              {book.status === 'scanning' ? 'Continue Scanning' : 'Add More Pages'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={[styles.actionButtonText, styles.exportButtonText]}>
                Export Book
              </Text>
            )}
          </TouchableOpacity>

          {book.formats.includes('audiobook') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.audioButton]}
              onPress={handlePlayAudiobook}
            >
              <Text style={[styles.actionButtonText, styles.audioButtonText]}>
                {isPlaying ? 'Stop Playback' : 'Play Audiobook'}
              </Text>
            </TouchableOpacity>
          )}

          {book.status === 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                Share
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pages List */}
      <Text style={styles.pagesTitle}>
        Pages ({pages.length})
      </Text>
      <FlatList
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.pagesList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pages captured yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8F0FE',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90D9',
  },
  exportButton: {
    backgroundColor: '#4A90D9',
  },
  exportButtonText: {
    color: '#FFFFFF',
  },
  audioButton: {
    backgroundColor: '#9B59B6',
  },
  audioButtonText: {
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: '#7ED321',
  },
  shareButtonText: {
    color: '#FFFFFF',
  },
  pagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pagesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageThumb: {
    width: 50,
    height: 65,
    borderRadius: 4,
    backgroundColor: '#EEE',
  },
  pageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pageNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  pageStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  pagePreview: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  editArrow: {
    fontSize: 24,
    color: '#CCC',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
});
