knockout-template-helper
========================

A small node.js library that combines a master template plus a directory of knockout templates 
into one html file. This is very useful useful if you're writing applications with knockout.js.

require returns a function koth which takes: 

* **master template**, your main html file which will use the templates.

* **template directory**, a directory (can be nested) of templates in html files to compress and
add to the master template.

* **watch**, boolean, if true all files will be watched for changes and update automatically.

* **callback**, will be passed a handler function which takes a request, response and returns
the compiled html.



```javascript
koth = require('knockout-template-helper');

app = express.createServer();
koth(__dirname+'master.html', __dirname+'/templates', true, function(handler) {
    app.get('/', handler);
});


```


