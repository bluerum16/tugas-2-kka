from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import algorithm

app = FastAPI(
    title="KKA Tugas 2",
    description="API pencarian rute peta Rumania dengan Greedy BFS dan A*",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NAMA_ALGORITMA = {
    "greedy": "Greedy Best First Search",
    "astar": "A*",
}


@app.get("/health")
def cek_server() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/kota")
def daftar_kota() -> dict:
    return {
        "kota": sorted(algorithm.GRAF),
        "graf": algorithm.GRAF,
        "koordinat": algorithm.KOORDINAT,
    }


def _jalankan(asal: str, tujuan: str, algoritma: str) -> dict:
    for kota in (asal, tujuan):
        if kota not in algorithm.GRAF:
            raise HTTPException(
                status_code=404, detail=f"Kota '{kota}' tidak ada di peta Rumania."
            )
    if algoritma not in NAMA_ALGORITMA:
        raise HTTPException(
            status_code=400,
            detail=f"Algoritma '{algoritma}' tidak dikenal. Pilihan: astar, greedy.",
        )

    cari = algorithm.greedy_bfs if algoritma == "greedy" else algorithm.a_star
    rute, biaya, diperluas = cari(algorithm.GRAF, algorithm.KOORDINAT, asal, tujuan)
    return {
        "algoritma": NAMA_ALGORITMA[algoritma],
        "asal": asal,
        "tujuan": tujuan,
        "ditemukan": rute is not None,
        "rute": rute or [],
        "biaya": biaya or 0,
        "urutan_ekspansi": diperluas,
    }


@app.get("/api/cari")
def cari(
    asal: str = Query(description="Kota asal"),
    tujuan: str = Query(description="Kota tujuan"),
    algoritma: str = Query(default="astar", description="greedy atau astar"),
) -> dict:
    return _jalankan(asal, tujuan, algoritma)


@app.get("/api/bandingkan")
def bandingkan(
    asal: str = Query(description="Kota asal"),
    tujuan: str = Query(description="Kota tujuan"),
) -> dict:
    return {
        "greedy": _jalankan(asal, tujuan, "greedy"),
        "astar": _jalankan(asal, tujuan, "astar"),
    }


FOLDER_FRONTEND = Path(__file__).resolve().parents[2] / "frontend"
if FOLDER_FRONTEND.is_dir():
    app.mount("/", StaticFiles(directory=FOLDER_FRONTEND, html=True), name="frontend")
