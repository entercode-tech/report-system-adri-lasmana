// Inisialisasi peta Leaflet dengan OpenStreetMap
document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah elemen map ada
    if (document.getElementById('map')) {
        // Inisialisasi peta dengan koordinat default (Jakarta)
        const map = L.map('map').setView([-6.2088, 106.8456], 13);
        
        // Tambahkan tile layer yang lebih detail dan realistis
        // Menggunakan Esri WorldImagery untuk tampilan satelit/bumi
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });
        
        // Tambahkan layer label untuk pembacaan lokasi
        const labelLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });
        
        // Tambahkan kedua layer ke peta
        satelliteLayer.addTo(map);
        labelLayer.addTo(map);
        
        // Tambahkan kontrol untuk mengganti layer
        const baseMaps = {
            "Satelit": satelliteLayer,
            "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }),
            "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                maxZoom: 17
            })
        };
        
        // Tambahkan kontrol layer ke peta
        L.control.layers(baseMaps).addTo(map);
        
        // Coba dapatkan lokasi pengguna
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Set view ke lokasi pengguna
                    map.setView([lat, lng], 15);
                    
                    // Tambahkan marker di lokasi pengguna dengan loading
                    const userMarker = L.marker([lat, lng]).addTo(map);
                    userMarker.bindPopup(`<b>Lokasi Anda</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br>Mendapatkan alamat...`).openPopup();
                    
                    // Dapatkan alamat dari koordinat
                    const address = await getAddressFromCoordinates(lat, lng);
                    
                    // Update popup dengan alamat
                    userMarker.setPopupContent(`<b>Lokasi Anda</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br><b>Alamat:</b><br>${address}`);
                    
                    // Update lokasi di form jika ada
                    const locationInput = document.getElementById('location-input');
                    const coordsText = document.getElementById('coords-text');
                    if (locationInput && coordsText) {
                        locationInput.value = `${lat},${lng}`;
                        coordsText.innerHTML = `${lat.toFixed(6)}, ${lng.toFixed(6)}<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>`;
                    }
                },
                function(error) {
                    console.error('Error getting location:', error);
                    // Tetap tampilkan peta dengan lokasi default jika gagal mendapatkan lokasi
                    const defaultMarker = L.marker([-6.2088, 106.8456]).addTo(map);
                    defaultMarker.bindPopup('<b>Lokasi Default (Jakarta)</b>').openPopup();
                }
            );
        } else {
            // Jika browser tidak mendukung geolocation
            const defaultMarker = L.marker([-6.2088, 106.8456]).addTo(map);
            defaultMarker.bindPopup('<b>Lokasi Default (Jakarta)</b>').openPopup();
        }
        
        // Fungsi untuk mendapatkan alamat dari koordinat menggunakan Nominatim API
        async function getAddressFromCoordinates(lat, lng) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    return data.display_name;
                } else {
                    return "Alamat tidak ditemukan";
                }
            } catch (error) {
                console.error('Error getting address:', error);
                return "Gagal mendapatkan alamat";
            }
        }
        
        // Fungsi untuk menambah marker saat klik pada peta
        map.on('click', async function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Hapus marker sebelumnya jika ada
            if (window.currentMarker) {
                map.removeLayer(window.currentMarker);
            }
            
            // Tambah marker baru dengan loading
            window.currentMarker = L.marker([lat, lng]).addTo(map);
            window.currentMarker.bindPopup(`<b>Lokasi Dipilih</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br>Mendapatkan alamat...`).openPopup();
            
            // Dapatkan alamat dari koordinat
            const address = await getAddressFromCoordinates(lat, lng);
            
            // Update popup dengan alamat
            window.currentMarker.setPopupContent(`<b>Lokasi Dipilih</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br><b>Alamat:</b><br>${address}`);
            
            // Update lokasi di form
            const locationInput = document.getElementById('location-input');
            const coordsText = document.getElementById('coords-text');
            if (locationInput && coordsText) {
                locationInput.value = `${lat},${lng}`;
                coordsText.innerHTML = `${lat.toFixed(6)}, ${lng.toFixed(6)}<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>`;
            }
            
            // Tampilkan alert dengan alamat lengkap
            alertify.success(`<b>Alamat Lengkap:</b><br>${address}`);
        });
        
        // Fungsi refresh lokasi saat tombol location-display diklik
        const locationDisplay = document.getElementById('location-display');
        if (locationDisplay) {
            locationDisplay.addEventListener('click', async function() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async function(position) {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            
                            // Set view ke lokasi pengguna
                            map.setView([lat, lng], 15);
                            
                            // Hapus marker sebelumnya jika ada
                            if (window.currentMarker) {
                                map.removeLayer(window.currentMarker);
                            }
                            
                            // Tambah marker baru di lokasi pengguna dengan loading
                            window.currentMarker = L.marker([lat, lng]).addTo(map);
                            window.currentMarker.bindPopup(`<b>Lokasi Anda</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br>Mendapatkan alamat...`).openPopup();
                            
                            // Dapatkan alamat dari koordinat
                            const address = await getAddressFromCoordinates(lat, lng);
                            
                            // Update popup dengan alamat
                            window.currentMarker.setPopupContent(`<b>Lokasi Anda</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br><br><b>Alamat:</b><br>${address}`);
                            
                            // Update lokasi di form
                            const locationInput = document.getElementById('location-input');
                            const coordsText = document.getElementById('coords-text');
                            if (locationInput && coordsText) {
                                locationInput.value = `${lat},${lng}`;
                                coordsText.innerHTML = `${lat.toFixed(6)}, ${lng.toFixed(6)}<br><small style="display: block; margin-top: 5px; opacity: 0.7;">(klik untuk refresh)</small>`;
                            }
                            
                            // Tampilkan alert dengan alamat lengkap
                            alertify.success(`<b>Alamat Lengkap:</b><br>${address}`);
                        },
                        function(error) {
                            console.error('Error refreshing location:', error);
                            alertify.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
                        }
                    );
                }
            });
        }
    }
});