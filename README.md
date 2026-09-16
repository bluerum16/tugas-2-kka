# Tugas 2: Program Uniformed Search

| | |
|---|---|
| **Nama** | Fazli Irham Ramadhan Abdillah |
| **NRP** | 5025251178 |
| **Kelas** | KKA (A) |

## Deskripsi Tugas

Menulis program dengan bahasa pemrograman Python menggunakan algoritma **Greedy Best First Search** dan **A\*** untuk menyelesaikan soal pada Section 2.

Ketentuan pembagian soal: NRP genap mengerjakan soal nomor 1, NRP ganjil mengerjakan soal nomor 2. NRP 5025251178 berakhiran 8 sehingga termasuk genap, maka soal yang dikerjakan adalah **soal nomor 1, yaitu pencarian rute pada peta Rumania**.

## Ketentuan Program

Program harus menyediakan antar muka agar pengguna dapat:

1. Meng-input-kan sembarang kota asal dan kota tujuan sesuai peta Rumania
2. Memilih algoritma yang dipakai, Greedy BFS atau A\*
3. Melihat rute hasil pencarian beserta cost-nya

## Algoritma

| Algoritma | Fungsi evaluasi | Keterangan |
|---|---|---|
| Greedy Best First Search | `f(n) = h(n)` | Hanya memakai estimasi jarak ke tujuan, cepat tetapi tidak menjamin rute termurah |
| A\* | `f(n) = g(n) + h(n)` | Menggabungkan biaya yang sudah ditempuh dengan estimasi sisa jarak, menghasilkan rute optimal selama heuristiknya admissible |

Heuristik yang dipakai adalah jarak garis lurus (straight line distance) tiap kota menuju Bucharest, sesuai tabel pada soal.

## Data Peta Rumania

Peta terdiri atas **20 kota** dan **23 ruas jalan**. Graf bersifat tak berarah, jadi setiap ruas bisa dilalui dua arah dengan biaya yang sama.

### Biaya antar kota, g(n)

| Kota A | Kota B | Jarak |
|---|---|---:|
| Oradea | Zerind | 71 |
| Oradea | Sibiu | 151 |
| Zerind | Arad | 75 |
| Arad | Sibiu | 140 |
| Arad | Timisoara | 118 |
| Timisoara | Lugoj | 111 |
| Lugoj | Mehadia | 70 |
| Mehadia | Dobreta | 75 |
| Dobreta | Craiova | 120 |
| Craiova | Rimnicu Vilcea | 146 |
| Craiova | Pitesti | 138 |
| Sibiu | Fagaras | 99 |
| Sibiu | Rimnicu Vilcea | 80 |
| Rimnicu Vilcea | Pitesti | 97 |
| Fagaras | Bucharest | 211 |
| Pitesti | Bucharest | 101 |
| Bucharest | Giurgiu | 90 |
| Bucharest | Urziceni | 85 |
| Urziceni | Hirsova | 98 |
| Urziceni | Vaslui | 142 |
| Hirsova | Eforie | 86 |
| Vaslui | Iasi | 92 |
| Iasi | Neamt | 87 |

### Heuristik, h(n)

Jarak garis lurus tiap kota menuju Bucharest:

| Kota | h(n) | Kota | h(n) |
|---|---:|---|---:|
| Arad | 366 | Mehadia | 241 |
| Bucharest | 0 | Neamt | 234 |
| Craiova | 160 | Oradea | 380 |
| Dobreta | 242 | Pitesti | 98 |
| Eforie | 161 | Rimnicu Vilcea | 193 |
| Fagaras | 178 | Sibiu | 253 |
| Giurgiu | 77 | Timisoara | 329 |
| Hirsova | 151 | Urziceni | 80 |
| Iasi | 226 | Vaslui | 199 |
| Lugoj | 244 | Zerind | 374 |

### Catatan penting soal heuristik

Tabel h(n) di atas mengukur jarak menuju **Bucharest saja**. Padahal ketentuan tugas meminta pengguna bisa memasukkan sembarang kota tujuan.

Konsekuensinya, kalau kota tujuan bukan Bucharest, tabel ini tidak lagi mencerminkan sisa jarak ke tujuan sehingga heuristiknya berhenti admissible, dan A\* tidak dijamin menghasilkan rute termurah. Program tetap akan memberi jawaban, tetapi jawaban itu belum tentu optimal.

Program ini memakai tabel tersebut apa adanya sesuai soal, dan menampilkan peringatan ketika kota tujuan bukan Bucharest agar keterbatasannya jelas bagi pengguna.

## Struktur Proyek

```
Tugas2/
├── backend/            API Python
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py     entry point FastAPI, CORS, endpoint /health
│   ├── pyproject.toml  daftar dependensi
│   ├── uv.lock         versi terkunci agar reproducible
│   └── .venv/          virtual environment, tidak ikut di-commit
├── frontend/           antar muka pengguna
└── README.md
```

## Teknologi

| Komponen | Pilihan |
|---|---|
| Bahasa | Python 3.14 |
| Framework API | FastAPI 0.141 |
| Server | Uvicorn 0.53 |
| Manajer paket | uv |

## Cara Menjalankan

### Backend

Pastikan `uv` sudah terpasang, lalu jalankan dari folder `backend`:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Server berjalan di `http://127.0.0.1:8000`. Dokumentasi interaktif tersedia di `http://127.0.0.1:8000/docs`, sehingga endpoint bisa dicoba langsung tanpa frontend.

Kalau lebih suka mengaktifkan virtual environment secara manual:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

## Status Pengerjaan

- [x] Setup proyek Python dan FastAPI
- [x] Endpoint `/health` untuk mengecek server hidup
- [ ] Representasi graf peta Rumania dan tabel heuristik
- [ ] Implementasi Greedy Best First Search
- [ ] Implementasi A\*
- [ ] Endpoint pencarian rute
- [ ] Antar muka pengguna di frontend
