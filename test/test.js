const exec = require('child_process').exec;
const resolve = require('path').resolve;
const readFile = require('fs').readFile;
const expect = require('chai').expect;

describe("html-includer-webpack-plugin and include-loader", function() {
  context("Inline inclusion in index.html", function() {
    const fixtureDirectory = resolve(__dirname, "fixture1");
    let resultingIndex;

    before(function(done) {
      buildFixture(fixtureDirectory, function(err, stdout) {
        if (stdout) console.log(stdout);
        if (err) return done(err);

        resultingIndex = readFile(resolve(fixtureDirectory, 'dist', 'index.html'), function(err, res) {
          if (err) return done(err);
          resultingIndex = res.toString();
          done();
        });
      });
    });

    it('Should generate a result', function () {
      expect(resultingIndex).to.be.not.empty;
    });

    it('Should contain content of required file', function () {
      expect(resultingIndex).to.contain('<div>From includefile.html</div>');
    });

    it('Should contain the content of sub-dependencies', function () {
      expect(resultingIndex).to.contain('<p>From includefile2.html</p>');
      expect(resultingIndex).to.contain('<style>#from-includestylecss {color: green;}</style>');
      expect(resultingIndex).to.contain('<script>console.log(\'From includescript2.js\');</script>');
    });

    it("Shouldn't contain multiple included dependencies multiple times", function () {
      expect(/<div>From includefile\.html<\/div>/.exec(resultingIndex)).to.have.lengthOf(1);
      expect(/<style>#from-includestylecss \{color: green;}<\/style>/.exec(resultingIndex)).to.have.lengthOf(1);
    })

    it("Should wrap dependencies in specified tags", function () {
      expect(resultingIndex).to.contain('<script>console.log("From includescript.js");</script>');
    })
  });

  context("Asset file inclusion in bundle.html", function() {
    const fixtureDirectory = resolve(__dirname, "fixture2");
    let resultingIndex;
    let resultingBundle;

    before(function(done) {
      buildFixture(fixtureDirectory, function(err, stdout) {
        if (stdout) console.log(stdout);
        if (err) return done(err);

        readFile(resolve(fixtureDirectory, 'dist', 'index.html'), function(err, res) {
          if (err) return done(err);
          resultingIndex = res.toString();

          readFile(resolve(fixtureDirectory, 'dist', 'bundle.html'), function(err, res) {
            if (err) return done(err);
            resultingBundle = res.toString();

            done();
          });
        });
      });
    });

    it('Should generate a result', function () {
      expect(resultingBundle).to.be.not.empty;
      expect(resultingIndex).to.be.not.empty;
    });

    it('Should contain content of required file', function () {
      expect(resultingBundle).to.contain('<div>From includefile.html</div>');
    });

    it('Should contain the content of sub-dependencies', function () {
      expect(resultingBundle).to.contain('<p>From includefile2.html</p>');
      expect(resultingBundle).to.contain('<style>#from-includestylecss {color: green;}</style>');
      expect(resultingBundle).to.contain('<script>console.log(\'From includescript2.js\');</script>');
    });

    it("Shouldn't contain multiple included dependencies multiple times", function () {
      expect(/<div>From includefile\.html<\/div>/.exec(resultingBundle)).to.have.lengthOf(1);
      expect(/<style>#from-includestylecss \{color: green;}<\/style>/.exec(resultingBundle)).to.have.lengthOf(1);
    });

    it("Should wrap dependencies in specified tags", function () {
      expect(resultingBundle).to.contain('<script>console.log("From includescript.js");</script>');
    });

    it("Should reference the bundle in the index file", function() {
      expect(resultingIndex).to.contain('<link rel="import" href="bundle.html">');
    });

    it("Shouldn't inlude the content of dependencies in index file", function () {
      expect(resultingIndex).to.not.contain('<div>From includefile.html</div>');
      expect(resultingIndex).to.not.contain('<p>From includefile2.html</p>');
      expect(resultingIndex).to.not.contain('<style>#from-includestylecss {color: green;}</style>');
      expect(resultingIndex).to.not.contain('<script>console.log(\'From includescript2.js\');</script>');
      expect(resultingIndex).to.not.contain('<script>console.log("From includescript.js");</script>');
    });
  });
});

function buildFixture(fixtureDirectory, cb) {
  const cmd = 'webpack';
  console.log("Building " + fixtureDirectory + " with " + cmd + " and PATH: " + process.env.PATH);
  exec(cmd, {
    cwd: fixtureDirectory
  }, function(err, stdout, stderr) {
    if (err) return cb(err, stdout);
    if (stderr) return cb(new Error(stderr), stdout);
    cb(null, stdout);
  });
}

function doContentTests(content) {

}