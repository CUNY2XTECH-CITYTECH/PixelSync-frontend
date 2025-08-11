// sign in / sign up page

// Wait for Firebase to be available
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.Firebase) {
            resolve(window.Firebase);
        } else {
            const checkFirebase = () => {
                if (window.Firebase) {
                    resolve(window.Firebase);
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        }
    });
}

// Initialize Firebase when the script loads
let auth = null;

async function initializeFirebase() {
    console.log('Waiting for Firebase to be available...');
    const Firebase = await waitForFirebase();
    console.log('Firebase available, initializing...');
    
    const response = await fetch('/firebaseConfig');
    const firebaseConfig = await response.json();
    

    const app = Firebase.initializeApp(firebaseConfig);
    auth = Firebase.getAuth(app);
    console.log('Firebase initialized successfully');
    
    // Set up event listeners after Firebase is ready
    setupEventListeners();
}

// Show loading state
function showLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Loading...';
    submitBtn.disabled = true;
    return () => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'color: red; margin: 10px 0; padding: 10px; background: #ffe6e6; border-radius: 4px;';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Insert error message before the form
    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = 'color: green; margin: 10px 0; padding: 10px; background: #e6ffe6; border-radius: 4px;';
    successDiv.textContent = message;
    
    // Remove any existing success messages
    document.querySelectorAll('.success-message').forEach(el => el.remove());
    
    // Insert success message before the form
    const form = document.querySelector('form');
    form.parentNode.insertBefore(successDiv, form);
}

function setupEventListeners() {
    // Login form handler
    document.querySelector('form[action="/auth/login"]')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        
        const hideLoading = showLoading(form);
        
        try {
            console.log('Attempting Firebase login...');
            // First authenticate with Firebase
            const userCredential = await window.Firebase.signInWithEmailAndPassword(auth, email, password);
            console.log('Firebase login successful, getting token...');
            const idToken = await userCredential.user.getIdToken();
            console.log('Token obtained, sending to backend...');
            
            // Send token to backend
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ email })
            });
            
            console.log('Backend response status:', response.status);
            const result = await response.json();
            console.log('Backend response:', result);
            
            if (result.success) {
                showSuccess('Login successful! Redirecting...');
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                showError(result.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            showError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            hideLoading();
        }
    });

    // Register form handler
    document.querySelector('form[action="/auth/register"]')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Register form submitted');
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        
        const hideLoading = showLoading(form);
        
        try {
            console.log('Attempting Firebase registration...');
            // First create user with Firebase
            const userCredential = await window.Firebase.createUserWithEmailAndPassword(auth, email, password);
            console.log('Firebase registration successful, getting token...');
            const idToken = await userCredential.user.getIdToken();
            console.log('Token obtained, sending to backend...');
            
            // Send token to backend
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ name, email })
            });
            
            console.log('Backend response status:', response.status);
            const result = await response.json();
            console.log('Backend response:', result);
            
            if (result.success) {
                showSuccess('Registration successful! Redirecting...');
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                showError(result.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            showError(err.message || 'Registration failed. Please try again.');
        } finally {
            hideLoading();
        }
    });
}

// Initialize Firebase when the script loads
initializeFirebase();
console.log('Auth script loaded successfully');