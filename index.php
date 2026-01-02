<?php include 'parts/top.php'; ?>

<style>
.upload-container {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    padding: 10px;
    box-shadow: var(--shadow-light);
}

.upload-box {
    aspect-ratio: 1;
    border: 2px dashed var(--border-color);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
    background: var(--background-color);
}

.upload-box:hover {
    border-color: var(--primary-color);
    background: rgba(0, 200, 81, 0.05);
}

.upload-box.has-image {
    border: 2px solid var(--primary-color);
    background: var(--surface-color);
}

.upload-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
}

.upload-icon {
    width: 48px;
    height: 48px;
    color: var(--text-secondary);
    margin-bottom: 10px;
    z-index: 1;
}

.upload-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
    z-index: 1;
}

.delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    transition: var(--transition);
}

.upload-box.has-image .delete-btn {
    display: flex;
}

.upload-box.has-image:hover .delete-btn {
    opacity: 0.8;
}

.upload-box.has-image .delete-btn:hover {
    opacity: 1;
}

.form-container {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    padding: 20px;
    box-shadow: var(--shadow-light);
}

.table-custom {
    width: 100%;
}

.table-custom td {
    padding: 12px;
    vertical-align: middle;
}

.table-custom td:first-child {
    font-weight: 600;
    color: var(--text-primary);
    width: 120px;
}

.form-control {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-small);
    padding: 10px 15px;
    transition: var(--transition);
    width: 100%;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(0, 200, 81, 0.25);
}

.location-display {
    background: var(--background-color);
    padding: 10px 15px;
    border-radius: var(--border-radius-small);
    color: var(--text-secondary);
    font-family: monospace;
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
}

.location-display:hover {
    background: var(--surface-color);
    color: var(--primary-color);
}

.upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 100%;
    height: 100%;
    position: relative;
}
</style>

<div class="container-fluid p-3">
    <!-- Grid 4 Kolom untuk Upload Gambar -->
    <div class="row row-cols-2">
        <div class="col mb-3">
            <div class="upload-container">
                <div class="upload-box" data-index="1">
                    <label for="file-input-1" class="upload-label">
                        <i data-feather="plus-circle" class="upload-icon"></i>
                        <span class="upload-text">Tambah Foto</span>
                        <img src="" alt="Preview" style="display: none;">
                        <button class="delete-btn" type="button">
                            <i data-feather="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </label>
                    <input type="file" id="file-input-1" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
        <div class="col mb-3">
            <div class="upload-container">
                <div class="upload-box" data-index="2">
                    <label for="file-input-2" class="upload-label">
                        <i data-feather="plus-circle" class="upload-icon"></i>
                        <span class="upload-text">Tambah Foto</span>
                        <img src="" alt="Preview" style="display: none;">
                        <button class="delete-btn" type="button">
                            <i data-feather="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </label>
                    <input type="file" id="file-input-2" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
        <div class="col mb-3">
            <div class="upload-container">
                <div class="upload-box" data-index="3">
                    <label for="file-input-3" class="upload-label">
                        <i data-feather="plus-circle" class="upload-icon"></i>
                        <span class="upload-text">Tambah Foto</span>
                        <img src="" alt="Preview" style="display: none;">
                        <button class="delete-btn" type="button">
                            <i data-feather="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </label>
                    <input type="file" id="file-input-3" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
        <div class="col mb-3">
            <div class="upload-container">
                <div class="upload-box" data-index="4">
                    <label for="file-input-4" class="upload-label">
                        <i data-feather="plus-circle" class="upload-icon"></i>
                        <span class="upload-text">Tambah Foto</span>
                        <img src="" alt="Preview" style="display: none;">
                        <button class="delete-btn" type="button">
                            <i data-feather="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </label>
                    <input type="file" id="file-input-4" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
    </div>

    <!-- Form Keterangan -->
    <div class="row">
        <div class="col-12">
            <div class="form-container">
                <h5 class="mb-3">Keterangan Laporan</h5>
                <table class="table-custom">
                    <tr>
                        <td>Lokasi</td>
                        <td>
                            <div class="location-display" id="location-display" title="Klik untuk refresh lokasi">
                                <i data-feather="map-pin" style="width: 16px; height: 16px; margin-right: 5px;"></i>
                                <span id="coords-text">Mendapatkan lokasi...<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small></span>
                            </div>
                            <input type="hidden" id="location-input" name="location">
                        </td>
                    </tr>
                    <tr>
                        <td>Tiang</td>
                        <td><input type="text" class="form-control" id="tiang" name="tiang" placeholder="Masukkan nomor tiang"></td>
                    </tr>
                    <tr>
                        <td>PON</td>
                        <td><input type="text" class="form-control" id="pon" name="pon" placeholder="Masukkan nomor PON"></td>
                    </tr>
                    <tr>
                        <td>MS</td>
                        <td><input type="text" class="form-control" id="ms" name="ms" placeholder="Masukkan nomor MS"></td>
                    </tr>
                    <tr>
                        <td>ODP</td>
                        <td><input type="text" class="form-control" id="odp" name="odp" placeholder="Masukkan nomor ODP"></td>
                    </tr>
                    <tr>
                        <td>Redaman In</td>
                        <td><input type="text" class="form-control" id="redaman-in" name="redaman_in" placeholder="Masukkan nilai redaman in"></td>
                    </tr>
                    <tr>
                        <td>Redaman Out</td>
                        <td><input type="text" class="form-control" id="redaman-out" name="redaman_out" placeholder="Masukkan nilai redaman out"></td>
                    </tr>
                </table>
                
                <div class="mt-4">
                    <button type="button" class="btn btn-primary w-100" style="background: var(--primary-color); border: none; padding: 12px; border-radius: var(--border-radius);">
                        <i data-feather="save" style="width: 18px; height: 18px; margin-right: 8px;"></i>
                        Simpan Laporan
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'parts/bottom.php'; ?>