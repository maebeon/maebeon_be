const express = require('express');
const router = express.Router();
const authRoute = require('./authRoute');
const sessionRoutes = require('./sessionRoutes');

router.use('/auth', authRoute);
router.use('/sessions', sessionRoutes);

module.exports = router;