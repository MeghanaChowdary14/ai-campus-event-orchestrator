const express = require('express');
const router = express.Router();
const { getResources, createResource, updateResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getResources);
router.post('/', protect, authorize('Coordinator', 'Technical Team'), createResource);
router.put('/:id', protect, authorize('Coordinator', 'Technical Team'), updateResource);

module.exports = router;
