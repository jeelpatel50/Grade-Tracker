// GradeTracker Pro Application
class GradeTrackerPro {
    constructor() {
        this.currentUser = null;
        this.currentCourse = null;
        this.editingCourse = null;
        this.editingAssignment = null;
        this.nextCourseId = 1;
        this.nextAssignmentId = 1;
        
        // Configuration from application data
        this.config = {
            appName: "GradeTracker Pro",
            version: "2.0",
            maxCourses: 20,
            sessionTimeout: 86400000, // 24 hours
            minPasswordLength: 8
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
        
        this.courseColors = {
            blue: { primary: "#3b82f6", secondary: "#dbeafe" },
            green: { primary: "#10b981", secondary: "#d1fae5" },
            purple: { primary: "#8b5cf6", secondary: "#e9d5ff" },
            orange: { primary: "#f97316", secondary: "#fed7aa" },
            pink: { primary: "#ec4899", secondary: "#fce7f3" },
            teal: { primary: "#14b8a6", secondary: "#ccfbf1" },
            red: { primary: "#ef4444", secondary: "#fee2e2" },
            yellow: { primary: "#eab308", secondary: "#fef3c7" }
        };
        
        this.messages = {
            success: {
                register: "Account created successfully! Welcome!",
                login: "Welcome back!",
                courseAdded: "Course added successfully!",
                assignmentAdded: "Assignment added successfully!",
                profileUpdated: "Profile updated successfully!"
            },
            errors: {
                userExists: "Username or email already exists",
                invalidLogin: "Invalid username/email or password",
                passwordMismatch: "Passwords do not match",
                invalidEmail: "Please enter a valid email address",
                weakPassword: "Password must be at least 8 characters long",
                invalidGrade: "Grade must be between 0 and 100",
                weightExceeded: "Total weight cannot exceed 100%",
                emptyField: "This field is required"
            }
        };
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        this.initializeStorage();
        this.populateAssignmentTypes();
        this.bindEvents();
        this.checkExistingSession();
    }

    // Storage Management
    initializeStorage() {
        if (!localStorage.getItem('gradeTracker')) {
            const initialData = {
                users: {},
                currentUser: null,
                lastUsed: Date.now()
            };
            localStorage.setItem('gradeTracker', JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('gradeTracker') || '{}');
    }

    saveData(data) {
        data.lastUsed = Date.now();
        localStorage.setItem('gradeTracker', JSON.stringify(data));
    }

    checkExistingSession() {
        const data = this.getData();
        if (data.currentUser && data.users[data.currentUser]) {
            const user = data.users[data.currentUser];
            const timeDiff = Date.now() - (data.lastUsed || 0);
            
            if (timeDiff < this.config.sessionTimeout) {
                this.currentUser = user;
                this.loadUserData();
                this.showMainApp();
                return;
            }
        }
        this.showAuthView();
    }

    // Authentication Methods
    showAuthView() {
        const authView = document.getElementById('auth-view');
        const mainView = document.getElementById('main-view');
        
        if (authView) authView.classList.remove('hidden');
        if (mainView) mainView.classList.add('hidden');
        
        this.showWelcomeScreen();
    }

    showMainApp() {
        const authView = document.getElementById('auth-view');
        const mainView = document.getElementById('main-view');
        
        if (authView) authView.classList.add('hidden');
        if (mainView) mainView.classList.remove('hidden');
        
        const usernameEl = document.getElementById('header-username');
        if (usernameEl && this.currentUser) {
            usernameEl.textContent = this.currentUser.profile.username;
        }
        
        this.renderDashboard();
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const loginScreen = document.getElementById('login-screen');
        const registerScreen = document.getElementById('register-screen');
        
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (loginScreen) loginScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
    }

    showLoginScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const loginScreen = document.getElementById('login-screen');
        const registerScreen = document.getElementById('register-screen');
        
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
        
        // Clear any previous errors and form data
        this.hideError('login-error');
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
        
        // Focus on username input
        setTimeout(() => {
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }

    showRegisterScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const loginScreen = document.getElementById('login-screen');
        const registerScreen = document.getElementById('register-screen');
        
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (loginScreen) loginScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.remove('hidden');
        
        // Clear any previous errors and form data
        this.hideError('register-error');
        const registerForm = document.getElementById('register-form');
        if (registerForm) registerForm.reset();
        
        // Focus on username input
        setTimeout(() => {
            const usernameInput = document.getElementById('register-username');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }

    validateEmail(email) {
        const pattern = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }

    validateUsername(username) {
        const pattern = /^[a-zA-Z0-9_]+$/;
        return username.length >= 3 && username.length <= 20 && pattern.test(username);
    }

    hashPassword(password) {
        // Simple client-side hash for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    register(username, email, password, confirmPassword) {
        // Clear previous errors
        this.hideError('register-error');

        // Validate inputs
        if (!username || !email || !password || !confirmPassword) {
            this.showError('register-error', this.messages.errors.emptyField);
            return;
        }

        if (!this.validateUsername(username)) {
            this.showError('register-error', 'Username must be 3-20 characters, letters, numbers, and underscores only');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('register-error', this.messages.errors.invalidEmail);
            return;
        }

        if (password.length < this.config.minPasswordLength) {
            this.showError('register-error', this.messages.errors.weakPassword);
            return;
        }

        if (password !== confirmPassword) {
            this.showError('register-error', this.messages.errors.passwordMismatch);
            return;
        }

        // Check if user already exists
        const data = this.getData();
        const userExists = Object.values(data.users).some(user => 
            user.profile.username === username || user.profile.email === email
        );

        if (userExists) {
            this.showError('register-error', this.messages.errors.userExists);
            return;
        }

        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            profile: {
                username,
                email,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            },
            courses: []
        };

        data.users[userId] = newUser;
        data.currentUser = userId;
        this.saveData(data);

        this.currentUser = newUser;
        this.loadUserData();
        this.showToast('success', this.messages.success.register);
        this.showMainApp();
    }

    login(usernameOrEmail, password) {
        this.hideError('login-error');

        if (!usernameOrEmail || !password) {
            this.showError('login-error', this.messages.errors.emptyField);
            return;
        }

        const data = this.getData();
        const hashedPassword = this.hashPassword(password);

        // Find user by username or email
        const userEntry = Object.entries(data.users).find(([userId, user]) => 
            (user.profile.username === usernameOrEmail || user.profile.email === usernameOrEmail) &&
            user.profile.password === hashedPassword
        );

        if (!userEntry) {
            this.showError('login-error', this.messages.errors.invalidLogin);
            return;
        }

        const [userId, user] = userEntry;
        data.currentUser = userId;
        this.saveData(data);

        this.currentUser = user;
        this.loadUserData();
        this.showToast('success', this.messages.success.login);
        this.showMainApp();
    }

    logout() {
        const data = this.getData();
        data.currentUser = null;
        this.saveData(data);
        
        this.currentUser = null;
        this.currentCourse = null;
        this.showAuthView();
    }

    loadUserData() {
        if (!this.currentUser.courses) {
            this.currentUser.courses = [];
        }
        
        // Set next IDs based on existing data
        this.nextCourseId = Math.max(
            ...this.currentUser.courses.map(c => c.id),
            0
        ) + 1;
        
        this.nextAssignmentId = Math.max(
            ...this.currentUser.courses.flatMap(c => c.assignments?.map(a => a.id) || []),
            0
        ) + 1;
    }

    saveUserData() {
        const data = this.getData();
        if (data.currentUser && data.users[data.currentUser]) {
            data.users[data.currentUser] = this.currentUser;
            this.saveData(data);
        }
    }

    // Event Binding
    bindEvents() {
        // Wait for DOM to be fully loaded
        setTimeout(() => {
            this.bindAuthEvents();
            this.bindMainAppEvents();
            this.bindModalEvents();
        }, 0);
    }

    bindAuthEvents() {
        // Auth navigation events with proper null checks
        const showLoginBtn = document.getElementById('show-login-btn');
        const showRegisterBtn = document.getElementById('show-register-btn');
        const backToWelcome = document.getElementById('back-to-welcome');
        const backToWelcome2 = document.getElementById('back-to-welcome-2');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showLoginScreen();
            });
        }

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showRegisterScreen();
            });
        }

        if (backToWelcome) {
            backToWelcome.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showWelcomeScreen();
            });
        }

        if (backToWelcome2) {
            backToWelcome2.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showWelcomeScreen();
            });
        }

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showRegisterScreen();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showLoginScreen();
            });
        }

        // Auth form events
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const usernameInput = document.getElementById('login-username');
                const passwordInput = document.getElementById('login-password');
                
                if (usernameInput && passwordInput) {
                    const username = usernameInput.value.trim();
                    const password = passwordInput.value;
                    this.login(username, password);
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const usernameInput = document.getElementById('register-username');
                const emailInput = document.getElementById('register-email');
                const passwordInput = document.getElementById('register-password');
                const confirmInput = document.getElementById('register-confirm');
                
                if (usernameInput && emailInput && passwordInput && confirmInput) {
                    const username = usernameInput.value.trim();
                    const email = emailInput.value.trim();
                    const password = passwordInput.value;
                    const confirmPassword = confirmInput.value;
                    this.register(username, email, password, confirmPassword);
                }
            });
        }
    }

    bindMainAppEvents() {
        // User menu events
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('user-menu-dropdown');
                if (dropdown) {
                    const isOpen = !dropdown.classList.contains('hidden');
                    
                    if (isOpen) {
                        dropdown.classList.add('hidden');
                        userMenuBtn.setAttribute('aria-expanded', 'false');
                    } else {
                        dropdown.classList.remove('hidden');
                        userMenuBtn.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-menu-dropdown');
            const userMenuBtn = document.getElementById('user-menu-btn');
            
            if (dropdown && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
                if (userMenuBtn) userMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (profileBtn) profileBtn.addEventListener('click', () => this.openProfileModal());
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // Dashboard events
        const addCourseBtn = document.getElementById('add-course-btn');
        const addFirstCourseBtn = document.getElementById('add-first-course-btn');
        const backToDashboard = document.getElementById('back-to-dashboard');

        if (addCourseBtn) addCourseBtn.addEventListener('click', () => this.openCourseModal());
        if (addFirstCourseBtn) addFirstCourseBtn.addEventListener('click', () => this.openCourseModal());
        if (backToDashboard) backToDashboard.addEventListener('click', () => this.showDashboard());

        // Course view events
        const editCourseBtn = document.getElementById('edit-course-btn');
        const addAssignmentBtn = document.getElementById('add-assignment-btn');

        if (editCourseBtn) editCourseBtn.addEventListener('click', () => this.editCourse());
        if (addAssignmentBtn) addAssignmentBtn.addEventListener('click', () => this.openAssignmentModal());
    }

    bindModalEvents() {
        // Course modal
        const courseModalClose = document.getElementById('course-modal-close');
        const courseCancelBtn = document.getElementById('course-cancel-btn');
        const courseSaveBtn = document.getElementById('course-save-btn');

        if (courseModalClose) courseModalClose.addEventListener('click', () => this.closeCourseModal());
        if (courseCancelBtn) courseCancelBtn.addEventListener('click', () => this.closeCourseModal());
        if (courseSaveBtn) courseSaveBtn.addEventListener('click', () => this.saveCourse());

        // Assignment modal
        const assignmentModalClose = document.getElementById('assignment-modal-close');
        const assignmentCancelBtn = document.getElementById('assignment-cancel-btn');
        const assignmentSaveBtn = document.getElementById('assignment-save-btn');

        if (assignmentModalClose) assignmentModalClose.addEventListener('click', () => this.closeAssignmentModal());
        if (assignmentCancelBtn) assignmentCancelBtn.addEventListener('click', () => this.closeAssignmentModal());
        if (assignmentSaveBtn) assignmentSaveBtn.addEventListener('click', () => this.saveAssignment());

        // Profile modal
        const profileModalClose = document.getElementById('profile-modal-close');
        const profileCloseBtn = document.getElementById('profile-close-btn');

        if (profileModalClose) profileModalClose.addEventListener('click', () => this.closeProfileModal());
        if (profileCloseBtn) profileCloseBtn.addEventListener('click', () => this.closeProfileModal());

        // Modal backdrop clicks
        document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    const modal = backdrop.closest('.modal');
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                }
            });
        });

        // Form submit prevention for modals
        const courseForm = document.getElementById('course-form');
        const assignmentForm = document.getElementById('assignment-form');

        if (courseForm) {
            courseForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }

        if (assignmentForm) {
            assignmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
    }

    // UI Helper Methods
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    showToast(type, message) {
        const toastId = `${type}-toast`;
        const messageId = `${type}-message`;
        
        const toast = document.getElementById(toastId);
        const messageElement = document.getElementById(messageId);
        
        if (toast && messageElement) {
            messageElement.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 4000);
        }
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
        if (!assignments || !assignments.length) return { grade: 0, totalWeight: 0 };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        assignments.forEach(assignment => {
            weightedSum += assignment.grade * assignment.weight;
            totalWeight += assignment.weight;
        });
        
        const grade = totalWeight > 0 ? weightedSum / totalWeight : 0;
        return { grade, totalWeight };
    }

    // Dashboard Methods
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
        
        if (!this.currentUser.courses || this.currentUser.courses.length === 0) {
            coursesGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        coursesGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        coursesGrid.innerHTML = this.currentUser.courses.map(course => this.renderCourseCard(course)).join('');
        
        // Bind course card events after rendering
        setTimeout(() => {
            this.currentUser.courses.forEach(course => {
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
                        this.editCourse(course.id);
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteCourse(course.id);
                    });
                }
            });
        }, 0);
    }

    renderCourseCard(course) {
        const assignments = course.assignments || [];
        const { grade, totalWeight } = this.calculateWeightedAverage(assignments);
        const currentGrade = this.getLetterGrade(grade);
        const targetGrade = this.getLetterGrade(course.targetGrade);
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

    showDashboard() {
        this.currentCourse = null;
        this.renderDashboard();
    }

    showCourse(courseId) {
        this.currentCourse = this.currentUser.courses.find(c => c.id === courseId);
        if (!this.currentCourse) return;
        
        const breadcrumb = document.getElementById('breadcrumb-text');
        const dashboardView = document.getElementById('dashboard-view');
        const courseView = document.getElementById('course-view');
        
        if (breadcrumb) breadcrumb.textContent = this.currentCourse.name;
        if (dashboardView) dashboardView.classList.add('hidden');
        if (courseView) courseView.classList.remove('hidden');
        
        this.renderCourseView();
    }

    renderCourseView() {
        if (!this.currentCourse) return;
        
        // Update course header
        const courseTitle = document.getElementById('course-title');
        const courseCode = document.getElementById('course-code');
        
        if (courseTitle) courseTitle.textContent = this.currentCourse.name;
        if (courseCode) courseCode.textContent = this.currentCourse.code;
        
        // Calculate and display grade summary
        const assignments = this.currentCourse.assignments || [];
        const { grade, totalWeight } = this.calculateWeightedAverage(assignments);
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
        
        // Render final calculator
        this.renderFinalCalculator();
        
        // Render assignments
        this.renderAssignments();
    }

    renderFinalCalculator() {
        const calculatorContent = document.getElementById('final-calculator-content');
        if (!calculatorContent) return;
        
        const assignments = this.currentCourse.assignments || [];
        const { grade, totalWeight } = this.calculateWeightedAverage(assignments);
        
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
            </div>
        `;
    }

    calculateFinalExamRequired(currentGrade, currentWeight, targetGrade, finalWeight) {
        if (finalWeight <= 0) return null;
        
        const requiredGrade = (targetGrade - (currentGrade * (100 - finalWeight) / 100)) / (finalWeight / 100);
        return Math.max(0, requiredGrade);
    }

    renderAssignments() {
        const assignmentsList = document.getElementById('assignments-list');
        const assignmentsEmpty = document.getElementById('assignments-empty');
        
        if (!assignmentsList || !assignmentsEmpty) return;
        
        const assignments = this.currentCourse.assignments || [];
        
        if (assignments.length === 0) {
            assignmentsList.style.display = 'none';
            assignmentsEmpty.style.display = 'block';
            return;
        }
        
        assignmentsList.style.display = 'block';
        assignmentsEmpty.style.display = 'none';
        
        assignmentsList.innerHTML = assignments
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(assignment => this.renderAssignmentCard(assignment)).join('');
        
        // Bind assignment events after rendering
        setTimeout(() => {
            assignments.forEach(assignment => {
                const editBtn = document.getElementById(`edit-assignment-${assignment.id}`);
                const deleteBtn = document.getElementById(`delete-assignment-${assignment.id}`);
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => this.editAssignment(assignment.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => this.deleteAssignment(assignment.id));
                }
            });
        }, 0);
    }

    renderAssignmentCard(assignment) {
        const gradeInfo = this.getLetterGrade(assignment.grade);
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

    // Course Modal Methods
    openCourseModal(course = null) {
        this.editingCourse = course;
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const form = document.getElementById('course-form');
        
        if (!modal) return;
        
        if (course) {
            if (title) title.textContent = 'Edit Course';
            const nameInput = document.getElementById('course-name');
            const codeInput = document.getElementById('course-code');
            const targetInput = document.getElementById('target-grade');
            const colorInput = document.getElementById('course-color');
            
            if (nameInput) nameInput.value = course.name;
            if (codeInput) codeInput.value = course.code;
            if (targetInput) targetInput.value = course.targetGrade;
            if (colorInput) colorInput.value = course.color || 'blue';
        } else {
            if (title) title.textContent = 'Add Course';
            if (form) form.reset();
        }
        
        modal.classList.remove('hidden');
        const nameInput = document.getElementById('course-name');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
        }
    }

    closeCourseModal() {
        const modal = document.getElementById('course-modal');
        if (modal) modal.classList.add('hidden');
        this.editingCourse = null;
    }

    saveCourse() {
        const nameInput = document.getElementById('course-name');
        const codeInput = document.getElementById('course-code');
        const targetInput = document.getElementById('target-grade');
        const colorInput = document.getElementById('course-color');
        
        if (!nameInput || !codeInput || !targetInput || !colorInput) return;
        
        const name = nameInput.value.trim();
        const code = codeInput.value.trim();
        const targetGrade = parseFloat(targetInput.value);
        const color = colorInput.value;
        
        if (!name || !code || !targetGrade || !color || targetGrade < 0 || targetGrade > 100) {
            this.showToast('error', 'Please fill in all fields with valid values.');
            return;
        }
        
        if (this.editingCourse) {
            // Edit existing course
            this.editingCourse.name = name;
            this.editingCourse.code = code;
            this.editingCourse.targetGrade = targetGrade;
            this.editingCourse.color = color;
        } else {
            // Add new course
            const newCourse = {
                id: this.nextCourseId++,
                name,
                code,
                targetGrade,
                color,
                assignments: []
            };
            
            if (!this.currentUser.courses) {
                this.currentUser.courses = [];
            }
            this.currentUser.courses.push(newCourse);
        }
        
        this.saveUserData();
        this.closeCourseModal();
        this.showToast('success', this.messages.success.courseAdded);
        
        if (this.currentCourse && this.editingCourse) {
            this.renderCourseView();
        } else {
            this.renderDashboard();
        }
    }

    // Assignment Modal Methods
    openAssignmentModal(assignment = null) {
        this.editingAssignment = assignment;
        const modal = document.getElementById('assignment-modal');
        const title = document.getElementById('assignment-modal-title');
        const form = document.getElementById('assignment-form');
        
        if (!modal) return;
        
        if (assignment) {
            if (title) title.textContent = 'Edit Assignment';
            const nameInput = document.getElementById('assignment-name');
            const typeInput = document.getElementById('assignment-type');
            const gradeInput = document.getElementById('assignment-grade');
            const weightInput = document.getElementById('assignment-weight');
            const dateInput = document.getElementById('assignment-date');
            
            if (nameInput) nameInput.value = assignment.name;
            if (typeInput) typeInput.value = assignment.type;
            if (gradeInput) gradeInput.value = assignment.grade;
            if (weightInput) weightInput.value = assignment.weight;
            if (dateInput) dateInput.value = assignment.date;
        } else {
            if (title) title.textContent = 'Add Assignment';
            if (form) form.reset();
            const dateInput = document.getElementById('assignment-date');
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.remove('hidden');
        const nameInput = document.getElementById('assignment-name');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
        }
    }

    closeAssignmentModal() {
        const modal = document.getElementById('assignment-modal');
        if (modal) modal.classList.add('hidden');
        this.editingAssignment = null;
    }

    saveAssignment() {
        const nameInput = document.getElementById('assignment-name');
        const typeInput = document.getElementById('assignment-type');
        const gradeInput = document.getElementById('assignment-grade');
        const weightInput = document.getElementById('assignment-weight');
        const dateInput = document.getElementById('assignment-date');
        
        if (!nameInput || !typeInput || !gradeInput || !weightInput || !dateInput) return;
        
        const name = nameInput.value.trim();
        const type = typeInput.value;
        const grade = parseFloat(gradeInput.value);
        const weight = parseFloat(weightInput.value);
        const date = dateInput.value;
        
        if (!name || !type || isNaN(grade) || isNaN(weight) || !date || 
            grade < 0 || grade > 100 || weight < 0 || weight > 100) {
            this.showToast('error', 'Please fill in all fields with valid values.');
            return;
        }
        
        // Check total weight
        const assignments = this.currentCourse.assignments || [];
        const currentWeight = assignments
            .filter(a => !this.editingAssignment || a.id !== this.editingAssignment.id)
            .reduce((sum, a) => sum + a.weight, 0);
        
        if (currentWeight + weight > 100) {
            this.showToast('error', `Adding this assignment would exceed 100% total weight. Current total: ${currentWeight}%, Remaining: ${100 - currentWeight}%`);
            return;
        }
        
        if (this.editingAssignment) {
            // Edit existing assignment
            this.editingAssignment.name = name;
            this.editingAssignment.type = type;
            this.editingAssignment.grade = grade;
            this.editingAssignment.weight = weight;
            this.editingAssignment.date = date;
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
            
            if (!this.currentCourse.assignments) {
                this.currentCourse.assignments = [];
            }
            this.currentCourse.assignments.push(newAssignment);
        }
        
        this.saveUserData();
        this.closeAssignmentModal();
        this.showToast('success', this.messages.success.assignmentAdded);
        this.renderCourseView();
    }

    // Profile Modal Methods
    openProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        
        const usernameEl = document.getElementById('profile-username');
        const emailEl = document.getElementById('profile-email');
        const createdEl = document.getElementById('profile-created');
        
        if (usernameEl) usernameEl.textContent = this.currentUser.profile.username;
        if (emailEl) emailEl.textContent = this.currentUser.profile.email;
        if (createdEl) createdEl.textContent = new Date(this.currentUser.profile.createdAt).toLocaleDateString();
        
        modal.classList.remove('hidden');
    }

    closeProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
    }

    // CRUD Operations
    editCourse(courseId = null) {
        const course = courseId ? this.currentUser.courses.find(c => c.id === courseId) : this.currentCourse;
        if (course) {
            this.openCourseModal(course);
        }
    }

    deleteCourse(courseId) {
        if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            this.currentUser.courses = this.currentUser.courses.filter(c => c.id !== courseId);
            this.saveUserData();
            
            if (this.currentCourse && this.currentCourse.id === courseId) {
                this.showDashboard();
            } else {
                this.renderDashboard();
            }
        }
    }

    editAssignment(assignmentId) {
        const assignment = this.currentCourse.assignments?.find(a => a.id === assignmentId);
        if (assignment) {
            this.openAssignmentModal(assignment);
        }
    }

    deleteAssignment(assignmentId) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            if (this.currentCourse.assignments) {
                this.currentCourse.assignments = this.currentCourse.assignments.filter(a => a.id !== assignmentId);
                this.saveUserData();
                this.renderCourseView();
            }
        }
    }
}

// Initialize the application when DOM is ready
const app = new GradeTrackerPro();
app.init();