import { load } from 'cheerio';
import { readFile } from 'fs';
import { dirname } from 'path';

module.exports = function includeLoader(source) {

  // start asynchronous execution
  const callback = this.async();

  // add current source to includer chunks, if an includer is registered on the compiler, otherwise pass trough the source
  if (this._compiler.htmlIncluder) {

    // add surrounding tag to source if defined in query
    if (this.query && this.query.charAt(0) == '?') {
      const tag = this.query.substring(1);
      source = `<${tag}>${source}</${tag}>`;
    }

    // resolve all dependencies of the current chunk, add it to the includer and call the callback
    resolveHtmlDependencies(source, this.context, this.resolve.bind(this), this.addDependency.bind(this), this._compiler.htmlIncluder.addChunk.bind(this._compiler.htmlIncluder))
      .then(resolvedSource => {
        this._compiler.htmlIncluder.addChunk(resolvedSource);
      })
      .then(_ => callback(null, ''))
      .catch(reason => {
        callback(reason);
      });

  } else {
    callback(null, source);
  }
}

function resolveHtmlDependencies(source, context, pathResolve, addDependency, addChunk) {
  const dom = load(source);

  return resolveImports(dom, context, pathResolve, addDependency, addChunk)
    .then(dom => resolveStylesheets(dom, context, pathResolve, addDependency, addChunk))
    .then(dom => resolveScripts(dom, context, pathResolve, addDependency, addChunk))
    .then(dom => dom.html());
}

function resolveImports(dom, context, pathResolve, addDependency, addChunk) {
  const imports = dom('link[rel="import"]');
  const prms = []

  // resolve all import dependencies of the current chunk asynchronously and recursive and save the promises to prms
  imports.each((i, el) => {
    const filePathPrms = new Promise((resolve, reject) => {
      pathResolve(context, dom(el).attr('href'), (err, path) => {
        return err ? reject(err) : resolve(path);
      });
    });

    const contentPrms = filePathPrms.then(path => {
      return new Promise((resolve, reject) => {
        readFile(path, (err, content) => {
          if (err) return reject(err);

          resolve(content.toString());
        })
      })
    });

    // add current dependency to the webpack dependencies to enable file watching for this dependency
    filePathPrms.then(path => addDependency(path));

    prms.push(Promise.all([filePathPrms, contentPrms])
      .then(([filePath, content]) => {
        return resolveHtmlDependencies(content, dirname(filePath), pathResolve, addDependency, addChunk);
      })
      .then(resolvedContent => {
        // add current dependency to the includer
        addChunk(resolvedContent);

        // remove the import from the current chunk
        dom(el).replaceWith('');
        return dom
      })
    )
    ;

    return true;
  });

  // create promise, which is resolved with the completely resolved dom
  return Promise.all(prms).then(_ => dom);
}

function resolveStylesheets(dom, context, pathResolve, addDependency, addChunk) {
  const stylesheets = dom('link[rel="stylesheet"]');
  const prms = []

  // resolve all stylesheet dependencies of the current chunk asynchronously and save the promises to prms
  stylesheets.each((i, el) => {
    stylesheets.each((i, el) => {
      const filePathPrms = new Promise((resolve, reject) => {
        pathResolve(context, dom(el).attr('href'), (err, path) => {
          return err ? reject(err) : resolve(path);
        });
      });

      // add current dependency to the webpack dependencies to enable file watching for this dependency
      filePathPrms.then(path => addDependency(path));

      prms.push(filePathPrms.then(filePath => {
          return new Promise((resolve, reject) => {
            readFile(filePath, (err, content) => {
              if (err) return reject(err);

              resolve(content.toString());
            })
          })
        })
          .then(content => {
            // add current dependency to the includer
            addChunk(`<style>${content}</style>`);

            // remove the import from the current chunk
            dom(el).replaceWith('');
            return dom
          })
      );

      return true;
    });

  })

  // create promise, which is resolved with the completely resolved dom
  return Promise.all(prms).then(_ => dom);
}

function resolveScripts(dom, context, pathResolve, addDependency, addChunk) {
  const scripts = dom('script[src]');
  const prms = []

  // resolve all script dependencies of the current chunk asynchronously and save the promises to prms
  scripts.each((i, el) => {
    const filePathPrms = new Promise((resolve, reject) => {
      pathResolve(context, dom(el).attr('src'), (err, path) => {
        return err ? reject(err) : resolve(path);
      });
    });

    // add current dependency to the webpack dependencies to enable file watching for this dependency
    filePathPrms.then(path => addDependency(path));

    prms.push(filePathPrms.then(filePath => {
        return new Promise((resolve, reject) => {
          readFile(filePath, (err, content) => {
            if (err) return reject(err);

            resolve(content.toString());
          })
        })
      })
        .then(content => {
          // add current dependency to the includer
          addChunk(`<script>${content}</script>`);

          // remove the import from the current chunk
          dom(el).replaceWith('');
          return dom
        })
    );

    return true;
  });

  // create promise, which is resolved with the completely resolved dom
  return Promise.all(prms).then(_ => dom);
}

