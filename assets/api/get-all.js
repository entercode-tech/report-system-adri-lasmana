// Get All API Handler for Report System (for download.html)
$(document).ready(function() {
    console.log('get-all.js loaded');
    
    // Hardcoded API endpoints
    const config = {
        api_report: {
            get_all: {
                endpoint: "https://ardi-report-system.webentercode.com/api/reports"
            }
        }
    };
    
    // Global variable to store reports data
    window.reportsData = [];
    
    // Load All Reports Handler for download.html (without team_id)
    window.loadAllReports = function() {
        console.log('Loading all reports from API...');
        console.log('Checking if loadAllReports function exists...');
        console.log('loadAllReports function:', typeof loadAllReports);
        
        // Show loading state
        $('.reports-list').html('<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        
        $.ajax({
            url: config.api_report.get_all.endpoint,
            type: 'GET',
            data: {},
            success: function(response) {
                console.log('All reports response:', response);
                console.log('Reports data:', response.data);
                console.log('Number of reports:', response.data ? response.data.length : 0);
                console.log('Response success:', response.success);
                
                if (response.success) {
                    // Store reports data globally
                    window.reportsData = response.data || [];
                    console.log('Reports data stored globally:', window.reportsData);
                    renderAllReports(window.reportsData);
                } else {
                    const errorMessage = response.message || 'Gagal memuat daftar laporan';
                    console.error('API Error:', errorMessage);
                    alertify.error(errorMessage);
                    
                    // Show empty state on error
                    $('.reports-list').html('<div class="text-center py-4 text-muted">Gagal memuat laporan</div>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load reports:', xhr.responseText);
                console.error('Status:', status);
                console.error('Error:', error);
                console.error('Response Text:', xhr.responseText);
                
                let errorMessage = 'Gagal memuat daftar laporan';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                console.error('Final Error Message:', errorMessage);
                alertify.error(errorMessage);
                
                // Show error state
                $('.reports-list').html('<div class="text-center py-4 text-muted">Gagal memuat laporan</div>');
            }
        });
    };
    
    // Render All Reports with checkboxes (for download.html)
    function renderAllReports(reports) {
        console.log('Rendering reports:', reports);
        console.log('Reports to render:', reports.length);
        
        const $reportsList = $('.reports-list');
        $reportsList.empty();
        
        if (!reports || reports.length === 0) {
            console.log('No reports to display');
            $reportsList.html('<div class="text-center py-4 text-muted">Belum ada laporan</div>');
            return;
        }
        
        console.log('Number of reports to render:', reports.length);
        
        // Add select all checkbox
        const selectAllHtml = `
            <div class="select-all-container mb-3 p-2 bg-light rounded">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="selectAllReports">
                    <label class="form-check-label" for="selectAllReports">
                        Pilih Semua
                    </label>
                    <button id="deleteSelectedBtn" class="btn btn-danger btn-sm ms-2" disabled>
                        <i data-feather="trash-2" class="me-1"></i>
                        Hapus Yang Dipilih
                    </button>
                </div>
            </div>
        `;
        $reportsList.append(selectAllHtml);
        
        reports.forEach(function(report, index) {
            console.log(`Rendering report ${index + 1}:`, report);
            
            const reportDate = new Date(report.created_at || report.date).toLocaleString('id-ID');
            const reportItem = `
                <div class="report-item" data-id="${report.id}">
                    <div class="report-checkbox">
                        <input class="form-check-input report-checkbox" type="checkbox" value="${report.id}">
                    </div>
                    <div class="report-icon">
                        <i data-feather="file-text"></i>
                    </div>
                    <div class="report-content">
                        <div class="report-date">${reportDate}</div>
                        <div class="report-title">${report.tiang || 'N/A'}</div>
                        <div class="report-location">${report.lokasi || 'N/A'}</div>
                        <div class="report-actions">
                            <button class="btn btn-sm btn-outline-info view-report-btn" data-id="${report.id}">Lihat</button>
                        </div>
                    </div>
                </div>
            `;
            $reportsList.append(reportItem);
        });
        
        console.log('Reports rendered successfully');
        
        // Re-initialize feather icons
        feather.replace();
        
        // Add event listeners for select all checkbox
        $('#selectAllReports').on('change', function() {
            const isChecked = $(this).prop('checked');
            $('.report-checkbox').prop('checked', isChecked);
            updateDeleteButton();
        });
        
        // Add event listeners for individual checkboxes
        $('.report-checkbox').on('change', function() {
            updateDeleteButton();
            updateSelectAllCheckbox();
        });
        
        // Add event listeners for view buttons
        $('.view-report-btn').on('click', function() {
            const reportId = $(this).data('id');
            viewReportDetails(reportId);
        });
        
        // Add event listener for delete selected button
        $('#deleteSelectedBtn').on('click', function() {
            deleteSelectedReports();
        });
    }
    
    // Update delete button state
    function updateDeleteButton() {
        const selectedCount = $('.report-checkbox:checked').length;
        $('#deleteSelectedBtn').prop('disabled', selectedCount === 0);
        if (selectedCount > 0) {
            $('#deleteSelectedBtn').html(`<i data-feather="trash-2" class="me-1"></i> Hapus (${selectedCount})`);
        } else {
            $('#deleteSelectedBtn').html('<i data-feather="trash-2" class="me-1"></i> Hapus Yang Dipilih');
        }
        feather.replace();
    }
    
    // Update select all checkbox state
    function updateSelectAllCheckbox() {
        const totalCheckboxes = $('.report-checkbox').length;
        const checkedCheckboxes = $('.report-checkbox:checked').length;
        $('#selectAllReports').prop('checked', totalCheckboxes === checkedCheckboxes && totalCheckboxes > 0);
    }
    
    // Delete selected reports
    function deleteSelectedReports() {
        const selectedIds = [];
        $('.report-checkbox:checked').each(function() {
            selectedIds.push($(this).val());
        });
        
        if (selectedIds.length === 0) {
            alertify.error('Tidak ada laporan yang dipilih');
            return;
        }
        
        alertify.confirm(
            `Apakah Anda yakin ingin menghapus ${selectedIds.length} laporan yang dipilih?`,
            function() {
                // User confirmed, proceed with deletion
                deleteReportsLoop(selectedIds);
            },
            function() {
                // User cancelled
                return;
            }
        );
    }
    
    // Delete reports using loop request
    function deleteReportsLoop(ids) {
        let deletedCount = 0;
        let failedCount = 0;
        
        console.log('Deleting reports with IDs:', ids);
        
        // Show loading state
        alertify.message('Menghapus laporan...');
        
        // Create an array of promises for all delete requests
        const deletePromises = ids.map(id => {
            return new Promise((resolve) => {
                console.log(`Deleting report with ID: ${id}`);
                $.ajax({
                    url: `https://ardi-report-system.webentercode.com/api/reports/${id}`,
                    type: 'DELETE',
                    success: function(response) {
                        console.log(`Delete response for ID ${id}:`, response);
                        if (response.success) {
                            deletedCount++;
                        } else {
                            failedCount++;
                        }
                        resolve();
                    },
                    error: function(xhr, status, error) {
                        console.error(`Failed to delete report with ID ${id}:`, xhr.responseText);
                        failedCount++;
                        resolve();
                    }
                });
            });
        });
        
        // Wait for all delete requests to complete
        Promise.all(deletePromises).then(() => {
            console.log(`Delete operation completed. Success: ${deletedCount}, Failed: ${failedCount}`);
            
            // Show result
            if (failedCount === 0) {
                alertify.success(`Berhasil menghapus ${deletedCount} laporan`);
            } else {
                alertify.warning(`Berhasil menghapus ${deletedCount} laporan, gagal menghapus ${failedCount} laporan`);
            }
            
            // Reload reports list
            loadAllReports();
        });
    }
    
    // View Report Details Function
    window.viewReportDetails = function(reportId) {
        // Find report data from the global reportsData array
        const report = window.reportsData.find(r => r.id == reportId);
        
        if (!report) {
            alertify.error('Data laporan tidak ditemukan');
            return;
        }
        
        // Show loading state
        const detailContent = `
            <div class="report-detail-container">
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Memuat detail laporan...</span>
                    </div>
                </div>
            </div>
        `;
        
        // Set content and show modal
        $('#report-detail-content').html(detailContent);
        $('#reportDetailModal').modal('show');
        
        // Process report data (no API call needed)
        setTimeout(() => {
            const reportDate = new Date(report.created_at).toLocaleString('id-ID');
            
            // Build images HTML with lightbox
            let imagesHtml = '';
            if (report.images && report.images.length > 0) {
                report.images.forEach((image, index) => {
                    const imageUrl = image.image_url;
                    const imageTitle = `Foto ${index + 1}${image.mark ? ` - ${image.mark}` : ''}`;
                    const imageNotes = image.notes ? `<p class="text-muted small mb-0 mt-2">${image.notes}</p>` : '';
                    
                    imagesHtml += `
                        <div class="col-6 col-md-4 mb-3">
                            <a href="${imageUrl}" data-lightbox="report-${reportId}" data-title="${imageTitle}">
                                <img src="${imageUrl}" class="img-fluid rounded shadow-sm" alt="${imageTitle}" style="height: 150px; object-fit: cover; width: 100%;">
                            </a>
                            <div class="mt-2">
                                <small class="text-muted">Foto ${index + 1}</small>
                                ${image.mark ? `<br><small class="text-primary"><strong>${image.mark}</strong></small>` : ''}
                                ${imageNotes}
                            </div>
                        </div>
                    `;
                });
            } else {
                imagesHtml = `
                    <div class="col-12 text-center text-muted">
                        <i data-feather="image" style="width: 48px; height: 48px;"></i>
                        <p class="mt-2">Foto laporan tidak tersedia</p>
                    </div>
                `;
            }
            
            // Create complete detail content
            const completeDetailContent = `
                <div class="report-detail-container">
                    <div class="detail-section">
                        <h6>Informasi Laporan</h6>
                        <table class="table table-borderless">
                            <tr>
                                <td style="width: 30%"><strong>Tiang:</strong></td>
                                <td>${report.tiang || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>PON:</strong></td>
                                <td>${report.pon || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>MS:</strong></td>
                                <td>${report.ms || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>ODP:</strong></td>
                                <td>${report.odp || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Redaman In:</strong></td>
                                <td>${report.redaman_in || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Redaman Out:</strong></td>
                                <td>${report.redaman_out || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Lokasi:</strong></td>
                                <td>${report.lokasi || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Tanggal:</strong></td>
                                <td>${reportDate}</td>
                            </tr>
                            ${report.notes ? `
                            <tr>
                                <td><strong>Keterangan:</strong></td>
                                <td>${report.notes}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    <div class="detail-section">
                        <h6>Foto Laporan</h6>
                        <div id="detail-images-container" class="row g-2">
                            ${imagesHtml}
                        </div>
                    </div>
                </div>
            `;
            
            // Update modal content
            $('#report-detail-content').html(completeDetailContent);
            
            // Re-initialize feather icons
            feather.replace();
            
            // Re-initialize lightbox
            lightbox.init();
        }, 500); // Small delay to show loading state
    };
});