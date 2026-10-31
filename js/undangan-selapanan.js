/**
 * ====================================================================
 * MODUL UNDANGAN DIGITAL INTERAKTIF SELAPANAN KMF DEMAK
 * Mengadopsi arsitektur undangan digital interaktif:
 * - Cover sampul pembuka personal (?to=Nama+Tamu)
 * - Backsong audio dengan floating player toggle
 * - Auto-scroll halus dengan deteksi sentuhan user
 * - Live countdown timer presisi
 * - Amplop digital & Infaq Selapanan (Salin BNI / QRIS)
 * - Buku Tamu & Doa Restu (RSVP) interaktif lokal & cloud-ready
 * - Generator tautan undangan personal WhatsApp
 * ====================================================================
 */

const UndanganSelapanan = {
    audio: null,
    isPlaying: false,
    isAutoScrolling: false,
    scrollAnimId: null,
    targetDate: new Date('2026-11-01T09:00:00+07:00').getTime(),
    countdownInterval: null,
    guestName: 'Sahabat / Alumni KMF',

    /**
     * Inisialisasi Modul Undangan Digital
     */
    init: function() {
        this.detectGuestName();
        this.initAudio();
        this.initCover();
        this.initCountdown();
        this.initAutoScroll();
        this.initRSVP();
        this.initShareGenerator();
        this.initCopyAccount();
    },

    /**
     * 1. Deteksi Nama Tamu dari URL (?to=Nama+Alumni atau ?nama=...)
     */
    detectGuestName: function() {
        const params = new URLSearchParams(window.location.search);
        const toParam = params.get('to') || params.get('nama') || params.get('guest');
        if (toParam && toParam.trim()) {
            this.guestName = decodeURIComponent(toParam.trim());
        } else {
            // Cek jika user login di KMF App
            const savedProfile = localStorage.getItem('kmf_user_profile');
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    if (profile && profile.nama) {
                        this.guestName = profile.nama;
                    }
                } catch (e) {}
            }
        }

        // Update semua elemen penerima di DOM
        document.querySelectorAll('.undangan-guest-name').forEach(el => {
            el.textContent = this.guestName;
        });

        const rsvpNameInput = document.getElementById('rsvp-input-nama');
        if (rsvpNameInput && !rsvpNameInput.value && this.guestName !== 'Sahabat / Alumni KMF') {
            rsvpNameInput.value = this.guestName;
        }
    },

    /**
     * 2. Manajemen Audio Backsong
     */
    initAudio: function() {
        if (!this.audio) {
            this.audio = new Audio('assets/audio/backsong-selapanan.mp3');
            this.audio.loop = true;
            this.audio.volume = 0.7;

            this.audio.addEventListener('play', () => {
                this.isPlaying = true;
                this.updateAudioButtonUI();
            });

            this.audio.addEventListener('pause', () => {
                this.isPlaying = false;
                this.updateAudioButtonUI();
            });

            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.updateAudioButtonUI();
            });
        }
    },

    toggleAudio: function() {
        if (!this.audio) this.initAudio();
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(err => {
                console.warn('Pemutaran audio dicegah peramban:', err);
            });
        }
    },

    updateAudioButtonUI: function() {
        const btn = document.getElementById('btn-undangan-audio');
        const icon = document.getElementById('icon-undangan-audio');
        if (!btn || !icon) return;

        if (this.isPlaying) {
            btn.classList.add('playing');
            btn.classList.remove('opacity-70');
            icon.className = 'fa-solid fa-compact-disc animate-spin text-emerald-400 text-lg';
            btn.setAttribute('title', 'Jeda Musik');
        } else {
            btn.classList.remove('playing');
            btn.classList.add('opacity-70');
            icon.className = 'fa-solid fa-music text-slate-200 text-base';
            btn.setAttribute('title', 'Putar Musik');
        }
    },

    /**
     * 3. Cover Sampul Pembuka (Gesture Pemulai Audio)
     */
    initCover: function() {
        const btnBuka = document.getElementById('btn-buka-undangan');
        const overlay = document.getElementById('undangan-cover-overlay');
        const floatingDock = document.getElementById('floating-undangan-controls');

        if (btnBuka && overlay) {
            btnBuka.addEventListener('click', () => {
                this.bukaUndangan();
            });
        }
    },

    bukaUndangan: function() {
        const overlay = document.getElementById('undangan-cover-overlay');
        const floatingDock = document.getElementById('floating-undangan-controls');

        if (overlay) {
            overlay.classList.add('opened');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 900);
        }

        if (floatingDock) {
            floatingDock.classList.remove('hidden');
            floatingDock.classList.add('flex');
        }

        // Mulai Backsong secara legal via user gesture
        if (this.audio) {
            this.audio.play().catch(e => {
                console.log('Audio autoplay prevented:', e);
            });
        }

        // Smooth scroll ke atas konten utama
        const contentHeader = document.getElementById('undangan-content-top');
        if (contentHeader) {
            contentHeader.scrollIntoView({ behavior: 'smooth' });
        }
    },

    tutupUndanganKembali: function() {
        const overlay = document.getElementById('undangan-cover-overlay');
        const floatingDock = document.getElementById('floating-undangan-controls');
        if (overlay) {
            overlay.style.display = 'flex';
            requestAnimationFrame(() => {
                overlay.classList.remove('opened');
            });
        }
        if (floatingDock) {
            floatingDock.classList.add('hidden');
            floatingDock.classList.remove('flex');
        }
        this.stopAutoScroll();
        if (this.audio) {
            this.audio.pause();
        }
    },

    /**
     * 4. Countdown Timer Hitung Mundur
     */
    initCountdown: function() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = this.targetDate - now;

            const daysEl = document.getElementById('timer-days');
            const hoursEl = document.getElementById('timer-hours');
            const minutesEl = document.getElementById('timer-minutes');
            const secondsEl = document.getElementById('timer-seconds');
            const badgeStatusEl = document.getElementById('timer-status-badge');

            if (distance < 0) {
                if (daysEl) daysEl.textContent = '00';
                if (hoursEl) hoursEl.textContent = '00';
                if (minutesEl) minutesEl.textContent = '00';
                if (secondsEl) secondsEl.textContent = '00';
                if (badgeStatusEl) {
                    badgeStatusEl.textContent = 'Acara Sedang / Telah Berlangsung';
                    badgeStatusEl.className = 'text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 inline-flex items-center gap-1.5';
                }
                clearInterval(this.countdownInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        this.countdownInterval = setInterval(updateTimer, 1000);
    },

    /**
     * 5. Mesin Auto-Scroll Otomatis & Cerdas
     */
    initAutoScroll: function() {
        const toggleBtn = document.getElementById('btn-undangan-autoscroll');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleAutoScroll();
            });
        }

        // Pause otomatis jika user menyentuh/menggeser layar manual
        const pauseOnUserInteraction = () => {
            if (this.isAutoScrolling) {
                this.stopAutoScroll();
            }
        };

        window.addEventListener('touchstart', pauseOnUserInteraction, { passive: true });
        window.addEventListener('wheel', pauseOnUserInteraction, { passive: true });
    },

    toggleAutoScroll: function() {
        if (this.isAutoScrolling) {
            this.stopAutoScroll();
        } else {
            this.startAutoScroll();
        }
    },

    startAutoScroll: function() {
        this.isAutoScrolling = true;
        this.updateAutoScrollUI();

        const scrollStep = () => {
            if (!this.isAutoScrolling) return;

            // Cek apakah sudah mentok paling bawah
            if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 10)) {
                this.stopAutoScroll();
                return;
            }

            window.scrollBy({ top: 1.5, behavior: 'auto' });
            this.scrollAnimId = requestAnimationFrame(scrollStep);
        };

        this.scrollAnimId = requestAnimationFrame(scrollStep);
    },

    stopAutoScroll: function() {
        this.isAutoScrolling = false;
        if (this.scrollAnimId) {
            cancelAnimationFrame(this.scrollAnimId);
            this.scrollAnimId = null;
        }
        this.updateAutoScrollUI();
    },

    updateAutoScrollUI: function() {
        const btn = document.getElementById('btn-undangan-autoscroll');
        const icon = document.getElementById('icon-undangan-autoscroll');
        if (!btn || !icon) return;

        if (this.isAutoScrolling) {
            btn.classList.add('bg-emerald-600', 'text-white', 'ring-2', 'ring-emerald-400');
            btn.classList.remove('bg-slate-900/80', 'text-slate-300');
            icon.className = 'fa-solid fa-pause text-sm';
            btn.setAttribute('title', 'Jeda Auto-Scroll');
        } else {
            btn.classList.remove('bg-emerald-600', 'text-white', 'ring-2', 'ring-emerald-400');
            btn.classList.add('bg-slate-900/80', 'text-slate-300');
            icon.className = 'fa-solid fa-angles-down text-sm animate-bounce';
            btn.setAttribute('title', 'Mulai Auto-Scroll');
        }
    },

    /**
     * 6. Amplop Digital - Salin Nomor Rekening BNI
     */
    initCopyAccount: function() {
        window.salinRekeningSelapanan = (norek = '1208305397') => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(norek).then(() => {
                    this.showCopyFeedback();
                }).catch(() => {
                    this.fallbackCopy(norek);
                });
            } else {
                this.fallbackCopy(norek);
            }
        };
    },

    fallbackCopy: function(text) {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        this.showCopyFeedback();
    },

    showCopyFeedback: function() {
        const btn = document.getElementById('btn-salin-rekening');
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Berhasil Disalin!';
            btn.classList.add('bg-emerald-700', 'text-white');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('bg-emerald-700', 'text-white');
            }, 2500);
        }

        if (window.App && typeof window.App.showNotification === 'function') {
            window.App.showNotification('Nomor rekening BNI 1208305397 berhasil disalin ke clipboard.');
        } else {
            alert('Nomor rekening BNI berhasil disalin: 1208305397 (Ahmad Muntohar)');
        }
    },

    /**
     * 7. Buku Tamu & Doa Restu (RSVP)
     */
    initRSVP: function() {
        this.renderRSVPList();

        const form = document.getElementById('undangan-rsvp-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRSVP();
            });
        }
    },

    submitRSVP: function() {
        const namaInput = document.getElementById('rsvp-input-nama');
        const asalInput = document.getElementById('rsvp-input-asal');
        const kehadiranInput = document.querySelector('input[name="rsvp-kehadiran"]:checked');
        const pesanInput = document.getElementById('rsvp-input-pesan');

        if (!namaInput || !namaInput.value.trim()) {
            alert('Silakan masukkan nama Anda.');
            return;
        }

        if (!kehadiranInput) {
            alert('Silakan pilih konfirmasi kehadiran Anda.');
            return;
        }

        const newEntry = {
            id: 'rsvp_' + Date.now(),
            nama: namaInput.value.trim(),
            asal: asalInput ? asalInput.value.trim() : 'Alumni KMF',
            kehadiran: kehadiranInput.value,
            pesan: pesanInput ? pesanInput.value.trim() : '',
            waktu: new Date().toISOString()
        };

        const existingList = this.getStoredRSVPList();
        existingList.unshift(newEntry);
        localStorage.setItem('kmf_selapanan_rsvp_list', JSON.stringify(existingList));

        // Render ulang daftar ucapan
        this.renderRSVPList();

        // Bersihkan input pesan
        if (pesanInput) pesanInput.value = '';

        // Feedback konfirmasi
        const feedbackEl = document.getElementById('rsvp-success-feedback');
        if (feedbackEl) {
            feedbackEl.classList.remove('hidden');
            setTimeout(() => {
                feedbackEl.classList.add('hidden');
            }, 4000);
        }

        if (window.App && typeof window.App.showNotification === 'function') {
            window.App.showNotification('Jazakallah khair! Konfirmasi kehadiran & doa Anda telah tercatat.');
        }
    },

    getStoredRSVPList: function() {
        const raw = localStorage.getItem('kmf_selapanan_rsvp_list');
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error(e);
            }
        }

        // Data awal (Seed Default) agar buku tamu terlihat hidup & bernuansa santri
        return [
            {
                id: 'rsvp_seed_1',
                nama: 'Gus Ahmad Muntohar',
                asal: 'Pengurus Cabang Demak',
                kehadiran: 'hadir',
                pesan: 'Bismillah, sugeng rawuh sedulur alumni Mathali\'ul Falah se-Kabupaten Demak. Mugi-mugi pinaringan barokah lan sehat sedoyo.',
                waktu: new Date(Date.now() - 3600000 * 5).toISOString()
            },
            {
                id: 'rsvp_seed_2',
                nama: 'Kang Zaidin',
                asal: 'Kec. Karanganyar - Angkatan 2008',
                kehadiran: 'hadir',
                pesan: 'Insya Allah rawuh ngalap berkah dhawuh KH. Abdul Aziz Musyaffa\'. Titip salam kagem poro rawuh.',
                waktu: new Date(Date.now() - 3600000 * 12).toISOString()
            },
            {
                id: 'rsvp_seed_3',
                nama: 'Mbak Siti Nur Halimah',
                asal: 'Kec. Mranggen - Angkatan 2015',
                kehadiran: 'ragu',
                pesan: 'Insya Allah ngusahakaken hadir. Menawi mboten saged, nyuwun agunging pangapunten, nderek titip infaq lewat transfer.',
                waktu: new Date(Date.now() - 3600000 * 24).toISOString()
            }
        ];
    },

    renderRSVPList: function() {
        const container = document.getElementById('rsvp-messages-list');
        const countHadirEl = document.getElementById('rsvp-count-hadir');
        const countTotalEl = document.getElementById('rsvp-count-total');
        if (!container) return;

        const list = this.getStoredRSVPList();
        
        let hadirCount = 0;
        list.forEach(item => {
            if (item.kehadiran === 'hadir') hadirCount++;
        });

        if (countHadirEl) countHadirEl.textContent = hadirCount;
        if (countTotalEl) countTotalEl.textContent = list.length;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6 text-slate-400 text-xs italic">
                    Belum ada konfirmasi kehadiran. Jadilah yang pertama memberikan konfirmasi & doa restu!
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(item => {
            let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            let badgeText = '<i class="fa-solid fa-circle-check mr-1 text-[10px]"></i> Insya Allah Hadir';
            
            if (item.kehadiran === 'ragu') {
                badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                badgeText = '<i class="fa-solid fa-clock mr-1 text-[10px]"></i> Masih Ragu-ragu';
            } else if (item.kehadiran === 'absen') {
                badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                badgeText = '<i class="fa-solid fa-circle-xmark mr-1 text-[10px]"></i> Berhalangan Hadir';
            }

            const initials = item.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AL';
            const formattedDate = this.formatRelativeTime(item.waktu);

            return `
                <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-2 hover:border-emerald-500/40 transition">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                                ${initials}
                            </div>
                            <div class="min-w-0">
                                <h5 class="text-xs font-bold text-slate-100 truncate">${this.escapeHtml(item.nama)}</h5>
                                <p class="text-[10px] text-slate-400 truncate">${this.escapeHtml(item.asal || 'Alumni KMF')}</p>
                            </div>
                        </div>
                        <span class="text-[9.5px] px-2 py-0.5 rounded-full border shrink-0 font-medium ${badgeClass}">
                            ${badgeText}
                        </span>
                    </div>
                    ${item.pesan ? `
                        <p class="text-xs text-slate-300 leading-relaxed font-normal pl-1 border-l-2 border-emerald-500/40 italic">
                            "${this.escapeHtml(item.pesan)}"
                        </p>
                    ` : ''}
                    <div class="text-[9px] text-slate-500 text-right">
                        ${formattedDate}
                    </div>
                </div>
            `;
        }).join('');
    },

    formatRelativeTime: function(isoString) {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours < 1) return 'Baru saja';
            if (diffHours < 24) return `${diffHours} jam yang lalu`;
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} hari yang lalu`;
        } catch (e) {
            return 'Beberapa saat yang lalu';
        }
    },

    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * 8. Generator Tautan Undangan WhatsApp Personal
     */
    initShareGenerator: function() {
        const inputTamu = document.getElementById('share-input-nama-tamu');
        const btnShareWA = document.getElementById('btn-share-custom-wa');

        if (btnShareWA) {
            btnShareWA.addEventListener('click', () => {
                const targetName = (inputTamu && inputTamu.value.trim()) ? inputTamu.value.trim() : 'Sahabat Alumni';
                this.shareToWhatsApp(targetName);
            });
        }
    },

    shareToWhatsApp: function(targetRecipientName) {
        const baseUrl = window.location.origin + window.location.pathname;
        const invitationUrl = `${baseUrl}?p=selapanan&to=${encodeURIComponent(targetRecipientName)}`;

        const textMessage = `*UNDANGAN RESMI SELAPANAN KMF DEMAK* 🕌\n\n` +
            `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\n` +
            `Kepada Yth. Sahabat/Alumni:\n` +
            `*${targetRecipientName}*\n` +
            `di Tempat\n\n` +
            `Mengharap dengan hormat kehadiran panjenengan dalam agenda *Selapanan KMF Cabang Demak* yang insya Allah diselenggarakan pada:\n\n` +
            `🗓️ *Hari/Tgl* : Ahad, 01 November 2026\n` +
            `⏱️ *Waktu*    : 09.00 WIB s/d selesai\n` +
            `📢 *Mau'idhoh*: KH. Abdul Aziz Musyaffa'\n` +
            `🏡 *Tempat*   : Rumah KH. Abdul Aziz Musyaffa' (PP Nurul Hikmah Demak Kota)\n` +
            `📍 *Maps*     : https://maps.app.goo.gl/EvjHdS5waFtwAnzv8\n\n` +
            `Buka lembar warta dan konfirmasi kehadiran panjenengan melalui tautan undangan digital khusus berikut:\n` +
            `🔗 ${invitationUrl}\n\n` +
            `Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran panjenengan. Maturnuwun.\n\n` +
            `Wassalamu'alaikum Warahmatullahi Wabarakatuh\n` +
            `*Pengurus Cabang KMF Demak*`;

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
        window.open(waUrl, '_blank');
    }
};

window.UndanganSelapanan = UndanganSelapanan;

