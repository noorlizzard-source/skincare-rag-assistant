import os
import json
import csv
import markdown
from typing import List, Dict, Any
from pypdf import PdfReader

class DocumentIngestor:
    """Parses various file types (PDF, TXT, Markdown, CSV, JSON) into standard text documents with metadata."""

    @staticmethod
    def parse_file(file_path: str, filename: str) -> List[Dict[str, Any]]:
        ext = os.path.splitext(filename)[1].lower()
        if ext == '.pdf':
            return DocumentIngestor.parse_pdf(file_path, filename)
        elif ext == '.txt':
            return DocumentIngestor.parse_txt(file_path, filename)
        elif ext in ['.md', '.markdown']:
            return DocumentIngestor.parse_markdown(file_path, filename)
        elif ext == '.csv':
            return DocumentIngestor.parse_csv(file_path, filename)
        elif ext == '.json':
            return DocumentIngestor.parse_json(file_path, filename)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @staticmethod
    def parse_pdf(file_path: str, filename: str) -> List[Dict[str, Any]]:
        reader = PdfReader(file_path)
        documents = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                documents.append({
                    "text": text.strip(),
                    "metadata": {
                        "source": filename,
                        "title": filename,
                        "page": i + 1,
                        "file_type": "pdf"
                    }
                })
        return documents

    @staticmethod
    def parse_txt(file_path: str, filename: str) -> List[Dict[str, Any]]:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        return [{
            "text": content.strip(),
            "metadata": {
                "source": filename,
                "title": filename,
                "file_type": "txt"
            }
        }]

    @staticmethod
    def parse_markdown(file_path: str, filename: str) -> List[Dict[str, Any]]:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        return [{
            "text": content.strip(),
            "metadata": {
                "source": filename,
                "title": filename,
                "file_type": "markdown"
            }
        }]

    @staticmethod
    def parse_csv(file_path: str, filename: str) -> List[Dict[str, Any]]:
        documents = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                row_str = ", ".join([f"{k}: {v}" for k, v in row.items() if v])
                documents.append({
                    "text": row_str,
                    "metadata": {
                        "source": filename,
                        "title": f"{filename} - Row {i+1}",
                        "file_type": "csv",
                        **{k: v for k, v in row.items() if isinstance(v, (str, int, float))}
                    }
                })
        return documents

    @staticmethod
    def parse_json(file_path: str, filename: str) -> List[Dict[str, Any]]:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        
        documents = []
        if isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, dict):
                    # Extract structured fields for skincare metadata if present
                    text_parts = []
                    for k, v in item.items():
                        if isinstance(v, list):
                            text_parts.append(f"{k.capitalize()}: {', '.join(map(str, v))}")
                        else:
                            text_parts.append(f"{k.capitalize()}: {v}")
                    
                    doc_text = "\n".join(text_parts)
                    meta = {
                        "source": item.get("source", filename),
                        "title": item.get("product") or item.get("ingredient") or f"{filename} - Entry {i+1}",
                        "brand": item.get("brand", ""),
                        "category": item.get("category", ""),
                        "file_type": "json"
                    }
                    if "skin_types" in item:
                        meta["skin_types"] = item["skin_types"]
                    if "concerns" in item:
                        meta["concerns"] = item["concerns"]
                        
                    documents.append({
                        "text": doc_text,
                        "metadata": meta
                    })
        elif isinstance(data, dict):
            documents.append({
                "text": json.dumps(data, indent=2),
                "metadata": {"source": filename, "title": filename, "file_type": "json"}
            })
        return documents
