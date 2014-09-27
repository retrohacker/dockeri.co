var scrap = require('scrap');

var m = module.exports = function(namespace,repo, cb) {
  var prefix = namespace==='_'?'':'u/';
  scrap("https://registry.hub.docker.com/"+prefix+namespace+"/"+repo,function(e,$) {
    if(e) return cb(e)
    var result = {}
    result.stars = $('.stars').text().trim()
    result.comments = $('.comments').text().trim()
    result.downloads = $('.downloads').text().trim()
    result.trusted = $('.trusted').length > 0
    return cb(null,result)
  })
}
