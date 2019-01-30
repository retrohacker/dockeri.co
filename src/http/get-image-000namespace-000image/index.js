const badge = require('@architect/views/badge.js')

exports.handler = async function http(req) {
  console.log(req)
  return await badge(
    req.params.namespace === '_' ? null : req.params.namespace,
    req.params.image)
}
