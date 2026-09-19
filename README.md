# Tugas 2: Program Uniformed Search

| | |
|---|---|
| **Nama** | Fazli Irham Ramadhan Abdillah |
| **NRP** | 5025251178 |
| **Kelas** | KKA (A) |

## Soal

Menulis program Python dengan algoritma **Greedy Best First Search** dan **A\*** untuk menyelesaikan soal peta rumania.

NRP genap mengerjakan soal nomor 1, NRP ganjil soal nomor 2. NRP 5025251178 berakhiran 8 sehingga genap, jadi yang dikerjakan adalah **soal nomor 1, pencarian rute pada peta Rumania**.

Program harus menyediakan antar muka agar pengguna dapat:

1. Meng-input-kan sembarang kota asal dan kota tujuan sesuai peta Rumania
2. Memilih algoritma yang dipakai, Greedy BFS atau A\*
3. Melihat rute hasil pencarian beserta cost-nya

## Isi Program

| Algoritma | Fungsi evaluasi |
|---|---|
| Greedy Best First Search | `f(n) = h(n)` |
| A\* | `f(n) = g(n) + h(n)` |

Petanya 20 kota dan 23 ruas jalan, tak berarah, sesuai data pada soal.

Tabel h(n) pada soal tidak dipakai karena tabel itu hanya mengukur jarak menuju Bucharest, padahal asal dan tujuan bebas dipilih. Sebagai gantinya h(n) dihitung dari koordinat kota sebagai jarak Euclidean:

```
h(n) = akar((x1 - x2)^2 + (y1 - y2)^2)
```

Jarak garis lurus tidak mungkin lebih panjang daripada jalan sesungguhnya, jadi h(n) ini admissible sekaligus konsisten untuk kota tujuan mana pun dan rute hasil A\* dijamin termurah.

Cara ini mengikuti AIMA, yang di `GraphProblem.h` juga menarik garis lurus antar koordinat kota dan tidak memakai tabel jarak pada gambar buku.

## Sumber Data

Daftar ruas dan koordinat kota disalin dari implementasi resmi AIMA, bukan diukur ulang:

> Russell, S. dan Norvig, P. *Artificial Intelligence: A Modern Approach*.
> Kode: [aimacode/aima-python](https://github.com/aimacode/aima-python), berkas `aima/search.py`, yaitu `romania_map` untuk 23 ruas jalan dan `romania_map.locations` untuk koordinat 20 kota.

Satu penyesuaian, AIMA mengeja `Drobeta` dan `Rimnicu` sedangkan program ini memakai ejaan slide kuliah, yaitu `Dobreta` dan `Rimnicu Vilcea`.


## Cara Menjalankan

Syaratnya hanya Python 3.12 atau lebih baru.

**macOS dan Linux**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Windows**

```bat
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Kalau folder `.venv` sudah ada dan isinya `bin/` bukan `Scripts/`, itu venv bawaan macOS yang ikut terbawa waktu folder dipindah. Venv tidak bisa dipindah antar komputer karena menyimpan jalur absolut ke interpreternya. Hapus dulu dengan `rmdir /s /q .venv`, baru jalankan perintah di atas.

Lalu buka **`http://127.0.0.1:8000`** di browser. Halaman antar mukanya disajikan oleh server yang sama, jadi tidak perlu menjalankan apa pun lagi. Dokumentasi API ada di `http://127.0.0.1:8000/docs`.

## Deploy ke Vercel

Berkas `main.py` dan `pyproject.toml` di akar repo hanya dipakai Vercel. Keduanya menunjuk aplikasi FastAPI di `backend/app/main.py` dan tidak memengaruhi cara menjalankan program di komputer sendiri.

Yang penting, **Root Directory proyek Vercel harus akar repo, bukan `backend/`**. Kalau diarahkan ke `backend/`, folder `frontend/` tidak ikut terbundel sehingga halamannya menjawab `{"detail": "Not Found"}` sementara API-nya tetap jalan normal.

Uvicorn sengaja tidak dicantumkan di `pyproject.toml` akar karena Vercel sendiri yang menjalankan ASGI-nya. Setelan `[tool.vercel.fastapi.static]` dengan `cdn = true` membuat berkas frontend tetap disajikan lewat CDN meskipun aplikasinya memakai `CORSMiddleware`.
