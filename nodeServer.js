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
//		Basic Express Setup
// ******************************************

// Create the application
var app					= express();
// Create a connection to the database
app.use(createConnection);
// Data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// Define main routes
app.route('/lista/list').get(list);
app.route('/lista/add').put(add);
app.route('/lista/remove').post(remove);
// Static files server
app.use(serveStatic('./public'));
// Close connection to the database
app.use(closeConnection);


// ******************************************
//		API
// ******************************************

// ------------------------------------------
//		Create a RethinkDB connection
//		save @ request.rdbConn
// ------------------------------------------

var createConnection 	= function(request, res, next) {
    r.connect(config.rethinkdb)
		.then(function(conn) {
            request.rdbConn = conn;
            next();
        })
		.error(handleError(res))
};

// ------------------------------------------
// 		Close the RethinkDB connection
// ------------------------------------------

var closeConnection		= function(request) {
    request.rdbConn.close();
}
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
	console.log('API - Sending all elements');
	console.log('_____________________');
    r.table(table).orderBy({index: "createdAt"}).run(request.rdbConn)
	.then( function(cursor) {
		return cursos.toArray();
	})
	.error(handleError(res))
	.finally(next);
}

// ------------------------------------------
//		Insert an element
// ------------------------------------------

var add					= function(request, res, next) {
	var element			= request.body;
	console.log('_____________________');
	console.log('API - Saving element');
	console.log(element);
	console.log('_____________________');
}

// ------------------------------------------
//		Delete an element
// ------------------------------------------

var	remove				= function (request, res, next) {
	var element			= request.body;
	console.log('_____________________');
	console.log('API - Deleting element');
	console.log(element);
	console.log('_____________________');
}