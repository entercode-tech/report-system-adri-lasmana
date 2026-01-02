document.addEventListener('DOMContentLoaded', function() {
    // Event listener untuk tombol download
    document.getElementById('download-excel-btn').addEventListener('click', function(e) {
        e.preventDefault();
        exportToExcel();
    });
});

async function exportToExcel() {
    try {
        console.log('Memulai proses export Excel dengan ExcelJS...');
        
        // Variable untuk mengatur lebar gambar (dalam pixels)
        const IMAGE_WIDTH_PX = 300; // Ubah nilai ini untuk mengatur lebar gambar
        
        // Variable untuk mengatur tambahan lebar kolom (dalam persen)
        const COLUMN_WIDTH_EXTRA_PERCENT = 0; // Ubah nilai ini untuk mengatur tambahan lebar (5 = 5%)
        
        // Konversi pixels ke Excel column width (1 pixel ≈ 0.125 Excel units)
        // Tambahkan persentase tambahan untuk memberikan ruang ekstra
        const EXCEL_COLUMN_WIDTH = IMAGE_WIDTH_PX * 0.125 * (1 + COLUMN_WIDTH_EXTRA_PERCENT / 100);
        
        // Buat workbook baru
        const workbook = new ExcelJS.Workbook();
        let worksheet;
        
        // Coba muat template jika ada
        try {
            console.log('Mencoba memuat template Excel...');
            const response = await fetch('assets/template.xlsx');
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                await workbook.xlsx.load(arrayBuffer);
                console.log('Template berhasil dimuat');
                worksheet = workbook.getWorksheet(1);
            } else {
                throw new Error('Template tidak ditemukan');
            }
        } catch (templateError) {
            console.log('Template tidak dapat dimuat, membuat worksheet baru:', templateError.message);
            worksheet = workbook.addWorksheet('Laporan');
            
            // Buat struktur dasar
            worksheet.getCell('E1').value = 'INFORMATION';
            worksheet.getCell('F1').value = 'INFORMATION';
            worksheet.getCell('G1').value = 'INFORMATION';
            worksheet.getCell('H1').value = 'INFORMATION';
            worksheet.getCell('I1').value = 'INFORMATION';
            
            worksheet.getCell('E2').value = 'LOKASI';
            worksheet.getCell('E3').value = 'TIANG';
            worksheet.getCell('E4').value = 'PON';
            worksheet.getCell('E5').value = 'MS';
            worksheet.getCell('E6').value = 'ODP';
            worksheet.getCell('E7').value = 'REDAMAN IN';
            worksheet.getCell('E8').value = 'REDAMAN OUT';
        }
        
        // Kumpulkan data dari form
        console.log('Mengumpulkan data dari form...');
        const formData = collectFormData();
        console.log('Data form:', formData);
        
        // Tempatkan data pada sel spesifik
        console.log('Menempatkan data pada sel spesifik...');
        worksheet.getCell('F2').value = formData['Lokasi'];
        worksheet.getCell('F3').value = formData['Tiang'];
        worksheet.getCell('F4').value = formData['PON'];
        worksheet.getCell('F5').value = formData['MS'];
        worksheet.getCell('F6').value = formData['ODP'];
        worksheet.getCell('F7').value = formData['Redaman In'];
        worksheet.getCell('F8').value = formData['Redaman Out'];
        console.log('Data form berhasil ditempatkan');
        
        // Kumpulkan data gambar
        console.log('Mengumpulkan data gambar...');
        const imageData = collectImageData();
        console.log('Data gambar:', imageData);
        
        // Proses dan sisipkan gambar
        for (let i = 0; i < imageData.length; i++) {
            const image = imageData[i];
            if (image && image.Path) {
                try {
                    console.log(`Memproses gambar ${i + 1}...`);
                    
                    // Dapatkan dimensi asli gambar
                    const imageDimensions = await getImageDimensions(image.Path);
                    
                    // Hitung ukuran gambar berdasarkan variable lebar yang diinginkan
                    // Gunakan lebar dari variable dan pertahankan rasio
                    const aspectRatio = imageDimensions.width / imageDimensions.height;
                    const calculatedWidth = IMAGE_WIDTH_PX;
                    const calculatedHeight = calculatedWidth / aspectRatio;
                    
                    console.log(`Gambar asli: ${imageDimensions.width}x${imageDimensions.height}, Ukuran baru: ${calculatedWidth}x${calculatedHeight} (lebar diset: ${IMAGE_WIDTH_PX}px)`);
                    
                    // Konversi base64 ke binary string untuk browser
                    const base64Data = image.Path.replace(/^data:image\/[a-z]+;base64,/, '');
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    
                    for (let j = 0; j < binaryString.length; j++) {
                        bytes[j] = binaryString.charCodeAt(j);
                    }
                    
                    // Tambahkan gambar ke workbook
                    const imageId = workbook.addImage({
                        buffer: bytes,
                        extension: getImageExtension(image.Path)
                    });
                    
                    // Tentukan kolom berdasarkan index gambar
                    const column = String.fromCharCode(65 + i); // A, B, C, D
                    
                    // Tambahkan gambar ke worksheet dengan ukuran yang diinginkan
                    worksheet.addImage(imageId, {
                        tl: { col: i, row: 0 }, // Kolom A-D, baris 1
                        ext: { width: calculatedWidth, height: calculatedHeight }
                    });
                    
                    // JANGAN ubah tinggi baris - pertahankan ukuran cell dari template
                    // Gambar akan menyesuaikan dengan ukuran cell yang ada
                    
                    console.log(`Gambar ${i + 1} berhasil ditambahkan ke kolom ${column} dengan ukuran ${calculatedWidth}x${calculatedHeight} (lebar diset: ${IMAGE_WIDTH_PX}px)`);
                } catch (imageError) {
                    console.error(`Error memproses gambar ${i + 1}:`, imageError);
                    // Fallback: simpan path sebagai teks
                    const column = String.fromCharCode(65 + i);
                    worksheet.getCell(`${column}1`).value = 'Error loading image';
                }
            }
        }
        
        // Atur lebar kolom gambar sesuai dengan IMAGE_WIDTH_PX
        worksheet.getColumn(1).width = EXCEL_COLUMN_WIDTH; // A
        worksheet.getColumn(2).width = EXCEL_COLUMN_WIDTH; // B
        worksheet.getColumn(3).width = EXCEL_COLUMN_WIDTH; // C
        worksheet.getColumn(4).width = EXCEL_COLUMN_WIDTH; // D
        
        // Kolom lainnya tetap default
        worksheet.getColumn(5).width = 15; // E
        worksheet.getColumn(6).width = 20; // F
        worksheet.getColumn(7).width = 15; // G
        worksheet.getColumn(8).width = 15; // H
        worksheet.getColumn(9).width = 15; // I
        
        console.log(`Lebar kolom gambar diset ke ${EXCEL_COLUMN_WIDTH} Excel units (sesuai ${IMAGE_WIDTH_PX}px)`);
        
        // Opsional: Merge area gambar (A1:A8, B1:B8, C1:C8, D1:D8) untuk visual yang lebih baik
        // Comment out jika tidak ingin merge atau jika template sudah memiliki merge
        /*
        for (let i = 0; i < imageData.length; i++) {
            const column = String.fromCharCode(65 + i); // A, B, C, D
            try {
                // Cek apakah area sudah di-merge
                const cell = worksheet.getCell(`${column}1`);
                if (!cell.isMerged) {
                    worksheet.mergeCells(`${column}1:${column}8`);
                    console.log(`Area ${column}1:${column}8 berhasil di-merge`);
                } else {
                    console.log(`Area ${column}1:${column}8 sudah di-merge sebelumnya`);
                }
            } catch (mergeError) {
                console.log(`Tidak bisa merge area ${column}1:${column}8:`, mergeError.message);
                // Lanjutkan tanpa merge, gambar tetap akan ditampilkan
            }
        }
        */
        
        // Generate nama file dengan timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `laporan-lapangan-${timestamp}.xlsx`;
        console.log('Nama file:', fileName);
        
        // Download file Excel
        console.log('Mengunduh file Excel...');
        
        // Tulis workbook ke buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Buat blob dan download
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        console.log('File Excel berhasil diunduh');
        
        // Tampilkan notifikasi sukses
        if (typeof alertify !== 'undefined') {
            alertify.success('Data berhasil diunduh ke file Excel!');
        } else {
            console.log('Data berhasil diunduh ke file Excel!');
        }
    } catch (error) {
        console.error('Error saat export Excel:', error);
        if (typeof alertify !== 'undefined') {
            alertify.error('Terjadi kesalahan saat mengunduh file Excel. Error: ' + error.message);
        }
    }
}

function getImageExtension(base64String) {
    // Ekstrak ekstensi dari base64 string
    const match = base64String.match(/^data:image\/([a-z]+);base64,/);
    return match ? match[1] : 'jpeg';
}

function getImageDimensions(base64String) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            resolve({
                width: this.width,
                height: this.height
            });
        };
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        img.src = base64String;
    });
}

function collectFormData() {
    return {
        'Lokasi': document.getElementById('location-input').value || document.getElementById('coords-text').textContent,
        'Tiang': document.getElementById('tiang').value,
        'PON': document.getElementById('pon').value,
        'MS': document.getElementById('ms').value,
        'ODP': document.getElementById('odp').value,
        'Redaman In': document.getElementById('redaman-in').value,
        'Redaman Out': document.getElementById('redaman-out').value,
        'Tanggal': new Date().toLocaleString('id-ID')
    };
}

function collectImageData() {
    const imageData = [];
    
    // Loop melalui semua upload box
    for (let i = 1; i <= 4; i++) {
        const uploadBox = document.querySelector(`.upload-box[data-index="${i}"]`);
        const img = uploadBox.querySelector('img');
        
        if (img && img.src && img.style.display !== 'none') {
            imageData.push({
                'No': i,
                'Nama File': img.src.split('/').pop() || `Gambar ${i}`,
                'Path': img.src
            });
        }
    }
    
    return imageData;
}