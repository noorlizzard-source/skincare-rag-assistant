import numpy as np
import re
from typing import List
from collections import Counter
import math

class EmbeddingEngine:
    """Generates numerical vector embeddings for text chunks and queries.
    Uses an intelligent sub-word & n-gram TF-IDF normalized vectorizer by default,
    ensuring lightweight local execution with high precision for domain terms."""

    def __init__(self, vector_dim: int = 384):
        self.vector_dim = vector_dim
        self.vocabulary = {}
        self.idf = {}
        self.is_fitted = False

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        words = re.findall(r'\b[a-z0-9\%\-\+]+\b', text)
        tokens = []
        for word in words:
            tokens.append(word)
            # Add character 3-grams for domain terms (e.g. niacinamide, salicylic)
            if len(word) >= 4:
                for i in range(len(word) - 3 + 1):
                    tokens.append(f"gram:{word[i:i+3]}")
        return tokens

    def fit(self, corpus: List[str]):
        """Fits the vocabulary and inverse document frequency mapping on the corpus."""
        doc_count = len(corpus)
        if doc_count == 0:
            return

        doc_freqs = Counter()
        all_tokens = set()

        for doc in corpus:
            tokens = set(self._tokenize(doc))
            for t in tokens:
                doc_freqs[t] += 1
                all_tokens.add(t)

        # Select top vector_dim tokens by frequency
        most_common = doc_freqs.most_common(self.vector_dim)
        self.vocabulary = {token: i for i, (token, _) in enumerate(most_common)}
        self.idf = {token: math.log((doc_count + 1) / (freq + 1)) + 1.0 for token, freq in doc_freqs.items()}
        self.is_fitted = True

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a normalized vector."""
        vec = np.zeros(self.vector_dim, dtype=np.float32)
        tokens = self._tokenize(text)
        if not tokens:
            return vec.tolist()

        counts = Counter(tokens)
        for token, count in counts.items():
            if token in self.vocabulary:
                idx = self.vocabulary[token]
                tf = 1 + math.log(count)
                idf_val = self.idf.get(token, 1.0)
                vec[idx] = tf * idf_val

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not self.is_fitted:
            self.fit(texts)
        return [self.embed_text(t) for t in texts]
