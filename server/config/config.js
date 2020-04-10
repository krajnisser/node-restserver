//=========================
// Puerto
//=========================
process.env.PORT = process.env.PORT || 3000;

//=========================
// Entorno
//=========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=========================
// Base de datos
//=========================
let urlDB;

//=========================
// Vencimiento del Token
//=========================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//=========================
// SEED de autenticación
//=========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//=========================
// Google Client ID
//=========================
process.env.CLIENT_ID = '291135955570-gf6rkh7kus2unnabupm35ub4lu8tuvhb.apps.googleusercontent.com';
