const jwt=require('jsonwebtoken');

function generationToken(user){
    return jwt.sign({id:user.id}, 'tu_secreto', {expiresIn:'1h'});
}

function validateToken(req, res, next){
    const token=req.session.token;
    if(!token){
        res.status(401).json({mensaje:'Token no generado'});
    }
    else{
        jwt.verify(token, 'tu_secreto', (err, decoded)=>{
            if(err){
                res.status(401).json({mensaje:'Token invalido'});
            }
            req.user=decoded.user;
            next();
        })
    }
}

module.exports={generationToken, validateToken};