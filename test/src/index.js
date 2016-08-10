// test if file is included correctly
require('../../lib/include-loader!./test.html');

// test if file is not included twice
require('../../lib/include-loader!./test.html');

// test if file is even not included twice, when required in other file
require('./test/test');

// test if file content is wrapped in specified tag (script)
require('../../lib/include-loader?script!./foo.js')
