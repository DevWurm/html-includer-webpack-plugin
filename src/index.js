import { load } from 'cheerio';

export default class HtmlIncluderWebpackPlugin {
  constructor(assetFile, options) {
    this._assetFile = assetFile;
    this._chunks = [];

    this._domTemplate = `
    <!doctype html>
    <html
      <head></head>
      <body></body>
    </html>
    `
  }

  apply(compiler) {
    // register the plugin in the compiler instance, so the loader can access it
    compiler.htmlIncluder = this;

    // if an asset file is specified, insert the chunk content into the asset file and add the asset file to the Webpack output
    if (this._assetFile) {
      compiler.plugin('emit', (compilation, callback) => {
        let assetSource = this._appendChunksToHtml(this._generateEmptyDom());

        compilation.assets[this._assetFile] = {
          source: function () {
            return assetSource;
          },
          size: function () {
            return assetSource.length;
          }
        };

        callback(null);
      });
    }

    // hook into the build of the html-webpack-plugin
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-after-html-processing', (htmlData, callback) => {
        // if an asset file is specified, add the import statement to the index file, otherwise inline the chunk content into the index file
        htmlData.html = this._assetFile ? this._appendReferenceToHtml(htmlData.html) : this._appendChunksToHtml(htmlData.html);
        callback(null);
      })
    })
  }

  addChunk(chunk) {
    if (this._chunks.indexOf(chunk) < 0)
      this._chunks.push(chunk);
  }

  _appendReferenceToHtml(source) {
    const dom = load(source);

    dom('body').append(`<link rel="import" href="${this._assetFile}">`);

    return dom.html();
  }

  _appendChunksToHtml(source) {
    const dom = load(source);
    this._chunks.forEach(chunk => {
      dom('body').append(chunk);
    });

    return dom.html();
  }

  _generateEmptyDom() {
   return load(this._domTemplate).html();
  }
}