require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const path = require('path');

const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, 
                {useNewUrlParser: true, useUnifiedTopology: true}, 
                (err, res) => {
    if(err){
        console.log('Vaya mierda ', err);
        throw err;
    } 

    console.log('Base de datos ONLINE en ' + process.env.URLDB);
});
 
app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto ' + process.env.PORT);
});