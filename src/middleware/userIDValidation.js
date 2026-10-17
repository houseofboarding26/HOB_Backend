// const { getUserById } = require("../services/userService");

// const IDValidation = (schema) => (req, res, next) => {
//     try {
//         const result = schema.safeParse(req.params.id);
//         if (!result.success) {
//             const errors = JSON.parse(result.error.message).map(err => ({
//                 field: err.path[0] || 'unknown',
//                 message: err.message,
//                 code: err.code
//             }));
//             return res.status(400).json({
//                 success: false,
//                 message: 'ID Validation failed',
//                 errors: errors
//             });
//         }
//         req.params.id = result.data;
//         return next();
//     } catch (error) {
//         console.error('Error in IDValidation middleware:', error.message);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// }

// const userIDValidation =  (schema) => async(req, res, next) => {
//     try {
//         const userId = req.query.userId
//         console.log("userId from query:", userId); // Debugging line
//         if (!userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "?userId query param is needed"
//             })
//         }
//         const user = await getUserById(userId)
//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: `userId Validation failed: ${userId} `
//             })
//         }
//         req.params.userId = userId;
//         return next();
//     } catch (error) {
//         console.error('Error in userIDValidation middleware:', error.message);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// }

// module.exports = { IDValidation, userIDValidation };