var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var port = 8080;
var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

// var refcode = [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x",'y','z']
// APP CONFIG
app.use(bodyparser.urlencoded({extended: true}))
app.use(express.static('css'));
app.set('view engine', 'ejs')

//create or connect to mongodb
mongoose.connect('mongodb://localhost/shorturl');
var urlSchema = new mongoose.Schema({
	ori_url : String,
	new_url : String
})
var Url = mongoose.model('Url',urlSchema);

app.get('/',function(req,res){
	res.render('index');
})

app.get('/zap/:http*',function(req,res){
	var url = req.params.http + req.params[0];
	if(url.match(urlregex)){//good url format
	
		Url.aggregate([ // Find last generated short url
		{ $match: {}},{
			$group: {_id: 'last url',last: {$max: '$new_url'}}
		}
		],function(err,data){
			if(err) {console.log(err)}
			var last = Number(data[0].last);
			Url.find({ori_url : url},function(err,doc){ //Check if URL exist in db
				if(err){
					res.redirect('/')
				}	
				if(doc[0] === undefined){// if new url adds to db and returns new short url
					addURL = zap(last);
					dbCreate(url,addURL);
					var results = JSON.stringify({
				"old_url": url,
				"new_url": 'http://localhost:8080/' + addURL
			})
				} else {
					var results = JSON.stringify({ // return short url if exists in db
					old_url : doc[0].ori_url,
					new_url : 'http://localhost:8080/' + doc[0].new_url})
				}
				res.send(results)
			})
	})
	}
	else{
		res.send("bad url")
	}
})

// SHOW ROUTE
app.get('/:shawty',function(req,res){
	Url.find({new_url: req.params.shawty},function(err,link){
		if(err){
			res.redirect('/')
		}
		else {
			res.redirect(link[0].ori_url)
		}
	})
})

// dbCreate('http://www.indeed.com','004')
// // listen for requests :)
// // var listener = app.listen(process.env.PORT, function () {
// //   console.log('Your app is listening on port ' + listener.address().port);
// });
app.listen(8080, process.env.IP,function () {
  console.log('Your app is listening on port ' + port);
});

// Add to db function
function dbCreate(old,added){
	Url.create({
		ori_url: old,
		new_url: added
	}, function(err,url){
		if(err){
			console.log(err)
		} else {
			console.log("url added",url)
		}
	})
}
// GENERATE NEW Url
function zap(num) {
	num++
	while(num.toString().length < 3){
		num = '0' + num;
	}
	return num
}