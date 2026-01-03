// Delete API Handler for Report System
$(document).ready(function() {
    // Load configuration
    let config = {};
    
    // Load config from config.json
    $.getJSON('config.json')
        .done(function(data) {
            config = data;
            console.log('Configuration loaded successfully');
        })
        .fail(function() {
            console.error('Failed to load configuration');
            alertify.error('Gagal memuat konfigurasi');
        });
    
    // Delete Report Handler
    $(document).on('click', '.delete-report-btn', function() {
        const reportId = $(this).data('id');
        
        if (!reportId) {
            alertify.error('ID laporan tidak ditemukan');
            return;
        }
        
        alertify.confirm(
            'Hapus Laporan',
            'Apakah Anda yakin ingin menghapus laporan ini?',
            function() {
                // User confirmed
                deleteReport(reportId);
            },
            function() {
                // User cancelled
            }
        );
    });
    
    // Delete Report Function
    function deleteReport(reportId) {
        const endpoint = config.api_report.delete.endpoint.replace(':id', reportId);
        
        $.ajax({
            url: endpoint,
            type: 'DELETE',
            success: function(response) {
                console.log('Delete response:', response);
                
                if (response.success) {
                    alertify.success('Laporan berhasil dihapus');
                    
                    // Remove item from DOM
                    $(`.report-item[data-id="${reportId}"]`).fadeOut(300, function() {
                        $(this).remove();
                    });
                } else {
                    const errorMessage = response.message || 'Gagal menghapus laporan';
                    alertify.error(errorMessage);
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to delete report:', xhr.responseText);
                let errorMessage = 'Gagal menghapus laporan';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                alertify.error(errorMessage);
            }
        });
    }
});