// Frontend Backend Integration
document.addEventListener('DOMContentLoaded', async function() {
    await loadDynamicContent();
});

async function loadDynamicContent() {
    try {
        // Load projects and skills from backend
        const [projects, skills, categories] = await Promise.all([
            api.getProjects(),
            api.getSkills(),
            api.getSkillCategories()
        ]);

        // Update projects if on projects page
        if (window.location.pathname.includes('projects.html')) {
            updateProjectsPage(projects);
        }

        // Update skills if on main page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            updateSkillsSection(categories, skills);
        }

    } catch (error) {
        console.error('Error loading dynamic content:', error);
        // Fallback to localStorage if backend is not available
        loadFromLocalStorage();
    }
}

function updateProjectsPage(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid || projects.length === 0) return;

    // Clear existing projects
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });

    // Reinitialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index % 3) * 100);
    card.setAttribute('data-category', project.category);

    const categoryNames = {
        'web': 'Web Application',
        'mobile': 'Mobile App',
        'api': 'API Integration',
        'game': 'Game Development',
        'other': 'Other'
    };

    card.innerHTML = `
        <div class="project-image">
            <div class="project-overlay">
                <div class="project-links">
                    ${project.liveUrl ? `<a href="${project.liveUrl}" class="project-link" title="Live Demo" target="_blank">
                        <i class="fas fa-external-link-alt"></i>
                    </a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" class="project-link" title="GitHub" target="_blank">
                        <i class="fab fa-github"></i>
                    </a>` : ''}
                </div>
            </div>
            ${project.image ? `<img src="${project.image}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
            <div class="project-icon">
                <i class="${project.icon}"></i>
            </div>
        </div>
        <div class="project-content">
            <div class="project-category">${categoryNames[project.category] || project.category}</div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-stats">
                <div class="stat">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-code"></i>
                    <span>${project.technologies.length} Tech</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

function updateSkillsSection(categories, skills) {
    const skillsContainer = document.querySelector('.skills-grid');
    if (!skillsContainer || categories.length === 0) return;

    // Clear existing skills
    skillsContainer.innerHTML = '';
    
    // Create skill categories
    categories.forEach((category, index) => {
        const categorySkills = skills.filter(skill => 
            skill.categoryId && skill.categoryId._id === category._id
        );
        
        if (categorySkills.length > 0) {
            const categoryElement = createSkillCategory(category, categorySkills, index);
            skillsContainer.appendChild(categoryElement);
        }
    });
    
    // Reinitialize AOS and skill animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Animate skill bars
    setTimeout(() => {
        animateSkillBars();
    }, 500);
}

function createSkillCategory(category, categorySkills, index) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'skill-category';
    categoryDiv.setAttribute('data-aos', 'fade-up');
    categoryDiv.setAttribute('data-aos-delay', index * 100);
    
    categoryDiv.innerHTML = `
        <div class="category-header">
            <div class="category-icon">
                <i class="${category.icon}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        </div>
        <div class="skill-items">
            ${categorySkills.map(skill => createSkillItem(skill)).join('')}
        </div>
    `;
    
    return categoryDiv;
}

function createSkillItem(skill) {
    return `
        <div class="skill-item">
            <div class="skill-icon">
                <i class="${skill.icon}"></i>
            </div>
            <div class="skill-info">
                <span class="skill-name">${skill.name}</span>
                <div class="skill-level">
                    <div class="skill-bar">
                        <div class="skill-progress" data-width="${skill.percent}"></div>
                    </div>
                    <span class="skill-percent">${skill.percent}%</span>
                </div>
            </div>
        </div>
    `;
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        bar.style.width = '0%';
        observer.observe(bar);
    });
}

// Fallback to localStorage if backend is not available
function loadFromLocalStorage() {
    // Load projects from localStorage
    const localProjects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
    if (localProjects.length > 0 && window.location.pathname.includes('projects.html')) {
        updateProjectsPage(localProjects);
    }

    // Load skills from localStorage
    const localCategories = JSON.parse(localStorage.getItem('skillCategories')) || [];
    const localSkills = JSON.parse(localStorage.getItem('skills')) || [];
    if (localCategories.length > 0 && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
        // Convert localStorage format to backend format
        const formattedSkills = localSkills.map(skill => ({
            ...skill,
            categoryId: { _id: skill.categoryId }
        }));
        updateSkillsSection(localCategories, formattedSkills);
    }
}

// Setup project filters
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize filters after content loads
setTimeout(setupProjectFilters, 1000);