/**
 * ============================================================
 * DATA MAHASISWA PNL
 * API PUBLIK PDDIKTI
 *
 * Tahun masuk berasal dari DETAIL mahasiswa PDDIKTI.
 * TIDAK berasal dari NIM.
 * ============================================================
 */


/* ============================================================
   GLOBAL
============================================================ */

let semuaMahasiswa = [];

let dataTampil = [];

let currentPage = 1;

const perPage = 10;

let sedangMemuat = false;


/* ============================================================
   DOM
============================================================ */

const searchInput =
    document.getElementById('searchInput');

const prodiFilter =
    document.getElementById('prodiFilter');

const tahunFilter =
    document.getElementById('tahunFilter');

const btnTerapkan =
    document.getElementById('btnTerapkan');

const btnReset =
    document.getElementById('btnReset');

const loadingBox =
    document.getElementById('loadingBox');

const loadingText =
    document.getElementById('loadingText');

const messageBox =
    document.getElementById('messageBox');

const tableSection =
    document.getElementById('tableSection');

const tableBody =
    document.getElementById('studentTableBody');

const resultInfo =
    document.getElementById('resultInfo');

const tableDescription =
    document.getElementById('tableDescription');

const statTotal =
    document.getElementById('statTotal');

const statProdi =
    document.getElementById('statProdi');

const statTahun =
    document.getElementById('statTahun');

const prevPage =
    document.getElementById('prevPage');

const nextPage =
    document.getElementById('nextPage');

const pageNumbers =
    document.getElementById('pageNumbers');


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ============================================================
   FORMAT NAMA
============================================================ */

function formatNama(text) {

    return String(text ?? '')
        .trim()
        .toLowerCase()
        .replace(
            /\b\w/g,
            huruf =>
                huruf.toUpperCase()
        );
}


/* ============================================================
   LABEL
============================================================ */

function labelProdi(value) {

    if (
        value === ''
        ||
        value === 'all'
    ) {

        return 'Semua Program Studi';
    }


    return formatNama(value);
}


function labelTahun(value) {

    if (
        value === ''
        ||
        value === 'all'
    ) {

        return 'Semua Tahun';
    }


    return value;
}


/* ============================================================
   RANDOM
============================================================ */

function acakArray(array) {

    const hasil =
        [...array];


    for (
        let i = hasil.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random()
                *
                (i + 1)
            );


        [
            hasil[i],
            hasil[j]
        ] =
        [
            hasil[j],
            hasil[i]
        ];
    }


    return hasil;
}


/* ============================================================
   MESSAGE
============================================================ */

function tampilPesan(
    text,
    type = 'error'
) {

    messageBox.textContent =
        text;


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


function sembunyikanPesan() {

    messageBox.classList.add(
        'hidden'
    );
}


/* ============================================================
   LOADING
============================================================ */

function tampilLoading(
    tampil,
    text = 'Mengambil data dari PDDIKTI...'
) {

    loadingText.textContent =
        text;


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
   PROGRAM STUDI
============================================================ */

async function loadProgramStudi() {

    prodiFilter.innerHTML =
        `
        <option value="all">
            Semua Program Studi
        </option>
        `;


    prodiFilter.disabled =
        true;


    try {

        const response =
            await fetch(
                'api.php?action=prodi&t='
                +
                Date.now(),
                {
                    cache: 'no-store'
                }
            );


        const json =
            await response.json();


        if (
            !response.ok
            ||
            !json.success
        ) {

            throw new Error(
                json.message
                ||
                'Program Studi gagal dimuat.'
            );
        }


        const daftar =
            Array.isArray(
                json.data?.items
            )
                ? json.data.items
                : [];


        daftar.forEach(
            prodi => {

                const nama =
                    String(
                        prodi.nama_prodi
                        ??
                        ''
                    ).trim();


                const jenjang =
                    String(
                        prodi.jenjang
                        ??
                        ''
                    ).trim();


                if (nama === '') {

                    return;
                }


                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    nama;


                option.textContent =
                    jenjang !== ''
                        ? `${jenjang} - ${formatNama(nama)}`
                        : formatNama(nama);


                prodiFilter.appendChild(
                    option
                );
            }
        );


    } catch (error) {

        console.error(error);


        tampilPesan(
            'Daftar Program Studi gagal dimuat: '
            +
            error.message
        );


    } finally {

        prodiFilter.disabled =
            false;
    }
}


/* ============================================================
   ISI TAHUN DARI DATA DETAIL PDDIKTI
============================================================ */

function isiTahunDariData(
    mahasiswa,
    nilaiDipertahankan = 'all'
) {

    const tahunSet =
        new Set();


    mahasiswa.forEach(
        item => {

            const tahun =
                String(
                    item.tahun_masuk
                    ??
                    ''
                ).trim();


            if (
                /^\d{4}$/.test(tahun)
            ) {

                tahunSet.add(
                    tahun
                );
            }
        }
    );


    const daftarTahun =
        Array.from(
            tahunSet
        ).sort(
            (a, b) =>
                Number(b)
                -
                Number(a)
        );


    tahunFilter.innerHTML =
        `
        <option value="all">
            Semua Tahun
        </option>
        `;


    daftarTahun.forEach(
        tahun => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                tahun;


            option.textContent =
                tahun;


            tahunFilter.appendChild(
                option
            );
        }
    );


    /*
     * Pertahankan pilihan jika masih tersedia.
     */
    const tersedia =
        [
            ...tahunFilter.options
        ].some(
            option =>
                option.value
                ===
                nilaiDipertahankan
        );


    tahunFilter.value =
        tersedia
            ? nilaiDipertahankan
            : 'all';
}


/* ============================================================
   LOAD MAHASISWA DARI API
============================================================ */

async function loadMahasiswa(
    randomkan = false
) {

    if (sedangMemuat) {

        return;
    }


    sedangMemuat =
        true;


    sembunyikanPesan();


    const prodi =
        prodiFilter.value
        ||
        'all';


    const q =
        searchInput.value
            .trim();


    const tahunSebelumnya =
        tahunFilter.value
        ||
        'all';


    btnTerapkan.disabled =
        true;


    btnTerapkan.textContent =
        'Memuat...';


    tampilLoading(
        true,
        'Mengambil pencarian dan detail mahasiswa dari PDDIKTI...'
    );


    try {

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


        /*
         * Backend kita minta semua tahun dahulu.
         * Tahun akan difilter setelah detail tersedia.
         */
        params.set(
            'tahun',
            'all'
        );


        if (q !== '') {

            params.set(
                'q',
                q
            );
        }


        params.set(
            't',
            Date.now()
        );


        const response =
            await fetch(
                'api.php?'
                +
                params.toString(),
                {
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

        } catch {

            console.error(
                responseText
            );


            throw new Error(
                'Response server bukan JSON valid.'
            );
        }


        if (
            !response.ok
            ||
            !json.success
        ) {

            throw new Error(
                json.message
                ||
                'Data mahasiswa gagal dimuat.'
            );
        }


        semuaMahasiswa =
            Array.isArray(
                json.data?.items
            )
                ? json.data.items
                : [];


        /*
         * Dropdown tahun sekarang benar-benar
         * berasal dari tanggal_masuk detail PDDIKTI.
         */
        isiTahunDariData(
            semuaMahasiswa,
            tahunSebelumnya
        );


        /*
         * Random hanya pada tampilan umum.
         */
        if (
            randomkan
            &&
            prodi === 'all'
            &&
            tahunFilter.value === 'all'
            &&
            q === ''
        ) {

            semuaMahasiswa =
                acakArray(
                    semuaMahasiswa
                );
        }


        terapkanFilterLokal();


        if (
            semuaMahasiswa.length === 0
        ) {

            tampilPesan(
                'Belum ditemukan data mahasiswa pada hasil pencarian publik PDDIKTI.'
            );

        } else {

            tampilPesan(
                `${semuaMahasiswa.length} hasil API berhasil diproses. Tahun masuk berasal dari detail mahasiswa PDDIKTI.`,
                'success'
            );
        }


    } catch (error) {

        console.error(error);


        semuaMahasiswa =
            [];


        dataTampil =
            [];


        tableSection.classList.add(
            'hidden'
        );


        statTotal.textContent =
            '-';


        tampilPesan(
            'Gagal mengambil data: '
            +
            error.message
        );


    } finally {

        sedangMemuat =
            false;


        tampilLoading(
            false
        );


        btnTerapkan.disabled =
            false;


        btnTerapkan.textContent =
            'Terapkan Filter';
    }
}


/* ============================================================
   FILTER LOKAL BERDASARKAN TAHUN
============================================================ */

function terapkanFilterLokal() {

    const prodi =
        prodiFilter.value
        ||
        'all';


    const tahun =
        tahunFilter.value
        ||
        'all';


    dataTampil =
        semuaMahasiswa.filter(
            mahasiswa => {

                /*
                 * Backend sudah memfilter prodi,
                 * tetapi kita validasi lagi.
                 */
                if (
                    prodi !== 'all'
                    &&
                    String(
                        mahasiswa.nama_prodi
                        ??
                        ''
                    ).trim().toLowerCase()
                    !==
                    String(prodi)
                        .trim()
                        .toLowerCase()
                ) {

                    return false;
                }


                /*
                 * Filter tahun masuk ASLI.
                 */
                if (
                    tahun !== 'all'
                    &&
                    String(
                        mahasiswa.tahun_masuk
                        ??
                        ''
                    )
                    !==
                    tahun
                ) {

                    return false;
                }


                return true;
            }
        );


    currentPage =
        1;


    statTotal.textContent =
        dataTampil.length;


    statProdi.textContent =
        labelProdi(
            prodi
        );


    statTahun.textContent =
        labelTahun(
            tahun
        );


    tableDescription.textContent =
        labelProdi(prodi)
        +
        ' - '
        +
        labelTahun(tahun);


    tableSection.classList.remove(
        'hidden'
    );


    renderTable();
}


/* ============================================================
   TABLE
============================================================ */

function renderTable() {

    tableBody.innerHTML =
        '';


    const total =
        dataTampil.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total
                /
                perPage
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;
    }


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


    const halaman =
        dataTampil.slice(
            start,
            end
        );


    if (
        halaman.length === 0
    ) {

        tableBody.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:35px;
                    "
                >
                    Tidak ada data yang ditemukan.
                </td>
            </tr>
            `;
    }


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
                                ||
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
                                ||
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
                                ||
                                '-'
                            )
                        )
                    }

                </td>


                <td>

                    ${
                        escapeHtml(
                            mahasiswa.jenjang
                            ||
                            '-'
                        )
                    }

                </td>


                <td>

                    ${
                        escapeHtml(
                            mahasiswa.tahun_masuk
                            ||
                            '-'
                        )
                    }

                </td>


                <td>

                    ${
                        escapeHtml(
                            mahasiswa.status_saat_ini
                            ||
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

    pageNumbers.innerHTML =
        '';


    prevPage.disabled =
        currentPage <= 1;


    nextPage.disabled =
        currentPage >= totalPages;


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


    if (
        endPage - startPage < 4
    ) {

        startPage =
            Math.max(
                1,
                endPage - 4
            );
    }


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


        button.textContent =
            page;


        button.className =
            'page-number'
            +
            (
                page === currentPage
                    ? ' active'
                    : ''
            );


        button.addEventListener(
            'click',
            () => {

                currentPage =
                    page;


                renderTable();
            }
        );


        pageNumbers.appendChild(
            button
        );
    }
}


/* ============================================================
   PROGRAM STUDI BERUBAH
============================================================ */

prodiFilter.addEventListener(
    'change',
    async () => {

        /*
         * Set kembali Semua Tahun karena dataset
         * Program Studi akan berubah.
         */
        tahunFilter.innerHTML =
            `
            <option value="all">
                Semua Tahun
            </option>
            `;


        tahunFilter.value =
            'all';


        await loadMahasiswa();
    }
);


/* ============================================================
   TAHUN BERUBAH
============================================================ */

tahunFilter.addEventListener(
    'change',
    () => {

        terapkanFilterLokal();
    }
);


/* ============================================================
   TOMBOL FILTER
============================================================ */

btnTerapkan.addEventListener(
    'click',
    async () => {

        await loadMahasiswa();
    }
);


/* ============================================================
   ENTER NAMA / NIM
============================================================ */

searchInput.addEventListener(
    'keydown',
    async event => {

        if (
            event.key === 'Enter'
        ) {

            event.preventDefault();


            await loadMahasiswa();
        }
    }
);


/* ============================================================
   RESET
============================================================ */

btnReset.addEventListener(
    'click',
    async () => {

        searchInput.value =
            '';


        prodiFilter.value =
            'all';


        tahunFilter.innerHTML =
            `
            <option value="all">
                Semua Tahun
            </option>
            `;


        tahunFilter.value =
            'all';


        await loadMahasiswa(
            true
        );
    }
);


/* ============================================================
   PREVIOUS
============================================================ */

prevPage.addEventListener(
    'click',
    () => {

        if (
            currentPage > 1
        ) {

            currentPage--;


            renderTable();
        }
    }
);


/* ============================================================
   NEXT
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
            currentPage < totalPages
        ) {

            currentPage++;


            renderTable();
        }
    }
);


/* ============================================================
   INIT
============================================================ */

async function init() {

    statTotal.textContent =
        '-';


    statProdi.textContent =
        'Semua Program Studi';


    statTahun.textContent =
        'Semua Tahun';


    tahunFilter.innerHTML =
        `
        <option value="all">
            Semua Tahun
        </option>
        `;


    /*
     * 1. Ambil Program Studi.
     */
    await loadProgramStudi();


    prodiFilter.value =
        'all';


    /*
     * 2. Langsung tampilkan mahasiswa.
     */
    await loadMahasiswa(
        true
    );
}


/* ============================================================
   START
============================================================ */

init();
