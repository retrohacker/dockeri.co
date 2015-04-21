var scrap = require('scrap');

var m = module.exports = function(namespace,repo, cb) {
  var prefix = namespace==='_'?'':'u/';
  var url = "https://registry.hub.docker.com/"+prefix+namespace+"/"+repo
  scrap(url,function(e,$) {
    if(e) return cb(e)
    var result = {}
    try {
      result.comments = $('.comments').first().text().trim()
    } catch(e) {}
    try {
      result.downloads = $('.downloads').first().text().trim()
    } catch(e) {}
    try {
      result.trusted = $('.trusted').length > 0
    } catch(e) {}
    if(namespace==='_') namespace = 'library' //allow us to use api
    var starUrl = 'https://registry.hub.docker.com/v2/repositories/'+namespace+'/'+repo+'/stars/count/'
    scrap(starUrl,function(e,$) {
      if(e) {
        // Stars endpoint apears to be volatile. Will return `?` if it fails on us.
        // Better than not returning a badge.
        result.stars = '?'
        return cb(null,result)
      }
      try {
        result.stars = $.html()
      } catch(e) {}
      return cb(null,result)
    })
  })
}
