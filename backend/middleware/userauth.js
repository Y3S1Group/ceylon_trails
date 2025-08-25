import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const {token} = req.cookies;

    if(!token) {
        return res.json({success: false, message: 'Authentication token is missing'});
    }

    try {

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id) {
            req.userId= tokenDecode.id;
        }else {
            return res.json({success: false, message: 'Invalid token'});
        }

        next();

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export default userAuth;