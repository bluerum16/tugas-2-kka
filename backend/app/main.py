"""Entry point FastAPI untuk Tugas 2 KKA.

Menyediakan API pencarian rute dengan algoritma Greedy Best First Search
dan A*. Implementasi algoritmanya menyusul di paket app/algorithms.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="KKA Tugas 2",
    description="API pencarian dengan Greedy BFS dan A*",
    version="0.1.0",
)

# Frontend dijalankan di port terpisah waktu development, jadi origin-nya
# harus diizinkan eksplisit. Daftar ini dipersempit sebelum dikumpulkan.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Dipakai untuk memastikan server hidup."""
    return {"status": "ok"}
