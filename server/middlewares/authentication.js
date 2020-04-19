const jwt = require('jsonwebtoken');

// =======================
// Verificar Token
// =======================
let verificaToken = (req, res, next) => {

    let token = req.get('token');
    console.log('SEED: ' + process.env.SEED);

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if(err){
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario; // Cuando hemos verificado el token, añadimos el parámetro usuario a req (req.usuario)

        next();

    });

}

// =======================
// Verificar ADMIN_ROLE
// =======================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
    }else{
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es un administrador'
            },
            usuario
        });
    }

}


module.exports = {
    verificaToken,
    verificaAdmin_Role
}