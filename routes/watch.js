//关注账号和收藏话题
var MyMongo = require('../conDB.js').MyMongo;
var BSON = require('mongodb').BSONPure; 
var db = new MyMongo('localhost', 27017, 'user');
var COL = 'watch';
var logger = require('./logger.js').logger;  

exports.operate = function(req, res, next) {
   if(req.body&&req.body.type=='insert'){
    db.query(COL,function(collection) {
		var doc={username:req.body.username,state:req.body.state，watchuser:req.body.watchuser,contetnid:req.body.contentid||""}//state 1 关注  2 收藏
		collection.insert(doc,function(err,result){
				if(!err){
					console.log(result);
					res.json('ok');
				}else{
					console.log("添加watch信息报错:");
					console.log(err);
					res.json(err);
				}	
			});
    });
   }
   else if(req.body&&req.body.type=='getlist'){//main 获取所有话题 不分页
	   db.query(COL,function(collection) {
			var where={};
			if(req.body.username)
				where={username:req.body.username}
			if(req.body.contentid){
				var obj_id;
				
				try
				{
					obj_id = BSON.ObjectID.createFromHexString(req.body.contentid)
				}
				catch (e)
				{
					logger.info("conentjs,line:18!"+e.message);
				}
				where={_id:obj_id}
			}
			 
			collection.find(where).sort({time:-1}).toArray(function (error, docs) {
				if (error) {
					res.json(error);
				} else {
					res.json(docs);
				} 
			});
		});
   }
}

