from fastapi import FastAPI, HTTPException
from typing import List
import json
import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(APP_DIR, "..", "languages.json")

with open(DATA_PATH) as f:
    languages = json.load(f)

app = FastAPI(title="Languages API", version="0.1.0")


@app.get("/api/v1/languages", response_model=List[dict])
def list_languages():
    return languages


# Must be registered before /{language_id}, which would otherwise capture "search".
@app.get("/api/v1/languages/search", response_model=List[dict])
def search_languages(name: str = ""):
    name_lower = name.lower()
    return [l for l in languages if name_lower in l["name"].lower()]


@app.get("/api/v1/languages/{language_id}")
def get_language(language_id: str):
    for lang in languages:
        if lang["id"] == language_id:
            return lang
    raise HTTPException(status_code=404, detail="Language not found")
