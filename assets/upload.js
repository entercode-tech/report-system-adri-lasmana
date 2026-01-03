// Custom jQuery untuk Upload Gambar
$(document).ready(function() {
    let currentInput = null;
    
    // Fungsi untuk menampilkan modal saat upload diklik
    $(document).on('click', '.upload-label', function(e) {
        e.preventDefault();
        const uploadBox = $(this).closest('.upload-box');
        
        // Jika sudah ada gambar, jangan tampilkan modal
        if (uploadBox.hasClass('has-image')) {
            return;
        }
        
        currentInput = uploadBox.find('input[type="file"]');
        $('#cameraModal').modal('show');
    });
    
    // Fungsi untuk kamera
    $(document).on('click', '.camera-btn', function() {
        if (currentInput) {
            currentInput.attr('capture', 'environment');
            currentInput.click();
        }
        $('#cameraModal').modal('hide');
    });
    
    // Fungsi untuk galeri
    $(document).on('click', '.gallery-btn', function() {
        if (currentInput) {
            currentInput.removeAttr('capture');
            currentInput.click();
        }
        $('#cameraModal').modal('hide');
    });
    
    // Re-initialize feather icons after modal content changes
    $('#cameraModal').on('shown.bs.modal', function () {
        feather.replace();
    });
    
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
    
    // Fungsi untuk preview gambar saat file dipilih (khusus untuk tombol utama)
    $(document).on('change', '.upload-box-main input[type="file"]', function() {
        const file = this.files[0];
        const uploadBox = $(this).closest('.upload-box-main');
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
    
    // Fungsi untuk hapus gambar (khusus untuk tombol utama)
    $(document).on('click', '.upload-box-main .delete-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = $(this).closest('.upload-box-main');
        const img = uploadBox.find('img');
        const fileInput = uploadBox.find('input[type="file"]');
        
        img.attr('src', '');
        img.hide();
        uploadBox.removeClass('has-image');
        uploadBox.find('.upload-icon, .upload-text').show();
        fileInput.val('');
    });
});