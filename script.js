/**
 * ============================================================
 * DATA MAHASISWA PNL
 * DATA HASIL API PDDIKTI DALAM FILE JSON
 *
 * Website tidak menghubungi PDDIKTI secara langsung.
 * Data JSON dibuat melalui PHP lokal dari API PDDIKTI.
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
   NORMALISASI
============================================================ */

function normalisasi(text) {

    return String(text ?? '')
        .trim()
        .toLowerCase();
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
    text = 'Memuat data...'
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
   LOAD PROGRAM STUDI DARI JSON
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
                './data/prodi.json',
                {
                    cache: 'no-store'
                }
            );


        if (!response.ok) {

            throw new Error(
                'HTTP '
                +
                response.status
            );
        }


        const json =
            await response.json();


        if (!json.success) {

            throw new Error(
                json.message
                ||
                'Data Program Studi tidak valid.'
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
            'Daftar Program Studi gagal dimuat dari JSON: '
            +
            error.message
        );


    } finally {

        prodiFilter.disabled =
            false;
    }
}


/* ============================================================
   LOAD MAHASISWA DARI JSON
============================================================ */

async function loadDataMahasiswa() {

    sedangMemuat =
        true;


    tampilLoading(
        true,
        'Memuat data mahasiswa...'
    );


    try {

        const response =
            await fetch(
                './data/mahasiswa.json',
                {
                    cache: 'no-store'
                }
            );


        if (!response.ok) {

            throw new Error(
                'HTTP '
                +
                response.status
            );
        }


        const json =
            await response.json();


        if (!json.success) {

            throw new Error(
                json.message
                ||
                'Data mahasiswa tidak valid.'
            );
        }


        semuaMahasiswa =
            Array.isArray(
                json.data?.items
            )
                ? json.data.items
                : [];


        semuaMahasiswa =
            acakArray(
                semuaMahasiswa
            );


        isiTahunSesuaiProdi();


        terapkanFilterLokal();


        tampilPesan(
            `${semuaMahasiswa.length} data hasil API PDDIKTI berhasil dimuat dari JSON.`,
            'success'
        );


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
            'Gagal membaca data mahasiswa: '
            +
            error.message
        );


    } finally {

        sedangMemuat =
            false;


        tampilLoading(
            false
        );
    }
}


/* ============================================================
   ISI TAHUN BERDASARKAN PROGRAM STUDI
============================================================ */

function isiTahunSesuaiProdi(
    nilaiDipertahankan = 'all'
) {

    const prodi =
        prodiFilter.value
        ||
        'all';


    let sumber =
        semuaMahasiswa;


    if (prodi !== 'all') {

        sumber =
            semuaMahasiswa.filter(
                mahasiswa =>
                    normalisasi(
                        mahasiswa.nama_prodi
                    )
                    ===
                    normalisasi(
                        prodi
                    )
            );
    }


    const tahunSet =
        new Set();


    sumber.forEach(
        mahasiswa => {

            const tahun =
                String(
                    mahasiswa.tahun_masuk
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
   FILTER LOKAL
============================================================ */

function terapkanFilterLokal() {

    sembunyikanPesan();


    const q =
        normalisasi(
            searchInput.value
        );


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
                 * Filter Nama / NIM.
                 */
                if (q !== '') {

                    const nama =
                        normalisasi(
                            mahasiswa.nama
                        );


                    const nim =
                        normalisasi(
                            mahasiswa.nim
                        );


                    if (
                        !nama.includes(q)
                        &&
                        !nim.includes(q)
                    ) {

                        return false;
                    }
                }


                /*
                 * Filter Program Studi.
                 */
                if (
                    prodi !== 'all'
                    &&
                    normalisasi(
                        mahasiswa.nama_prodi
                    )
                    !==
                    normalisasi(
                        prodi
                    )
                ) {

                    return false;
                }


                /*
                 * Filter Tahun Masuk.
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


    if (
        dataTampil.length === 0
    ) {

        tampilPesan(
            'Tidak ada data yang sesuai dengan filter.'
        );

    } else {

        tampilPesan(
            `${dataTampil.length} data ditemukan dari dataset hasil API PDDIKTI.`,
            'success'
        );
    }
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
            '0 hasil';

    } else {

        const awal =
            start + 1;


        const akhir =
            Math.min(
                end,
                total
            );


        resultInfo.textContent =
            `${awal}-${akhir} dari ${total} hasil`;
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
    () => {

        tahunFilter.value =
            'all';


        isiTahunSesuaiProdi();


        terapkanFilterLokal();
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
    () => {

        terapkanFilterLokal();
    }
);


/* ============================================================
   ENTER NAMA / NIM
============================================================ */

searchInput.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Enter'
        ) {

            event.preventDefault();


            terapkanFilterLokal();
        }
    }
);


/* ============================================================
   RESET
============================================================ */

btnReset.addEventListener(
    'click',
    () => {

        searchInput.value =
            '';


        prodiFilter.value =
            'all';


        tahunFilter.value =
            'all';


        semuaMahasiswa =
            acakArray(
                semuaMahasiswa
            );


        isiTahunSesuaiProdi();


        terapkanFilterLokal();
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


    await loadProgramStudi();


    prodiFilter.value =
        'all';


    await loadDataMahasiswa();
}


/* ============================================================
   START
============================================================ */

init();