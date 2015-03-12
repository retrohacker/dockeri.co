var scrap = require('scrap');

var m = module.exports = function(namespace,repo, cb) {
  var prefix = namespace==='_'?'':'u/';
  scrap("https://registry.hub.docker.com/"+prefix+namespace+"/"+repo,function(e,$) {
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
    scrap('https://registry.hub.docker.com/v2/repositories/'+namespace+'/'+repo+'/stars/count/',function(e,$) {
      if(e) return cb(e)
      try {
        result.stars = $.html()
      } catch(e) {}
      return cb(e,result)
    })
  })
}
