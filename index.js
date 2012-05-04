// koth = require("knockout-template-helper");
// koth(
//      __dirname+'/templates', 
//      { watch : true, prepend : ['./top.html'], append : ['./bottom.html'] },
//      function(handler) { app.use('/myapp.html', handler); }
//  );

fs = require('fs');
walker = require('walker');
et = require('elementtree');
async = require('async');


var slashdot = function(s) { return s.replace(/\//g, '.').replace('.',''); };

var koth = function(dir, opts, callback) {
    opts = opts ? opts : {watch: false, prepend:[], append:[]};
    callback = callback ? callback : function(){}; 
    var cache = { templates : [], prepends : [], appends : [] };

    if(opts.watch) {
        var chokidar = require('chokidar');
        console.log(dir);
        //watch directory of templates
        var watchTemplates = chokidar.watch();
        watcherTemplates.add(dir);
        watcherTemplates.on('add', reloadTemplates);
        watcherTemplates.on('change', reloadTemplates);
        watcherTemplates.on('unlink', reloadTemplates);
        
        //watch fixtures
        watchFixtures = chokidar.watch();
        watchFixtures.add(opts.prepend.concat(opts.append));
        watcherFixtures.on('add', reloadFixtures);
        watcherFixtures.on('change', reloadFixtures);
        watcherFixtures.on('unlink', reloadFixtures);
    }
    
  
    var reloadFixtures = function(cb) {
        /* Updates cache.prepends and cache.appends */
        var ps = [], as = []; 
        async.forEach([[ps,opts.prepend],[as,opts.append]], function(set,ecb) {
            var list = set[0], files = set[1];
            async.forEachSeries(files, function(file, escb) {
                fs.readFile(file, function(err, data) {
                    if(err) { 
                        escb(err);
                    } else {
                        list.push(data);
                        escb();
                    }
                });
            }, ecb);

        }, function(err) {
            if(err) cb(err);
            cache.prepends = ps;
            cache.appends = as;
            cb();
        } );
    };

    var reloadTemplates = function(cb) {
        /* Updates cache.templates */
        findTemplates(function(err, templates) {
            if(err) cb(err);
            cache.templates = templates;
            cb();
        });
    };

    var findTemplates = function(cb) {
        var templates = [];
        files = [];
        walker(dir).
            on('file', function(f,stat){ files.push(f); }).
            on('end', function() { 
                async.forEach(files, function(file, ecb) {
                    fs.readFile(file, function(err, data) {
                        if(err) { 
                            ecb(err);
                        } else {
                            var path = slashdot(file.split('.')[0].split(dir)[1]);
                            data = "<html><body>"+data+"</body></html>";
                            var etree = et.parse(data);
                            tpls = etree.findall('.//script'); 
                            for(var i=0; i<tpls.length; i++) {
                                var tpl = tpls[i];
                                var id = tpl.attrib['id'];
                                var newPath = path + '.' + id;
                                tpl.attrib['id'] = newPath;
                                var markup = et.tostring(
                                    tpl, {'xml_declaration': false });
                                templates.push(markup);
                            }
                            ecb();
                        }
                    });
                }, function(err) {cb(null, templates);});
            });
    };

    var handler = function(req, res) {
        if(opts.watch || !cache.output) { 
            //we're either watching files or first-run, generate output
            var out = "";
            out += cache.prepends.join("");
            out += cache.templates.join("");
            out += cache.appends.join("");
            cache.output = out;
        }
        res.send(cache.output);
    }

    //entry point
    reloadFixtures(function(){reloadTemplates(function(){callback(handler)});});


};

module.exports = koth;
