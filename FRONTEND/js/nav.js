// navigation handling for Mundo Velas

function getHomePage() {
    // one home page for both login methods
    return '../BSHOME/index.html';
}

/**
  only one profile page
 */
function getProfilePage() {
    // one profile page for both login methods
    return '../BSUSERPAGE/profilemain.html';
}

/**
 * Sets up all navigation links with proper redirection
 */
function setupNavigation() {
    // Home links (logo and nav item)
    document.querySelectorAll('[data-home]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = getHomePage();
        });
    });

    // Profile link - FIXED to go to profile page
    document.querySelectorAll('.profile-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = getProfilePage();
        });
    });

    // Set active state for current page
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href')?.split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', setupNavigation);

// For pages that load content dynamically
if (document.readyState === 'complete') {
    setupNavigation();
}