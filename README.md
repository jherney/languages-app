# Languages Wiki

A small catalog of programming languages. It's a FastAPI backend serving the data in `languages.json` and a React + Vite frontend, styled with Tailwind, that shows each language as a card you can filter by paradigm, garbage collection and concurrency model.

## Requirements

- Python 3 with the packages in `requirements.txt`
- Node.js 20.19+ or 22.12+ (Vite 8 needs this)

## Setup

```bash
pip install -r requirements.txt
cd frontend && npm install
```

## Running in development

Start the API (port 8000):

```bash
./runner.sh
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints: http://localhost:5173, or the next free port if 5173 is taken. The Vite dev server forwards `/api` requests to the backend on port 8000. Port 8000 serves only the API, so http://localhost:8000/ itself returns `{"detail":"Not Found"}`.

## Building

```bash
cd frontend
npm run build     # type-checks, then builds into frontend/dist
npm run preview   # serves the build on port 4173, also proxying /api
```

To run the API with multiple workers, use gunicorn from `backend/`:

```bash
cd backend
gunicorn -c gunicorn_config.py app:app
```

The backend serves only the API. Neither part serves `frontend/dist` in production, so put a web server such as nginx in front: serve the built files, and proxy `/api` to port 8000.

## API

| Endpoint | Returns |
|---|---|
| `GET /api/v1/languages` | All languages |
| `GET /api/v1/languages/search?name=<text>` | Languages whose name contains `<text>` (case-insensitive) |
| `GET /api/v1/languages/{id}` | One language by id, or 404 |

Interactive API docs are at http://localhost:8000/docs while the backend is running.

## Data

`languages.json` is the only data store. Each entry looks like this:

```json
{
  "id": "rust",
  "name": "Rust",
  "paradigm": "systems",
  "year": 2010,
  "creator": "Graydon Hoare",
  "typing": "static",
  "gc": "none",
  "concurrency": "async/await, threads",
  "logo": "https://..."
}
```

`concurrency` is a comma-separated list, and each item becomes its own filter option. The filter options come from the data, so new values show up automatically. The backend reads the file at startup, so restart it after editing.

## Layout

```
backend/            FastAPI app (app.py) and gunicorn config
frontend/           React + Vite + Tailwind app
  src/App.tsx       Cards and filters
  src/index.css     Tailwind import and custom styles
languages.json      Language data
runner.sh           Starts the API on 127.0.0.1:8000
```
