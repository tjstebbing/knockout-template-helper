

var fs = require('fs');
var walker = require('walker');
var et = require('elementtree');
var async = require('async');


var slashdot = function(s) { return s.replace(/\/|\\/g, '.').replace('.',''); };
var noop = function(){};

var koth = function(master, dir, watch, callback) {
    callback = callback ? callback : function(){};
    var cache = { templates : [], master : null};


    var reloadMaster = function(cb) {
        fs.readFile(master, function(err, data) {
            if(err) {
                cb(err);
            } else {
                cache.master = data+"";
                cb();
            }
        });
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
        var files = [];
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
                                templates.push(et.tostring(tpl));
                            }
                            ecb();
                        }
                    });
                }, function(err) {cb(null, templates);});
            });
    };

    var handler = function(req, res) {
        if(watch || !cache.output) {
            //we're either watching files or first-run, generate output
            try {
                cache.output = cache.master.replace("</body>",
                        cache.templates.join("")+"</body>");
            } catch(e) {
                throw e;
            }
        }
        res.send(cache.output);
    }

    if(watch) {
        var chokidar = require('chokidar');
        chokidar.watch(dir).on('change', function(){reloadTemplates(noop);});
        chokidar.watch(master).on('change', function(){reloadMaster(noop);});

    }

    //entry point
    reloadMaster(function(){reloadTemplates(function(){callback(handler)});});


};

module.exports = koth;
