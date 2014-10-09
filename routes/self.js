var MyMongo = require('../conDB.js').MyMongo;

var db = new MyMongo('localhost', 27017, 'user');
var COL = 'self';


exports.operate = function(req, res, next) {
   if(req.body&&req.body.type=='insertSelf'){
    db.query(COL,function(collection) {
		var doc={username:req.body.username,src:req.body.src||"",ss:req.body.ss||"",address:req.body.address||""}
		collection.count({
			"username": req.body.username
		},
		function(err, count) {
			var set={};
			if(!req.body.src){
				set.address=req.body.address;
				set.ss=req.body.ss;
			}else{
				set.src=req.body.src;
			}
			
			if (count == 1) {
				
				collection.update({username:req.body.username},{$set:set},function(err,result){
				if(!err){
					console.log(result);
					if(set.src){
						res.json(req.body.src);
					}else{
						res.json("ok");
					}
				}else{
					console.log("修改userinfo信息报错:");
					console.log(err);
					res.json(err);
				}	
			});
			} else {
				collection.insert(doc,function(err,result){
				if(!err){
					if(set.src){
						res.json(req.body.src);
					}else{
						res.json("ok");
					}
				}else{
					console.log("添加userinfo信息报错:");
					console.log(err);
					res.json(err);
				}	
			});
			}
		})
    });
   }
   else if(req.body&&req.body.type=='getSelf'){
	   db.query(COL,function(collection) {
			collection.find({username:req.body.username}).toArray(function (error, bars) {
				if (error) {
					res.json(error);
				} else {
					res.json(bars);
				}
			});
		});
   }
}




