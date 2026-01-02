document.addEventListener('DOMContentLoaded', function() {
    // Event listener untuk tombol download
    document.getElementById('download-excel-btn').addEventListener('click', function(e) {
        e.preventDefault();
        exportToExcel();
    });
});

function exportToExcel() {
    try {
        // Buat workbook baru
        const wb = XLSX.utils.book_new();
        
        // Kumpulkan data dari form
        const formData = collectFormData();
        
        // Buat array of arrays untuk worksheet form
        const wsForm_data = [];
        for (const [key, value] of Object.entries(formData)) {
            // Batasi panjang teks untuk menghindari error 32767 karakter
            const truncatedValue = truncateText(String(value), 3000);
            wsForm_data.push([key, truncatedValue]);
        }
        
        // Buat worksheet dari array
        const wsForm = XLSX.utils.aoa_to_sheet(wsForm_data);
        
        // Atur lebar kolom untuk worksheet form
        const colWidths = [
            { wch: 20 }, // Kolom pertama (label)
            { wch: 30 }  // Kolom kedua (nilai)
        ];
        wsForm['!cols'] = colWidths;
        
        // Tambahkan worksheet ke workbook
        XLSX.utils.book_append_sheet(wb, wsForm, "Data Laporan");
        
        // Kumpulkan data gambar
        const imageData = collectImageData();
        
        if (imageData.length > 0) {
            // Buat array of arrays untuk worksheet gambar
            const wsImages_data = [['No', 'Nama File', 'Path']];
            imageData.forEach(item => {
                wsImages_data.push([
                    item['No'],
                    truncateText(String(item['Nama File']), 100),
                    truncateText(String(item['Path']), 3000)
                ]);
            });
            
            // Buat worksheet dari array
            const wsImages = XLSX.utils.aoa_to_sheet(wsImages_data);
            
            // Atur lebar kolom untuk worksheet gambar
            wsImages['!cols'] = [
                { wch: 15 }, // No
                { wch: 30 }, // Nama File
                { wch: 50 }  // Path
            ];
            
            // Tambahkan worksheet gambar ke workbook
            XLSX.utils.book_append_sheet(wb, wsImages, "Data Gambar");
        }
        
        // Generate nama file dengan timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `laporan-lapangan-${timestamp}.xlsx`;
        
        // Download file Excel
        XLSX.writeFile(wb, fileName);
        
        // Tampilkan notifikasi sukses
        if (typeof alertify !== 'undefined') {
            alertify.success('Data berhasil diunduh ke file Excel!');
        } else {
            console.log('Data berhasil diunduh ke file Excel!');
        }
    } catch (error) {
        console.error('Error saat export Excel:', error);
        if (typeof alertify !== 'undefined') {
            alertify.error('Terjadi kesalahan saat mengunduh file Excel.');
        }
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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