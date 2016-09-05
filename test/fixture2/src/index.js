// test if file is included correctly and if sub-dependencies are resolved
require('../../../include-loader!./test/includefile.html');

// test if file is not included twice
require('../../../include-loader!./test/includefile.html');

// test if file is even not included twice, when required in other file
require('./test/test');

// test if file content is wrapped in specified tag (script)
require('../../../include-loader?script!./test/includescript.js');

// test if sub-dependencies are ignored if they are required from a remote URL
require('../../../include-loader!./test/urls.html');


