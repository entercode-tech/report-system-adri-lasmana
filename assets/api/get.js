// Get API Handler for Report System
$(document).ready(function() {
    // Hardcoded API endpoints
    const config = {
        api_report: {
            get_all: {
                endpoint: "https://ardi-report-system.webentercode.com/api/reports"
            }
        }
    };
    
    // Load Reports Handler
    window.loadReports = function() {
        const teamId = localStorage.getItem('team_id');
        
        if (!teamId) {
            console.warn('No team_id found');
            $('.reports-list').html('<div class="text-center py-4 text-muted">Team ID tidak ditemukan</div>');
            return;
        }
        
        // Show loading state
        $('.reports-list').html('<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        
        $.ajax({
            url: config.api_report.get_all.endpoint,
            type: 'GET',
            data: { team_id: teamId },
            success: function(response) {
                console.log('Reports response:', response);
                
                if (response.success) {
                    renderReports(response.data || []);
                } else {
                    const errorMessage = response.message || 'Gagal memuat daftar laporan';
                    alertify.error(errorMessage);
                    
                    // Show empty state on error
                    $('.reports-list').html('<div class="text-center py-4 text-muted">Gagal memuat laporan</div>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load reports:', xhr.responseText);
                let errorMessage = 'Gagal memuat daftar laporan';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                alertify.error(errorMessage);
                
                // Show error state
                $('.reports-list').html('<div class="text-center py-4 text-muted">Gagal memuat laporan</div>');
            }
        });
    };
    
    // Render Reports in Offcanvas
    function renderReports(reports) {
        const $reportsList = $('.reports-list');
        $reportsList.empty();
        
        if (!reports || reports.length === 0) {
            $reportsList.html('<div class="text-center py-4 text-muted">Belum ada laporan</div>');
            return;
        }
        
        reports.forEach(function(report) {
            const reportDate = new Date(report.created_at || report.date).toLocaleString('id-ID');
            const reportItem = `
                <div class="report-item" data-id="${report.id}">
                    <div class="report-icon">
                        <i data-feather="file-text"></i>
                    </div>
                    <div class="report-content">
                        <div class="report-date">${reportDate}</div>
                        <div class="report-title">${report.tiang || 'N/A'}</div>
                        <div class="report-location">${report.lokasi || 'N/A'}</div>
                        <div class="report-actions">
                            <button class="btn btn-sm btn-outline-primary download-report-btn" data-id="${report.id}">Download</button>
                            <button class="btn btn-sm btn-outline-danger delete-report-btn" data-id="${report.id}">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
            $reportsList.append(reportItem);
        });
        
        // Re-initialize feather icons
        feather.replace();
    }
    
    // Load reports when offcanvas is shown
    $('#reportsOffcanvas').on('shown.bs.offcanvas', function() {
        loadReports();
    });
});