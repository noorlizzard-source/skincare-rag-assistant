import re
import uuid
from typing import List, Dict, Any

class TextSplitter:
    """Splits text documents into meaningful, overlapping chunks for embedding and vector storage."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_document(self, doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        text = doc["text"]
        base_metadata = doc.get("metadata", {})
        
        # Clean text
        text = self.clean_text(text)
        
        # Split by sections if markdown or headings exist
        sections = re.split(r'\n(?=#{1,4}\s+|\n---)', text)
        
        chunks = []
        chunk_idx = 0

        for section in sections:
            section = section.strip()
            if not section:
                continue
            
            if len(section) <= self.chunk_size:
                chunks.append({
                    "chunk_id": f"{base_metadata.get('source', 'doc')}_{chunk_idx}_{str(uuid.uuid4())[:8]}",
                    "text": section,
                    "metadata": {
                        **base_metadata,
                        "chunk_index": chunk_idx
                    }
                })
                chunk_idx += 1
            else:
                # Sub-chunk longer sections by paragraph/sentence sliding window
                paragraphs = section.split('\n\n')
                current_chunk = ""
                
                for para in paragraphs:
                    if len(current_chunk) + len(para) + 2 <= self.chunk_size:
                        current_chunk += ("\n\n" if current_chunk else "") + para
                    else:
                        if current_chunk:
                            chunks.append({
                                "chunk_id": f"{base_metadata.get('source', 'doc')}_{chunk_idx}_{str(uuid.uuid4())[:8]}",
                                "text": current_chunk,
                                "metadata": {
                                    **base_metadata,
                                    "chunk_index": chunk_idx
                                }
                            })
                            chunk_idx += 1
                        current_chunk = para
                
                if current_chunk:
                    chunks.append({
                        "chunk_id": f"{base_metadata.get('source', 'doc')}_{chunk_idx}_{str(uuid.uuid4())[:8]}",
                        "text": current_chunk,
                        "metadata": {
                            **base_metadata,
                            "chunk_index": chunk_idx
                        }
                    })
                    chunk_idx += 1

        return chunks

    def clean_text(self, text: str) -> str:
        # Normalize whitespace while preserving line breaks for headers
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
