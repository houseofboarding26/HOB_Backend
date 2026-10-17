const { getHostByUserIDService } = require("../services/hostService");


const checkForHost = async (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        const hostdata = await getHostByUserIDService(req.body.userId)
        if (hostdata) {
            return res.json({ message: "host already exists" })
        }
        next()
    } catch (error) {
        console.error('Error in checkhostcontroller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

module.exports = { checkForHost }
