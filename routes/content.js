var MyMongo = require('../conDB.js').MyMongo;
var cookie=require('cookie');
var BSON = require('mongodb').BSONPure; 
var db = new MyMongo('localhost', 27017, 'user');
var COL = 'content';
var logger = require('./logger.js').logger;  

exports.operate = function(req, res, next) {
   if(req.body&&req.body.type=='insert'){
    db.query(COL,function(collection) {
		var doc={username:req.body.username,content:req.body.content,time:req.body.datetime,title:req.body.title}
		collection.insert(doc,function(err,result){
				if(!err){
					console.log(result);
					res.json('ok');
				}else{
					console.log("添加content信息报错:");
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
	else if(req.body&&req.body.type=='pagelist'){
		db.query(COL,function(collection){
			var count=req.body.pageCount||10;//每页数
			var index=req.body.pageIndex||1;//当前页码
			var begin=(Number(index)-1)*Number(count);//开始条数 
			//logger.info(JSON.stringify(req.body));
			var where={};
			if(req.body.username)
				where={username:req.body.username}
			collection.find(where).skip(Number(begin)).limit(Number(count)).sort({time:-1}).toArray(function (error, docs) {
					if (error) {
						res.json(error);
					} else {
						collection.count({},function(err,count){
							var result={};
							result.data=docs;
							result.count=count;
							res.json(result);
					})
						
				}
			});
		})	  
	}
   else if(req.body&&req.body.type=='unitereplay'){
	   db.query('replay',function(collection) {	
		   var where={};
			 if(req.body.get=="join"){
				where.username=req.body.username;
			 }
			collection.find(where,{contentid:1,_id:0,username:1}).toArray(function (error, docs) {
				if (error) {
					res.json(error);
				} else {
					var arr=new Array();//congentid集合
					for(var i in docs){
						arr.push(BSON.ObjectID.createFromHexString(docs[i].contentid));
					}
					//console.log(arr);
					 db.query(COL,function(_collection) {
						 var _where={};
						 if(req.body.get=="noreplay"){
							_where._id={$not:{$in:arr}};
						 }else if(req.body.get=="join"){
							_where._id={$in:arr};
						 }
						 //console.log(_where);
						_collection.find(_where).limit(5).sort({time:-1}).toArray(function (_error, _docs) {
							try{
								if (_error) {
									res.json(_error);
								} else {
									res.json(_docs);
								} 
							}catch(e){
								console.log(e.message);
								console.log("err!line 69 from console.js");
							}
						});
					});
				} 
			});
		});
   }
}

