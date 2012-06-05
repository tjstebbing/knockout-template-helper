KOTH (knockout-template-helper)
===============================

A small node.js library that combines a master template and some knockout templates 
into one html file. This is very useful useful if you're writing applications with 
node and knockout.js.

The concept is fairly basic, a master template is an html document which must 
include a *body* tag, this is the page which hosts and makes use of your 
knockout templates.

A template file is an html document with one or more *script* tags representing
a (knockout template)[http://knockoutjs.com/documentation/template-binding.html].

A template has an id attribute unique to its template file. Koth rewrites these
ids to provide a dot-path namespace for templates, using the template filename,
and directory names in the case of nested directories. 

For instance, a directory of templates:

```shell
    templates/common.html
    templates/admin/users.html
```
with contents:

```html
<!-- common.html -->
<script type="text/html" id="messages">
    <div class="message">
        <h3 data-bind="text: title">Message Title </h3> 
        <p data-bind="text: body">Message Body</p>
    </div>
</script>

<script type="text/html" id="actions">
    <ul class="actions" data-bind="foreach: actions" >
        <a data-bind="attr: {href : url}, text: label">Action Label</li>
    </ul>
</script>
```

```html
<!-- users.html -->
<script type="text/html" id="groups">
    <div class="group">
        <h3 data-bind="text: name">Group name</h3> 
        <ul data-bind="foreach: members">
            <li>...</li> 
        </ul>
    </div>
</script>
```

Would remap these templates to make them available in master template like so:

```html
<div data-bind="template: { name: 'common.messages', data: myMessages }"></div>
...
<div data-bind="template: { name: 'common.actions', data: actions }"></div>
...
<div data-bind="template: { name: 'admin.users.groups', data: groups }"></div>
```

This is a particularly simple way to manage templates and  brinngs in the 
added benifit of namespaces. 


API
===

KOTH provides three ways to make use of its functionality:

* as a basic flattener for one-shot compiling of a static recource (great for pushing to 
your CDN!), see *flatten* and *flattenDir*.
* as a watcher which will call your callback with the compiled result whenever 
a file changes, (useful for integrating with your own framework).
* and as a connect or express URL handler, provides a function which can be mapped 
directly to a url (with optional watch-mode for development). 

For each of these there is a function which takes a directory of templates and 
sub-directories to compile, and a function which takes a mapping of 
{'dot.path.prefix' : '/absolute/file/path.html'}.

Flatteners
----------

*flatten(master, templates, callback)* 

combines a mapping of template files with a master template and calls the 
callback with the result as a string.

```javascript
koth.flatten('index.html', {'admin.user' : '/path/to/file.html'}, function(out) {
    console.log(out);
});
```

*flattenDir(master, dir, callback)* 

combines a directory of template files with a master template and calls the 
callback with the result as a string.

```javascript
koth.flattenDir('index.html', '/path/to/templates', function(out) {
    console.log(out);
});
```

Watchers
--------

*watch(master, templates, callback)* 

combines a mapping of template files with a master template and calls the 
callback with the result as a string initially and every time a file changes.

```javascript
koth.watch('index.html', {'admin.user' : '/path/to/file.html'}, function(out) {
    console.log(out);
});
```

*watchDir(master, dir, callback)* 

combines a directory of template files with a master template and calls the 
callback with the result as a string initially and every time a file changes.

```javascript
koth.watchDir('index.html', '/path/to/templates', function(out) {
    console.log(out);
});
```

Connect / Express integration
-----------------------------

*connectHandler(master, templates, watch, callback)* 

combines a mapping of template files with a master template and provides 
a connect resource handler which takes a request and response object and 
responds with the compiled result as a valid html response.

```javascript

app = express.createServer();
koth.connectDirHandler('index.html', {'admin.user' : '/path/to/file.html'}, true, function(handler) {
    app.get('/', handler);
    app.listen(8000);
});
```

*connectDirHandler(master, dir, watch, callback)* 

combines a directory of template files with a master template and provides 
a connect resource handler which takes a request and response object and 
responds with the compiled result as a valid html response.

```javascript

app = express.createServer();
koth.connectDirHandler('index.html', '/path/to/templates', true, function(handler) {
    app.get('/', handler);
    app.listen(8000);
});
```


