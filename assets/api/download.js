// Download Excel API
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const downloadExcelForm = document.getElementById('download-excel-form');
    const downloadBtn = document.getElementById('download-btn');
    const downloadLoading = document.getElementById('download-loading');
    const downloadResult = document.getElementById('download-result');
    const downloadMessage = document.getElementById('download-message');
    const downloadFilename = document.getElementById('download-filename');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const downloadFileBtn = document.getElementById('download-file-btn');
    
    let downloadUrl = '';
    let filename = '';
    
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
        
        // Show loading state
        downloadExcelForm.style.display = 'none';
        downloadLoading.style.display = 'block';
        downloadResult.style.display = 'none';
        
        // Prepare API URL
        let apiUrl = `https://ardi-report-system.webentercode.com/api/reports/download?from=${fromDate}&to=${toDate}`;
        
        // Make AJAX request
        fetch(apiUrl, {
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
            // Hide loading state
            downloadLoading.style.display = 'none';
            
            if (data.success) {
                // Check if total_reports is 0
                if (data.total_reports === 0) {
                    // Show no data message
                    downloadResult.innerHTML = `
                        <div class="alert alert-warning">
                            <i data-feather="info" class="me-2"></i>
                            Data tidak ditemukan pada tanggal yang dipilih
                        </div>
                    `;
                    downloadResult.style.display = 'block';
                    downloadExcelForm.style.display = 'block';
                    
                    // Re-initialize feather icons
                    feather.replace();
                } else {
                    // Store download info
                    downloadUrl = data.download_url;
                    filename = data.filename;
                    
                    // Show result state
                    downloadMessage.textContent = data.message;
                    downloadFilename.textContent = filename;
                    downloadResult.style.display = 'block';
                    
                    alertify.success('File Excel berhasil digenerate!');
                }
            } else {
                // Show error
                downloadExcelForm.style.display = 'block';
                alertify.error(data.message || 'Terjadi kesalahan saat menggenerate file Excel');
            }
        })
        .catch(error => {
            console.error('Download error:', error);
            
            // Hide loading state and show error
            downloadLoading.style.display = 'none';
            downloadExcelForm.style.display = 'block';
            
            alertify.error('Terjadi kesalahan koneksi. Silakan coba lagi.');
        });
        });
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