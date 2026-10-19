/**
 * KMF Demak - Main Application Controller (PWA & Web)
 * Mengatur navigasi, rendering data, filter interaktif, kompresi gambar,
 * dialog detail alumni/usaha/berita, banner slider 3:1, dan sistem verifikasi approval pengurus.
 */

const App = {
    currentTab: 'home',
    currentAmalanTab: 'tahlil',
    selectedUsahaCategory: '',
    selectedBeritaCategory: '',
    currentSlideIndex: 0,
    sliderInterval: null,
    isAdminLoggedIn: false,
    arabicFontSize: 24, // Ukuran font default untuk teks Arab (px)
    deferredInstallPrompt: null,

    init: async function() {
        console.log('Inisialisasi Aplikasi KMF Demak...');

        // 1. Populasi Master Data ke Formulir dan Filter
        this.populateDropdowns();

        // 2. Render Komponen Utama
        this.initUserAuth();
        await this.renderHome();
        this.initBannerSlider();
        await this.renderAlumniList();
        await this.renderUsahaList();
        this.renderBeritaList();
        this.renderAmalan();
        this.renderUserProfileCard();
        await this.updatePendingBadge();

        // 3. Listener PWA Install Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            
            // Tampilkan tombol pasang di desktop dan mobile header
            const btnDesk = document.getElementById('btn-install-pwa');
            const btnMob = document.getElementById('mobile-btn-install-app');
            if (btnDesk) {
                btnDesk.classList.remove('hidden');
                btnDesk.classList.add('flex');
            }
            if (btnMob) {
                btnMob.classList.remove('hidden');
                btnMob.classList.add('flex');
            }
        });
    },

    /**
     * Populasi Dropdown Kecamatan dan Kategori
     */
    populateDropdowns: function() {
        const filterAlumniKec = document.getElementById('filter-alumni-kecamatan');
        const filterUsahaKec = document.getElementById('filter-usaha-kecamatan');
        const regKecamatan = document.getElementById('register-kecamatan');

        if (window.KMF_DATA && window.KMF_DATA.kecamatanList) {
            window.KMF_DATA.kecamatanList.forEach(kec => {
                if (filterAlumniKec) filterAlumniKec.innerHTML += `<option value="${kec}">Kec. ${kec}</option>`;
                if (filterUsahaKec) filterUsahaKec.innerHTML += `<option value="${kec}">Kec. ${kec}</option>`;
                if (regKecamatan) regKecamatan.innerHTML += `<option value="${kec}">Kecamatan ${kec}</option>`;
            });
        }

        const filterAlumniProf = document.getElementById('filter-alumni-profesi');
        const regProfesi = document.getElementById('register-profesi');

        if (window.KMF_DATA && window.KMF_DATA.profesiCategories) {
            window.KMF_DATA.profesiCategories.forEach(prof => {
                if (filterAlumniProf) filterAlumniProf.innerHTML += `<option value="${prof}">${prof}</option>`;
                if (regProfesi) regProfesi.innerHTML += `<option value="${prof}">${prof}</option>`;
            });
        }

        const regUsahaCat = document.getElementById('register-usaha-kategori');
        const usahaChips = document.getElementById('usaha-category-chips');

        if (window.KMF_DATA && window.KMF_DATA.usahaCategories) {
            window.KMF_DATA.usahaCategories.forEach(cat => {
                if (regUsahaCat) regUsahaCat.innerHTML += `<option value="${cat}">${cat}</option>`;
                if (usahaChips) {
                    usahaChips.innerHTML += `
                        <button onclick="App.filterUsahaCategory('${cat}')" class="chip-usaha-btn whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition active:scale-95 text-xs" data-cat="${cat}">
                            ${cat}
                        </button>
                    `;
                }
            });
        }
    },

    /**
     * Banner Slider 3:1 (Mobile Ala Asnawiyyah)
     */
    initBannerSlider: function() {
        const sliderContainer = document.getElementById('hero-slider-container');
        const dotsContainer = document.getElementById('hero-dots-container');
        const banners = (window.KMF_DATA && window.KMF_DATA.bannerList) || [];
        if (!sliderContainer || !dotsContainer || banners.length === 0) return;

        sliderContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        banners.forEach((b, idx) => {
            // Slide Item
            const slide = document.createElement('div');
            slide.className = `hero-slide absolute inset-0 transition-opacity duration-700 cursor-pointer overflow-hidden ${idx === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
            slide.onclick = () => {
                if (b.tipeAksi === 'tab') {
                    App.navigateTo(b.targetAksi);
                } else if (b.targetAksi) {
                    window.open(b.targetAksi, '_blank');
                }
            };
            slide.innerHTML = `
                <img src="${b.gambar}" alt="${b.nama}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3 text-white">
                    <span class="text-[8.5px] font-bold uppercase tracking-wider bg-kmf-gold text-slate-950 px-2 py-0.5 rounded-full inline-block self-start shadow-xs mb-1">
                        ${b.tag || 'Info KMF'}
                    </span>
                    <h4 class="text-xs font-extrabold text-white line-clamp-1 leading-tight">${b.nama}</h4>
                    <p class="text-[10px] text-slate-200 line-clamp-1 mt-0.5">${b.subjudul || ''}</p>
                </div>
            `;
            sliderContainer.appendChild(slide);

            // Dot Indicator
            const dot = document.createElement('button');
            dot.className = `hero-dot transition-all duration-300 rounded-full ${idx === 0 ? 'w-5 h-1.5 bg-kmf-gold' : 'w-1.5 h-1.5 bg-slate-300'}`;
            dot.setAttribute('aria-label', `Slide ${idx + 1}`);
            dot.onclick = () => App.goToSlide(idx);
            dotsContainer.appendChild(dot);
        });

        this.currentSlideIndex = 0;
        if (this.sliderInterval) clearInterval(this.sliderInterval);
        this.sliderInterval = setInterval(() => {
            const nextIdx = (App.currentSlideIndex + 1) % banners.length;
            App.goToSlide(nextIdx);
        }, 4500);
    },

    goToSlide: function(idx) {
        const slides = document.querySelectorAll('#hero-slider-container .hero-slide');
        const dots = document.querySelectorAll('#hero-dots-container .hero-dot');
        if (slides.length === 0) return;

        this.currentSlideIndex = idx;
        slides.forEach((s, i) => {
            if (i === idx) {
                s.classList.remove('opacity-0', 'z-0');
                s.classList.add('opacity-100', 'z-10');
            } else {
                s.classList.remove('opacity-100', 'z-10');
                s.classList.add('opacity-0', 'z-0');
            }
        });

        dots.forEach((d, i) => {
            if (i === idx) {
                d.className = 'hero-dot transition-all duration-300 rounded-full w-5 h-1.5 bg-kmf-gold';
            } else {
                d.className = 'hero-dot transition-all duration-300 rounded-full w-1.5 h-1.5 bg-slate-300';
            }
        });
    },

    /**
     * Navigasi Antar Tab (SPA Router)
     */
    navigateTo: function(targetTab) {
        if (targetTab === 'ibadah') targetTab = 'amalan';
        this.currentTab = targetTab;

        // Sembunyikan semua tab content
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.add('hidden');
        });

        // Tampilkan tab yang dipilih
        const activeSection = document.getElementById(`view-${targetTab}`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }

        // Update status bottom navigation (Mobile - Gaya Asnawiyyah)
        document.querySelectorAll('.nav-mob-btn').forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update status navbar desktop
        document.querySelectorAll('.nav-desktop-btn').forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === targetTab) {
                btn.classList.add('bg-kmf-700', 'border-b-2', 'border-kmf-gold');
            } else {
                btn.classList.remove('bg-kmf-700', 'border-b-2', 'border-kmf-gold');
            }
        });

        // Tindakan spesifik jika membuka admin
        if (targetTab === 'admin') {
            if (this.isAdminLoggedIn) {
                document.getElementById('admin-login-box')?.classList.add('hidden');
                document.getElementById('admin-dashboard-box')?.classList.remove('hidden');
                this.renderAdminPending();
            } else {
                document.getElementById('admin-login-box')?.classList.remove('hidden');
                document.getElementById('admin-dashboard-box')?.classList.add('hidden');
            }
        }

        // Tindakan spesifik jika membuka amalan / ibadah
        if (targetTab === 'amalan' || targetTab === 'ibadah') {
            this.renderIbadah();
        }

        // Tindakan spesifik jika membuka usaha (Katalog Tokopedia)
        if (targetTab === 'usaha') {
            this.renderUsahaList();
        }

        // Tindakan spesifik jika membuka pengaturan (Profil Santri)
        if (targetTab === 'pengaturan') {
            this.renderUserProfileCard();
        }

        // Scroll kembali ke atas layar (baik main container maupun window)
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
        window.scrollTo({ top: 0, behavior: 'instant' });
    },

    /**
     * Render Halaman Beranda (Statistik & Agenda Terdekat)
     */
    renderHome: async function() {
        const alumni = await window.KMF_API.getApprovedAlumni();
        const usaha = await window.KMF_API.getApprovedUsaha();

        // Counter Statistik Desktop
        const statAlumni = document.getElementById('stat-alumni');
        const statUsaha = document.getElementById('stat-usaha');
        if (statAlumni) statAlumni.textContent = alumni.length;
        if (statUsaha) statUsaha.textContent = usaha.length;

        // Render Agenda Desktop & Mobile
        const agendaHtml = window.KMF_DATA.agendaList.map(item => `
            <div class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-kmf-500 transition space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                    <span class="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-kmf-700 border border-emerald-200/70">
                        ${item.kategori}
                    </span>
                    <span class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <i class="fa-regular fa-clock text-kmf-600"></i> ${item.tanggal}
                    </span>
                </div>
                <h4 class="font-bold text-slate-800 text-sm leading-tight">${item.title}</h4>
                <p class="text-xs text-slate-500 leading-relaxed">${item.deskripsi}</p>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div class="flex items-center gap-1.5 text-[11px] font-medium truncate">
                        <i class="fa-solid fa-location-dot text-rose-500 shrink-0"></i>
                        <span class="truncate">${item.tempat}</span>
                    </div>
                    <a href="https://wa.me/?text=${encodeURIComponent('Undangan Kegiatan KMF Demak: *' + item.title + '* pada ' + item.tanggal + ' di ' + item.tempat)}" target="_blank" class="shrink-0 text-[10.5px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                        <i class="fa-brands fa-whatsapp"></i> Bagikan
                    </a>
                </div>
            </div>
        `).join('');

        const agendaDesk = document.getElementById('home-agenda-container');
        if (agendaDesk) agendaDesk.innerHTML = agendaHtml;

        const agendaMob = document.getElementById('mobile-agenda-container');
        if (agendaMob) agendaMob.innerHTML = agendaHtml;

        // Render Spotlight Usaha (Desktop & Mobile)
        const spotlightHtml = usaha.slice(0, 3).map(u => `
            <div onclick="App.openUsahaDetail('${u.id}')" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between active:scale-[0.99]">
                <div class="h-32 bg-slate-100 overflow-hidden relative">
                    <img src="${u.foto}" alt="${u.namaUsaha}" class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 text-[9.5px] bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md font-semibold">
                        ${u.kategori}
                    </span>
                </div>
                <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                        <h4 class="font-bold text-sm text-slate-800 leading-tight">${u.namaUsaha}</h4>
                        <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${u.deskripsi}</p>
                    </div>
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-[10.5px] font-medium text-slate-600 truncate">
                            <i class="fa-solid fa-map-pin text-kmf-600"></i> Kec. ${u.kecamatan}
                        </span>
                        <a href="https://wa.me/${u.waBisnis}?text=${encodeURIComponent('Assalamu\'alaikum, saya alumni KMF Demak, ingin memesan/tanya produk ' + u.namaUsaha)}" target="_blank" onclick="event.stopPropagation()" class="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-lg font-medium transition active:scale-95 shadow-xs">
                            <i class="fa-brands fa-whatsapp"></i> Chat
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        const spotDesk = document.getElementById('home-spotlight-usaha');
        if (spotDesk) spotDesk.innerHTML = spotlightHtml;

        const spotMob = document.getElementById('mobile-spotlight-usaha');
        if (spotMob) spotMob.innerHTML = spotlightHtml;

        // Render Katalog Produk Usaha Scroll Mobile (Foto & Nama Produk saja)
        await this.renderKatalogUsahaScroll();

        // Render Headline Berita Mobile (Gaya Asnawiyyah)
        this.renderMobileHeadline();
    },

    /**
     * Render Katalog Produk Usaha Santri Horizontal Slider (Mobile Beranda)
     * Menampilkan Foto & Nama Produk saja dengan scroll slide ke kiri
     */
    renderKatalogUsahaScroll: async function() {
        const container = document.getElementById('home-katalog-usaha-scroll');
        if (!container) return;

        const usaha = await window.KMF_API.getApprovedUsaha();
        if (!usaha || usaha.length === 0) {
            container.innerHTML = '<p class="text-xs text-slate-400 py-2">Belum ada produk usaha.</p>';
            return;
        }

        container.innerHTML = usaha.map(u => `
            <div onclick="App.openUsahaDetail('${u.id}')" 
                class="w-20 sm:w-22 shrink-0 cursor-pointer group flex flex-col items-center active:scale-95 transition">
                <div class="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group-hover:border-kmf-500 transition duration-200 relative">
                    <img src="${u.foto}" alt="${u.namaUsaha}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                </div>
                <span class="text-[10px] font-bold text-slate-700 text-center line-clamp-1 leading-tight mt-1.5 group-hover:text-kmf-600 transition w-full px-0.5" title="${u.namaUsaha}">
                    ${u.namaUsaha}
                </span>
            </div>
        `).join('');
    },

    /**
     * Render Headline Berita & Warta (Mobile Beranda - Ala Desain Asnawiyyah)
     */
    renderMobileHeadline: function() {
        const container = document.getElementById('mobile-headline-container');
        if (!container) return;

        const list = (window.KMF_DATA && window.KMF_DATA.beritaList) || [];
        if (list.length === 0) {
            container.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">Belum ada warta headline.</p>';
            return;
        }

        // Tampilkan 2-3 berita headline teratas persis seperti Asnawiyyah
        const topNews = list.slice(0, 3);
        container.innerHTML = topNews.map(item => {
            const catBadgeClass = item.kategori === 'Kegiatan'
                ? 'bg-[#008f4c] text-white'
                : item.kategori === 'Organisasi'
                ? 'bg-kmf-700 text-white'
                : 'bg-amber-600 text-white';

            return `
                <article onclick="App.openBeritaDetail('${item.id}')" 
                    class="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:border-kmf-500 transition cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] group">
                    <div class="flex-1 min-w-0 space-y-1.5">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${catBadgeClass} tracking-wide">
                                ${item.kategori}
                            </span>
                            <span class="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                                <i class="fa-regular fa-eye text-[9.5px]"></i> ${item.views || 45}
                            </span>
                        </div>
                        <h4 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-kmf-600 transition">
                            ${item.judul}
                        </h4>
                        <div class="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span><i class="fa-regular fa-calendar text-[9px]"></i> ${item.tanggal}</span>
                        </div>
                    </div>
                    <div class="w-20 h-16 sm:w-22 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-2xs bg-slate-100">
                        <img src="${item.foto}" alt="${item.judul}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                    </div>
                </article>
            `;
        }).join('');
    },

    /**
     * Render Halaman Berita & Warta KMF Demak
     */
    renderBeritaList: function() {
        const container = document.getElementById('berita-cards-container');
        const badgeCount = document.getElementById('berita-count-badge');
        const list = (window.KMF_DATA && window.KMF_DATA.beritaList) || [];
        if (!container) return;

        const keyword = (document.getElementById('filter-berita-keyword')?.value || '').toLowerCase();
        const selectedCat = this.selectedBeritaCategory;

        const filtered = list.filter(item => {
            const matchKw = !keyword || 
                item.judul.toLowerCase().includes(keyword) || 
                item.ringkasan.toLowerCase().includes(keyword) || 
                item.kategori.toLowerCase().includes(keyword);

            const matchCat = !selectedCat || item.kategori === selectedCat;
            return matchKw && matchCat;
        });

        if (badgeCount) badgeCount.textContent = filtered.length;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
                        <i class="fa-regular fa-newspaper"></i>
                    </div>
                    <h4 class="font-bold text-slate-700 text-sm">Belum ada warta yang cocok</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto">Silakan coba kata kunci pencarian atau kategori lain.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <article onclick="App.openBeritaDetail('${item.id}')" class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between active:scale-[0.99] group">
                <div>
                    <!-- Foto Berita -->
                    <div class="h-44 sm:h-48 bg-slate-100 overflow-hidden relative">
                        <img src="${item.foto}" alt="${item.judul}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <span class="absolute top-2.5 left-2.5 text-[9.5px] bg-kmf-800/90 backdrop-blur-sm text-emerald-200 px-2.5 py-1 rounded-md font-bold">
                            ${item.kategori}
                        </span>
                    </div>

                    <!-- Isi Berita -->
                    <div class="p-4 space-y-2">
                        <div class="flex items-center gap-2 text-[11px] text-slate-400">
                            <span class="flex items-center gap-1">
                                <i class="fa-regular fa-calendar text-kmf-600"></i> ${item.tanggal}
                            </span>
                            <span>•</span>
                            <span>${item.penulis}</span>
                        </div>
                        <h3 class="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-kmf-700 transition line-clamp-2">
                            ${item.judul}
                        </h3>
                        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            ${item.ringkasan}
                        </p>
                    </div>
                </div>

                <div class="p-4 pt-0 flex items-center justify-between text-xs border-t border-slate-100 pt-3 text-kmf-700 font-bold">
                    <span>Baca Selengkapnya</span>
                    <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                </div>
            </article>
        `).join('');
    },

    filterBeritaCategory: function(cat) {
        this.selectedBeritaCategory = cat;
        document.querySelectorAll('.chip-berita-btn').forEach(btn => {
            if (btn.getAttribute('data-cat') === cat) {
                btn.classList.add('bg-kmf-600', 'text-white');
                btn.classList.remove('bg-slate-100', 'text-slate-700');
            } else {
                btn.classList.remove('bg-kmf-600', 'text-white');
                btn.classList.add('bg-slate-100', 'text-slate-700');
            }
        });
        this.renderBeritaList();
    },

    openBeritaDetail: function(id) {
        const list = (window.KMF_DATA && window.KMF_DATA.beritaList) || [];
        const item = list.find(b => String(b.id) === String(id));
        if (!item) return;

        const modal = document.getElementById('modal-detail-berita');
        if (!modal) return;

        document.getElementById('modal-berita-foto').src = item.foto;
        document.getElementById('modal-berita-kategori').textContent = item.kategori;
        document.getElementById('modal-berita-judul').textContent = item.judul;
        document.getElementById('modal-berita-tanggal').textContent = item.tanggal;
        document.getElementById('modal-berita-penulis').textContent = item.penulis;
        
        // Paragraf Konten
        const contentContainer = document.getElementById('modal-berita-konten');
        if (contentContainer) {
            contentContainer.innerHTML = item.konten.split('\n\n').map(p => `
                <p class="leading-relaxed text-slate-700 text-xs sm:text-sm">${p}</p>
            `).join('');
        }

        // WhatsApp Share
        const waShareBtn = document.getElementById('modal-berita-wa-share');
        if (waShareBtn) {
            waShareBtn.href = `https://wa.me/?text=${encodeURIComponent('Warta KMF Demak: *' + item.judul + '*\n\n' + item.ringkasan + '\n\nBaca di Aplikasi KMF Demak: ' + window.location.href)}`;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeBeritaDetail: function() {
        const modal = document.getElementById('modal-detail-berita');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Render Direktori Alumni Terverifikasi
     */
    renderAlumniList: async function() {
        const alumni = await window.KMF_API.getApprovedAlumni();
        const container = document.getElementById('alumni-cards-container');
        const badgeCount = document.getElementById('alumni-count-badge');
        if (!container) return;

        const keyword = (document.getElementById('filter-alumni-keyword')?.value || '').toLowerCase();
        const filterKec = document.getElementById('filter-alumni-kecamatan')?.value || '';
        const filterProf = document.getElementById('filter-alumni-profesi')?.value || '';

        const filtered = alumni.filter(item => {
            const matchKw = !keyword || 
                item.nama.toLowerCase().includes(keyword) ||
                (item.panggilan && item.panggilan.toLowerCase().includes(keyword)) ||
                (item.pondokKajen && item.pondokKajen.toLowerCase().includes(keyword)) ||
                (item.profesiDetail && item.profesiDetail.toLowerCase().includes(keyword));

            const matchKec = !filterKec || item.kecamatan === filterKec;
            const matchProf = !filterProf || item.profesiKategori === filterProf;

            return matchKw && matchKec && matchProf;
        });

        if (badgeCount) badgeCount.textContent = filtered.length;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-user-slash"></i>
                    </div>
                    <h4 class="font-bold text-slate-700 text-sm">Tidak ada data alumni yang cocok</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto">Silakan ubah kata kunci pencarian atau filter wilayah kecamatan.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div onclick="App.openAlumniDetail('${item.id}')" class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-kmf-500 hover:shadow-sm transition cursor-pointer flex gap-3 active:scale-[0.99] group">
                <!-- Foto Profil -->
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-inner group-hover:scale-105 transition duration-300">
                    <img src="${item.foto}" alt="${item.nama}" class="w-full h-full object-cover">
                </div>

                <!-- Informasi Alumni -->
                <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex items-start justify-between gap-1">
                        <div class="min-w-0">
                            <h3 class="font-bold text-xs sm:text-sm text-slate-800 leading-tight truncate group-hover:text-kmf-700 transition">${item.nama}</h3>
                            <p class="text-[10.5px] text-kmf-600 font-semibold truncate">${item.panggilan ? `"${item.panggilan}"` : ''} • Lulus ${item.tahunLulus}</p>
                        </div>
                        <span class="text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1">
                            <i class="fa-solid fa-circle-check text-[10px]"></i> Sahih
                        </span>
                    </div>

                    <!-- Riwayat Kajen -->
                    <div class="text-[10.5px] text-slate-600 space-y-0.5 pt-0.5">
                        <div class="flex items-center gap-1.5 truncate">
                            <i class="fa-solid fa-school text-slate-400 w-3 text-center"></i>
                            <span class="truncate">${item.marhalah}</span>
                        </div>
                        <div class="flex items-center gap-1.5 truncate">
                            <i class="fa-solid fa-mosque text-slate-400 w-3 text-center"></i>
                            <span class="truncate">${item.pondokKajen}</span>
                        </div>
                    </div>

                    <!-- Domisili & Tombol Sapa WA -->
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span class="text-slate-500 text-[10.5px] truncate">
                            <i class="fa-solid fa-location-dot text-rose-500"></i> Kec. ${item.kecamatan}
                        </span>

                        <div class="flex items-center gap-1.5">
                            <span class="text-[10.5px] text-slate-400 hover:text-kmf-600 font-semibold flex items-center gap-0.5">
                                Detail <i class="fa-solid fa-chevron-right text-[8.5px]"></i>
                            </span>
                            ${item.tampilkanWa && item.noWa ? `
                                <a href="https://wa.me/${item.noWa}?text=${encodeURIComponent('Assalamu\'alaikum wr. wb. ' + item.nama + ', saya sesama alumni Mathali\'ul Falah KMF Demak.')}" target="_blank" onclick="event.stopPropagation()" class="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg font-bold text-[10.5px] transition active:scale-95 border border-emerald-200/60 shadow-2xs">
                                    <i class="fa-brands fa-whatsapp text-emerald-600"></i> WA
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Buka Modal Dialog Detail Profil Alumni (Ala Asnawiyyah)
     */
    openAlumniDetail: async function(id) {
        const alumniList = await window.KMF_API.getApprovedAlumni();
        const item = alumniList.find(a => String(a.id) === String(id));
        if (!item) return;

        const modal = document.getElementById('modal-detail-alumni');
        if (!modal) return;

        document.getElementById('modal-alumni-foto').src = item.foto || 'assets/img/logo.png';
        document.getElementById('modal-alumni-nama').textContent = item.nama;
        document.getElementById('modal-alumni-panggilan').textContent = item.panggilan ? `"${item.panggilan}"` : '';
        document.getElementById('modal-alumni-lulus').textContent = item.tahunLulus;
        document.getElementById('modal-alumni-marhalah').textContent = item.marhalah;
        document.getElementById('modal-alumni-pondok').textContent = item.pondokKajen;
        document.getElementById('modal-alumni-guru').textContent = item.guruKajen || '-';
        document.getElementById('modal-alumni-domisili').textContent = `Desa ${item.desa || '-'}, Kec. ${item.kecamatan}, Kab. Demak`;
        document.getElementById('modal-alumni-profesi').textContent = item.profesiKategori || '-';
        document.getElementById('modal-alumni-profesi-detail').textContent = item.profesiDetail || '-';

        const waContainer = document.getElementById('modal-alumni-wa-container');
        const waBtn = document.getElementById('modal-alumni-wa-btn');
        if (waContainer && waBtn) {
            if (item.tampilkanWa && item.noWa) {
                waContainer.classList.remove('hidden');
                waBtn.href = `https://wa.me/${item.noWa}?text=${encodeURIComponent("Assalamu'alaikum wr. wb. " + item.nama + ", saya sesama alumni Mathali'ul Falah (KMF Demak), salam ukhuwah & silaturrahim.")}`;
            } else {
                waContainer.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeAlumniDetail: function() {
        const modal = document.getElementById('modal-detail-alumni');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Render Katalog Usaha Alumni - Tampilan Tokopedia Mobile Marketplace
     */
    onlyOfficialUsaha: false,
    onlyPromoUsaha: false,

    renderUsahaList: async function() {
        const usaha = await window.KMF_API.getApprovedUsaha();
        const container = document.getElementById('usaha-cards-container');
        if (!container) return;

        const keyword = (document.getElementById('filter-usaha-keyword')?.value || '').toLowerCase();
        const filterKec = document.getElementById('filter-usaha-kecamatan')?.value || '';
        const selectedCat = this.selectedUsahaCategory;

        const filtered = usaha.filter(u => {
            const matchKw = !keyword || 
                u.namaUsaha.toLowerCase().includes(keyword) || 
                u.deskripsi.toLowerCase().includes(keyword) || 
                u.pemilik.toLowerCase().includes(keyword);

            const matchKec = !filterKec || u.kecamatan === filterKec;
            const matchCat = !selectedCat || u.kategori === selectedCat;
            const matchOfficial = !this.onlyOfficialUsaha || u.isOfficial;
            const matchPromo = !this.onlyPromoUsaha || !!u.diskon;

            return matchKw && matchKec && matchCat && matchOfficial && matchPromo;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div class="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-[#00AA5B] flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-store-slash"></i>
                    </div>
                    <h4 class="font-bold text-slate-700 text-sm">Produk santri belum ditemukan</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto">Silakan coba kata kunci lain atau pilih semua kategori.</p>
                    <button onclick="App.filterUsahaCategory('')" class="text-xs font-bold text-[#00AA5B] hover:underline">
                        Reset Filter
                    </button>
                </div>
            `;
            return;
        }

        // Render Kartu Produk 2-Kolom Persis Seperti Tokopedia
        container.innerHTML = filtered.map(u => `
            <div onclick="App.openUsahaDetail('${u.id}')" class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between active:scale-[0.99] group">
                <div>
                    <!-- Foto Produk Square 1:1 Ala Tokopedia -->
                    <div class="aspect-square bg-slate-100 overflow-hidden relative">
                        <img src="${u.foto}" alt="${u.namaUsaha}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        
                        ${u.diskon ? `
                            <span class="absolute top-2 right-2 text-[9.5px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded shadow-xs">
                                ${u.diskon}
                            </span>
                        ` : ''}

                        <span class="absolute bottom-2 left-2 text-[8.5px] bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded font-medium truncate max-w-[85%]">
                            ${(u.kategori || '').split(',')[0]}
                        </span>
                    </div>

                    <!-- Detail Info Kartu Tokopedia -->
                    <div class="p-2.5 sm:p-3 space-y-1">
                        <!-- Badge Bebas Ongkir Hijau Tokopedia -->
                        <div class="flex items-center gap-1">
                            <span class="text-[9px] font-bold text-[#00AA5B] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1 leading-none">
                                <i class="fa-solid fa-bolt text-[8px]"></i> Bebas Ongkir
                            </span>
                            ${u.cashback ? `
                                <span class="text-[8.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 leading-none">
                                    ${u.cashback}
                                </span>
                            ` : ''}
                        </div>

                        <!-- Judul Nama Produk (Line-clamp 2) -->
                        <h3 class="font-bold text-slate-800 text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-[#00AA5B] transition pt-0.5">
                            ${u.namaUsaha}
                        </h3>

                        <!-- Harga Produk -->
                        <div class="pt-0.5">
                            <div class="text-sm font-extrabold text-slate-900 leading-tight">
                                Rp ${(u.harga || 50000).toLocaleString('id-ID')}
                            </div>
                            ${u.hargaCoret ? `
                                <div class="flex items-center gap-1 text-[10px] text-slate-400">
                                    <span class="line-through">Rp ${u.hargaCoret.toLocaleString('id-ID')}</span>
                                    <span class="text-red-600 font-bold">${u.diskon || ''}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Rating & Penjualan -->
                        <div class="flex items-center gap-1 text-[10.5px] text-slate-500 pt-0.5">
                            <i class="fa-solid fa-star text-amber-400 text-[10px]"></i>
                            <span class="font-bold text-slate-700">${u.rating || 4.9}</span>
                            <span>•</span>
                            <span>${u.terjual || '100+ terjual'}</span>
                        </div>

                        <!-- Toko & Lokasi Ala Tokopedia -->
                        <div class="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-100 flex items-center gap-1">
                            <i class="fa-solid fa-circle-check text-[#00AA5B] text-[10px] shrink-0"></i>
                            <span class="truncate font-medium text-slate-600">Kec. ${u.kecamatan}</span>
                        </div>
                    </div>
                </div>

                <!-- Tombol Pesan Cepat via WA -->
                <div class="p-2 sm:p-2.5 pt-0">
                    <button type="button" onclick="event.stopPropagation(); App.beliLangsungWA('${u.id}')" class="w-full bg-[#00AA5B] hover:bg-[#028e4d] text-white text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 shadow-2xs active:scale-95">
                        <i class="fa-brands fa-whatsapp text-xs"></i>
                        <span>Pesan via WA</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Buka Modal Dialog Detail Usaha Ala Tokopedia Product Detail
     */
    openUsahaDetail: async function(id) {
        const usahaList = await window.KMF_API.getApprovedUsaha();
        const u = usahaList.find(item => String(item.id) === String(id));
        if (!u) return;

        const modal = document.getElementById('modal-detail-usaha');
        if (!modal) return;

        document.getElementById('modal-usaha-foto').src = u.foto || 'assets/img/logo.png';
        document.getElementById('modal-usaha-nama').textContent = u.namaUsaha;
        document.getElementById('modal-usaha-kategori').textContent = u.kategori;
        document.getElementById('modal-usaha-pemilik').textContent = u.pemilik;
        document.getElementById('modal-usaha-deskripsi').textContent = u.deskripsi;
        document.getElementById('modal-usaha-lokasi').textContent = `Desa ${u.desa || '-'}, Kec. ${u.kecamatan}, Kab. Demak`;

        // Tokopedia E-Commerce Attributes
        const hargaEl = document.getElementById('modal-usaha-harga');
        const hargaCoretEl = document.getElementById('modal-usaha-harga-coret');
        const diskonTextEl = document.getElementById('modal-usaha-diskon-text');
        const diskonBadgeEl = document.getElementById('modal-usaha-diskon-badge');
        const ratingEl = document.getElementById('modal-usaha-rating');
        const terjualEl = document.getElementById('modal-usaha-terjual');
        const cashbackEl = document.getElementById('modal-usaha-cashback');

        if (hargaEl) hargaEl.textContent = `Rp ${(u.harga || 50000).toLocaleString('id-ID')}`;
        if (hargaCoretEl) {
            if (u.hargaCoret) {
                hargaCoretEl.textContent = `Rp ${u.hargaCoret.toLocaleString('id-ID')}`;
                hargaCoretEl.classList.remove('hidden');
            } else {
                hargaCoretEl.classList.add('hidden');
            }
        }
        if (diskonTextEl) {
            if (u.diskon) {
                diskonTextEl.textContent = u.diskon;
                diskonTextEl.classList.remove('hidden');
            } else {
                diskonTextEl.classList.add('hidden');
            }
        }
        if (diskonBadgeEl) {
            if (u.diskon) {
                diskonBadgeEl.textContent = u.diskon;
                diskonBadgeEl.classList.remove('hidden');
            } else {
                diskonBadgeEl.classList.add('hidden');
            }
        }
        if (ratingEl) ratingEl.textContent = u.rating || '4.9';
        if (terjualEl) terjualEl.textContent = u.terjual || '150+ terjual';
        if (cashbackEl) cashbackEl.textContent = u.cashback || 'Bebas Ongkir';

        const waBtn = document.getElementById('modal-usaha-wa-btn');
        if (waBtn) {
            const pesan = `Assalamu'alaikum wr. wb., saya ingin membeli produk di KMF Mart (Katalog Tokopedia):\n- Produk: *${u.namaUsaha}*\n- Harga: Rp ${(u.harga || 50000).toLocaleString('id-ID')}\n- Penjual: ${u.pemilik}\n\nApakah stok masih tersedia dan bisa dikirim ke alamat saya? Terima kasih.`;
            waBtn.href = `https://wa.me/${u.waBisnis}?text=${encodeURIComponent(pesan)}`;
        }

        const mapsBtn = document.getElementById('modal-usaha-maps-btn');
        if (mapsBtn) {
            if (u.linkGmaps) {
                mapsBtn.href = u.linkGmaps;
                mapsBtn.classList.remove('hidden');
            } else {
                mapsBtn.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeUsahaDetail: function() {
        const modal = document.getElementById('modal-detail-usaha');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    beliLangsungWA: function(id) {
        const list = (window.KMF_DATA && window.KMF_DATA.usahaList) || [];
        const u = list.find(item => String(item.id) === String(id));
        if (!u) return;

        const pesan = `Assalamu'alaikum wr. wb., saya ingin membeli produk di KMF Mart:\n- Produk: *${u.namaUsaha}*\n- Harga: Rp ${(u.harga || 50000).toLocaleString('id-ID')}\n- Penjual: ${u.pemilik} (Kec. ${u.kecamatan})\n\nMohon info ketersediaan stok & nomor rekening untuk pembayaran. Terima kasih.`;
        window.open(`https://wa.me/${u.waBisnis}?text=${encodeURIComponent(pesan)}`, '_blank');
    },

    filterUsahaCategory: function(cat) {
        this.selectedUsahaCategory = cat;
        this.onlyOfficialUsaha = false;
        this.onlyPromoUsaha = false;

        document.querySelectorAll('.chip-usaha-btn').forEach(btn => {
            const dataCat = btn.getAttribute('data-cat');
            if (dataCat === cat) {
                btn.classList.add('bg-[#00AA5B]', 'text-white', 'font-bold', 'shadow-2xs');
                btn.classList.remove('bg-slate-100', 'text-slate-700');
            } else {
                btn.classList.remove('bg-[#00AA5B]', 'text-white', 'font-bold', 'shadow-2xs');
                btn.classList.add('bg-slate-100', 'text-slate-700');
            }
        });

        const chipOfficial = document.getElementById('chip-usaha-official');
        if (chipOfficial) {
            chipOfficial.classList.remove('bg-[#00AA5B]', 'text-white', 'font-bold');
            chipOfficial.classList.add('bg-slate-100', 'text-slate-700');
        }

        this.renderUsahaList();
    },

    filterUsahaOfficialOnly: function() {
        this.onlyOfficialUsaha = !this.onlyOfficialUsaha;
        const btn = document.getElementById('chip-usaha-official');
        if (btn) {
            if (this.onlyOfficialUsaha) {
                btn.classList.add('bg-[#00AA5B]', 'text-white', 'font-bold');
                btn.classList.remove('bg-slate-100', 'text-slate-700');
            } else {
                btn.classList.remove('bg-[#00AA5B]', 'text-white', 'font-bold');
                btn.classList.add('bg-slate-100', 'text-slate-700');
            }
        }
        this.renderUsahaList();
    },

    filterUsahaPromo: function() {
        this.onlyPromoUsaha = !this.onlyPromoUsaha;
        this.renderUsahaList();
    },

    /**
     * ==========================================
     * MODUL PORTAL IBADAH & YAUMIYYAH SANTRI
     * (Adopsi Presisi Desain Portal Ibadah Asnawiyyah)
     * ==========================================
     */
    currentIbadahFeature: 'tahlil',
    currentTahlilSubTab: 'tahlil',
    currentWiridSubTab: 'wirid',
    currentQuranSurahKey: 'fatihah',
    arabicFontSize: 22,

    renderIbadah: function() {
        // Halaman Portal Ibadah menampilkan 8 kotak menu (4 baris x 2 menu)
        // Isi fitur disimpan di dalam masing-masing menu dan tampil saat diklik.
    },

    openIbadahModal: function(featureKey) {
        this.currentIbadahFeature = featureKey || 'tahlil';
        const modal = document.getElementById('modal-ibadah-fitur');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        this.selectIbadahFeature(this.currentIbadahFeature);
        const modalContainer = document.getElementById('modal-ibadah-body-container');
        if (modalContainer) modalContainer.scrollTop = 0;
    },

    closeIbadahModal: function() {
        const modal = document.getElementById('modal-ibadah-fitur');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        document.querySelectorAll('.ibadah-menu-card').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-kmf-500');
        });
    },

    adjustArabicSize: function(delta) {
        this.arabicFontSize = Math.max(16, Math.min(36, (this.arabicFontSize || 22) + delta));
        this.selectIbadahFeature(this.currentIbadahFeature);
    },

    selectIbadahFeature: function(featureKey) {
        this.currentIbadahFeature = featureKey;

        // Highlight kartu menu yang sedang aktif dibuka
        document.querySelectorAll('.ibadah-menu-card').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-kmf-500');
        });
        const activeBtn = document.getElementById(`btn-ibadah-${featureKey}`);
        if (activeBtn) {
            activeBtn.classList.add('ring-2', 'ring-kmf-500');
        }

        const titleEl = document.getElementById('ibadah-title');
        const tagEl = document.getElementById('ibadah-tag');
        const bodyEl = document.getElementById('ibadah-body');
        const fontControls = document.getElementById('ibadah-font-controls');
        if (!bodyEl) return;

        // Kontrol tombol perbesar/perkecil teks Arab
        if (fontControls) {
            if (['sholat', 'kiblat', 'tutorial'].includes(featureKey)) {
                fontControls.classList.add('hidden');
            } else {
                fontControls.classList.remove('hidden');
            }
        }

        switch (featureKey) {
            case 'tahlil':
                this.renderIbadahTahlil(titleEl, tagEl, bodyEl);
                break;
            case 'wirid':
                this.renderIbadahWirid(titleEl, tagEl, bodyEl);
                break;
            case 'sholat':
                this.renderIbadahSholat(titleEl, tagEl, bodyEl);
                break;
            case 'kiblat':
                this.renderIbadahKiblat(titleEl, tagEl, bodyEl);
                break;
            case 'quran':
                this.renderIbadahQuran(titleEl, tagEl, bodyEl);
                break;
            case 'maulid':
                this.renderIbadahMaulid(titleEl, tagEl, bodyEl);
                break;
            case 'doa':
                this.renderIbadahDoa(titleEl, tagEl, bodyEl);
                break;
            case 'tutorial':
                this.renderIbadahTutorial(titleEl, tagEl, bodyEl);
                break;
            default:
                this.renderIbadahTahlil(titleEl, tagEl, bodyEl);
                break;
        }
    },

    // 1. TAHLIL & YASIN MASYAYIKH KAJEN
    renderIbadahTahlil: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-hands-holding text-kmf-600 mr-2"></i> Tahlil & Yasin Masyayikh Kajen`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Lengkap + Doa";
        }

        const subTab = this.currentTahlilSubTab || 'tahlil';
        const data = window.dataAmalan || window.KMF_AMALAN || {};

        let contentHtml = '';
        if (subTab === 'tahlil') {
            const list = data.tahlil || [];
            contentHtml = `
                <div class="space-y-4">
                    ${list.map((item, idx) => `
                        <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-kmf-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">#${item.no || idx + 1}</span>
                                <span class="font-semibold text-slate-700 text-[11px]">${item.title}</span>
                            </div>
                            <div class="font-arabic text-slate-900 leading-loose text-right" style="font-size: ${this.arabicFontSize}px;">
                                ${item.arabic}
                            </div>
                            ${item.latin ? `<div class="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-2">${item.latin}</div>` : ''}
                            ${item.translation ? `<div class="text-xs text-slate-600 leading-relaxed font-sans">${item.translation}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (subTab === 'yasin') {
            contentHtml = `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">Surat Yasin (يس) - 83 Ayat</h4>
                            <p class="text-[11px] text-slate-500">Qalbul Qur'an • Makkiyyah</p>
                        </div>
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Surat ke-36</span>
                    </div>
                    <div class="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                        <div class="font-arabic text-slate-900 leading-loose" style="font-size: ${this.arabicFontSize + 2}px;">
                            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ. يسٓ ۚ وَالْقُرْاٰنِ الْحَكِيْمِ ۙ إِنَّكَ لَمِنَ الْمُرْسَلِيْنَ ۙ عَلَىٰ صِرَاطٍ مُّسْتَقِيْمٍ ۗ
                        </div>
                        <p class="text-xs text-slate-500 italic">"Yā Sīn. Demi Al-Qur'an yang penuh hikmah. Sungguh, engkau (Muhammad) adalah salah seorang dari rasul-rasul."</p>
                    </div>
                    <div class="p-3 bg-blue-50/80 text-blue-900 rounded-xl border border-blue-200/70 text-xs leading-relaxed space-y-1">
                        <strong>Fadhilah Surat Yasin bagi Jama'ah:</strong>
                        <p class="text-[11px] text-blue-800">
                            Rasulullah ﷺ bersabda bahwa Surat Yasin adalah jantung Al-Qur'an. Tradisi santri Kajen membacanya setiap malam Jum'at dan pada majelis tahlil untuk wasilah kemudahan hajat dan keselamatan arwah ahli kubur.
                        </p>
                    </div>
                </div>
            `;
        } else if (subTab === 'doa') {
            const doaItem = (data.tahlil || []).find(i => i.no === 7) || (data.tahlil || [])[data.tahlil?.length - 1];
            contentHtml = `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h4 class="font-bold text-slate-800 text-sm">Doa Tahlil & Arwah Khusus Masyayikh Kajen</h4>
                        <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Doa Penutup</span>
                    </div>
                    <div class="font-arabic text-slate-900 leading-loose text-right" style="font-size: ${this.arabicFontSize}px;">
                        ${doaItem ? doaItem.arabic : 'اَللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ...'}
                    </div>
                    <div class="text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-200/60 pt-2">
                        ${doaItem ? doaItem.translation : 'Ya Allah, sampaikanlah pahala bacaan kami kepada Masyayikh Kajen dan kaum muslimin...'}
                    </div>
                </div>
            `;
        }

        bodyEl.innerHTML = `
            <div class="space-y-3">
                <!-- Sub Tabs Tahlil -->
                <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button onclick="App.currentTahlilSubTab='tahlil'; App.selectIbadahFeature('tahlil')" 
                        class="flex-1 py-1.5 rounded-lg transition text-center ${subTab === 'tahlil' ? 'bg-white text-kmf-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                        Hadhrah & Tahlil
                    </button>
                    <button onclick="App.currentTahlilSubTab='yasin'; App.selectIbadahFeature('tahlil')" 
                        class="flex-1 py-1.5 rounded-lg transition text-center ${subTab === 'yasin' ? 'bg-white text-kmf-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                        Surat Yasin
                    </button>
                    <button onclick="App.currentTahlilSubTab='doa'; App.selectIbadahFeature('tahlil')" 
                        class="flex-1 py-1.5 rounded-lg transition text-center ${subTab === 'doa' ? 'bg-white text-kmf-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                        Doa Arwah
                    </button>
                </div>
                ${contentHtml}
            </div>
        `;
    },

    // 2. WIRID & DZIKIR MACTUBAH / ISTIGHOTSAH
    renderIbadahWirid: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-hands-praying text-indigo-600 mr-2"></i> Wirid Ba'da Shalat & Istighotsah`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Tradisi Mathole'";
        }

        const subTab = this.currentWiridSubTab || 'wirid';
        const data = window.dataAmalan || window.KMF_AMALAN || {};
        const list = subTab === 'wirid' ? (data.wirid || []) : (data.istighotsah || []);

        bodyEl.innerHTML = `
            <div class="space-y-3">
                <!-- Sub Tabs Wirid -->
                <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button onclick="App.currentWiridSubTab='wirid'; App.selectIbadahFeature('wirid')" 
                        class="flex-1 py-1.5 rounded-lg transition text-center ${subTab === 'wirid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                        Wirid Ba'da Shalat
                    </button>
                    <button onclick="App.currentWiridSubTab='istighotsah'; App.selectIbadahFeature('wirid')" 
                        class="flex-1 py-1.5 rounded-lg transition text-center ${subTab === 'istighotsah' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                        Istighotsah Salaf
                    </button>
                </div>
                <div class="space-y-3.5">
                    ${list.map((item, idx) => `
                        <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">#${item.no || idx + 1}</span>
                                <span class="font-semibold text-slate-700 text-[11px]">${item.nama || item.title || ''}</span>
                            </div>
                            <div class="font-arabic text-slate-900 leading-loose text-right" style="font-size: ${this.arabicFontSize}px;">
                                ${item.arabic || item.arab}
                            </div>
                            ${item.latin ? `<div class="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1.5">${item.latin}</div>` : ''}
                            ${item.translation || item.arti ? `<div class="text-xs text-slate-600 leading-relaxed font-sans">${item.translation || item.arti}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 3. JADWAL SHOLAT & IMSAKIYAH DEMAK
    renderIbadahSholat: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-clock text-amber-600 mr-2"></i> Jadwal Sholat Demak`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Falakiyah NU";
        }

        const prayer = window.KMF_PRAYER ? window.KMF_PRAYER.getTodaySchedule() : null;
        const times = prayer ? prayer.times : {
            Imsak: "04:02", Subuh: "04:12", Terbit: "05:27", Dhuha: "05:51",
            Dzuhur: "11:24", Ashar: "14:41", Maghrib: "17:34", Isya: "18:45"
        };
        const dateStr = prayer ? `${prayer.dateMasehi} • ${prayer.dateHijri}` : "Kabupaten Demak, Jawa Tengah";

        const prayerList = [
            { name: "Imsak", time: times.Imsak, icon: "fa-solid fa-cloud-moon" },
            { name: "Subuh", time: times.Subuh, icon: "fa-solid fa-sun", active: true },
            { name: "Terbit", time: times.Terbit, icon: "fa-regular fa-sun" },
            { name: "Dhuha", time: times.Dhuha, icon: "fa-solid fa-certificate" },
            { name: "Dzuhur", time: times.Dzuhur, icon: "fa-solid fa-sun" },
            { name: "Ashar", time: times.Ashar, icon: "fa-regular fa-clock" },
            { name: "Maghrib", time: times.Maghrib, icon: "fa-solid fa-moon" },
            { name: "Isya", time: times.Isya, icon: "fa-solid fa-star-and-crescent" }
        ];

        bodyEl.innerHTML = `
            <div class="space-y-3.5">
                <div class="p-3 bg-gradient-to-r from-blue-900 to-kmf-800 text-white rounded-2xl flex items-center justify-between">
                    <div>
                        <span class="text-[9.5px] uppercase font-bold text-amber-300 tracking-wider">Hisab Falakiyah Demak</span>
                        <h4 class="font-bold text-sm text-white">${dateStr}</h4>
                    </div>
                    <span class="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold backdrop-blur-xs">WIB (GMT+7)</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    ${prayerList.map(p => `
                        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i class="${p.icon} text-amber-600 text-xs"></i>
                                <span class="text-xs font-semibold text-slate-700">${p.name}</span>
                            </div>
                            <span class="text-xs font-extrabold text-slate-900">${p.time}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="pt-1">
                    <button type="button" onclick="KMF_PRAYER.openJadwalSholatModal()" 
                        class="w-full bg-kmf-600 hover:bg-kmf-700 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-98 flex items-center justify-center gap-1.5 shadow-xs">
                        <i class="fa-solid fa-calendar-days text-sm"></i> Buka Jadwal Lengkap & Imsakiyah Bulanan
                    </button>
                </div>
            </div>
        `;
    },

    // 4. KOMPAS ARAH KIBLAT FALAKIYAH
    renderIbadahKiblat: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-compass text-teal-600 mr-2"></i> Kompas Presisi Arah Kiblat`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "294.4° W-NW";
        }

        bodyEl.innerHTML = `
            <div class="space-y-4 text-center">
                <!-- Kompas Visual Dial -->
                <div class="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
                    <div class="absolute inset-0 rounded-full border-4 border-slate-200 bg-gradient-to-br from-slate-50 to-teal-50 shadow-inner flex items-center justify-center">
                        <!-- Label Arah Mata Angin -->
                        <span class="absolute top-1 text-[11px] font-black text-rose-600">U</span>
                        <span class="absolute right-2 text-[11px] font-bold text-slate-400">T</span>
                        <span class="absolute bottom-1 text-[11px] font-bold text-slate-400">S</span>
                        <span class="absolute left-2 text-[11px] font-bold text-slate-400">B</span>

                        <!-- Jarum Kompas Menunjuk 294.4 Derajat -->
                        <div class="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none" style="transform: rotate(294.4deg);">
                            <div class="w-1.5 h-20 bg-teal-600 rounded-t-full shadow-md relative">
                                <div class="absolute -top-3 -left-2.5 text-base text-amber-500">
                                    <i class="fa-solid fa-kaaba"></i>
                                </div>
                            </div>
                            <div class="w-1.5 h-20 bg-slate-300 rounded-b-full"></div>
                        </div>

                        <!-- Pusat Kompas -->
                        <div class="w-8 h-8 rounded-full bg-white border-2 border-teal-600 shadow-md flex items-center justify-center z-10">
                            <div class="w-2.5 h-2.5 rounded-full bg-teal-700"></div>
                        </div>
                    </div>
                </div>

                <!-- Detail Koordinat & Azimut -->
                <div class="grid grid-cols-2 gap-2 text-left">
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Azimut Kiblat Demak</span>
                        <div class="text-sm font-extrabold text-teal-700">294° 26' 18"</div>
                        <span class="text-[10px] text-slate-500">Serong Barat - Barat Laut</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jarak ke Ka'bah</span>
                        <div class="text-sm font-extrabold text-slate-800">± 8.420 km</div>
                        <span class="text-[10px] text-slate-500">Makkah Al-Mukarramah</span>
                    </div>
                </div>

                <div class="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-left text-xs text-teal-900 leading-relaxed flex items-start gap-2">
                    <i class="fa-solid fa-circle-info text-teal-600 mt-0.5 shrink-0"></i>
                    <div>
                        <strong>Petunjuk Penggunaan:</strong> Letakkan smartphone pada permukaan datar sejajar tanah. Arahkan badan menghadap jarum hijau berlambang Ka'bah untuk mendirikan sholat.
                    </div>
                </div>
            </div>
        `;
    },

    // 5. AL-QUR'AN DIGITAL SANTRI
    renderIbadahQuran: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-book-quran text-emerald-600 mr-2"></i> Al-Qur'an Digital Santri`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Surah Pilihan";
        }

        const surahKey = this.currentQuranSurahKey || 'fatihah';

        const surahList = [
            { key: 'fatihah', no: 1, name: 'Al-Fatihah', arab: 'الفاتحة', ayat: '7 Ayat', arti: 'Pembuka' },
            { key: 'yasin', no: 36, name: 'Yā Sīn', arab: 'يس', ayat: '83 Ayat', arti: 'Jantung Al-Qur\'an' },
            { key: 'rahman', no: 55, name: 'Ar-Rahman', arab: 'الرحمن', ayat: '78 Ayat', arti: 'Maha Pemurah' },
            { key: 'waqiah', no: 56, name: 'Al-Waqi\'ah', arab: 'الواقعة', ayat: '96 Ayat', arti: 'Hari Kiamat' },
            { key: 'mulk', no: 67, name: 'Al-Mulk', arab: 'الملك', ayat: '30 Ayat', arti: 'Kerajaan' },
            { key: 'kahfi', no: 18, name: 'Al-Kahf', arab: 'الكهف', ayat: 'Ayat 1-10', arti: 'Gua' }
        ];

        let content = '';
        if (surahKey === 'fatihah') {
            content = `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div class="text-center border-b border-slate-200 pb-2">
                        <h4 class="font-bold text-slate-800 text-sm">Surat Al-Fatihah (الفاتحة)</h4>
                        <p class="text-[11px] text-slate-500">7 Ayat • Makkiyyah • Ummul Qur'an</p>
                    </div>
                    <div class="font-arabic text-slate-900 leading-loose text-right space-y-3" style="font-size: ${this.arabicFontSize}px;">
                        <p>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ﴿١﴾</p>
                        <p>اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ﴿٢﴾</p>
                        <p>الرَّحْمٰنِ الرَّحِيْمِ ﴿٣﴾</p>
                        <p>مٰلِكِ يَوْمِ الدِّيْنِ ﴿٤﴾</p>
                        <p>إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ ﴿٥﴾</p>
                        <p>اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ ﴿٦﴾</p>
                        <p>صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ ەۙ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَ ﴿٧﴾</p>
                    </div>
                </div>
            `;
        } else if (surahKey === 'mulk') {
            content = `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div class="text-center border-b border-slate-200 pb-2">
                        <h4 class="font-bold text-slate-800 text-sm">Surat Al-Mulk (الملك)</h4>
                        <p class="text-[11px] text-slate-500">30 Ayat • Tabarak • Penyelamat Siksa Kubur</p>
                    </div>
                    <div class="font-arabic text-slate-900 leading-loose text-right space-y-3" style="font-size: ${this.arabicFontSize}px;">
                        <p>تَبٰرَكَ الَّذِيْ بِيَدِهِ الْمُلْكُۖ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ ﴿١﴾</p>
                        <p>الَّذِيْ خَلَقَ الْمَوْتَ وَالْحَيٰوةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًاۗ وَهُوَ الْعَزِيْزُ الْغَفُوْرُ ﴿٢﴾</p>
                    </div>
                    <p class="text-xs text-slate-500 italic">"Maha Suci Allah yang di tangan-Nya lah segala kerajaan, dan Dia Maha Kuasa atas segala sesuatu..."</p>
                </div>
            `;
        } else {
            content = `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div class="text-center border-b border-slate-200 pb-2">
                        <h4 class="font-bold text-slate-800 text-sm">Surat Pilihan Santri Kajen</h4>
                        <p class="text-[11px] text-slate-500">Dzikir & Tilawah Harian</p>
                    </div>
                    <div class="font-arabic text-slate-900 leading-loose text-center py-2" style="font-size: ${this.arabicFontSize + 2}px;">
                        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed text-center">
                        Basahilah lisan dengan membiasakan wirid surat-surat pilihan ini setiap ba'da Shubuh dan Maghrib sebagaimana ijazah masyayikh Mathali'ul Falah.
                    </p>
                </div>
            `;
        }

        bodyEl.innerHTML = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    ${surahList.map(s => `
                        <div onclick="App.currentQuranSurahKey='${s.key}'; App.selectIbadahFeature('quran')"
                            class="p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${surahKey === s.key ? 'bg-emerald-50 border-emerald-500 shadow-2xs' : 'bg-white border-slate-200 hover:border-emerald-300'}">
                            <div>
                                <span class="font-bold text-xs text-slate-800 block">${s.no}. ${s.name}</span>
                                <span class="text-[10px] text-slate-400">${s.ayat}</span>
                            </div>
                            <span class="font-arabic text-base font-bold text-emerald-700">${s.arab}</span>
                        </div>
                    `).join('')}
                </div>
                ${content}
            </div>
        `;
    },

    // 6. KITAB MAULID NABI & SHALAWAT
    renderIbadahMaulid: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-kaaba text-purple-600 mr-2"></i> Kitab Maulid Nabi & Qasidah`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Diba' & Burdah";
        }

        bodyEl.innerHTML = `
            <div class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition shadow-2xs space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-slate-800">Maulid Ad-Diba'i</span>
                            <span class="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded">الإمام الديبعي</span>
                        </div>
                        <p class="text-[11px] text-slate-500">Kitab maulid rutin malam Jum'at di Kajen & pondok pesantren.</p>
                    </div>

                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition shadow-2xs space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-slate-800">Qasidah Burdah</span>
                            <span class="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">الإمام البوصيري</span>
                        </div>
                        <p class="text-[11px] text-slate-500">Bait qasidah pujian kepada Rasulullah ﷺ penolak bala & obat hati.</p>
                    </div>

                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition shadow-2xs space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-slate-800">Maulid Simtuddurar</span>
                            <span class="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">الحبيب علي الحبشي</span>
                        </div>
                        <p class="text-[11px] text-slate-500">Untaian mutiara akhlak mulia dan kelahiran Sang Nabi Agung.</p>
                    </div>

                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition shadow-2xs space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-slate-800">Maulid Al-Barzanji</span>
                            <span class="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">الشيخ البرزنجي</span>
                        </div>
                        <p class="text-[11px] text-slate-500">Natsar dan syi'ir sirah nabawiyyah tradisi Nusantara.</p>
                    </div>
                </div>

                <!-- Kutipan Shalawat Utama -->
                <div class="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-center space-y-2">
                    <span class="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Bait Pembuka Maulid Diba'</span>
                    <div class="font-arabic text-slate-900 leading-loose" style="font-size: ${this.arabicFontSize}px;">
                        يَا رَبِّ صَلِّ عَلَى مُحَمَّدْ • يَا رَبِّ صَلِّ عَلَيْهِ وَسَلِّمْ
                    </div>
                    <div class="font-arabic text-slate-900 leading-loose border-t border-purple-200/60 pt-2" style="font-size: ${this.arabicFontSize}px;">
                        مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا • عَلَى حَبِيْبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ
                    </div>
                </div>
            </div>
        `;
    },

    // 7. KUMPULAN DOA PILIHAN SANTRI
    renderIbadahDoa: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-person-praying text-orange-600 mr-2"></i> Kumpulan Doa Pilihan Santri`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Mustajab";
        }

        const doaList = [
            {
                nama: "1. Doa Sapujagat (Kebaikan Dunia & Akhirat)",
                arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
                arti: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka."
            },
            {
                nama: "2. Doa Birrul Walidain (Kedua Orang Tua)",
                arab: "رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا",
                arti: "Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka mendidikku di waktu kecil."
            },
            {
                nama: "3. Doa Tolak Bala (Li Khamsatun Ijazah Para Kyai)",
                arab: "لِيْ خَمْسَةٌ أُطْفِيْ بِهَا • حَرَّ الْوَبَاءِ الْحَاطِمَةْ\nالْمُصْطَفَى وَالْمُرْتَضَى • وَابْنَاهُمَا وَالْفَاطِمَةْ",
                arti: "Bagiku ada lima sosok yang kuharapkan untuk memadamkan panasnya wabah malapetaka: Nabi Al-Musthafa, Sayyidina Ali Al-Murtadha, kedua putranya (Hasan & Husain), dan Sayyidah Fathimah."
            },
            {
                nama: "4. Doa Belajar & Faham Ilmu",
                arab: "رَبِّ زِدْنِيْ عِلْمًا نَافِعًا وَارْزُقْنِيْ فَهْمًا، وَاجْعَلْنِيْ مِنَ الصَّالِحِيْنَ",
                arti: "Ya Allah, tambahkanlah kepadaku ilmu yang bermanfaat, anugerahkanlah kepadaku pemahaman yang benar, dan jadikanlah aku termasuk golongan orang-orang shaleh."
            }
        ];

        bodyEl.innerHTML = `
            <div class="space-y-3">
                ${doaList.map(d => `
                    <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                        <span class="font-bold text-xs text-orange-800 block">${d.nama}</span>
                        <div class="font-arabic text-slate-900 leading-loose text-right" style="font-size: ${this.arabicFontSize}px;">
                            ${d.arab}
                        </div>
                        <p class="text-xs text-slate-600 leading-relaxed italic border-t border-slate-200/60 pt-1.5 font-sans">
                            "${d.arti}"
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // 8. TUTORIAL & PANDUAN IBADAH SANTRI
    renderIbadahTutorial: function(titleEl, tagEl, bodyEl) {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-book-open-reader text-emerald-600 mr-2"></i> Tutorial & Panduan Ibadah Santri`;
        if (tagEl) {
            tagEl.className = "text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase";
            tagEl.innerText = "Fiqh Praktis";
        }

        bodyEl.innerHTML = `
            <div class="space-y-3">
                <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <h4 class="font-bold text-xs text-slate-800">1. Sholat Jamak & Qashar Musafir</h4>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Diperbolehkan bagi musafir dengan jarak perjalanan minimal 2 marhalah (±82 km). Sholat Zhuhur, Ashar, dan Isya dapat diringkas menjadi 2 rakaat (Qashar) serta digabungkan (Jamak Taqdim / Ta'khir).
                    </p>
                    <div class="text-[11px] font-arabic bg-slate-50 p-2 rounded-lg text-slate-700">
                        أُصَلِّي فَرْضَ الظُّهْرِ رَكْعَتَيْنِ قَصْرًا مَجْمُوْعًا إِلَيْهِ الْعَصْرُ جَمْعَ تَقْدِيْمٍ لِلّٰهِ تَعَالَى
                    </div>
                </div>

                <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                        <h4 class="font-bold text-xs text-slate-800">2. Tata Cara Sholat Jenazah (4 Takbir)</h4>
                    </div>
                    <ul class="text-xs text-slate-600 space-y-1 pl-4 list-decimal leading-relaxed">
                        <li><strong>Takbir 1:</strong> Membaca Surat Al-Fatihah.</li>
                        <li><strong>Takbir 2:</strong> Membaca Shalawat Nabi (Shalawat Ibrahimiyyah).</li>
                        <li><strong>Takbir 3:</strong> Membaca doa khusus jenazah (<em>Allâhummaghfir lahu warhamhu...</em>).</li>
                        <li><strong>Takbir 4:</strong> Membaca doa penutup (<em>Allâhumma lâ tahrimnâ ajrahu...</em>) lalu salam ke kanan & kiri.</li>
                    </ul>
                </div>

                <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-sky-600"></span>
                        <h4 class="font-bold text-xs text-slate-800">3. Sujud Sahwi & Sujud Tilawah</h4>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Sujud sahwi dilakukan 2 kali sebelum salam saat lupa rakaat atau meninggalkan sunnah ab'adh. Bacaan: <em>"Subhâna man lâ yanâmu wa lâ yashû"</em> (Maha Suci Dzat yang tidak tidur dan tidak lupa).
                    </p>
                </div>
            </div>
        `;
    },

    // Backward compatibility alias for older calls
    renderAmalan: function() {
        this.renderIbadah();
    },

    switchAmalanTab: function(tabKey) {
        if (['tahlil', 'yasin'].includes(tabKey)) {
            this.currentTahlilSubTab = tabKey;
            this.openIbadahModal('tahlil');
        } else if (['wirid', 'istighotsah'].includes(tabKey)) {
            this.currentWiridSubTab = tabKey;
            this.openIbadahModal('wirid');
        } else {
            this.openIbadahModal(tabKey);
        }
    },

    /**
     * Clear Cache & Refresh PWA
     */
    clearAppCache: async function() {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        }
        alert('Cache aplikasi berhasil dibersihkan! Aplikasi akan memuat ulang.');
        window.location.reload();
    },

    /**
     * Share Web PWA App
     */
    shareApp: function() {
        const shareData = {
            title: "KMF Demak - Aplikasi Alumni Mathali'ul Falah",
            text: "Aplikasi Resmi Keluarga Mathali'ul Falah (KMF) Cabang Demak. Mari terhubung dan pererat ukhuwah sesama santri Kajen di Demak!",
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Tautan aplikasi KMF Demak berhasil disalin ke clipboard!");
        }
    },

    /**
     * Hubungi WhatsApp Center Pengurus KMF Demak
     */
    openKmfWaCenter: function() {
        const waUrl = "https://wa.me/6281234567890?text=" + encodeURIComponent("Assalamu'alaikum Pengurus KMF Cabang Demak, saya alumni Mathali'ul Falah ingin silaturrahim / konsultasi pendataan.");
        window.open(waUrl, '_blank');
    },

    /**
     * ==========================================
     * AUTENTIKASI PENGGUNA & KTA SANTRI DIGITAL
     * ==========================================
     */
    currentUser: null,

    initUserAuth: function() {
        try {
            const saved = localStorage.getItem('kmf_user_session');
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Gagal memuat sesi santri:', e);
            this.currentUser = null;
        }
    },

    renderUserProfileCard: function() {
        const cardContainer = document.getElementById('user-profile-card');
        const btnKta = document.getElementById('btn-menu-kta');
        if (!cardContainer) return;

        if (this.currentUser && this.currentUser.isLoggedIn) {
            const user = this.currentUser;
            // Dapatkan inisial nama
            const nameParts = (user.nama || 'Santri').trim().split(' ');
            let initials = nameParts[0][0];
            if (nameParts.length > 1) {
                initials += nameParts[nameParts.length - 1][0];
            }
            initials = initials.toUpperCase();

            cardContainer.innerHTML = `
                <div class="bg-gradient-to-r from-kmf-900 via-kmf-800 to-blue-950 text-white p-4 sm:p-5 rounded-3xl shadow-sm border border-kmf-600/60 relative overflow-hidden space-y-3.5">
                    <div class="absolute -right-6 -bottom-6 text-white/5 text-8xl pointer-events-none">
                        <i class="fa-solid fa-id-card"></i>
                    </div>
                    <div class="relative z-10 flex items-center gap-3.5">
                        <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xl shrink-0 shadow-md border-2 border-white/30">
                            ${initials}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-[9.5px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                    <i class="fa-solid fa-circle-check text-[9px]"></i> Terdaftar
                                </span>
                                <span class="text-[9.5px] bg-white/15 text-blue-100 font-medium px-2 py-0.5 rounded-full">
                                    Kec. ${user.kecamatan || 'Demak'}
                                </span>
                            </div>
                            <h2 class="text-sm sm:text-base font-bold text-white mt-1 leading-snug truncate">${user.nama}</h2>
                            <p class="text-[11px] text-blue-100/80 truncate">Alumni Mathole' Kajen • Angkatan ${user.tahunLulus || '-'}</p>
                        </div>
                    </div>
                    <div class="relative z-10 pt-1 flex items-center gap-2">
                        <button type="button" onclick="App.openKtaModal()"
                            class="flex-1 py-2 px-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98">
                            <i class="fa-solid fa-id-badge text-amber-300"></i>
                            <span>KTA Digital</span>
                        </button>
                        <button type="button" onclick="App.handleUserLogout()"
                            class="py-2 px-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98" title="Keluar dari Akun">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            `;
            if (btnKta) btnKta.classList.remove('hidden');
        } else {
            cardContainer.innerHTML = `
                <div class="bg-gradient-to-r from-kmf-900 via-kmf-800 to-blue-950 text-white p-4 sm:p-5 rounded-3xl shadow-sm border border-kmf-600/60 relative overflow-hidden space-y-3.5">
                    <div class="absolute -right-6 -bottom-6 text-white/5 text-8xl pointer-events-none">
                        <i class="fa-solid fa-mosque"></i>
                    </div>
                    <div class="relative z-10 flex items-center gap-3.5">
                        <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                            <i class="fa-solid fa-user-circle text-amber-300"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[9.5px] bg-white/15 text-blue-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tamu Santri</span>
                                <span class="text-[9.5px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">PWA Ready</span>
                            </div>
                            <h2 class="text-sm sm:text-base font-bold text-white mt-1 leading-snug truncate">Ahlan wa Sahlan, Sahabat Santri!</h2>
                            <p class="text-[11px] text-blue-100/80 truncate">Masuk atau daftar untuk akses penuh alumni</p>
                        </div>
                    </div>
                    <div class="relative z-10 pt-1 flex items-center gap-2">
                        <button type="button" onclick="App.openAuthModal('login')"
                            class="flex-1 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 active:scale-98">
                            <i class="fa-solid fa-right-to-bracket"></i>
                            <span>Masuk Akun</span>
                        </button>
                        <button type="button" onclick="App.openAuthModal('register')"
                            class="flex-1 py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98">
                            <i class="fa-solid fa-user-plus"></i>
                            <span>Daftar Baru</span>
                        </button>
                    </div>
                </div>
            `;
            if (btnKta) btnKta.classList.add('hidden');
        }
    },

    openAuthModal: function(tab) {
        const modal = document.getElementById('modal-auth-user');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.switchAuthTab(tab || 'login');
        }
    },

    closeAuthModal: function() {
        const modal = document.getElementById('modal-auth-user');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    switchAuthTab: function(tab) {
        const btnLogin = document.getElementById('auth-tab-btn-login');
        const btnRegister = document.getElementById('auth-tab-btn-register');
        const viewLogin = document.getElementById('auth-view-login');
        const viewRegister = document.getElementById('auth-view-register');

        if (tab === 'register') {
            viewLogin?.classList.add('hidden');
            viewRegister?.classList.remove('hidden');
            btnLogin?.classList.remove('border-kmf-600', 'text-kmf-700', 'bg-white');
            btnLogin?.classList.add('border-transparent', 'text-slate-500');
            btnRegister?.classList.add('border-kmf-600', 'text-kmf-700', 'bg-white');
            btnRegister?.classList.remove('border-transparent', 'text-slate-500');
        } else {
            viewRegister?.classList.add('hidden');
            viewLogin?.classList.remove('hidden');
            btnRegister?.classList.remove('border-kmf-600', 'text-kmf-700', 'bg-white');
            btnRegister?.classList.add('border-transparent', 'text-slate-500');
            btnLogin?.classList.add('border-kmf-600', 'text-kmf-700', 'bg-white');
            btnLogin?.classList.remove('border-transparent', 'text-slate-500');
        }
    },

    handleUserLogin: function(e) {
        e.preventDefault();
        const wa = document.getElementById('auth-login-wa').value.trim();
        const pin = document.getElementById('auth-login-pin').value.trim();

        if (!wa) {
            alert('Silakan masukkan nomor WhatsApp Anda.');
            return;
        }

        // Cari di data alumni tersimpan jika ada, atau buat sesi
        let matchedUser = null;
        try {
            const list = window.KMF_API ? window.KMF_API.getAlumniList() : [];
            matchedUser = list.find(a => (a.whatsapp && a.whatsapp.replace(/\D/g, '') === wa.replace(/\D/g, '')) || (a.telepon && a.telepon.replace(/\D/g, '') === wa.replace(/\D/g, '')));
        } catch (err) {}

        const userName = matchedUser ? matchedUser.nama : 'Santri KMF Demak';
        const userTahun = matchedUser ? matchedUser.tahunLulus : '2018';
        const userKec = matchedUser ? matchedUser.kecamatan : 'Demak';

        this.currentUser = {
            id: 'santri-' + Date.now(),
            nama: userName,
            whatsapp: wa,
            tahunLulus: userTahun,
            kecamatan: userKec,
            pin: pin,
            isLoggedIn: true
        };

        localStorage.setItem('kmf_user_session', JSON.stringify(this.currentUser));
        this.closeAuthModal();
        this.renderUserProfileCard();
        alert(`Alhamdulillah, Ahlan wa Sahlan ${userName}! Anda berhasil masuk.`);
    },

    handleUserRegister: function(e) {
        e.preventDefault();
        const nama = document.getElementById('auth-reg-name').value.trim();
        const wa = document.getElementById('auth-reg-wa').value.trim();
        const tahun = document.getElementById('auth-reg-tahun').value.trim();
        const kecamatan = document.getElementById('auth-reg-kecamatan').value;
        const pin = document.getElementById('auth-reg-pin').value.trim();

        if (!nama || !wa) {
            alert('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.');
            return;
        }

        this.currentUser = {
            id: 'santri-' + Date.now(),
            nama: nama,
            whatsapp: wa,
            tahunLulus: tahun || '2020',
            kecamatan: kecamatan || 'Demak',
            pin: pin || '123456',
            isLoggedIn: true
        };

        // Simpan ke sesi lokal
        localStorage.setItem('kmf_user_session', JSON.stringify(this.currentUser));

        // Daftarkan juga ke daftar sensus lokal / approval pending jika API tersedia
        try {
            if (window.KMF_API && window.KMF_API.submitAlumni) {
                window.KMF_API.submitAlumni({
                    nama: nama,
                    whatsapp: wa,
                    tahunLulus: tahun,
                    kecamatan: kecamatan,
                    profesi: 'Alumni Santri',
                    alamat: `Kec. ${kecamatan}, Demak`
                });
            }
        } catch (err) {}

        this.closeAuthModal();
        this.renderUserProfileCard();
        alert(`Pendaftaran Berhasil! Selamat datang Sahabat ${nama} di Keluarga Mathali'ul Falah Cabang Demak.`);
    },

    handleUserLogout: function() {
        if (confirm('Apakah Anda yakin ingin keluar dari akun santri ini?')) {
            this.currentUser = null;
            localStorage.removeItem('kmf_user_session');
            this.renderUserProfileCard();
        }
    },

    openKtaModal: function() {
        const modal = document.getElementById('modal-kta-santri');
        if (!modal) return;

        const user = this.currentUser || {
            nama: 'Alumni Santri Kajen',
            whatsapp: '08123456789',
            tahunLulus: '2015',
            kecamatan: 'Demak'
        };

        const nameParts = (user.nama || 'Santri').trim().split(' ');
        let initials = nameParts[0][0];
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1][0];
        }
        initials = initials.toUpperCase();

        const avatarEl = document.getElementById('kta-avatar');
        const namaEl = document.getElementById('kta-nama');
        const idEl = document.getElementById('kta-id');
        const detailEl = document.getElementById('kta-detail');

        if (avatarEl) avatarEl.innerText = initials;
        if (namaEl) namaEl.innerText = user.nama || 'Santri KMF Demak';
        const lastDigits = user.whatsapp ? user.whatsapp.slice(-4) : '1912';
        if (idEl) idEl.innerText = `ID: KMF-DMK-${user.tahunLulus || '2020'}-${lastDigits}`;
        
        const angkatanEl = document.getElementById('kta-angkatan');
        const kecEl = document.getElementById('kta-kecamatan');
        if (angkatanEl) angkatanEl.innerText = `Alumni Kajen '` + (user.tahunLulus ? String(user.tahunLulus).slice(-2) : '15');
        if (kecEl) kecEl.innerText = `Kec. ` + (user.kecamatan || 'Demak');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeKtaModal: function() {
        const modal = document.getElementById('modal-kta-santri');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    shareKta: function() {
        const user = this.currentUser || { nama: 'Santri KMF Demak' };
        const text = `Kartu Tanda Anggota (e-KTA) Digital KMF Demak milik ${user.nama}. Keluarga Mathali'ul Falah (KMF) Cabang Demak.`;
        if (navigator.share) {
            navigator.share({
                title: 'e-KTA Virtual KMF Demak',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text + "\nBuka di: " + window.location.href);
            alert("Informasi e-KTA Virtual berhasil disalin ke clipboard!");
        }
    },

    /**
     * Buka Modal Mutiara Fiqh Sosial
     */
    openMutiaraModal: function() {
        const modal = document.getElementById('modal-mutiara-kalam');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    closeMutiaraModal: function() {
        const modal = document.getElementById('modal-mutiara-kalam');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Modal Agenda Kegiatan KMF Demak
     */
    openAgendaModal: function() {
        const modal = document.getElementById('modal-agenda-kegiatan');
        if (!modal) return;

        const container = document.getElementById('modal-agenda-container');
        if (container && window.KMF_DATA && window.KMF_DATA.agendaList) {
            container.innerHTML = window.KMF_DATA.agendaList.map(item => `
                <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-kmf-500 transition space-y-2">
                    <div class="flex items-start justify-between gap-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70">
                            ${item.kategori}
                        </span>
                        <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                            <i class="fa-regular fa-clock text-kmf-600"></i> ${item.tanggal}
                        </span>
                    </div>
                    <h4 class="font-bold text-slate-800 text-sm sm:text-base leading-snug">${item.title}</h4>
                    <p class="text-xs text-slate-600 leading-relaxed">${item.deskripsi}</p>
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
                        <div class="flex items-center gap-1.5 text-[11.5px] font-medium min-w-0">
                            <i class="fa-solid fa-location-dot text-rose-500 shrink-0"></i>
                            <span class="truncate">${item.tempat}</span>
                        </div>
                        <a href="https://wa.me/?text=${encodeURIComponent('Undangan Kegiatan KMF Demak: *' + item.title + '* pada ' + item.tanggal + ' di ' + item.tempat)}" target="_blank" class="shrink-0 text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 active:scale-95 transition">
                            <i class="fa-brands fa-whatsapp text-sm"></i> Bagikan
                        </a>
                    </div>
                </div>
            `).join('');
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeAgendaModal: function() {
        const modal = document.getElementById('modal-agenda-kegiatan');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    scrollToAgenda: function() {
        this.openAgendaModal();
    },

    /**
     * ==========================================
     * FITUR FILANTROPI, ZISWAF & DONASI SANTRI
     * ==========================================
     */
    currentDonasiProgram: 'wakaf',
    currentDonasiNominal: 50000,
    currentPaymentMethod: 'qris',
    calculatedZakatNominal: 0,

    openDonasiModal: function(programKey = 'wakaf') {
        const modal = document.getElementById('modal-donasi-filantropi');
        if (!modal) return;
        this.selectDonasiProgram(programKey);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeDonasiModal: function() {
        const modal = document.getElementById('modal-donasi-filantropi');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    selectDonasiProgram: function(key) {
        this.currentDonasiProgram = key;
        const data = (window.KMF_DATA && window.KMF_DATA.filantropiPrograms) ? window.KMF_DATA.filantropiPrograms[key] : null;
        if (!data) return;

        // Update styling active tabs
        document.querySelectorAll('.tab-donasi-btn').forEach(btn => {
            btn.classList.remove('bg-white', 'text-slate-900', 'shadow-xs', 'border', 'border-slate-200');
            btn.classList.add('text-slate-500');
        });
        const activeBtn = document.getElementById(`tab-program-${key}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-500');
            activeBtn.classList.add('bg-white', 'text-slate-900', 'shadow-xs', 'border', 'border-slate-200');
        }

        // Update Banner Informasi
        const badge = document.getElementById('donasi-program-badge');
        const title = document.getElementById('donasi-program-title');
        const deskripsi = document.getElementById('donasi-program-deskripsi');
        const extLink = document.getElementById('donasi-external-link');
        const minNominal = document.getElementById('donasi-min-nominal');

        if (badge) badge.textContent = data.nama.toUpperCase();
        if (title) title.textContent = data.nama;
        if (deskripsi) deskripsi.textContent = data.deskripsi;
        if (minNominal) minNominal.textContent = 'Rp ' + (data.minimalDonasi || 10000).toLocaleString('id-ID');

        if (extLink) {
            if (data.linkWeb) {
                extLink.href = data.linkWeb;
                extLink.classList.remove('hidden');
            } else {
                extLink.classList.add('hidden');
            }
        }

        // Tampilkan kalkulator zakat hanya jika program zakat dipilih
        const calcBox = document.getElementById('donasi-kalkulator-zakat-box');
        if (calcBox) {
            if (key === 'zakat') {
                calcBox.classList.remove('hidden');
                this.hitungZakatOtomatis();
            } else {
                calcBox.classList.add('hidden');
            }
        }

        // Render Daftar Rekening Bank
        const rekContainer = document.getElementById('donasi-rekening-list');
        if (rekContainer && data.rekening) {
            rekContainer.innerHTML = data.rekening.map(r => `
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                    <div class="space-y-0.5 min-w-0">
                        <div class="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">${r.bank}</div>
                        <div class="font-mono text-sm font-bold text-slate-900 select-all">${r.noRek}</div>
                        <div class="text-[10px] text-slate-500 truncate">a.n. ${r.atasNama}</div>
                    </div>
                    <button type="button" onclick="App.copyRekening('${r.noRek}', this)" class="shrink-0 text-[10.5px] font-bold text-kmf-700 bg-white hover:bg-kmf-50 border border-slate-200 px-3 py-1.5 rounded-xl transition active:scale-95 flex items-center gap-1">
                        <i class="fa-regular fa-copy"></i>
                        <span>Salin</span>
                    </button>
                </div>
            `).join('');
        }

        // Set default nominal jika belum ada
        const inputNominal = document.getElementById('input-donasi-nominal');
        if (inputNominal && (!inputNominal.value || inputNominal.value === '0')) {
            this.setDonasiNominal(data.minimalDonasi || 50000);
        }
    },

    hitungZakatOtomatis: function() {
        const inputVal = parseFloat(document.getElementById('calc-zakat-input')?.value || 0);
        const periode = document.getElementById('calc-zakat-periode')?.value || 'bulan';
        const hasilEl = document.getElementById('calc-zakat-hasil');
        const btnTerapkan = document.getElementById('calc-btn-terapkan');

        // Nisab: Bulan = Rp 7.083.333, Tahun = Rp 85.000.000
        const nisab = periode === 'bulan' ? 7083333 : 85000000;

        if (inputVal <= 0) {
            if (hasilEl) hasilEl.innerHTML = 'Rp 0';
            this.calculatedZakatNominal = 0;
            return;
        }

        if (inputVal >= nisab) {
            const zakat = Math.round(inputVal * 0.025);
            this.calculatedZakatNominal = zakat;
            if (hasilEl) {
                hasilEl.innerHTML = `<span class="text-teal-700 font-extrabold text-sm">Rp ${zakat.toLocaleString('id-ID')}</span> <span class="text-[10px] text-emerald-600 font-semibold block">(Wajib Zakat 2.5% • Mencapai Nisab)</span>`;
            }
            if (btnTerapkan) btnTerapkan.disabled = false;
        } else {
            const infaqSunnah = Math.round(inputVal * 0.025);
            this.calculatedZakatNominal = infaqSunnah;
            if (hasilEl) {
                hasilEl.innerHTML = `<span class="text-slate-600 font-bold text-xs">Rp ${infaqSunnah.toLocaleString('id-ID')}</span> <span class="text-[10px] text-amber-700 font-normal block">(Belum mencapai nisab Rp ${nisab.toLocaleString('id-ID')}, dianjurkan infaq/sedekah sukarela)</span>`;
            }
        }
    },

    terapkanZakatKeNominal: function() {
        if (this.calculatedZakatNominal > 0) {
            this.setDonasiNominal(this.calculatedZakatNominal);
        } else {
            alert('Silakan masukkan total tabungan atau penghasilan terlebih dahulu.');
        }
    },

    setDonasiNominal: function(amount) {
        this.currentDonasiNominal = amount;
        const input = document.getElementById('input-donasi-nominal');
        if (input) input.value = amount;

        // Highlight chip
        document.querySelectorAll('.chip-nominal').forEach(chip => {
            const val = parseInt(chip.textContent.replace(/[^0-9]/g, ''));
            if (val === amount) {
                chip.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
                chip.classList.remove('bg-slate-50', 'text-slate-800');
            } else {
                chip.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600');
                chip.classList.add('bg-slate-50');
            }
        });
    },

    toggleHambaAllah: function(checkbox) {
        const inputNama = document.getElementById('input-donasi-nama');
        if (!inputNama) return;
        if (checkbox.checked) {
            inputNama.value = 'Hamba Allah';
            inputNama.readOnly = true;
            inputNama.classList.add('bg-slate-200/60');
        } else {
            inputNama.value = '';
            inputNama.readOnly = false;
            inputNama.classList.remove('bg-slate-200/60');
            inputNama.focus();
        }
    },

    togglePaymentMethod: function(method) {
        this.currentPaymentMethod = method;
        const viewQris = document.getElementById('payment-view-qris');
        const viewBank = document.getElementById('payment-view-bank');
        const btnQris = document.getElementById('btn-pay-qris');
        const btnBank = document.getElementById('btn-pay-bank');

        if (method === 'qris') {
            viewQris?.classList.remove('hidden');
            viewBank?.classList.add('hidden');
            btnQris?.classList.add('bg-white', 'shadow-2xs', 'text-kmf-700');
            btnQris?.classList.remove('text-slate-500');
            btnBank?.classList.remove('bg-white', 'shadow-2xs', 'text-kmf-700');
            btnBank?.classList.add('text-slate-500');
        } else {
            viewQris?.classList.add('hidden');
            viewBank?.classList.remove('hidden');
            btnBank?.classList.add('bg-white', 'shadow-2xs', 'text-kmf-700');
            btnBank?.classList.remove('text-slate-500');
            btnQris?.classList.remove('bg-white', 'shadow-2xs', 'text-kmf-700');
            btnQris?.classList.add('text-slate-500');
        }
    },

    copyRekening: function(text, btnEl) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHtml = btnEl.innerHTML;
            btnEl.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> Tersalin!';
            btnEl.classList.add('bg-emerald-50', 'text-emerald-700');
            setTimeout(() => {
                btnEl.innerHTML = originalHtml;
                btnEl.classList.remove('bg-emerald-50', 'text-emerald-700');
            }, 2000);
        }).catch(() => {
            prompt('Salin nomor rekening berikut:', text);
        });
    },

    downloadQris: function() {
        const svg = document.querySelector('#payment-view-qris svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `QRIS-KMF-DEMAK-${this.currentDonasiProgram.toUpperCase()}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    },

    kirimKonfirmasiDonasiWA: function() {
        const nominal = parseInt(document.getElementById('input-donasi-nominal')?.value || 0);
        const nama = (document.getElementById('input-donasi-nama')?.value || '').trim() || 'Hamba Allah';
        const doa = (document.getElementById('input-donasi-doa')?.value || '').trim();
        const dataProgram = (window.KMF_DATA && window.KMF_DATA.filantropiPrograms) ? window.KMF_DATA.filantropiPrograms[this.currentDonasiProgram] : null;
        const programNama = dataProgram ? dataProgram.nama : this.currentDonasiProgram;

        if (!nominal || nominal < 1000) {
            alert('Silakan masukkan nominal donasi yang valid.');
            document.getElementById('input-donasi-nominal')?.focus();
            return;
        }

        let pesan = `Assalamu'alaikum wr. wb. Pengurus KMF Demak,\n`;
        pesan += `Saya ingin konfirmasi penyaluran dana kemaslahatan:\n\n`;
        pesan += `*Program:* ${programNama}\n`;
        pesan += `*Nominal:* Rp ${nominal.toLocaleString('id-ID')}\n`;
        pesan += `*Nama Donatur:* ${nama}\n`;
        pesan += `*Metode:* ${this.currentPaymentMethod === 'qris' ? 'QRIS Statis KMF' : 'Transfer Rekening Bank'}\n`;
        if (doa) {
            pesan += `*Doa/Hajat:* "${doa}"\n`;
        }
        pesan += `\nMohon konfirmasi penerimaan dan doanya agar berkah untuk kemaslahatan santri Mathali'ul Falah. Syukron katsir.`;

        const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(pesan)}`;
        window.open(waUrl, '_blank');
    },

    /**
     * ==========================================
     * FITUR KABAR DUKA / LELAYU SANTRI
     * ==========================================
     */
    openKabarDukaModal: function() {
        const modal = document.getElementById('modal-kabar-duka');
        const container = document.getElementById('kabar-duka-container');
        if (!modal) return;

        const list = (window.KMF_DATA && window.KMF_DATA.kabarDukaList) || [];
        if (container) {
            container.innerHTML = list.map(item => `
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2.5 shadow-2xs">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                Berita Duka Cita
                            </span>
                            <h4 class="font-bold text-sm text-slate-900 mt-1">${item.namaAlmarhum || item.namaAlmarhumah}</h4>
                            <p class="text-[11px] text-slate-500 font-medium">${item.infoAlumni}</p>
                        </div>
                    </div>

                    <div class="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div><i class="fa-regular fa-clock text-rose-500 w-4"></i> Wafat: <strong>${item.wafat}</strong></div>
                        <div><i class="fa-solid fa-location-dot text-kmf-600 w-4"></i> Rumah Duka: <span>${item.alamatDuka}</span></div>
                        <div><i class="fa-solid fa-circle-info text-amber-600 w-4"></i> Keterangan: <span>${item.status}</span></div>
                    </div>

                    <div class="pt-1 flex items-center justify-between">
                        <span class="text-[10.5px] text-slate-500 font-medium flex items-center gap-1" id="doa-count-${item.id}">
                            <i class="fa-solid fa-hands-praying text-emerald-600"></i>
                            <span>${item.doaCounter} doa terkirim</span>
                        </span>
                        <button type="button" onclick="App.kirimDoaLelayu(${item.id}, this)" class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow-2xs">
                            <i class="fa-solid fa-heart text-rose-500"></i>
                            <span>Kirim Doa Tahlil</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeKabarDukaModal: function() {
        const modal = document.getElementById('modal-kabar-duka');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    kirimDoaLelayu: function(id, btnEl) {
        const list = (window.KMF_DATA && window.KMF_DATA.kabarDukaList) || [];
        const item = list.find(l => l.id === id);
        if (item) {
            item.doaCounter += 1;
            const countEl = document.getElementById(`doa-count-${id}`);
            if (countEl) {
                countEl.innerHTML = `<i class="fa-solid fa-hands-praying text-emerald-600"></i> <span>${item.doaCounter} doa terkirim</span>`;
            }
        }
        btnEl.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> Doa Terkirim!';
        btnEl.classList.add('bg-emerald-600', 'text-white');
        btnEl.disabled = true;
    },

    /**
     * Kompresi dan Preview Foto Profil
     */
    handleProfilePhotoSelect: async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const infoEl = document.getElementById('foto-profil-info');
        if (infoEl) infoEl.textContent = 'Mengompres foto profil...';

        try {
            const compressed = await window.KMF_COMPRESSOR.compressImage(file, {
                maxWidth: 600,
                maxHeight: 600,
                quality: 0.75
            });

            document.getElementById('foto-profil-base64').value = compressed.dataUrl;

            const preview = document.getElementById('preview-foto-profil-container');
            if (preview) {
                preview.innerHTML = `<img src="${compressed.dataUrl}" class="w-full h-full object-cover">`;
            }

            if (infoEl) {
                infoEl.textContent = `Foto siap: ${(compressed.newSize / 1024).toFixed(1)} KB (diperkecil ${(compressed.ratio * 100).toFixed(0)}%)`;
                infoEl.classList.add('text-emerald-600');
            }
        } catch (err) {
            console.error('Kompresi gagal:', err);
            if (infoEl) infoEl.textContent = 'Gagal memproses gambar: ' + err.message;
        }
    },

    /**
     * Kompresi dan Preview Foto Usaha
     */
    handleUsahaPhotoSelect: async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const infoEl = document.getElementById('foto-usaha-info');
        if (infoEl) infoEl.textContent = 'Mengompres foto usaha...';

        try {
            const compressed = await window.KMF_COMPRESSOR.compressImage(file, {
                maxWidth: 800,
                maxHeight: 600,
                quality: 0.75
            });

            document.getElementById('foto-usaha-base64').value = compressed.dataUrl;

            const preview = document.getElementById('preview-foto-usaha-container');
            if (preview) {
                preview.innerHTML = `<img src="${compressed.dataUrl}" class="w-full h-full object-cover">`;
            }

            if (infoEl) {
                infoEl.textContent = `Foto usaha siap: ${(compressed.newSize / 1024).toFixed(1)} KB`;
                infoEl.classList.add('text-emerald-600');
            }
        } catch (err) {
            console.error('Kompresi gagal:', err);
            if (infoEl) infoEl.textContent = 'Gagal memproses gambar usaha: ' + err.message;
        }
    },

    toggleUsahaFields: function(checked) {
        const container = document.getElementById('subform-usaha-container');
        if (container) {
            if (checked) {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        }
    },

    openUsahaRegisterModal: function() {
        this.navigateTo('register');
        const check = document.getElementById('check-has-usaha');
        if (check) {
            check.checked = true;
            this.toggleUsahaFields(true);
            setTimeout(() => {
                check.scrollIntoView({ behavior: 'smooth' });
            }, 200);
        }
    },

    /**
     * Submit Formulir Sensus Alumni
     */
    handleFormSubmit: async function(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-submit-sensus');
        const origBtnText = btn ? btn.innerHTML : '';

        // Validasi Foto Profil Wajib
        const fotoBase64 = document.getElementById('foto-profil-base64').value;
        if (!fotoBase64) {
            alert('Mohon pilih foto profil diri terlebih dahulu.');
            return;
        }

        const hasUsaha = document.getElementById('check-has-usaha')?.checked || false;
        let fotoUsahaBase64 = '';
        if (hasUsaha) {
            fotoUsahaBase64 = document.getElementById('foto-usaha-base64').value;
            if (!fotoUsahaBase64) {
                alert('Mohon lampirkan foto produk/toko usaha Anda.');
                return;
            }
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Mengirimkan data...</span>`;
        }

        try {
            const formData = new FormData(form);
            const payload = {
                nama: formData.get('nama'),
                panggilan: formData.get('panggilan'),
                tahunLulus: formData.get('tahunLulus'),
                marhalah: formData.get('marhalah'),
                pondokKajen: formData.get('pondokKajen'),
                guruKajen: formData.get('guruKajen'),
                kecamatan: formData.get('kecamatan'),
                desa: formData.get('desa'),
                alamat: formData.get('alamat') || '',
                noWa: formData.get('noWa'),
                tampilkanWa: formData.get('tampilkanWa') !== null,
                profesiKategori: formData.get('profesiKategori'),
                profesiDetail: formData.get('profesiDetail') || '',
                foto: fotoBase64
            };

            if (hasUsaha) {
                payload.usaha = {
                    namaUsaha: formData.get('namaUsaha'),
                    kategori: formData.get('kategoriUsaha'),
                    deskripsi: formData.get('deskripsiUsaha'),
                    waBisnis: formData.get('waBisnis') || payload.noWa,
                    linkGmaps: formData.get('linkGmaps') || '',
                    foto: fotoUsahaBase64
                };
            }

            await window.KMF_API.submitRegistration(payload);

            form.reset();
            document.getElementById('foto-profil-base64').value = '';
            document.getElementById('foto-usaha-base64').value = '';
            document.getElementById('preview-foto-profil-container').innerHTML = '<i class="fa-solid fa-camera text-slate-400 text-xl"></i>';
            document.getElementById('preview-foto-usaha-container').innerHTML = '<i class="fa-solid fa-image text-slate-400 text-xl"></i>';
            this.toggleUsahaFields(false);

            this.showSuccessModal(payload.nama);
            await this.updatePendingBadge();
        } catch (err) {
            alert('Gagal mengirim formulir: ' + err.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origBtnText;
            }
        }
    },

    showSuccessModal: function(nama) {
        const msg = document.getElementById('modal-success-message');
        if (msg) {
            msg.innerHTML = `Terima kasih, <strong>${nama}</strong>. Formulir sensus alumni KMF Demak telah diterima dan menunggu verifikasi pengurus.`;
        }
        const modal = document.getElementById('modal-success');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    closeSuccessModal: function() {
        const modal = document.getElementById('modal-success');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.navigateTo('alumni');
    },

    /**
     * Logika Panel Admin Pengurus
     */
    handleAdminLogin: function(e) {
        e.preventDefault();
        const pin = document.getElementById('admin-pin-input').value;
        if (window.KMF_API.verifyAdminPin(pin)) {
            this.isAdminLoggedIn = true;
            document.getElementById('admin-login-box').classList.add('hidden');
            document.getElementById('admin-dashboard-box').classList.remove('hidden');
            this.renderAdminPending();
        } else {
            alert('PIN Pengurus salah! Gunakan PIN default 1912.');
        }
    },

    handleAdminLogout: function() {
        this.isAdminLoggedIn = false;
        document.getElementById('admin-pin-input').value = '';
        this.navigateTo('home');
    },

    switchAdminTab: function(tab) {
        const viewPending = document.getElementById('admin-view-pending');
        const viewSettings = document.getElementById('admin-view-settings');
        const btnPending = document.getElementById('admin-tab-pending');
        const btnSettings = document.getElementById('admin-tab-settings');

        if (tab === 'pending') {
            viewPending?.classList.remove('hidden');
            viewSettings?.classList.add('hidden');
            btnPending?.classList.add('bg-kmf-600', 'text-white');
            btnPending?.classList.remove('bg-slate-100', 'text-slate-700');
            btnSettings?.classList.remove('bg-kmf-600', 'text-white');
            btnSettings?.classList.add('bg-slate-100', 'text-slate-700');
            this.renderAdminPending();
        } else {
            viewPending?.classList.add('hidden');
            viewSettings?.classList.remove('hidden');
            btnSettings?.classList.add('bg-kmf-600', 'text-white');
            btnSettings?.classList.remove('bg-slate-100', 'text-slate-700');
            btnPending?.classList.remove('bg-kmf-600', 'text-white');
            btnPending?.classList.add('bg-slate-100', 'text-slate-700');
            const urlInput = document.getElementById('admin-gas-url-input');
            if (urlInput) urlInput.value = window.KMF_API.getGasUrl();
        }
    },

    renderAdminPending: async function() {
        const pending = await window.KMF_API.getPendingList();
        const container = document.getElementById('admin-pending-container');
        const badge = document.getElementById('admin-badge-pending');
        if (!container) return;

        if (badge) badge.textContent = pending.length;

        if (pending.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                    <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-check-double"></i>
                    </div>
                    <h4 class="font-bold text-slate-700 text-sm">Semua Sensus Telah Diverifikasi</h4>
                    <p class="text-xs text-slate-500">Belum ada pengajuan pendaftaran baru yang menunggu approval.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pending.map(item => `
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div class="flex items-start gap-3.5">
                    <div class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src="${item.foto}" alt="${item.nama}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <h4 class="font-bold text-slate-800 text-sm">${item.nama}</h4>
                            <span class="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                Menunggu Approval
                            </span>
                        </div>
                        <div class="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div>Lulus: <strong>${item.tahunLulus}</strong> • ${item.marhalah}</div>
                            <div>Pondok Kajen: <strong>${item.pondokKajen}</strong> (Guru: ${item.guruKajen || '-'})</div>
                            <div>Domisili: Kec. ${item.kecamatan}, Desa ${item.desa || '-'}</div>
                            <div>Profesi: ${item.profesiKategori} (${item.profesiDetail || '-'})</div>
                            <div>No WA: <a href="https://wa.me/${item.noWa}" target="_blank" class="text-emerald-700 font-semibold underline">${item.noWa}</a></div>
                        </div>

                        ${item.usaha ? `
                            <div class="mt-2 text-xs bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 space-y-1">
                                <div class="font-bold text-amber-900 flex items-center gap-1">
                                    <i class="fa-solid fa-store text-amber-600"></i> Usaha Terlampir: ${item.usaha.namaUsaha}
                                </div>
                                <div class="text-slate-600">${item.usaha.deskripsi}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button onclick="App.handleRejectAlumni('${item.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition">
                        <i class="fa-solid fa-times"></i> Tolak
                    </button>
                    <button onclick="App.handleApproveAlumni('${item.id}')" class="px-4 py-1.5 rounded-xl text-xs font-semibold bg-kmf-600 hover:bg-kmf-700 text-white transition flex items-center gap-1.5 shadow-sm">
                        <i class="fa-solid fa-check"></i> Setujui (Approve)
                    </button>
                </div>
            </div>
        `).join('');
    },

    handleApproveAlumni: async function(id) {
        if (!confirm('Yakin ingin menyetujui pendaftaran alumni ini? Data akan langsung aktif di direktori.')) return;
        try {
            await window.KMF_API.approveAlumni(id);
            alert('Alhamdulillah! Alumni berhasil diverifikasi dan aktif di direktori.');
            await this.renderAdminPending();
            await this.updatePendingBadge();
            await this.renderHome();
            await this.renderAlumniList();
            await this.renderUsahaList();
        } catch (err) {
            alert('Gagal menyetujui: ' + err.message);
        }
    },

    handleRejectAlumni: async function(id) {
        if (!confirm('Tolak pendaftaran ini?')) return;
        try {
            await window.KMF_API.rejectAlumni(id);
            alert('Pendaftaran telah ditolak.');
            await this.renderAdminPending();
            await this.updatePendingBadge();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    },

    saveGasSettings: function() {
        const url = document.getElementById('admin-gas-url-input').value;
        window.KMF_API.setGasUrl(url);
        alert('URL Google Apps Script berhasil disimpan!');
    },

    updatePendingBadge: async function() {
        const pending = await window.KMF_API.getPendingList();
        ['badge-pending-count', 'mobile-badge-pending-count', 'mobile-nav-pengaturan-badge'].forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                if (pending.length > 0) {
                    if (id !== 'mobile-nav-pengaturan-badge') badge.textContent = pending.length;
                    badge.classList.remove('hidden');
                    badge.classList.add('flex');
                } else {
                    badge.classList.add('hidden');
                    badge.classList.remove('flex');
                }
            }
        });
    },

    /**
     * Handler PWA Install Prompt
     */
    installPWA: function() {
        if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            this.deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User menginstall PWA KMF Demak');
                }
                this.deferredInstallPrompt = null;
                document.getElementById('btn-install-pwa')?.classList.add('hidden');
                document.getElementById('mobile-btn-install-app')?.classList.add('hidden');
            });
        } else {
            alert('Untuk memasang PWA KMF Demak di ponsel Anda:\n\n1. Ketuk ikon titik tiga (di Chrome) atau tombol Bagikan (di Safari iOS)\n2. Pilih "Tambahkan ke Layar Utama" (Add to Home screen)');
        }
    }
};

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
