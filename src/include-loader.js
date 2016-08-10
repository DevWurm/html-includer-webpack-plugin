module.exports = function includeLoader(source) {
  if (this._compiler.htmlIncluder) {
    if (this.query && this.query.charAt(0) == '?') {
      const tag = this.query.substring(1);
      this._compiler.htmlIncluder.addChunk(`<${tag}>${source}</${tag}>`)
    } else {
      this._compiler.htmlIncluder.addChunk(source);
    }
  }

  return '';
}