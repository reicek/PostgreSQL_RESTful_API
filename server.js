/**
 * server.js - NodeJS Restful API for PostgreSQL
 * 2015, by Cesar Anton Dorantes @reicek
 * for https://platzi.com/blog
 * This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/.
 **/
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
var multer				= require('multer');
// PostgreSQL
var massive				= require("massive");
var connectionString	= "postgres://postgres:zero15@localhost/postgres";
var massiveInstance		= massive.connectSync({connectionString : connectionString}) 

// ******************************************
//		Initialize
// ******************************************
var app					= express();
var table				= 'list';
var tableIndex			= 'createdAt';

var startExpress		= function() {
    app.listen(config.express.port);
	console.log('_____________________');
	console.log('HTTP and API server online')
    console.log('Listening on port '+config.express.port);
	console.log('_____________________');
}

var initialize 			= function() {
	startExpress()
}
initialize()

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

var list				= function() {
	console.log('_____________________');
	console.log('API - list/list');
	var db = app.get('db');
	console.log(db)
}

// ------------------------------------------
//		Insert an element
// ------------------------------------------

var add					= function() {
	console.log('_____________________');
	console.log('API - list/add');
	console.log(element);
}

// ------------------------------------------
//		Delete all elements
// ------------------------------------------

var	empty				= function () {
	console.log('_____________________');
	console.log('API - list/empty');
}

// Expose API
module.exports = {
  handleError : handleError,
  list        : list,
  add         : add,
  empty       : empty
}

// ******************************************
//		Basic Express Setup
// ******************************************
// Data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// Define main routes
app.route('/api/list').get(list);
app.route('/api/add').put(add);
app.route('/api/empty').post(empty);
// Static files server
app.use(serveStatic('./public'));
// Set a reference to the massive instance on Express' app:
app.set('db', massiveInstance);