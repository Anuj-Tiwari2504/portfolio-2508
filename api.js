// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

class API {
    constructor() {
        this.token = localStorage.getItem('adminToken');
    }

    // Helper method for API calls
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            localStorage.setItem('adminToken', data.token);
            this.token = data.token;
        }
        
        return data;
    }

    async register(username, email, password) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    // Projects API
    async getProjects() {
        return await this.request('/projects');
    }

    async createProject(projectData) {
        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(id, projectData) {
        return await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    }

    async deleteProject(id) {
        return await this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // Contact API
    async sendMessage(messageData) {
        return await this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async getMessages() {
        return await this.request('/contact');
    }

    async updateMessageStatus(id, status) {
        return await this.request(`/contact/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteMessage(id) {
        return await this.request(`/contact/${id}`, {
            method: 'DELETE'
        });
    }

    // Skills API
    async getSkillCategories() {
        return await this.request('/skills/categories');
    }

    async createSkillCategory(categoryData) {
        return await this.request('/skills/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    async updateSkillCategory(id, categoryData) {
        return await this.request(`/skills/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    async deleteSkillCategory(id) {
        return await this.request(`/skills/categories/${id}`, {
            method: 'DELETE'
        });
    }

    async getSkills() {
        return await this.request('/skills');
    }

    async createSkill(skillData) {
        return await this.request('/skills', {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    }

    async updateSkill(id, skillData) {
        return await this.request(`/skills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(skillData)
        });
    }

    async deleteSkill(id) {
        return await this.request(`/skills/${id}`, {
            method: 'DELETE'
        });
    }

    // Logout
    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
    }
}

// Global API instance
window.api = new API();