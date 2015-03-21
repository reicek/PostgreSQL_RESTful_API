// ******************************************
//		Import configurations
// ******************************************

var config				= require("./config.json");

// ******************************************
//		Install NodeJS Dependencies
// ******************************************

// Express
var express				= require('express');
// RethinkDB
var r					= require('rethinkdb');

// ******************************************
//		Create a RethinkDB connection
//		save @ request.rdbConn
// ******************************************

var createConnection 	= function(request, res, next) {
    r.connect(config.rethinkdb)
		.then(function(conn) {
            request.rdbConn = conn;
            next();
        })
		.error(handleError(res))
};

// ******************************************
//		Start Express
// ******************************************

var startExpress		= function() {
    app.listen(config.express.port);
    console.log('Listening on port '+config.express.port);
}

// ******************************************
// 		Close the RethinkDB connection
// ******************************************

var closeConnection		= function(request) {
    request.rdbConn.close();
}

// ******************************************
//		Initialize
// ******************************************

var table				= 'list';
var tableIndex			= 'createdAt';

var initialize 			= function(conn) {
	r.table(table).indexWait('createdAt').run(conn)
		.then(function(err, result) {
			console.log("DB OK, starting express...");
			startExpress();
		})
		.error(function(error){
			console.log("The table is not properly initialized.");
			console.log("Initializing table "+table);
			r.tableCreate(table).run(conn)
				.finally(function(){
					console.log("Initializing index "+tableIndex);
					r.table(table).indexCreate(tableIndex).run(conn)
						.finally(function(){
							console.log("DB Initialized, starting express...");
							startExpress();
						});
				});
		});	
};

r.connect(config.rethinkdb)
	.then(function(conn) {
		console.log("Checking DB...");
		r.dbList().run(conn)
			.then(function(dbList){
				if (dbList.indexOf(config.rethinkdb.db) > -1)
				{
					initialize(conn);
				} else {
					console.log("The DB is not initialized");
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
    var element = request.body;
    element.createdAt = r.now(); // Set the field `createdAt` to the current time

    r.table(table).insert(element, {returnVals: true}).run(request.rdbConn, function(error, result) {
        if (error) {
            handleError(res, error) 
        }
        else if (result.inserted !== 1) {
            handleError(res, new Error("Document was not inserted.")) 
        }
        else {
            res.send(JSON.stringify(result.new_val));
        }
        next();
    });
}

// ------------------------------------------
//		Delete an element
// ------------------------------------------

var	remove				= function (request, res, next) {
    var element = request.body;
    if ((element != null) && (element.id != null)) {
        r.table(table).get(element.id).delete().run(request.rdbConn, function(error, result) {
            if (error) {
                handleError(res, error) 
            }
            else {
                res.send(JSON.stringify(result));
            }
            next();
        });
    }
    else {
        handleError(res, new Error("The element must have a field `id`."))
        next();
    }
}

// ******************************************
//		Basic Express Setup
// ******************************************

// Create the application
var app					= express();
// Create a connection to the database
app.use(createConnection);
// Define main routes
app.route('/lista/list').get(list);
app.route('/lista/add').put(add);
app.route('/lista/remove').post(remove);
// Close connection to the database
app.use(closeConnection);