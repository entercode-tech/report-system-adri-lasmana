<style>
.navbar {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 0 0 20px 20px;
    transition: var(--transition);
    padding: 1rem 0;
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-on-primary) !important;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-decoration: none;
}

.navbar-brand:hover {
    transform: translateY(-2px);
    color: var(--primary-light) !important;
}

.navbar-brand i {
    width: 32px;
    height: 32px;
    margin-right: 12px;
}
</style>

<nav class="navbar navbar-dark">
    <div class="container-fluid">
        <!-- Brand with Logo -->
        <div class="navbar-brand">
            <i data-feather="file-text" class="me-2"></i>
            <span>Report System</span>
        </div>
    </div>
</nav>