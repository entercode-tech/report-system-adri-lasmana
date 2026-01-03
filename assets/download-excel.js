// Global function for downloading Excel
window.downloadExcel = function(reportData) {
    console.log('Download Excel called with data:', reportData);
    exportToExcelWithData(reportData);
};

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
        
        // Tempatkan data pada sel spesifik sesuai template baru
        console.log('Menempatkan data pada sel spesifik sesuai template...');
        
        // Data form di sebelah kanan (H2:K8)
        worksheet.getCell('H2').value = formData['Lokasi'];
        worksheet.getCell('H3').value = formData['Tiang'];
        worksheet.getCell('H4').value = formData['PON'];
        worksheet.getCell('H5').value = formData['MS'];
        worksheet.getCell('H6').value = formData['ODP'];
        worksheet.getCell('H7').value = formData['Redaman In'];
        worksheet.getCell('H8').value = formData['Redaman Out'];
        
        // Keterangan di G10:K18 (merged cell)
        worksheet.getCell('G10').value = formData['Keterangan'];
        
        console.log('Data form berhasil ditempatkan');
        
        // Kumpulkan data gambar
        console.log('Mengumpulkan data gambar...');
        const imageData = collectImageData();
        console.log('Data gambar:', imageData);
        
        // Proses dan sisipkan gambar sesuai template baru
        // foto 1 = A1:A18 (merged cell)
        // foto 2 = C1:C9 (merged cell)
        // foto 3 = E1:E9 (merged cell)
        // foto 4 = C10:C18 (merged cell)
        // foto 5 = E10:E18 (merged cell)
        
        for (let i = 0; i < imageData.length; i++) {
            const image = imageData[i];
            if (image && image.Path) {
                try {
                    console.log(`Memproses gambar ${i + 1}...`);
                    
                    // Dapatkan dimensi asli gambar
                    const imageDimensions = await getImageDimensions(image.Path);
                    
                    // Tentukan posisi dan ukuran berdasarkan index gambar
                    let column, rowStart, rowEnd, columnLetter;
                    
                    switch(i) {
                        case 0: // Foto 1 = A1:A18
                            column = 0; // A
                            columnLetter = 'A';
                            rowStart = 0; // Row 1
                            rowEnd = 17; // Row 18
                            break;
                        case 1: // Foto 2 = C1:C9
                            column = 2; // C
                            columnLetter = 'C';
                            rowStart = 0; // Row 1
                            rowEnd = 8; // Row 9
                            break;
                        case 2: // Foto 3 = E1:E9
                            column = 4; // E
                            columnLetter = 'E';
                            rowStart = 0; // Row 1
                            rowEnd = 8; // Row 9
                            break;
                        case 3: // Foto 4 = C10:C18
                            column = 2; // C
                            columnLetter = 'C';
                            rowStart = 9; // Row 10
                            rowEnd = 17; // Row 18
                            break;
                        case 4: // Foto 5 = E10:E18
                            column = 4; // E
                            columnLetter = 'E';
                            rowStart = 9; // Row 10
                            rowEnd = 17; // Row 18
                            break;
                        default:
                            continue; // Skip jika index tidak valid
                    }
                    
                    // Hitung tinggi total dari merged cell (dalam baris)
                    const totalRows = rowEnd - rowStart + 1;
                    
                    // Dapatkan tinggi baris default (dalam points)
                    // Excel default row height adalah 15 points, tapi kita cek dari template
                    const defaultRowHeight = 15; // points
                    
                    // Konversi tinggi baris ke pixels (1 point ≈ 1.33 pixels)
                    const cellHeightPx = totalRows * defaultRowHeight * 1.33;
                    
                    // Hitung aspect ratio gambar
                    const aspectRatio = imageDimensions.width / imageDimensions.height;
                    
                    // Tentukan tinggi gambar agar sesuai dengan tinggi merged cell
                    const calculatedHeight = cellHeightPx;
                    
                    // Hitung lebar gambar berdasarkan aspect ratio dan tinggi yang sudah ditentukan
                    const calculatedWidth = calculatedHeight * aspectRatio;
                    
                    // Konversi lebar gambar ke Excel units (1 Excel unit ≈ 7.4 pixels)
                    const columnWidth = calculatedWidth / 7.4;
                    
                    // Atur lebar kolom agar sesuai dengan lebar gambar
                    worksheet.getColumn(column + 1).width = columnWidth;
                    
                    console.log(`Gambar ${i + 1} (${columnLetter}):`);
                    console.log(`  Tinggi merged cell: ${totalRows} baris = ${cellHeightPx}px`);
                    console.log(`  Gambar asli: ${imageDimensions.width}x${imageDimensions.height}`);
                    console.log(`  Ukuran baru: ${calculatedWidth.toFixed(2)}x${calculatedHeight.toFixed(2)}px`);
                    console.log(`  Lebar kolom diatur ke: ${columnWidth.toFixed(2)} Excel units`);
                    
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
                    
                    // Tambahkan gambar ke worksheet dengan ukuran dan posisi yang diinginkan
                    worksheet.addImage(imageId, {
                        tl: { col: column, row: rowStart },
                        ext: { width: calculatedWidth, height: calculatedHeight }
                    });
                    
                    console.log(`Gambar ${i + 1} berhasil ditambahkan ke kolom ${columnLetter} baris ${rowStart + 1}-${rowEnd + 1}`);
                } catch (imageError) {
                    console.error(`Error memproses gambar ${i + 1}:`, imageError);
                    // Fallback: simpan path sebagai teks
                    let fallbackColumn, fallbackRow;
                    switch(i) {
                        case 0: // Foto 1 = A1:A18
                            fallbackColumn = 'A';
                            fallbackRow = 1;
                            break;
                        case 1: // Foto 2 = C1:C9
                            fallbackColumn = 'C';
                            fallbackRow = 1;
                            break;
                        case 2: // Foto 3 = E1:E9
                            fallbackColumn = 'E';
                            fallbackRow = 1;
                            break;
                        case 3: // Foto 4 = C10:C18
                            fallbackColumn = 'C';
                            fallbackRow = 10;
                            break;
                        case 4: // Foto 5 = E10:E18
                            fallbackColumn = 'E';
                            fallbackRow = 10;
                            break;
                        default:
                            fallbackColumn = 'A';
                            fallbackRow = 1;
                    }
                    worksheet.getCell(`${fallbackColumn}${fallbackRow}`).value = 'Error loading image';
                }
            }
        }
        
        // JANGAN ubah lebar kolom gambar - gunakan lebar dari template
        // Kolom A-D akan menggunakan lebar yang sudah ada di template
        console.log('Menggunakan lebar kolom dari template untuk gambar 100%');
        
        // Kolom lainnya tetap default
        worksheet.getColumn(5).width = 15; // E
        worksheet.getColumn(6).width = 20; // F
        worksheet.getColumn(7).width = 15; // G
        worksheet.getColumn(8).width = 15; // H
        worksheet.getColumn(9).width = 15; // I
        
        console.log('Menggunakan lebar kolom dari template untuk gambar 100%');
        
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
        
        // Download file Excel di tab baru
        console.log('Mengunduh file Excel di tab baru...');
        
        // Tulis workbook ke buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Buat blob dan buka di tab baru
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        
        // Buka di tab baru
        window.open(url, '_blank');
        
        // Cleanup setelah beberapa saat
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        console.log('File Excel berhasil diunduh');
        
        // Tampilkan notifikasi sukses
        if (typeof alertify !== 'undefined') {
            alertify.success('File Excel berhasil dibuka di tab baru!');
        } else {
            console.log('File Excel berhasil dibuka di tab baru!');
        }
    } catch (error) {
        console.error('Error saat export Excel:', error);
        if (typeof alertify !== 'undefined') {
            alertify.error('Terjadi kesalahan saat membuka file Excel di tab baru. Error: ' + error.message);
        }
    }
}

function getImageExtension(base64String) {
    // Ekstrak ekstensi dari base64 string
    const match = base64String.match(/^data:image\/([a-z]+);base64,/);
    return match ? match[1] : 'jpeg';
}

function getImageExtensionFromUrl(url) {
    // Ekstrak ekstensi dari URL
    const parts = url.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
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

function getImageDimensionsFromBlob(blob) {
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
        img.src = URL.createObjectURL(blob);
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
        'Keterangan': document.getElementById('keterangan').value,
        'Tanggal': new Date().toLocaleString('id-ID')
    };
}

function collectImageData() {
    const imageData = [];
    
    // Loop melalui semua upload box (sekarang 5 foto)
    for (let i = 1; i <= 5; i++) {
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