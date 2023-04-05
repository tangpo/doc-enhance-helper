const download = require('download-git-repo');
const path = require('path');

  download('github.com:ElemeFE/element#gh-pages', path.resolve(process.cwd(),'./gh-pages'), { clone: true }, function (err) {
    console.log(err ? 'Error' : 'Success', err)
  })
