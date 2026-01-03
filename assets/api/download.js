// Download API Handler for Report System
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
    
    // Download Report Handler
    $(document).on('click', '.download-report-btn', function() {
        const reportId = $(this).data('id');
        
        if (!reportId) {
            alertify.error('ID laporan tidak ditemukan');
            return;
        }
        
        // Get report data from the list item
        const $reportItem = $(this).closest('.report-item');
        const reportData = extractReportData($reportItem);
        
        if (reportData) {
            // Pass data to download-excel.js function
            if (typeof downloadExcel === 'function') {
                downloadExcel(reportData);
            } else {
                console.error('downloadExcel function not found');
                alertify.error('Fungsi download tidak tersedia');
            }
        } else {
            alertify.error('Data laporan tidak lengkap');
        }
    });
    
    // Extract report data from DOM
    function extractReportData($reportItem) {
        try {
            // Get basic info from the report item
            const reportId = $reportItem.data('id');
            const title = $reportItem.find('.report-title').text().trim();
            const date = $reportItem.find('.report-date').text().trim();
            const location = $reportItem.find('.report-location').text().trim();
            
            // Get detailed report data from API
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: config.api_report.get_all.endpoint,
                    type: 'GET',
                    data: { team_id: localStorage.getItem('team_id') },
                    success: function(response) {
                        if (response.success && response.data) {
                            // Find the specific report
                            const report = response.data.find(r => r.id == reportId);
                            if (report) {
                                // Prepare data for Excel download
                                const excelData = {
                                    id: report.id,
                                    team_id: report.team_id,
                                    lokasi: report.lokasi,
                                    tiang: report.tiang,
                                    pon: report.pon,
                                    ms: report.ms,
                                    odp: report.odp,
                                    redaman_in: report.redaman_in,
                                    redaman_out: report.redaman_out,
                                    notes: report.notes,
                                    created_at: report.created_at,
                                    updated_at: report.updated_at,
                                    images: report.images || []
                                };
                                resolve(excelData);
                            } else {
                                reject('Report not found in API response');
                            }
                        } else {
                            reject('Failed to get report details');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Failed to get report details:', xhr.responseText);
                        reject('Failed to get report details');
                    }
                });
            });
        } catch (error) {
            console.error('Error extracting report data:', error);
            return null;
        }
    }
});