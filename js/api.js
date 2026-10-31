/**
 * KMF Demak - API Adapter & Data Layer (v2.6.0 High-Performance)
 * Menghubungkan antarmuka frontend dengan LocalStorage (instant cache)
 * dan melakukan sinkronisasi asinkron di latar belakang dengan Google Apps Script Web App.
 */

const KMF_API = {
    STORAGE_KEYS: {
        ALUMNI: 'kmf_demak_alumni',
        USAHA: 'kmf_demak_usaha',
        PENDING: 'kmf_demak_pending',
        GAS_URL: 'kmf_demak_gas_url',
        ADMIN_PIN: 'kmf_demak_admin_pin',
        LAST_SYNC: 'kmf_demak_last_sync'
    },

    // Endpoint Resmi Google Apps Script Web App KMF Demak
    DEFAULT_GAS_URL: 'https://script.google.com/macros/s/AKfycbxWznM6FqPhwf3bquu3SpuVDVYc5xfz2yXIES25JXxzBo8NK_hzVdTFYfxe-ExzzRs/exec',

    // Default PIN Pengurus (1912: Tahun berdirinya Mathali'ul Falah Kajen)
    DEFAULT_PIN: '1912',

    // Cache memori untuk render instan (0ms)
    _cache: {
        alumni: null,
        usaha: null,
        pending: null,
        isSyncing: false
    },

    /**
     * Inisialisasi data dari localStorage atau fallback ke KMF_DATA
     */
    init: function() {
        if (!localStorage.getItem(this.STORAGE_KEYS.GAS_URL)) {
            localStorage.setItem(this.STORAGE_KEYS.GAS_URL, this.DEFAULT_GAS_URL);
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.ALUMNI)) {
            localStorage.setItem(this.STORAGE_KEYS.ALUMNI, JSON.stringify(window.KMF_DATA.alumniList));
        }
        const storedUsaha = localStorage.getItem(this.STORAGE_KEYS.USAHA);
        if (!storedUsaha || storedUsaha.includes('unsplash.com')) {
            localStorage.setItem(this.STORAGE_KEYS.USAHA, JSON.stringify(window.KMF_DATA.usahaList));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PENDING)) {
            localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(window.KMF_DATA.pendingList));
        }
    },

    /**
     * Mengambil daftar alumni yang sudah APPROVED
     * Prioritas: Cache memori / localStorage (Instant 0ms), lalu di-update via syncInBackground
     */
    getApprovedAlumni: async function(forceNetwork = false) {
        if (!forceNetwork) {
            if (this._cache.alumni) return this._cache.alumni;
            const local = localStorage.getItem(this.STORAGE_KEYS.ALUMNI);
            if (local) {
                try {
                    this._cache.alumni = JSON.parse(local);
                    return this._cache.alumni;
                } catch (e) {}
            }
            if (window.KMF_DATA && window.KMF_DATA.alumniList) {
                this._cache.alumni = window.KMF_DATA.alumniList;
                return this._cache.alumni;
            }
        }
        return await this._fetchAlumniFromGas();
    },

    _fetchAlumniFromGas: async function() {
        const gasUrl = this.getGasUrl();
        if (!gasUrl) return this._cache.alumni || window.KMF_DATA.alumniList;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const res = await fetch(`${gasUrl}?action=getAlumni`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                const mapped = data.data.map(item => ({
                    id: item.id || item.idAlumni || '',
                    nama: item.nama || item.namaLengkap || '',
                    angkatan: item.angkatan || item.tahunAngkatan || '',
                    kecamatan: item.kecamatan || '',
                    desa: item.desa || item.desaKelurahan || '',
                    alamat: item.alamat || item.alamatLengkap || '',
                    noWa: String(item.noWa || item.nomorWhatsapp || ''),
                    pekerjaan: item.pekerjaan || item.profesiPekerjaan || '',
                    pendidikan: item.pendidikan || item.pendidikanTerakhir || '',
                    foto: item.foto || item.urlFotoProfil || 'assets/img/logo.png',
                    status: item.status || item.statusVerifikasi || 'APPROVED'
                }));
                this._cache.alumni = mapped;
                localStorage.setItem(this.STORAGE_KEYS.ALUMNI, JSON.stringify(mapped));
                return mapped;
            }
        } catch (err) {
            console.warn('[KMF_API] Gagal fetch alumni dari GAS:', err.message);
        }
        return this._cache.alumni || window.KMF_DATA.alumniList;
    },

    /**
     * Mengambil daftar usaha yang sudah APPROVED
     * Prioritas: Cache memori / localStorage (Instant 0ms)
     */
    getApprovedUsaha: async function(forceNetwork = false) {
        if (!forceNetwork) {
            if (this._cache.usaha) return this._cache.usaha;
            const local = localStorage.getItem(this.STORAGE_KEYS.USAHA);
            if (local) {
                try {
                    this._cache.usaha = JSON.parse(local);
                    return this._cache.usaha;
                } catch (e) {}
            }
            if (window.KMF_DATA && window.KMF_DATA.usahaList) {
                this._cache.usaha = window.KMF_DATA.usahaList;
                return this._cache.usaha;
            }
        }
        return await this._fetchUsahaFromGas();
    },

    _fetchUsahaFromGas: async function() {
        const gasUrl = this.getGasUrl();
        if (!gasUrl) return this._cache.usaha || window.KMF_DATA.usahaList;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const res = await fetch(`${gasUrl}?action=getUsaha`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                const mapped = data.data.map((item, idx) => {
                    const nama = item.namaUsaha || item.namaUsahaProduk || '';
                    const mock = (window.KMF_DATA && window.KMF_DATA.usahaList)
                        ? window.KMF_DATA.usahaList.find(m => m.namaUsaha.toLowerCase() === nama.toLowerCase() || m.id === (item.id || item.idUsaha))
                        : null;

                    return {
                        id: item.id || item.idUsaha || ('USH-DMK-' + idx),
                        alumniId: item.alumniId || item.idAlumni || '',
                        pemilik: item.pemilik || item.namaPemilik || (mock ? mock.pemilik : 'Alumni KMF'),
                        namaUsaha: nama || (mock ? mock.namaUsaha : 'Produk Santri'),
                        kategori: item.kategori || item.kategoriUsaha || (mock ? mock.kategori : 'Lainnya'),
                        kecamatan: item.kecamatan || (mock ? mock.kecamatan : 'Demak'),
                        desa: item.desa || (mock ? mock.desa : ''),
                        alamatLengkap: item.alamatLengkap || item.alamatTokoUsaha || (mock ? mock.alamatLengkap : ''),
                        waBisnis: String(item.waBisnis || item.nomorWhatsappOrder || (mock ? mock.waBisnis : '6281234567890')),
                        linkGmaps: item.linkGmaps || item.linkGoogleMaps || 'https://maps.google.com',
                        deskripsi: item.deskripsi || item.deskripsiProduk || (mock ? mock.deskripsi : ''),
                        foto: item.foto || item.urlFotoProduk || (mock ? mock.foto : 'assets/img/usaha/usaha-sarung-batik.jpg'),
                        harga: Number(item.harga) || (mock ? mock.harga : 75000),
                        hargaCoret: Number(item.hargaCoret) || (mock ? mock.hargaCoret : 0),
                        diskon: item.diskon || (mock ? mock.diskon : ''),
                        rating: Number(item.rating) || (mock ? mock.rating : 4.9),
                        terjual: item.terjual || (mock ? mock.terjual : '200+ terjual'),
                        badge: item.badge || (mock ? mock.badge : 'Bebas Ongkir'),
                        isOfficial: item.isOfficial !== undefined ? item.isOfficial : (mock ? mock.isOfficial : true),
                        cashback: item.cashback || (mock ? mock.cashback : ''),
                        status: item.status || 'APPROVED'
                    };
                });
                this._cache.usaha = mapped;
                localStorage.setItem(this.STORAGE_KEYS.USAHA, JSON.stringify(mapped));
                return mapped;
            }
        } catch (err) {
            console.warn('[KMF_API] Gagal fetch usaha dari GAS:', err.message);
        }
        return this._cache.usaha || window.KMF_DATA.usahaList;
    },

    /**
     * Mengambil daftar alumni status PENDING untuk verifikasi pengurus
     */
    getPendingList: async function(forceNetwork = false) {
        if (!forceNetwork) {
            if (this._cache.pending) return this._cache.pending;
            const local = localStorage.getItem(this.STORAGE_KEYS.PENDING);
            if (local) {
                try {
                    this._cache.pending = JSON.parse(local);
                    return this._cache.pending;
                } catch (e) {}
            }
            if (window.KMF_DATA && window.KMF_DATA.pendingList) {
                this._cache.pending = window.KMF_DATA.pendingList;
                return this._cache.pending;
            }
        }
        return await this._fetchPendingFromGas();
    },

    _fetchPendingFromGas: async function() {
        const gasUrl = this.getGasUrl();
        if (!gasUrl) return this._cache.pending || window.KMF_DATA.pendingList;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            const res = await fetch(`${gasUrl}?action=getPending`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                this._cache.pending = data.data;
                localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(data.data));
                return data.data;
            }
        } catch (err) {
            console.warn('[KMF_API] Gagal fetch pending dari GAS:', err.message);
        }
        return this._cache.pending || window.KMF_DATA.pendingList;
    },

    /**
     * Sinkronisasi data dari Google Apps Script di latar belakang (Non-Blocking)
     * Dipanggil setelah antarmuka selesai dimuat seketika dari cache.
     */
    syncInBackground: async function(onUpdatedCallback) {
        if (this._cache.isSyncing) return;
        const gasUrl = this.getGasUrl();
        if (!gasUrl) return;

        this._cache.isSyncing = true;
        try {
            console.log('[KMF_API] Memulai sinkronisasi latar belakang...');
            const [alumniRes, usahaRes, pendingRes] = await Promise.allSettled([
                this._fetchAlumniFromGas(),
                this._fetchUsahaFromGas(),
                this._fetchPendingFromGas()
            ]);

            const hasUpdated = (alumniRes.status === 'fulfilled' || usahaRes.status === 'fulfilled' || pendingRes.status === 'fulfilled');
            if (hasUpdated && typeof onUpdatedCallback === 'function') {
                onUpdatedCallback();
            }
        } catch (err) {
            console.warn('[KMF_API] Sinkronisasi latar belakang terhenti:', err);
        } finally {
            this._cache.isSyncing = false;
        }
    },

    /**
     * Mengirim formulir pendaftaran sensus alumni (+ usaha)
     * Status otomatis: PENDING (menunggu approval pengurus)
     */
    submitRegistration: async function(payload) {
        payload.id = 'KMF-DMK-' + Date.now();
        payload.timestamp = new Date().toISOString();
        payload.status = 'PENDING';

        const gasUrl = this.getGasUrl();
        let gasSuccess = false;

        if (gasUrl) {
            try {
                const res = await fetch(gasUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'submitRegistration',
                        data: payload
                    })
                });
                const result = await res.json();
                if (result.status === 'success') gasSuccess = true;
            } catch (err) {
                console.warn('Koneksi ke Google Apps Script gagal, disimpan di offline database:', err);
            }
        }

        // Simpan selalu ke pending list di local
        const pending = await this.getPendingList();
        pending.unshift(payload);
        this._cache.pending = pending;
        localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(pending));

        return {
            status: 'success',
            gasSynced: gasSuccess,
            id: payload.id,
            message: 'Pendaftaran berhasil dikirim. Menunggu verifikasi dari Pengurus KMF Demak.'
        };
    },

    /**
     * Verifikasi & Approval Alumni oleh Pengurus KMF
     */
    approveAlumni: async function(pendingId, adminNote = '') {
        const pending = await this.getPendingList();
        const index = pending.findIndex(p => p.id === pendingId);
        if (index === -1) throw new Error('Data alumni tidak ditemukan.');

        const item = pending[index];
        item.status = 'APPROVED';
        item.catatanAdmin = adminNote;

        // Pindahkan ke list alumni aktif
        const alumni = await this.getApprovedAlumni();
        alumni.unshift(item);
        this._cache.alumni = alumni;
        localStorage.setItem(this.STORAGE_KEYS.ALUMNI, JSON.stringify(alumni));

        // Jika pendaftar memiliki data usaha, masukkan ke katalog usaha
        if (item.usaha && item.usaha.namaUsaha) {
            const usahaList = await this.getApprovedUsaha();
            usahaList.unshift({
                id: 'USH-DMK-' + Date.now(),
                alumniId: item.id,
                pemilik: item.nama,
                namaUsaha: item.usaha.namaUsaha,
                kategori: item.usaha.kategori || 'Lainnya',
                kecamatan: item.kecamatan,
                desa: item.desa,
                alamatLengkap: item.alamat,
                waBisnis: item.usaha.waBisnis || item.noWa,
                linkGmaps: item.usaha.linkGmaps || '',
                deskripsi: item.usaha.deskripsi,
                foto: item.usaha.foto,
                status: 'APPROVED'
            });
            this._cache.usaha = usahaList;
            localStorage.setItem(this.STORAGE_KEYS.USAHA, JSON.stringify(usahaList));
        }

        // Hapus dari pending
        pending.splice(index, 1);
        this._cache.pending = pending;
        localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(pending));

        // Sync ke Google Apps Script jika URL aktif
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                await fetch(gasUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'approveAlumni', id: pendingId, note: adminNote })
                });
            } catch (err) {
                console.warn('Gagal sync approval ke GAS:', err);
            }
        }

        return { status: 'success', message: 'Alumni berhasil disetujui & aktif di direktori.' };
    },

    /**
     * Menolak pendaftaran alumni
     */
    rejectAlumni: async function(pendingId, reason = '') {
        const pending = await this.getPendingList();
        const index = pending.findIndex(p => p.id === pendingId);
        if (index === -1) throw new Error('Data alumni tidak ditemukan.');

        pending.splice(index, 1);
        this._cache.pending = pending;
        localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(pending));

        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                await fetch(gasUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'rejectAlumni', id: pendingId, reason: reason })
                });
            } catch (err) {}
        }

        return { status: 'success', message: 'Pendaftaran ditolak.' };
    },

    /**
     * Mengambil daftar Buku Tamu / RSVP Selapanan dari Spreadsheet
     */
    getRSVPList: async function() {
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const res = await fetch(`${gasUrl}?action=getRSVP`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.json();
                if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                    return data.data.map(item => ({
                        id: item.id || item.idRespon || ('rsvp_' + Math.random()),
                        nama: item.nama || item.namaSahabatAlumni || 'Sahabat Alumni',
                        asal: item.asal || item.asalAngkatanKecamatan || 'Alumni KMF',
                        kehadiran: item.kehadiran || item.statusKehadiran || 'hadir',
                        pesan: item.pesan || item.doaRestuPesan || '',
                        waktu: item.waktu || item.waktuKirim || new Date().toISOString()
                    }));
                }
            } catch (err) {
                console.warn('Gagal memuat RSVP dari Google Apps Script, beralih ke cache lokal:', err.message);
            }
        }
        const local = localStorage.getItem('kmf_selapanan_rsvp_list');
        return local ? JSON.parse(local) : null;
    },

    /**
     * Mengirim konfirmasi kehadiran & doa restu Selapanan ke Spreadsheet
     */
    submitRSVP: async function(payload) {
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                await fetch(gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({
                        action: 'submitRSVP',
                        data: {
                            id: payload.id,
                            nama: payload.nama,
                            asal: payload.asal,
                            kehadiran: payload.kehadiran,
                            pesan: payload.pesan
                        }
                    })
                });
            } catch (err) {
                console.warn('Sync RSVP ke Google Apps Script gagal:', err);
            }
        }
    },

    /**
     * Verifikasi PIN Pengurus KMF
     */
    verifyAdminPin: function(pin) {
        const saved = localStorage.getItem(this.STORAGE_KEYS.ADMIN_PIN) || this.DEFAULT_PIN;
        return pin.trim() === saved.trim();
    },

    setAdminPin: function(newPin) {
        localStorage.setItem(this.STORAGE_KEYS.ADMIN_PIN, newPin);
    },

    getGasUrl: function() {
        return localStorage.getItem(this.STORAGE_KEYS.GAS_URL) || this.DEFAULT_GAS_URL;
    },

    setGasUrl: function(url) {
        localStorage.setItem(this.STORAGE_KEYS.GAS_URL, url.trim());
    }
};

// Inisialisasi otomatis
if (typeof window !== 'undefined') {
    window.KMF_API = KMF_API;
    KMF_API.init();
}
