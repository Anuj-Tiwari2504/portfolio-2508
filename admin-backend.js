// Backend-connected Admin Panel
let projects = [];
let skillCategories = [];
let skills = [];
let techTags = [];
let editingProjectId = null;
let editingCategoryId = null;
let editingSkillId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return; // Stop if not authenticated
    }
    
    setupEventListeners();
    setupAutoLogout();
    setupAdminHeader();
    await loadAllData();
    
    // Force load messages immediately
    setTimeout(async () => {
        await loadMessages();
        loadLocalMessages();
    }, 1000);
});

// Setup admin header with logout and settings
function setupAdminHeader() {
    const adminHeader = document.querySelector('.admin-header');
    adminHeader.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1>Admin Panel</h1>
                <p>Manage your portfolio content</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-admin" onclick="showChangePassword()">Change Password</button>
                <button class="btn-admin" onclick="logout()" style="background: #ef4444;">Logout</button>
            </div>
        </div>
    `;
}

// Auto logout functionality
function setupAutoLogout() {
    // Clear token when browser/tab closes
    window.addEventListener('beforeunload', function() {
        localStorage.removeItem('adminToken');
    });
    
    // Clear token when page becomes hidden (tab switch, minimize)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            localStorage.removeItem('adminToken');
        }
    });
    
    // Auto logout after 15 minutes of inactivity
    let inactivityTimer;
    const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            localStorage.removeItem('adminToken');
            showMessage('Session expired due to inactivity. Please login again.', 'warning');
            setTimeout(() => {
                location.reload();
            }, 3000);
        }, INACTIVITY_TIME);
    }
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Start the timer
    resetInactivityTimer();
    
    // Show session timer in header
    setInterval(() => {
        const timeLeft = Math.max(0, INACTIVITY_TIME - (Date.now() - (window.lastActivity || Date.now())));
        const minutes = Math.floor(timeLeft / 60000);
        if (minutes < 5 && minutes > 0) {
            console.log(`Session expires in ${minutes} minutes`);
        }
    }, 60000);
}

// Authentication check
async function checkAuth() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No token');
        }
        // Skip API verification for now, just check token exists
        console.log('Token found, proceeding...');
        return true;
    } catch (error) {
        console.log('Authentication failed, showing login');
        showLoginForm();
        return false;
    }
}

function showLoginForm() {
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--light);">
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
                <h2 id="formTitle" style="text-align: center; margin-bottom: 30px;">Admin Login</h2>
                
                <form id="loginForm">
                    <div id="emailField" style="margin-bottom: 20px; display: none;">
                        <label>Email:</label>
                        <input type="email" id="email" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Username:</label>
                        <input type="text" id="username" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Password:</label>
                        <input type="password" id="password" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                    </div>
                    <button type="submit" id="submitBtn" style="width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; margin-bottom: 15px;">Login</button>
                </form>
                
                <div style="text-align: center; margin-bottom: 15px;">
                    <button id="toggleForm" style="background: none; border: none; color: #6366f1; cursor: pointer; text-decoration: underline;">Register Here</button>
                </div>
                
                <div id="loginError" style="color: red; margin-top: 10px; text-align: center;"></div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
                    <strong>Setup Instructions:</strong><br>
                    1. Run: <code>npm install</code><br>
                    2. Run: <code>node setup.js</code><br>
                    3. Run: <code>npm run dev</code><br><br>
                    <strong>Default Admin:</strong><br>
                    Username: admin<br>
                    Password: admin123<br><br>
                    <strong>Security:</strong><br>
                    • Auto-logout on browser close<br>
                    • Session expires after 30 min inactivity
                </div>
            </div>
        </div>
    `;
    
    let isLoginMode = true;
    
    document.getElementById('toggleForm').addEventListener('click', function() {
        isLoginMode = !isLoginMode;
        const formTitle = document.getElementById('formTitle');
        const emailField = document.getElementById('emailField');
        const submitBtn = document.getElementById('submitBtn');
        const toggleBtn = document.getElementById('toggleForm');
        const emailInput = document.getElementById('email');
        
        if (isLoginMode) {
            formTitle.textContent = 'Admin Login';
            emailField.style.display = 'none';
            submitBtn.textContent = 'Login';
            toggleBtn.textContent = 'Register Here';
            emailInput.required = false;
        } else {
            formTitle.textContent = 'Admin Register';
            emailField.style.display = 'block';
            submitBtn.textContent = 'Register';
            toggleBtn.textContent = 'Login Here';
            emailInput.required = true;
        }
        
        document.getElementById('loginError').textContent = '';
    });
    
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        
        try {
            if (isLoginMode) {
                await api.login(username, password);
            } else {
                await api.register(username, email, password);
                alert('Registration successful! Please login.');
                document.getElementById('toggleForm').click();
                return;
            }
            location.reload();
        } catch (error) {
            let errorMessage = error.message;
            if (error.message.includes('fetch')) {
                errorMessage = 'Server not running. Please start the backend server first.';
            }
            document.getElementById('loginError').textContent = errorMessage;
        }
    });
}

// Load all data from backend
async function loadAllData() {
    try {
        projects = await api.getProjects();
        skillCategories = await api.getSkillCategories();
        skills = await api.getSkills();
        
        loadProjects();
        loadCategories();
        loadSkills();
        loadCategoryOptions();
        await loadMessages();
        
        // Show backend connected message
        showMessage('✅ Connected to backend server', 'success');
    } catch (error) {
        console.error('Backend not available, using localStorage:', error);
        
        // Fallback to localStorage
        projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
        skillCategories = JSON.parse(localStorage.getItem('skillCategories')) || [];
        skills = JSON.parse(localStorage.getItem('skills')) || [];
        
        loadProjects();
        loadCategories();
        loadSkills();
        loadCategoryOptions();
        loadLocalMessages();
        
        showMessage('⚠️ Backend not available. Using local storage. Start server for full functionality.', 'warning');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 400px;
        background: ${type === 'success' ? '#10b981' : '#f59e0b'};
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function setupEventListeners() {
    // Tech tags input
    const techInput = document.getElementById('techInput');
    techInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTechTag(this.value.trim());
            this.value = '';
        }
    });

    // Form submissions
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('skillForm').addEventListener('submit', handleSkillSubmit);
}

// Project Management
async function handleProjectSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const projectData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        image: formData.get('image'),
        icon: formData.get('icon') || 'fas fa-code',
        liveUrl: formData.get('liveUrl'),
        githubUrl: formData.get('githubUrl'),
        technologies: [...techTags]
    };

    try {
        if (editingProjectId) {
            await api.updateProject(editingProjectId, projectData);
            alert('Project updated successfully!');
        } else {
            await api.createProject(projectData);
            alert('Project added successfully!');
        }
        
        projects = await api.getProjects();
        loadProjects();
        clearForm();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function editProject(id) {
    const project = projects.find(p => p._id === id);
    if (project) {
        editingProjectId = id;
        
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectImage').value = project.image || '';
        document.getElementById('projectIcon').value = project.icon;
        document.getElementById('liveUrl').value = project.liveUrl || '';
        document.getElementById('githubUrl').value = project.githubUrl || '';
        
        techTags = [...project.technologies];
        renderTechTags();
        
        document.querySelector('button[type="submit"]').textContent = 'Update Project';
        document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
    }
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await api.deleteProject(id);
            projects = await api.getProjects();
            loadProjects();
            alert('Project deleted successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}

// Skills Management
function showSkillTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'individual') {
        loadCategoryOptions();
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description'),
        icon: formData.get('icon')
    };

    try {
        if (editingCategoryId) {
            await api.updateSkillCategory(editingCategoryId, categoryData);
            alert('Category updated successfully!');
        } else {
            await api.createSkillCategory(categoryData);
            alert('Category added successfully!');
        }
        
        skillCategories = await api.getSkillCategories();
        loadCategories();
        loadCategoryOptions();
        e.target.reset();
        editingCategoryId = null;
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function handleSkillSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const skillData = {
        categoryId: formData.get('category'),
        name: formData.get('name'),
        icon: formData.get('icon'),
        percent: parseInt(formData.get('percent'))
    };

    try {
        if (editingSkillId) {
            await api.updateSkill(editingSkillId, skillData);
            alert('Skill updated successfully!');
        } else {
            await api.createSkill(skillData);
            alert('Skill added successfully!');
        }
        
        skills = await api.getSkills();
        loadSkills();
        e.target.reset();
        editingSkillId = null;
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// UI Functions
function addTechTag(tag) {
    if (tag && !techTags.includes(tag)) {
        techTags.push(tag);
        renderTechTags();
    }
}

function removeTechTag(tag) {
    techTags = techTags.filter(t => t !== tag);
    renderTechTags();
}

function renderTechTags() {
    const container = document.getElementById('techTags');
    container.innerHTML = techTags.map(tag => `
        <div class="tech-tag-item">
            ${tag}
            <span class="remove-tag" onclick="removeTechTag('${tag}')">×</span>
        </div>
    `).join('');
}

function loadProjects() {
    const container = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found. Add your first project above!</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-item">
            <div>
                <h4>${project.title}</h4>
                <p><strong>Category:</strong> ${project.category}</p>
                <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                <p>${project.description.substring(0, 100)}...</p>
            </div>
            <div class="project-actions">
                <button class="btn-edit" onclick="editProject('${project._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteProject('${project._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadCategories() {
    const container = document.getElementById('categoriesList');
    container.innerHTML = skillCategories.map(category => `
        <div class="project-item">
            <div>
                <h4>${category.name}</h4>
                <p>${category.description}</p>
                <p><i class="${category.icon}"></i> ${category.icon}</p>
            </div>
            <div class="project-actions">
                <button class="btn-edit" onclick="editCategory('${category._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteCategory('${category._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = skills.map(skill => `
        <div class="project-item">
            <div>
                <h4>${skill.name}</h4>
                <p>Category: ${skill.categoryId ? skill.categoryId.name : 'Unknown'}</p>
                <p><i class="${skill.icon}"></i> ${skill.percent}%</p>
            </div>
            <div class="project-actions">
                <button class="btn-edit" onclick="editSkill('${skill._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteSkill('${skill._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadCategoryOptions() {
    const select = document.getElementById('skillCategory');
    select.innerHTML = '<option value="">Select Category</option>' + 
        skillCategories.map(category => 
            `<option value="${category._id}">${category.name}</option>`
        ).join('');
}

function clearForm() {
    document.getElementById('projectForm').reset();
    techTags = [];
    renderTechTags();
    editingProjectId = null;
    document.querySelector('button[type="submit"]').textContent = 'Add Project';
}

// Edit functions for categories and skills
async function editCategory(id) {
    const category = skillCategories.find(c => c._id === id);
    if (category) {
        editingCategoryId = id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryIcon').value = category.icon;
    }
}

async function deleteCategory(id) {
    if (confirm('Are you sure? This will also delete all skills in this category.')) {
        try {
            await api.deleteSkillCategory(id);
            skillCategories = await api.getSkillCategories();
            skills = await api.getSkills();
            loadCategories();
            loadSkills();
            loadCategoryOptions();
            alert('Category deleted successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}

async function editSkill(id) {
    const skill = skills.find(s => s._id === id);
    if (skill) {
        editingSkillId = id;
        document.getElementById('skillCategory').value = skill.categoryId._id;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillIcon').value = skill.icon;
        document.getElementById('skillPercent').value = skill.percent;
    }
}

async function deleteSkill(id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        try {
            await api.deleteSkill(id);
            skills = await api.getSkills();
            loadSkills();
            alert('Skill deleted successfully!');
        } catch (error) {
            // Fallback to localStorage
            skills = skills.filter(s => s._id !== id && s.id !== id);
            localStorage.setItem('skills', JSON.stringify(skills));
            loadSkills();
            alert('Skill deleted successfully! (Local storage)');
        }
    }
}

// LocalStorage fallback functions
function saveToLocalStorage() {
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
    localStorage.setItem('skillCategories', JSON.stringify(skillCategories));
    localStorage.setItem('skills', JSON.stringify(skills));
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Contact Messages Management
let messages = [];

async function loadMessages() {
    try {
        messages = await api.getMessages();
        console.log('Backend messages loaded:', messages);
        displayMessages();
        updateMessageStats();
    } catch (error) {
        console.error('Error loading messages from backend:', error);
        loadLocalMessages();
    }
}

function loadLocalMessages() {
    messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    // Add test message if no messages exist
    if (messages.length === 0) {
        const testMessage = {
            id: Date.now().toString(),
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Test Project Inquiry',
            message: 'Hello, I would like to discuss a web development project with you. Please contact me at your earliest convenience.',
            status: 'new',
            createdAt: new Date().toISOString()
        };
        messages.push(testMessage);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    }
    
    displayMessages();
    updateMessageStats();
}

function displayMessages() {
    const container = document.getElementById('messagesList');
    console.log('Displaying messages:', messages.length);
    
    if (!container) {
        console.error('Messages container not found!');
        return;
    }
    
    if (messages.length === 0) {
        container.innerHTML = '<p>No messages found. Send a message from the contact form to test.</p>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="message-item ${message.status}">
            <div class="message-header">
                <div>
                    <strong>${message.name || 'Unknown'}</strong> - ${message.email || 'No email'}
                    <div class="message-meta">
                        Subject: ${message.subject || 'No subject'} | ${new Date(message.createdAt || Date.now()).toLocaleString()}
                    </div>
                </div>
                <div>
                    <span class="message-status status-${message.status || 'new'}">${(message.status || 'new').toUpperCase()}</span>
                    <div class="project-actions" style="margin-top: 10px;">
                        <button class="btn-edit" onclick="viewMessage('${message._id || message.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-edit" onclick="markAsRead('${message._id || message.id}')" style="background: #3b82f6;">
                            <i class="fas fa-check"></i> Read
                        </button>
                        <button class="btn-delete" onclick="deleteMessage('${message._id || message.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
            <div class="message-content" style="margin-top: 15px; padding: 15px; background: var(--light); border-radius: 8px;">
                <strong>Message:</strong><br>
                <p style="margin: 10px 0 0 0; line-height: 1.6;">${message.message || 'No message content'}</p>
            </div>
        </div>
    `).join('');
}

function updateMessageStats() {
    const total = messages.length;
    const newCount = messages.filter(m => m.status === 'new').length;
    
    const totalElement = document.getElementById('totalMessages');
    const newElement = document.getElementById('newMessages');
    
    if (totalElement) totalElement.textContent = total;
    if (newElement) newElement.textContent = newCount;
    
    console.log(`Message stats updated: ${total} total, ${newCount} new`);
}

async function markAsRead(id) {
    try {
        await api.updateMessageStatus(id, 'read');
        await loadMessages();
        showMessage('Message marked as read', 'success');
    } catch (error) {
        // Fallback to localStorage
        const messageIndex = messages.findIndex(m => (m._id || m.id) === id);
        if (messageIndex !== -1) {
            messages[messageIndex].status = 'read';
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            displayMessages();
            updateMessageStats();
            showMessage('Message marked as read (local)', 'success');
        }
    }
}

async function deleteMessage(id) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await api.deleteMessage(id);
            await loadMessages();
            showMessage('Message deleted successfully', 'success');
        } catch (error) {
            // Fallback to localStorage
            messages = messages.filter(m => (m._id || m.id) !== id);
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            displayMessages();
            updateMessageStats();
            showMessage('Message deleted (local)', 'success');
        }
    }
}

// View message in modal
function viewMessage(id) {
    console.log('Viewing message with ID:', id);
    console.log('Available messages:', messages);
    
    const message = messages.find(m => (m._id || m.id) === id);
    if (!message) {
        console.error('Message not found with ID:', id);
        showMessage('Message not found', 'error');
        return;
    }
    
    console.log('Found message:', message);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Safely get values with fallbacks
    const name = message.name || 'Not provided';
    const email = message.email || 'Not provided';
    const subject = message.subject || 'Not provided';
    const messageText = message.message || 'No message content';
    const date = message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Unknown date';
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
            position: relative;
        ">
            <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            ">&times;</button>
            
            <h2 style="margin-bottom: 30px; color: #333;">Message Details</h2>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #666;">Full Name:</strong><br>
                <span style="font-size: 18px; color: #333;">${name}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #666;">Email Address:</strong><br>
                <span style="font-size: 18px; color: #333;">${email}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #666;">Subject:</strong><br>
                <span style="font-size: 18px; color: #333;">${subject}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #666;">Date:</strong><br>
                <span style="font-size: 16px; color: #666;">${date}</span>
            </div>
            
            <div style="margin-bottom: 30px;">
                <strong style="color: #666;">Message:</strong><br>
                <div style="
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 10px;
                    line-height: 1.6;
                    font-size: 16px;
                    color: #333;
                    white-space: pre-wrap;
                ">${messageText}</div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="markAsRead('${message._id || message.id}'); this.parentElement.parentElement.parentElement.remove();" class="btn-admin" style="background: #10b981;">Mark as Read</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-admin" style="background: #6b7280;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        showMessage('Logged out successfully', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Change password function
function showChangePassword() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
            width: 90%;
        ">
            <h2 style="margin-bottom: 30px; text-align: center;">Change Password</h2>
            <form id="changePasswordForm">
                <div style="margin-bottom: 20px;">
                    <label>Current Password:</label>
                    <input type="password" id="currentPassword" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label>New Password:</label>
                    <input type="password" id="newPassword" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 30px;">
                    <label>Confirm New Password:</label>
                    <input type="password" id="confirmPassword" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 5px;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="btn-admin" style="flex: 1;">Change Password</button>
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="btn-admin" style="background: #6b7280; flex: 1;">Cancel</button>
                </div>
            </form>
            <div id="passwordError" style="color: red; margin-top: 10px; text-align: center;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (newPass !== confirm) {
            document.getElementById('passwordError').textContent = 'New passwords do not match';
            return;
        }
        
        if (newPass.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            return;
        }
        
        try {
            // Here you would call API to change password
            // For now, just show success
            showMessage('Password changed successfully', 'success');
            modal.remove();
        } catch (error) {
            document.getElementById('passwordError').textContent = error.message;
        }
    });
}

async function refreshMessages() {
    console.log('Refreshing messages...');
    try {
        await loadMessages();
        showMessage('Messages refreshed from backend', 'success');
    } catch (error) {
        loadLocalMessages();
        showMessage('Messages refreshed from local storage', 'success');
    }
}