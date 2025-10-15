// Admin Panel JavaScript
let projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
let techTags = [];
let editingProjectId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    setupEventListeners();
});

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

    // Form submission
    document.getElementById('projectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (editingProjectId) {
            updateProject();
        } else {
            addProject();
        }
    });
}

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

function addProject() {
    const formData = new FormData(document.getElementById('projectForm'));
    const project = {
        id: Date.now().toString(),
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        image: formData.get('image'),
        icon: formData.get('icon') || 'fas fa-code',
        liveUrl: formData.get('liveUrl'),
        githubUrl: formData.get('githubUrl'),
        technologies: [...techTags],
        createdAt: new Date().toISOString()
    };

    projects.push(project);
    saveProjects();
    loadProjects();
    clearForm();
    alert('Project added successfully!');
}

function updateProject() {
    const formData = new FormData(document.getElementById('projectForm'));
    const projectIndex = projects.findIndex(p => p.id === editingProjectId);
    
    if (projectIndex !== -1) {
        projects[projectIndex] = {
            ...projects[projectIndex],
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            image: formData.get('image'),
            icon: formData.get('icon') || 'fas fa-code',
            liveUrl: formData.get('liveUrl'),
            githubUrl: formData.get('githubUrl'),
            technologies: [...techTags],
            updatedAt: new Date().toISOString()
        };

        saveProjects();
        loadProjects();
        clearForm();
        editingProjectId = null;
        alert('Project updated successfully!');
    }
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (project) {
        editingProjectId = id;
        
        // Fill form with project data
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectImage').value = project.image || '';
        document.getElementById('projectIcon').value = project.icon;
        document.getElementById('liveUrl').value = project.liveUrl || '';
        document.getElementById('githubUrl').value = project.githubUrl || '';
        
        // Set tech tags
        techTags = [...project.technologies];
        renderTechTags();
        
        // Change button text
        document.querySelector('button[type="submit"]').textContent = 'Update Project';
        
        // Scroll to form
        document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
        loadProjects();
        alert('Project deleted successfully!');
    }
}

function clearForm() {
    document.getElementById('projectForm').reset();
    techTags = [];
    renderTechTags();
    editingProjectId = null;
    document.querySelector('button[type="submit"]').textContent = 'Add Project';
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
                <button class="btn-edit" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteProject('${project.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function saveProjects() {
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
}

// Skills Management
let skillCategories = JSON.parse(localStorage.getItem('skillCategories')) || [];
let skills = JSON.parse(localStorage.getItem('skills')) || [];
let editingCategoryId = null;
let editingSkillId = null;

// Skills Tab Management
function showSkillTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'individual') {
        loadCategoryOptions();
    }
}

// Category Management
document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (editingCategoryId) {
        updateCategory();
    } else {
        addCategory();
    }
});

function addCategory() {
    const formData = new FormData(document.getElementById('categoryForm'));
    const category = {
        id: Date.now().toString(),
        name: formData.get('name'),
        description: formData.get('description'),
        icon: formData.get('icon')
    };
    
    skillCategories.push(category);
    saveCategories();
    loadCategories();
    document.getElementById('categoryForm').reset();
    alert('Category added successfully!');
}

function updateCategory() {
    const formData = new FormData(document.getElementById('categoryForm'));
    const categoryIndex = skillCategories.findIndex(c => c.id === editingCategoryId);
    
    if (categoryIndex !== -1) {
        skillCategories[categoryIndex] = {
            ...skillCategories[categoryIndex],
            name: formData.get('name'),
            description: formData.get('description'),
            icon: formData.get('icon')
        };
        
        saveCategories();
        loadCategories();
        document.getElementById('categoryForm').reset();
        editingCategoryId = null;
        alert('Category updated successfully!');
    }
}

function editCategory(id) {
    const category = skillCategories.find(c => c.id === id);
    if (category) {
        editingCategoryId = id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryIcon').value = category.icon;
    }
}

function deleteCategory(id) {
    if (confirm('Are you sure? This will also delete all skills in this category.')) {
        skillCategories = skillCategories.filter(c => c.id !== id);
        skills = skills.filter(s => s.categoryId !== id);
        saveCategories();
        saveSkills();
        loadCategories();
        loadSkills();
        alert('Category deleted successfully!');
    }
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
                <button class="btn-edit" onclick="editCategory('${category.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Individual Skills Management
document.getElementById('skillForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (editingSkillId) {
        updateSkill();
    } else {
        addSkill();
    }
});

function addSkill() {
    const formData = new FormData(document.getElementById('skillForm'));
    const skill = {
        id: Date.now().toString(),
        categoryId: formData.get('category'),
        name: formData.get('name'),
        icon: formData.get('icon'),
        percent: parseInt(formData.get('percent'))
    };
    
    skills.push(skill);
    saveSkills();
    loadSkills();
    document.getElementById('skillForm').reset();
    alert('Skill added successfully!');
}

function updateSkill() {
    const formData = new FormData(document.getElementById('skillForm'));
    const skillIndex = skills.findIndex(s => s.id === editingSkillId);
    
    if (skillIndex !== -1) {
        skills[skillIndex] = {
            ...skills[skillIndex],
            categoryId: formData.get('category'),
            name: formData.get('name'),
            icon: formData.get('icon'),
            percent: parseInt(formData.get('percent'))
        };
        
        saveSkills();
        loadSkills();
        document.getElementById('skillForm').reset();
        editingSkillId = null;
        alert('Skill updated successfully!');
    }
}

function editSkill(id) {
    const skill = skills.find(s => s.id === id);
    if (skill) {
        editingSkillId = id;
        document.getElementById('skillCategory').value = skill.categoryId;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillIcon').value = skill.icon;
        document.getElementById('skillPercent').value = skill.percent;
    }
}

function deleteSkill(id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        skills = skills.filter(s => s.id !== id);
        saveSkills();
        loadSkills();
        alert('Skill deleted successfully!');
    }
}

function loadSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = skills.map(skill => {
        const category = skillCategories.find(c => c.id === skill.categoryId);
        return `
            <div class="project-item">
                <div>
                    <h4>${skill.name}</h4>
                    <p>Category: ${category ? category.name : 'Unknown'}</p>
                    <p><i class="${skill.icon}"></i> ${skill.percent}%</p>
                </div>
                <div class="project-actions">
                    <button class="btn-edit" onclick="editSkill('${skill.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteSkill('${skill.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadCategoryOptions() {
    const select = document.getElementById('skillCategory');
    select.innerHTML = '<option value="">Select Category</option>' + 
        skillCategories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
}

function saveCategories() {
    localStorage.setItem('skillCategories', JSON.stringify(skillCategories));
}

function saveSkills() {
    localStorage.setItem('skills', JSON.stringify(skills));
}

// Initialize skills management
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadSkills();
    loadCategoryOptions();
});

// Export function for projects.html to use
window.getProjects = function() {
    return projects;
};

window.getSkillCategories = function() {
    return skillCategories;
};

window.getSkills = function() {
    return skills;
};