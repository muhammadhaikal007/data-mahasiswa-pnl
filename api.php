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
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
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
    return
        rtrim(PDDIKTI_API_BASE, '/')
        . '/'
        . ltrim($path, '/');
}


/* ============================================================
   HEADER PDDIKTI
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

        'Sec-Fetch-Site: same-origin'
    ];


    if ($json) {

        $headers[] =
            'Content-Type: application/json';
    }


    return $headers;
}


/* ============================================================
   GET PDDIKTI
============================================================ */

function apiGet(string $url): array
{
    $ch =
        curl_init();


    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL =>
                $url,

            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_FOLLOWLOCATION =>
                true,

            CURLOPT_CONNECTTIMEOUT =>
                10,

            CURLOPT_TIMEOUT =>
                30,

            CURLOPT_ENCODING =>
                '',

            CURLOPT_USERAGENT =>
                API_USER_AGENT,

            CURLOPT_HTTPHEADER =>
                headerPddikti(false),

            CURLOPT_SSL_VERIFYPEER =>
                false,

            CURLOPT_SSL_VERIFYHOST =>
                false
        ]
    );


    $body =
        curl_exec($ch);


    $error =
        curl_error($ch);


    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    curl_close($ch);


    if ($body === false) {

        return [
            'ok' => false,
            'status' => 0,
            'error' => $error,
            'data' => null
        ];
    }


    $json =
        json_decode(
            $body,
            true
        );


    if (
        $httpCode < 200 ||
        $httpCode >= 300
    ) {

        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => 'HTTP Error ' . $httpCode,
            'data' => is_array($json)
                ? $json
                : null
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
   POST JSON PDDIKTI
============================================================ */

function apiPostJson(
    string $url,
    array $payload
): array {

    $payloadJson =
        json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );


    $ch =
        curl_init();


    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL =>
                $url,

            CURLOPT_POST =>
                true,

            CURLOPT_POSTFIELDS =>
                $payloadJson,

            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_FOLLOWLOCATION =>
                true,

            CURLOPT_CONNECTTIMEOUT =>
                10,

            CURLOPT_TIMEOUT =>
                30,

            CURLOPT_ENCODING =>
                '',

            CURLOPT_USERAGENT =>
                API_USER_AGENT,

            CURLOPT_HTTPHEADER =>
                headerPddikti(true),

            CURLOPT_SSL_VERIFYPEER =>
                false,

            CURLOPT_SSL_VERIFYHOST =>
                false
        ]
    );


    $body =
        curl_exec($ch);


    $error =
        curl_error($ch);


    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    curl_close($ch);


    if ($body === false) {

        return [
            'ok' => false,
            'status' => 0,
            'error' => $error,
            'data' => null
        ];
    }


    $json =
        json_decode(
            $body,
            true
        );


    if (
        $httpCode < 200 ||
        $httpCode >= 300
    ) {

        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => 'HTTP Error ' . $httpCode,
            'data' => is_array($json)
                ? $json
                : null
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
   CACHE
============================================================ */

function cacheFilename(string $key): string
{
    return
        CACHE_DIR
        . '/'
        . sha1($key)
        . '.json';
}


function bacaCache(string $key)
{
    $file =
        cacheFilename($key);


    if (!file_exists($file)) {

        return null;
    }


    if (
        time() - filemtime($file)
        >
        CACHE_TTL
    ) {

        return null;
    }


    $content =
        @file_get_contents($file);


    if (!$content) {

        return null;
    }


    $data =
        json_decode(
            $content,
            true
        );


    return is_array($data)
        ? $data
        : null;
}


function simpanCache(
    string $key,
    $data
): void {

    if (!is_dir(CACHE_DIR)) {

        @mkdir(
            CACHE_DIR,
            0777,
            true
        );
    }


    @file_put_contents(
        cacheFilename($key),

        json_encode(
            $data,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES |
            JSON_PRETTY_PRINT
        )
    );
}


/* ============================================================
   SEARCH PDDIKTI
============================================================ */

function pencarianPddikti(
    string $keyword
): array {

    $keyword =
        trim($keyword);


    $url =
        apiUrl(
            'pencarian/enc/all/'
            .
            rawurlencode($keyword)
        );


    $response =
        apiGet($url);


    if (!$response['ok']) {

        throw new Exception(
            'Gagal mengakses PDDIKTI: '
            .
            $response['error']
        );
    }


    $json =
        $response['data'];


    if (
        ($json['status'] ?? '')
        !==
        'success'
    ) {

        throw new Exception(
            'PDDIKTI tidak mengembalikan status success.'
        );
    }


    return
        $json['data']
        ??
        [];
}


/* ============================================================
   PROGRAM STUDI PNL
============================================================ */

function ambilProgramStudi(): array
{
    $cacheKey =
        'prodi-pnl-v5';


    $cached =
        bacaCache($cacheKey);


    if (
        is_array($cached)
        &&
        count($cached) > 0
    ) {

        return $cached;
    }


    $data =
        pencarianPddikti(
            PT_NAME
        );


    $daftar =
        $data['prodi']
        ??
        [];


    $hasil =
        [];


    if (is_array($daftar)) {

        foreach (
            $daftar
            as
            $prodi
        ) {

            $namaPt =
                trim(
                    $prodi['pt']
                    ??
                    ''
                );


            if (
                normalisasi($namaPt)
                !==
                normalisasi(PT_NAME)
            ) {

                continue;
            }


            $nama =
                trim(
                    $prodi['nama']
                    ??
                    ''
                );


            $jenjang =
                trim(
                    $prodi['jenjang']
                    ??
                    ''
                );


            if ($nama === '') {

                continue;
            }


            $key =
                normalisasi(
                    $jenjang
                    .
                    '|'
                    .
                    $nama
                );


            $hasil[$key] = [

                'id' =>
                    $prodi['id']
                    ??
                    '',

                'nama_prodi' =>
                    $nama,

                'jenjang' =>
                    $jenjang
            ];
        }
    }


    $hasil =
        array_values(
            $hasil
        );


    usort(
        $hasil,
        function ($a, $b) {

            return strcasecmp(
                $a['nama_prodi'],
                $b['nama_prodi']
            );
        }
    );


    if (count($hasil) > 0) {

        simpanCache(
            $cacheKey,
            $hasil
        );
    }


    return $hasil;
}


/* ============================================================
   MAP JENJANG
============================================================ */

function mapJenjangProdi(): array
{
    $hasil = [];


    foreach (
        ambilProgramStudi()
        as
        $prodi
    ) {

        $hasil[
            normalisasi(
                $prodi['nama_prodi']
            )
        ] =
            $prodi['jenjang'];
    }


    return $hasil;
}


/* ============================================================
   DETAIL MAHASISWA

   METODE YANG SUDAH BERHASIL:

   POST /api/detail/mhs

   BODY:
   {
       "id": "..."
   }
============================================================ */

function ambilDetailMahasiswa(
    string $id
): array {

    $id =
        trim($id);


    if ($id === '') {

        return [
            'ok' => false,
            'data' => [],
            'error' => 'ID kosong.'
        ];
    }


    $cacheKey =
        'detail-mhs-v5-'
        .
        sha1($id);


    $cached =
        bacaCache($cacheKey);


    if (is_array($cached)) {

        return [
            'ok' => true,
            'data' => $cached,
            'error' => null
        ];
    }


    $response =
        apiPostJson(

            apiUrl(
                'detail/mhs'
            ),

            [
                'id' => $id
            ]
        );


    if (!$response['ok']) {

        return [
            'ok' => false,
            'data' => [],
            'error' => $response['error']
        ];
    }


    $json =
        $response['data'];


    if (
        ($json['status'] ?? '')
        !==
        'success'
    ) {

        return [
            'ok' => false,
            'data' => [],
            'error' =>
                $json['message']
                ??
                'Status detail bukan success.'
        ];
    }


    $detail =
        $json['data']
        ??
        [];


    if (!is_array($detail)) {

        return [
            'ok' => false,
            'data' => [],
            'error' => 'Detail mahasiswa tidak valid.'
        ];
    }


    /*
     * Hanya cache response yang berhasil.
     */
    simpanCache(
        $cacheKey,
        $detail
    );


    return [
        'ok' => true,
        'data' => $detail,
        'error' => null
    ];
}


/* ============================================================
   AMBIL TAHUN DARI TANGGAL MASUK

   BUKAN DARI NIM.
============================================================ */

function tahunDariTanggalMasuk(
    string $tanggal
): string {

    $tanggal =
        trim($tanggal);


    if (
        preg_match(
            '/^(\d{4})/',
            $tanggal,
            $match
        )
    ) {

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

    $data =
        pencarianPddikti(
            $keyword
        );


    $mahasiswa =
        $data['mahasiswa']
        ??
        [];


    if (!is_array($mahasiswa)) {

        return [];
    }


    $hasil =
        [];


    $filterProdi =
        (
            $prodi !== ''
            &&
            $prodi !== 'all'
        );


    $targetProdi =
        $filterProdi
            ? normalisasi($prodi)
            : '';


    foreach (
        $mahasiswa
        as
        $mhs
    ) {

        /*
         * Hanya PNL.
         */
        $namaPt =
            trim(
                $mhs['nama_pt']
                ??
                ''
            );


        if (
            normalisasi($namaPt)
            !==
            normalisasi(PT_NAME)
        ) {

            continue;
        }


        /*
         * Filter prodi jika dipilih.
         */
        $namaProdi =
            trim(
                $mhs['nama_prodi']
                ??
                ''
            );


        if (
            $filterProdi
            &&
            normalisasi($namaProdi)
            !==
            $targetProdi
        ) {

            continue;
        }


        $hasil[] =
            $mhs;


        /*
         * Ikuti batas search API.
         */
        if (
            defined('MAX_MAHASISWA')
            &&
            count($hasil) >= MAX_MAHASISWA
        ) {

            break;
        }
    }


    return $hasil;
}


/* ============================================================
   LENGKAPI DATA DENGAN DETAIL
============================================================ */

function lengkapiMahasiswa(
    array $mahasiswa
): array {

    $hasil =
        [];


    $mapJenjang =
        mapJenjangProdi();


    foreach (
        $mahasiswa
        as
        $mhs
    ) {

        $id =
            trim(
                $mhs['id']
                ??
                ''
            );


        if ($id === '') {

            continue;
        }


        /*
         * Detail API.
         */
        $responseDetail =
            ambilDetailMahasiswa(
                $id
            );


        $detail =
            $responseDetail['ok']
                ? $responseDetail['data']
                : [];


        /*
         * Search data sebagai fallback.
         */
        $nama =
            trim(
                $detail['nama']
                ??
                $mhs['nama']
                ??
                '-'
            );


        $nim =
            trim(
                $detail['nim']
                ??
                $mhs['nim']
                ??
                '-'
            );


        $namaPt =
            trim(
                $detail['nama_pt']
                ??
                $mhs['nama_pt']
                ??
                PT_NAME
            );


        $namaProdi =
            trim(
                $detail['prodi']
                ??
                $mhs['nama_prodi']
                ??
                '-'
            );


        /*
         * Tanggal Masuk ASLI dari detail.
         */
        $tanggalMasuk =
            trim(
                $detail['tanggal_masuk']
                ??
                ''
            );


        /*
         * Tahun masuk dari tanggal_masuk.
         */
        $tahunMasuk =
            tahunDariTanggalMasuk(
                $tanggalMasuk
            );


        /*
         * Jika suatu response PDDIKTI memakai
         * field tahun_masuk secara langsung,
         * kita dukung juga.
         */
        if (
            $tahunMasuk === ''
            &&
            isset($detail['tahun_masuk'])
        ) {

            $tahunLangsung =
                trim(
                    (string)
                    $detail['tahun_masuk']
                );


            if (
                preg_match(
                    '/^\d{4}$/',
                    $tahunLangsung
                )
            ) {

                $tahunMasuk =
                    $tahunLangsung;
            }
        }


        /*
         * Jenjang:
         *
         * Prioritas:
         * 1. katalog API prodi (D3/D4)
         * 2. detail mahasiswa
         */
        $jenjang =
            $mapJenjang[
                normalisasi(
                    $namaProdi
                )
            ]
            ??
            trim(
                $detail['jenjang']
                ??
                '-'
            );


        $hasil[] = [

            'id' =>
                $id,

            'nama' =>
                $nama,

            'nim' =>
                $nim,

            'nama_pt' =>
                $namaPt,

            'kode_pt' =>
                trim(
                    $detail['kode_pt']
                    ??
                    PT_CODE
                ),

            'kode_prodi' =>
                trim(
                    $detail['kode_prodi']
                    ??
                    ''
                ),

            'nama_prodi' =>
                $namaProdi,

            'jenjang' =>
                $jenjang,

            'jenis_kelamin' =>
                trim(
                    $detail['jenis_kelamin']
                    ??
                    ''
                ),

            'jenis_daftar' =>
                trim(
                    $detail['jenis_daftar']
                    ??
                    ''
                ),

            'status_saat_ini' =>
                trim(
                    $detail['status_saat_ini']
                    ??
                    ''
                ),

            'tanggal_masuk' =>
                $tanggalMasuk,

            'tahun_masuk' =>
                $tahunMasuk,

            /*
             * Penanda apakah detail berhasil.
             */
            'detail_tersedia' =>
                $responseDetail['ok']
        ];
    }


    return $hasil;
}


/* ============================================================
   ROUTING
============================================================ */

$action =
    trim(
        $_GET['action']
        ??
        ''
    );


try {


    /* ========================================================
       PROGRAM STUDI
    ======================================================== */

    if ($action === 'prodi') {

        $items =
            ambilProgramStudi();


        responseJson(

            true,

            [
                'items' =>
                    $items,

                'jumlah' =>
                    count($items)
            ],

            'Program Studi berhasil diambil dari API PDDIKTI.'
        );
    }


    /* ========================================================
       MAHASISWA
    ======================================================== */

    if ($action === 'mahasiswa') {

        $prodi =
            trim(
                $_GET['prodi']
                ??
                'all'
            );


        $tahun =
            trim(
                $_GET['tahun']
                ??
                'all'
            );


        $q =
            trim(
                $_GET['q']
                ??
                ''
            );


        if ($prodi === '') {

            $prodi =
                'all';
        }


        if ($tahun === '') {

            $tahun =
                'all';
        }


        /* ====================================================
           KEYWORD SEARCH
        ==================================================== */

        if ($q !== '') {

            /*
             * Nama/NIM merupakan keyword utama.
             */
            $keyword =
                $q;

        } elseif (
            $prodi !== 'all'
        ) {

            /*
             * Program Studi tertentu.
             */
            $keyword =
                $prodi
                .
                ' '
                .
                PT_NAME;

        } else {

            /*
             * Tampilan awal / semua prodi.
             */
            $keyword =
                PT_NAME;
        }


        /* ====================================================
           SEARCH
        ==================================================== */

        $dasar =
            cariMahasiswaDasar(
                $keyword,
                $prodi
            );


        /* ====================================================
           DETAIL
        ==================================================== */

        $items =
            lengkapiMahasiswa(
                $dasar
            );


        /* ====================================================
           FILTER TAHUN DARI tanggal_masuk ASLI
        ==================================================== */

        if (
            $tahun !== 'all'
            &&
            $tahun !== ''
        ) {

            $items =
                array_values(
                    array_filter(
                        $items,
                        function ($item)
                        use ($tahun) {

                            return
                                ($item['tahun_masuk'] ?? '')
                                ===
                                $tahun;
                        }
                    )
                );
        }


        /* ====================================================
           DAFTAR TAHUN YANG TERSEDIA
        ==================================================== */

        $tahunTersedia =
            [];


        /*
         * Penting:
         * daftar tahun sebaiknya berasal dari data SEBELUM
         * difilter tahun.
         *
         * Jadi kita proses lagi dari $dasar apabila
         * filter tahun sedang aktif.
         */
        if (
            $tahun !== 'all'
            &&
            $tahun !== ''
        ) {

            /*
             * Detail kemungkinan sudah ada di cache sehingga
             * tidak melakukan request berat lagi.
             */
            $semuaDetail =
                lengkapiMahasiswa(
                    $dasar
                );

        } else {

            $semuaDetail =
                $items;
        }


        foreach (
            $semuaDetail
            as
            $item
        ) {

            $tahunItem =
                trim(
                    $item['tahun_masuk']
                    ??
                    ''
                );


            if ($tahunItem !== '') {

                $tahunTersedia[] =
                    $tahunItem;
            }
        }


        $tahunTersedia =
            array_values(
                array_unique(
                    $tahunTersedia
                )
            );


        rsort(
            $tahunTersedia,
            SORT_NUMERIC
        );


        /* ====================================================
           LABEL
        ==================================================== */

        $labelProdi =
            $prodi === 'all'
                ? 'Semua Program Studi'
                : $prodi;


        $labelTahun =
            $tahun === 'all'
                ? 'Semua Tahun'
                : $tahun;


        /* ====================================================
           RESPONSE
        ==================================================== */

        responseJson(

            true,

            [
                'items' =>
                    $items,

                'jumlah_hasil_api' =>
                    count($items),

                'program_studi' =>
                    $labelProdi,

                'tahun' =>
                    $labelTahun,

                'tahun_tersedia' =>
                    $tahunTersedia,

                'keyword_api' =>
                    $keyword,

                'hasil_lengkap' =>
                    false
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


} catch (
    Throwable $e
) {

    responseJson(
        false,
        null,
        $e->getMessage(),
        500
    );
}
