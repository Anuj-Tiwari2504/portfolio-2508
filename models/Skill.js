const mongoose = require('mongoose');

const SkillCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillCategory',
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    percent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SkillCategory = mongoose.model('SkillCategory', SkillCategorySchema);
const Skill = mongoose.model('Skill', SkillSchema);

module.exports = { SkillCategory, Skill };