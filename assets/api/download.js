// Download Excel API
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const downloadExcelBtn = document.getElementById('download-excel-btn');
    const downloadExcelModal = document.getElementById('downloadExcelModal');
    const downloadExcelForm = document.getElementById('download-excel-form');
    const confirmDownloadBtn = document.getElementById('confirm-download-btn');
    const downloadLoading = document.getElementById('download-loading');
    const downloadResult = document.getElementById('download-result');
    const downloadModalFooter = document.getElementById('download-modal-footer');
    const downloadMessage = document.getElementById('download-message');
    const downloadFilename = document.getElementById('download-filename');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const downloadFileBtn = document.getElementById('download-file-btn');
    
    let downloadUrl = '';
    let filename = '';
    
    // Initialize Bootstrap modal
    const modal = new bootstrap.Modal(document.getElementById('downloadExcelModal'));
    
    // Handle download button click - show modal
    downloadExcelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Set default date values (today for both from and to) in yyyy-mm-dd format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        document.getElementById('from-date').value = formattedDate;
        document.getElementById('to-date').value = formattedDate;
        document.getElementById('download-password').value = '';
        
        // Reset modal state
        downloadExcelForm.style.display = 'block';
        downloadLoading.style.display = 'none';
        downloadResult.style.display = 'none';
        downloadModalFooter.style.display = 'block';
        
        // Reset modal footer
        downloadModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-success" id="confirm-download-btn">
                <i data-feather="download" class="me-2"></i>
                Download
            </button>
        `;
        
        // Re-attach event listener to the new button
        document.getElementById('confirm-download-btn').addEventListener('click', function() {
            const event = new Event('click');
            confirmDownloadBtn.dispatchEvent(event);
        });
        
        // Re-initialize feather icons
        feather.replace();
        
        // Show modal
        modal.show();
    });
    
    // Handle confirm download button click
    confirmDownloadBtn.addEventListener('click', function() {
        const fromDate = document.getElementById('from-date').value;
        const toDate = document.getElementById('to-date').value;
        const password = document.getElementById('download-password').value;
        
        // Validate form - only password is required
        if (!password) {
            alertify.error('Mohon masukkan password');
            return;
        }
        
        // Validate date range if both dates are provided
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            alertify.error('Tanggal dari tidak boleh lebih besar dari tanggal sampai');
            return;
        }
        
        // Show loading state
        downloadExcelForm.style.display = 'none';
        downloadModalFooter.style.display = 'none';
        downloadLoading.style.display = 'block';
        
        // Prepare API URL - handle optional dates
        let apiUrl = `https://ardi-report-system.webentercode.com/api/reports/download?password=${password}`;
        
        // Add dates to URL only if they are provided
        if (fromDate) {
            apiUrl += `&from=${fromDate}`;
        }
        if (toDate) {
            apiUrl += `&to=${toDate}`;
        }
        
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
                    downloadExcelForm.style.display = 'none';
                    downloadResult.innerHTML = `
                        <div class="alert alert-warning">
                            <i data-feather="info" class="me-2"></i>
                            Data tidak ditemukan pada tanggal yang dipilih
                        </div>
                    `;
                    downloadResult.style.display = 'block';
                    
                    // Update modal footer with close button
                    downloadModalFooter.innerHTML = `
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    `;
                    downloadModalFooter.style.display = 'block';
                    
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
                    
                    // Update modal footer with close button
                    downloadModalFooter.innerHTML = `
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    `;
                    downloadModalFooter.style.display = 'block';
                    
                    alertify.success('File Excel berhasil digenerate!');
                }
            } else {
                // Show error
                downloadExcelForm.style.display = 'block';
                downloadModalFooter.style.display = 'block';
                alertify.error(data.message || 'Terjadi kesalahan saat menggenerate file Excel');
            }
        })
        .catch(error => {
            console.error('Download error:', error);
            
            // Hide loading state and show error
            downloadLoading.style.display = 'none';
            downloadExcelForm.style.display = 'block';
            downloadModalFooter.style.display = 'block';
            
            alertify.error('Terjadi kesalahan koneksi. Silakan coba lagi.');
        });
    });
    
    // Handle copy link button click
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
    downloadFileBtn.addEventListener('click', function() {
        if (downloadUrl) {
            // Create temporary link element to trigger download
            const tempLink = document.createElement('a');
            tempLink.href = downloadUrl;
            tempLink.download = filename;
            tempLink.target = '_blank';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            alertify.success('Download dimulai...');
        }
    });
    
});