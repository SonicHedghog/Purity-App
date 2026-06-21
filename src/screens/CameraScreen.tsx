import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { createPage, getPages, updateBook, getBook } from '../database';
import { addToOCRQueue, getQueueLength } from '../services/ocrService';
import { generateId } from '../utils/uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const IMAGES_DIR = `${FileSystem.documentDirectory}book_pages/`;

export default function CameraScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [pageCount, setPageCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    loadBookInfo();
    ensureImagesDir();
  }, []);

  async function ensureImagesDir() {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
  }

  async function loadBookInfo() {
    const book = await getBook(bookId);
    if (book) {
      setBookTitle(book.title);
      const pages = await getPages(bookId);
      setPageCount(pages.length);
    }
  }

  async function takePicture() {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Move photo to permanent storage
      const pageNumber = pageCount + 1;
      const fileName = `${bookId}_page_${pageNumber}_${Date.now()}.jpg`;
      const permanentUri = `${IMAGES_DIR}${fileName}`;

      await FileSystem.moveAsync({
        from: photo.uri,
        to: permanentUri,
      });

      // Create page record
      const pageId = generateId();
      const now = new Date().toISOString();

      await createPage({
        id: pageId,
        bookId,
        pageNumber,
        imageUri: permanentUri,
        ocrText: '',
        correctedText: '',
        status: 'captured',
        createdAt: now,
        updatedAt: now,
      });

      // Update book page count
      await updateBook(bookId, { totalPages: pageNumber });

      // Add to OCR queue for background processing
      addToOCRQueue(pageId, bookId, permanentUri);

      setPageCount(pageNumber);
    } catch (error) {
      console.error('Error capturing page:', error);
      Alert.alert('Error', 'Failed to capture page. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }

  function handlePause() {
    Alert.alert(
      'Pause Scanning',
      'You can resume scanning this book later from the book details screen.',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        {
          text: 'Pause & Go Back',
          onPress: async () => {
            await updateBook(bookId, { status: 'paused' });
            navigation.navigate('BookDetail', { bookId });
          },
        },
      ]
    );
  }

  function handleDone() {
    Alert.alert(
      'Finish Scanning',
      `You've captured ${pageCount} page${pageCount !== 1 ? 's' : ''}. Are you done scanning this book?`,
      [
        { text: 'Keep Scanning', style: 'cancel' },
        {
          text: 'Done',
          onPress: async () => {
            await updateBook(bookId, { status: 'processing' });
            navigation.navigate('BookDetail', { bookId });
          },
        },
      ]
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan book pages
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePause} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Pause</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{bookTitle}</Text>
          <Text style={styles.pageCounter}>Page {pageCount + 1}</Text>
        </View>
        <TouchableOpacity onPress={handleDone} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.overlay}>
            <View style={styles.pageFrame} />
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            {pageCount} page{pageCount !== 1 ? 's' : ''} captured
          </Text>
          {getQueueLength() > 0 && (
            <Text style={styles.processingText}>
              Processing: {getQueueLength()} in queue
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <Text style={styles.hint}>
          Position the book page within the frame and tap to capture
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#9B9B9B',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pageCounter: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 2,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageFrame: {
    width: '85%',
    height: '80%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingVertical: 20,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  infoText: {
    color: '#AAA',
    fontSize: 14,
  },
  processingText: {
    color: '#F5A623',
    fontSize: 13,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  hint: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
});
