var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
const io = require("socket.io").listen(server);
var path = require('path');
var logger = require('morgan');
const os = require('node:os');
var pidusage = require('pidusage')

//variabels que se encargan de conectarse a los modulos de routes
var indexRouter = require('./routes/findex');
var usersRouter = require('./routes/users');

//variabels que se encargan de conectarse a los modulos de routes
var indexRouter = require('./routes/findex');
var usersRouter = require('./routes/users');
var mysql = require('mysql2');

//no se muy bien que hacen
const { json, query } = require('express');
const { Console } = require('console');

// configura el motor de visualizacion ejs
app.set('view engine', 'ejs');
//path.join() concatena los directorios
app.set('views', path.join(__dirname, 'views'));

/***********configuracion***********/
// configura el motor de visualizacion ejs
app.set('view engine', 'ejs');
//path.join() concatena los directorios
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({extended:false}));
app.use(express(json));

var conexion = mysql.createConnection({
  host: 'containers-us-west-146.railway.app',
  database: 'railway',
  user: 'root',
  password:'rlXWedxPLop1pYCVr9uS',
  port:'7964'
});
conexion.connect(function(error){
  if(error){
      throw error;
  }else{

  }
})

app.post('/outhardware',function(req,res){

  /*
  let cpu = os.cpus();
  let totalram = os.totalmem();
  let libreram = os.freemem();
  let ramocup = totalram - libreram
  var porsent = (ramocup*100)/totalram
  console.log(porsent + '%')
  var rendcpu = cpu[0].speed;
  console.log((rendcpu/100)*3000)
  */
  setInterval(() => {
    pidusage(process.pid,function(err,stats){
      var user = os.hostname(); 
      var pros = os.cpus();
      console.log(user) 
      console.log(pros[0].model)
      console.log("CPU, ", stats.cpu, " %")
      console.log("RAM, ", stats.memory, " %")
      conexion.query('SELECT * FROM ordenador WHERE mo_usu ="'+ user +'";',(err,resutl)=>{
        if(err) throw err;
        console.log(resutl.length) 
        if(resutl.length <= 0){
          console.log('aun no existe un registro de la computadora')
          conexion.query('INSERT INTO ordenador (mo_usu, mo_model, cpu, ram) VALUES ("'+user+'", "'+pros[0].model+'", "'+stats.cpu+'", "'+stats.memory+'");',(err2,result2)=>{
            if(err2) throw err2
          })
        }else{
          //actulizar la vase
          console.log('ya existe un registro de la computadora')
          conexion.query('UPDATE ordenador SET cpu = "'+ stats.cpu +' %", ram = "'+stats.memory +' %" WHERE (mo_usu = "'+ user +'");',(err1,result)=>{
            if(err1) throw err1;
          })
        } 
      })
    })
  }, 3000);
  console.log('si sale de el intervalo?')
});


server.listen(3002,()=>{
    console.log('Server corriendo en http://192.168.100.91:3002')
    
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use((req, res, next)=>{
    res.status(404).render("404")
  })
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });


  //console.log(os.cpus());

  io.on('connection',(socket)=>{
    console.log('nueva conexion', socket.id);
    io.sockets.emit('socket_conectado',socket.id);
    

  
    socket.on('chat:mensaje',(data)=>{
      io.sockets.emit('chat:mensaje',data);
    });
  
    socket.on('chat:escribiendo',(data)=>{
      socket.broadcast.emit('chat:escribiendo',data);
      //console.log(data)
    });
    
    socket.on('disconnect', () => {
      console.log(`socket desconectado ${socket.id}`);
      io.sockets.emit('socket_desconectado',socket.id);
    });
  
  });
  
  module.exports = app;
  