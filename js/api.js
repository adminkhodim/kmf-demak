/**
 * KMF Demak - API Adapter & Data Layer
 * Menghubungkan antarmuka frontend dengan LocalStorage (offline/demo)
 * dan siap dihubungkan langsung ke Google Apps Script Web App Endpoint.
 */

const KMF_API = {
    STORAGE_KEYS: {
        ALUMNI: 'kmf_demak_alumni',
        USAHA: 'kmf_demak_usaha',
        PENDING: 'kmf_demak_pending',
        GAS_URL: 'kmf_demak_gas_url',
        ADMIN_PIN: 'kmf_demak_admin_pin'
    },

    // Default PIN Pengurus (1912: Tahun berdirinya Mathali'ul Falah Kajen)
    DEFAULT_PIN: '1912',

    /**
     * Inisialisasi data dari localStorage atau fallback ke KMF_DATA
     */
    init: function() {
        if (!localStorage.getItem(this.STORAGE_KEYS.ALUMNI)) {
            localStorage.setItem(this.STORAGE_KEYS.ALUMNI, JSON.stringify(window.KMF_DATA.alumniList));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.USAHA)) {
            localStorage.setItem(this.STORAGE_KEYS.USAHA, JSON.stringify(window.KMF_DATA.usahaList));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PENDING)) {
            localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(window.KMF_DATA.pendingList));
        }
    },

    /**
     * Mengambil daftar alumni yang sudah APPROVED
     */
    getApprovedAlumni: async function() {
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                const res = await fetch(`${gasUrl}?action=getAlumni`);
                const data = await res.json();
                if (data.status === 'success') return data.data;
            } catch (err) {
                console.warn('Gagal memuat dari Google Apps Script, beralih ke cache lokal:', err);
            }
        }
        const local = localStorage.getItem(this.STORAGE_KEYS.ALUMNI);
        return local ? JSON.parse(local) : window.KMF_DATA.alumniList;
    },

    /**
     * Mengambil daftar usaha yang sudah APPROVED
     */
    getApprovedUsaha: async function() {
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                const res = await fetch(`${gasUrl}?action=getUsaha`);
                const data = await res.json();
                if (data.status === 'success') return data.data;
            } catch (err) {
                console.warn('Gagal memuat dari Google Apps Script, beralih ke cache lokal:', err);
            }
        }
        const local = localStorage.getItem(this.STORAGE_KEYS.USAHA);
        return local ? JSON.parse(local) : window.KMF_DATA.usahaList;
    },

    /**
     * Mengambil daftar alumni status PENDING untuk verifikasi pengurus
     */
    getPendingList: async function() {
        const gasUrl = this.getGasUrl();
        if (gasUrl) {
            try {
                const res = await fetch(`${gasUrl}?action=getPending`);
                const data = await res.json();
                if (data.status === 'success') return data.data;
            } catch (err) {
                console.warn('Gagal memuat pending dari Google Apps Script, beralih ke cache lokal:', err);
            }
        }
        const local = localStorage.getItem(this.STORAGE_KEYS.PENDING);
        return local ? JSON.parse(local) : window.KMF_DATA.pendingList;
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
            localStorage.setItem(this.STORAGE_KEYS.USAHA, JSON.stringify(usahaList));
        }

        // Hapus dari pending
        pending.splice(index, 1);
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
        return localStorage.getItem(this.STORAGE_KEYS.GAS_URL) || '';
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
