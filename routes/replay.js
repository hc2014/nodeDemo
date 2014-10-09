var MyMongo = require('../conDB.js').MyMongo;
var db = new MyMongo('localhost', 27017, 'user');
var COL = 'replay';
exports.insert=function(data,callback){
	db.query(COL,function(collection) {
			var doc={username:data.username,contentid:data.contentid,replaytxt:data.replaytxt,time:data.time,replayid:data.replayid}
			collection.insert(doc,function(err,result){
					if(!err){
						callback(true);
					}else{
						console.log("添加replay信息报错:");
						console.log(err);
						callback(false);
					}	
				});
		});
}

exports.operate = function(req, res, next) {
	if(req.body.type&&req.body.type=="insert"){
	   db.query(COL,function(collection) {
			var doc={username:req.body.username,contentid:req.body.contentid,replaytxt:req.body.replaytxt,
				time:req.body.datetime,replayid:req.body.replayid}
			collection.insert(doc,function(err,result){
					if(!err){
						res.json('ok');
					}else{
						console.log("添加replay信息报错:");
						console.log(err);
						res.json(err);
					}	
				});
		});
	}
	else if(req.body.type&&req.body.type=="getlist"){
		db.query(COL,function(collection) {
			var where={};
			if(req.body.replayid&&req.body.username){
				where={replayid:req.body.replayid}
			}
			else{
				where={contentid:req.body.contentid,replayid:""};//默认情况
			}
			collection.find(where).toArray(function (error, docs) {
				if (error) {
					res.json(error);
				} else {
					res.json(docs);
				}
			});
		});
	}
}


