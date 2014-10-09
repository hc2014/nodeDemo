var MyMongo = require('../conDB.js').MyMongo;
var cookie=require('cookie');

var db = new MyMongo('localhost', 27017, 'user');
var COL = 'pager';

exports.list = function(req,res) {
	try{
	var count=req.body.pagecount||10;
	var index=req.body.pageindex||1;
	var begin=(Number(index)-1)*Number(count);
    db.query(COL,function(collection) {

	collection.find().skip(Number(begin)).limit(Number(count)).sort({name:-1}).toArray(function (error, docs) {
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
    });}
    catch(e){
    	res.json(e.message);
    }
}



