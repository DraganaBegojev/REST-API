// Wraps async route handlers to catch and forward errors
exports.asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ errors });
      }
      // Forward other errors to global error handler
      next(error);
    }
  };
};

