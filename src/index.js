import { load } from 'cheerio';

export default class HtmlIncluderWebpackPlugin {
  constructor(options) {
    this._chunks = [];
  }

  apply(compiler) {
    compiler.htmlIncluder = this;

    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-after-html-processing', (htmlData, callback) => {
        htmlData.html = this._appendChunksToHtml(htmlData.html);
        callback(null);
      })
    })
  }

  addChunk(chunk) {
    this._chunks.push(chunk);
  }

  _appendChunksToHtml(source) {
    const dom = load(source);
    this._chunks.forEach(chunk => {
      dom('body').append(chunk);
    });

    return dom.html();
  }

}