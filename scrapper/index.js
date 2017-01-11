var scrap = require('scrap')

var m = module.exports = function (namespace, repo, cb) {
  if (namespace === '_') namespace = 'library' // allow us to use api
  var metaurl = 'https://registry.hub.docker.com/v2/repositories/' + namespace + '/' + repo
  scrap(metaurl, function (e, $, code, html) {
    if (e) return cb(e)
    var data = {pull_count: '?', is_automated: false, star_count: '?'}
    try {
      data = JSON.parse(html)
    } catch (e) {}
    var result = {}
    result.downloads = data.pull_count
    result.trusted = data.is_automated
    result.stars = data.star_count
    var starUrl = 'https://registry.hub.docker.com/v2/repositories/' + namespace + '/' + repo + '/comments'
    scrap(starUrl, function (e, $, code, html) {
      var data = { count: '?' }
      try {
        data = JSON.parse(html)
      } catch (e) {}
      result.comments = data.count
      return cb(null, result)
    })
  })
}
