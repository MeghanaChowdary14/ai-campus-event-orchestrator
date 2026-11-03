const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const { category, condition } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    const resources = await Resource.find(filter).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Coordinator, Technical Team)
const createResource = async (req, res) => {
  try {
    const { name, category, totalStock, availableStock, unit, unitCost, condition, location } = req.body;

    const resource = await Resource.create({
      name,
      category,
      totalStock: Number(totalStock) || 0,
      availableStock: availableStock !== undefined ? Number(availableStock) : Number(totalStock) || 0,
      unit: unit || 'units',
      unitCost: Number(unitCost) || 0,
      condition: condition || 'Optimal',
      location: location || 'Central Logistics Hub',
    });

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update resource stock or details
// @route   PUT /api/resources/:id
// @access  Private (Coordinator, Technical Team)
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getResources,
  createResource,
  updateResource,
};
