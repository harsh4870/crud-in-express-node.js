var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');

app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(expressValidator());

var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(

    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : 'harshmanvar',
        database : 'test',
        debug    : 'false',
        port : '8080'
    },'request')

);

app.get('/',function(req,res){
    res.send('Welcome');
});
var router = express.Router();
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});
var curut = router.route('/user');

curut.get(function(req,res,next){
 req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");
        var query = conn.query('SELECT * FROM t_user',function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
            res.render('user',{title:"RESTful Crud Example",data:rows});
         });
    });
});
curut.post(function(req,res,next){
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('password','Enter a password 6 - 20').len(6,20);
    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }
    var data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };
    req.getConnection(function (err, conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("INSERT INTO t_user set ? ",data, function(err, rows){
           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
          res.sendStatus(200);
        });
     });
});
var curut2 = router.route('/user/:user_id');
curut2.all(function(req,res,next){
    console.log("You need to smth about curut2 Route ? Do it here");
    console.log(req.params);
    next();
});
curut2.get(function(req,res,next){
    var user_id = req.params.user_id;
    req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM t_user WHERE user_id = ? ",[user_id],function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
            if(rows.length < 1)
                return res.send("User Not found");
            res.render('edit',{title:"Edit user",data:rows});
        });
    });
});
curut2.put(function(req,res,next){
    var user_id = req.params.user_id;
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('password','Enter a password 6 - 20').len(6,20);
    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }
    var data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };
    req.getConnection(function (err, conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("UPDATE t_user set ? WHERE user_id = ? ",[data,user_id], function(err, rows){
           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
          res.sendStatus(200);
        });
     });
});
curut2.delete(function(req,res,next){
    var user_id = req.params.user_id;
     req.getConnection(function (err, conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("DELETE FROM t_user  WHERE user_id = ? ",[user_id], function(err, rows){
             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }
             res.sendStatus(200);
        });
     });
});
app.use('/api', router);

//start Server
var server = app.listen(8000,function(){

   console.log("Listening to port %s",server.address().port);

});
