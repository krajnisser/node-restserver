const express = require('express');
const Usuario = require('../models/usuario');
const {verificaToken, verificaAdmin_Role} = require('../middlewares/authentication');

const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');

app.get('/usuario', verificaToken, function (req, res) {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 20;
    limite = Number(limite);
    
    Usuario.find({}, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec((err, usuarios) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Usuario.count({}, (err, conteo) => {

                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });

                });

                
            })

  });

app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.rol
    });

    usuario.save((err, usuarioDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, 
    ['nombre',
    'email',
    'img',
    'role',
    'estado'
    ]);

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

    
});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
    
    let id = req.params.id;
    let estado = false;

    Usuario.findByIdAndUpdate(id, estado, (err, usuarioBD) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if(!usuarioBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        });

    })

});

module.exports = app;