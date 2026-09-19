const ALAMAT_BACKEND = "http://127.0.0.1:8000";
let alamatApi = location.protocol.startsWith("http") ? "" : ALAMAT_BACKEND;

const form = document.getElementById("form-cari");
const pilihanAsal = document.getElementById("asal");
const pilihanTujuan = document.getElementById("tujuan");
const pilihanAlgoritma = document.getElementById("algoritma");
const tombolTukar = document.getElementById("tukar");
const tombol = document.getElementById("tombol-cari");
const kotakPesan = document.getElementById("pesan");
const kotakHasil = document.getElementById("hasil");
const kotakPeta = document.getElementById("peta");
const balon = document.getElementById("balon");
const isyarat = document.getElementById("isyarat");
const panelLangkah = document.getElementById("langkah");
const geser = document.getElementById("langkah-geser");
const tekstLangkah = document.getElementById("langkah-teks");
const tombolAwal = document.getElementById("langkah-awal");
const tombolMain = document.getElementById("langkah-main");
const tombolMaju = document.getElementById("langkah-maju");
const labelMain = document.getElementById("label-main");

const JARAK_TEPI = 48;
const JEDA_LANGKAH = 620;

let peta = null;
let tampilan = { lapis: [], diperluas: [], kini: null };
let telusur = null;
let jamTayang = null;
let menungguTujuan = false;

function tampilkanPesan(teks) {
  kotakPesan.textContent = teks;
  kotakPesan.classList.remove("tersembunyi");
}

function sembunyikanPesan() {
  kotakPesan.classList.add("tersembunyi");
}

function buat(tag, kelas, teks) {
  const elemen = document.createElement(tag);
  if (kelas) elemen.className = kelas;
  if (teks !== undefined) elemen.textContent = teks;
  return elemen;
}

function buatSvg(tag, sifat) {
  const elemen = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [nama, nilai] of Object.entries(sifat)) {
    elemen.setAttribute(nama, nilai);
  }
  return elemen;
}

async function minta(alamat) {
  const jawaban = await fetch(alamat);
  const isi = await jawaban.json().catch(() => null);
  if (!jawaban.ok) {
    throw new Error(isi && isi.detail ? isi.detail : `Server menjawab ${jawaban.status}.`);
  }
  return isi;
}

async function ambilJson(jalur) {
  try {
    return await minta(alamatApi + jalur);
  } catch (galat) {
    if (alamatApi !== "") throw galat;
    alamatApi = ALAMAT_BACKEND;
    return minta(alamatApi + jalur);
  }
}

function bingkai() {
  const titik = Object.values(peta.koordinat);
  const semuaX = titik.map((t) => t[0]);
  const semuaY = titik.map((t) => t[1]);
  const minX = Math.min(...semuaX);
  const maxX = Math.max(...semuaX);
  const minY = Math.min(...semuaY);
  const maxY = Math.max(...semuaY);
  return {
    minX,
    maxY,
    tengahX: (minX + maxX) / 2,
    lebar: maxX - minX + JARAK_TEPI * 2,
    tinggi: maxY - minY + JARAK_TEPI * 2,
  };
}

function titikLayar(kota, b) {
  const [x, y] = peta.koordinat[kota];
  return [x - b.minX + JARAK_TEPI, b.maxY - y + JARAK_TEPI];
}

function ruasRute(rute) {
  const kumpulan = new Set();
  for (let i = 0; i < rute.length - 1; i += 1) {
    kumpulan.add([rute[i], rute[i + 1]].sort().join("|"));
  }
  return kumpulan;
}

function jarakEuclidean(a, b) {
  const [x1, y1] = peta.koordinat[a];
  const [x2, y2] = peta.koordinat[b];
  return Math.round(Math.hypot(x1 - x2, y1 - y2));
}

function gambarPeta() {
  if (!peta) return;
  const b = bingkai();
  const svg = buatSvg("svg", {
    viewBox: `0 0 ${b.lebar} ${b.tinggi}`,
    role: "img",
    "aria-label": "Peta Rumania dengan 20 kota dan 23 ruas jalan",
  });

  const sudahDigambar = new Set();
  const garisRuas = new Map();
  for (const [kota, tetangga] of Object.entries(peta.graf)) {
    for (const [lain, jarak] of Object.entries(tetangga)) {
      const kunci = [kota, lain].sort().join("|");
      if (sudahDigambar.has(kunci)) continue;
      sudahDigambar.add(kunci);

      const [x1, y1] = titikLayar(kota, b);
      const [x2, y2] = titikLayar(lain, b);
      const garis = buatSvg("line", { class: "ruas", x1, y1, x2, y2 });
      garisRuas.set(kunci, garis);
      svg.append(garis);

      const panjang = Math.hypot(x2 - x1, y2 - y1) || 1;
      const label = buatSvg("text", {
        class: "biaya-ruas",
        x: (x1 + x2) / 2 + (-(y2 - y1) / panjang) * 9,
        y: (y1 + y2) / 2 + ((x2 - x1) / panjang) * 9,
      });
      label.textContent = jarak;
      svg.append(label);
    }
  }

  for (const lapis of tampilan.lapis) {
    for (const kunci of ruasRute(lapis.rute)) {
      const [kota, lain] = kunci.split("|");
      const [x1, y1] = titikLayar(kota, b);
      const [x2, y2] = titikLayar(lain, b);
      svg.append(buatSvg("line", { class: `ruas-sorot ${lapis.kelas}`, x1, y1, x2, y2 }));
    }
  }

  const dilewati = new Set(tampilan.lapis.flatMap((l) => l.rute));
  const ujung = new Set(
    tampilan.lapis.flatMap((l) => (l.rute.length ? [l.rute[0], l.rute.at(-1)] : [])),
  );
  const urutan = new Map(tampilan.diperluas.map((kota, i) => [kota, i + 1]));

  for (const kota of Object.keys(peta.graf)) {
    const [x, y] = titikLayar(kota, b);
    const kait = buatSvg("g", {
      class: "simpul-kait",
      tabindex: "0",
      role: "button",
      "aria-label": `Pilih ${kota}`,
    });

    let kelas = "simpul";
    let jari = 4.5;
    if (kota === tampilan.kini) {
      kelas += " simpul-kini";
      jari = 6.5;
    } else if (ujung.has(kota)) {
      kelas += " simpul-ujung";
      jari = 7;
    } else if (dilewati.has(kota)) {
      kelas += " simpul-lewat";
    } else if (urutan.has(kota)) {
      kelas += " simpul-diperluas";
      jari = 5.5;
    }

    kait.append(buatSvg("circle", { class: "sasaran", cx: x, cy: y, r: 15 }));
    kait.append(buatSvg("circle", { class: kelas, cx: x, cy: y, r: jari }));

    if (urutan.has(kota) && !ujung.has(kota) && kota !== tampilan.kini) {
      const nomor = buatSvg("text", { class: "urut", x: x + 10, y: y - 9 });
      nomor.textContent = urutan.get(kota);
      kait.append(nomor);
    }

    const keKiri = peta.koordinat[kota][0] > b.tengahX;
    const jarakLabel = jari + 7;
    const aktif = dilewati.has(kota) || urutan.has(kota) || kota === tampilan.kini;
    const label = buatSvg("text", {
      class: aktif ? "nama-kota nama-aktif" : "nama-kota",
      x: x + (keKiri ? -jarakLabel : jarakLabel),
      y,
      "text-anchor": keKiri ? "end" : "start",
    });
    label.textContent = kota;
    kait.append(label);

    kait.addEventListener("click", () => pilihKota(kota));
    kait.addEventListener("keydown", (p) => {
      if (p.key === "Enter" || p.key === " ") {
        p.preventDefault();
        pilihKota(kota);
      }
    });
    kait.addEventListener("pointerenter", () => sorotTetangga(kota, garisRuas, true));
    kait.addEventListener("pointerleave", () => sorotTetangga(kota, garisRuas, false));
    kait.addEventListener("focus", () => sorotTetangga(kota, garisRuas, true));
    kait.addEventListener("blur", () => sorotTetangga(kota, garisRuas, false));

    svg.append(kait);
  }

  kotakPeta.replaceChildren(svg);
}

function sorotTetangga(kota, garisRuas, nyala) {
  for (const lain of Object.keys(peta.graf[kota])) {
    const garis = garisRuas.get([kota, lain].sort().join("|"));
    if (garis) garis.setAttribute("class", nyala ? "ruas-tetangga" : "ruas");
  }
  if (!nyala) {
    balon.classList.add("tersembunyi");
    return;
  }
  const tujuan = pilihanTujuan.value;
  const derajat = Object.keys(peta.graf[kota]).length;
  balon.replaceChildren(
    buat("b", null, kota),
    buat("span", null, `h(n) ke ${tujuan} = ${jarakEuclidean(kota, tujuan)}`),
    buat("span", null, `${derajat} ruas bersambung`),
  );

  const b = bingkai();
  const [x, y] = titikLayar(kota, b);
  balon.style.left = `${(x / b.lebar) * 100}%`;
  balon.style.top = `${(y / b.tinggi) * 100}%`;
  balon.classList.remove("tersembunyi");
}

function pilihKota(kota) {
  if (!menungguTujuan) {
    pilihanAsal.value = kota;
    if (pilihanTujuan.value === kota) {
      pilihanTujuan.value = Object.keys(peta.graf).find((k) => k !== kota);
    }
    menungguTujuan = true;
    isyarat.textContent = `Asal ${kota}. Sekarang klik kota tujuannya.`;
    tampilan = { lapis: [], diperluas: [], kini: null };
    hentikanTayang();
    panelLangkah.classList.add("tersembunyi");
    kotakHasil.replaceChildren();
    gambarPeta();
    return;
  }
  if (kota === pilihanAsal.value) return;
  pilihanTujuan.value = kota;
  menungguTujuan = false;
  isyarat.textContent = "Klik kota mana pun di peta untuk memilih asal, lalu klik satu lagi untuk tujuan.";
  form.requestSubmit();
}

function gambarRute(rute) {
  const wadah = buat("div", "rute");
  rute.forEach((kota, urutan) => {
    if (urutan > 0) wadah.append(buat("span", "panah", "→"));
    wadah.append(buat("span", "kota", kota));
  });
  return wadah;
}

function gambarAngka(hasil) {
  const wadah = buat("div", "angka");
  const isi = [
    ["Total biaya", String(hasil.biaya)],
    ["Kota dilewati", String(hasil.rute.length)],
    ["Simpul diperluas", String(hasil.urutan_ekspansi.length)],
  ];
  for (const [nama, nilai] of isi) {
    const kolom = buat("div");
    kolom.append(buat("span", null, nama), buat("strong", null, nilai));
    wadah.append(kolom);
  }
  return wadah;
}

function gambarHasil(hasil, greedy) {
  const kartu = buat("article", greedy ? "kartu kartu-greedy" : "kartu");
  kartu.append(
    buat("h3", null, hasil.algoritma),
    buat("p", "kartu-rumus", greedy ? "f(n) = h(n)" : "f(n) = g(n) + h(n)"),
  );
  if (!hasil.ditemukan) {
    kartu.append(buat("p", null, `Tidak ada rute dari ${hasil.asal} ke ${hasil.tujuan}.`));
    return kartu;
  }
  kartu.append(gambarRute(hasil.rute), gambarAngka(hasil));
  return kartu;
}

function gambarRingkas(greedy, astar) {
  const selisih = greedy.biaya - astar.biaya;
  const teks =
    selisih > 0
      ? `A* menemukan rute ${selisih} lebih murah daripada Greedy, yaitu ${astar.biaya} lawan ${greedy.biaya}. Greedy memperluas ${greedy.urutan_ekspansi.length} simpul dan A* ${astar.urutan_ekspansi.length}.`
      : `Kedua algoritma menghasilkan biaya sama, yaitu ${astar.biaya}. Greedy memperluas ${greedy.urutan_ekspansi.length} simpul dan A* ${astar.urutan_ekspansi.length}.`;
  const kotak = buat("div", "ringkas");
  kotak.append(buat("p", null, teks), gambarKeterangan());
  return kotak;
}

function gambarKeterangan() {
  const wadah = buat("div", "keterangan-peta");
  for (const [kelas, teks] of [
    ["jalur-astar", "Rute A*"],
    ["jalur-greedy", "Rute Greedy BFS"],
  ]) {
    const butir = buat("span", "butir-keterangan");
    butir.append(buat("i", kelas), buat("span", null, teks));
    wadah.append(butir);
  }
  return wadah;
}

function hentikanTayang() {
  if (jamTayang) {
    clearInterval(jamTayang);
    jamTayang = null;
  }
  labelMain.textContent = "Putar";
  tombolMain.setAttribute("aria-label", "Jalankan animasi");
}

function pasangLangkah(hasil) {
  telusur = hasil;
  geser.max = hasil.urutan_ekspansi.length;
  panelLangkah.classList.remove("tersembunyi");
  keLangkah(hasil.urutan_ekspansi.length);
}

function keLangkah(nilai) {
  if (!telusur) return;
  const total = telusur.urutan_ekspansi.length;
  const k = Math.max(0, Math.min(total, nilai));
  geser.value = k;

  tampilan = {
    lapis: k === total && telusur.ditemukan ? [{ rute: telusur.rute, kelas: "jalur-astar" }] : [],
    diperluas: telusur.urutan_ekspansi.slice(0, k),
    kini: k > 0 && k < total ? telusur.urutan_ekspansi[k - 1] : null,
  };

  if (k === 0) {
    tekstLangkah.textContent = "Belum ada simpul diperluas";
  } else if (k === total) {
    tekstLangkah.textContent = `Selesai, ${total} simpul diperluas, biaya ${telusur.biaya}`;
  } else {
    tekstLangkah.textContent = `Langkah ${k} dari ${total}, memperluas ${telusur.urutan_ekspansi[k - 1]}`;
  }

  gambarPeta();
  if (k >= total) hentikanTayang();
}

tombolAwal.addEventListener("click", () => {
  hentikanTayang();
  keLangkah(0);
});

tombolMaju.addEventListener("click", () => {
  hentikanTayang();
  keLangkah(Number(geser.value) + 1);
});

tombolMain.addEventListener("click", () => {
  if (jamTayang) {
    hentikanTayang();
    return;
  }
  if (!telusur) return;
  if (Number(geser.value) >= telusur.urutan_ekspansi.length) keLangkah(0);
  labelMain.textContent = "Jeda";
  tombolMain.setAttribute("aria-label", "Jeda animasi");
  jamTayang = setInterval(() => keLangkah(Number(geser.value) + 1), JEDA_LANGKAH);
});

geser.addEventListener("input", () => {
  hentikanTayang();
  keLangkah(Number(geser.value));
});

tombolTukar.addEventListener("click", () => {
  const simpan = pilihanAsal.value;
  pilihanAsal.value = pilihanTujuan.value;
  pilihanTujuan.value = simpan;
  form.requestSubmit();
});

form.addEventListener("submit", async (peristiwa) => {
  peristiwa.preventDefault();
  sembunyikanPesan();
  hentikanTayang();
  telusur = null;
  panelLangkah.classList.add("tersembunyi");
  kotakHasil.replaceChildren();
  tombol.disabled = true;
  tombol.textContent = "Mencari...";

  const asal = encodeURIComponent(pilihanAsal.value);
  const tujuan = encodeURIComponent(pilihanTujuan.value);
  const algoritma = pilihanAlgoritma.value;

  try {
    if (algoritma === "keduanya") {
      const data = await ambilJson(`/api/bandingkan?asal=${asal}&tujuan=${tujuan}`);
      tampilan = {
        lapis: [
          { rute: data.greedy.rute, kelas: "jalur-greedy" },
          { rute: data.astar.rute, kelas: "jalur-astar" },
        ],
        diperluas: [],
        kini: null,
      };
      gambarPeta();
      kotakHasil.append(
        gambarRingkas(data.greedy, data.astar),
        gambarHasil(data.astar, false),
        gambarHasil(data.greedy, true),
      );
    } else {
      const data = await ambilJson(
        `/api/cari?asal=${asal}&tujuan=${tujuan}&algoritma=${algoritma}`,
      );
      pasangLangkah(data);
      kotakHasil.append(gambarHasil(data, algoritma === "greedy"));
    }
  } catch (galat) {
    tampilkanPesan(`Gagal mencari rute. ${galat.message}`);
  } finally {
    tombol.disabled = false;
    tombol.textContent = "Cari rute";
  }
});

async function muatKota() {
  const data = await ambilJson("/api/kota");
  peta = { graf: data.graf, koordinat: data.koordinat };

  for (const nama of data.kota) {
    pilihanAsal.append(new Option(nama, nama));
    pilihanTujuan.append(new Option(nama, nama));
  }

  pilihanAsal.value = "Arad";
  pilihanTujuan.value = "Bucharest";
  gambarPeta();
}

muatKota().catch(() => {
  tampilkanPesan(
    "Gagal memuat daftar kota. Pastikan server backend sudah berjalan, " +
      "lalu buka halaman ini lewat http://127.0.0.1:8000.",
  );
  tombol.disabled = true;
});
