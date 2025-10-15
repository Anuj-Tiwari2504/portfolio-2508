// Dynamic Projects Loading
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicProjects();
    setupProjectFilters();
});

function loadDynamicProjects() {
    const projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
    const projectsGrid = document.querySelector('.projects-grid');
    
    if (projects.length === 0) {
        // Keep existing static projects if no dynamic projects
        return;
    }

    // Clear existing projects and add dynamic ones
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });

    // Reinitialize AOS for new elements
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

// Add CSS for fade animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .project-image img {
        border-radius: 10px 10px 0 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }
    
    .project-image {
        position: relative;
        overflow: hidden;
        border-radius: 10px 10px 0 0;
        height: 200px;
        background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .project-card {
        height: auto;
        min-height: 400px;
        display: flex;
        flex-direction: column;
    }
    
    .project-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);