const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cliente_DAW';

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Middleware para verificar rol de admin
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res
            .status(403)
            .json({ message: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };
