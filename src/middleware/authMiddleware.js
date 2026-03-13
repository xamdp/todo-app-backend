import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: 'No authorization header provided' })
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Invalid authorization format. Use Bearer <token>',
        })
    }

    const token = authHeader.slice(7).trim() // remove "Bearer " + any weird spaces

    if (!token) {
        return res
            .status(401)
            .json({ message: 'No token provided after  Bearer' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT error:', err.name, err.message) // for debugging
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' })
            }

            return res.status(401).json({ message: 'Invalid token' })
        }

        req.userId = decoded.id
        next()
    })
}

export default authMiddleware
