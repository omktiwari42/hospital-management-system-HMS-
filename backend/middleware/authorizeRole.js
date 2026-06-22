function authorizeRole(...roles) {
    return (req, res, next) => {

        console.log("USER:", req.user);

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        next();
    };
}

module.exports = authorizeRole;