//加密、解密
var crypto=require("crypto");
var fs=require('fs');
var logger = require('./logger.js').logger; 

//bidirectional 表示单向
exports.set=function(options,callback){
	var _options={
		path:options.path, //秘钥的文件路径
		algorithm :options.algorithm||"md5",   //加密的算法 例如：'sha1', 'md5', 'sha256', 'sha512'等  默认为md5
		direction : options.direction||"one",  //表示 加密单向还是双向 默认为单向
		input_encoding : options.input_encoding||"utf8",  //输入加密的字符的编码格式 可以为'hex', 'binary' 或者'base64' 默认为hex
		output_encoding :options.output_encoding||"hex",  //输出的字符编码
		text : options.text  //需要加密的字符串
	}
	try{
		if(_options.direction=="one"){
			var hasher=crypto.createHash(_options.algorithm);
			hasher.update(_options.text);
			var hashmsg=hasher.digest(_options.encoding);
			logger.info("加密:"+hashmsg);
			callback(hashmsg);
		}
		else if(_options.direction=="two"){
			var key=readFile(_options.path);
			logger.info("key:"+key);
			var cipher=crypto.createCipher('aes-256-cbc', key);
			var crypted =cipher.update(_options.text,_options.input_encoding,_options.output_encoding);
			crypted+=cipher.final('hex');
			var message=crypted;  //加密之后的值
			callback(message);
		}else{
			callback(new Error("参数错误"))
		}
	}catch(err){
		callback(new Error(err.message))
	}
}

exports.get=function(options,callback){
	var _options={
		path : options.path,  //秘钥的文件路径
		algorithm : options.algorithm||"md5",  //加密的算法 例如：'sha1', 'md5', 'sha256', 'sha512'等  默认为md5
		direction : options.direction||"one",  //表示 加密单向还是双向 默认为单向
		input_encoding : options.input_encoding||"hex",  //输入加密的字符的编码格式 可以为'hex', 'binary' 或者'base64' 默认为hex
		output_encoding : options.output_encoding||"utf8",  //输出的字符编码
		text : options.text  //需要加密的字符串
	}
	try{
		var key=readFile(_options.path);
		var decipher = crypto.createDecipher('aes-256-cbc',key);
		var dec=decipher.update(_options.text,_options.input_encoding,_options.output_encoding);
		dec+= decipher.final('utf8'); //解密之后的值
		callback(dec);
	}catch(err){
		callback(new Error(err.message))
	}
}

function readFile(path){
	return fs.readFileSync(path);
}