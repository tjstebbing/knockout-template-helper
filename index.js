// koth = require("knockout-template-helper");
// app.use('/template.html', koth(__dirname+'/templates', { watch : true }));

fs = require('fs');
walker = require('walker');
et = require('elementtree');
async = require('async');

module.exports = koth;

var slashdot = function(s) { return s.replace(/\//g, '.').replace('.',''); };

var koth = function(dir, opts) {
    opts = opts ? opts : {};
    var templates = {};
    
    var loadTemplates = function(cb) {
        var templates = {};
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
                                console.log(newPath);
                                tpl.attrib['id'] = newPath;
                                var markup = et.tostring(
                                    tpl, {'xml_declaration': false });
                                console.log(markup);
                                templates[newPath] = markup;
                                ecb();
                            }
                        }
                    });
                }, function(err) {cb(null, templates);});
            });
    };
    
    loadTemplates(function(err, templates) {
        if(err) throw err;
        console.log("---------");
        console.log(templates);
    });

    if(opts.watch) {
        var chokidar = require('chokidar');
        var watcher = chokidar.watch(dir);
    }
};

koth('/home/pomke/code/knockout-template-helper/templates');
