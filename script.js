// Konfigurasi API
const KAMPUS = "Politeknik Negeri Lhokseumawe";
const PDDIKTI_URL = "https://api-pddikti.kemdiktisaintek.go.id/pencarian/enc/all/";
// Menggunakan CORS Proxy publik untuk membypass blokir browser
const CORS_PROXY = "https://corsproxy.io/?";

const btnCari = document.getElementById('btnCari');
const btnReset = document.getElementById('btnReset');
const inputKeyword = document.getElementById('inputKeyword');
const selectProdi = document.getElementById('selectProdi');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const resultBox = document.getElementById('resultBox');
const tableMahasiswa = document.getElementById('tableMahasiswa');
const bodyMahasiswa = document.getElementById('bodyMahasiswa');
const jumlahData = document.getElementById('jumlahData');

// Fungsi utama mengambil data
async function fetchData(keyword) {
    try {
        const url = CORS_PROXY + encodeURIComponent(PDDIKTI_URL + keyword);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Gagal terhubung ke API atau Proxy mati.");
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Eksekusi Pencarian
btnCari.addEventListener('click', async () => {
    let keyword = inputKeyword.value.trim();
    let prodi = selectProdi.value;

    // Susun keyword pencarian
    let query = KAMPUS;
    if (keyword !== "") {
        query = keyword; // Jika spesifik cari NIM/Nama
    } else if (prodi !== "all") {
        query = prodi + " " + KAMPUS; // Jika cari berdasarkan prodi
    }

    // Reset UI
    errorBox.style.display = 'none';
    resultBox.style.display = 'none';
    tableMahasiswa.style.display = 'none';
    bodyMahasiswa.innerHTML = '';
    loading.style.display = 'block';
    btnCari.disabled = true;

    try {
        const response = await fetchData(query);
        
        if (response.status !== "success") {
            throw new Error("Data PDDIKTI tidak ditemukan.");
        }

        let mahasiswa = response.data.mahasiswa || [];

        // Filter manual untuk memastikan hanya mahasiswa PNL dan Prodi yang sesuai
        let hasilFilter = mahasiswa.filter(m => {
            let isKampusBenar = m.nama_pt.toLowerCase().includes("lhokseumawe");
            let isProdiBenar = prodi === "all" || m.nama_prodi === prodi;
            return isKampusBenar && isProdiBenar;
        });

        tampilkanData(hasilFilter);
    } catch (error) {
        errorBox.textContent = "Gagal mengambil data: " + error.message;
        errorBox.style.display = 'block';
    } finally {
        loading.style.display = 'none';
        btnCari.disabled = false;
    }
});

// Fungsi Menampilkan Tabel
function tampilkanData(data) {
    jumlahData.textContent = data.length;
    resultBox.style.display = 'block';

    if (data.length === 0) return;

    data.forEach(mhs => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mhs.nama}</td>
            <td>${mhs.nim}</td>
            <td>${mhs.nama_prodi}</td>
            <td>${mhs.nama_pt}</td>
        `;
        bodyMahasiswa.appendChild(tr);
    });

    tableMahasiswa.style.display = 'table';
}

// Tombol Reset
btnReset.addEventListener('click', () => {
    inputKeyword.value = '';
    selectProdi.value = 'all';
    errorBox.style.display = 'none';
    resultBox.style.display = 'none';
    tableMahasiswa.style.display = 'none';
    bodyMahasiswa.innerHTML = '';
});

// (Opsional) Fungsi ini bisa dipakai untuk memuat daftar prodi otomatis saat halaman dimuat
async function muatProdi() {
    try {
        const response = await fetchData(KAMPUS);
        if (response.data && response.data.prodi) {
            let listProdi = response.data.prodi.filter(p => p.pt.toLowerCase().includes("lhokseumawe"));
            listProdi.forEach(p => {
                let opt = document.createElement('option');
                opt.value = p.nama;
                opt.textContent = p.jenjang + " - " + p.nama;
                selectProdi.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Gagal memuat prodi otomatis", e);
    }
}

// Jalankan muat prodi saat awal buka web
muatProdi();