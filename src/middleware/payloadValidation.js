
const payloadValidation  = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = JSON.parse(result.error.message).map(err => ({
                field: err.path[0] || 'unknown',
                message: err.message,
                code: err.code
            }));
            return res.status(400).json({
                success: false,
                message: 'Payload Validation failed',
                errors:errors
            });
        }
        return next();
    } catch (error) {
        console.error('Error in payloadValidation middleware:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = { payloadValidation };