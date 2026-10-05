const API_BASE = "https://api-pddikti.kemdiktisaintek.go.id";
const PT_NAME = "Politeknik Negeri Lhokseumawe";
const CORS_PROXY = "https://thingproxy.freeboard.io/fetch/";

// DOM Elements
const selectProdi = document.getElementById('selectProdi');
const selectTahun = document.getElementById('selectTahun');
const inputKeyword = document.getElementById('inputKeyword');
const btnCari = document.getElementById('btnCari');
const btnReset = document.getElementById('btnReset');
const infoJumlah = document.getElementById('infoJumlah');
const infoProdi = document.getElementById('infoProdi');
const infoTahun = document.getElementById('infoTahun');
const loadingBox = document.getElementById('loadingBox');
const errorBox = document.getElementById('errorBox');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');

// Data state
let allMahasiswaData = []; 
let mapJenjangProdi = {};

// Fungsi fetch menggunakan Proxy
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const url = CORS_PROXY + encodeURIComponent(API_BASE + endpoint);
    const options = {
        method: method,
        headers: { 'Accept': 'application/json' }
    };
    if (method === 'POST' && body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
}

// Inisialisasi: Muat Program Studi
async function init() {
    try {
        const res = await fetchAPI('/pencarian/enc/all/' + encodeURIComponent(PT_NAME));
        if (res.status === 'success' && res.data.prodi) {
            let prodiList = res.data.prodi.filter(p => p.pt.toLowerCase().includes("lhokseumawe"));
            
            // Urutkan abjad
            prodiList.sort((a, b) => a.nama.localeCompare(b.nama));
            
            prodiList.forEach(p => {
                mapJenjangProdi[p.nama.toLowerCase()] = p.jenjang;
                let option = document.createElement('option');
                option.value = p.nama;
                option.textContent = `${p.jenjang} - ${p.nama}`;
                selectProdi.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Gagal memuat prodi:", error);
    }
}

// Fungsi Mengambil Detail Mahasiswa
async function lengkapiDetail(mhsDasar) {
    // Ambil detail serentak menggunakan Promise.all agar lebih cepat
    const detailPromises = mhsDasar.map(async (mhs) => {
        let tahunMasuk = "";
        let status = "-";
        let jenjang = mapJenjangProdi[mhs.nama_prodi.toLowerCase()] || "-";
        
        try {
            // Ambil detail berdasarkan ID
            const resDetail = await fetchAPI('/detail/mhs', 'POST', { id: mhs.id });
            if (resDetail.status === 'success' && resDetail.data) {
                const data = resDetail.data;
                
                // Ekstrak Tahun dari Tanggal (contoh format API PDDIKTI: 2023-08-15)
                if (data.tanggal_masuk) {
                    tahunMasuk = data.tanggal_masuk.substring(0, 4);
                } else if (data.tahun_masuk) {
                    tahunMasuk = data.tahun_masuk.toString();
                }
                
                status = data.status_saat_ini || "-";
                jenjang = data.jenjang || jenjang;
            }
        } catch (e) {
            console.error("Gagal detail untuk:", mhs.nama);
        }

        return {
            ...mhs,
            tahun_masuk: tahunMasuk,
            status_saat_ini: status,
            jenjang: jenjang
        };
    });

    return await Promise.all(detailPromises);
}

// Eksekusi Pencarian
btnCari.addEventListener('click', async () => {
    let keyword = inputKeyword.value.trim();
    let prodi = selectProdi.value;
    let filterTahun = selectTahun.value;

    // Logika Keyword seperti aslinya
    let searchQuery = PT_NAME;
    if (keyword !== "") {
        searchQuery = keyword;
    } else if (prodi !== "all") {
        searchQuery = `${prodi} ${PT_NAME}`;
    }

    // Reset UI
    errorBox.style.display = 'none';
    tableContainer.style.display = 'none';
    tableBody.innerHTML = '';
    loadingBox.style.display = 'block';
    btnCari.disabled = true;

    try {
        // 1. Pencarian Dasar
        const resDasar = await fetchAPI('/pencarian/enc/all/' + encodeURIComponent(searchQuery));
        if (resDasar.status !== 'success') throw new Error("Gagal mengambil data pencarian.");

        let mhsDasar = resDasar.data.mahasiswa || [];

        // Filter kampus dan prodi (berjaga-jaga jika API mengembalikan data kampus lain)
        mhsDasar = mhsDasar.filter(m => {
            let isKampus = m.nama_pt.toLowerCase().includes("lhokseumawe");
            let isProdi = prodi === "all" || m.nama_prodi.toLowerCase() === prodi.toLowerCase();
            return isKampus && isProdi;
        });

        // 2. Lengkapi Data dengan POST Detail
        allMahasiswaData = await lengkapiDetail(mhsDasar);

        // 3. Perbarui Dropdown Tahun Masuk (Ekstrak tahun unik dari hasil)
        updateDropdownTahun(allMahasiswaData, filterTahun);

        // 4. Filter berdasarkan Tahun (jika dipilih)
        let finalData = allMahasiswaData;
        if (filterTahun !== "all") {
            finalData = allMahasiswaData.filter(m => m.tahun_masuk === filterTahun);
        }

        tampilkanTabel(finalData, prodi, filterTahun);

    } catch (error) {
        errorBox.textContent = `Error: ${error.message} (Pastikan jaringan stabil atau CORS Proxy tidak down).`;
        errorBox.style.display = 'block';
    } finally {
        loadingBox.style.display = 'none';
        btnCari.disabled = false;
    }
});

function updateDropdownTahun(data, selectedTahun) {
    let tahunSet = new Set();
    data.forEach(m => {
        if (m.tahun_masuk) tahunSet.add(m.tahun_masuk);
    });

    let tahunArray = Array.from(tahunSet).sort((a, b) => b - a); // Urutkan tahun terbaru
    
    selectTahun.innerHTML = '<option value="all">Semua Tahun</option>';
    tahunArray.forEach(t => {
        let option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        if (t === selectedTahun) option.selected = true;
        selectTahun.appendChild(option);
    });
}

function tampilkanTabel(data, prodiVal, tahunVal) {
    infoJumlah.textContent = data.length;
    infoProdi.textContent = prodiVal === "all" ? "Semua Program Studi" : prodiVal;
    infoTahun.textContent = tahunVal === "all" ? "Semua Tahun" : tahunVal;

    if (data.length === 0) {
        errorBox.textContent = "Tidak ada data mahasiswa yang ditemukan untuk filter tersebut.";
        errorBox.style.display = 'block';
        return;
    }

    data.forEach(mhs => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold">${mhs.nim || '-'}</td>
            <td>${mhs.nama || '-'}</td>
            <td>${mhs.nama_prodi || '-'}</td>
            <td>${mhs.jenjang || '-'}</td>
            <td>${mhs.tahun_masuk || '-'}</td>
            <td><span class="badge ${mhs.status_saat_ini.includes('Aktif') ? 'bg-success' : 'bg-secondary'}">${mhs.status_saat_ini}</span></td>
        `;
        tableBody.appendChild(tr);
    });

    tableContainer.style.display = 'block';
}

btnReset.addEventListener('click', () => {
    inputKeyword.value = '';
    selectProdi.value = 'all';
    selectTahun.innerHTML = '<option value="all">Semua Tahun</option>';
    errorBox.style.display = 'none';
    tableContainer.style.display = 'none';
    infoJumlah.textContent = '-';
    infoProdi.textContent = 'Semua Program Studi';
    infoTahun.textContent = 'Semua Tahun';
});

// Mulai aplikasi
init();
