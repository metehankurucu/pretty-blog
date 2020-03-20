const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = (req.headers['x-access-token'] && req.headers['x-access-token'].replace("Bearer","").trim()) || req.body.token || req.query.token;
  if (token) {
    jwt.verify(token, req.app.get('api_secret_key'), (err, decoded) => {
        if (err) {
            res.json({
                status: false,
                message: 'Authentication Failed'
            });
        } else {
            req.decoded = decoded;
            next();
        }
    });
    } else {
        res.json({
            status: false,
            message: 'No token provided.'
        });
    }
};
