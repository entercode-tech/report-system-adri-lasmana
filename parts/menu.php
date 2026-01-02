<style>
.bottom-nav {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 30px 30px 0 0;
    padding: 10px 30px 30px;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: var(--text-secondary);
    transition: var(--transition);
    padding: 8px 16px;
    border-radius: 16px;
    position: relative;
}

.nav-item:hover {
    color: var(--primary-color);
    background-color: rgba(0, 200, 81, 0.1);
    transform: translateY(-2px);
}

.nav-item.active {
    color: var(--primary-color);
}

.nav-item i {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
}

.nav-item span {
    font-size: 0.75rem;
    font-weight: 500;
}

.floating-home {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 200, 81, 0.4);
    transition: var(--transition);
    top: -20px;
}

.floating-home:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 200, 81, 0.5);
}

.floating-home i {
    width: 28px;
    height: 28px;
    margin: 0;
}

.report-nav {
    margin-right: 10px;
}

/* Active state animation */
.nav-item.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: var(--primary-color);
    border-radius: 50%;
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .bottom-nav {
        padding: 8px 12px 12px;
    }
    
    .nav-item {
        padding: 4px 8px;
    }
    
    .floating-home {
        width: 48px;
        height: 48px;
        top: -12px;
    }
    
    .floating-home i {
        width: 22px;
        height: 22px;
    }
}
</style>

<div class="bottom-nav">
    <!-- Spacer di kiri -->
    <div style="width: 80px;"></div>
    
    <!-- Floating Home Button di tengah -->
    <a href="#" class="floating-home" id="download-excel-btn">
        <i data-feather="download"></i>
    </a>
    
    <!-- Report Button di kanan -->
    <div class="nav-item report-nav">
       
    </div>
</div>