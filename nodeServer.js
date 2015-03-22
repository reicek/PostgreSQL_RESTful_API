// ******************************************
//		Import configurations
// ******************************************

var config				= require('./config.json');

// ******************************************
//		Install NodeJS Dependencies
// ******************************************

// Express
var express				= require('express');
// Serve-Static 
var serveStatic			= require('serve-static');
// Body-Parser
var bodyParser			= require('body-parser');
// Multer
var multer				= require('multer')
// RethinkDB
var r					= require('rethinkdb');

// ******************************************
//		Initialize
// ******************************************

var table				= 'list';
var tableIndex			= 'createdAt';

var startExpress		= function() {
    app.listen(config.express.port);
	console.log('_____________________');
	console.log('HTTP and API server online')
    console.log('Listening on port '+config.express.port);
	console.log('_____________________');
}

var initialize 			= function(conn) {
	r.table(table).indexWait('createdAt').run(conn)
		.then(function(result) {
			console.log("DB OK, starting express...");
			console.log('_____________________');
			startExpress();
		})
		.error(function(error){
			console.log("The table doesn't exist.");
			console.log("Initializing table: "+table);
			r.tableCreate(table).run(conn)
				.finally(function(){
					console.log("Initializing index: "+tableIndex);
					r.table(table).indexCreate(tableIndex).run(conn)
						.finally(function(){
							console.log("DB Initialized, starting express...");
							console.log('_____________________');
							startExpress();
						});
				});
		});	
};

r.connect(config.rethinkdb)
	.then(function(conn) {
		console.log('_____________________');
		console.log("Conection stablished");
		console.log("Checking DB...");
		r.dbList().run(conn)
			.then(function(dbList){
				if (dbList.indexOf(config.rethinkdb.db) > -1)
				{
					initialize(conn);
				} else {
					console.log("The DB doesn't exist.");
					console.log("Initializing DB "+config.rethinkdb.db);
					r.dbCreate(config.rethinkdb.db).run(conn)
						.then(initialize(conn))
				}
			})
	})
	.error(function(error){
		console.log("Could not open a connection to initialize the database "+config.rethinkdb.db);
		console.log(err.message);
		process.exit(1);
	});

// ******************************************
//		API
// ******************************************

// ------------------------------------------
//		Send back a 500 error
// ------------------------------------------

var handleError			= function(res) {
    return function(error){
		res.send(500,{error: error.message});
	}
}


// ------------------------------------------
//		Retrieve all elements
// ------------------------------------------

var list				= function(request, res, next) {
	console.log('_____________________');
	console.log('API - list/list');
	
	r.connect(config.rethinkdb)
		.then(function(conn) {
			r.table(table).orderBy({index: "createdAt"}).run(conn)
				.then( function(data) {
					var query = data._responses[0].r;
					res.send(query);
					console.log('Done.');
					console.log('_____________________');
				})
				.error(handleError(res))
		});
}

// ------------------------------------------
//		Insert an element
// ------------------------------------------

var add					= function(request, res, next) {
	var element			= request.body;
	console.log('_____________________');
	console.log('API - list/add');
	console.log(element);
	element.createdAt	= r.now();
	
	r.connect(config.rethinkdb)
		.then(function(conn) {
			r.table(table).insert(element).run(conn)
				.then( function() {
					console.log('Done.');
					console.log('_____________________');
				})
				.error(handleError(res))
		});
}

// ------------------------------------------
//		Delete an element
// ------------------------------------------

var	empty				= function (request, res, next) {
	var element			= request.body;
	console.log('_____________________');
	console.log('API - list/empty');
	
	r.connect(config.rethinkdb)
		.then(function(conn) {
			r.table(table).delete({returnChanges: true}).run(conn)
				.then( function(changes) {
					console.log(changes);
					console.log('Done.');
					console.log('_____________________');
				})
				.error(handleError(res))
		});
}

// ******************************************
//		Basic Express Setup
// ******************************************

// Create the application
var app					= express();
// Data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// Define main routes
app.route('/list/list').get(list);
app.route('/list/add').put(add);
app.route('/list/empty').post(empty);
// Static files server
app.use(serveStatic('./public'));