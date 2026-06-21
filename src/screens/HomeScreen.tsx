import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Book } from '../types';
import { getAllBooks, deleteBook } from '../database';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  async function loadBooks() {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteBook(book: Book) {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(book.id);
            loadBooks();
          },
        },
      ]
    );
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'scanning': return '#4A90D9';
      case 'processing': return '#F5A623';
      case 'completed': return '#7ED321';
      case 'paused': return '#9B9B9B';
      default: return '#9B9B9B';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'scanning': return 'Scanning';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return status;
    }
  }

  function renderBook({ item }: { item: Book }) {
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
        onLongPress={() => handleDeleteBook(item)}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          {item.author ? <Text style={styles.bookAuthor}>by {item.author}</Text> : null}
          <Text style={styles.bookPages}>
            {item.totalPages} page{item.totalPages !== 1 ? 's' : ''} captured
            {item.processedPages > 0 ? ` (${item.processedPages} processed)` : ''}
          </Text>
          <View style={styles.formatRow}>
            {item.formats.map(format => (
              <View key={format} style={styles.formatBadge}>
                <Text style={styles.formatText}>{format.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {books.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Books Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the button below to digitize your first book
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadBooks}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewBook')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookPages: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  formatBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4A90D9',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
