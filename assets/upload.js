// Custom jQuery untuk Upload Gambar
$(document).ready(function() {
    // Set atribut capture untuk semua perangkat (mobile & desktop)
    $('.upload-box input[type="file"]').attr('capture', 'environment');
    
    // Fungsi untuk preview gambar saat file dipilih
    $(document).on('change', '.upload-box input[type="file"]', function() {
        const file = this.files[0];
        const uploadBox = $(this).closest('.upload-box');
        const img = uploadBox.find('img');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                img.attr('src', e.target.result);
                img.show();
                uploadBox.addClass('has-image');
                uploadBox.find('.upload-icon, .upload-text').hide();
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Fungsi untuk hapus gambar
    $(document).on('click', '.delete-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = $(this).closest('.upload-box');
        const img = uploadBox.find('img');
        const fileInput = uploadBox.find('input[type="file"]');
        
        img.attr('src', '');
        img.hide();
        uploadBox.removeClass('has-image');
        uploadBox.find('.upload-icon, .upload-text').show();
        fileInput.val('');
    });
});