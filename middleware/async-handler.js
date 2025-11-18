// Wraps async route handlers to ctach and forward errors
exports.asyncHandler = (cb) => {
    return async (req, res, next) => {
        try {
        await cb(req, res, next);
        } catch (error) {
        next(error); // Forward error to global error handler
        }
    };
};
