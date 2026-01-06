// Download Excel API with Progress Polling
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const downloadExcelForm = document.getElementById('download-excel-form');
    const downloadBtn = document.getElementById('download-btn');
    const downloadProgress = document.getElementById('download-progress');
    const downloadResult = document.getElementById('download-result');
    const downloadMessage = document.getElementById('download-message');
    const downloadFilename = document.getElementById('download-filename');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const downloadFileBtn = document.getElementById('download-file-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    const progressDetail = document.getElementById('progress-detail');
    
    let downloadUrl = '';
    let filename = '';
    let pollingInterval = null;
    
    // Helper function to force HTTPS
    function forceHttps(url) {
        if (!url) return url;
        return url.replace(/^http:\/\//, 'https://');
    }
    
    // Only set default dates if they are not already set
    const fromDateElement = document.getElementById('from-date');
    const toDateElement = document.getElementById('to-date');
    
    if (!fromDateElement.value || !toDateElement.value) {
        // Set default date values (today for both from and to) in yyyy-mm-dd format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        fromDateElement.value = formattedDate;
        toDateElement.value = formattedDate;
    }
    
    // Handle form submit
    if (downloadExcelForm) {
        downloadExcelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fromDate = document.getElementById('from-date').value;
            const toDate = document.getElementById('to-date').value;
            
            // Validate dates
            if (!fromDate || !toDate) {
                alertify.error('Mohon pilih tanggal dari dan sampai');
                return;
            }
            
            // Validate date range
            if (new Date(fromDate) > new Date(toDate)) {
                alertify.error('Tanggal dari tidak boleh lebih besar dari tanggal sampai');
                return;
            }
            
            // Clear any existing polling
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            
            // Show progress state
            downloadExcelForm.style.display = 'none';
            downloadProgress.style.display = 'block';
            downloadResult.style.display = 'none';
            downloadBtn.disabled = true;
            
            // Reset progress
            updateProgress(0, 'Memulai proses...', '0 / 0 data');
            
            // Prepare API URL
            let apiUrl = `https://ardi-report-system.webentercode.com/api/reports/download?from=${fromDate}&to=${toDate}`;
            
            // Step 1: Request download initiation
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                // Always try to parse JSON, even for error responses
                return response.json().then(data => {
                    // Return both data and response status
                    return { data, ok: response.ok };
                }).catch(err => {
                    // Handle JSON parsing error
                    console.error('JSON parsing error:', err);
                    throw new Error('Invalid JSON response from server');
                });
            })
            .then(({ data, ok }) => {
                if (data.success) {
                    // Check if total_reports is 0
                    if (data.total_reports === 0) {
                        // Show no data message from backend
                        downloadProgress.style.display = 'none';
                        downloadResult.innerHTML = `
                            <div class="alert alert-warning">
                                <i data-feather="info" class="me-2"></i>
                                ${data.message || 'Terjadi kesalahan'}
                            </div>
                        `;
                        downloadResult.style.display = 'block';
                        downloadExcelForm.style.display = 'block';
                        downloadBtn.disabled = false;
                        
                        // Show alertify with backend message
                        alertify.warning(data.message || 'Terjadi kesalahan');
                        
                        // Re-initialize feather icons
                        feather.replace();
                    } else if (data.check_status_endpoint) {
                        // Step 2: Start polling for progress (force HTTPS)
                        startPolling(forceHttps(data.check_status_endpoint), data.total_reports);
                    } else if (data.download_url) {
                        // Direct download available (backward compatibility)
                        showDownloadResult(data);
                    }
                } else {
                    // Show error with backend message
                    downloadProgress.style.display = 'none';
                    downloadExcelForm.style.display = 'block';
                    downloadBtn.disabled = false;
                    alertify.error(data.message || 'Terjadi kesalahan');
                }
            })
            .catch(error => {
                console.error('Download error:', error);
                
                // Hide progress state and show error
                downloadProgress.style.display = 'none';
                downloadExcelForm.style.display = 'block';
                downloadBtn.disabled = false;
                
                // Try to get error message from response if available
                let errorMessage = 'Terjadi kesalahan';
                if (error.message && error.message.includes('Invalid JSON')) {
                    errorMessage = 'Terjadi kesalahan';
                }
                alertify.error(errorMessage);
            });
        });
    }
    
    // Function to start polling for progress
    function startPolling(checkStatusEndpoint, totalReports) {
        updateProgress(0, 'Memproses data...', `0 / ${totalReports} data`);
        
        // Poll every 5 seconds
        pollingInterval = setInterval(function() {
            fetch(checkStatusEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Update progress
                    const percentage = data.progress_percentage || 0;
                    const dataProcessed = data.data_processed || 0;
                    const totalData = data.total_data || totalReports;
                    
                    updateProgress(
                        percentage,
                        getStatusMessage(data.status),
                        `${dataProcessed} / ${totalData} data`
                    );
                    
                    // Check if download is complete
                    if (data.status === 'completed' && percentage === 100) {
                        if (data.download_url) {
                            // Download URL available, show result
                            clearInterval(pollingInterval);
                            pollingInterval = null;
                            showDownloadResult(data);
                        }
                        // If download_url is not available yet, continue polling
                    }
                }
            })
            .catch(error => {
                console.error('Polling error:', error);
                // Continue polling even if there's an error
            });
        }, 5000);
    }
    
    // Function to update progress display
    function updateProgress(percentage, status, detail) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.textContent = percentage + '%';
        progressPercentage.textContent = percentage + '%';
        progressStatus.textContent = status;
        progressDetail.textContent = detail;
        
        // Update progress bar color based on percentage
        progressBar.classList.remove('bg-success', 'bg-info', 'bg-warning');
        if (percentage < 30) {
            progressBar.classList.add('bg-info');
        } else if (percentage < 70) {
            progressBar.classList.add('bg-warning');
        } else {
            progressBar.classList.add('bg-success');
        }
    }
    
    // Function to get status message
    function getStatusMessage(status) {
        switch(status) {
            case 'processing':
                return 'Memproses data...';
            case 'generating':
                return 'Membuat file Excel...';
            case 'completed':
                return 'Selesai!';
            default:
                return 'Memproses...';
        }
    }
    
    // Function to show download result
    function showDownloadResult(data) {
        // Store download info (force HTTPS)
        downloadUrl = forceHttps(data.download_url);
        filename = data.filename;
        
        // Hide progress state
        downloadProgress.style.display = 'none';
        
        // Show result state
        downloadMessage.textContent = 'File Excel siap diunduh.';
        downloadFilename.textContent = filename;
        downloadResult.style.display = 'block';
        downloadExcelForm.style.display = 'block';
        downloadBtn.disabled = false;
        
        // Show alertify with backend message
        alertify.success('File Excel siap diunduh.');
    }
    
    // Handle copy link button click
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            if (downloadUrl) {
                // Use modern Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(downloadUrl).then(function() {
                        alertify.success('Link download berhasil disalin!');
                    }).catch(function(err) {
                        console.error('Could not copy text: ', err);
                        // Fallback to older method
                        fallbackCopyTextToClipboard(downloadUrl);
                    });
                } else {
                    // Fallback for older browsers
                    fallbackCopyTextToClipboard(downloadUrl);
                }
            }
        });
    }
    
    // Fallback function for copying text
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alertify.success('Link download berhasil disalin!');
            } else {
                alertify.error('Gagal menyalin link. Silakan salin secara manual.');
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alertify.error('Gagal menyalin link. Silakan salin secara manual.');
        }
        
        document.body.removeChild(textArea);
    }
    
    // Handle download file button click
    if (downloadFileBtn) {
        downloadFileBtn.addEventListener('click', function() {
            if (downloadUrl) {
                // Create temporary link element to trigger download
                const tempLink = document.createElement('a');
                tempLink.href = downloadUrl;
                tempLink.download = filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                
                alertify.success('Download dimulai...');
            }
        });
    }
    
});
