// Store API Handler for Report System
$(document).ready(function() {
    // Hardcoded API endpoints
    const config = {
        api_report: {
            store: {
                endpoint: "https://ardi-report-system.webentercode.com/api/reports"
            }
        }
    };
    
    // Upload Report Handler
    $('#upload-btn').on('click', function() {
        // Check if button is already disabled (processing)
        if ($(this).prop('disabled')) {
            return;
        }
        
        // Validate form before upload
        if (!validateForm()) {
            return;
        }
        
        // Check if location is available
        const locationValue = $('#location-input').val();
        if (!locationValue || locationValue.trim() === '') {
            alertify.error('Silakan sinkronkan lokasi terlebih dahulu dengan mengklik area lokasi');
            return;
        }
        
        // Submit report directly
        submitReport($(this));
    });
    
    // Function to submit report after getting location
    function submitReport($btn) {
        // Show loading state
        const originalText = '<i data-feather="file-text" class="me-2"></i> Buat Laporan';
        $btn.prop('disabled', true).html('<i class="spinner-border spinner-border-sm me-2"></i> Mengirim...');
        
        // Prepare form data
        const formData = new FormData();
        
        // Add team_id from localStorage
        const teamId = localStorage.getItem('team_id');
        if (teamId) {
            formData.append('team_id', teamId);
        }
        
        // Add form fields
        formData.append('lokasi', $('#location-input').val());
        formData.append('tiang', $('#tiang').val());
        formData.append('pon', $('#pon').val());
        formData.append('ms', $('#ms').val());
        formData.append('odp', $('#odp').val());
        formData.append('redaman_in', $('#redaman-in').val());
        formData.append('redaman_out', $('#redaman-out').val());
        formData.append('notes', $('#keterangan').val());
        
        // Add images
        const totalImages = $('.upload-box.has-image img').length;
        let processedImages = 0;
        
        if (totalImages === 0) {
            // No images, send immediately
            sendFormData(formData, $btn, originalText);
        } else {
            // Process images
            $('.upload-box.has-image img').each(function(index) {
                const imgSrc = $(this).attr('src');
                if (imgSrc && imgSrc.startsWith('data:')) {
                    // Compress image before sending
                    compressImage(imgSrc, 100, 0.8, function(compressedBlob) {
                        // Add mark parameter to indicate position
                        formData.append('images[]', compressedBlob, `image_${index + 1}.jpg`);
                        formData.append('marks[]', `Gambar ${index + 1}`);
                        processedImages++;
                        
                        // Check if all images are processed
                        if (processedImages === totalImages) {
                            sendFormData(formData, $btn, originalText);
                        }
                    });
                } else {
                    // Skip invalid image and check if all are processed
                    processedImages++;
                    if (processedImages === totalImages) {
                        sendFormData(formData, $btn, originalText);
                    }
                }
            });
        }
    }
    
    // Send FormData function
    function sendFormData(formData, $btn, originalText) {
        // Send AJAX request
        $.ajax({
            url: config.api_report.store.endpoint,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('Upload response:', response);
                
                if (response.success) {
                    alertify.success('Laporan berhasil dikirim!');
                    
                    // Reset form after successful upload
                    resetForm();
                    
                    // Refresh reports list if offcanvas is open
                    if ($('#reportsOffcanvas').hasClass('show')) {
                        loadReports();
                    }
                } else {
                    // Handle server-side validation or business logic errors
                    const errorMessage = response.message || 'Gagal mengirim laporan';
                    alertify.error(errorMessage);
                }
            },
            error: function(xhr, status, error) {
                console.error('Upload failed:', xhr.responseText);
                let errorMessage = 'Gagal mengirim laporan';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.status === 422) {
                    errorMessage = 'Data tidak lengkap atau tidak valid';
                } else if (xhr.status === 500) {
                    errorMessage = 'Terjadi kesalahan pada server';
                }
                
                alertify.error(errorMessage);
            },
            complete: function() {
                // Restore button state
                $btn.prop('disabled', false).html('<i data-feather="file-text" class="me-2"></i> Buat Laporan');
                feather.replace();
            }
        });
    }
    
    
    // Utility Functions
    function validateForm() {
        let isValid = true;
        const requiredFields = ['tiang', 'pon', 'ms', 'odp'];
        
        requiredFields.forEach(function(fieldId) {
            const $field = $(`#${fieldId}`);
            if (!$field.val().trim()) {
                $field.addClass('is-invalid');
                isValid = false;
            } else {
                $field.removeClass('is-invalid');
            }
        });
        
        // Check if at least one image is uploaded
        if ($('.upload-box.has-image').length === 0) {
            alertify.error('Harap upload minimal 1 foto');
            isValid = false;
        }
        
        if (!isValid) {
            alertify.error('Harap lengkapi semua field yang wajib diisi');
        }
        
        return isValid;
    }
    
    function resetForm() {
        // Clear form fields
        $('#tiang, #pon, #ms, #odp, #redaman-in, #redaman-out, #keterangan').val('');
        $('#location-input').val('');
        $('#coords-text').html('Klik untuk sinkronkan lokasi<br><small style="display: block; margin-top:5px; opacity: 0.7;"></small>');
        
        // Clear uploaded images
        $('.upload-box').each(function() {
            $(this).removeClass('has-image');
            $(this).find('img').hide().attr('src', '');
            $(this).find('.upload-icon, .upload-text').show();
            $(this).find('.delete-btn').hide();
        });
        
        // Clear file inputs
        $('input[type="file"]').val('');
    }
    
    function dataURLtoBlob(dataURL) {
        // Convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURL.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURL.split(',')[1]);
        } else {
            byteString = unescape(dataURL.split(',')[1]);
        }
        
        // Separate out the mime component
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        
        // Write the bytes of the string to a typed array
        const ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ia], { type: mimeString });
    }
    
    function compressImage(dataURL, maxSizeKB, quality, callback) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions to maintain aspect ratio
            let width = img.width;
            let height = img.height;
            const maxSizeBytes = maxSizeKB * 1024;
            
            // Start with original dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Try to compress with given quality
            let compressedDataURL = canvas.toDataURL('image/jpeg', quality);
            
            // If still too large, reduce quality and try again
            let currentQuality = quality;
            while (compressedDataURL.length > maxSizeBytes && currentQuality > 0.1) {
                currentQuality -= 0.1;
                compressedDataURL = canvas.toDataURL('image/jpeg', currentQuality);
            }
            
            // If still too large, reduce dimensions
            if (compressedDataURL.length > maxSizeBytes) {
                const scaleFactor = Math.sqrt(maxSizeBytes / compressedDataURL.length);
                canvas.width = width * scaleFactor;
                canvas.height = height * scaleFactor;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compressedDataURL = canvas.toDataURL('image/jpeg', 0.7);
            }
            
            // Convert to blob and callback
            const blob = dataURLtoBlob(compressedDataURL);
            callback(blob);
        };
        
        img.src = dataURL;
    }
});