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