console.log('Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    // Page switching
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (!pageId) return;

            // Hide all pages
            pages.forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');

            // Close mobile menu if open
            nav.classList.remove('active');
            burger.classList.remove('toggle');
        });
    });
    
    // Burger menu toggle
    burger.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('toggle');
    });
    
    // Login/Signup toggle
    // Google Login/Signup button handlers
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            window.location.href = '/auth/google';
        });
    }
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', function() {
            window.location.href = '/auth/google';
        });
    }

    // If redirected from Google login, show username in nav
    // If on /main, handle Google login username
    const urlParams = new URLSearchParams(window.location.search);
    const googleUser = urlParams.get('googleUser');

    // Move this block after loginBtn is defined
    const loginBtn = document.getElementById('login-btn');
    if (googleUser && loginBtn) {
        loginBtn.textContent = googleUser;
        loginBtn.setAttribute('data-page', 'logout');
        // Redirect to home page view
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('home').classList.add('active');
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        document.querySelector('.nav-links a[data-page="home"]').classList.add('active');
        // Remove query param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Logout feature: clicking username when logged in logs out
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            if (loginBtn.getAttribute('data-page') === 'logout') {
                e.preventDefault();
                const confirmLogout = confirm('Do you want to log out?');
                if (!confirmLogout) return;
                // Reset nav to LOG IN
                loginBtn.textContent = 'LOG IN';
                loginBtn.setAttribute('data-page', 'login');
                // Show login page
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById('login').classList.add('active');
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                loginBtn.classList.add('active');
                // Optionally: clear Google login state (simulate logout)
                // If you store login state in localStorage/cookies, clear it here
            }
        });
    }
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Show login page
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('login').classList.add('active');
        
        // Show login form by default
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        
        // Update nav active state
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        this.classList.add('active');
    });
    
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });
    
    // Form submissions
    const loginFormEl = document.getElementById('loginForm');
    const signupFormEl = document.getElementById('signupForm');
    
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(result => {
            if (result.status === 200) {
                alert('Login successful!');
                // Show the registered username in nav, even if user logged in with email
                const displayName = result.body.username || username;
                loginBtn.textContent = displayName;
                loginBtn.setAttribute('data-page', 'logout');
                // Redirect to home page
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById('home').classList.add('active');
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                document.querySelector('.nav-links a[data-page="home"]').classList.add('active');
            } else {
                alert(result.body.message || 'Login failed.');
            }
        })
        .catch(() => alert('Network error.'));
    });
    
    signupFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(result => {
            if (result.status === 201) {
                alert('Account created successfully! Please log in.');
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                alert(result.body.message || 'Registration failed.');
            }
        })
        .catch(() => alert('Network error.'));
    });
    
    // Simulate user login state (for demo purposes)
    const isLoggedIn = false; // Change to true to simulate logged in state
    
    if (isLoggedIn) {
        loginBtn.textContent = 'LOG OUT';
        loginBtn.setAttribute('data-page', 'logout');
    }
});