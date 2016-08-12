# html-includer-webpack-plugin and include-loader
When using Webpack for Web project bundling, dependency declaration and resolving works like a charm, until you need dependencies, which are not provided via the common module systems or which need to include static pieces of Html into the global scope (like the [webcomponentsjs polyfill](http://webcomponents.org/polyfills/) or [Polymer Components](https://elements.polymer-project.org/guides/using-elements#using-elements) like [Vaadin Elements](https://vaadin.com/docs/-/part/elements/elements-getting-started.html#create-a-html-file)). In these cases you have to touch your Html files manually to include your dependencies like this:
```html
<script src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
<link rel="import" href="bower_components/polymer/polymer.html">
<link rel="import" href="bower_components/paper-styles/color.html">
<link rel="import" href="bower_components/paper-styles/typography.html">
<link rel="import" href="bower_components/vaadin-combo-box/vaadin-combo-box.html">
<link rel="import" href="bower_components/paper-input/paper-input.html">
```
Just to be able to use these dependencies somewhere completely different in you application:
```javascript
import { PolymerElement } from '@vaadin/angular2-polymer';

PolymerElement('vaadin-combo-box'),
PolymerElement('paper-input')
```
In addition to that you have to deal with putting the dependencies into your servers webroot yourself and can't use Webpack therefor.

This leads to some problems:
* **Inconvenience:** You are forced to touch another file somewhere else in you application to include your dependencies and you have to put some files somewhere into your builds by hand (or by script) (sounds ugly, doesn't it?)
* **Inferior maintainability:** Because the declaration of your dependencies and their usage is spread throughout your whole project, you have to keep track of which dependencies are still needed and which can be removed manually (which could lead to wrongly removed elements or unused stuff in your application)
* **Worse Readablity:** Because the dependencies are used without without declaring them in the same place, some identifiers won't make a lot of sense and the list of dependency declarations may not be very clear without their usage, too
* **Webpack is bypassed:** By importing some files from your webroot silently, you cheat Webpacks dependency graph, so your build with webpack is not standalone (because the extra files are still needed) and features like the watch mode may not work

This tool tries to attack these problems by providing a familiarly usable loader-plugin combination to import static (Html) files and include them into your entry point html file (i.e. `index.html`). Therewith static dependencies can be declared in the module where they are needed with a simple require statement and the loader and the plugin take care of all the other stuff like
* embedding the content of your dependency into your projects global scope
* deduplication of multiply included content
* resolution of sub-dependencies from your module paths and relative files
* activation of file watching for your dependencies and sub-dependencies

## Dependencies
The *html-includer-webpack-plugin* hooks into the commonly used [*html-webpack-plugin*](https://github.com/ampedandwired/html-webpack-plugin) to add your dependencies into your entry point html. So if this plugin isn't used to generate your `index.html` file (and consequentially Webpack may not be involved into your Html generation at all?) the *html-includer-webpack-plugin* probably won't do anything. Furthermore the *html-includer-webpack-plugin* and the *include-loader* are supposed to be used in combination. Technically it's possible to "use" all these components individually but in this case they won't do anything but sitting around and snacking your system resources.

So to have a working setup for embedding static resources into your project you have to install and configure the *html-includer-webpack-plugin* as well as the *html-webpack-plugin* and use the *include-loader* to require your resources.

... Oh, and maybe you should use Webpack to build your project.

## Installation
You can install the plugin and the loader via [npm](https://www.npmjs.com/):
```sh
npm install --save-dev html-includer-webpack-plugin include-loader
```
And if you haven't installed the *html-webpack-plugin* already:
```sh
npm install --save-dev html-webpack-plugin
```

## Setup
To use the plugin just hook it into the `plugins` section of your `webpack.config.js` (or another file you use for configuring Webpack):
```js
// webpack.config.js
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlIncluderWebpackPlugin from 'html-includer-webpack-plugin';
/* ... */

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    /* ... */
    plugins: [
     /* ... */
      new HtmlWebpackPlugin(),
      new HtmlIncluderWebpackPlugin(),

    ],
    /* ... */
};
```
You may want to have a look on how to [configure the *html-webpack-plugin*](https://github.com/ampedandwired/html-webpack-plugin#configuration)
