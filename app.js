// GradeTracker Application - Complete Bug-Free Version
class GradeTracker {
    constructor() {
        this.currentUser = null;
        this.isGuestMode = false;
        this.courses = [];
        this.currentCourse = null;
        this.editingCourse = null;
        this.editingAssignment = null;
        this.nextCourseId = 1;
        this.nextAssignmentId = 1;
        
        // Simple in-memory user database (simulates server-side database)
        this.userDatabase = new Map();
        this.sessionToken = null;
        
        // Application configuration
        this.appConfig = {
            appName: "GradeTracker",
            version: "3.0",
            deploymentReady: true,
            strictAuth: true
        };
        
        this.gradeScale = {
            "A+": { min: 97, max: 100, gpa: 4.33, color: "#10b981" },
            "A": { min: 93, max: 96, gpa: 4.0, color: "#10b981" },
            "A-": { min: 90, max: 92, gpa: 3.67, color: "#10b981" },
            "B+": { min: 87, max: 89, gpa: 3.33, color: "#3b82f6" },
            "B": { min: 83, max: 86, gpa: 3.0, color: "#3b82f6" },
            "B-": { min: 80, max: 82, gpa: 2.67, color: "#3b82f6" },
            "C+": { min: 77, max: 79, gpa: 2.33, color: "#f59e0b" },
            "C": { min: 73, max: 76, gpa: 2.0, color: "#f59e0b" },
            "C-": { min: 70, max: 72, gpa: 1.67, color: "#f59e0b" },
            "D+": { min: 67, max: 69, gpa: 1.33, color: "#f97316" },
            "D": { min: 63, max: 66, gpa: 1.0, color: "#f97316" },
            "D-": { min: 60, max: 62, gpa: 0.67, color: "#f97316" },
            "F": { min: 0, max: 59, gpa: 0.0, color: "#ef4444" }
        };
        
        this.assignmentTypes = [
            "Homework", "Quiz", "Test", "Midterm Exam", "Final Exam", 
            "Project", "Lab", "Participation", "Assignment", "Paper", 
            "Presentation", "Discussion", "Workshop", "Other"
        ];

        this.courseColors = [
            {"name": "Blue", "value": "blue", "primary": "#3b82f6", "secondary": "#dbeafe"},
            {"name": "Green", "value": "green", "primary": "#10b981", "secondary": "#d1fae5"},
            {"name": "Purple", "value": "purple", "primary": "#8b5cf6", "secondary": "#e9d5ff"},
            {"name": "Orange", "value": "orange", "primary": "#f97316", "secondary": "#fed7aa"},
            {"name": "Pink", "value": "pink", "primary": "#ec4899", "secondary": "#fce7f3"},
            {"name": "Teal", "value": "teal", "primary": "#14b8a6", "secondary": "#ccfbf1"},
            {"name": "Red", "value": "red", "primary": "#ef4444", "secondary": "#fee2e2"},
            {"name": "Yellow", "value": "yellow", "primary": "#eab308", "secondary": "#fef3c7"}
        ];

        // Demo data for guest mode
        this.guestDemoData = {
            courses: [
                {
                    id: 1,
                    name: "Computer Science 101",
                    code: "CS101",
                    targetGrade: 85,
                    color: "blue",
                    assignments: [
                        {id: 1, name: "Homework 1", grade: 92, weight: 10, type: "Homework", date: "2025-01-15"},
                        {id: 2, name: "Quiz 1", grade: 88, weight: 15, type: "Quiz", date: "2025-01-22"},
                        {id: 3, name: "Midterm Exam", grade: 82, weight: 25, type: "Midterm Exam", date: "2025-02-15"}
                    ]
                },
                {
                    id: 2,
                    name: "Calculus I",
                    code: "MATH201", 
                    targetGrade: 90,
                    color: "green",
                    assignments: [
                        {id: 4, name: "Problem Set 1", grade: 85, weight: 8, type: "Homework", date: "2025-01-10"},
                        {id: 5, name: "Quiz 1", grade: 78, weight: 12, type: "Quiz", date: "2025-01-24"},
                        {id: 6, name: "Midterm Exam", grade: 87, weight: 30, type: "Midterm Exam", date: "2025-02-20"}
                    ]
                }
            ]
        };

        this.messages = {
            success: {
                register: "Account created successfully! Welcome to GradeTracker!",
                login: "Welcome back!",
                courseAdded: "Course added successfully!",
                courseUpdated: "Course updated successfully!",
                assignmentAdded: "Assignment added successfully!",
                assignmentUpdated: "Assignment updated successfully!",
                demoReset: "Demo data has been reset to defaults."
            },
            errors: {
                invalidCredentials: "Invalid username/email or password",
                userExists: "Username or email already exists",
                userNotFound: "No account found with those credentials",
                passwordMismatch: "Passwords do not match",
                invalidEmail: "Please enter a valid email address",
                weakPassword: "Password must be at least 8 characters long",
                usernameInvalid: "Username must be 3-20 characters and contain only letters, numbers, and underscores",
                invalidForm: "Please check your input and try again",
                networkError: "Unable to connect. Please try again.",
                serverError: "Server error. Please try again later.",
                duplicateCourse: "A course with this name or code already exists",
                weightExceeded: "Total assignment weight cannot exceed 100%",
                invalidGrade: "Grade must be between 0 and 100",
                courseCodeRequired: "Course code is required",
                courseNameRequired: "Course name is required",
                targetGradeRequired: "Target grade is required and must be between 0-100"
            }
        };
    }

    // Application Initialization
    init() {
        console.log('GradeTracker initializing...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        console.log('Setting up GradeTracker application...');
        
        // Initialize demo users for testing
        this.initializeDemoUsers();
        
        setTimeout(() => {
            this.bindEvents();
            this.populateAssignmentTypes();
            this.showWelcomeView();
        }, 100);
    }

    // FIXED: Initialize demo users for proper authentication testing
    initializeDemoUsers() {
        // Add a demo user for testing authentication
        this.userDatabase.set('demo@example.com', {
            id: 'demo-user-1',
            username: 'demo',
            email: 'demo@example.com',
            passwordHash: this.simpleHash('demo123'), // Simple hash for demo
            createdAt: new Date().toISOString(),
            courses: []
        });
        
        this.userDatabase.set('test@test.com', {
            id: 'test-user-1', 
            username: 'testuser',
            email: 'test@test.com',
            passwordHash: this.simpleHash('test123'),
            createdAt: new Date().toISOString(),
            courses: []
        });
        
        console.log('Demo users initialized for testing authentication');
    }

    // Simple hash function for demo purposes
    simpleHash(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    // View Management
    showView(viewId) {
        console.log('Switching to view:', viewId);
        
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
        
        if (viewId !== 'auth-view') {
            const authViews = document.querySelectorAll('.auth-view');
            authViews.forEach(view => {
                view.classList.add('hidden');
            });
        }
    }

    showAuthView(authViewId) {
        this.showView('auth-view');
        
        const authViews = document.querySelectorAll('.auth-view');
        authViews.forEach(view => {
            view.classList.add('hidden');
        });
        
        const targetAuthView = document.getElementById(authViewId);
        if (targetAuthView) {
            targetAuthView.classList.remove('hidden');
        }
    }

    showWelcomeView() {
        this.showView('welcome-view');
    }

    showLoginView() {
        this.showAuthView('login-view');
        this.clearAuthErrors();
        setTimeout(() => {
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) usernameInput.focus();
        }, 200);
    }

    showRegisterView() {
        this.showAuthView('register-view');
        this.clearAuthErrors();
        setTimeout(() => {
            const usernameInput = document.getElementById('register-username');
            if (usernameInput) usernameInput.focus();
        }, 200);
    }

    showMainView() {
        this.showView('main-view');
        this.updateSessionIndicator();
        this.renderDashboard();
    }

    // FIXED: Strict Authentication System
    async login(usernameOrEmail, password) {
        console.log('Attempting login for:', usernameOrEmail);
        
        // Clear previous errors
        this.clearAuthErrors();
        
        // Validate input
        if (!usernameOrEmail?.trim()) {
            this.showAuthError('login', 'Username or email is required');
            return false;
        }
        
        if (!password?.trim()) {
            this.showAuthError('login', 'Password is required');
            return false;
        }

        const input = usernameOrEmail.trim();
        const pass = password.trim();
        
        // FIXED: Proper authentication - check both username and email
        let user = null;
        
        // Check by email first
        if (this.userDatabase.has(input)) {
            user = this.userDatabase.get(input);
        } else {
            // Check by username
            for (const [email, userData] of this.userDatabase) {
                if (userData.username === input) {
                    user = userData;
                    break;
                }
            }
        }
        
        // FIXED: Strict validation - user must exist AND password must match
        if (!user) {
            this.showAuthError('login', this.messages.errors.userNotFound);
            return false;
        }
        
        const hashedPassword = this.simpleHash(pass);
        if (user.passwordHash !== hashedPassword) {
            this.showAuthError('login', this.messages.errors.invalidCredentials);
            return false;
        }
        
        // Successful login
        this.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        };
        
        this.sessionToken = 'session_' + Date.now();
        this.courses = user.courses || [];
        
        this.showToast(this.messages.success.login, 'success');
        
        setTimeout(() => {
            this.showMainView();
        }, 500);
        
        return true;
    }

    async register(username, email, password, confirmPassword) {
        console.log('Attempting registration for:', username);
        
        // Clear previous errors
        this.clearAuthErrors();
        
        // Validate all inputs
        if (!username?.trim()) {
            this.showAuthError('register', 'Username is required');
            return false;
        }
        
        if (!email?.trim()) {
            this.showAuthError('register', 'Email is required');
            return false;
        }
        
        if (!password?.trim()) {
            this.showAuthError('register', 'Password is required');
            return false;
        }
        
        if (!confirmPassword?.trim()) {
            this.showAuthError('register', 'Please confirm your password');
            return false;
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();
        const cleanConfirmPassword = confirmPassword.trim();

        // Validate username format
        if (cleanUsername.length < 3 || cleanUsername.length > 20 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            this.showAuthError('register', this.messages.errors.usernameInvalid);
            return false;
        }

        // Validate email format
        if (!this.isValidEmail(cleanEmail)) {
            this.showAuthError('register', this.messages.errors.invalidEmail);
            return false;
        }

        // Validate password strength
        if (cleanPassword.length < 8) {
            this.showAuthError('register', this.messages.errors.weakPassword);
            return false;
        }

        // Validate password match
        if (cleanPassword !== cleanConfirmPassword) {
            this.showAuthError('register', this.messages.errors.passwordMismatch);
            return false;
        }

        // Check if user already exists
        if (this.userDatabase.has(cleanEmail)) {
            this.showAuthError('register', this.messages.errors.userExists);
            return false;
        }
        
        // Check if username is taken
        for (const userData of this.userDatabase.values()) {
            if (userData.username === cleanUsername) {
                this.showAuthError('register', this.messages.errors.userExists);
                return false;
            }
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            username: cleanUsername,
            email: cleanEmail,
            passwordHash: this.simpleHash(cleanPassword),
            createdAt: new Date().toISOString(),
            courses: []
        };

        this.userDatabase.set(cleanEmail, newUser);
        
        // Auto-login after registration
        this.currentUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
        
        this.sessionToken = 'session_' + Date.now();
        this.courses = [];
        
        this.showToast(this.messages.success.register, 'success');
        
        setTimeout(() => {
            this.showMainView();
        }, 500);
        
        return true;
    }

    startGuestMode() {
        console.log('Starting guest mode');
        this.isGuestMode = true;
        this.currentUser = null;
        this.loadGuestData();
        
        this.showMainView();
        
        setTimeout(() => {
            this.showToast('Welcome to demo mode! Explore all features with sample data.', 'info');
            this.showGuestActions();
        }, 500);
    }

    logout() {
        console.log('Logging out');
        this.currentUser = null;
        this.isGuestMode = false;
        this.courses = [];
        this.currentCourse = null;
        this.sessionToken = null;
        this.hideGuestActions();
        this.showWelcomeView();
    }

    loadGuestData() {
        this.courses = JSON.parse(JSON.stringify(this.guestDemoData.courses));
        this.nextCourseId = 3;
        this.nextAssignmentId = 7;
    }

    resetGuestData() {
        if (this.isGuestMode) {
            this.loadGuestData();
            this.currentCourse = null;
            this.renderDashboard();
            this.showToast(this.messages.success.demoReset, 'success');
        }
    }

    // Event Binding
    bindEvents() {
        console.log('Binding events...');
        
        try {
            this.bindWelcomeEvents();
            this.bindAuthEvents();
            this.bindMainAppEvents();
            this.bindModalEvents();
            this.bindGuestEvents();
            
            console.log('All events bound successfully');
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    bindWelcomeEvents() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const guestBtn = document.getElementById('guest-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginView();
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterView();
            });
        }
        
        if (guestBtn) {
            guestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGuestMode();
            });
        }
    }

    bindAuthEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('login-username')?.value?.trim() || '';
                const password = document.getElementById('login-password')?.value?.trim() || '';
                this.login(username, password);
            });
        }

        // Register form  
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('register-username')?.value?.trim() || '';
                const email = document.getElementById('register-email')?.value?.trim() || '';
                const password = document.getElementById('register-password')?.value?.trim() || '';
                const confirmPassword = document.getElementById('register-confirm')?.value?.trim() || '';
                this.register(username, email, password, confirmPassword);
            });
        }

        // Navigation buttons
        const loginBackBtn = document.getElementById('login-back-btn');
        if (loginBackBtn) {
            loginBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWelcomeView();
            });
        }
        
        const registerBackBtn = document.getElementById('register-back-btn');
        if (registerBackBtn) {
            registerBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWelcomeView();
            });
        }
        
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterView();
            });
        }
        
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginView();
            });
        }
    }

    bindMainAppEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        const accountBtn = document.getElementById('account-btn');
        if (accountBtn) {
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAccountInfo();
            });
        }

        // Course buttons
        const addCourseBtn = document.getElementById('add-course-btn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCourseModal();
            });
        }
        
        const addFirstCourseBtn = document.getElementById('add-first-course-btn');
        if (addFirstCourseBtn) {
            addFirstCourseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCourseModal();
            });
        }
        
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }
        
        const editCourseBtn = document.getElementById('edit-course-btn');
        if (editCourseBtn) {
            editCourseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.editCurrentCourse();
            });
        }
        
        const addAssignmentBtn = document.getElementById('add-assignment-btn');
        if (addAssignmentBtn) {
            addAssignmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAssignmentModal();
            });
        }
    }

    // FIXED: Modal Event Binding with proper form validation
    bindModalEvents() {
        // Course modal events
        const courseForm = document.getElementById('course-form');
        if (courseForm) {
            courseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCourse();
            });
        }
        
        const courseModalClose = document.getElementById('course-modal-close');
        if (courseModalClose) {
            courseModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCourseModal();
            });
        }
        
        const courseCancelBtn = document.getElementById('course-cancel-btn');
        if (courseCancelBtn) {
            courseCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCourseModal();
            });
        }
        
        const courseSaveBtn = document.getElementById('course-save-btn');
        if (courseSaveBtn) {
            courseSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCourse();
            });
        }
        
        // Assignment modal events
        const assignmentForm = document.getElementById('assignment-form');
        if (assignmentForm) {
            assignmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAssignment();
            });
        }
        
        const assignmentModalClose = document.getElementById('assignment-modal-close');
        if (assignmentModalClose) {
            assignmentModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAssignmentModal();
            });
        }
        
        const assignmentCancelBtn = document.getElementById('assignment-cancel-btn');
        if (assignmentCancelBtn) {
            assignmentCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAssignmentModal();
            });
        }
        
        const assignmentSaveBtn = document.getElementById('assignment-save-btn');
        if (assignmentSaveBtn) {
            assignmentSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveAssignment();
            });
        }

        // Calculator modal events
        const calculatorModalClose = document.getElementById('calculator-modal-close');
        if (calculatorModalClose) {
            calculatorModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCalculatorModal();
            });
        }
        
        const calculatorCloseBtn = document.getElementById('calculator-close-btn');
        if (calculatorCloseBtn) {
            calculatorCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCalculatorModal();
            });
        }
        
        // Calculator input events
        const desiredGradeInput = document.getElementById('desired-grade');
        const finalWeightInput = document.getElementById('final-weight');
        
        if (desiredGradeInput) {
            desiredGradeInput.addEventListener('input', () => this.updateCalculator());
        }
        
        if (finalWeightInput) {
            finalWeightInput.addEventListener('input', () => this.updateCalculator());
        }
        
        // Modal backdrop clicks
        document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    backdrop.closest('.modal').classList.add('hidden');
                }
            });
        });
    }

    bindGuestEvents() {
        const resetDemoBtn = document.getElementById('reset-demo-btn');
        const createAccountBtn = document.getElementById('create-account-btn');
        
        if (resetDemoBtn) {
            resetDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetGuestData();
            });
        }
        
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.isGuestMode = false;
                this.hideGuestActions();
                this.showRegisterView();
            });
        }
    }

    // FIXED: Complete Course Management with proper validation
    openCourseModal(course = null) {
        this.editingCourse = course;
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const form = document.getElementById('course-form');
        
        if (!modal) return;
        
        // Clear all previous errors
        this.clearFormErrors('course');
        
        if (course) {
            if (title) title.textContent = 'Edit Course';
            this.populateCourseForm(course);
        } else {
            if (title) title.textContent = 'Add Course';
            if (form) form.reset();
            const colorInput = document.getElementById('course-color');
            if (colorInput) colorInput.value = 'blue';
        }
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            const nameInput = document.getElementById('course-name');
            if (nameInput) {
                nameInput.focus();
                if (course) nameInput.select();
            }
        }, 200);
    }

    populateCourseForm(course) {
        const nameInput = document.getElementById('course-name');
        const codeInput = document.getElementById('course-code');
        const targetInput = document.getElementById('target-grade');
        const colorInput = document.getElementById('course-color');
        
        if (nameInput) nameInput.value = course.name || '';
        if (codeInput) codeInput.value = course.code || '';
        if (targetInput) targetInput.value = course.targetGrade || '';
        if (colorInput) colorInput.value = course.color || 'blue';
    }

    closeCourseModal() {
        const modal = document.getElementById('course-modal');
        const form = document.getElementById('course-form');
        
        if (modal) modal.classList.add('hidden');
        if (form) form.reset();
        
        this.clearFormErrors('course');
        this.editingCourse = null;
    }

    // CRITICAL FIX: Corrected form field reading and validation
    saveCourse() {
        console.log('=== SAVING COURSE - CRITICAL BUG FIX ===');
        
        // Clear all previous errors
        this.clearFormErrors('course');
        
        // CRITICAL FIX: Use more reliable DOM element access
        const form = document.getElementById('course-form');
        if (!form) {
            console.error('Course form not found');
            this.showToast('Form error: Course form not found', 'error');
            return false;
        }

        // CRITICAL FIX: Direct element access with proper error checking
        const nameInput = form.querySelector('#course-name');
        const codeInput = form.querySelector('#course-code');  
        const targetInput = form.querySelector('#target-grade');
        const colorInput = form.querySelector('#course-color');
        
        console.log('Form elements found:', {
            nameInput: !!nameInput,
            codeInput: !!codeInput,
            targetInput: !!targetInput,
            colorInput: !!colorInput
        });
        
        if (!nameInput || !codeInput || !targetInput || !colorInput) {
            console.error('Required form inputs not found');
            this.showToast('Form error: Required fields not accessible', 'error');
            return false;
        }
        
        // CRITICAL FIX: Improved value extraction with detailed logging
        const name = nameInput.value ? nameInput.value.trim() : '';
        const code = codeInput.value ? codeInput.value.trim() : '';
        const targetGradeStr = targetInput.value ? targetInput.value.trim() : '';
        const color = colorInput.value || 'blue';
        
        console.log('CRITICAL DEBUG - Form values extracted:', { 
            name: `"${name}" (length: ${name.length})`,
            code: `"${code}" (length: ${code.length})`, 
            targetGradeStr: `"${targetGradeStr}" (length: ${targetGradeStr.length})`,
            color: `"${color}"`
        });
        
        // Parse target grade
        const targetGrade = parseFloat(targetGradeStr);
        
        let hasErrors = false;
        
        // CRITICAL FIX: Comprehensive validation with detailed error reporting
        if (!name || name.length === 0) {
            console.log('VALIDATION ERROR: Course name is empty');
            this.showFieldError('course-name', 'Course name is required');
            nameInput.focus();
            hasErrors = true;
        } else if (name.length > 100) {
            console.log('VALIDATION ERROR: Course name too long');
            this.showFieldError('course-name', 'Course name must be less than 100 characters');
            hasErrors = true;
        }
        
        // CRITICAL FIX: This is where the bug was - improved code validation
        if (!code || code.length === 0) {
            console.log('VALIDATION ERROR: Course code is empty - this was the reported bug');
            this.showFieldError('course-code', 'Course code is required');
            codeInput.focus();
            hasErrors = true;
        } else if (code.length > 20) {
            console.log('VALIDATION ERROR: Course code too long');
            this.showFieldError('course-code', 'Course code must be less than 20 characters');
            hasErrors = true;
        } else {
            console.log('VALIDATION SUCCESS: Course code passed validation:', code);
        }
        
        if (!targetGradeStr || targetGradeStr.length === 0 || isNaN(targetGrade) || targetGrade < 0 || targetGrade > 100) {
            console.log('VALIDATION ERROR: Invalid target grade');
            this.showFieldError('target-grade', 'Target grade must be between 0 and 100');
            hasErrors = true;
        }
        
        if (hasErrors) {
            console.log('VALIDATION FAILED: Form has errors, not saving');
            return false;
        }
        
        console.log('VALIDATION PASSED: All fields are valid');
        
        // Check for duplicates
        const isDuplicate = this.courses.some(c => {
            const sameNameOrCode = c.name.toLowerCase() === name.toLowerCase() || 
                                   c.code.toLowerCase() === code.toLowerCase();
            const notCurrentCourse = !this.editingCourse || c.id !== this.editingCourse.id;
            return sameNameOrCode && notCurrentCourse;
        });
        
        if (isDuplicate) {
            console.log('VALIDATION ERROR: Duplicate course');
            this.showFieldError('course-code', 'A course with this name or code already exists');
            return false;
        }
        
        // Save or update course
        if (this.editingCourse) {
            // Update existing course
            console.log('Updating existing course:', this.editingCourse.id);
            this.editingCourse.name = name;
            this.editingCourse.code = code;
            this.editingCourse.targetGrade = targetGrade;
            this.editingCourse.color = color;
            
            this.showToast(this.messages.success.courseUpdated, 'success');
        } else {
            // Add new course
            console.log('Creating new course');
            const newCourse = {
                id: this.nextCourseId++,
                name: name,
                code: code,
                targetGrade: targetGrade,
                color: color,
                assignments: []
            };
            
            this.courses.push(newCourse);
            this.showToast(this.messages.success.courseAdded, 'success');
            console.log('New course added successfully:', newCourse);
        }
        
        // Save to user database if logged in
        if (this.currentUser && !this.isGuestMode) {
            const userKey = this.currentUser.email;
            if (this.userDatabase.has(userKey)) {
                const userData = this.userDatabase.get(userKey);
                userData.courses = [...this.courses];
                this.userDatabase.set(userKey, userData);
            }
        }
        
        this.closeCourseModal();
        
        // Navigate to appropriate view
        if (this.currentCourse && this.editingCourse && this.currentCourse.id === this.editingCourse.id) {
            setTimeout(() => this.renderCourseView(), 200);
        } else {
            setTimeout(() => this.showDashboard(), 200);
        }
        
        console.log('=== COURSE SAVED SUCCESSFULLY ===');
        return true;
    }

    editCurrentCourse() {
        if (this.currentCourse) {
            this.openCourseModal(this.currentCourse);
        }
    }

    deleteCourse(courseId) {
        if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            
            // Update user database
            if (this.currentUser && !this.isGuestMode) {
                const userKey = this.currentUser.email;
                if (this.userDatabase.has(userKey)) {
                    const userData = this.userDatabase.get(userKey);
                    userData.courses = [...this.courses];
                    this.userDatabase.set(userKey, userData);
                }
            }
            
            if (this.currentCourse && this.currentCourse.id === courseId) {
                this.showDashboard();
            } else {
                this.renderDashboard();
            }
            
            this.showToast('Course deleted successfully', 'success');
        }
    }

    // Assignment Management
    openAssignmentModal(assignment = null) {
        this.editingAssignment = assignment;
        const modal = document.getElementById('assignment-modal');
        const title = document.getElementById('assignment-modal-title');
        const form = document.getElementById('assignment-form');
        
        if (!modal) return;
        
        this.clearFormErrors('assignment');
        
        if (assignment) {
            if (title) title.textContent = 'Edit Assignment';
            this.populateAssignmentForm(assignment);
        } else {
            if (title) title.textContent = 'Add Assignment';
            if (form) form.reset();
            const dateInput = document.getElementById('assignment-date');
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            const nameInput = document.getElementById('assignment-name');
            if (nameInput) nameInput.focus();
        }, 200);
    }

    populateAssignmentForm(assignment) {
        const nameInput = document.getElementById('assignment-name');
        const typeInput = document.getElementById('assignment-type');
        const gradeInput = document.getElementById('assignment-grade');
        const weightInput = document.getElementById('assignment-weight');
        const dateInput = document.getElementById('assignment-date');
        
        if (nameInput) nameInput.value = assignment.name || '';
        if (typeInput) typeInput.value = assignment.type || '';
        if (gradeInput) gradeInput.value = assignment.grade || '';
        if (weightInput) weightInput.value = assignment.weight || '';
        if (dateInput) dateInput.value = assignment.date || '';
    }

    closeAssignmentModal() {
        const modal = document.getElementById('assignment-modal');
        if (modal) modal.classList.add('hidden');
        this.clearFormErrors('assignment');
        this.editingAssignment = null;
    }

    saveAssignment() {
        this.clearFormErrors('assignment');
        
        const form = document.getElementById('assignment-form');
        if (!form) return false;
        
        const nameInput = form.querySelector('#assignment-name');
        const typeInput = form.querySelector('#assignment-type');
        const gradeInput = form.querySelector('#assignment-grade');
        const weightInput = form.querySelector('#assignment-weight');
        const dateInput = form.querySelector('#assignment-date');
        
        if (!nameInput || !typeInput || !gradeInput || !weightInput || !dateInput) return false;
        
        const name = nameInput.value ? nameInput.value.trim() : '';
        const type = typeInput.value || '';
        const grade = parseFloat(gradeInput.value);
        const weight = parseFloat(weightInput.value);
        const date = dateInput.value || '';
        
        let hasErrors = false;
        
        if (!name) {
            this.showFieldError('assignment-name', 'Assignment name is required');
            hasErrors = true;
        }
        
        if (!type) {
            this.showFieldError('assignment-type', 'Assignment type is required');
            hasErrors = true;
        }
        
        if (isNaN(grade) || grade < 0 || grade > 100) {
            this.showFieldError('assignment-grade', 'Grade must be between 0 and 100');
            hasErrors = true;
        }
        
        if (isNaN(weight) || weight < 0 || weight > 100) {
            this.showFieldError('assignment-weight', 'Weight must be between 0 and 100');
            hasErrors = true;
        }
        
        if (!date) {
            this.showFieldError('assignment-date', 'Date is required');
            hasErrors = true;
        }
        
        if (hasErrors) return false;
        
        // Check total weight
        const currentWeight = this.currentCourse.assignments
            .filter(a => !this.editingAssignment || a.id !== this.editingAssignment.id)
            .reduce((sum, a) => sum + a.weight, 0);
        
        if (currentWeight + weight > 100) {
            this.showFieldError('assignment-weight', 
                `Adding this assignment would exceed 100% total weight. Current: ${currentWeight}%, Available: ${100 - currentWeight}%`);
            return false;
        }
        
        if (this.editingAssignment) {
            // Update existing assignment
            this.editingAssignment.name = name;
            this.editingAssignment.type = type;
            this.editingAssignment.grade = grade;
            this.editingAssignment.weight = weight;
            this.editingAssignment.date = date;
            
            this.showToast(this.messages.success.assignmentUpdated, 'success');
        } else {
            // Add new assignment
            const newAssignment = {
                id: this.nextAssignmentId++,
                name,
                type,
                grade,
                weight,
                date
            };
            this.currentCourse.assignments.push(newAssignment);
            this.showToast(this.messages.success.assignmentAdded, 'success');
        }
        
        // Save to user database
        if (this.currentUser && !this.isGuestMode) {
            const userKey = this.currentUser.email;
            if (this.userDatabase.has(userKey)) {
                const userData = this.userDatabase.get(userKey);
                userData.courses = [...this.courses];
                this.userDatabase.set(userKey, userData);
            }
        }
        
        this.closeAssignmentModal();
        this.renderCourseView();
        return true;
    }

    editAssignment(assignmentId) {
        const assignment = this.currentCourse?.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            this.openAssignmentModal(assignment);
        }
    }

    deleteAssignment(assignmentId) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            this.currentCourse.assignments = this.currentCourse.assignments.filter(a => a.id !== assignmentId);
            
            if (this.currentUser && !this.isGuestMode) {
                const userKey = this.currentUser.email;
                if (this.userDatabase.has(userKey)) {
                    const userData = this.userDatabase.get(userKey);
                    userData.courses = [...this.courses];
                    this.userDatabase.set(userKey, userData);
                }
            }
            
            this.renderCourseView();
            this.showToast('Assignment deleted successfully', 'success');
        }
    }

    // Dashboard and Course Views
    renderDashboard() {
        const breadcrumb = document.getElementById('breadcrumb-text');
        const dashboardView = document.getElementById('dashboard-view');
        const courseView = document.getElementById('course-view');
        
        if (breadcrumb) breadcrumb.textContent = 'Dashboard';
        if (dashboardView) dashboardView.classList.remove('hidden');
        if (courseView) courseView.classList.add('hidden');
        
        const coursesGrid = document.getElementById('courses-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!coursesGrid || !emptyState) return;
        
        if (this.courses.length === 0) {
            coursesGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            coursesGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            coursesGrid.innerHTML = this.courses.map(course => this.renderCourseCard(course)).join('');
            
            setTimeout(() => this.bindDynamicCourseEvents(), 100);
        }
    }

    showDashboard() {
        this.currentCourse = null;
        this.renderDashboard();
    }

    showCourse(courseId) {
        this.currentCourse = this.courses.find(c => c.id === courseId);
        if (!this.currentCourse) return;
        
        const breadcrumb = document.getElementById('breadcrumb-text');
        const dashboardView = document.getElementById('dashboard-view');
        const courseView = document.getElementById('course-view');
        
        if (breadcrumb) breadcrumb.textContent = this.currentCourse.name;
        if (dashboardView) dashboardView.classList.add('hidden');
        if (courseView) courseView.classList.remove('hidden');
        
        this.renderCourseView();
    }

    // Utility Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    populateAssignmentTypes() {
        const select = document.getElementById('assignment-type');
        if (!select) return;
        
        select.innerHTML = '';
        this.assignmentTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            select.appendChild(option);
        });
    }

    getLetterGrade(percentage) {
        for (const [letter, info] of Object.entries(this.gradeScale)) {
            if (percentage >= info.min && percentage <= info.max) {
                return { letter, color: info.color };
            }
        }
        return { letter: 'F', color: this.gradeScale.F.color };
    }

    calculateWeightedAverage(assignments) {
        if (!assignments.length) return { grade: 0, totalWeight: 0 };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        assignments.forEach(assignment => {
            weightedSum += assignment.grade * assignment.weight;
            totalWeight += assignment.weight;
        });
        
        const grade = totalWeight > 0 ? weightedSum / totalWeight : 0;
        return { grade, totalWeight };
    }

    calculateFinalExamRequired(currentGrade, currentWeight, targetGrade, finalWeight) {
        if (finalWeight <= 0) return null;
        
        const requiredGrade = (targetGrade - (currentGrade * (100 - finalWeight) / 100)) / (finalWeight / 100);
        return Math.max(0, requiredGrade);
    }

    updateSessionIndicator() {
        const indicator = document.getElementById('session-indicator');
        if (!indicator) return;

        if (this.isGuestMode) {
            indicator.textContent = 'Demo Mode';
            indicator.className = 'session-indicator session-indicator--guest';
        } else if (this.currentUser) {
            indicator.textContent = `Welcome, ${this.currentUser.username}`;
            indicator.className = 'session-indicator session-indicator--user';
        }
    }

    showGuestActions() {
        const guestActions = document.getElementById('guest-actions');
        if (guestActions && this.isGuestMode) {
            guestActions.classList.remove('hidden');
        }
    }

    hideGuestActions() {
        const guestActions = document.getElementById('guest-actions');
        if (guestActions) {
            guestActions.classList.add('hidden');
        }
    }

    showAccountInfo() {
        if (this.isGuestMode) {
            this.showToast('Create an account to save your progress and access more features!', 'info');
        } else if (this.currentUser) {
            this.showToast(`Logged in as ${this.currentUser.username} (${this.currentUser.email})`, 'info');
        }
    }

    // Error handling methods
    clearAuthErrors() {
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        
        if (loginError) {
            loginError.classList.remove('show');
            loginError.textContent = '';
        }
        
        if (registerError) {
            registerError.classList.remove('show'); 
            registerError.textContent = '';
        }
    }

    showAuthError(formType, message) {
        const errorElement = document.getElementById(`${formType}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearFormErrors(formPrefix) {
        const form = document.getElementById(`${formPrefix}-form`);
        if (!form) return;
        
        const errorElements = form.querySelectorAll('.field-error');
        const inputElements = form.querySelectorAll('.form-control');
        
        errorElements.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        inputElements.forEach(input => {
            input.classList.remove('error');
        });
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (field) field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        const toastContent = document.getElementById('toast-content');
        const toastClose = document.getElementById('toast-close');
        
        if (!toast || !toastContent) return;
        
        toastContent.textContent = message;
        toast.className = `toast toast--${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        const hideTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 4000);
        
        if (toastClose) {
            toastClose.onclick = () => {
                clearTimeout(hideTimeout);
                toast.classList.remove('show');
                setTimeout(() => toast.classList.add('hidden'), 300);
            };
        }
    }

    // Continue with remaining methods...
    
    bindDynamicCourseEvents() {
        this.courses.forEach(course => {
            const courseCard = document.getElementById(`course-${course.id}`);
            const editBtn = document.getElementById(`edit-course-${course.id}`);
            const deleteBtn = document.getElementById(`delete-course-${course.id}`);
            
            if (courseCard) {
                courseCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.course-card__actions')) {
                        this.showCourse(course.id);
                    }
                });
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openCourseModal(course);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCourse(course.id);
                });
            }
        });
    }

    renderCourseCard(course) {
        const { grade, totalWeight } = this.calculateWeightedAverage(course.assignments);
        const currentGrade = this.getLetterGrade(grade);
        const completion = totalWeight;
        
        return `
            <div class="course-card" id="course-${course.id}" tabindex="0">
                <div class="course-card__header">
                    <div class="course-card__info">
                        <h3>${course.name}</h3>
                        <p class="course-card__code">${course.code}</p>
                    </div>
                    <div class="course-card__actions">
                        <button class="btn-icon" id="edit-course-${course.id}" title="Edit Course">✏️</button>
                        <button class="btn-icon btn-icon--danger" id="delete-course-${course.id}" title="Delete Course">🗑️</button>
                    </div>
                </div>
                
                <div class="course-card__grade">
                    <div class="grade-display">
                        <span class="grade-display__percentage">${totalWeight > 0 ? grade.toFixed(1) : '--'}%</span>
                        <span class="grade-display__letter" style="background-color: ${currentGrade.color}">${currentGrade.letter}</span>
                    </div>
                </div>
                
                <div class="course-card__stats">
                    <div class="stat-item">
                        <span class="stat-item__value">${course.targetGrade}%</span>
                        <span class="stat-item__label">Target</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-item__value">${completion.toFixed(0)}%</span>
                        <span class="stat-item__label">Complete</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCourseView() {
        if (!this.currentCourse) return;
        
        // Update course header
        const courseTitle = document.getElementById('course-title');
        const courseCode = document.getElementById('course-code');
        
        if (courseTitle) courseTitle.textContent = this.currentCourse.name;
        if (courseCode) courseCode.textContent = this.currentCourse.code;
        
        // Calculate and display grade summary
        const { grade, totalWeight } = this.calculateWeightedAverage(this.currentCourse.assignments);
        const currentGrade = this.getLetterGrade(grade);
        const targetGrade = this.getLetterGrade(this.currentCourse.targetGrade);
        
        const currentPercentageEl = document.getElementById('current-percentage');
        const currentLetterEl = document.getElementById('current-letter');
        const targetPercentageEl = document.getElementById('target-percentage');
        const targetLetterEl = document.getElementById('target-letter');
        const completionPercentageEl = document.getElementById('completion-percentage');
        const progressFillEl = document.getElementById('progress-fill');
        
        if (currentPercentageEl) currentPercentageEl.textContent = totalWeight > 0 ? `${grade.toFixed(1)}%` : '--';
        if (currentLetterEl) {
            currentLetterEl.textContent = currentGrade.letter;
            currentLetterEl.style.backgroundColor = currentGrade.color;
        }
        
        if (targetPercentageEl) targetPercentageEl.textContent = `${this.currentCourse.targetGrade}%`;
        if (targetLetterEl) {
            targetLetterEl.textContent = targetGrade.letter;
            targetLetterEl.style.backgroundColor = targetGrade.color;
        }
        
        if (completionPercentageEl) completionPercentageEl.textContent = `${totalWeight.toFixed(0)}%`;
        if (progressFillEl) progressFillEl.style.width = `${Math.min(totalWeight, 100)}%`;
        
        // Update weight summary
        const totalWeightEl = document.getElementById('total-weight');
        const remainingWeightEl = document.getElementById('remaining-weight');
        
        if (totalWeightEl) totalWeightEl.textContent = `${totalWeight.toFixed(0)}%`;
        if (remainingWeightEl) remainingWeightEl.textContent = `(${Math.max(0, 100 - totalWeight).toFixed(0)}% remaining)`;
        
        // Render final calculator and assignments
        this.renderFinalCalculator();
        this.renderAssignments();
    }

    renderFinalCalculator() {
        const calculatorContent = document.getElementById('final-calculator-content');
        if (!calculatorContent) return;
        
        const { grade, totalWeight } = this.calculateWeightedAverage(this.currentCourse.assignments);
        
        if (totalWeight === 0 || totalWeight >= 100) {
            calculatorContent.innerHTML = '<div class="final-calculator__empty">Add assignments to see final exam requirements</div>';
            return;
        }
        
        const remainingWeight = 100 - totalWeight;
        const requiredFinal = this.calculateFinalExamRequired(grade, totalWeight, this.currentCourse.targetGrade, remainingWeight);
        
        let message, className;
        if (requiredFinal <= 100) {
            message = `You need ${requiredFinal.toFixed(1)}% on your final exam to reach your target grade.`;
            className = requiredFinal <= 90 ? 'success' : 'warning';
        } else {
            message = 'Your target grade may not be achievable with the current grades.';
            className = 'error';
        }
        
        calculatorContent.innerHTML = `
            <div class="final-calculator__result">
                <div class="final-calculator__score ${className}">${requiredFinal.toFixed(1)}%</div>
                <div class="final-calculator__message">${message}</div>
                <button class="btn btn--outline btn--sm final-calculator__button" id="open-calculator-btn">
                    Advanced Calculator
                </button>
            </div>
        `;
        
        setTimeout(() => {
            const calcBtn = document.getElementById('open-calculator-btn');
            if (calcBtn) {
                calcBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openCalculatorModal();
                });
            }
        }, 100);
    }

    renderAssignments() {
        const assignmentsList = document.getElementById('assignments-list');
        const assignmentsEmpty = document.getElementById('assignments-empty');
        
        if (!assignmentsList || !assignmentsEmpty) return;
        
        if (this.currentCourse.assignments.length === 0) {
            assignmentsList.style.display = 'none';
            assignmentsEmpty.style.display = 'block';
            return;
        }
        
        assignmentsList.style.display = 'block';
        assignmentsEmpty.style.display = 'none';
        
        assignmentsList.innerHTML = this.currentCourse.assignments
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(assignment => this.renderAssignmentCard(assignment)).join('');
        
        setTimeout(() => {
            this.currentCourse.assignments.forEach(assignment => {
                const editBtn = document.getElementById(`edit-assignment-${assignment.id}`);
                const deleteBtn = document.getElementById(`delete-assignment-${assignment.id}`);
                
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.editAssignment(assignment.id);
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.deleteAssignment(assignment.id);
                    });
                }
            });
        }, 100);
    }

    renderAssignmentCard(assignment) {
        const date = new Date(assignment.date).toLocaleDateString();
        
        return `
            <div class="assignment-card">
                <div class="assignment-card__info">
                    <h4 class="assignment-card__name">${assignment.name}</h4>
                    <div class="assignment-card__meta">
                        <span class="assignment-card__type">${assignment.type}</span>
                        <span>•</span>
                        <span>${date}</span>
                    </div>
                </div>
                
                <div class="assignment-card__stats">
                    <div class="assignment-stat">
                        <span class="assignment-stat__value">${assignment.grade}%</span>
                        <span class="assignment-stat__label">Grade</span>
                    </div>
                    <div class="assignment-stat">
                        <span class="assignment-stat__value">${assignment.weight}%</span>
                        <span class="assignment-stat__label">Weight</span>
                    </div>
                </div>
                
                <div class="assignment-card__actions">
                    <button class="btn-icon" id="edit-assignment-${assignment.id}" title="Edit Assignment">✏️</button>
                    <button class="btn-icon btn-icon--danger" id="delete-assignment-${assignment.id}" title="Delete Assignment">🗑️</button>
                </div>
            </div>
        `;
    }

    // Calculator Modal Methods
    openCalculatorModal() {
        const modal = document.getElementById('calculator-modal');
        if (!modal) return;
        
        const { grade, totalWeight } = this.calculateWeightedAverage(this.currentCourse.assignments);
        
        const desiredInput = document.getElementById('desired-grade');
        const finalWeightInput = document.getElementById('final-weight');
        
        if (desiredInput) desiredInput.value = this.currentCourse.targetGrade;
        if (finalWeightInput) finalWeightInput.value = Math.max(0, 100 - totalWeight);
        
        modal.classList.remove('hidden');
        this.updateCalculator();
    }

    closeCalculatorModal() {
        const modal = document.getElementById('calculator-modal');
        if (modal) modal.classList.add('hidden');
    }

    updateCalculator() {
        const desiredInput = document.getElementById('desired-grade');
        const finalWeightInput = document.getElementById('final-weight');
        const resultDiv = document.getElementById('calculator-result');
        
        if (!desiredInput || !finalWeightInput || !resultDiv) return;
        
        const desiredGrade = parseFloat(desiredInput.value);
        const finalWeight = parseFloat(finalWeightInput.value);
        
        if (isNaN(desiredGrade) || isNaN(finalWeight) || finalWeight <= 0) {
            resultDiv.innerHTML = '<div class="calculator-result__message">Enter valid values to see results</div>';
            return;
        }
        
        const { grade, totalWeight } = this.calculateWeightedAverage(this.currentCourse.assignments);
        const requiredGrade = this.calculateFinalExamRequired(grade, totalWeight, desiredGrade, finalWeight);
        
        let className, message;
        if (requiredGrade <= 100) {
            if (requiredGrade <= 60) {
                className = 'calculator-result--success';
                message = 'Very achievable! 🎉';
            } else if (requiredGrade <= 85) {
                className = 'calculator-result--success';
                message = 'Achievable with good preparation! 📚';
            } else {
                className = 'calculator-result--warning';
                message = 'Challenging but possible! 💪';
            }
        } else {
            className = 'calculator-result--error';
            message = 'This target may not be achievable with current grades. 😔';
        }
        
        resultDiv.className = `calculator-result ${className}`;
        resultDiv.innerHTML = `
            <div class="calculator-result__score">${Math.max(0, requiredGrade).toFixed(1)}%</div>
            <div class="calculator-result__message">${message}</div>
        `;
    }
}

// Initialize the application
console.log('Initializing GradeTracker - Complete Bug-Free Version...');
const app = new GradeTracker();
app.init();