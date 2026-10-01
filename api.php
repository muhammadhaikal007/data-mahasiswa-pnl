<?php

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');


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
   URL API
============================================================ */

function apiUrl(string $path): string
{
    return
        rtrim(PDDIKTI_API_BASE, '/')
        . '/'
        . ltrim($path, '/');
}


/* ============================================================
   HTTP GET KE PDDIKTI
============================================================ */

function apiGet(string $url): array
{
    $ch = curl_init();

    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_ENCODING       => '',

            CURLOPT_USERAGENT =>
                API_USER_AGENT,

            CURLOPT_HTTPHEADER => [
                'Accept: application/json, text/plain, */*',
                'Accept-Language: id-ID,id;q=0.9,en-US;q=0.8',
                'Referer: https://pddikti.kemdiktisaintek.go.id/'
            ],

            // Untuk praktikum localhost.
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]
    );


    $body = curl_exec($ch);

    $curlError = curl_error($ch);

    $httpCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);


    if ($body === false) {

        return [
            'ok'     => false,
            'status' => 0,
            'error'  => $curlError,
            'data'   => null
        ];
    }


    $json = json_decode(
        $body,
        true
    );


    if (
        $httpCode < 200 ||
        $httpCode >= 300
    ) {

        return [
            'ok'     => false,
            'status' => $httpCode,
            'error'  => 'HTTP Error ' . $httpCode,
            'data'   => is_array($json)
                ? $json
                : null
        ];
    }


    if (!is_array($json)) {

        return [
            'ok'     => false,
            'status' => $httpCode,
            'error'  => 'Response PDDIKTI bukan JSON valid.',
            'data'   => null
        ];
    }


    return [
        'ok'     => true,
        'status' => $httpCode,
        'error'  => null,
        'data'   => $json
    ];
}


/* ============================================================
   PENCARIAN UMUM PDDIKTI
============================================================ */

function pencarianPddikti(
    string $keyword
): array {

    $keyword = trim($keyword);


    if ($keyword === '') {

        return [];
    }


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
            'Gagal mengakses API PDDIKTI: '
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


    $data =
        $json['data']
        ??
        [];


    return is_array($data)
        ? $data
        : [];
}


/* ============================================================
   DAFTAR PROGRAM STUDI PNL

   Sumber:
   GET /api/pencarian/enc/all/
       Politeknik Negeri Lhokseumawe

   Response:
   data.prodi[]

   Field:
   - id
   - nama
   - jenjang
   - pt
   - pt_singkat
============================================================ */

function ambilProgramStudi(): array
{
    $data =
        pencarianPddikti(
            PT_NAME
        );


    $daftar =
        $data['prodi']
        ??
        [];


    if (!is_array($daftar)) {

        return [];
    }


    $hasil = [];


    foreach ($daftar as $prodi) {

        $namaPt =
            trim(
                $prodi['pt']
                ??
                ''
            );


        /**
         * Hanya program studi PNL.
         */
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


        /**
         * Cegah duplikat.
         */
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
                $jenjang,

            'pt' =>
                $namaPt,

            'pt_singkat' =>
                trim(
                    $prodi['pt_singkat']
                    ??
                    ''
                )
        ];
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


    return $hasil;
}


/* ============================================================
   CARI JENJANG PRODI
============================================================ */

function cariJenjangProdi(
    string $namaProdi
): string {

    $target =
        normalisasi(
            $namaProdi
        );


    $daftar =
        ambilProgramStudi();


    foreach ($daftar as $prodi) {

        if (
            normalisasi(
                $prodi['nama_prodi']
            )
            ===
            $target
        ) {

            return
                $prodi['jenjang']
                ??
                '-';
        }
    }


    return '-';
}


/* ============================================================
   TAHUN ANGKATAN DARI NIM

   Contoh:
   2026583020046
   ↓
   2026

   CATATAN:
   Ini bukan field tanggal_masuk PDDIKTI.
   Ini interpretasi 4 digit awal NIM.
============================================================ */

function tahunDariNim(
    string $nim
): string {

    $nim =
        trim($nim);


    if (
        preg_match(
            '/^((?:19|20)\d{2})/',
            $nim,
            $match
        )
    ) {

        return $match[1];
    }


    return '';
}


/* ============================================================
   SEARCH MAHASISWA
============================================================ */

function cariMahasiswa(
    string $keyword,
    string $prodi = '',
    string $tahun = ''
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


    $hasil = [];


    $targetProdi =
        normalisasi(
            $prodi
        );


    foreach ($mahasiswa as $mhs) {

        /**
         * ====================================================
         * FILTER PERGURUAN TINGGI
         * ====================================================
         */

        $namaPt =
            normalisasi(
                $mhs['nama_pt']
                ??
                ''
            );


        if (
            $namaPt
            !==
            normalisasi(
                PT_NAME
            )
        ) {

            continue;
        }


        /**
         * ====================================================
         * FILTER PROGRAM STUDI
         * ====================================================
         */

        $namaProdi =
            trim(
                $mhs['nama_prodi']
                ??
                ''
            );


        if (
            $prodi !== ''
            &&
            normalisasi($namaProdi)
            !==
            $targetProdi
        ) {

            continue;
        }


        /**
         * ====================================================
         * TAHUN ANGKATAN
         * ====================================================
         */

        $nim =
            trim(
                $mhs['nim']
                ??
                ''
            );


        $tahunAngkatan =
            tahunDariNim(
                $nim
            );


        if (
            $tahun !== ''
            &&
            $tahunAngkatan
            !==
            $tahun
        ) {

            continue;
        }


        $hasil[] = [

            'id' =>
                $mhs['id']
                ??
                '',

            'nama' =>
                trim(
                    $mhs['nama']
                    ??
                    '-'
                ),

            'nim' =>
                $nim,

            'nama_pt' =>
                trim(
                    $mhs['nama_pt']
                    ??
                    ''
                ),

            'nama_prodi' =>
                $namaProdi,

            'tahun_angkatan' =>
                $tahunAngkatan
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

        $data =
            ambilProgramStudi();


        responseJson(
            true,

            [
                'items' =>
                    $data,

                'jumlah' =>
                    count($data)
            ],

            'Program studi berhasil diambil dari API PDDIKTI.'
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
                ''
            );


        $tahun =
            trim(
                $_GET['tahun']
                ??
                ''
            );


        $q =
            trim(
                $_GET['q']
                ??
                ''
            );


        /**
         * Program Studi wajib dipilih.
         */
        if ($prodi === '') {

            responseJson(
                false,
                null,
                'Program Studi belum dipilih.',
                400
            );
        }


        /**
         * Tahun wajib dipilih.
         */
        if ($tahun === '') {

            responseJson(
                false,
                null,
                'Tahun Angkatan belum dipilih.',
                400
            );
        }


        /**
         * ====================================================
         * KEYWORD PENCARIAN
         *
         * Jika ada nama/NIM:
         * gunakan nama/NIM sebagai keyword.
         *
         * Jika kosong:
         * gunakan:
         *
         * Program Studi + Politeknik Negeri Lhokseumawe
         * ====================================================
         */

        if ($q !== '') {

            $keyword =
                $q;

        } else {

            $keyword =
                $prodi
                .
                ' '
                .
                PT_NAME;
        }


        /**
         * Cari mahasiswa.
         */
        $items =
            cariMahasiswa(
                $keyword,
                $prodi,
                $tahun
            );


        /**
         * Jenjang diperoleh dari
         * daftar prodi API PDDIKTI.
         */
        $jenjang =
            cariJenjangProdi(
                $prodi
            );


        /**
         * Tambahkan jenjang.
         */
        foreach (
            $items
            as
            &$item
        ) {

            $item['jenjang'] =
                $jenjang;
        }


        unset($item);


        responseJson(

            true,

            [
                'items' =>
                    $items,

                'jumlah_hasil_api' =>
                    count($items),

                'program_studi' =>
                    $prodi,

                'jenjang' =>
                    $jenjang,

                'tahun_angkatan' =>
                    $tahun,

                'keyword_api' =>
                    $keyword,

                /**
                 * Sangat penting.
                 */
                'hasil_lengkap' =>
                    false,

                'keterangan' =>
                    'Jumlah merupakan hasil pencarian endpoint publik PDDIKTI dan bukan total populasi mahasiswa.'
            ],

            'Pencarian API PDDIKTI selesai.'
        );
    }


    /* ========================================================
       ACTION TIDAK DIKENALI
    ======================================================== */

    responseJson(
        false,
        null,
        'Action API tidak dikenali.',
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