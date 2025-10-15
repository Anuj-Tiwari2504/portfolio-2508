// Dynamic Skills Loading
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicSkills();
});

function loadDynamicSkills() {
    const skillCategories = JSON.parse(localStorage.getItem('skillCategories')) || [];
    const skills = JSON.parse(localStorage.getItem('skills')) || [];
    
    if (skillCategories.length === 0) {
        return; // Keep existing static skills
    }
    
    const skillsContainer = document.querySelector('.skills-grid');
    if (!skillsContainer) return;
    
    // Clear existing skills
    skillsContainer.innerHTML = '';
    
    // Create skill categories
    skillCategories.forEach((category, index) => {
        const categorySkills = skills.filter(skill => skill.categoryId === category.id);
        
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