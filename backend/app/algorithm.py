import heapq
import math

GRAF: dict[str, dict[str, int]] = {
    "Arad": {"Zerind": 75, "Sibiu": 140, "Timisoara": 118},
    "Zerind": {"Oradea": 71, "Arad": 75},
    "Oradea": {"Zerind": 71, "Sibiu": 151},
    "Sibiu": {"Oradea": 151, "Arad": 140, "Fagaras": 99, "Rimnicu Vilcea": 80},
    "Fagaras": {"Sibiu": 99, "Bucharest": 211},
    "Timisoara": {"Arad": 118, "Lugoj": 111},
    "Lugoj": {"Timisoara": 111, "Mehadia": 70},
    "Rimnicu Vilcea": {"Sibiu": 80, "Pitesti": 97, "Craiova": 146},
    "Mehadia": {"Lugoj": 70, "Dobreta": 75},
    "Dobreta": {"Mehadia": 75, "Craiova": 120},
    "Craiova": {"Dobreta": 120, "Rimnicu Vilcea": 146, "Pitesti": 138},
    "Pitesti": {"Rimnicu Vilcea": 97, "Craiova": 138, "Bucharest": 101},
    "Bucharest": {"Fagaras": 211, "Pitesti": 101, "Giurgiu": 90, "Urziceni": 85},
    "Giurgiu": {"Bucharest": 90},
    "Urziceni": {"Bucharest": 85, "Hirsova": 98, "Vaslui": 142},
    "Hirsova": {"Eforie": 86, "Urziceni": 98},
    "Eforie": {"Hirsova": 86},
    "Vaslui": {"Urziceni": 142, "Iasi": 92},
    "Iasi": {"Vaslui": 92, "Neamt": 87},
    "Neamt": {"Iasi": 87},
}

KOORDINAT: dict[str, tuple[int, int]] = {
    "Arad": (91, 492),
    "Bucharest": (400, 327),
    "Craiova": (253, 288),
    "Dobreta": (165, 299),
    "Eforie": (562, 293),
    "Fagaras": (305, 449),
    "Giurgiu": (375, 270),
    "Hirsova": (534, 350),
    "Iasi": (473, 506),
    "Lugoj": (165, 379),
    "Mehadia": (168, 339),
    "Neamt": (406, 537),
    "Oradea": (131, 571),
    "Pitesti": (320, 368),
    "Rimnicu Vilcea": (233, 410),
    "Sibiu": (207, 457),
    "Timisoara": (94, 410),
    "Urziceni": (456, 350),
    "Vaslui": (509, 444),
    "Zerind": (108, 531),
}

def euclidean(koordinat: dict[str, tuple[int, int]], asal: str, tujuan: str) -> float:
    x1, y1 = koordinat[asal]
    x2, y2 = koordinat[tujuan]
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

def greedy_bfs(
    graf: dict[str, dict[str, int]],
    koordinat: dict[str, tuple[int, int]],
    asal: str,
    tujuan: str,
) -> tuple[list[str] | None, int | None, list[str]]:
    dikunjungi = set()
    diperluas: list[str] = []

    h_asal = euclidean(koordinat, asal, tujuan)
    antrean = [(h_asal, asal, [asal], 0)]

    while antrean:
        h_sekarang, kota_sekarang, rute, total_biaya = heapq.heappop(antrean)

        if kota_sekarang in dikunjungi:
            continue

        dikunjungi.add(kota_sekarang)
        diperluas.append(kota_sekarang)

        if kota_sekarang == tujuan:
            return rute, total_biaya, diperluas

        for tetangga, biaya in graf[kota_sekarang].items():
            if tetangga not in dikunjungi:
                biaya_baru = total_biaya + biaya
                h_tetangga = euclidean(koordinat, tetangga, tujuan)
                rute_baru = rute + [tetangga]
                heapq.heappush(antrean, (h_tetangga, tetangga, rute_baru, biaya_baru))

    return None, None, diperluas

def a_star(
    graf: dict[str, dict[str, int]],
    koordinat: dict[str, tuple[int, int]],
    asal: str,
    tujuan: str,
) -> tuple[list[str] | None, int | None, list[str]]:
    dikunjungi = set()
    diperluas: list[str] = []

    h_asal = euclidean(koordinat, asal, tujuan)
    antrean = [(h_asal, asal, [asal], 0)]

    while antrean:
        f_sekarang, kota_sekarang, rute, total_biaya = heapq.heappop(antrean)

        if kota_sekarang in dikunjungi:
            continue

        dikunjungi.add(kota_sekarang)
        diperluas.append(kota_sekarang)

        if kota_sekarang == tujuan:
            return rute, total_biaya, diperluas

        for tetangga, biaya in graf[kota_sekarang].items():
            if tetangga not in dikunjungi:
                g_baru = total_biaya + biaya
                h_tetangga = euclidean(koordinat, tetangga, tujuan)
                f_baru = g_baru + h_tetangga
                rute_baru = rute + [tetangga]
                heapq.heappush(antrean, (f_baru, tetangga, rute_baru, g_baru))

    return None, None, diperluas