const express = require('express');
const router = express.Router();
const { SkillCategory, Skill } = require('../models/Skill');

// Skill Categories Routes
router.get('/categories', async (req, res) => {
    try {
        const categories = await SkillCategory.find().sort({ order: 1, createdAt: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const category = new SkillCategory(req.body);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const category = await SkillCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        // Delete all skills in this category first
        await Skill.deleteMany({ categoryId: req.params.id });
        
        const category = await SkillCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category and related skills deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Individual Skills Routes
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find()
            .populate('categoryId', 'name description icon')
            .sort({ order: 1, createdAt: 1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const skill = new Skill(req.body);
        const savedSkill = await skill.save();
        const populatedSkill = await Skill.findById(savedSkill._id)
            .populate('categoryId', 'name description icon');
        res.status(201).json(populatedSkill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('categoryId', 'name description icon');
        
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.json(skill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;