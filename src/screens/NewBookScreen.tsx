import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BookFormat } from '../types';
import { createBook } from '../database';
import { generateId } from '../utils/uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'NewBook'>;

const ALL_FORMATS: { key: BookFormat; label: string; description: string }[] = [
  { key: 'pdf', label: 'PDF', description: 'Portable document with formatting' },
  { key: 'epub', label: 'EPUB', description: 'E-reader compatible format' },
  { key: 'txt', label: 'Plain Text', description: 'Simple text file' },
  { key: 'audiobook', label: 'Audiobook', description: 'Text-to-speech audio' },
];

export default function NewBookScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<BookFormat[]>(
    ALL_FORMATS.map(f => f.key)
  );

  function toggleFormat(format: BookFormat) {
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        if (prev.length === 1) {
          Alert.alert('Error', 'At least one format must be selected');
          return prev;
        }
        return prev.filter(f => f !== format);
      }
      return [...prev, format];
    });
  }

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    const now = new Date().toISOString();
    const bookId = generateId();

    await createBook({
      id: bookId,
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      formats: selectedFormats,
      status: 'scanning',
      createdAt: now,
      updatedAt: now,
      totalPages: 0,
      processedPages: 0,
    });

    // Navigate to camera to start scanning
    navigation.replace('Camera', { bookId });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Book Information</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter book title"
        placeholderTextColor="#AAA"
      />

      <Text style={styles.label}>Author</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Enter author name"
        placeholderTextColor="#AAA"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Brief description of the book"
        placeholderTextColor="#AAA"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionTitle}>Output Formats</Text>
      <Text style={styles.sectionSubtitle}>
        Select which formats to generate (all selected by default)
      </Text>

      {ALL_FORMATS.map(format => (
        <TouchableOpacity
          key={format.key}
          style={[
            styles.formatOption,
            selectedFormats.includes(format.key) && styles.formatOptionSelected,
          ]}
          onPress={() => toggleFormat(format.key)}
        >
          <View style={styles.formatCheckbox}>
            {selectedFormats.includes(format.key) && (
              <View style={styles.formatCheckboxInner} />
            )}
          </View>
          <View style={styles.formatInfo}>
            <Text style={styles.formatLabel}>{format.label}</Text>
            <Text style={styles.formatDescription}>{format.description}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Create & Start Scanning</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formatOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  formatOptionSelected: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  formatCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formatCheckboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#4A90D9',
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  formatDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
