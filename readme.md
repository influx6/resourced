# Resourced
  Resourced is a nice nifty library that provides a basic standard api for creating a combination of restful urls 
  to function calls,it generates the basic standard sets and allows the developer to push beyond by mapping.

## Installation
 	
	npm install resourced

## Examples

Lets require and setup our resourced object for restful mapping:

 
   var resd = require('resourced');

   var res = resd.make('Users',{});
   res.use({
  	find: function(){ 
  		/* handles all get request for /users on http 'get' method */
  	},
  	findOne: function(){ 
  		/* handles all get request for /users/:id on http 'get' method */
  	},
  	update: function(){ 
  		/* handles all get request for /users/:id on http 'put* method/
  	},
  	create: function(){ 
  		/* handles all get request for /users on http 'post' method */
  	},
  	destroy: function(){ 
  		/* handles all get request for /users/:id on http 'delete' method */
  	},
  	patch: function(){ 
  		/* handles all get request for /users/:id on http 'patch' method */
  	},
  	track: function(){ 
	    /* handles all get request for /users and /users/:id on http 'track' method */
	},
  	trackAll: function(){ 
	   /* handles all get request for /users on http 'track' method */
	},
   });
 

Lets include a embedded model also:

	
 	res.has('comments'); 


This creates a '/users/comments' route that is called on all http request regardless of the method, this allows the
user of the api to forward the request to another resourced object or to their own internal api or library. 
Now we can make a series of requests and see how it behave nicely.


    res.request('/users','get');
    res.request('/users','post');
    res.request('/users','track');
    res.request('/users/1','get');
    res.request('/users/1','put');
    res.request('/users/1','delete');
    res.request('/users/1','track');
    res.request('/users/comments','get');
    res.request('/users/comments/1','put');

    res.on('badRequest:Provider',function(c){
      /* returns a map({}) containing the url parsed from the internal resourced router */
    });
    

 
Lets add a custom route with a custom mapping:

 

    /*
   
     Resourced.prototype.add
     Arguments: method, route, mapping, routerConfig
     	method: any http method or custom method to watch for
     	route: the route to be used
     	mapping: the function name to use as the mapping provider
     	routerConfig: a map({}) containing configuration for the internal router as to this route,look to
     	'https://github.com/influx/routd' for more information
    */
    
    res.add('get','/users/:name','findName',{ 
   	validators: { name: function(f){ return typeof f === 'string'; } 
    });
   
    res.use({
    
     findName: function(){
    	// deal with all /users/:name route calls on the http 'get' method
     }
    
    });
   


 
Now all request of the type '/users/:string', will be directed to the function 'findName'.

We can eqauly stop listening for specific requests type. Lets stop listening for get request 
for our comments embedded route:
 

    /*
     Resourced.prototype.remove
     Arguments: route, method, shouldRemoveInRouter?
     	route: the route used
     	method: the specific method to stop watching
     	shouldRemoveInRouter: should just stop listening for the route in the router,makes the method of no effect as it overrides all methods
    */
    res.remove('/users/comments','get',true); 
    res.request('/users/comments/1','put'); //request is not dealt with but transfered to badRequest:Provider
    	