const express = require('express');

let {verificaToken, verificaAdmin_Role} = require('../middlewares/authentication');

let app = express(); // creates an Express application

const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');

const _ = require('underscore');

///////////////////////////////
// Mostrar todas las categorias
///////////////////////////////
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
            .sort('descripcion')
            .populate('usuario', 'nombre email')
            .exec((err, categoriasDB) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
        
                res.json({
                    ok: true,
                    categoriasDB
                });
            });
    
});

///////////////////////////////
// Mostrar una categoria por ID
///////////////////////////////
app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaIdDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaIdDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            categoriaIdDB
        });

    });
    
}); 

///////////////////////////////
// Crear nueva categoria
///////////////////////////////
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoria
    // req.usuario._id
    let body = req.body;

    Usuario.findById({_id: req.usuario._id}, (err, usuarioCategoria) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
            // console.log('ERROR: ' + err);
        }

        let categoria = new Categoria({

            descripcion: body.descripcion,
            usuario: usuarioCategoria
    
        });
    
        categoria.save((errCat, categoriaDB) => {
    
            if(errCat){
                return res.status(500).json({
                    ok: false,
                    errCat
                });
                // console.log('ERROR: ' + err);
            }
    
            res.json({
                ok: true,
                categoriaDB
            });
    
        });

    });

});

///////////////////////////////
// Actualizar categoria
///////////////////////////////
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, [
        'descripcion'
    ]);

    Categoria.findByIdAndUpdate(id, body, (err, categoriaId) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
            // console.log('ERROR: ' + err);
        }

        if(categoriaId){
            return res.json({
                ok: true,
                categoriaId
            });
        }

    });
    
}); 


///////////////////////////////
// Borrar categoria
///////////////////////////////
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorias
    // Categoria.finByIdAndRemove() 
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaRemove) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
            // console.log('ERROR: ' + err);
        }

        if(categoriaRemove){
            return res.json({
                ok: true,
                categoriaRemove
            })
        }

    });

}); 



module.exports = app;