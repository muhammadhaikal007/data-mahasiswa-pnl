<?php

/**
 * ============================================================
 * KONFIGURASI APLIKASI
 * Data Mahasiswa Politeknik Negeri Lhokseumawe
 * Sumber: API PDDIKTI
 * ============================================================
 */


/**
 * Base URL API PDDIKTI.
 */
define(
    'PDDIKTI_API_BASE',
    'https://pddikti.kemdiktisaintek.go.id/api'
);


/**
 * Identitas perguruan tinggi.
 */
define(
    'PT_NAME',
    'Politeknik Negeri Lhokseumawe'
);

define(
    'PT_CODE',
    '005016'
);


/**
 * ID perguruan tinggi yang diperoleh dari
 * request frontend PDDIKTI.
 *
 * Digunakan pada endpoint:
 * /api/pt/prodi/{id_pt}/{semester}
 */
define(
    'PT_API_ID',
    'Ta2RAn7SdVYbvwx3PO1guRVIF4j8q5cQ9ceolaxaUphQ_KAYuoCBk10V5sa9eojqxGJI5w=='
);


/**
 * Semester yang digunakan untuk mengambil daftar prodi.
 *
 * Format PDDIKTI:
 * YYYY1 = Ganjil
 * YYYY2 = Genap
 */
define(
    'SEMESTER',
    '20251'
);


/**
 * Folder cache.
 */
define(
    'CACHE_DIR',
    __DIR__ . '/cache'
);


/**
 * Cache berlaku selama 6 jam.
 */
define(
    'CACHE_TTL',
    21600
);


/**
 * Maksimal mahasiswa yang diproses dalam satu hasil pencarian.
 *
 * Endpoint pencarian PDDIKTI sendiri memiliki batas hasil.
 */
define(
    'MAX_MAHASISWA',
    100
);


/**
 * Jumlah request detail mahasiswa
 * yang dijalankan bersamaan.
 */
define(
    'DETAIL_CONCURRENCY',
    6
);


/**
 * Timeout request API.
 */
define(
    'API_TIMEOUT',
    25
);


/**
 * User-Agent.
 */
define(
    'API_USER_AGENT',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36'
);


/**
 * Pastikan folder cache tersedia.
 */
if (!is_dir(CACHE_DIR)) {
    @mkdir(
        CACHE_DIR,
        0777,
        true
    );
}