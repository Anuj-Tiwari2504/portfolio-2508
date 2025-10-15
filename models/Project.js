const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['web', 'mobile', 'api', 'game', 'other']
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'fas fa-code'
    },
    liveUrl: {
        type: String,
        default: ''
    },
    githubUrl: {
        type: String,
        default: ''
    },
    technologies: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);