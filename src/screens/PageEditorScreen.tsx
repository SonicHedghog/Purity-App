import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Page } from '../types';
import { getPage, updatePage, getPages, updateBook } from '../database';
import { addToOCRQueue } from '../services/ocrService';

type Props = NativeStackScreenProps<RootStackParamList, 'PageEditor'>;

export default function PageEditorScreen({ route, navigation }: Props) {
  const { bookId, pageId } = route.params;
  const [page, setPage] = useState<Page | null>(null);
  const [editedText, setEditedText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    const pageData = await getPage(pageId);
    if (pageData) {
      setPage(pageData);
      setEditedText(pageData.correctedText || pageData.ocrText || '');
    }
  }

  function handleTextChange(text: string) {
    setEditedText(text);
    setHasChanges(true);
  }

  async function handleSave() {
    if (!page) return;

    await updatePage(pageId, {
      correctedText: editedText,
    });

    setHasChanges(false);
    Alert.alert('Saved', 'Text corrections have been saved.');
  }

  async function handleRetake() {
    Alert.alert(
      'Retake Photo',
      'This will open the camera to retake this page. The current photo will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake',
          onPress: () => {
            // Navigate to camera in single-page retake mode
            navigation.navigate('Camera', { bookId });
          },
        },
      ]
    );
  }

  async function handleReprocessOCR() {
    if (!page) return;

    Alert.alert(
      'Reprocess OCR',
      'Re-run text recognition on this page image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reprocess',
          onPress: async () => {
            await updatePage(pageId, { status: 'captured', ocrText: '', correctedText: '' });
            addToOCRQueue(pageId, bookId, page.imageUri);
            setEditedText('');
            setHasChanges(false);
            Alert.alert('Processing', 'Page has been queued for OCR reprocessing.');
            loadPage();
          },
        },
      ]
    );
  }

  async function handleDeletePage() {
    if (!page) return;

    Alert.alert(
      'Delete Page',
      `Delete page ${page.pageNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete image file
            try {
              await FileSystem.deleteAsync(page.imageUri, { idempotent: true });
            } catch {
              // File may already be gone
            }

            // Delete from database
            const { deletePage } = await import('../database');
            await deletePage(pageId);

            // Update book page count
            const remainingPages = await getPages(bookId);
            await updateBook(bookId, { totalPages: remainingPages.length });

            navigation.goBack();
          },
        },
      ]
    );
  }

  if (!page) {
    return (
      <View style={styles.centered}>
        <Text>Loading page...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Page Image */}
        <TouchableOpacity
          style={styles.imageToggle}
          onPress={() => setShowImage(!showImage)}
        >
          <Text style={styles.imageToggleText}>
            {showImage ? 'Hide Image' : 'Show Image'}
          </Text>
        </TouchableOpacity>

        {showImage && (
          <Image source={{ uri: page.imageUri }} style={styles.pageImage} resizeMode="contain" />
        )}

        {/* Status */}
        <View style={styles.statusRow}>
          <Text style={styles.pageTitle}>Page {page.pageNumber}</Text>
          <Text style={[
            styles.statusBadge,
            page.status === 'ocr_complete' && styles.statusComplete,
            page.status === 'processing' && styles.statusProcessing,
            page.status === 'error' && styles.statusError,
          ]}>
            {page.status === 'captured' && 'Awaiting OCR'}
            {page.status === 'processing' && 'Processing...'}
            {page.status === 'ocr_complete' && 'OCR Complete'}
            {page.status === 'error' && 'OCR Failed'}
          </Text>
        </View>

        {/* Text Editor */}
        <Text style={styles.editorLabel}>Extracted Text (editable)</Text>
        <TextInput
          style={styles.textEditor}
          value={editedText}
          onChangeText={handleTextChange}
          multiline
          placeholder={
            page.status === 'ocr_complete'
              ? 'Edit extracted text here...'
              : 'Text will appear here after OCR processing'
          }
          placeholderTextColor="#AAA"
          textAlignVertical="top"
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          {hasChanges && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionBtn} onPress={handleRetake}>
            <Text style={styles.actionBtnText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleReprocessOCR}>
            <Text style={styles.actionBtnText}>Reprocess OCR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDeletePage}
          >
            <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete Page</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  imageToggle: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  imageToggleText: {
    color: '#4A90D9',
    fontSize: 14,
    fontWeight: '600',
  },
  pageImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusComplete: {
    color: '#7ED321',
    backgroundColor: '#F0FFF0',
  },
  statusProcessing: {
    color: '#F5A623',
    backgroundColor: '#FFF8F0',
  },
  statusError: {
    color: '#D0021B',
    backgroundColor: '#FFF0F0',
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  textEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#7ED321',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionBtnText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    borderColor: '#D0021B',
  },
  deleteBtnText: {
    color: '#D0021B',
  },
});
