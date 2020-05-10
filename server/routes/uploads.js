const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const {verificaToken} = require('../middlewares/authentication');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', verificaToken, function(req, res) {

    let {tipo, id} = req.params;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos permitidos son ${tiposValidos.join(', ')}`
            }
        });
    }

    let archivo = req.files.archivo; // el nombre que le estamos dando a la hora de hacer la consulta es "archivo"
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length-1];

    console.log(extension);

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                extension
            }
        });
    }

    // Cambiar el nombre del archivo
    nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Subimos el archivo: mv --> a function to move the file elsewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
          return res.status(500).json({
              ok: false,
              err
          });

          // La imagen ya está cargada, debemos actualizar el usuario o el producto en la base de datos, cambiando su
          // propiedad img

          if(tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
          }else if(tipo === 'productos'){
            imagenProducto(id, res, nombreArchivo, req);
          }
          
      });

});

function imagenUsuario(id, res, nombreArchivo){

    Usuario.findById(id, (err, usuarioDB) => {
        if(err){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: `El usuario con id ${id} no existe`
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });

}

function imagenProducto(id, res, nombreArchivo, req){

    Producto.findById(id, (err, productoDB) => {

        if(err){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: `El producto con id ${id} no existe`
                }
            });
        }

        console.log(`Usuario: ${req.usuario._id} /// Producto: ${productoDB.usuario}`);

        if(productoDB.usuario != req.usuario._id){
            borraArchivo(nombreArchivo, 'productos');
            return res.json({
                ok: false,
                err: {
                    message: `El producto con id ${id} no pertenece al usuario con id ${req.usuario._id}`
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        });

    });

}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;