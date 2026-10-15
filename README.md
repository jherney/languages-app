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

## Running

Build the frontend once, then start the server:

```bash
cd frontend && npm run build && cd ..   # type-checks, then builds into frontend/dist
./runner.sh
```

Open http://localhost:8000. The backend serves both the app and the API. Rebuild after changing the frontend, and restart the server after changing the backend or `languages.json`.

If `frontend/dist` doesn't exist, the backend serves only the API, and http://localhost:8000/ returns `{"detail":"Not Found"}`.

To run with multiple workers, use gunicorn from `backend/`:

```bash
cd backend
gunicorn -c gunicorn_config.py app:app
```

## Frontend development

For live reloading while editing the frontend, keep `./runner.sh` running and start Vite in a second terminal:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints: http://localhost:5173, or the next free port if 5173 is taken. Vite forwards `/api` requests to the backend on port 8000.

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
backend/            FastAPI app (app.py): API + built frontend; gunicorn config
frontend/           React + Vite + Tailwind app
  src/App.tsx       Cards and filters
  src/index.css     Tailwind import and custom styles
languages.json      Language data
runner.sh           Starts the server on 127.0.0.1:8000
```
