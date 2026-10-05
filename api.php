<?php

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

set_time_limit(120);


/* ============================================================
   RESPONSE JSON
============================================================ */

function responseJson(
    bool $success,
    $data = null,
    string $message = '',
    int $httpCode = 200
): void {

    http_response_code($httpCode);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data'    => $data
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}


/* ============================================================
   NORMALISASI TEKS
============================================================ */

function normalisasi(string $text): string
{
    $text = trim($text);

    $text = preg_replace(
        '/\s+/u',
        ' ',
        $text
    );

    if (function_exists('mb_strtolower')) {
        return mb_strtolower(
            $text,
            'UTF-8'
        );
    }

    return strtolower($text);
}


/* ============================================================
   API URL
============================================================ */

function apiUrl(string $path): string
{
    $baseUrl = defined('PDDIKTI_API_BASE') ? PDDIKTI_API_BASE : 'https://api-pddikti.kemdiktisaintek.go.id';
    return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
}


/* ============================================================
   HEADER PDDIKTI (SPOOF BROWSER ASLI)
============================================================ */

function headerPddikti(
    bool $json = false
): array {

    $headers = [
        'Accept: application/json, text/plain, */*',
        'Accept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin: https://pddikti.kemdiktisaintek.go.id',
        'Referer: https://pddikti.kemdiktisaintek.go.id/',
        'Sec-Fetch-Dest: empty',
        'Sec-Fetch-Mode: cors',
        'Sec-Fetch-Site: same-origin',
        'sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile: ?0',
        'sec-ch-ua-platform: "Windows"'
    ];

    if ($json) {
        $headers[] = 'Content-Type: application/json';
    }

    return $headers;
}


/* ============================================================
   GET USER AGENT REALISTIS
============================================================ */

function getUserAgent(): string
{
    if (defined('API_USER_AGENT') && !empty(API_USER_AGENT) && API_USER_AGENT !== 'PHP') {
        return API_USER_AGENT;
    }
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
}


/* ============================================================
   GET PDDIKTI (DENGAN PROXY)
============================================================ */

function apiGet(string $url): array
{
    $ch = curl_init();

    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 15, // Waktu diperlama untuk proxy
            CURLOPT_TIMEOUT => 30,
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => getUserAgent(),
            CURLOPT_HTTPHEADER => headerPddikti(false),
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            
            // Konfigurasi Proxy
            CURLOPT_PROXY => '103.165.155.22:2016',
            CURLOPT_HTTPPROXYTUNNEL => true
        ]
    );

    $body = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($body === false) {
        return [
            'ok' => false,
            'status' => 0,
            'error' => 'Koneksi Proxy Gagal/Timeout: ' . $error,
            'data' => null
        ];
    }

    $json = json_decode($body, true);

    if ($httpCode < 200 || $httpCode >= 300) {
        $msgError = 'HTTP Error ' . $httpCode;
        if ($httpCode === 403) {
            $msgError .= ' (Akses Ditolak/Diblokir oleh Firewall PDDIKTI)';
        }
        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => $msgError,
            'data' => is_array($json) ? $json : null
        ];
    }

    if (!is_array($json)) {
        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => 'Response bukan JSON valid.',
            'data' => null
        ];
    }

    return [
        'ok' => true,
        'status' => $httpCode,
        'error' => null,
        'data' => $json
    ];
}


/* ============================================================
   POST JSON PDDIKTI (DENGAN PROXY)
============================================================ */

function apiPostJson(
    string $url,
    array $payload
): array {

    $payloadJson = json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    $ch = curl_init();

    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payloadJson,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 15, // Waktu diperlama untuk proxy
            CURLOPT_TIMEOUT => 30,
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => getUserAgent(),
            CURLOPT_HTTPHEADER => headerPddikti(true),
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            
            // Konfigurasi Proxy
            CURLOPT_PROXY => '103.165.155.22:2016',
            CURLOPT_HTTPPROXYTUNNEL => true
        ]
    );

    $body = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($body === false) {
        return [
            'ok' => false,
            'status' => 0,
            'error' => 'Koneksi Proxy Gagal/Timeout: ' . $error,
            'data' => null
        ];
    }

    $json = json_decode($body, true);

    if ($httpCode < 200 || $httpCode >= 300) {
        $msgError = 'HTTP Error ' . $httpCode;
        if ($httpCode === 403) {
            $msgError .= ' (Akses Ditolak/Diblokir oleh Firewall PDDIKTI)';
        }
        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => $msgError,
            'data' => is_array($json) ? $json : null
        ];
    }

    if (!is_array($json)) {
        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => 'Response bukan JSON valid.',
            'data' => null
        ];
    }

    return [
        'ok' => true,
        'status' => $httpCode,
        'error' => null,
        'data' => $json
    ];
}


/* ============================================================
   CACHE MANAGEMENT (KOMPATIBEL DENGAN VERCEL READ-ONLY)
============================================================ */

function getCacheDir(): string
{
    $dir = defined('CACHE_DIR') ? CACHE_DIR : sys_get_temp_dir() . '/cache';

    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }

    // Jika folder lokal tidak bisa ditulis (seperti di Vercel), alihkan ke /tmp
    if (!is_writable($dir)) {
        $dir = sys_get_temp_dir();
    }

    return rtrim($dir, '/\\');
}


function cacheFilename(string $key): string
{
    return getCacheDir() . '/' . sha1($key) . '.json';
}


function bacaCache(string $key)
{
    $file = cacheFilename($key);

    if (!file_exists($file)) {
        return null;
    }

    $ttl = defined('CACHE_TTL') ? CACHE_TTL : 86400;

    if (time() - filemtime($file) > $ttl) {
        return null;
    }

    $content = @file_get_contents($file);

    if (!$content) {
        return null;
    }

    $data = json_decode($content, true);

    return is_array($data) ? $data : null;
}


function simpanCache(string $key, $data): void
{
    $file = cacheFilename($key);

    @file_put_contents(
        $file,
        json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
        )
    );
}


/* ============================================================
   SEARCH PDDIKTI
============================================================ */

function pencarianPddikti(string $keyword): array
{
    $keyword = trim($keyword);

    $url = apiUrl('pencarian/enc/all/' . rawurlencode($keyword));

    $response = apiGet($url);

    if (!$response['ok']) {
        throw new Exception(
            'Gagal mengakses PDDIKTI: ' . $response['error']
        );
    }

    $json = $response['data'];

    if (($json['status'] ?? '') !== 'success') {
        throw new Exception(
            'PDDIKTI tidak mengembalikan status success.'
        );
    }

    return $json['data'] ?? [];
}


/* ============================================================
   PROGRAM STUDI PNL
============================================================ */

function ambilProgramStudi(): array
{
    $cacheKey = 'prodi-pnl-v5';

    $cached = bacaCache($cacheKey);

    if (is_array($cached) && count($cached) > 0) {
        return $cached;
    }

    $ptName = defined('PT_NAME') ? PT_NAME : 'Politeknik Negeri Lhokseumawe';
    $data = pencarianPddikti($ptName);

    $daftar = $data['prodi'] ?? [];

    $hasil = [];

    if (is_array($daftar)) {
        foreach ($daftar as $prodi) {
            $namaPt = trim($prodi['pt'] ?? '');

            if (normalisasi($namaPt) !== normalisasi($ptName)) {
                continue;
            }

            $nama = trim($prodi['nama'] ?? '');
            $jenjang = trim($prodi['jenjang'] ?? '');

            if ($nama === '') {
                continue;
            }

            $key = normalisasi($jenjang . '|' . $nama);

            $hasil[$key] = [
                'id' => $prodi['id'] ?? '',
                'nama_prodi' => $nama,
                'jenjang' => $jenjang
            ];
        }
    }

    $hasil = array_values($hasil);

    usort($hasil, function ($a, $b) {
        return strcasecmp($a['nama_prodi'], $b['nama_prodi']);
    });

    if (count($hasil) > 0) {
        simpanCache($cacheKey, $hasil);
    }

    return $hasil;
}


/* ============================================================
   MAP JENJANG
============================================================ */

function mapJenjangProdi(): array
{
    $hasil = [];

    foreach (ambilProgramStudi() as $prodi) {
        $hasil[normalisasi($prodi['nama_prodi'])] = $prodi['jenjang'];
    }

    return $hasil;
}


/* ============================================================
   DETAIL MAHASISWA
============================================================ */

function ambilDetailMahasiswa(string $id): array
{
    $id = trim($id);

    if ($id === '') {
        return [
            'ok' => false,
            'data' => [],
            'error' => 'ID kosong.'
        ];
    }

    $cacheKey = 'detail-mhs-v5-' . sha1($id);

    $cached = bacaCache($cacheKey);

    if (is_array($cached)) {
        return [
            'ok' => true,
            'data' => $cached,
            'error' => null
        ];
    }

    $response = apiPostJson(
        apiUrl('detail/mhs'),
        ['id' => $id]
    );

    if (!$response['ok']) {
        return [
            'ok' => false,
            'data' => [],
            'error' => $response['error']
        ];
    }

    $json = $response['data'];

    if (($json['status'] ?? '') !== 'success') {
        return [
            'ok' => false,
            'data' => [],
            'error' => $json['message'] ?? 'Status detail bukan success.'
        ];
    }

    $detail = $json['data'] ?? [];

    if (!is_array($detail)) {
        return [
            'ok' => false,
            'data' => [],
            'error' => 'Detail mahasiswa tidak valid.'
        ];
    }

    simpanCache($cacheKey, $detail);

    return [
        'ok' => true,
        'data' => $detail,
        'error' => null
    ];
}


/* ============================================================
   AMBIL TAHUN DARI TANGGAL MASUK
============================================================ */

function tahunDariTanggalMasuk(string $tanggal): string
{
    $tanggal = trim($tanggal);

    if (preg_match('/^(\d{4})/', $tanggal, $match)) {
        return $match[1];
    }

    return '';
}


/* ============================================================
   SEARCH MAHASISWA DASAR
============================================================ */

function cariMahasiswaDasar(
    string $keyword,
    string $prodi = 'all'
): array {

    $data = pencarianPddikti($keyword);

    $mahasiswa = $data['mahasiswa'] ?? [];

    if (!is_array($mahasiswa)) {
        return [];
    }

    $hasil = [];

    $filterProdi = ($prodi !== '' && $prodi !== 'all');

    $targetProdi = $filterProdi ? normalisasi($prodi) : '';
    $ptName = defined('PT_NAME') ? PT_NAME : 'Politeknik Negeri Lhokseumawe';

    foreach ($mahasiswa as $mhs) {

        $namaPt = trim($mhs['nama_pt'] ?? '');

        if (normalisasi($namaPt) !== normalisasi($ptName)) {
            continue;
        }

        $namaProdi = trim($mhs['nama_prodi'] ?? '');

        if ($filterProdi && normalisasi($namaProdi) !== $targetProdi) {
            continue;
        }

        $hasil[] = $mhs;

        if (defined('MAX_MAHASISWA') && count($hasil) >= MAX_MAHASISWA) {
            break;
        }
    }

    return $hasil;
}


/* ============================================================
   LENGKAPI DATA DENGAN DETAIL
============================================================ */

function lengkapiMahasiswa(array $mahasiswa): array
{
    $hasil = [];

    $mapJenjang = mapJenjangProdi();
    $ptName = defined('PT_NAME') ? PT_NAME : 'Politeknik Negeri Lhokseumawe';
    $ptCode = defined('PT_CODE') ? PT_CODE : '';

    foreach ($mahasiswa as $mhs) {

        $id = trim($mhs['id'] ?? '');

        if ($id === '') {
            continue;
        }

        $responseDetail = ambilDetailMahasiswa($id);

        $detail = $responseDetail['ok'] ? $responseDetail['data'] : [];

        $nama = trim($detail['nama'] ?? $mhs['nama'] ?? '-');
        $nim = trim($detail['nim'] ?? $mhs['nim'] ?? '-');
        $namaPt = trim($detail['nama_pt'] ?? $mhs['nama_pt'] ?? $ptName);
        $namaProdi = trim($detail['prodi'] ?? $mhs['nama_prodi'] ?? '-');

        $tanggalMasuk = trim($detail['tanggal_masuk'] ?? '');

        $tahunMasuk = tahunDariTanggalMasuk($tanggalMasuk);

        if ($tahunMasuk === '' && isset($detail['tahun_masuk'])) {
            $tahunLangsung = trim((string)$detail['tahun_masuk']);
            if (preg_match('/^\d{4}$/', $tahunLangsung)) {
                $tahunMasuk = $tahunLangsung;
            }
        }

        $jenjang = $mapJenjang[normalisasi($namaProdi)] ?? trim($detail['jenjang'] ?? '-');

        $hasil[] = [
            'id' => $id,
            'nama' => $nama,
            'nim' => $nim,
            'nama_pt' => $namaPt,
            'kode_pt' => trim($detail['kode_pt'] ?? $ptCode),
            'kode_prodi' => trim($detail['kode_prodi'] ?? ''),
            'nama_prodi' => $namaProdi,
            'jenjang' => $jenjang,
            'jenis_kelamin' => trim($detail['jenis_kelamin'] ?? ''),
            'jenis_daftar' => trim($detail['jenis_daftar'] ?? ''),
            'status_saat_ini' => trim($detail['status_saat_ini'] ?? ''),
            'tanggal_masuk' => $tanggalMasuk,
            'tahun_masuk' => $tahunMasuk,
            'detail_tersedia' => $responseDetail['ok']
        ];
    }

    return $hasil;
}


/* ============================================================
   ROUTING
============================================================ */

$action = trim($_GET['action'] ?? '');

try {

    if ($action === 'prodi') {

        $items = ambilProgramStudi();

        responseJson(
            true,
            [
                'items' => $items,
                'jumlah' => count($items)
            ],
            'Program Studi berhasil diambil dari API PDDIKTI.'
        );
    }

    if ($action === 'mahasiswa') {

        $prodi = trim($_GET['prodi'] ?? 'all');
        $tahun = trim($_GET['tahun'] ?? 'all');
        $q = trim($_GET['q'] ?? '');

        if ($prodi === '') {
            $prodi = 'all';
        }

        if ($tahun === '') {
            $tahun = 'all';
        }

        $ptName = defined('PT_NAME') ? PT_NAME : 'Politeknik Negeri Lhokseumawe';

        if ($q !== '') {
            $keyword = $q;
        } elseif ($prodi !== 'all') {
            $keyword = $prodi . ' ' . $ptName;
        } else {
            $keyword = $ptName;
        }

        $dasar = cariMahasiswaDasar($keyword, $prodi);

        $items = lengkapiMahasiswa($dasar);

        if ($tahun !== 'all' && $tahun !== '') {
            $items = array_values(
                array_filter(
                    $items,
                    function ($item) use ($tahun) {
                        return ($item['tahun_masuk'] ?? '') === $tahun;
                    }
                )
            );
        }

        $tahunTersedia = [];

        if ($tahun !== 'all' && $tahun !== '') {
            $semuaDetail = lengkapiMahasiswa($dasar);
        } else {
            $semuaDetail = $items;
        }

        foreach ($semuaDetail as $item) {
            $tahunItem = trim($item['tahun_masuk'] ?? '');
            if ($tahunItem !== '') {
                $tahunTersedia[] = $tahunItem;
            }
        }

        $tahunTersedia = array_values(array_unique($tahunTersedia));
        rsort($tahunTersedia, SORT_NUMERIC);

        $labelProdi = ($prodi === 'all') ? 'Semua Program Studi' : $prodi;
        $labelTahun = ($tahun === 'all') ? 'Semua Tahun' : $tahun;

        responseJson(
            true,
            [
                'items' => $items,
                'jumlah_hasil_api' => count($items),
                'program_studi' => $labelProdi,
                'tahun' => $labelTahun,
                'tahun_tersedia' => $tahunTersedia,
                'keyword_api' => $keyword,
                'hasil_lengkap' => false
            ],
            'Data mahasiswa berhasil diambil dari API PDDIKTI.'
        );
    }

    responseJson(
        false,
        null,
        'Action tidak dikenali.',
        400
    );

} catch (Throwable $e) {
    responseJson(
        false,
        null,
        $e->getMessage(),
        500
    );
}
