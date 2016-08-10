module.exports = function includeLoader(source) {
  if (this._compiler.htmlIncluder) {
    this._compiler.htmlIncluder.addChunk(source);
  }
  return `"${source}"`;
}