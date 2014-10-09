/*var mongodb = require('mongodb');

var server = new mongodb.Server('localhost',27017,{auto_reconnect:true});
module.exports = server;*/
var mongodb = require('mongodb');

function MyMongo(host, port, dbname) {
    this.host = host;
    this.port = port;
    this.dbname = dbname;

    this.server = new mongodb.Server(
                              host, 
                              port, 
                              {auto_reconnect: true});

	/*var db_options={
        w:-1,// 设置w=-1是mongodb 1.2后的强制要求，见官方api文档
        logger:{
        doDebug:true,
        debug:function(msg,obj){
            console.log('[debug]',msg);
        },
        log:function(msg,obj){
            console.log('[log]',msg);
        },
        error:function(msg,obj){
            console.log('[error]',msg);
        }
    }
};*/
    this.db_connector = new mongodb.Db(this.dbname, this.server,{w:-1});

    var self = this;

    this.db = undefined;
    this.queue = [];
    this.db_connector.open(function(err, db) {
            if( err ) {
                console.log(err);
                return;
        }
        self.db = db;
        for (var i = 0; i < self.queue.length; i++) {
            var collection = new mongodb.Collection(
                                 self.db, self.queue[i].cn);
            self.queue[i].cb(collection);
        }
        self.queue = [];

    });
}
exports.MyMongo = MyMongo;

MyMongo.prototype.query = function(collectionName, callback) {
    if (this.db != undefined) {
        var collection = new mongodb.Collection(this.db, collectionName);
        callback(collection);
        return;
    }
    this.queue.push({ "cn" : collectionName, "cb" : callback});
}

  