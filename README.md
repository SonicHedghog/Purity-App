# Virtufy Books

A React Native (Expo) app that digitizes physical books into multiple digital formats. Everything runs locally on the user's device - no cloud services required.

## Features

- **Create Virtufy Books** - Enter basic book information (title, author, description)
- **Format Selection** - Choose output formats: PDF, EPUB, Plain Text, Audiobook (all selected by default)
- **Camera Scanning** - Take pictures of physical book pages with a guided camera interface
- **Pause & Resume** - Stop scanning at any time and continue later
- **Background OCR** - Text recognition starts automatically as pages are captured
- **Text Correction** - Review and edit extracted text for any misinterpretations
- **Retake Pages** - Re-photograph pages that didn't scan well
- **Export & Share** - Generate files in selected formats and share them
- **Audiobook Playback** - Listen to your book via on-device text-to-speech

## Tech Stack

- **React Native** with **Expo SDK 56**
- **TypeScript** for type safety
- **expo-camera** - Page photography
- **expo-sqlite** - Local database for books/pages metadata
- **expo-file-system** - Local file storage for images and exports
- **expo-speech** - On-device text-to-speech for audiobook playback
- **React Navigation** - Screen navigation
- **ESLint + Prettier** - Code quality and formatting
- **Jest** - Unit testing
- **GitHub Actions** - CI pipeline

## Project Structure

```
src/
├── __tests__/          # Unit tests
├── __mocks__/          # Jest mocks
├── components/         # Reusable UI components
├── database/           # SQLite database layer
├── navigation/         # React Navigation setup
├── screens/            # App screens
│   ├── HomeScreen.tsx        # List all books
│   ├── NewBookScreen.tsx     # Create new book with format selection
│   ├── CameraScreen.tsx      # Capture book pages
│   ├── BookDetailScreen.tsx  # View/manage a book
│   └── PageEditorScreen.tsx  # Edit OCR text, retake photos
├── services/           # Business logic
│   ├── ocrService.ts         # Background OCR processing queue
│   └── exportService.ts      # Format conversion & audiobook
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator / Android Emulator or physical device with Expo Go

### Installation

```bash
# Clone the repository
git clone https://github.com/SonicHedghog/Purity-App.git
cd Purity-App

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running on Device

1. Install **Expo Go** on your iOS or Android device
2. Run `npx expo start`
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

### Development Build (for full camera access)

```bash
# Create a development build
npx expo run:ios
# or
npx expo run:android
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start web version |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |

## Architecture

### Data Flow

1. User creates a book with title, author, and format preferences
2. Camera screen captures page images, stored locally via expo-file-system
3. Each captured page is added to the OCR processing queue
4. OCR runs in the background, extracting text from images
5. User can review/correct extracted text in the page editor
6. Export service generates files in selected formats
7. Audiobook uses expo-speech for on-device TTS playback

### Local Storage

- **SQLite** (`expo-sqlite`) stores book metadata, page info, and export records
- **File System** (`expo-file-system`) stores captured images and generated export files
- All data stays on-device; no network requests required

## OCR Integration

The app includes an OCR service architecture with a background processing queue. The current implementation provides a placeholder for the OCR engine. To integrate a real OCR engine:

1. Install `@react-native-ml-kit/text-recognition` or similar
2. Update `src/services/ocrService.ts` `performOCR()` function
3. The queue system and database updates are already wired up

## License

MIT
