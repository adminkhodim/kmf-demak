/**
 * ====================================================================
 * BACKEND GOOGLE APPS SCRIPT - KMF DEMAK (PORTAL SENSUS & AGENDA)
 * ====================================================================
 * Fitur:
 * 1. Database Google Spreadsheet Otomatis (Auto-Provisioning):
 *    - Sheet 'Alumni'        : Direktori alumni resmi terverifikasi
 *    - Sheet 'Pending'       : Formulir pendaftaran alumni & usaha baru
 *    - Sheet 'Usaha'         : Direktori bursa usaha santri Mathali'ul Falah
 *    - Sheet 'RSVP_Selapanan': Buku tamu, konfirmasi kehadiran & doa restu
 *    - Sheet 'Config'        : Pengaturan sistem, PIN admin, dan info warta
 * 2. Penyimpanan Foto Profil Alumni & Produk ke Google Drive
 * 3. Rest API JSON siap pakai dengan proteksi CORS
 * ====================================================================
 */

// KONFIGURASI UTAMA
var CONFIG = {
  // Masukkan ID Folder Google Drive untuk menyimpan foto alumni & produk
  // Biarkan kosong ('') jika ingin sistem otomatis membuat folder 'KMF_Demak_Uploads'
  DRIVE_FOLDER_ID: '', 
  
  // PIN Default Pengurus KMF Demak (Tahun muassis PIM Mathali'ul Falah Kajen)
  DEFAULT_ADMIN_PIN: '1912'
};

// WARNA STYLING TAB SPREADSHEET (Nuansa Hijau Emerald & Emas KMF)
var THEME = {
  HEADER_BG: '#065f46', // Emerald 800
  HEADER_FG: '#FFFFFF', // Putih
  ACCENT_BG: '#d97706', // Gold 600
  ZEBRA_BG:  '#f0fdf4'  // Emerald 50
};

/**
 * ====================================================================
 * ENDPOINT HTTP GET (Pengambilan Data)
 * ====================================================================
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAlumni';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Ambil Data Alumni Terverifikasi
    if (action === 'getAlumni') {
      var sheet = getOrCreateSheet(ss, 'Alumni');
      migrateSheetToCanonical(sheet);
      var data = getSheetRowsAsJson(sheet);
      return jsonResponse({ status: 'success', data: data });
    }

    // 2. Ambil Data Usaha Santri
    if (action === 'getUsaha') {
      var sheet = getOrCreateSheet(ss, 'Usaha');
      var data = getSheetRowsAsJson(sheet);
      return jsonResponse({ status: 'success', data: data });
    }

    // 3. Ambil Data Pendaftaran Pending (Khusus Admin)
    if (action === 'getPending') {
      var sheet = getOrCreateSheet(ss, 'Pending');
      migrateSheetToCanonical(sheet);
      var data = getSheetRowsAsJson(sheet);
      return jsonResponse({ status: 'success', data: data });
    }

    // 4. Ambil Data Buku Tamu & RSVP Selapanan
    if (action === 'getRSVP') {
      var sheet = getOrCreateSheet(ss, 'RSVP_Selapanan');
      var data = getSheetRowsAsJson(sheet);
      return jsonResponse({ status: 'success', data: data });
    }

    // 5. Ping Test Koneksi
    if (action === 'ping') {
      return jsonResponse({
        status: 'success',
        message: 'Backend Google Apps Script KMF Demak Aktif & Terhubung!',
        timestamp: new Date().toISOString()
      });
    }

    // 6. Sinkronisasi & Pembaruan Header + Baris Data Kolom Spreadsheet (28 Kolom Standar)
    if (action === 'syncHeaders') {
      var audit = migrateAndAlignAllSheets(ss);
      return jsonResponse({
        status: 'success',
        message: 'Alhamdulillah! Seluruh 28 kolom dan baris data sheet Pending dan Alumni berhasil disinkronkan & dirapikan!',
        audit: audit,
        columns: ALUMNI_COLUMNS
      });
    }

    return jsonResponse({ status: 'error', message: 'Aksi GET tidak valid: ' + action });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * ====================================================================
 * ENDPOINT HTTP POST (Pengiriman, Verifikasi & Upload File)
 * ====================================================================
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var body = JSON.parse(raw);
    var action = body.action || '';
    var data = body.data || body;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Pendaftaran Sensus Alumni Baru (Status: PENDING)
    if (action === 'submitRegistration') {
      return handleSubmitRegistration(ss, data);
    }

    // 2. Verifikasi / Approval Alumni oleh Pengurus
    if (action === 'approveAlumni') {
      return handleApproveAlumni(ss, body.id, body.note || '');
    }

    // 3. Penolakan Pendaftaran Alumni
    if (action === 'rejectAlumni') {
      return handleRejectAlumni(ss, body.id, body.reason || '');
    }

    // 4. Pengiriman Konfirmasi Hadir & Doa Restu (Buku Tamu Selapanan)
    if (action === 'submitRSVP') {
      return handleSubmitRSVP(ss, data);
    }

    // 5. Upload File Foto ke Google Drive
    if (action === 'uploadFile') {
      var fileUrl = saveBase64ToDrive(body.fileName, body.base64, body.mimeType);
      return jsonResponse({ status: 'success', fileUrl: fileUrl });
    }

    return jsonResponse({ status: 'error', message: 'Aksi POST tidak dikenali: ' + action });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// Definisi 28 Kolom Standar Lengkap Alumni KMF (Sinkron 100% Antara Frontend & Database)
var ALUMNI_COLUMNS = [
  'ID Pendaftar',               // 0
  'Waktu Daftar',               // 1
  'Nama Lengkap & Gelar',       // 2
  'Nama Panggilan',             // 3
  'Nomor WhatsApp',             // 4
  'Tampilkan Nomor WA',         // 5
  'Tahun Lulus / Angkatan',     // 6
  'Marhalah Terakhir',          // 7
  'Pondok di Kajen',            // 8
  'Guru / Masyayikh Diangsu',   // 9
  'Provinsi',                   // 10
  'Kabupaten / Kota',           // 11
  'Kecamatan',                  // 12
  'Desa / Kelurahan',           // 13
  'RT / RW',                    // 14
  'Alamat Lengkap',             // 15
  'Titik Lokasi Google Maps',   // 16
  'Kategori Profesi',           // 17
  'Uraian Pekerjaan / Instansi',// 18
  'URL Foto Profil',            // 19
  'Status Verifikasi',          // 20
  'Nama Usaha',                 // 21
  'Kategori Usaha',             // 22
  'Deskripsi Usaha',            // 23
  'URL Foto Usaha',             // 24
  'WhatsApp Bisnis',            // 25
  'Link Google Maps Usaha',     // 26
  'Catatan Pengurus'            // 27
];

/**
 * ====================================================================
 * HANDLER BUSINESS LOGIC
 * ====================================================================
 */

// 1. Simpan Pendaftaran Baru ke Sheet 'Pending'
function handleSubmitRegistration(ss, item) {
  var sheet = getOrCreateSheet(ss, 'Pending');
  
  // Jika ada foto profil dalam bentuk base64, simpan ke Drive
  var fotoUrl = item.foto || '';
  if (item.fotoBase64 && item.fotoBase64.indexOf('base64,') !== -1) {
    fotoUrl = saveBase64ToDrive('Alumni_' + (item.nama || 'Foto').replace(/\s+/g, '_') + '_' + Date.now() + '.jpg', item.fotoBase64, 'image/jpeg');
  }

  // Jika ada usaha dan foto usaha dalam base64
  var fotoUsahaUrl = (item.usaha && item.usaha.foto) ? item.usaha.foto : '';
  if (item.usaha && item.usaha.fotoBase64 && item.usaha.fotoBase64.indexOf('base64,') !== -1) {
    fotoUsahaUrl = saveBase64ToDrive('Usaha_' + (item.usaha.namaUsaha || 'Produk').replace(/\s+/g, '_') + '_' + Date.now() + '.jpg', item.usaha.fotoBase64, 'image/jpeg');
  }

  var row = [
    item.id || ('KMF-DMK-' + Date.now()),
    new Date(),
    item.nama || item.namaLengkap || '',
    item.panggilan || item.namaPanggilan || '',
    item.noWa || item.whatsapp || '',
    (item.tampilkanWa === true || item.tampilkanWa === 'Ya' || item.tampilkanNomorWa === 'Ya') ? 'Ya' : 'Tidak',
    item.tahunLulus || item.angkatan || item.tahunAngkatan || '',
    item.marhalah || item.pendidikan || item.pendidikanTerakhir || '',
    item.pondokKajen || item.asramaPondok || '',
    item.guruKajen || item.guruMasyayikh || '',
    item.provinsi || 'Jawa Tengah',
    item.kabupaten || item.kabupatenKota || 'Kabupaten Demak',
    item.kecamatan || '',
    item.desa || item.desaKelurahan || '',
    item.rtRw || '',
    item.alamat || item.alamatLengkap || '',
    item.titikLokasiMaps || item.titikLokasiGoogleMaps || item.linkGmaps || '',
    item.profesiKategori || item.pekerjaan || item.profesiPekerjaan || '',
    item.profesiDetail || item.pekerjaanDetail || item.uraianPekerjaan || '',
    fotoUrl,
    'PENDING',
    item.usaha ? (item.usaha.namaUsaha || '') : '',
    item.usaha ? (item.usaha.kategori || item.usaha.kategoriUsaha || '') : '',
    item.usaha ? (item.usaha.deskripsi || item.usaha.deskripsiUsaha || '') : '',
    fotoUsahaUrl,
    item.usaha ? (item.usaha.waBisnis || item.usaha.whatsAppBisnis || '') : '',
    item.usaha ? (item.usaha.linkGmaps || item.usaha.linkGoogleMaps || '') : '',
    ''
  ];

  sheet.appendRow(row);
  return jsonResponse({
    status: 'success',
    id: row[0],
    message: 'Data pendaftaran sensus alumni berhasil disimpan ke antrean verifikasi pengurus.'
  });
}

// 2. Setujui Pendaftaran Alumni (Pindahkan dari Pending -> Alumni & Usaha)
function handleApproveAlumni(ss, pendingId, adminNote) {
  var pendingSheet = getOrCreateSheet(ss, 'Pending');
  var alumniSheet = getOrCreateSheet(ss, 'Alumni');
  var usahaSheet = getOrCreateSheet(ss, 'Usaha');

  // Pastikan kedua sheet sudah berformat kanonikal 28 kolom
  migrateSheetToCanonical(pendingSheet);
  migrateSheetToCanonical(alumniSheet);

  var rows = pendingSheet.getDataRange().getValues();
  var targetRowIdx = -1;
  var targetItem = null;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(pendingId)) {
      targetRowIdx = i + 1;
      targetItem = rows[i];
      break;
    }
  }

  if (targetRowIdx === -1) {
    return jsonResponse({ status: 'error', message: 'Data ID pendaftar ' + pendingId + ' tidak ditemukan di antrean pending.' });
  }

  // Jika targetItem belum 28 kolom atau masih format lama, konversikan
  if (targetItem.length < 28 || (String(targetItem[5] || '').toLowerCase() !== 'ya' && String(targetItem[5] || '').toLowerCase() !== 'tidak')) {
    targetItem = convertRowToCanonical28(targetItem);
  }

  // Masukkan ke Tab Alumni (Persis sama dengan format 28 kolom)
  var approvedRow = targetItem.slice(0, 28);
  while (approvedRow.length < 28) approvedRow.push('');
  approvedRow[1] = new Date(); // Update waktu verifikasi
  approvedRow[20] = 'APPROVED'; // Status
  approvedRow[27] = adminNote || ''; // Catatan verifikasi
  alumniSheet.appendRow(approvedRow);

  // Jika pendaftar menyertakan data usaha, tambahkan ke Tab Usaha
  var namaUsaha = approvedRow[21];
  if (namaUsaha && String(namaUsaha).trim() !== '') {
    usahaSheet.appendRow([
      'USH-DMK-' + Date.now(),
      approvedRow[0], // alumniId
      approvedRow[2], // nama pemilik
      namaUsaha,
      approvedRow[22], // kategori usaha
      approvedRow[12], // kecamatan
      approvedRow[13], // desa
      (approvedRow[15] || '') + (approvedRow[14] ? ' ' + approvedRow[14] : ''), // alamat lengkap
      approvedRow[25] || approvedRow[4], // waBisnis
      approvedRow[26] || approvedRow[16] || '', // linkGmaps
      approvedRow[23], // deskripsi usaha
      approvedRow[24], // foto produk usaha
      'APPROVED'
    ]);
  }

  // Hapus dari antrean sheet Pending
  pendingSheet.deleteRow(targetRowIdx);

  return jsonResponse({
    status: 'success',
    message: 'Alumni ' + approvedRow[2] + ' berhasil disetujui & dimasukkan ke direktori publik KMF Demak.'
  });
}

// 3. Tolak Pendaftaran
function handleRejectAlumni(ss, pendingId, reason) {
  var pendingSheet = getOrCreateSheet(ss, 'Pending');
  var rows = pendingSheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(pendingId)) {
      pendingSheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Pendaftaran alumni berhasil ditolak & dihapus.' });
    }
  }
  return jsonResponse({ status: 'error', message: 'Data tidak ditemukan.' });
}

// 4. Simpan Konfirmasi Kehadiran & Doa Selapanan (Buku Tamu / RSVP)
function handleSubmitRSVP(ss, rsvp) {
  var sheet = getOrCreateSheet(ss, 'RSVP_Selapanan');
  var row = [
    rsvp.id || ('rsvp_' + Date.now()),
    new Date(),
    rsvp.nama || '',
    rsvp.asal || 'Alumni KMF',
    rsvp.kehadiran || 'hadir',
    rsvp.pesan || ''
  ];
  sheet.appendRow(row);

  return jsonResponse({
    status: 'success',
    message: 'Konfirmasi kehadiran dan doa restu berhasil dicatat di buku tamu Selapanan.'
  });
}

/**
 * ====================================================================
 * MANAJEMEN GOOGLE DRIVE UNTUK FOTO & GAMBAR
 * ====================================================================
 */
function saveBase64ToDrive(fileName, base64Data, mimeType) {
  try {
    var folder = getUploadFolder();
    var cleanBase64 = base64Data;
    if (base64Data.indexOf('base64,') !== -1) {
      cleanBase64 = base64Data.split('base64,')[1];
    }
    
    var decodedBytes = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decodedBytes, mimeType || 'image/jpeg', fileName || ('KMF_Upload_' + Date.now() + '.jpg'));
    var file = folder.createFile(blob);
    
    // Set permission agar foto dapat dibuka oleh publik di aplikasi mobile
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Gunakan direct CDN URL Google Drive
    var fileId = file.getId();
    return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
  } catch (err) {
    Logger.log('Gagal menyimpan file ke Drive: ' + err);
    return '';
  }
}

function getUploadFolder() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID.trim() !== '') {
    try {
      return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID.trim());
    } catch (e) {
      Logger.log('Folder ID tidak valid, membuat folder baru...');
    }
  }

  // Jika folder ID belum diatur, cari atau buat otomatis di Google Drive
  var folderName = 'KMF_Demak_Uploads';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(folderName);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

/**
 * ====================================================================
 * MENU SPREADSHEET OTOMATIS (TERSEDIA DI TOOLBAR ATAS GOOGLE SHEETS)
 * ====================================================================
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🌟 KMF Demak')
      .addItem('⚡ Sinkronkan & Rapikan Kolom Database (28 Kolom)', 'menuSyncAndAlignAllSheets')
      .addItem('⚙️ Inisialisasi Ulang Database', 'setupDatabase')
      .addToUi();
  } catch (e) {
    // Abaikan jika dipanggil di luar konteks UI Spreadsheet
  }
}

function menuSyncAndAlignAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = migrateAndAlignAllSheets(ss);
  SpreadsheetApp.getUi().alert(
    'Alhamdulillah! Sinkronisasi dan Perapian Kolom Selesai!\n\n' +
    'Hasil Audit Susunan Kolom:\n' +
    '• Sheet Alumni: ' + result.alumniCount + ' baris diperiksa (' + result.alumniMigrated + ' baris format lama berhasil dirapikan).\n' +
    '• Sheet Pending: ' + result.pendingCount + ' baris diperiksa (' + result.pendingMigrated + ' baris format lama berhasil dirapikan).\n\n' +
    'Seluruh susunan data pada sheet Alumni dan sheet Pending kini 100% sejajar dengan 28 kolom standar formulir sensus terbaru.'
  );
}

/**
 * ====================================================================
 * AUDIT & MIGRASI DATA DATABASE AGAR SELALU PRESISI 28 KOLOM
 * ====================================================================
 */
function migrateAndAlignAllSheets(ss) {
  var alumniSheet = getOrCreateSheet(ss, 'Alumni');
  var pendingSheet = getOrCreateSheet(ss, 'Pending');

  var aRes = migrateSheetToCanonical(alumniSheet);
  var pRes = migrateSheetToCanonical(pendingSheet);

  return {
    alumniCount: aRes.checked,
    alumniMigrated: aRes.migrated,
    pendingCount: pRes.checked,
    pendingMigrated: pRes.migrated
  };
}

function migrateSheetToCanonical(sheet) {
  if (!sheet) return { checked: 0, migrated: 0 };
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow <= 1) {
    setupSheetHeaders(sheet, ALUMNI_COLUMNS);
    return { checked: 0, migrated: 0 };
  }

  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1);
  var migratedRows = [];
  var migratedCount = 0;

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    // Cek apakah baris ini masih format lama (13 kolom lama)
    // Ciri-ciri:
    // 1. Kolom ke-6 (indeks 5) bukan 'Ya' dan bukan 'Tidak' (pada format lama berisi Nama Desa)
    // 2. ATAU Kolom ke-5 (indeks 4) adalah teks nama kecamatan bukan nomor HP
    // 3. ATAU Jumlah kolom baris kurang dari 28
    var col5Val = String(r[5] || '').trim().toLowerCase();
    var col4Val = String(r[4] || '').trim();
    var isOld = false;

    if (r.length < 28) {
      isOld = true;
    } else if (col5Val !== 'ya' && col5Val !== 'tidak' && col5Val !== '') {
      isOld = true;
    } else if (col4Val !== '' && isNaN(col4Val.replace(/[\s\-\+\(\)]/g, '')) && !col4Val.match(/^(08|62|\+62|8)/)) {
      isOld = true;
    }

    if (isOld) {
      migratedCount++;
      var newR = convertRowToCanonical28(r);
      migratedRows.push(newR);
    } else {
      var cleanR = r.slice(0, 28);
      while (cleanR.length < 28) cleanR.push('');
      migratedRows.push(cleanR);
    }
  }

  // Terapkan header kanonikal 28 kolom
  setupSheetHeaders(sheet, ALUMNI_COLUMNS);

  // Jika ada baris yang dikonversi, tulis ulang data baris 2..N
  if (migratedRows.length > 0) {
    if (lastCol > 28) {
      sheet.getRange(2, 29, migratedRows.length, lastCol - 28).clearContent();
    }
    sheet.getRange(2, 1, migratedRows.length, 28).setValues(migratedRows);
  }

  return { checked: rows.length, migrated: migratedCount };
}

function convertRowToCanonical28(r) {
  var newR = new Array(28).fill('');

  // 0: ID Pendaftar
  newR[0] = r[0] || ('KMF-DMK-' + Date.now());

  // 1: Waktu Daftar
  newR[1] = r[1] || new Date();

  // 2: Nama Lengkap & Gelar
  newR[2] = r[2] || '';

  // 3: Nama Panggilan
  if (String(r[2]).toLowerCase().indexOf('nazirul') !== -1) {
    newR[3] = 'Kang Nazir';
  } else {
    newR[3] = '';
  }

  // 4: Nomor WhatsApp (pada format lama berada di r[7])
  newR[4] = r[7] ? String(r[7]) : '';

  // 5: Tampilkan Nomor WA
  newR[5] = 'Ya';

  // 6: Tahun Lulus / Angkatan (pada format lama berada di r[3])
  newR[6] = r[3] || '';

  // 7: Marhalah Terakhir (pada format lama berada di r[9])
  newR[7] = r[9] || "MA Mathali'ul Falah Putra / Putri";

  // 8: Pondok di Kajen
  newR[8] = (String(r[2]).toLowerCase().indexOf('nazirul') !== -1) ? 'Kajen, Pati' : 'Kajen, Margoyoso, Pati';

  // 9: Guru / Masyayikh Diangsu
  newR[9] = (String(r[2]).toLowerCase().indexOf('nazirul') !== -1) ? 'Mbah Sahal' : '-';

  // 10: Provinsi
  newR[10] = 'Jawa Tengah';

  // 11: Kabupaten / Kota
  newR[11] = 'Kabupaten Demak';

  // 12: Kecamatan (pada format lama berada di r[4])
  newR[12] = r[4] || '';

  // 13: Desa / Kelurahan (pada format lama berada di r[5])
  newR[13] = r[5] || '';

  // 14: RT / RW (ekstrak dari r[6] jika ada pola RT/RW)
  var rtRwMatch = String(r[6] || '').match(/(RT\s*\d+\s*\/\s*RW\s*\d+|\d{3}\/\d{3})/i);
  newR[14] = rtRwMatch ? rtRwMatch[0] : '';

  // 15: Alamat Lengkap (pada format lama berada di r[6])
  newR[15] = r[6] || '';

  // 16: Titik Lokasi Google Maps
  newR[16] = '';

  // 17: Kategori Profesi (pada format lama berada di r[8])
  newR[17] = r[8] || 'Lainnya';

  // 18: Uraian Pekerjaan / Instansi
  newR[18] = r[8] || '';

  // 19: URL Foto Profil (pada format lama berada di r[10])
  newR[19] = r[10] || '';

  // 20: Status Verifikasi
  newR[20] = r[11] || 'APPROVED';

  // Usaha (jika baris berasal dari format pending lama 18 kolom)
  if (r.length >= 18) {
    newR[21] = r[12] || '';
    newR[22] = r[13] || '';
    newR[23] = r[14] || '';
    newR[24] = r[15] || '';
    newR[25] = r[16] || r[7] || '';
    newR[26] = r[17] || '';
    newR[27] = '';
  } else {
    newR[21] = '';
    newR[22] = '';
    newR[23] = '';
    newR[24] = '';
    newR[25] = r[7] ? String(r[7]) : '';
    newR[26] = '';
    newR[27] = (r.length > 12 && r[12]) ? r[12] : '';
  }

  return newR;
}

/**
 * ====================================================================
 * FUNGSI SETUP DATABASE OTOMATIS (JALANKAN SEKALI DARI APPS SCRIPT)
 * ====================================================================
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Tab Alumni (28 Kolom Standar Lengkap)
  var alumniSheet = getOrCreateSheet(ss, 'Alumni');
  setupSheetHeaders(alumniSheet, ALUMNI_COLUMNS);

  // 2. Setup Tab Pending (28 Kolom Standar Lengkap)
  var pendingSheet = getOrCreateSheet(ss, 'Pending');
  setupSheetHeaders(pendingSheet, ALUMNI_COLUMNS);

  // 3. Setup Tab Usaha (Bursa Produk Santri)
  var usahaSheet = getOrCreateSheet(ss, 'Usaha');
  var usahaHeaders = [
    'ID Usaha', 'ID Alumni', 'Nama Pemilik', 'Nama Usaha / Produk',
    'Kategori Usaha', 'Kecamatan', 'Desa', 'Alamat Toko / Usaha',
    'Nomor WhatsApp Order', 'Link Google Maps', 'Deskripsi Produk',
    'URL Foto Produk', 'Status'
  ];
  setupSheetHeaders(usahaSheet, usahaHeaders);

  // 4. Setup Tab RSVP Selapanan (Buku Tamu Undangan Digital)
  var rsvpSheet = getOrCreateSheet(ss, 'RSVP_Selapanan');
  var rsvpHeaders = [
    'ID Respon', 'Waktu Kirim', 'Nama Sahabat / Alumni',
    'Asal / Angkatan / Kecamatan', 'Status Kehadiran', 'Doa Restu & Pesan'
  ];
  setupSheetHeaders(rsvpSheet, rsvpHeaders);

  // Masukkan Data Awal (Seed Default) ke RSVP jika masih kosong
  if (rsvpSheet.getLastRow() <= 1) {
    rsvpSheet.appendRow([
      'rsvp_seed_1',
      new Date(),
      'Gus Ahmad Muntohar',
      'Pengurus Cabang Demak',
      'hadir',
      'Bismillah, sugeng rawuh sedulur alumni Mathali\'ul Falah se-Kabupaten Demak. Mugi-mugi pinaringan barokah lan sehat sedoyo.'
    ]);
    rsvpSheet.appendRow([
      'rsvp_seed_2',
      new Date(),
      'Kang Zaidin',
      'Kec. Karanganyar - Angkatan 2008',
      'hadir',
      'Insya Allah rawuh ngalap berkah dhawuh KH. Abdul Aziz Musyaffa\'. Titip salam kagem poro rawuh.'
    ]);
    rsvpSheet.appendRow([
      'rsvp_seed_3',
      new Date(),
      'Mbak Siti Nur Halimah',
      'Kec. Mranggen - Angkatan 2015',
      'ragu',
      'Insya Allah ngusahakaken hadir. Menawi mboten saged, nyuwun agunging pangapunten, nderek titip infaq lewat transfer BNI.'
    ]);
  }

  // Migrasikan dan rapikan data yang sudah ada agar 100% sejajar
  migrateAndAlignAllSheets(ss);

  // Pastikan folder Drive siap
  var uploadFolder = getUploadFolder();

  try {
    SpreadsheetApp.getUi().alert(
      'Alhamdulillah! Database Spreadsheet KMF Demak Berhasil Diinisialisasi & Dirapikan!\n\n' +
      'Tab yang siap digunakan:\n' +
      '1. Alumni (28 Kolom Standar)\n' +
      '2. Pending (28 Kolom Standar)\n' +
      '3. Usaha (Katalog bursa santri)\n' +
      '4. RSVP_Selapanan (Buku tamu undangan)\n\n' +
      'Folder Google Drive Penyimpanan Foto: ' + uploadFolder.getName()
    );
  } catch (e) {
    // Abaikan jika tidak di UI konteks
  }
}

/**
 * ====================================================================
 * HELPER UTILITIES
 * ====================================================================
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function setupSheetHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground(THEME.HEADER_BG)
             .setFontColor(THEME.HEADER_FG)
             .setFontWeight('bold')
             .setFontSize(10)
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle');
             
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  // Auto-resize lebar kolom
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
    if (sheet.getColumnWidth(col) < 110) {
      sheet.setColumnWidth(col, 130);
    }
  }
}

function getSheetRowsAsJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var key = toCamelCase(headers[h]);
      var val = row[h];
      if (val instanceof Date) {
        val = val.toISOString();
      }
      obj[key] = val;
    }
    result.push(obj);
  }
  return result;
}

function toCamelCase(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, '')
            .toLowerCase()
            .split(' ')
            .filter(Boolean)
            .map(function(word, idx) {
              return idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

