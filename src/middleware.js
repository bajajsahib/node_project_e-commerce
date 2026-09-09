const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

function authenticate(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ success: false, message: 'Authentication is required.' });
  try {
    request.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function authorize(...roles) {
  return (request, response, next) => roles.includes(request.user.role)
    ? next()
    : response.status(403).json({ success: false, message: 'You do not have permission for this action.' });
}

function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({ success: false, message: 'Validation failed.', errors: result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
    }
    request.body = result.data;
    return next();
  };
}

function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

function errorHandler(error, request, response, next) {
  request.log?.error(error);
  if (error.code === 'P2002') return response.status(409).json({ success: false, message: 'A record with this value already exists.' });
  return response.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'An unexpected error occurred.' });
}

module.exports = { authenticate, authorize, validate, asyncHandler, errorHandler };