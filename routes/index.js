var express = require('express');
var request = require('request');
var redis = require('redis');
var client = redis.createClient();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/search', function(req,res,next) {
	var query = req.query;

	if (!!query.search) {
		console.log(query);
		var url = "http://www.omdbapi.com?s="+query.search;

		request(url, function(err,resp,body){
			if (!err && resp.statusCode === 200) {
				var theBody = JSON.parse(body);
				res.render('search', {movies: theBody.Search});
			}
		});
	} else {
		console.log("NO query parameter");
		res.render('search', {movies: []});
	}
});

//var movies = {"its": "your world"};

router.get('/movies', function(req,res,next){
	client.keys("*", function(err,data){
		console.log("GOT HERE", data);
		var movies = {};
		var count = 0;
		for (var i = 0; i<data.length; i++) (function(k){
			client.get(data[k], function(err,d){
				count++;
				movies[data[k]] = d;
				if (count === data.length) {
					res.render('movies/index', {movies: movies})
				}
			})
		})(i);
	});
});

router.get('/movies/new', function(req,res,next){
	res.render('movies/new');
});

router.get('/movies/:title', function(req,res,next){
	var title = req.params.title;
	client.get(title, function(err,data){
		if (err) res.render('error');
		var movie = {title: title, description: data};
		res.render('movies/show', {movie: movie});
	});
});

router.post('/movies', function(req,res,next){
	var title = req.body.title;
	var description = req.body.description;

	movies[title] = description;
	client.set(title, description, function(err, resp){
		if (err) res.render('error');
		res.redirect('/movies/'+title);
	});
});



router.get('/movies/:title/edit', function(req,res,next){
	res.send('edit movie');
});

router.put('/movies/:title', function(req,res,next){
	res.send('updated');
});

router.delete('/movies/:title', function(req,res,next){
	res.send("deleted");
});

module.exports = router;
