// Initialize Feather Icons
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    
    // Inisiasi perangkat dengan team_id hanya satu kali
    if (!localStorage.getItem('team_id')) {
        // Generate UUID
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // Generate timestamp
        const timestamp = Date.now();
        
        // Generate UUID
        const uuid = generateUUID();
        
        // Combine timestamp and UUID untuk team_id
        const teamId = `${timestamp}-${uuid}`;
        
        // Simpan ke localStorage
        localStorage.setItem('team_id', teamId);
        
        console.log('Team ID telah diinisiasi:', teamId);
    } else {
        console.log('Team ID sudah ada:', localStorage.getItem('team_id'));
    }
    
    // Set global variable window.team_id
    window.team_id = localStorage.getItem('team_id');
});