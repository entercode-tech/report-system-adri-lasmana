// Custom jQuery untuk Lokasi
$(document).ready(function() {
    // Tidak otomatis mendapatkan lokasi saat halaman dimuat
    // Tampilkan pesan default
    $('#coords-text').html('Lokasi akan didapatkan saat membuat laporan<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>');
    
    // Fungsi untuk refresh lokasi
    $('#location-display').on('click', function() {
        $('#coords-text').html('Mendapatkan lokasi...<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Update tampilan lokasi
                    $('#coords-text').html(`${lat.toFixed(6)}, ${lng.toFixed(6)}<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>`);
                    
                    // Simpan ke input hidden
                    $('#location-input').val(`${lat},${lng}`);
                    
                    // Tampilkan notifikasi sukses
                    alertify.success('Lokasi berhasil diperbarui');
                },
                function(error) {
                    let errorMessage = 'Gagal mendapatkan lokasi: ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Izin lokasi ditolak.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Informasi lokasi tidak tersedia.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Permintaan lokasi timeout.';
                            break;
                        case error.UNKNOWN_ERROR:
                            errorMessage += 'Terjadi kesalahan yang tidak diketahui.';
                            break;
                    }
                    
                    $('#coords-text').html(`${errorMessage}<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>`);
                    alertify.error(errorMessage);
                }
            );
        } else {
            $('#coords-text').html('Browser tidak mendukung geolocation.<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>');
            alertify.error('Browser tidak mendukung geolocation.');
        }
    });
});