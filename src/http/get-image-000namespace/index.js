const badge = require('@architect/views/badge.js')

exports.handler = async function http(req) {
  console.log(req)
  return await badge(null, req.params.namespace)
}
