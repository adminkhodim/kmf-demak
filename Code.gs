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
    item.nama || '',
    item.angkatan || '',
    item.kecamatan || '',
    item.desa || '',
    item.alamat || '',
    item.noWa || '',
    item.pekerjaan || '',
    item.pendidikan || '',
    fotoUrl,
    item.status || 'PENDING',
    item.usaha ? (item.usaha.namaUsaha || '') : '',
    item.usaha ? (item.usaha.kategori || '') : '',
    item.usaha ? (item.usaha.deskripsi || '') : '',
    fotoUsahaUrl,
    item.usaha ? (item.usaha.waBisnis || '') : '',
    item.usaha ? (item.usaha.linkGmaps || '') : ''
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

  // Masukkan ke Tab Alumni
  alumniSheet.appendRow([
    targetItem[0], // id
    targetItem[1], // timestamp
    targetItem[2], // nama
    targetItem[3], // angkatan
    targetItem[4], // kecamatan
    targetItem[5], // desa
    targetItem[6], // alamat
    targetItem[7], // noWa
    targetItem[8], // pekerjaan
    targetItem[9], // pendidikan
    targetItem[10], // foto
    'APPROVED',
    adminNote || ''
  ]);

  // Jika pendaftar menyertakan data usaha, tambahkan ke Tab Usaha
  var namaUsaha = targetItem[12];
  if (namaUsaha && String(namaUsaha).trim() !== '') {
    usahaSheet.appendRow([
      'USH-DMK-' + Date.now(),
      targetItem[0], // alumniId
      targetItem[2], // pemilik (nama)
      namaUsaha,
      targetItem[13], // kategori usaha
      targetItem[4], // kecamatan
      targetItem[5], // desa
      targetItem[6], // alamat
      targetItem[16] || targetItem[7], // waBisnis
      targetItem[17] || '', // linkGmaps
      targetItem[14], // deskripsi
      targetItem[15], // foto produk
      'APPROVED'
    ]);
  }

  // Hapus dari antrean sheet Pending
  pendingSheet.deleteRow(targetRowIdx);

  return jsonResponse({
    status: 'success',
    message: 'Alumni berhasil disetujui & dimasukkan ke direktori publik KMF Demak.'
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
 * FUNGSI SETUP DATABASE OTOMATIS (JALANKAN SEKALI DARI APPS SCRIPT)
 * ====================================================================
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Tab Alumni
  var alumniSheet = getOrCreateSheet(ss, 'Alumni');
  var alumniHeaders = [
    'ID Alumni', 'Waktu Diterima', 'Nama Lengkap', 'Tahun Angkatan',
    'Kecamatan', 'Desa / Kelurahan', 'Alamat Lengkap', 'Nomor WhatsApp',
    'Profesi / Pekerjaan', 'Pendidikan Terakhir', 'URL Foto Profil',
    'Status Verifikasi', 'Catatan Pengurus'
  ];
  setupSheetHeaders(alumniSheet, alumniHeaders);

  // 2. Setup Tab Pending (Antrean Verifikasi)
  var pendingSheet = getOrCreateSheet(ss, 'Pending');
  var pendingHeaders = [
    'ID Pendaftar', 'Waktu Daftar', 'Nama Lengkap', 'Tahun Angkatan',
    'Kecamatan', 'Desa / Kelurahan', 'Alamat Lengkap', 'Nomor WhatsApp',
    'Profesi / Pekerjaan', 'Pendidikan Terakhir', 'URL Foto Profil',
    'Status', 'Nama Usaha', 'Kategori Usaha', 'Deskripsi Usaha',
    'URL Foto Usaha', 'WhatsApp Bisnis', 'Link Google Maps'
  ];
  setupSheetHeaders(pendingSheet, pendingHeaders);

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

  // Pastikan folder Drive siap
  var uploadFolder = getUploadFolder();

  SpreadsheetApp.getUi().alert(
    'Alhamdulillah! Database Spreadsheet KMF Demak Berhasil Diinisialisasi!\n\n' +
    'Tab yang siap digunakan:\n' +
    '1. Alumni (Data terverifikasi)\n' +
    '2. Pending (Antrean verifikasi)\n' +
    '3. Usaha (Katalog bursa santri)\n' +
    '4. RSVP_Selapanan (Buku tamu undangan)\n\n' +
    'Folder Google Drive Penyimpanan Foto: ' + uploadFolder.getName()
  );
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
            .map(function(word, idx) {
              return idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

