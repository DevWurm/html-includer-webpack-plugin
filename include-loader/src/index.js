import { load } from 'cheerio';
import { readFile } from 'fs';
import * as path from 'path';

module.exports = function includeLoader(source) {

  const callback = this.async();

  if (this._compiler.htmlIncluder) {

    if (this.query && this.query.charAt(0) == '?') {
      const tag = this.query.substring(1);
      source = `<${tag}>${source}</${tag}>`;
    }

    resolveHtmlDependencies(source, this.context, this.addDependency.bind(this))
      .then(resolvedSource => {
        this._compiler.htmlIncluder.addChunk(resolvedSource);
      })
      .then(_ => callback(null, ''))
      .catch(reason => {
        console.error(reason);
        callback(reason);
      });

  }
}

function resolveHtmlDependencies(source, context, addDeps) {
  const dom = load(source);

  return resolveImports(dom, context, addDeps)
    .then(dom => resolveStylesheets(dom, context, addDeps))
    .then(dom => resolveScripts(dom, context, addDeps))
    .then(dom => dom.html());
}

function resolveImports(dom, context, addDeps) {
  const imports = dom('link[rel="import"]');
  const prms = []

  imports.each((i, el) => {
    const filePath = path.resolve(context, dom(el).attr('href'));
    addDeps(filePath);

    prms.push(new Promise((resolve, reject) => {
      readFile(filePath, (err, content) => {
        if (err) return reject(err);

        resolve(content.toString());
      })
    })
      .then(content => {
        return resolveHtmlDependencies(content, path.dirname(filePath), addDeps);
      })
      .then(resolvedContent => {
        dom(el).replaceWith(resolvedContent);
        return dom
      })
    );

    return true;
  });

  return Promise.all(prms).then(_ => dom);
}

function resolveStylesheets(dom, context, addDeps) {
  const stylesheets = dom('link[rel="stylesheet"]');
  const prms = []

  stylesheets.each((i, el) => {
    const filePath = path.resolve(context, dom(el).attr('href'));
    addDeps(filePath);

    prms.push(new Promise((resolve, reject) => {
        readFile(filePath, (err, content) => {
          if (err) return reject(err);

          resolve(content.toString());
        })
      })
        .then(content => {
          dom(el).replaceWith(`<style>${content}</style>`);
          return dom
        })
    );

    return true;
  });

  return Promise.all(prms).then(_ => dom);
}

function resolveScripts(dom, context, addDeps) {
  const scripts = dom('script[src]');
  const prms = []

  scripts.each((i, el) => {
    const filePath = path.resolve(context, dom(el).attr('src'));
    addDeps(filePath);

    prms.push(new Promise((resolve, reject) => {
        readFile(filePath, (err, content) => {
          if (err) return reject(err);

          resolve(content.toString());
        })
      })
        .then(content => {
          dom(el).replaceWith(`<script>${content}</script>`);
          return dom
        })
    );

    return true;
  });

  return Promise.all(prms).then(_ => dom);
}

