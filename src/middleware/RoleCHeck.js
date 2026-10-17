const { getUserById } = require("../services/userService");


const HostRoleCheck = async (req, res, next) => {
    const id = req.user.id;
    
    const user = await getUserById(id);
    console.log("HostRoleCheck middleware invoked for user ID:", JSON.stringify(user)); // Debugging line

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.role !== 'host') {
        return res.status(403).json({
            success: false,
            message: 'user not authorized to access this route'
        });
    }
    next();
};

const AdminRoleCheck = async (req, res, next) => {
    const id = req.user.id;
    const user = await getUserById(id);
    console.log("AdminRoleCheck middleware invoked for user ID:", JSON.stringify(user)); // Debugging line

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'user not authorized to access this route'
        });
    }
    next();
};

const CustomerRoleCheck = async (req, res, next) => {
    const id = req.user.id;
    const user = await getUserById(id);
    console.log("CustomerRoleCheck middleware invoked for user ID:", JSON.stringify(user));

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.role !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'user not authorized to access this route'
        });
    }
    next();
};

module.exports = { HostRoleCheck, AdminRoleCheck, CustomerRoleCheck };