module.exports = (function(){

  var _ = require('stackq');
      rx = require('routd');

    // Resources are restful and follow the standard paradigm of atomic and idempotent actions
    // and relationships
    //
    // Resource: Post
    //   //standard http-only methods
    //   get: /posts -> all record
    //   post: /posts/  -> create a record
    //   get: /posts/:id -> a record
    //   put: /posts/:id -> update
    //   delete: /posts/:id -> destroy a record
    //
    //   //can concieve extra methods
    //   patch: /posts/:id -> update in complete record
    //   track: /posts/:id -> to make a socket connection on updates to this particular record
    //   track: /posts -> to make a socket connection on update on all records
    //
    // Resource: Comment
    //   get: /comments
    //   post: /comments/
    //   get: /comments/:id
    //   put: /comments/:id
    //   delete: /comment/:id
    //
    //   patch: /comments/:id
    //   track: /comments/:id
    //   track: /comments
    //
    // Resource Relationships: One-to-One, Many-to-Many , One-to-Many
    //
    // Relationship: Post has Comments
    //
    // One-to-Many,Many-to-Many,One-to-One:
    //   get: /post/:id/comments
    //   post: /post/:id/comments/
    //   put: /post/:id/comments/:id
    //   delete: /post/:id/comments/:id
    //

  var Resource =  _.Configurable.extends({
      init: function(tag,conf,routerx){
        this.$super();
        this.resource = tag;
        this.routes = _.Storage.make('resouce-routes');
        this.modelMap = _.Storage.make('resource-model-routes');
        // this.embedded = _.Storage.make('resource-model-has');
        this.router = rx.Router.isType(routerx) ? routerx : rx.Router.make();
        this.provider = _.Provider.make();
        this.config({
          'routerConf':{
            'exactMatch': true,
            'params':{
              'id':'digits'
            },
          }
        });
        this.config(conf);


        _.enums.each(_.enums.filter(Resource.Methods,_.valids.isString),this.$bind(function(e){
          e = e.toLowerCase();
          if(!this.routes.has(e)) this.routes.add(e,[]);
          var path ,c = this.routes.get(e),model = this.resource;
          var modelMap = this.modelMap.add(e,_.Storage.make(e+':model-routes'));
          if(e == 'get'){
            path = ['',model].join('/');
            modelMap.add(path,'find');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('get',this.$bind(function(c,m,p){
              this.provider.request('find',_.enums.toArray(arguments),this);
            }));
            c.push(path);

            path = ['',model,':id'].join('/');
            modelMap.add(path,'findOne');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('get',this.$bind(function(){
              this.provider.request('findOne',_.enums.toArray(arguments),this);
            }));

            c.push(path);
          }
          if(e == 'post'){
            path = ['',model].join('/');
            modelMap.add(path,'create');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('post',this.$bind(function(){
              this.provider.request('create',_.enums.toArray(arguments),this);
            }));
            c.push(path);
          }
          if(e == 'delete'){
            path = (['',model,':id'].join('/'));
            modelMap.add(path,'destroy');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('delete',this.$bind(function(c,m,p){
              this.provider.request('destroy',_.enums.toArray(arguments),this);
            }));
            c.push(path);
          }
          if(e == 'put'){
            path = _.Util.String('/','',model,':id');
            modelMap.add(path,'update');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('put',this.$bind(function(c,m,p){
              this.provider.request('update',_.enums.toArray(arguments),this);
            }));
            c.push(path);
          }
          if(e == 'patch'){
            path = _.Util.String('/','',model,':id');
            modelMap.add(path,'patch');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('patch',this.$bind(function(c,m,p){
              this.provider.request('patch',_.enums.toArray(arguments),this);
            }));
            c.push(path);
          }
          if(e == 'track'){
            path = _.Util.String('/','',model);
            modelMap.add(path,'trackAll');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('track',this.$bind(function(c,m,p){
              this.provider.request('trackAll',_.enums.toArray(arguments),this);
            }));
            c.push(path);

            path = _.Util.String('/','',model,':id');
            modelMap.add(path,'track');
            this.router.route(path,e,this.getConfigAttr('routerConf'))
            .on('track',this.$bind(function(c,m,p){
              this.provider.request('track',_.enums.toArray(arguments),this);
            }));
            c.push(path);
          }
        }));

        this.events.events('newRoute');
        this.events.events('deadRoute');
        this.events.events('newRequest');
        this.events.events('badRequest');
        this.events.events('badRequest:Provider');
        this.events.events('embeddedResource');
        this.events.events('newStatusRoute');
        this.events.events('deadStatusRoute');

        this.addStatus('404','404');
        this.provider.provide('default',this.$bind(function(c,m,p){
          var provider = this.modelMap.has(c.method) ? this.modelMap.get(c.method).get(c.pattern) : null;
          this.emit('badRequest:Provider',{payload: c, provider: provider});
        }));
      },
      has: function(resource){
        if(!_.valids.isString(resource)) return;
        var method = _.Util.String('','proxy',_.Util.capitalize(resource));
        var url = _.Util.String('/','',this.resource,resource);
        this.events.events(method);
        _.enums.each(Resource.Methods,this.$bind(function(e,i){
          this.add(e,url,method,{
            exactMatch: false,
          });
        }));
        // this.provider.provide(method,this.$bind(function(){
        //   var args = _.enums.toArray(arguments);
        //   this.emit(method,args);
        // }));
        this.emit('embeddedResouce',resource,method);
      },
      request: function(url,method,payload){
        this.emit('newRequest',url,method,payload);
        return this.router.analyze(url,method,payload);
      },
      use: function(map){
        return this.provider.use(map);
      },
      addStatus: function(status,map){
        _.Asserted(_.valids.isString(status),'status must be a normal status code');
        _.Asserted(_.valids.isString(map),'mapping name must be a string');
        this.router.on(status,this.$bind(function(c,m,p){
          this.provider.request(map,_.enums.toArray(arguments),this);
        }));
        this.emit('newStatusRoute',status,map);
      },
      removeStatus: function(status,map){
        _.Asserted(_.valids.isString(status),'status must be a normal status code');
        _.Asserted(_.valids.isString(map),'mapping name must be a string');
        this.router.off(status);
        this.emit('deadStatusRoute',status,map);
      },
      add: function(method,route,map,conf){
        _.Asserted(_.valids.isString(method),'method must be a string');
        _.Asserted(_.valids.isString(map),'mapping function name must be a string');
        _.Asserted(_.valids.isString(route),'route must be a string');
        method = method.toLowerCase();
        var r,mr;
        if(!this.routes.has(method)) r = this.routes.add(method,[]);
        else r = this.routes.get(method);
        if(!this.modelMap.has(method)) mr = this.modelMap.add(method,_.Storage.make(_.Util.String(':',method,'model-routes')));
        else mr = this.modelMap.get(method);
        _.Asserted(!mr.has(route),_.Util.String(' ',route,'is already attached to',mr.get(route)));
        r.push(route);
        mr.add(route,map);
        this.router.route(route,method,conf).on(method,this.$bind(function(c){
          this.provider.request(map,_.enums.toArray(arguments),this);
        }));
        this.emit('newRoute',method,route,map);
        return true;
      },
      remove: function(route,method,shouldUnroute){
        this.routes.each(function(e,i,o,fn){
          if(method && !_.valids.is(method,i)) return fn(null);
          var ind = e.indexOf(route);
          e[ind] = '';
          return fn(null);
        });
        this.modelMap.each(function(e,i,o,fn){
          if(method && !_.valids.is(method,i)) return fn(null);
          if(e.has(route)) e.remove(route);
          return fn(null);
        });
        if(shouldUnroute){
          this.router.unroute(route);
          this.emit('deadRoute',route);
        }
      }
    },{
      Methods: ['get','post','delete','put','patch','track'],
      makeRoutes: function(model){
        var self = this,mres = {};
        _.enums.each(Resource.Methods,function(e){
          c = mres[e] = [];
          if(e == 'get'){
            // c.push(['',model,child].join('/'));
            c.push(['',model].join('/'));
            c.push(['',model,":id"].join('/'));
          }
          if(e == 'post'){
            c.push(['',model].join('/'));
          }
          if(e == 'delete'){
            c.push(['',model,':id'].join('/'));
          }
          if(e == 'put'){
            c.push(['',model,":id"].join('/'));
          }
          if(e == 'patch'){
            c.push(['',model,':id'].join('/'));
          }
          if(e == 'track'){
            c.push(['',model].join('/'));
            c.push(['',model,":id"].join('/'));
          }
        });
        return mres;
      }
  });

  return Resource;
}());
