<?php

require_once __DIR__ . '/config.php';

?>
<!DOCTYPE html>

<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Data Mahasiswa PNL - API PDDIKTI
    </title>

    <link
        rel="stylesheet"
        href="style.css"
    >

</head>


<body>


<!-- ============================================================
     HEADER
============================================================ -->

<header class="header">

    <div class="header-inner">

        <div class="brand">

            <div class="brand-icon">
                PNL
            </div>

            <div>

                <h1>
                    Data Mahasiswa PNL
                </h1>

                <p>
                    Sistem Informasi Berbasis API PDDIKTI
                </p>

            </div>

        </div>


        <div class="source">

            <span>
                Sumber Data
            </span>

            <strong>
                PDDIKTI
            </strong>

        </div>

    </div>

</header>



<!-- ============================================================
     HERO
============================================================ -->

<section class="hero">

    <div class="hero-inner">

        <h2>
            Data Mahasiswa
            Politeknik Negeri Lhokseumawe
        </h2>

        <p>
            Pencarian data mahasiswa berdasarkan
            Program Studi dan Tahun Angkatan
            melalui API PDDIKTI.
        </p>

    </div>

</section>



<!-- ============================================================
     MAIN
============================================================ -->

<main class="container">


    <!-- ========================================================
         FILTER
    ======================================================== -->

    <section class="filter-card">


        <div class="filter-title">

            <h3>
                Filter Data Mahasiswa
            </h3>

            <p>
                Pilih Program Studi dan Tahun Angkatan.
                Nama atau NIM bersifat opsional.
            </p>

        </div>



        <div class="filter-grid">


            <!-- NAMA / NIM -->

            <div class="form-group">

                <label for="searchInput">
                    Nama / NIM
                </label>

                <input
                    type="text"
                    id="searchInput"
                    placeholder="Opsional: cari nama atau NIM"
                >

            </div>



            <!-- PROGRAM STUDI -->

            <div class="form-group">

                <label for="prodiFilter">
                    Program Studi
                </label>

                <select id="prodiFilter">

                    <option value="">
                        Memuat Program Studi...
                    </option>

                </select>

            </div>



            <!-- TAHUN -->

            <div class="form-group">

                <label for="tahunFilter">
                    Tahun Angkatan
                </label>

                <select id="tahunFilter">

                    <option value="">
                        -- Pilih Tahun Angkatan --
                    </option>

                </select>

            </div>


        </div>



        <div class="filter-actions">

            <button
                type="button"
                id="btnTerapkan"
                class="btn btn-primary"
            >
                Cari Data
            </button>


            <button
                type="button"
                id="btnReset"
                class="btn btn-secondary"
            >
                Reset
            </button>

        </div>

    </section>



    <!-- ========================================================
         STATISTIK
    ======================================================== -->

    <section class="stat-grid">


        <div class="stat-card">

            <span class="stat-label">
                Hasil API Ditemukan
            </span>

            <strong
                id="statTotal"
                class="stat-value"
            >
                -
            </strong>

        </div>


        <div class="stat-card">

            <span class="stat-label">
                Program Studi
            </span>

            <strong
                id="statProdi"
                class="stat-value"
            >
                -
            </strong>

        </div>


        <div class="stat-card">

            <span class="stat-label">
                Tahun Angkatan
            </span>

            <strong
                id="statTahun"
                class="stat-value"
            >
                -
            </strong>

        </div>


    </section>



    <!-- ========================================================
         MESSAGE
    ======================================================== -->

    <div
        id="messageBox"
        class="message hidden"
    ></div>



    <!-- ========================================================
         LOADING
    ======================================================== -->

    <div
        id="loadingBox"
        class="loading hidden"
    >

        <div class="spinner"></div>

        <p id="loadingText">
            Mengambil data dari PDDIKTI...
        </p>

        <small>
            Data diperoleh dari endpoint pencarian publik PDDIKTI.
        </small>

    </div>



    <!-- ========================================================
         TABLE
    ======================================================== -->

    <section
        id="tableSection"
        class="table-card hidden"
    >


        <div class="table-header">

            <div>

                <h3>
                    Hasil Pencarian Mahasiswa
                </h3>

                <p id="tableDescription">
                    Hasil pencarian API PDDIKTI
                </p>

            </div>


            <div id="resultInfo">
                0 hasil
            </div>

        </div>



        <div class="table-responsive">

            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Nama
                        </th>

                        <th>
                            NIM
                        </th>

                        <th>
                            Program Studi
                        </th>

                        <th>
                            Jenjang
                        </th>

                        <th>
                            Tahun Angkatan
                        </th>

                    </tr>

                </thead>


                <tbody id="studentTableBody">

                </tbody>

            </table>

        </div>



        <!-- PAGINATION -->

        <div class="pagination">

            <button
                id="prevPage"
                type="button"
                class="page-button"
            >
                ← Sebelumnya
            </button>


            <div
                id="pageNumbers"
                class="page-numbers"
            ></div>


            <button
                id="nextPage"
                type="button"
                class="page-button"
            >
                Berikutnya →
            </button>

        </div>

    </section>



    <!-- ========================================================
         CATATAN METODOLOGI
    ======================================================== -->

    <section class="note">

        <strong>
            Catatan:
        </strong>

        Data mahasiswa dan Program Studi diperoleh
        melalui endpoint publik yang digunakan PDDIKTI.

        Jumlah hasil pada aplikasi adalah
        <strong>jumlah hasil pencarian API</strong>,
        bukan jumlah keseluruhan mahasiswa
        pada Program Studi tersebut.

        Tahun Angkatan ditentukan dari
        empat digit awal NIM pada hasil API,
        bukan dari field tanggal masuk.

    </section>


</main>



<!-- ============================================================
     FOOTER
============================================================ -->

<footer>

    <div>

        Sistem Informasi Data Mahasiswa
        Politeknik Negeri Lhokseumawe

        <br>

        Integrasi API PDDIKTI -
        Mata Kuliah Sistem Terintegrasi

    </div>

</footer>



<script src="script.js"></script>


</body>

</html>