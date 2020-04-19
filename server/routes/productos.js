var mongoose = require('mongoose');
const express = require('express');
const {verificaToken, verificaAdmin_Role} = require('../middlewares/authentication');

const app = express();

const Producto = require('../models/producto');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria');


// ========================
// Obtener productos
// ========================
app.get('/productos', verificaToken, (req, res) => {

    //populate: usuario categoria
    // paginado
        
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 20;
    limite = Number(limite);

    Producto.find({})
            .populate('usuario categoria')
            .skip(desde)
            .limit(limite)
            .exec((err, productosDB) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if(productosDB){
                    return res.json({
                        ok: true,
                        productosDB
                    });
                }else{
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'No se han encontrado los productos'
                        }
                    });
                }

            });

});

// ========================
// Obtener producto por id
// ========================
app.get('/productos/:id', verificaToken, (req, res) => {

    //populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
            .populate('usuario categoria')
            .exec((err, productoId) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if(!productoId){
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: `No se ha encontrado el producto con id ${id}`
                        }
                    });
                }

                res.json({
                    ok: true,
                    productoId
                });
            });

});


// ========================
// Buscar producto
// ========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
            .populate('categoria', 'nombre')
            .exec((err, productos) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productos
                })
            });

});


// ========================
// Crear nuevo producto
// ========================
app.post('/productos', verificaToken, (req, res) => {

    // grabar el usuario
    // grabar una categoria del listado
    Usuario.findById({_id: req.usuario._id}, (err, usuarioId) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioId){
            return res.json({
                ok: false,
                err: {
                    message: `No se encuentra el usuario con id ${req.usuario._id}`
                }
            });
        }

        Categoria.find({descripcion: req.body.descripcionCat, usuario: usuarioId}, (err, categoriaId) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!categoriaId){
                return res.json({
                    ok: false,
                    err: {
                        message: `No se encuentra la categoria con descripcion ${req.body.descripcionCat} y usuario ${req.usuario}`
                    }
                });
            }

            let body = req.body;
            let id_categoria = mongoose.Types.ObjectId(categoriaId._id);

            let producto = new Producto({
                nombre: body.nombre,
                precioUni: body.precioUni,
                descripcion: body.descripcion,
                disponible: body.disponible,
                categoria: {
                    _id: id_categoria
                },
                usuario: req.usuario._id
            });

            producto.save((err, productoDB) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productoDB
                });
            });

        });

    });

});

// ========================
// Actualizar producto
// ========================
app.put('/productos/:id', verificaToken, (req, res) => {

    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = _.pick(req.body, [
        'nombre',
        'precioUni',
        'descripcion',
        'disponible'
    ]);

    Producto.findByIdAndUpdate(id, body, (err, productoUpdated) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoUpdated){
            return res.status(400).json({
                ok: true,
                err: {
                    message: `El producto con id ${id} no existe en la base de datos`
                }
            });
        }

        res.json({
            ok: true,
            productoUpdated
        });

    });

});

// ========================
// Eliminar producto
// ========================
app.delete('/productos/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, {disponible: false}, (err, productoDeleted) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDeleted){
            return res.status(400).json({
                ok: true,
                err: {
                    message: `El producto con id ${id} no existe en la base de datos`
                }
            });
        }

        res.json({
            ok: true,
            productoDeleted
        });

    });

});

module.exports = app;