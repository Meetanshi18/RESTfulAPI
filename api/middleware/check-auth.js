const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    try{

        // try consoling req.headers.authorization to know why we split using white space and took the 1st index
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'secretKey');
        req.userData = decoded;
        next();
    } 
    // catch block runs if the try statement fails or throws some error
    catch{
        return res.status(401).json({
            message: 'Auth Failed'
        });
    }
    
}