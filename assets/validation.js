// Custom jQuery untuk Validasi Form
$(document).ready(function() {
    // Fungsi untuk simpan laporan
    $(document).on('click', '#save-report-btn', function() {
        // Validasi form
        let isValid = true;
        let errorMessage = '';
        
        // Cek apakah ada gambar yang diupload
        let hasImage = false;
        $('.upload-box').each(function() {
            if ($(this).find('img').is(':visible') && $(this).find('img').attr('src') !== '') {
                hasImage = true;
                return false; // break loop
            }
        });
        
        if (!hasImage) {
            isValid = false;
            errorMessage += 'Harap upload minimal satu gambar. ';
        }
        
        // Cek lokasi
        const location = $('#location-input').val();
        if (!location || location === '') {
            isValid = false;
            errorMessage += 'Lokasi tidak tersedia, harap tunggu atau refresh lokasi. ';
        }
        
        // Cek field wajib lainnya
        if ($('#tiang').val() === '') {
            isValid = false;
            errorMessage += 'Nomor Tiang harus diisi. ';
        }
        
        if ($('#pon').val() === '') {
            isValid = false;
            errorMessage += 'Nomor PON harus diisi. ';
        }
        
        if (!isValid) {
            alertify.error(errorMessage);
            return;
        }
        
        // Jika valid, tampilkan notifikasi sukses
        alertify.success('Laporan berhasil disimpan!');
        
        // Di sini bisa ditambahkan kode untuk mengirim data ke server
        // Misalnya menggunakan AJAX
    });
});