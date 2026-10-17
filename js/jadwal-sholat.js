/**
 * KMF Demak - Jadwal Sholat Falakiyah & Kalender Hijriyah/Jawa
 * Perhitungan astronomis presisi untuk wilayah Kabupaten Demak (-6.8944, 110.6386, GMT+7)
 * Standar Lembaga Falakiyah PBNU & Kemenag RI
 */

(function() {
    // Koordinat Kabupaten Demak, Jawa Tengah
    const DEMAK_COORDS = {
        name: "Kab. Demak, Jawa Tengah",
        lat: -6.8944,
        lng: 110.6386,
        elevation: 10,
        tz: 7,
        tzName: "WIB"
    };

    const HIJRI_MONTHS = [
        "Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir",
        "Jumadil Ula", "Jumadil Akhir", "Rajab", "Sya'ban",
        "Ramadhan", "Syawwal", "Dzulqa'dah", "Dzulhijjah"
    ];

    const PASARAN_JAWA = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const NAMA_BULAN = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const D2R = Math.PI / 180;
    const R2D = 180 / Math.PI;

    function sinD(d) { return Math.sin(d * D2R); }
    function cosD(d) { return Math.cos(d * D2R); }
    function tanD(d) { return Math.tan(d * D2R); }
    function asinD(x) { return Math.asin(x) * R2D; }
    function acosD(x) { return Math.acos(x) * R2D; }
    function atanD(x) { return Math.atan(x) * R2D; }

    function fixAngle(a) {
        a = a - 360.0 * Math.floor(a / 360.0);
        return a < 0 ? a + 360.0 : a;
    }

    function fixHour(h) {
        h = h - 24.0 * Math.floor(h / 24.0);
        return h < 0 ? h + 24.0 : h;
    }

    function julianDate(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    }

    function getSunPosition(jd) {
        const D = jd - 2451545.0;
        const g = fixAngle(357.529 + 0.98560028 * D);
        const q = fixAngle(280.459 + 0.98564736 * D);
        const L = fixAngle(q + 1.915 * sinD(g) + 0.020 * sinD(2 * g));

        const e = 23.439 - 0.00000036 * D;
        const d = asinD(sinD(e) * sinD(L));
        let RA = atanD(cosD(e) * sinD(L) / cosD(L)) / 15.0;
        if (cosD(L) < 0) RA += 12;
        else if (cosD(e) * sinD(L) < 0) RA += 24;

        const EqT = q / 15.0 - fixHour(RA);
        return { declination: d, equationOfTime: EqT };
    }

    function getPasaranJawa(dateObj) {
        const timestamp = dateObj.getTime();
        const totalHari = Math.floor((timestamp + (7 * 3600 * 1000)) / 86400000);
        const pasaranIdx = (totalHari + 3) % 5;
        return PASARAN_JAWA[(pasaranIdx + 5) % 5];
    }

    function gregorianToHijri(year, month, day) {
        let m = month;
        let y = year;
        if (m < 3) {
            y -= 1;
            m += 12;
        }
        let a = Math.floor(y / 100);
        let b = 2 - a + Math.floor(a / 4);
        let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

        // Koreksi +1 untuk sinkronisasi hisab rukyat Indonesia
        let l = jd - 1948440 + 10632 + 1;
        let n = Math.floor((l - 1) / 10631);
        l = l - 10631 * n + 354;
        let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
        l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
        let hijriMonth = Math.floor((24 * l) / 709);
        let hijriDay = l - Math.floor((709 * hijriMonth) / 24);
        let hijriYear = 30 * n + j - 30;

        return {
            day: hijriDay,
            month: hijriMonth,
            monthName: HIJRI_MONTHS[hijriMonth - 1] || "Hijriyah",
            year: hijriYear,
            formatted: `${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1] || ''} ${hijriYear} H`
        };
    }

    function calculatePrayerTimes(date) {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();

        const jd = julianDate(y, m, d);
        const sun = getSunPosition(jd);
        const lat = DEMAK_COORDS.lat;
        const lng = DEMAK_COORDS.lng;
        const tz = DEMAK_COORDS.tz;

        // Transit Matahari (Zuhur astronomis)
        const dhuhrBase = 12 + tz - (lng / 15.0) - sun.equationOfTime;

        // Subuh: sudut 20 derajat
        const fajrAngle = 20.0;
        const fajrCos = (-sinD(fajrAngle) - sinD(lat) * sinD(sun.declination)) / (cosD(lat) * cosD(sun.declination));
        const fajrT = (fajrCos >= -1 && fajrCos <= 1) ? (acosD(fajrCos) / 15.0) : 0;
        const fajrBase = dhuhrBase - fajrT;

        // Terbit: matahari di ufuk (-0.833 derajat)
        const sunriseAngle = 0.833;
        const sunriseCos = (-sinD(sunriseAngle) - sinD(lat) * sinD(sun.declination)) / (cosD(lat) * cosD(sun.declination));
        const sunriseT = (sunriseCos >= -1 && sunriseCos <= 1) ? (acosD(sunriseCos) / 15.0) : 0;
        const sunriseBase = dhuhrBase - sunriseT;

        // Dhuha: matahari naik 4.5 derajat
        const dhuhaAngle = -4.5;
        const dhuhaCos = (-sinD(dhuhaAngle) - sinD(lat) * sinD(sun.declination)) / (cosD(lat) * cosD(sun.declination));
        const dhuhaT = (dhuhaCos >= -1 && dhuhaCos <= 1) ? (acosD(dhuhaCos) / 15.0) : 0;
        const dhuhaBase = dhuhrBase - dhuhaT;

        // Terbenam (Maghrib astronomis)
        const sunsetBase = dhuhrBase + sunriseT;

        // Ashar: bayangan 1x tinggi benda + bayangan tengah hari (Madzhab Syafi'i)
        const asrAngle = -atanD(1.0 + tanD(Math.abs(lat - sun.declination)));
        const asrCos = (-sinD(asrAngle) - sinD(lat) * sinD(sun.declination)) / (cosD(lat) * cosD(sun.declination));
        const asrT = (asrCos >= -1 && asrCos <= 1) ? (acosD(asrCos) / 15.0) : 0;
        const asrBase = dhuhrBase + asrT;

        // Isya: sudut 18 derajat
        const ishaAngle = 18.0;
        const ishaCos = (-sinD(ishaAngle) - sinD(lat) * sinD(sun.declination)) / (cosD(lat) * cosD(sun.declination));
        const ishaT = (ishaCos >= -1 && ishaCos <= 1) ? (acosD(ishaCos) / 15.0) : 0;
        const ishaBase = dhuhrBase + ishaT;

        function formatWithIhtiyat(hours, ihtiyatMin = 2) {
            let totalSec = Math.round(hours * 3600) + (ihtiyatMin * 60);
            totalSec = (totalSec + 86400) % 86400;
            const h = Math.floor(totalSec / 3600);
            const min = Math.floor((totalSec % 3600) / 60);
            return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        }

        const subuhStr = formatWithIhtiyat(fajrBase, 2);
        const terbitStr = formatWithIhtiyat(sunriseBase, 0);
        const dhuhaStr = formatWithIhtiyat(dhuhaBase, 2);
        const zuhurStr = formatWithIhtiyat(dhuhrBase, 2);
        const asharStr = formatWithIhtiyat(asrBase, 2);
        const maghribStr = formatWithIhtiyat(sunsetBase, 2);
        const isyaStr = formatWithIhtiyat(ishaBase, 2);

        // Imsak 10 menit sebelum subuh
        const [subH, subM] = subuhStr.split(':').map(Number);
        let imsakTotalMin = (subH * 60 + subM) - 10;
        if (imsakTotalMin < 0) imsakTotalMin += 1440;
        const imsakH = Math.floor(imsakTotalMin / 60);
        const imsakM = imsakTotalMin % 60;
        const imsakStr = `${String(imsakH).padStart(2, '0')}:${String(imsakM).padStart(2, '0')}`;

        const hijri = gregorianToHijri(y, m, d);
        const pasaran = getPasaranJawa(date);

        return {
            date,
            dayName: NAMA_HARI[date.getDay()],
            pasaran,
            masehiDay: d,
            masehiMonth: m,
            masehiYear: y,
            masehiMonthName: NAMA_BULAN[m - 1],
            hijri,
            times: {
                imsak: imsakStr,
                subuh: subuhStr,
                terbit: terbitStr,
                dhuha: dhuhaStr,
                zuhur: zuhurStr,
                ashar: asharStr,
                maghrib: maghribStr,
                isya: isyaStr
            },
            tzName: DEMAK_COORDS.tzName
        };
    }

    function getNextPrayerInfo(schedule) {
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        const prayerList = [
            { key: "imsak", name: "Imsak", time: schedule.times.imsak, icon: "fa-mug-hot" },
            { key: "subuh", name: "Subuh", time: schedule.times.subuh, icon: "fa-cloud-sun" },
            { key: "terbit", name: "Terbit", time: schedule.times.terbit, icon: "fa-sun" },
            { key: "dhuha", name: "Dhuha", time: schedule.times.dhuha, icon: "fa-sun" },
            { key: "zuhur", name: "Zuhur", time: schedule.times.zuhur, icon: "fa-sun" },
            { key: "ashar", name: "Ashar", time: schedule.times.ashar, icon: "fa-cloud-sun" },
            { key: "maghrib", name: "Maghrib", time: schedule.times.maghrib, icon: "fa-cloud-moon" },
            { key: "isya", name: "Isya'", time: schedule.times.isya, icon: "fa-moon" }
        ];

        let nextPrayer = prayerList[0];
        let targetSec = 0;

        for (let i = 0; i < prayerList.length; i++) {
            const p = prayerList[i];
            const [pH, pM] = p.time.split(':').map(Number);
            const pSec = pH * 3600 + pM * 60;
            if (pSec > nowSec) {
                nextPrayer = p;
                targetSec = pSec;
                break;
            }
        }

        // Jika sudah lewat Isya', shalat terdekat berikutnya adalah Imsak besok
        if (targetSec === 0) {
            nextPrayer = prayerList[0];
            const [iH, iM] = prayerList[0].time.split(':').map(Number);
            targetSec = (iH * 3600 + iM * 60) + 86400;
        }

        const diffSec = Math.max(0, targetSec - nowSec);
        const diffH = Math.floor(diffSec / 3600);
        const diffM = Math.floor((diffSec % 3600) / 60);
        const diffS = diffSec % 60;
        const countdownStr = `${String(diffH).padStart(2, '0')}:${String(diffM).padStart(2, '0')}:${String(diffS).padStart(2, '0')}`;

        return {
            nextPrayer,
            countdown: countdownStr
        };
    }

    let tickerInterval = null;

    function updateWidget() {
        const today = new Date();
        const schedule = calculatePrayerTimes(today);
        const nextInfo = getNextPrayerInfo(schedule);

        // Update elements if they exist
        const locEl = document.getElementById('home-prayer-location');
        if (locEl) locEl.innerText = DEMAK_COORDS.name;

        const dayEl = document.getElementById('home-current-day');
        if (dayEl) dayEl.innerText = `${schedule.dayName} ${schedule.pasaran}`;

        const nextNameEl = document.getElementById('home-next-prayer-name');
        if (nextNameEl) {
            nextNameEl.innerHTML = `${nextInfo.nextPrayer.name} <span class="text-amber-300 font-semibold ml-1">${nextInfo.nextPrayer.time} ${schedule.tzName}</span>`;
        }

        const countdownEl = document.getElementById('home-prayer-countdown');
        if (countdownEl) countdownEl.innerText = nextInfo.countdown;

        const masehiEl = document.getElementById('home-date-masehi-val');
        if (masehiEl) masehiEl.innerText = `${schedule.masehiDay} ${schedule.masehiMonthName} ${schedule.masehiYear}`;

        const hijriEl = document.getElementById('home-date-hijri-val');
        if (hijriEl) hijriEl.innerText = schedule.hijri.formatted;
    }

    // Modal Full Jadwal Sholat Demak
    function openJadwalSholatModal() {
        const today = new Date();
        const schedule = calculatePrayerTimes(today);
        const modal = document.getElementById('modal-jadwal-sholat');
        const container = document.getElementById('modal-jadwal-container');
        if (!modal || !container) return;

        const times = [
            { label: 'Imsak', time: schedule.times.imsak, icon: 'fa-mug-hot' },
            { label: 'Subuh', time: schedule.times.subuh, icon: 'fa-cloud-sun' },
            { label: 'Terbit', time: schedule.times.terbit, icon: 'fa-sun' },
            { label: 'Dhuha', time: schedule.times.dhuha, icon: 'fa-sun' },
            { label: 'Zuhur', time: schedule.times.zuhur, icon: 'fa-sun' },
            { label: 'Ashar', time: schedule.times.ashar, icon: 'fa-cloud-sun' },
            { label: 'Maghrib', time: schedule.times.maghrib, icon: 'fa-cloud-moon' },
            { label: 'Isya\'', time: schedule.times.isya, icon: 'fa-moon' }
        ];

        container.innerHTML = times.map(t => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2.5 text-slate-700 font-medium text-xs">
                    <div class="w-7 h-7 rounded-lg bg-kmf-50 text-kmf-600 flex items-center justify-center text-xs">
                        <i class="fa-solid ${t.icon}"></i>
                    </div>
                    <span>${t.label}</span>
                </div>
                <span class="font-mono font-bold text-slate-800 text-xs">${t.time} WIB</span>
            </div>
        `).join('');

        const headerDate = document.getElementById('modal-jadwal-date');
        if (headerDate) {
            headerDate.innerText = `${schedule.dayName} ${schedule.pasaran}, ${schedule.masehiDay} ${schedule.masehiMonthName} ${schedule.masehiYear} / ${schedule.hijri.formatted}`;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeJadwalSholatModal() {
        const modal = document.getElementById('modal-jadwal-sholat');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    function init() {
        updateWidget();
        if (tickerInterval) clearInterval(tickerInterval);
        tickerInterval = setInterval(updateWidget, 1000);
    }

    window.KMF_PRAYER = {
        init,
        updateWidget,
        calculatePrayerTimes,
        openJadwalSholatModal,
        closeJadwalSholatModal
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
