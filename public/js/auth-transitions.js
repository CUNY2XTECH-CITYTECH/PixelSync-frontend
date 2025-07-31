document.addEventListener('DOMContentLoaded', function() {
    const signContainer = document.querySelector('.sign-container, .sign-container-2');
    if (signContainer) {
        signContainer.style.opacity = '0';
        signContainer.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            signContainer.style.transition = 'all 0.4s ease-out';
            signContainer.style.opacity = '1';
            signContainer.style.transform = 'translateY(0)';
        });
    }
    
    const authLinks = document.querySelectorAll('a[href*="/auth/"]');
    authLinks.forEach(link => {
        link.addEventListener('click', function(e) {
        });
    });
});
