/**
 * ============================================================
 * SISTEM INFORMASI DATA MAHASISWA PNL
 * Sumber Data: API Publik PDDIKTI
 *
 * FUNGSI:
 * 1. Mengambil daftar Program Studi PNL dari API.
 * 2. Menyediakan filter Tahun Angkatan.
 * 3. Melakukan pencarian mahasiswa melalui backend api.php.
 * 4. Memfilter hasil berdasarkan:
 *      - Program Studi
 *      - Tahun Angkatan
 *      - Nama / NIM (opsional)
 * 5. Menampilkan hasil API dalam tabel.
 * 6. Pagination 10 data per halaman.
 *
 * CATATAN:
 * Jumlah hasil merupakan hasil pencarian API PDDIKTI,
 * bukan jumlah keseluruhan/populasi mahasiswa.
 * ============================================================
 */


/* ============================================================
   DATA GLOBAL
============================================================ */

/**
 * Seluruh data hasil pencarian API
 * yang akan ditampilkan.
 */
let dataTampil = [];


/**
 * Halaman aktif pagination.
 */
let currentPage = 1;


/**
 * Jumlah data per halaman.
 */
const perPage = 10;


/**
 * Penanda ketika request sedang berjalan.
 * Mencegah klik tombol berkali-kali.
 */
let sedangMemuat = false;


/* ============================================================
   DOM ELEMENT
============================================================ */

const searchInput =
    document.getElementById(
        'searchInput'
    );


const prodiFilter =
    document.getElementById(
        'prodiFilter'
    );


const tahunFilter =
    document.getElementById(
        'tahunFilter'
    );


const btnTerapkan =
    document.getElementById(
        'btnTerapkan'
    );


const btnReset =
    document.getElementById(
        'btnReset'
    );


const loadingBox =
    document.getElementById(
        'loadingBox'
    );


const loadingText =
    document.getElementById(
        'loadingText'
    );


const tableSection =
    document.getElementById(
        'tableSection'
    );


const tableBody =
    document.getElementById(
        'studentTableBody'
    );


const resultInfo =
    document.getElementById(
        'resultInfo'
    );


const messageBox =
    document.getElementById(
        'messageBox'
    );


const statTotal =
    document.getElementById(
        'statTotal'
    );


const statProdi =
    document.getElementById(
        'statProdi'
    );


const statTahun =
    document.getElementById(
        'statTahun'
    );


const prevPage =
    document.getElementById(
        'prevPage'
    );


const nextPage =
    document.getElementById(
        'nextPage'
    );


const pageNumbers =
    document.getElementById(
        'pageNumbers'
    );


const tableDescription =
    document.getElementById(
        'tableDescription'
    );


/* ============================================================
   ESCAPE HTML
============================================================ */

/**
 * Mencegah data dari API langsung
 * dimasukkan sebagai HTML.
 */
function escapeHtml(value) {

    return String(
        value ?? ''
    )
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );
}


/* ============================================================
   FORMAT NAMA
============================================================ */

/**
 * Contoh:
 *
 * TEKNOLOGI REKAYASA MULTIMEDIA
 *
 * menjadi:
 *
 * Teknologi Rekayasa Multimedia
 */
function formatNama(text) {

    return String(
        text ?? ''
    )
        .trim()
        .toLowerCase()
        .replace(
            /\b\w/g,
            huruf =>
                huruf.toUpperCase()
        );
}


/* ============================================================
   MESSAGE
============================================================ */

function tampilPesan(
    pesan,
    type = 'error'
) {

    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        pesan;


    messageBox.className =
        'message '
        +
        (
            type === 'success'
                ? 'message-success'
                : 'message-error'
        );


    messageBox.classList.remove(
        'hidden'
    );
}


/**
 * Menyembunyikan pesan.
 */
function sembunyikanPesan() {

    if (!messageBox) {
        return;
    }


    messageBox.classList.add(
        'hidden'
    );
}


/* ============================================================
   LOADING
============================================================ */

function tampilLoading(
    tampil,
    pesan = 'Mengambil data dari PDDIKTI...'
) {

    if (!loadingBox) {
        return;
    }


    if (loadingText) {

        loadingText.textContent =
            pesan;
    }


    if (tampil) {

        loadingBox.classList.remove(
            'hidden'
        );

    } else {

        loadingBox.classList.add(
            'hidden'
        );
    }
}


/* ============================================================
   STATISTIK
============================================================ */

function resetStatistik() {

    statTotal.textContent =
        '-';


    statProdi.textContent =
        '-';


    statTahun.textContent =
        '-';
}


/* ============================================================
   ISI FILTER TAHUN ANGKATAN
============================================================ */

function isiTahunAngkatan() {

    /**
     * Kosongkan dropdown.
     */
    tahunFilter.innerHTML =
        `
        <option value="">
            -- Pilih Tahun Angkatan --
        </option>
        `;


    /**
     * Tahun saat ini dari komputer/browser.
     */
    const tahunSekarang =
        new Date()
            .getFullYear();


    /**
     * Buat pilihan tahun dari tahun sekarang
     * sampai tahun 2000.
     *
     * Tahun ini hanya pilihan filter.
     * Bukan data mahasiswa.
     */
    for (
        let tahun = tahunSekarang;
        tahun >= 2000;
        tahun--
    ) {

        const option =
            document.createElement(
                'option'
            );


        option.value =
            String(tahun);


        option.textContent =
            String(tahun);


        tahunFilter.appendChild(
            option
        );
    }
}


/* ============================================================
   LOAD PROGRAM STUDI
============================================================ */

async function loadProgramStudi() {

    sembunyikanPesan();


    tampilLoading(
        true,
        'Mengambil Program Studi dari API PDDIKTI...'
    );


    /**
     * Disable sementara.
     */
    prodiFilter.disabled =
        true;


    prodiFilter.innerHTML =
        `
        <option value="">
            Memuat Program Studi...
        </option>
        `;


    try {

        /**
         * Request ke backend kita.
         */
        const response =
            await fetch(
                'api.php?action=prodi',
                {
                    method: 'GET',
                    cache: 'no-store'
                }
            );


        /**
         * Ambil sebagai text lebih dahulu.
         * Agar kalau PHP error, kita dapat melihat
         * response yang sebenarnya di Console.
         */
        const responseText =
            await response.text();


        let json;


        try {

            json =
                JSON.parse(
                    responseText
                );

        } catch (parseError) {

            console.error(
                'Response Program Studi bukan JSON:',
                responseText
            );


            throw new Error(
                'Response server bukan JSON yang valid.'
            );
        }


        /**
         * HTTP error.
         */
        if (!response.ok) {

            throw new Error(
                json.message
                ||
                `HTTP ${response.status}`
            );
        }


        /**
         * API internal error.
         */
        if (!json.success) {

            throw new Error(
                json.message
                ||
                'Program Studi gagal dimuat.'
            );
        }


        /**
         * Struktur dari api.php terbaru:
         *
         * data: {
         *     items: [...]
         * }
         */
        const daftar =
            Array.isArray(
                json.data?.items
            )
                ? json.data.items
                : [];


        /**
         * Reset dropdown.
         */
        prodiFilter.innerHTML =
            `
            <option value="">
                -- Pilih Program Studi --
            </option>
            `;


        /**
         * Masukkan Program Studi.
         */
        daftar.forEach(
            prodi => {

                const namaProdi =
                    String(
                        prodi.nama_prodi
                        ?? ''
                    ).trim();


                const jenjang =
                    String(
                        prodi.jenjang
                        ?? ''
                    ).trim();


                /**
                 * Lewati jika nama kosong.
                 */
                if (namaProdi === '') {
                    return;
                }


                const option =
                    document.createElement(
                        'option'
                    );


                /**
                 * Value harus mempertahankan
                 * nama asli API karena nanti
                 * dikirim kembali ke backend.
                 */
                option.value =
                    namaProdi;


                /**
                 * Tampilan dropdown.
                 */
                if (jenjang !== '') {

                    option.textContent =
                        `${jenjang} - ${formatNama(namaProdi)}`;

                } else {

                    option.textContent =
                        formatNama(
                            namaProdi
                        );
                }


                /**
                 * Simpan data tambahan.
                 */
                option.dataset.jenjang =
                    jenjang;


                option.dataset.id =
                    prodi.id
                    ??
                    '';


                prodiFilter.appendChild(
                    option
                );
            }
        );


        /**
         * Aktifkan kembali dropdown.
         */
        prodiFilter.disabled =
            false;


        /**
         * Tidak ada prodi.
         */
        if (
            daftar.length === 0
        ) {

            tampilPesan(
                'API PDDIKTI tidak mengembalikan Program Studi Politeknik Negeri Lhokseumawe.'
            );

            return false;
        }


        tampilPesan(
            `${daftar.length} Program Studi ditemukan melalui API PDDIKTI.`,
            'success'
        );


        return true;


    } catch (error) {

        console.error(
            'Gagal mengambil Program Studi:',
            error
        );


        prodiFilter.innerHTML =
            `
            <option value="">
                -- Program Studi Gagal Dimuat --
            </option>
            `;


        prodiFilter.disabled =
            true;


        tampilPesan(
            'Program Studi gagal dimuat: '
            +
            error.message
        );


        return false;


    } finally {

        tampilLoading(
            false
        );
    }
}


/* ============================================================
   CARI MAHASISWA
============================================================ */

async function cariMahasiswa() {

    /**
     * Jangan lakukan request baru
     * jika request sebelumnya belum selesai.
     */
    if (sedangMemuat) {
        return;
    }


    sembunyikanPesan();


    /**
     * Ambil nilai filter.
     */
    const prodi =
        prodiFilter.value
            .trim();


    const tahun =
        tahunFilter.value
            .trim();


    const q =
        searchInput.value
            .trim();


    /**
     * ========================================================
     * VALIDASI PROGRAM STUDI
     * ========================================================
     */

    if (prodi === '') {

        tampilPesan(
            'Silakan pilih Program Studi terlebih dahulu.'
        );

        prodiFilter.focus();

        return;
    }


    /**
     * ========================================================
     * VALIDASI TAHUN
     * ========================================================
     */

    if (tahun === '') {

        tampilPesan(
            'Silakan pilih Tahun Angkatan.'
        );

        tahunFilter.focus();

        return;
    }


    /**
     * Tandai sedang loading.
     */
    sedangMemuat =
        true;


    /**
     * Disable tombol.
     */
    btnTerapkan.disabled =
        true;


    btnTerapkan.textContent =
        'Mencari...';


    /**
     * Reset data lama.
     */
    dataTampil = [];

    currentPage = 1;


    /**
     * Sembunyikan tabel lama.
     */
    tableSection.classList.add(
        'hidden'
    );


    /**
     * Statistik sementara.
     */
    statTotal.textContent =
        '-';


    statProdi.textContent =
        formatNama(
            prodi
        );


    statTahun.textContent =
        tahun;


    tampilLoading(
        true,
        'Mencari data mahasiswa pada API PDDIKTI...'
    );


    try {

        /**
         * ====================================================
         * QUERY PARAMETER
         * ====================================================
         */

        const params =
            new URLSearchParams();


        params.set(
            'action',
            'mahasiswa'
        );


        params.set(
            'prodi',
            prodi
        );


        params.set(
            'tahun',
            tahun
        );


        /**
         * Nama / NIM opsional.
         */
        if (q !== '') {

            params.set(
                'q',
                q
            );
        }


        /**
         * ====================================================
         * REQUEST
         * ====================================================
         */

        const response =
            await fetch(
                'api.php?'
                +
                params.toString(),
                {
                    method: 'GET',
                    cache: 'no-store'
                }
            );


        const responseText =
            await response.text();


        let json;


        try {

            json =
                JSON.parse(
                    responseText
                );

        } catch (parseError) {

            console.error(
                'Response mahasiswa bukan JSON:',
                responseText
            );


            throw new Error(
                'Response server bukan JSON yang valid.'
            );
        }


        /**
         * HTTP error.
         */
        if (!response.ok) {

            throw new Error(
                json.message
                ||
                `HTTP ${response.status}`
            );
        }


        /**
         * Internal API error.
         */
        if (!json.success) {

            throw new Error(
                json.message
                ||
                'Pencarian mahasiswa gagal.'
            );
        }


        /**
         * ====================================================
         * HASIL
         * ====================================================
         */

        const items =
            json.data?.items;


        dataTampil =
            Array.isArray(items)
                ? items
                : [];


        /**
         * ====================================================
         * STATISTIK
         * ====================================================
         */

        statTotal.textContent =
            dataTampil.length;


        statProdi.textContent =
            formatNama(
                prodi
            );


        statTahun.textContent =
            tahun;


        /**
         * ====================================================
         * DESKRIPSI TABEL
         * ====================================================
         */

        tableDescription.textContent =
            `${formatNama(prodi)} - Angkatan ${tahun}`;


        /**
         * Tampilkan tabel.
         */
        tableSection.classList.remove(
            'hidden'
        );


        /**
         * Render.
         */
        renderTable();


        /**
         * ====================================================
         * MESSAGE
         * ====================================================
         */

        if (
            dataTampil.length === 0
        ) {

            tampilPesan(
                'Belum ditemukan data mahasiswa yang sesuai pada hasil pencarian publik PDDIKTI.'
            );

        } else {

            tampilPesan(
                `${dataTampil.length} hasil API ditemukan. Jumlah ini bukan total keseluruhan mahasiswa Program Studi.`,
                'success'
            );
        }


    } catch (error) {

        console.error(
            'Gagal mencari mahasiswa:',
            error
        );


        dataTampil = [];


        statTotal.textContent =
            '-';


        /**
         * Jangan tampilkan tabel error.
         */
        tableSection.classList.add(
            'hidden'
        );


        tampilPesan(
            'Gagal mengambil data mahasiswa: '
            +
            error.message
        );


    } finally {

        sedangMemuat =
            false;


        tampilLoading(
            false
        );


        /**
         * Aktifkan kembali tombol.
         */
        btnTerapkan.disabled =
            false;


        btnTerapkan.textContent =
            'Cari Data';
    }
}


/* ============================================================
   RENDER TABLE
============================================================ */

function renderTable() {

    /**
     * Kosongkan tabel.
     */
    tableBody.innerHTML =
        '';


    const total =
        dataTampil.length;


    /**
     * Jumlah halaman.
     */
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total
                /
                perPage
            )
        );


    /**
     * Pastikan halaman aktif valid.
     */
    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;
    }


    /**
     * Index data.
     */
    const start =
        (
            currentPage - 1
        )
        *
        perPage;


    const end =
        start
        +
        perPage;


    /**
     * Data halaman aktif.
     */
    const halaman =
        dataTampil.slice(
            start,
            end
        );


    /**
     * ========================================================
     * DATA KOSONG
     * ========================================================
     */

    if (
        halaman.length === 0
    ) {

        tableBody.innerHTML =
            `
            <tr>

                <td
                    colspan="6"
                    style="
                        text-align: center;
                        padding: 35px;
                        color: #6d7f8f;
                    "
                >
                    Belum ditemukan data yang sesuai
                    pada hasil pencarian publik PDDIKTI.
                </td>

            </tr>
            `;

    } else {


        /**
         * ====================================================
         * DATA ADA
         * ====================================================
         */

        halaman.forEach(
            (
                mahasiswa,
                index
            ) => {


                const nomor =
                    start
                    +
                    index
                    +
                    1;


                const row =
                    document.createElement(
                        'tr'
                    );


                row.innerHTML =
                    `

                    <td>
                        ${nomor}
                    </td>


                    <td>

                        <span class="student-name">

                            ${
                                escapeHtml(
                                    mahasiswa.nama
                                    ??
                                    '-'
                                )
                            }

                        </span>

                    </td>


                    <td>

                        <span class="nim">

                            ${
                                escapeHtml(
                                    mahasiswa.nim
                                    ??
                                    '-'
                                )
                            }

                        </span>

                    </td>


                    <td>

                        ${
                            escapeHtml(
                                formatNama(
                                    mahasiswa.nama_prodi
                                    ??
                                    '-'
                                )
                            )
                        }

                    </td>


                    <td>

                        ${
                            escapeHtml(
                                mahasiswa.jenjang
                                ??
                                '-'
                            )
                        }

                    </td>


                    <td>

                        ${
                            escapeHtml(
                                mahasiswa.tahun_angkatan
                                ??
                                '-'
                            )
                        }

                    </td>

                    `;


                tableBody.appendChild(
                    row
                );
            }
        );
    }


    /**
     * ========================================================
     * INFORMASI JUMLAH
     * ========================================================
     */

    if (total === 0) {

        resultInfo.textContent =
            '0 hasil API';

    } else {

        const awal =
            start + 1;


        const akhir =
            Math.min(
                end,
                total
            );


        resultInfo.textContent =
            `${awal}-${akhir} dari ${total} hasil API`;
    }


    /**
     * Pagination.
     */
    renderPagination(
        totalPages
    );
}


/* ============================================================
   PAGINATION
============================================================ */

function renderPagination(
    totalPages
) {

    /**
     * Kosongkan nomor halaman.
     */
    pageNumbers.innerHTML =
        '';


    /**
     * Previous.
     */
    prevPage.disabled =
        currentPage <= 1;


    /**
     * Next.
     */
    nextPage.disabled =
        currentPage >= totalPages;


    /**
     * Maksimal 5 nomor halaman.
     */
    let startPage =
        Math.max(
            1,
            currentPage - 2
        );


    let endPage =
        Math.min(
            totalPages,
            startPage + 4
        );


    /**
     * Kalau mendekati akhir,
     * geser kembali supaya tetap
     * menampilkan maksimal 5 angka.
     */
    if (
        endPage - startPage < 4
    ) {

        startPage =
            Math.max(
                1,
                endPage - 4
            );
    }


    /**
     * Buat tombol.
     */
    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        const button =
            document.createElement(
                'button'
            );


        button.type =
            'button';


        button.className =
            'page-number'
            +
            (
                page === currentPage
                    ? ' active'
                    : ''
            );


        button.textContent =
            page;


        button.addEventListener(
            'click',
            () => {

                currentPage =
                    page;


                renderTable();


                /**
                 * Scroll kembali ke tabel.
                 */
                tableSection.scrollIntoView(
                    {
                        behavior: 'smooth',
                        block: 'start'
                    }
                );
            }
        );


        pageNumbers.appendChild(
            button
        );
    }
}


/* ============================================================
   RESET APLIKASI
============================================================ */

function resetAplikasi() {

    /**
     * Reset data.
     */
    dataTampil = [];

    currentPage = 1;


    /**
     * Reset input.
     */
    searchInput.value =
        '';


    prodiFilter.value =
        '';


    tahunFilter.value =
        '';


    /**
     * Reset statistik.
     */
    resetStatistik();


    /**
     * Reset tabel.
     */
    tableBody.innerHTML =
        '';


    tableSection.classList.add(
        'hidden'
    );


    /**
     * Reset message.
     */
    sembunyikanPesan();


    tampilPesan(
        'Silakan pilih Program Studi dan Tahun Angkatan untuk melakukan pencarian.',
        'success'
    );
}


/* ============================================================
   EVENT: CARI DATA
============================================================ */

btnTerapkan.addEventListener(
    'click',
    () => {

        cariMahasiswa();
    }
);


/* ============================================================
   EVENT: RESET
============================================================ */

btnReset.addEventListener(
    'click',
    () => {

        resetAplikasi();
    }
);


/* ============================================================
   EVENT: ENTER PADA SEARCH
============================================================ */

searchInput.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Enter'
        ) {

            event.preventDefault();


            cariMahasiswa();
        }
    }
);


/* ============================================================
   EVENT: PROGRAM STUDI BERUBAH
============================================================ */

prodiFilter.addEventListener(
    'change',
    () => {

        /**
         * Jangan langsung request API.
         *
         * Hanya ubah tampilan statistik.
         */
        const prodi =
            prodiFilter.value;


        if (prodi !== '') {

            statProdi.textContent =
                formatNama(
                    prodi
                );

        } else {

            statProdi.textContent =
                '-';
        }


        /**
         * Hasil lama disembunyikan
         * karena filter sudah berubah.
         */
        statTotal.textContent =
            '-';


        tableSection.classList.add(
            'hidden'
        );
    }
);


/* ============================================================
   EVENT: TAHUN BERUBAH
============================================================ */

tahunFilter.addEventListener(
    'change',
    () => {

        const tahun =
            tahunFilter.value;


        if (tahun !== '') {

            statTahun.textContent =
                tahun;

        } else {

            statTahun.textContent =
                '-';
        }


        /**
         * Hasil lama tidak lagi mewakili filter.
         */
        statTotal.textContent =
            '-';


        tableSection.classList.add(
            'hidden'
        );
    }
);


/* ============================================================
   EVENT: PREVIOUS PAGE
============================================================ */

prevPage.addEventListener(
    'click',
    () => {

        if (
            currentPage > 1
        ) {

            currentPage--;


            renderTable();


            tableSection.scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'start'
                }
            );
        }
    }
);


/* ============================================================
   EVENT: NEXT PAGE
============================================================ */

nextPage.addEventListener(
    'click',
    () => {

        const totalPages =
            Math.ceil(
                dataTampil.length
                /
                perPage
            );


        if (
            currentPage
            <
            totalPages
        ) {

            currentPage++;


            renderTable();


            tableSection.scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'start'
                }
            );
        }
    }
);


/* ============================================================
   INITIALIZATION
============================================================ */

async function init() {

    /**
     * Kondisi awal.
     */
    resetStatistik();


    tableSection.classList.add(
        'hidden'
    );


    /**
     * Isi dropdown Tahun Angkatan.
     */
    isiTahunAngkatan();


    /**
     * Ambil Program Studi
     * langsung dari API PDDIKTI.
     */
    const berhasil =
        await loadProgramStudi();


    /**
     * Jika prodi berhasil dimuat,
     * tampilkan petunjuk.
     */
    if (berhasil) {

        tampilPesan(
            'Silakan pilih Program Studi dan Tahun Angkatan untuk melakukan pencarian.',
            'success'
        );
    }
}


/* ============================================================
   JALANKAN APLIKASI
============================================================ */

init();