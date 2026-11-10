// ======================================
// SIMRS RAWAT INAP - VERSI DEMONSTRASI
// ======================================

const KEY_PASIEN = "simrs_pasien_v2";
const KEY_RAWAT = "simrs_rawat_v2";

// DATA KAMAR CONTOH
const kamar = [
    { nomor: "A101", kelas: "VIP", kapasitas: 1 },
    { nomor: "A102", kelas: "VIP", kapasitas: 1 },
    { nomor: "B201", kelas: "Kelas I", kapasitas: 2 },
    { nomor: "B202", kelas: "Kelas I", kapasitas: 2 },
    { nomor: "C301", kelas: "Kelas II", kapasitas: 3 },
    { nomor: "C302", kelas: "Kelas III", kapasitas: 4 }
];

// DATA DOKTER CONTOH
const dokter = [
    { id: "D001", nama: "dr. Andi", spesialisasi: "Penyakit Dalam" },
    { id: "D002", nama: "dr. Budi", spesialisasi: "Bedah" },
    { id: "D003", nama: "dr. Citra", spesialisasi: "Anak" }
];

// ======================================
// FUNGSI PENYIMPANAN
// ======================================

function ambilData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function simpanData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function dataPasien() {
    return ambilData(KEY_PASIEN);
}

function dataRawat() {
    return ambilData(KEY_RAWAT);
}

// ======================================
// FUNGSI UMUM
// ======================================

function tanggalHariIni() {
    const t = new Date();

    return [
        t.getFullYear(),
        String(t.getMonth() + 1).padStart(2, "0"),
        String(t.getDate()).padStart(2, "0")
    ].join("-");
}

function buatNomorRM() {
    const data = dataPasien();
    let nomor = 1;

    while (
        data.some(p =>
            p.rm === "RM-" + String(nomor).padStart(5, "0")
        )
    ) {
        nomor++;
    }

    return "RM-" + String(nomor).padStart(5, "0");
}

function buatSel(teks) {
    const td = document.createElement("td");
    td.textContent = teks;
    return td;
}

function tampilkanKosong(tbody, jumlahKolom, pesan) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = jumlahKolom;
    td.className = "empty-row";
    td.textContent = pesan;

    tr.appendChild(td);
    tbody.appendChild(tr);
}

// ======================================
// PENDAFTARAN PASIEN
// ======================================

document.getElementById("formPasien")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const data = dataPasien();
    const nik = document.getElementById("nik").value.trim();

    if (data.some(p => p.nik === nik)) {
        alert("NIK sudah terdaftar. Silakan periksa kembali.");
        return;
    }

    const pasien = {
        rm: buatNomorRM(),
        nama: document.getElementById("nama").value.trim(),
        nik: nik,
        tanggalLahir: document.getElementById("tanggalLahir").value,
        jenisKelamin: document.getElementById("jenisKelamin").value,
        telepon: document.getElementById("telepon").value.trim(),
        alamat: document.getElementById("alamat").value.trim()
    };

    data.push(pasien);

    try {
        simpanData(KEY_PASIEN, data);

        alert(
            "Pendaftaran berhasil!\nNomor Rekam Medis: " + pasien.rm
        );

        this.reset();
        perbaruiSemua();
    } catch {
        alert("Data gagal disimpan. Periksa penyimpanan browser.");
    }
});

// ======================================
// PENDAFTARAN RAWAT INAP
// ======================================

document.getElementById("formRawat")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const rm = document.getElementById("pilihPasien").value;
    const nomorKamar = document.getElementById("pilihKamar").value;
    const idDokter = document.getElementById("pilihDokter").value;
    const tanggalMasuk = document.getElementById("tanggalMasuk").value;
    const diagnosis = document.getElementById("diagnosis").value.trim();

    const pasien = dataPasien().find(p => p.rm === rm);
    const kamarDipilih = kamar.find(k => k.nomor === nomorKamar);
    const dokterDipilih = dokter.find(d => d.id === idDokter);
    const rawat = dataRawat();

    if (!pasien || !kamarDipilih || !dokterDipilih) {
        alert("Lengkapi pilihan pasien, kamar, dan dokter.");
        return;
    }

    if (rawat.some(r => r.rm === rm && r.status === "Dirawat")) {
        alert("Pasien masih tercatat sedang menjalani rawat inap.");
        return;
    }

    const jumlahTerisi = rawat.filter(r =>
        r.kamar === nomorKamar && r.status === "Dirawat"
    ).length;

    if (jumlahTerisi >= kamarDipilih.kapasitas) {
        alert("Kamar sudah penuh. Silakan pilih kamar lain.");
        return;
    }

    if (tanggalMasuk > tanggalHariIni()) {
        alert("Tanggal masuk tidak boleh di masa depan.");
        return;
    }

    const kunjungan = {
        id: "RI-" + Date.now(),
        rm: pasien.rm,
        nama: pasien.nama,
        kamar: kamarDipilih.nomor,
        dokter: dokterDipilih.nama,
        tanggalMasuk: tanggalMasuk,
        diagnosis: diagnosis,
        tanggalKeluar: "",
        status: "Dirawat"
    };

    rawat.push(kunjungan);

    try {
        simpanData(KEY_RAWAT, rawat);

        alert("Pendaftaran rawat inap berhasil disimpan!");

        this.reset();
        document.getElementById("tanggalMasuk").value = tanggalHariIni();

        perbaruiSemua();
    } catch {
        alert("Data rawat inap gagal disimpan.");
    }
});

// ======================================
// PASIEN KELUAR
// ======================================

function pasienKeluar(id) {

    const yakin = confirm(
        "Apakah pasien benar-benar sudah keluar dari rawat inap?"
    );

    if (!yakin) return;

    const data = dataRawat();
    const pasien = data.find(r => r.id === id);

    if (!pasien || pasien.status !== "Dirawat") return;

    pasien.status = "Keluar";
    pasien.tanggalKeluar = tanggalHariIni();

    simpanData(KEY_RAWAT, data);

    alert("Status pasien berhasil diperbarui.");
    perbaruiSemua();
}

// ======================================
// TABEL DATA PASIEN
// ======================================

function tampilkanPasien() {

    const tbody = document.getElementById("tabelPasien");
    const kata = document.getElementById("cariPasien")
        .value.toLowerCase();

    tbody.replaceChildren();

    const hasil = dataPasien().filter(p =>
        p.nama.toLowerCase().includes(kata) ||
        p.rm.toLowerCase().includes(kata)
    );

    if (hasil.length === 0) {
        tampilkanKosong(tbody, 5, "Belum ada data pasien.");
        return;
    }

    hasil.forEach(p => {
        const tr = document.createElement("tr");

        tr.append(
            buatSel(p.rm),
            buatSel(p.nama),
            buatSel(p.nik),
            buatSel(p.jenisKelamin),
            buatSel(p.telepon)
        );

        tbody.appendChild(tr);
    });
}

// ======================================
// PILIHAN FORM RAWAT INAP
// ======================================

function tambahPilihan(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
}

function isiPilihan() {

    const selectPasien = document.getElementById("pilihPasien");
    const selectKamar = document.getElementById("pilihKamar");
    const selectDokter = document.getElementById("pilihDokter");

    selectPasien.replaceChildren();
    selectKamar.replaceChildren();
    selectDokter.replaceChildren();

    tambahPilihan(selectPasien, "", "Pilih pasien");

    dataPasien().forEach(p => {
        tambahPilihan(selectPasien, p.rm, p.rm + " - " + p.nama);
    });

    tambahPilihan(selectKamar, "", "Pilih kamar");

    kamar.forEach(k => {
        const terisi = dataRawat().filter(r =>
            r.kamar === k.nomor && r.status === "Dirawat"
        ).length;

        const sisa = k.kapasitas - terisi;

        if (sisa > 0) {
            tambahPilihan(
                selectKamar,
                k.nomor,
                k.nomor + " - " + k.kelas + " (Tersedia " + sisa + ")"
            );
        }
    });

    tambahPilihan(selectDokter, "", "Pilih dokter");

    dokter.forEach(d => {
        tambahPilihan(
            selectDokter,
            d.id,
            d.nama + " - " + d.spesialisasi
        );
    });
}

// ======================================
// TABEL RAWAT INAP
// ======================================

function tampilkanRawat() {

    const tbody = document.getElementById("tabelRawat");
    tbody.replaceChildren();

    const data = dataRawat();

    if (data.length === 0) {
        tampilkanKosong(tbody, 7, "Belum ada pasien rawat inap.");
        return;
    }

    data.forEach(r => {

        const tr = document.createElement("tr");

        tr.append(
            buatSel(r.rm),
            buatSel(r.nama),
            buatSel(r.kamar),
            buatSel(r.dokter),
            buatSel(r.tanggalMasuk)
        );

        const tdStatus = document.createElement("td");
        const label = document.createElement("span");

        label.className = r.status === "Dirawat"
            ? "status"
            : "status status-keluar";

        label.textContent = r.status;
        tdStatus.appendChild(label);
        tr.appendChild(tdStatus);

        const tdAksi = document.createElement("td");

        if (r.status === "Dirawat") {
            const tombol = document.createElement("button");

            tombol.textContent = "Pasien Keluar";
            tombol.className = "tombol-keluar";

            tombol.addEventListener("click", () => pasienKeluar(r.id));

            tdAksi.appendChild(tombol);
        } else {
            tdAksi.textContent = "-";
        }

        tr.appendChild(tdAksi);
        tbody.appendChild(tr);
    });
}

// ======================================
// TABEL KAMAR
// ======================================

function tampilkanKamar() {

    const tbody = document.getElementById("tabelKamar");
    tbody.replaceChildren();

    kamar.forEach(k => {

        const terisi = dataRawat().filter(r =>
            r.kamar === k.nomor && r.status === "Dirawat"
        ).length;

        const tersedia = terisi < k.kapasitas;

        const tr = document.createElement("tr");

        tr.append(
            buatSel(k.nomor),
            buatSel(k.kelas),
            buatSel(k.kapasitas),
            buatSel(terisi)
        );

        const tdStatus = buatSel(
            tersedia ? "Tersedia" : "Penuh"
        );

        tdStatus.className = tersedia ? "kosong" : "penuh";

        tr.appendChild(tdStatus);
        tbody.appendChild(tr);
    });
}

// ======================================
// TABEL DOKTER
// ======================================

function tampilkanDokter() {

    const tbody = document.getElementById("tabelDokter");
    tbody.replaceChildren();

    dokter.forEach(d => {

        const tr = document.createElement("tr");

        tr.append(
            buatSel(d.id),
            buatSel(d.nama),
            buatSel(d.spesialisasi)
        );

        tbody.appendChild(tr);
    });
}

// ======================================
// TABEL LAPORAN
// ======================================

function tampilkanLaporan() {

    const tbody = document.getElementById("tabelLaporan");
    tbody.replaceChildren();

    const data = dataRawat();

    if (data.length === 0) {
        tampilkanKosong(tbody, 5, "Belum ada laporan rawat inap.");
        return;
    }

    data.forEach(r => {

        const tr = document.createElement("tr");

        tr.append(
            buatSel(r.rm),
            buatSel(r.nama),
            buatSel(r.tanggalMasuk),
            buatSel(r.tanggalKeluar || "-"),
            buatSel(r.status)
        );

        tbody.appendChild(tr);
    });
}

// ======================================
// DASHBOARD
// ======================================

function tampilkanDashboard() {

    const pasien = dataPasien();
    const rawat = dataRawat();

    const sedangDirawat = rawat.filter(r =>
        r.status === "Dirawat"
    );

    const sudahKeluar = rawat.filter(r =>
        r.status === "Keluar"
    );

    const tersedia = kamar.filter(k => {
        const terisi = sedangDirawat.filter(r =>
            r.kamar === k.nomor
        ).length;

        return terisi < k.kapasitas;
    }).length;

    document.getElementById("totalPasien").textContent =
        pasien.length;

    document.getElementById("pasienDirawat").textContent =
        sedangDirawat.length;

    document.getElementById("pasienKeluar").textContent =
        sudahKeluar.length;

    document.getElementById("kamarTersedia").textContent =
        tersedia;
}

// ======================================
// MENU AKTIF
// ======================================

document.querySelectorAll(".menu-link").forEach(link => {

    link.addEventListener("click", function() {

        document.querySelectorAll(".menu-link").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });
});

// ======================================
// PENCARIAN
// ======================================

document.getElementById("cariPasien")
    .addEventListener("input", tampilkanPasien);

// ======================================
// UPDATE SEMUA TAMPILAN
// ======================================

function perbaruiSemua() {
    tampilkanDashboard();
    tampilkanPasien();
    tampilkanRawat();
    tampilkanKamar();
    tampilkanDokter();
    tampilkanLaporan();
    isiPilihan();
}

// ======================================
// MULAI SISTEM
// ======================================

document.getElementById("tanggalMasuk").value =
    tanggalHariIni();

document.getElementById("tanggalSekarang").textContent =
    new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

perbaruiSemua();