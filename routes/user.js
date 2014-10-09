var MyMongo = require('../conDB.js').MyMongo;
var cookie=require('cookie');
var logger = require('./logger.js').logger;  


var db = new MyMongo('localhost', 27017, 'user');
var COL = 'user';

exports.login = function(req, res, next) {
	logger.info("begin login");  
    db.query(COL,function(collection) {
		collection.count({
			"username": req.body.username,
			"pwd": req.body.pwd
		},
		function(err, count) {
			if (count == 1) {
				var cookies=req.headers.cookie||[];
				if(cookies.length>0){
					for(var i in cookies){
						if(cookies[i].split('=')[0]=="username"){
							res.setHeader('Set-Cookie', cookies[i]+'; path=/; max-age=0');
						}
					}
				}
				res.setHeader('Set-Cookie', 'username='+req.body.username+'; path=/; max-age=360000');//设置cookie
				req.session.username=req.body.username;//设置session
				res.json("ok");
			} else {
				res.json("err");
			}
		})
    });
}


exports.list = function(req, res, next) {
    db.query(COL,function(collection) {
		collection.find().toArray(function (error, bars) {
			if (error) {
				res.json(error);
			} else {
				res.json(bars);
			}
        });
    });
}

exports.userinfo = function(data,res) {
    db.query(COL,function(collection) {
	collection.find({"username":data.username}).toArray(function (error, docs) {
			if (error) {
				res.json(error);
			} else {
				res.json(docs);
			}
		});
    });
}

exports.setPwdByemail=function(username,pwd,callback){
	logger.info(username);
	logger.info(pwd);
	db.query(COL,function(collection) {
		collection.count({
			"username": username
		},
		function(err, count) {
			if (count == 1) {
				collection.update({ username: username }, { $set: { pwd: pwd } }, function (err, result) {
					if (!err) {
						console.log("修改密码结果:"+result);
						callback("ok");
					} else {
						console.log("修改userinfo信息报错:");
						console.log(err);
						callback("err");
					}
				});
			} else {
				callback("用户不存在");
			}
		})
    });
}

exports.setPwd = function(req,res) {
    db.query(COL,function(collection) {
		collection.count({
			"username": req.body.username,
			"pwd": req.body.oldpwd
		},
		function(err, count) {
			if (count == 1) {
				collection.update({ username: req.body.username }, { $set: { pwd: req.body.newpwd } }, function (err, result) {
					if (!err) {
						console.log("修改密码结果:"+result);
						var cookies=req.headers.cookie||[];
						if(cookies.length>0){
							for(var i in cookies){
								if(cookies[i].split('=')[0]=="username"){
									res.setHeader('Set-Cookie', cookies[i]+'; path=/; max-age=0');
								}
							}
						}
						res.json('ok');
					} else {
						console.log("修改userinfo信息报错:");
						console.log(err);
						res.json(err);
					}
				});
			} else {
				res.json(err);
			}
		})
    });
}

exports.clearSession=function(callback){
	db.query("sessions",function(collection){
		collection.remove({},function(err,result){
			if(!err){
				callback(result);
			}
		})
	})
}

exports.register = function(req, res, next) {
    if(req.body.type&&req.body.type=="checkUser"){
		db.query(COL,function(collection) {
			collection.count({
				"username": req.body.username
			},
			function(err, count) {
				if (count ==0) {
					res.json(0);
				} else {
					res.json(1);
				}
			})
		});
	}
	else{
		db.query(COL,function(collection) {
			var doc={username:req.body.username,pwd:req.body.pwd,email:req.body.email,nickname:req.body.nickname}
			collection.insert(doc,function(err,result){
				if(!err){
					res.json('ok');
				}else{
					console.log("添加用户报错:");
					console.log(err);
					res.json(err);
				}	
			});
		});
	}
}


