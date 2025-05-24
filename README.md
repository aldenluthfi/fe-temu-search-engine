# TəmuSəarch

A modern search engine web app built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/). Features include tag filtering, LLM-enhanced search, and a clean UI powered by Tailwind CSS.

## Features

- Fast, responsive search UI
- Tag-based filtering
- LLM (Large Language Model) enhanced search and summaries
- Modern React + TypeScript codebase
- Tailwind CSS styling

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd fe-temu-search-engine
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:

```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

To build for production:

```sh
npm run build
# or
yarn build
```

### Preview Production Build

```sh
npm run preview
# or
yarn preview
```

## Project Structure

- `src/` - Main source code (pages, components, etc.)
- `public/` - Static assets
- `index.html` - Main HTML entry point
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## API

The app fetches search results from:

- `http://api.temusearch.nabilmuafa.com/search`
- `http://api.temusearch.nabilmuafa.com/llm/enhanced-search`

## License

MIT
