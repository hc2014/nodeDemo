var express = require('express');

var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var fs=require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');//处理cookie的模块
var nodeExcel = require('excel-export');
var xlsx = require('node-xlsx');
var mult=require('connect-multiparty');
var mailer=require('mailer');//邮件
var mongoose=require("mongoose");

var MyMongo = require(__dirname+'/conDB.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'user');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


var user = require('./routes/user');
var content = require('./routes/content');
var replay = require('./routes/replay');
var pager = require('./routes/pager');
var self = require('./routes/self');
var Encryption=require('./routes/Encryption');//自定义加密模块

var safeUrl=["/views/login.html","/views/register.html","/views/mailer.html"];
var logger=require('./routes/logger');
var logInfo=logger.logger;
logger.use(app);

//设置模板为html
app.engine('.html', ejs.__express);
app.set('view engine','html');
app.set('views',__dirname+"/views");
app.set('view option',{layout:false});
app.use(mult({ uploadDir: __dirname+'/temp' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//这里设置session
app.use(session({
  cookie: {maxAge: 60000 * 20}, // 20 minutes
  secret: "test",
  store: new MongoStore({
    db: "user"
  }),
  resave: true,
  saveUninitialized: true,
}));

var mongoose=require('./models/mongoose.js');
//设置静态托管
app.use(express.static(__dirname+'/public'));
//设置起始页面
app.get('/',function(req,res,next){

	/*fs.readFile(__dirname+"/test.txt",function (err, data) {

	  	if (err) throw err;

		logInfo.info(data);

		logInfo.info(data.toString('utf8',0,data.length));
	});*/
	res.render('main.html'); 
});
app.post('/views/content_info.html',replay.operate);
app.post('/views/login.html',user.login);
app.post('/views/content_info.html',replay.operate);
app.post('/views/main.html',user.list);


//mongoose的测试页面
app.get('/views/test_user.html',function(req,res){
	var UserModel = mongoose.User;
	/*var krouky = new UserModel({username:'krouky',pwd:"123",email:"294836881@qq.com",nickname:"123"});
    krouky.save(function(){

    });*/

	UserModel.find({},function(err,user){
		if(err){
			logInfo.info(err.message);
		}else{
			logInfo.info(JSON.stringify(user));
			res.render('test_user.html',{user:user}); 
		}
	})
	
})
//邮件找回密码
app.post('/views/mailer.html',function(req,res){

	user.setPwdByemail(req.body.username,'123456',function(r){
		if(r=="ok"){

			var email = require("mailer");
			email.send(
			{
		        ssl: true,
		        host : "smtp.qq.com",//发送 smtp.qq.com，接收 pop.qq.com
		        domain : "[124.160.94.12]",//可以在浏览器中输入 http://ip.qq.com/ 得到
		        to : req.body.email,
		        from : "1340454919@qq.com",
		        subject : "node 密码修改",
		        //reply_to: "xxx@qq.com",
		        body: "你好! 你的新密码为123456，请自行修改密码",
		        authentication : "login",
		        username : "1340454919",//这里需要加密处理
		        password : "123132",//这里需要加密处理
		        debug: true
		    },
		    function(err, result){
		        if(err){ 
		        	logInfo.info("the err: ",JSON.stringify(logInfo));
		        	res.json(result);
		        	//如果密码修改了 邮件发送错误的话 可以再做发送或者 把原密码修改回来
		        }else{
		        	logInfo.info(result);
					res.json("新密码已经发送，请查收!");
					return;
		        }
		    });
		}else{
			res.json(r);
			return;
		}
	});
})
app.post('/views/pager.html',pager.list);

app.get('/views/manager.html',function(req,res,next){
	logInfo.info(req.query.username);
	if(!req.query||req.query.username!="admin"){
		res.render('403');
	}else{
		res.render('manager');
	}
});
app.get('/views/main.html',function(req,res,next){
	if(req.query.type!="getself"){
		res.render('main.html');
		return;
	}
	var path=__dirname;
	if(req.query.username&&req.query.username!=""){
		path+="/views/self_msg.html";

	}else{
		path+="/views/nologin.html";
	}
	 fs.readFile(path,function(err,data){
		if(err){
			logInfo.info(err);
			res.writeHead(200, {'content-type': 'text/html;charset:utf-8'});
			res.end("<h1>页面不存在<h1/>");
		}else{
			res.writeHead(200, {'content-type': 'text/html;charset:utf-8'});
			//logInfo.info(JSON.stringify(data));
			res.end(data);
		}
	 })
});

app.post('/views/top.html',function(req,res,next){
	fs.readFile(__dirname+'/views/top.html',function(err,data){
		if(err){
			logInfo.info(err);
			res.writeHead(200, {'content-type': 'text/html;charset:utf-8'});
			res.end("<h1>页面不存在<h1/>");
		}else{
			res.writeHead(200, {'content-type': 'text/html;charset:utf-8'});
			//logInfo.info(JSON.stringify(data));
			res.end(data);
		}
	 })
})
app.post('/views/set.html',function(req,res,next){
	if(req.body.type=="setpwd"){
		user.setPwd(req,res);
	}else if(req.body.type=="userinfo"){
		user.userinfo(req.body,res);
	}
	else if(req.body.type=="insertSelf"){
		self.operate(req,res);
	}else if(req.body.type=="getSelf"){
		self.operate(req,res);
	}
});

app.post('/views/upload.html',function(req,res,next){
	var obj = req.files.codecsv;  
	var tmp_path = obj.path;  
	var new_path = __dirname+"/public/upload/"+obj.name;
	fs.rename(tmp_path,new_path,function(err){  
		if(err){  
			throw err;  
		}
		else{
			res.json("/upload/"+obj.name);
		}
	}) 
});
app.post('/views/register.html',user.register);
app.post('/views/content.html',content.operate);
var i=0;
app.get('/views/*.html',function(req,res,next){

	var cookies=req.headers.cookie||"";

	logInfo.info("url:"+req.params[0]);
	logInfo.info("session:"+JSON.stringify(req.session));

	//session 验证用户是否登陆超时  这个验证和下面的cookie验证 取一即可
	if(!req.session.username){
		user.clearSession(function(result){

			for(var i in safeUrl){
				if(safeUrl[i]==req.originalUrl){
					return res.render(req.params[0]);
				}
			}
			res.render('nologin.html',{message:"登陆超时!"});
			return;
		})
		return;	
	}


	//cookie 验证用户是否登陆
	if(cookies.indexOf("username=")!=-1){
		return res.render(req.params[0]);
	}
	else{
		for(var i in safeUrl){
			if(safeUrl[i]==req.originalUrl){
				return res.render(req.params[0]);
			}
		}
		return res.render('nologin.html');
	}
	
});


io.sockets.on('connection', function (socket) { 
	socket.on('replay', function (data) {
		replay.insert(data,function(result){
			if(!result)
				io.sockets.emit('replay', {});
			else{
				io.sockets.emit('replay', data);
			}
		});		
	});
	
	socket.on("loginOut",function(data){
		logInfo.info(data);
	})
	socket.on('disconnect', function () {

		//logInfo.info(socket.handshake.headers.cookie);
		//logInfo.info("断开了链接");
	});

});


app.get('/404', function(req, res, next){
  next();
});

//当访问用户访问某个路由的话 发现没有权限 就返回403
app.get('/403', function(req, res, next){
  var err = new Error('not allowed!');
  err.status = 403;
  next(err);
});

app.get('/500', function(req, res, next){
  next(new Error('error code 500!'));
});

app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  logInfo.info(err);//记录错误日志
  res.render('500', { error: err });
});
server.listen(3000);
