/**
 * KMF Demak - Mock Data & Initial Master Data
 * Menampung daftar 14 Kecamatan di Demak, data awal alumni terverifikasi,
 * direktori usaha alumni, serta data contoh untuk pengujian panel approval pengurus.
 */

const KMF_DATA = {
    // 14 Kecamatan di Kabupaten Demak
    kecamatanList: [
        "Demak Kota",
        "Bonang",
        "Wedung",
        "Sayung",
        "Mranggen",
        "Karangtengah",
        "Guntur",
        "Karanganyar",
        "Mijen",
        "Wonosalam",
        "Gajah",
        "Dempet",
        "Karangawen",
        "Kebonagung"
    ],

    // Kategori Profesi
    profesiCategories: [
        "Pengasuh Pesantren / Kiai / Da'i",
        "Pendidik (Guru / Dosen / Ustadz)",
        "Wirausaha / Pemilik Bisnis",
        "Aparatur Sipil Negara (ASN / PNS)",
        "Karyawan Swasta / BUMN",
        "Tenaga Medis / Kesehatan",
        "Pertanian / Peternakan / Perikanan",
        "Pengacara / Notaris / Hukum",
        "Teknologi Informasi & Kreatif",
        "Lainnya"
    ],

    // Kategori Usaha / Bisnis Alumni
    usahaCategories: [
        "Kuliner & Makanan Ringan",
        "Konveksi, Busana Muslim & Sarung",
        "Percetakan, Penerbitan & Kitab",
        "Agrobisnis, Pertanian & Perikanan",
        "Jasa Teknik, Bengkel & Konstruksi",
        "Kesehatan, Herbal & Apotek",
        "Pendidikan, Kursus & Bimbel",
        "Toko Kelontong & Ritel",
        "Jasa Profesional & Keuangan",
        "Lainnya"
    ],

    // Agenda / Kegiatan Terdekat KMF Demak (Format Kaya Ala Halaman Berita)
    agendaList: [
        {
            id: 1,
            title: "Selapanan KMF Demak bersama KH. Abdul Aziz Musyaffa'",
            kategori: "Selapanan",
            hari: "Ahad",
            tanggal: "Ahad, 01 November 2026",
            waktu: "09.00 WIB s/d selesai",
            pemateri: "KH. Abdul Aziz Musyaffa'",
            tempat: "Rumah KH. Abdul Aziz Musyaffa' - Demak Kota",
            alamat: "Pondok Pesantren 'Nurul Hikmah', Jl. Kyai Sidqi No. 1b Bintoro, Demak",
            maps: "https://maps.app.goo.gl/EvjHdS5waFtwAnzv8",
            deskripsi: "Selapanan rutin dan silaturrahim akbar seluruh Anggota KMF Demak dengan mauidhoh hasanah oleh KH. Abdul Aziz Musyaffa'.",
            konten: "Assalamualaikum warahmatullahi wabarakatuh.\n\nDiberitahukan kepada segenap seluruh Anggota dan Alumni KMF Demak, bahwa akan diselenggarakan agenda rutin Selapanan dan Silaturrahim KMF Cabang Demak.\n\nKegiatan ini akan diisi dengan mauidhoh hasanah dan kajian keagamaan oleh pemateri terhormat KH. Abdul Aziz Musyaffa'. Seluruh alumni Perguruan Islam Mathali'ul Falah (Kajen, Pati) yang berdomisili di Kabupaten Demak diharapkan berkenan hadir bersama keluarga guna mempererat tali ukhuwah dan menyambung sanad keilmuan para Masyayikh.\n\nSusunan acara meliputi pembacaan Al-Qur'an bil-Ghoib, wirid dan fatihah Masyayikh Mathole', mauidhoh hasanah, serta musyawarah pemutakhiran program sensus digital alumni cabang Demak.\n\nDonasi dan infaq operasional kegiatan dapat disalurkan melalui kotak infaq di lokasi acara atau transfer ke rekening BNI 1208305397 (a.n. Ahmad Muntohar).\n\nWassalamu'alaikum warahmatullahi wabarakatuh.",
            donasi: "Kotak Infaq saat Acara atau Transfer No Rek 1208305397 (BNI An. Ahmad Muntohar)",
            bank: "BNI",
            rekening: "1208305397",
            atasNama: "Ahmad Muntohar",
            poster: "assets/img/banners/poster-selapanan.jpg",
            isPopup: true
        },
        {
            id: 2,
            title: "Ziarah Masyayikh Kajen & Silaturrahim Dzurriyyah",
            kategori: "Ziarah",
            hari: "Ahad",
            tanggal: "Ahad Wage, 15 November 2026",
            waktu: "07.00 WIB s/d Selesai",
            pemateri: "Pengurus Cabang KMF Demak",
            tempat: "Komplek Makam Mbah Mutamakkin & Masyayikh Kajen - Pati",
            alamat: "Desa Kajen, Kec. Margoyoso, Kab. Pati (Titik Kumpul: Halaman Masjid Agung Demak)",
            maps: "https://maps.google.com/?q=Makam+Mbah+Mutamakkin+Kajen+Pati",
            deskripsi: "Rombongan bersama ziarah maqbarah Masyayikh Kajen dan sowan silaturrahim dzurriyyah para guru Mathole'.",
            konten: "Agenda ziarah tahunan alumni KMF Cabang Demak menuju maqbarah Masyayikh Kajen di Pati.\n\nRute ziarah mencakup makam Al-Maghfurlah KH. Ahmad Mutamakkin, Hadhratusy Syaikh KH. MA. Sahal Mahfudh, KH. Abdullah Salam, KH. Damanhuri, KH. Naji Muadz, dan para auliya' Masyayikh Kajen lainnya.\n\nTitik kumpul keberangkatan dipusatkan di halaman Masjid Agung Demak pukul 07.00 WIB tepat. Disediakan armada bus dan iring-iringan kendaraan roda empat. Diharapkan peserta ziarah berpakaian sopan khas santri (baju koko/putih dan sarung/busana muslimah).",
            donasi: "Infaq rombongan via koordinator kecamatan",
            bank: "BNI",
            rekening: "1208305397",
            atasNama: "Ahmad Muntohar",
            poster: "assets/img/berita/berita-ziarah-kajen.jpg",
            isPopup: false
        },
        {
            id: 3,
            title: "Sema'an Al-Qur'an 30 Juz Bil-Ghoib Santri Demak",
            kategori: "Kegiatan",
            hari: "Ahad",
            tanggal: "Ahad Kliwon, 29 November 2026",
            waktu: "08.30 WIB s/d 12.00 WIB",
            pemateri: "Majelis Huffadz Alumni Mathole' Demak",
            tempat: "Masjid Jami' Mranggen, Kab. Demak",
            alamat: "Kecamatan Mranggen, Kabupaten Demak",
            maps: "https://maps.google.com/?q=Mranggen+Demak",
            deskripsi: "Sema'an Al-Qur'an bil-ghoib 30 juz khatam serentak oleh para huffadz alumni Mathali'ul Falah.",
            konten: "Majelis Khotmil Qur'an bil-Ghoib rutin diselenggarakan untuk memupuk kecintaan terhadap Al-Qur'an dan menyambung tradisi nderes Al-Qur'an para alumni pesantren Kajen.\n\nAcara dimulai sejak bakda sholat Subuh dan ditutup dengan doa khotmil Qur'an serta tasyakuran santri menjelang dhuhur.",
            poster: "assets/img/banners/banner-khataman.jpg",
            isPopup: false
        },
        {
            id: 4,
            title: "Halaqah Fiqh Sosial & Sarasehan Ekonomi Santri",
            kategori: "Kajian",
            hari: "Ahad",
            tanggal: "Ahad Pon, 13 Desember 2026",
            waktu: "09.00 WIB s/d 13.00 WIB",
            pemateri: "Tim Kajian Fiqh Sosial & Praktisi Usaha KMF",
            tempat: "Aula Pertemuan PCNU Kabupaten Demak",
            alamat: "Jl. Sultan Fatah No. 34, Demak Kota",
            maps: "https://maps.google.com/?q=PCNU+Demak",
            deskripsi: "Kajian interaktif kontekstualisasi Fiqh Sosial Mbah Sahal untuk penguatan jejaring bursa usaha santri.",
            konten: "Halaqah ilmiah yang membedah karya-karya pemikiran KH. MA. Sahal Mahfudh mengenai pemberdayaan masyarakat dan ekonomi kerakyatan berbasis pesantren.\n\nAcara ini juga dirangkai dengan temu jaringan para pelaku usaha alumni KMF di Kabupaten Demak untuk saling sinergi dan kolaborasi pemasaran produk santri.",
            poster: "assets/img/berita/berita-wirausaha-santri.jpg",
            isPopup: false
        }
    ],

    // Banner Slider 3:1 (Mobile Ala Asnawiyyah)
    bannerList: [
        {
            id: 1,
            nama: "Sensus Mandiri Alumni KMF Demak",
            subjudul: "Pererat Ukhuwah & Pemetaan Potensi Santri Mathole'",
            gambar: "assets/img/banners/banner-sensus.jpg",
            tipeAksi: "tab",
            targetAksi: "register",
            tag: "Sensus Mandiri"
        },
        {
            id: 2,
            nama: "Bursa Usaha Santri Kajen di Demak",
            subjudul: "Beli dan Gandeng Produk Sesama Alumni",
            gambar: "assets/img/banners/banner-usaha.jpg",
            tipeAksi: "tab",
            targetAksi: "usaha",
            tag: "Pemberdayaan"
        },
        {
            id: 3,
            nama: "Khataman & Selapanan KMF Demak",
            subjudul: "Silaturrahim & Amalan Masyayikh Kajen",
            gambar: "assets/img/banners/banner-khataman.jpg",
            tipeAksi: "tab",
            targetAksi: "berita",
            tag: "Agenda Selapanan"
        }
    ],

    // Daftar Berita & Warta KMF Demak
    beritaList: [
        {
            id: "BRT-001",
            judul: "KMF Cabang Demak Matangkan Sensus Digital Alumni Mathali'ul Falah",
            kategori: "Organisasi",
            tanggal: "16 Oktober 2026",
            penulis: "Humas KMF Demak",
            views: 54,
            ringkasan: "Pengurus KMF Cabang Demak resmi mengintegrasikan aplikasi sensus berbasis PWA untuk memetakan ribuan santri Kajen di 14 kecamatan se-Kabupaten Demak.",
            konten: "Demak — Dalam rangka mempererat jalinan ukhuwah serta memberdayakan potensi alumni Perguruan Islam Mathali'ul Falah (Kajen, Pati), Pengurus Cabang KMF Demak menginisiasi gerakan sensus mandiri alumni berbasis digital.\n\nKetua KMF Cabang Demak menegaskan bahwa basis data yang sahih dan terintegrasi menjadi modal utama dalam mewujudkan program pemberdayaan umat berlandaskan nilai Fiqh Sosial yang diajarkan oleh Hadhratusy Syaikh KH. MA. Sahal Mahfudh.\n\nMelalui pendataan ini, sebaran alumni lintas marhalah dan angkatan mulai dari santri sepuh hingga lulusan baru dapat terhubung secara harmonis.",
            foto: "assets/img/berita/berita-sensus-digital.jpg"
        },
        {
            id: "BRT-002",
            judul: "Menuntaskan Amanah, Pengurus KMF Demak Gelar Rapat Koordinasi Selapanan",
            kategori: "Kegiatan",
            tanggal: "14 Oktober 2026",
            penulis: "Sekretariat Cabang",
            views: 49,
            ringkasan: "Rapat koordinasi pengurus membahas persiapan pelantikan serentak kordinator kecamatan dan penetapan jadwal khataman bergilir di 14 kecamatan.",
            konten: "Demak — Jajaran pengurus harian KMF Cabang Demak menyelenggarakan musyawarah koordinasi di kompleks kantor sekretariat. Rapat dipimpin langsung oleh jajaran syuriyah dan tanfidziyah untuk mengevaluasi program kerja semester berjalan serta menyusun langkah strategis penguatan ekonomi santri.\n\nSalah satu agenda krusial adalah penyeragaman data sensus alumni dan aktivasi kotak koin peduli santri Mathole'.",
            foto: "assets/img/berita/berita-rapat-koordinasi.jpg"
        },
        {
            id: "BRT-003",
            judul: "Selapanan & Ziarah Akbar Masyayikh Kajen Dijadwalkan Awal November",
            kategori: "Kegiatan",
            tanggal: "12 Oktober 2026",
            penulis: "Divisi Dakwah",
            views: 73,
            ringkasan: "Kegiatan rutin selapanan dan ziarah ke makam Syekh Ahmad al-Mutamakkin serta Masyayikh Kajen Pati akan dipusatkan dengan titik kumpul di Kompleks Masjid Agung Demak.",
            konten: "Demak — Tradisi tabarrukan dan silaturrahim alumni ke bumi Kajen terus dilestarikan oleh KMF Demak. Kegiatan ziarah bersama ini diharapkan dapat menghidupkan kembali spirit keilmuan dan keteladanan para masyayikh bagi generasi muda alumni.\n\nRombongan akan menziarahi makam Mbah Mutamakkin, KH. MA. Sahal Mahfudh, KH. Abdullah Salam, dan para auliya' Kajen.",
            foto: "assets/img/berita/berita-ziarah-kajen.jpg"
        },
        {
            id: "BRT-004",
            judul: "Geliat Wirausaha Santri Kajen di Demak: Dari Konveksi hingga Agrobisnis",
            kategori: "Ekonomi",
            tanggal: "8 Oktober 2026",
            penulis: "Divisi Ekonomi",
            views: 62,
            ringkasan: "Melalui etalase bursa usaha di aplikasi KMF, perputaran ekonomi santri dan jejaring kemitraan antaralumni di Kabupaten Demak mencatatkan pertumbuhan positif.",
            konten: "Demak — Kemandirian ekonomi merupakan salah satu pilar penting dalam nilai Shalih Akram. Sejumlah alumni Mathole' di Demak sukses mengembangkan berbagai bidang usaha, mulai dari konveksi sarung dan busana muslim, percetakan kitab, hingga budidaya tambak perikanan di wilayah pesisir Wedung dan Bonang.\n\nKMF Demak berkomitmen terus memfasilitasi promosi dan transaksi antarsantri untuk membangkitkan ekonomi umat.",
            foto: "assets/img/berita/berita-wirausaha-santri.jpg"
        }
    ],

    // Data Alumni Terverifikasi (APPROVED)
    alumniList: [
        {
            id: "KMF-DMK-001",
            nama: "H. Muhammad Nurul Huda, S.Pd.I",
            panggilan: "Gus Huda",
            tahunLulus: "2008",
            marhalah: "MA Mathali'ul Falah",
            pondokKajen: "Pondok Maslakul Huda (PMH Pusat)",
            guruKajen: "KH. MA. Sahal Mahfudh",
            kecamatan: "Demak Kota",
            desa: "Bintoro",
            alamat: "Jl. Kyai Singkil No. 14, Bintoro, Demak",
            noWa: "6281234567890",
            tampilkanWa: true,
            profesiKategori: "Pendidik (Guru / Dosen / Ustadz)",
            profesiDetail: "Guru Madrasah Aliyah & Pengurus Yayasan Pendidikan",
            foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            status: "APPROVED"
        },
        {
            id: "KMF-DMK-002",
            nama: "KH. Ahmad Fauzi Ridwan",
            panggilan: "Yai Fauzi",
            tahunLulus: "1998",
            marhalah: "MA Mathali'ul Falah",
            pondokKajen: "Pondok Pesantren Maslakul Huda Putra",
            guruKajen: "KH. Abdullah Salam & Mbah Sahal",
            kecamatan: "Wedung",
            desa: "Buko",
            alamat: "Komplek Ponpes Roudlotul Muttaqin, Wedung",
            noWa: "6281398765432",
            tampilkanWa: true,
            profesiKategori: "Pengasuh Pesantren / Kiai / Da'i",
            profesiDetail: "Pengasuh Pondok Pesantren & Da'i",
            foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            status: "APPROVED"
        },
        {
            id: "KMF-DMK-003",
            nama: "H. Ahmad Syafi'i, S.T.",
            panggilan: "Kang Syafi'i",
            tahunLulus: "2014",
            marhalah: "MA Mathali'ul Falah",
            pondokKajen: "Pondok Polgar (Kajen)",
            guruKajen: "KH. Muadz Thohir & Kiai Naji",
            kecamatan: "Mranggen",
            desa: "Batursari",
            alamat: "Perum Pucang Gading Blok C, Mranggen",
            noWa: "6285712348899",
            tampilkanWa: true,
            profesiKategori: "Wirausaha / Pemilik Bisnis",
            profesiDetail: "Owner Konveksi Santri & Sablon Digital",
            foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            status: "APPROVED"
        },
        {
            id: "KMF-DMK-004",
            nama: "dr. Hj. Nailis Sa'adah",
            panggilan: "Ning Naily",
            tahunLulus: "2012",
            marhalah: "MA Mathali'ul Falah Putri",
            pondokKajen: "Pondok Maslakul Huda Putri",
            guruKajen: "Ibu Nyai Hj. Nafisah Sahal",
            kecamatan: "Bonang",
            desa: "Moro",
            alamat: "Puskesmas Pembantu Bonang, Demak",
            noWa: "6282133445566",
            tampilkanWa: false,
            profesiKategori: "Tenaga Medis / Kesehatan",
            profesiDetail: "Dokter Umum & Praktisi Kesehatan Masyarakat",
            foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            status: "APPROVED"
        }
    ],

    // Data Katalog Usaha Terverifikasi (APPROVED) - Ala Tokopedia Marketplace Santri
    usahaList: [
        {
            id: "USH-DMK-001",
            alumniId: "KMF-DMK-003",
            pemilik: "H. Ahmad Syafi'i, S.T.",
            namaUsaha: "Sarung Batik Tulis Kajen - Edisi Khusus Santri Mathole'",
            kategori: "Konveksi, Busana Muslim & Sarung",
            harga: 115000,
            hargaCoret: 135000,
            diskon: "15%",
            rating: 4.9,
            terjual: "250+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: true,
            cashback: "Hemat 20 rb",
            kecamatan: "Mranggen",
            desa: "Batursari",
            alamatLengkap: "Jl. Pucang Anom Raya No. 12, Mranggen, Demak",
            waBisnis: "6285712348899",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Sarung batik tulis halus khas Kajen motif ornamen klasik pesantren. Bahan katun primissima mori adem, tidak luntur, jahitan rapi ganda. Menerima seragam alumni & majlis.",
            foto: "assets/img/usaha/usaha-sarung-batik.jpg",
            status: "APPROVED"
        },
        {
            id: "USH-DMK-002",
            alumniId: "KMF-DMK-001",
            pemilik: "H. Muhammad Nurul Huda",
            namaUsaha: "Buku Fiqh Sosial & Kitab Kuning Klasik Pesantren Kajen",
            kategori: "Percetakan, Penerbitan & Kitab",
            harga: 48000,
            hargaCoret: 60000,
            diskon: "20%",
            rating: 5.0,
            terjual: "500+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: true,
            cashback: "Cashback 5%",
            kecamatan: "Demak Kota",
            desa: "Bintoro",
            alamatLengkap: "Kawasan Pecinan / Dekat Masjid Agung Demak",
            waBisnis: "6281234567890",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Penyedia lengkap literatur karya Hadhratusy Syaikh KH. MA. Sahal Mahfudh (Nuansa Fiqh Sosial, Pesantren Mencari Makna, Thariqatul Hushul), kitab kuning turots, dan mushaf Al-Qur'an.",
            foto: "assets/img/usaha/usaha-buku-fiqhsosial.jpg",
            status: "APPROVED"
        },
        {
            id: "USH-DMK-003",
            alumniId: "KMF-DMK-002",
            pemilik: "KH. Ahmad Fauzi Ridwan",
            namaUsaha: "Bandeng Presto Duri Lunak Khas Pesisir Wedung Demak (Isi 4)",
            kategori: "Kuliner & Makanan Ringan",
            harga: 55000,
            hargaCoret: 65000,
            diskon: "15%",
            rating: 4.8,
            terjual: "380+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: true,
            cashback: "Hemat 10 rb",
            kecamatan: "Wedung",
            desa: "Buko",
            alamatLengkap: "Pesisir Wedung, Kab. Demak",
            waBisnis: "6281398765432",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Bandeng tambak segar pesisir Wedung diolah dengan bumbu rempah warisan tanpa pengawet. Duri lunak 100%, kemasan vakum higienis tahan kirim ke luar kota. Bonus sambal terasi khas Demak.",
            foto: "assets/img/usaha/usaha-bandeng-presto.jpg",
            status: "APPROVED"
        },
        {
            id: "USH-DMK-004",
            alumniId: "KMF-DMK-004",
            pemilik: "Ustadz Lukman Hakim",
            namaUsaha: "Madu Murni Randu Asli Hutan Demak 500gr (Raw Honey)",
            kategori: "Kesehatan, Herbal & Apotek",
            harga: 85000,
            hargaCoret: 100000,
            diskon: "15%",
            rating: 4.9,
            terjual: "190+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: true,
            cashback: "Ekstra Diskon",
            kecamatan: "Sayung",
            desa: "Sriwulan",
            alamatLengkap: "Dukuh Morosari RT 03/RW 02, Sayung, Demak",
            waBisnis: "6289512345678",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Madu murni nektar bunga randu asli tanpa pasteurisasi dan tanpa pemanis buatan. Kaya enzim diastase alami, bagus untuk imunitas tubuh, batuk, lambung, dan stamina para santri.",
            foto: "assets/img/usaha/usaha-madu-randu.jpg",
            status: "APPROVED"
        },
        {
            id: "USH-DMK-005",
            alumniId: "KMF-DMK-005",
            pemilik: "Gus Rifqi Syamsuddin",
            namaUsaha: "Kopi Robusta Muria Petik Merah - Roast Beans 250gr",
            kategori: "Kuliner & Makanan Ringan",
            harga: 38000,
            hargaCoret: 45000,
            diskon: "15%",
            rating: 4.9,
            terjual: "420+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: false,
            cashback: "Kupon Santri",
            kecamatan: "Karangtengah",
            desa: "Donoarum",
            alamatLengkap: "Jl. Raya Karangtengah No. 44, Demak",
            waBisnis: "6281298765431",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Kopi robusta lereng Gunung Muria petik merah sempurna, diproses medium-dark roast aromatik cokelat dan nutty khas kopi jagongan santri. Cocok menemani muthola'ah malam hari.",
            foto: "assets/img/usaha/usaha-kopi-muria.jpg",
            status: "APPROVED"
        },
        {
            id: "USH-DMK-006",
            alumniId: "KMF-DMK-006",
            pemilik: "Kang Mahfudz Hasan",
            namaUsaha: "Baju Koko Kurta Modern Santri Katun Toyobo Premium",
            kategori: "Konveksi, Busana Muslim & Sarung",
            harga: 92000,
            hargaCoret: 120000,
            diskon: "23%",
            rating: 4.8,
            terjual: "150+ terjual",
            badge: "Bebas Ongkir",
            isOfficial: true,
            cashback: "Hemat 28 rb",
            kecamatan: "Bonang",
            desa: "Moro",
            alamatLengkap: "Bonang Kulon, Kab. Demak",
            waBisnis: "6285211223344",
            linkGmaps: "https://maps.google.com",
            deskripsi: "Baju kurta muslim pria lengan 3/4 berbahan katun toyobo fodu import. Nyaman dipakai sholat berjamaah, pengajian selapanan, dan aktivitas harian santri.",
            foto: "assets/img/usaha/usaha-koko-kurta.jpg",
            status: "APPROVED"
        }
    ],

    // Data Pendaftar Baru (Status PENDING) untuk Demonstrasi Fitur Approval Admin Pengurus
    pendingList: [
        {
            id: "KMF-DMK-PENDING-01",
            timestamp: "2026-10-16 20:45",
            nama: "Ustadz Lukman Hakim",
            panggilan: "Kang Lukman",
            tahunLulus: "2016",
            marhalah: "MA Mathali'ul Falah",
            pondokKajen: "Pondok Al-Hadi (Kajen)",
            guruKajen: "KH. MA. Sahal Mahfudh & Kiai Naji",
            kecamatan: "Sayung",
            desa: "Sriwulan",
            alamat: "Dukuh Morosari RT 03/RW 02, Sayung, Demak",
            noWa: "6289512345678",
            tampilkanWa: true,
            profesiKategori: "Pendidik (Guru / Dosen / Ustadz)",
            profesiDetail: "Pengajar Madrasah Diniyyah di Sayung",
            foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            status: "PENDING",
            // Data Usaha terlampir (jika mendaftar sekalian)
            usaha: {
                namaUsaha: "Madu Murni Randu Demak - Barokah Kajen",
                kategori: "Kesehatan, Herbal & Apotek",
                deskripsi: "Madu murni nektar bunga randu asli Demak-Pati tanpa campuran, menyehatkan stamina.",
                foto: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
                waBisnis: "6289512345678"
            }
        }
    ],

    // Data Program Filantropi & ZISWAF KMF Demak
    filantropiPrograms: {
        wakaf: {
            id: "wakaf",
            nama: "Wakaf Produktif KMF",
            tagline: "Amal Jariyah Abadi Bersama KMF",
            deskripsi: "Wakaf uang dan tanah untuk pembangunan sarana dakwah, asrama santri Mathali'ul Falah, dan dana abadi pendidikan umat berlandaskan maslahat sosial.",
            rekening: [
                { bank: "BSI (Bank Syariah Indonesia)", noRek: "7140008888", atasNama: "YAYASAN WAKAF KMF" },
                { bank: "Bank Jateng Syariah", noRek: "5032001926", atasNama: "KMF CABANG DEMAK" }
            ],
            minimalDonasi: 50000,
            linkWeb: "https://wakaf.kmf.or.id/"
        },
        infaq: {
            id: "infaq",
            nama: "Infaq & Sedekah Shubuh",
            tagline: "Membersihkan Harta, Mengetuk Pintu Berkah",
            deskripsi: "Gerakan Koin Santri dan sedekah shubuh untuk operasional kegiatan dakwah, santunan yatim, dan kas kemaslahatan santri Mathole' di Kabupaten Demak.",
            rekening: [
                { bank: "Bank Jateng Syariah", noRek: "5032001926", atasNama: "KMF CABANG DEMAK" },
                { bank: "BSI (Bank Syariah Indonesia)", noRek: "7140005555", atasNama: "KMF DEMAK PEDULI" }
            ],
            minimalDonasi: 10000
        },
        zakat: {
            id: "zakat",
            nama: "Zakat Mal & Profesi Santri",
            tagline: "Menunaikan Kewajiban, Memberdayakan Mustahiq",
            deskripsi: "Penyaluran zakat maal, tabungan, dan profesi sesuai tuntunan fiqh kepada 8 asnaf, santri dhuafa, guru ngaji, dan fuqara-masakin binaan alumni.",
            rekening: [
                { bank: "BSI (Bank Syariah Indonesia)", noRek: "7140007777", atasNama: "LAZIS KMF DEMAK" }
            ],
            minimalDonasi: 50000,
            hasKalkulator: true
        },
        peduli: {
            id: "peduli",
            nama: "Peduli Santri & Dhuafa",
            tagline: "Ukhuwah Alumni untuk Generasi Masa Depan",
            deskripsi: "Beasiswa kitab dan biaya pendidikan bagi santri berprestasi asal Demak yang mondok di Mathali'ul Falah Kajen, serta dana tanggap bencana alumni.",
            rekening: [
                { bank: "Bank Jateng Syariah", noRek: "5032001926", atasNama: "KMF CABANG DEMAK" },
                { bank: "BSI (Bank Syariah Indonesia)", noRek: "7140009999", atasNama: "PEDULI SANTRI KMF" }
            ],
            minimalDonasi: 20000
        }
    },

    // Papan Kabar Duka & Lelayu Santri (Solidaritas & Kirim Doa)
    kabarDukaList: [
        {
            id: 1,
            namaAlmarhum: "KH. Muhammad Syukron",
            infoAlumni: "Alumni Mathali'ul Falah Angkatan 1985 (Pondok Kulon Banat Kajen)",
            wafat: "Jumat Pon, 16 Oktober 2026",
            alamatDuka: "Desa Buko, Kec. Wedung, Kab. Demak",
            status: "Pengasuh Majlis Taklim & Tokoh Alumni KMF Wedung",
            doaCounter: 142
        },
        {
            id: 2,
            namaAlmarhumah: "Nyai Hj. Masruroh binti H. Mas'ud",
            infoAlumni: "Ibunda dari Ustadz Ahmad Fauzi (Alumni 2008 / Pengurus KMF Demak)",
            wafat: "Rabu Wage, 7 Oktober 2026",
            alamatDuka: "Kelurahan Bintoro, Kec. Demak Kota",
            status: "Keluarga Besar Alumni KMF Demak",
            doaCounter: 98
        }
    ],

    // Data Foto Showcase Hero Desktop (Ala Mubarokah App Showcase)
    heroDesktopSlides: [
        {
            id: 0,
            judul: "Silaturrahim & Konsolidasi Akbar KMF Cabang Demak",
            kategori: "Konsolidasi Cabang",
            lokasi: "Kabupaten Demak, Jawa Tengah",
            gambar: "assets/img/banners/banner-sensus.jpg",
            ringkasan: "Mempererat ukhuwah alumni Perguruan Islam Mathali'ul Falah (Kajen, Pati) di 14 kecamatan se-Kabupaten Demak."
        },
        {
            id: 1,
            judul: "Khataman & Selapanan Tabarrukan Masyayikh Kajen",
            kategori: "Majlis Amalan",
            lokasi: "Kompleks Masjid Agung Demak",
            gambar: "assets/img/banners/banner-khataman.jpg",
            ringkasan: "Melestarikan tradisi fatihahan, tahlil dan wirid warisan masyayikh untuk ketenteraman umat dan bangsa."
        },
        {
            id: 2,
            judul: "Bursa Mandiri & Pemberdayaan Usaha Santri Kajen",
            kategori: "Ekonomi Jama'ah",
            lokasi: "14 Koordinator Kecamatan",
            gambar: "assets/img/banners/banner-usaha.jpg",
            ringkasan: "Menghubungkan jaringan niaga santri mulai dari busana, kuliner, pertanian, jasa, dan ritel di Kota Wali."
        }
    ],

    // Daftar Tokoh Masyayikh & Dewan Penasihat untuk Marquee Slider Desktop
    masyayikhTokohList: [
        {
            id: 1,
            nama: "Hadhratusy Syaikh KH. MA. Sahal Mahfudh",
            gelar: "Rais 'Am PBNU 1999-2014 & Pengasuh PIM",
            peran: "Gagasan Fiqh Sosial & Shalih Akram",
            tag: "Masyayikh Kajen",
            avatarIcon: "fa-solid fa-mosque"
        },
        {
            id: 2,
            nama: "KH. Abdullah Zen Salam (Mbah Dullah)",
            gelar: "Kiai Khos & Murabbi Ruhiyyin Kajen",
            peran: "Keteladanan Zuhud, Wara' & Keikhlasan",
            tag: "Masyayikh Kajen",
            avatarIcon: "fa-solid fa-book-quran"
        },
        {
            id: 3,
            nama: "KH. Ahmad Nafi' Abdillah",
            gelar: "Direktur Perguruan Islam Mathali'ul Falah",
            peran: "Pengasuh PP. Mansajul Ulum Kajen",
            tag: "Masyayikh Kajen",
            avatarIcon: "fa-solid fa-graduation-cap"
        },
        {
            id: 4,
            nama: "K.H. Nurul Huda, M.Pd.I.",
            gelar: "Ketua Pengurus Cabang KMF Demak",
            peran: "Pemberdayaan Alumni & Sinergi Cabang",
            tag: "Pimpinan Cabang",
            avatarIcon: "fa-solid fa-users"
        },
        {
            id: 5,
            nama: "Drs. H. M. Asyiq",
            gelar: "Ketua Dewan Penasihat KMF Demak",
            peran: "Sesepuh & Pengarah Alumni Kajen Demak",
            tag: "Dewan Penasihat",
            avatarIcon: "fa-solid fa-landmark"
        },
        {
            id: 6,
            nama: "K.H. Zainal Arifin Ma'shum",
            gelar: "Dewan Syuriyah KMF Demak",
            peran: "Bimbingan Dakwah & Fatwa Keagamaan",
            tag: "Dewan Syuriyah",
            avatarIcon: "fa-solid fa-shield-halved"
        }
    ]
};

if (typeof window !== 'undefined') {
    window.KMF_DATA = KMF_DATA;
}

