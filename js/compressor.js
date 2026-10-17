/**
 * KMF Demak - Client-Side Image Compressor
 * Mengompres foto profil dan foto usaha langsung di browser HP/Laptop sebelum diunggah
 * Menjaga kualitas tetap jernih sekaligus menghemat kuota dan mempercepat upload
 */

const ImageCompressor = {
    /**
     * Kompres file gambar menggunakan HTML5 Canvas
     * @param {File} file - File gambar dari input file
     * @param {Object} options - Pengaturan kompresi
     * @returns {Promise<{base64: string, blob: Blob, originalSize: number, compressedSize: number, mimeType: string}>}
     */
    compress: function(file, options = {}) {
        const maxWidth = options.maxWidth || 800;
        const maxHeight = options.maxHeight || 800;
        const quality = options.quality || 0.75;
        const outputType = options.outputType || 'image/jpeg';

        return new Promise((resolve, reject) => {
            if (!file || !file.type.match(/image.*/)) {
                return reject(new Error('File yang dipilih bukan gambar yang valid.'));
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function() {
                    let width = img.width;
                    let height = img.height;

                    // Hitung rasio dimensi baru
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
                    // Background putih untuk format PNG transparan yang dikonversi ke JPEG
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL(outputType, quality);

                    canvas.toBlob(function(blob) {
                        resolve({
                            base64: base64,
                            blob: blob,
                            originalSize: file.size,
                            compressedSize: blob ? blob.size : Math.round(base64.length * 0.75),
                            mimeType: outputType,
                            width: width,
                            height: height
                        });
                    }, outputType, quality);
                };

                img.onerror = function(err) {
                    reject(new Error('Gagal memproses gambar.'));
                };
            };

            reader.onerror = function(err) {
                reject(new Error('Gagal membaca file gambar.'));
            };
        });
    },

    /**
     * Format ukuran byte ke string human-readable (KB / MB)
     */
    formatBytes: function(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};

if (typeof window !== 'undefined') {
    window.ImageCompressor = ImageCompressor;
}
