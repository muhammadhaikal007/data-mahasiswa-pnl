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
            CURLOPT_CONNECTTIMEOUT => 15, // Waktu koneksi diperlama sedikit karena pakai proxy
            CURLOPT_TIMEOUT => 30,
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => getUserAgent(),
            CURLOPT_HTTPHEADER => headerPddikti(false),
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            
            // ==========================================
            // KONFIGURASI PROXY 
            // ==========================================
            CURLOPT_PROXY => '103.153.75.148:8080', // WAJIB GANTI DENGAN IP:PORT PROXY INDONESIA YANG AKTIF
            CURLOPT_HTTPPROXYTUNNEL => true // Diperlukan karena target API adalah HTTPS
            // ==========================================
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
            CURLOPT_CONNECTTIMEOUT => 15, // Waktu koneksi diperlama sedikit karena pakai proxy
            CURLOPT_TIMEOUT => 30,
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => getUserAgent(),
            CURLOPT_HTTPHEADER => headerPddikti(true),
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,

            // ==========================================
            // KONFIGURASI PROXY 
            // ==========================================
            CURLOPT_PROXY => '103.153.75.148:8080', // WAJIB GANTI DENGAN IP:PORT PROXY INDONESIA YANG AKTIF
            CURLOPT_HTTPPROXYTUNNEL => true // Diperlukan karena target API adalah HTTPS
            // ==========================================
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
