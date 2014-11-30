var _ = require('stackq'), rq = require('../resourced.js');

_.Jazz('Resourced specs',function($){

    var res = rq.make('users',{});
    res.has('comments');

    $('can i create a resource',function(r){
      r.sync(function(f,g){
        _.Expects.isInstanceOf(f,rq);
      }).use(res);
    });


    res.use({

      findOne: function(req){
        $('can i send a "find" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('get',f.method);
            _.Expects.is(f.params.id,'1');
          }).use(req);
        });
      },

      find: function(req){
        $('can i send a "find" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('get',f.method);
          }).use(req);
        });
      },

      create: function(req){
        $('can i send a "create" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('post',f.method);
          }).use(req);
        });
      },

      update: function(req){
        $('can i send a "update" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('put',f.method);
            _.Expects.isNot(f.params.id,'2');
          }).use(req);
        });
      },

      destroy: function(req){
        $('can i send a "destroy" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('delete',f.method);
            _.Expects.isNot(f.params.id,'2');
          }).use(req);
        });
      },

      track: function(req){
        $('can i send a "track" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('track',f.method);
            _.Expects.isNot(f.params.id,'2');
          }).use(req);
        });
      },

      trackAll: function(req){
        $('can i send a "trackAll" request',function(r){
          r.sync(function(f,g){
            _.Expects.is('track',f.method);
          }).use(req);
        });
      },

      proxyComments: function(req){
        $('can i send a "proxyComments" request',function(r){
          r.sync(function(f,g){
            _.Expects.isString(f.method);
          }).use(req);
        });
      }
    });

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
      $('can i stop watching for "get" on /users/comments a resource',function(r){
        r.sync(function(f,g){
          _.Expects.isObject(f);
          _.Expects.truthy(f.payload);
          _.Expects.falsy(f.provider);
        }).use(c);
      });
    });

    res.remove('/users/comments','get',true);
    res.request('/users/comments/1','put');
});
