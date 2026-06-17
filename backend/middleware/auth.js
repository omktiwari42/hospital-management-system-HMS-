const jwt = require("jsonwebtoken");

function authenticateToken(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  console.log(
    "AUTH HEADER:",
    authHeader
  );

  const token =
    authHeader &&
    authHeader.split(" ")[1];

  console.log("TOKEN:", token);

  if (!token) {
    return res.status(401).json({
      message: "Access Denied",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, user) => {
      if (err) {
        console.log(
          "JWT ERROR:",
          err.message
        );

        return res.status(403).json({
          message: "Invalid Token",
        });
      }

      req.user = user;

      next();
    }
  );
}

module.exports =
  authenticateToken;