var buildkiteQuery = require('buildkite-query')
var moment = require('moment')

module.exports = function (accessToken, organisation, callback) {
  var query = 'query BuildStats {' +
  '  organization(slug: "' + organisation + '") {' +
  '    pipelines {' +
  '      edges {' +
  '        node {' +
  '          slug' +
  '          builds {' +
  '            edges {' +
  '              node {' +
  '                createdAt' +
  '              }' +
  '            }' +
  '          }' +
  '        }' +
  '      }' +
  '    }' +
  '  }' +
  '}'

  buildkiteQuery(accessToken)(query, function (err, response) {
    if (err) {
      return callback(err)
    }
    var out = {
      days: {},
      months: {},
      pipelines: {}
    }
    var pipelines = response.data.organization.pipelines.edges.map(function (edge) {
      return {
        slug: edge.node.slug,
        builds: edge.node.builds.edges.map(function (t) {
          return t.node
        })
      }
    })
    pipelines.forEach(function (pipeline) {
      pipeline.builds.forEach(function (build) {
        var d = moment(build.createdAt)
        var day = d.format('DD-MM-YYYY')
        var month = d.format('MM-YY')
        if (!out.days[day]) {
          out.days[day] = {}
        }
        if (!out.days[day][pipeline.slug]) {
          out.days[day][pipeline.slug] = 0
        }
        out.days[day][pipeline.slug]++
        if (!out.months[month]) {
          out.months[month] = {}
        }
        if (!out.months[month][pipeline.slug]) {
          out.months[month][pipeline.slug] = 0
        }
        out.months[month][pipeline.slug]++
        if (!out.pipelines[pipeline.slug]) {
          out.pipelines[pipeline.slug] = []
        }
        out.pipelines[pipeline.slug].push(day)
      })
    })
    return callback(null, out)
  })
}
