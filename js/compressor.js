/**
 * KMF Demak - Client-Side Image Compressor (v2.6.0)
 * Mengompres foto profil santri dan foto usaha langsung di browser HP/Laptop sebelum diunggah.
 * Menjaga kualitas tetap tajam sekaligus menghemat kuota dan mempercepat pengiriman formulir.
 */

const ImageCompressor = {
    /**
     * Kompres file gambar menggunakan HTML5 Canvas dengan fallback cerdas
     * @param {File|Blob} file - File gambar dari input file
     * @param {Object} options - Pengaturan kompresi (maxWidth, maxHeight, quality, outputType)
     * @returns {Promise<{dataUrl: string, base64: string, blob: Blob, originalSize: number, newSize: number, compressedSize: number, ratio: number, mimeType: string}>}
     */
    compress: function(file, options = {}) {
        const maxWidth = options.maxWidth || 800;
        const maxHeight = options.maxHeight || 800;
        const quality = options.quality || 0.75;
        const outputType = options.outputType || 'image/jpeg';

        return new Promise((resolve, reject) => {
            if (!file) {
                return reject(new Error('Tidak ada file gambar yang dipilih.'));
            }

            // Fungsi Fallback pembacaan data URL langsung jika canvas gagal (misal: format khusus kamera HP)
            const fallbackDirectRead = () => {
                const readerFallback = new FileReader();
                readerFallback.onload = function(evt) {
                    const dataUrl = evt.target.result;
                    resolve({
                        dataUrl: dataUrl,
                        base64: dataUrl,
                        blob: file,
                        originalSize: file.size,
                        newSize: file.size,
                        compressedSize: file.size,
                        ratio: 0,
                        mimeType: file.type || outputType,
                        width: 0,
                        height: 0
                    });
                };
                readerFallback.onerror = function() {
                    reject(new Error('Gagal membaca file gambar dari perangkat.'));
                };
                readerFallback.readAsDataURL(file);
            };

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function() {
                    try {
                        let width = img.width || 800;
                        let height = img.height || 800;

                        // Hitung rasio proporsional dimensi baru
                        if (width > height) {
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = Math.round((width * maxHeight) / height);
                                height = maxHeight;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return fallbackDirectRead();
                        }

                        // Background putih untuk foto PNG transparan yang dikonversi ke JPEG
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                        ctx.drawImage(img, 0, 0, width, height);

                        const base64 = canvas.toDataURL(outputType, quality);
                        const estSize = Math.round(base64.length * 0.75);

                        canvas.toBlob(function(blob) {
                            const newSize = blob ? blob.size : estSize;
                            const ratio = file.size > 0 ? Math.max(0, (file.size - newSize) / file.size) : 0;

                            resolve({
                                dataUrl: base64,
                                base64: base64,
                                blob: blob,
                                originalSize: file.size,
                                newSize: newSize,
                                compressedSize: newSize,
                                ratio: ratio,
                                mimeType: outputType,
                                width: width,
                                height: height
                            });
                        }, outputType, quality);

                    } catch (canvasErr) {
                        console.warn('[ImageCompressor] Canvas gagal, beralih ke pembacaan langsung:', canvasErr);
                        fallbackDirectRead();
                    }
                };

                img.onerror = function(imgErr) {
                    console.warn('[ImageCompressor] Image element gagal decode, gunakan raw file:', imgErr);
                    fallbackDirectRead();
                };
            };

            reader.onerror = function(readerErr) {
                console.error('[ImageCompressor] FileReader gagal:', readerErr);
                reject(new Error('Gagal membaca file gambar dari media penyimpanan.'));
            };
        });
    },

    /**
     * Alias method untuk kompatibilitas penuh dengan kode aplikasi
     */
    compressImage: function(file, options = {}) {
        return this.compress(file, options);
    },

    /**
     * Format ukuran byte ke string teks yang mudah dibaca (KB / MB)
     */
    formatBytes: function(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};

// Ekspor ganda ke Window agar ImageCompressor dan KMF_COMPRESSOR keduanya valid
if (typeof window !== 'undefined') {
    window.ImageCompressor = ImageCompressor;
    window.KMF_COMPRESSOR = ImageCompressor;
}
