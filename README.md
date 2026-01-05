# Lumeo Music Player 🎵

A beautiful, modern music player built with React and TypeScript that lets you discover and play music from Saavn. Features include search, artist profiles, queue management, and a sleek Spotify-inspired interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- 🔍 **Advanced Search** - Search for songs, albums, artists, and playlists
- 👤 **Artist Profiles** - Spotify-style artist pages with top songs and albums
- 📱 **Fully Responsive** - Optimized for both mobile and desktop with bottom nav
- 🎵 **Audio Player** - Full-featured player with progress bar, seek, volume control
- 📋 **Queue Management** - Add songs to queue with right-click (desktop) or tap menu (mobile)
- 🎨 **Beautiful UI** - Modern design with gradients and smooth animations
- 🔄 **Smart Recommendations** - Discover new music on the home page
- 🌐 **Works Anywhere** - Proxy-based architecture bypasses network restrictions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 All Supported Endpoints

| Endpoint | Method | Description | Implementation |
|----------|---------|-------------|----------------|
| `/search` | GET | General search across all types | ✅ `saavnApi.search()` |
| `/search/songs` | GET | Search songs with pagination | ✅ `saavnApi.searchSongs()` |
| `/search/albums` | GET | Search albums with pagination | ✅ `saavnApi.searchAlbums()` |
| `/search/artists` | GET | Search artists with pagination | ✅ `saavnApi.searchArtists()` |
| `/search/playlists` | GET | Search playlists with pagination | ✅ `saavnApi.searchPlaylists()` |
```bash
# Clone the repository
git clone https://github.com/yourusername/lumeo.git
cd lumeo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 🏗️ Built With

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Saavn API** - Music Data

## 📁 Project Structure

```
lumeo/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # Context providers
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── api/                 # Serverless functions (proxy)
└── public/              # Static assets
```

## 🎯 Key Components

- **SearchSection** - Music search with beautiful card layouts
- **ArtistProfile** - Detailed artist pages with songs and albums
- **NowPlaying** - Audio player with queue management
- **MusicPlayerContext** - Global player state management

## 🔒 Privacy & Restrictions

The app uses a serverless proxy to route API requests through your own domain, making it work even in restricted networks (schools, offices). All traffic is encrypted via HTTPS.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Music data provided by [Saavn API](https://saavn.sumit.co)
- Inspired by Spotify's beautiful interface

---

Made with ❤️


      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
