const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const sessionRoutes = require('./sessionRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/users', userRoutes);

module.exports = router;