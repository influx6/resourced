# Resourced
  Resourced is a nice nifty library that provides a basic standard api for creating a combination of restful urls to function calls,it generates the basic standard sets and allows the developer to push beyond by mapping.

## Installation
 	
	npm install resourced

## Examples

  var res = require('resourced');

  var Users = res.make('Users',{});
  Users.use({
  	findOne: function(){ /* handles all get request for /users */},
  	update: function(){ /* handles all get request for /users/:id */},
  	create: function(){ /* handles all get request for /users */},
  	destroy: function(){ /* handles all get request for /users/:id */},
  	patch: function(){ /* handles all get request for /users/:id */},
  	track: function(){ 
	    /* handles all get request for /users and /users/:id when the http method is track */
	},
  	trackAll: function(){ 
	   /* handles all get request for /users when http method is track */
	},
  });

 Lets include a embedded model also:
  
 Users.has('comments'); 
	creates a /users/comments route that gets call on all http methods,these allows the user of the api to forward the request to another resourced object or to their own internal api or library


