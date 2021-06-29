const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extends:true}));
app.use(express.static('public'));

//Configuracion de entornos
console.log('Aplicacion: '+config.get('nombre'));
console.log('BD server: '+config.get('configDB.host'));

//Uso de middleware de tercero - Morgan
if(app.get('env')==='development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado...')
    debug('Morgan esta habilitado.');
}

//Trabajos con la base de datos
debug('Conectando con la bd...')

//app.use(logger);
const usuarios = [{id:1,nombre:'Gabriel'},
                 {id:2,nombre:'Pablo'},
                 {id:3,nombre:'Ana'}
];

app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express');
});    //peticion

app.get('/api/usuarios',(req,res) => {
    res.send(usuarios);
})

app.get('/api/usuarios/:id',(req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios',(req, res) => {
    
    
    /*let body = req.body;
    console.log(body.nombre);
    res.json({
        body
    })*/
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
        });
        const {error,value} = validarUsuario(req.body.nombre);
        if(!error){
            const usuario = {
                id: usuarios.length +1,
                nombre: value.nombre
            };
            usuarios.push(usuario);
            res.send(usuario);
        }else{
            const mensaje = error.details[0].message;
            res.status(400).send(mensaje);
        } 
});

app.put('/api/usuarios/:id', (req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

   
    const {error,value} = validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});

app.delete('/api/usuarios/:id', (req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuario);
});

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port} ...`);
})

function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}
function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
        });
        return(schema.validate({ nombre: nom }));
}
/*app.post();   //envio datos
app.put();    //actualizacion
app.delete(); //eliminacion*/