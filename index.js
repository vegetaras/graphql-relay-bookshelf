const { connectionFromArraySlice, getOffsetWithDefault } = require('graphql-relay')

const resolveConnection = (Model) => async (parent, args) => {
  const { first, after, last, before } = args
  const totalCount = await Model.count()
  const firstLimit = first || totalCount
  const lastLimit = last || totalCount
  const afterOffset = getOffsetWithDefault(after, -1) + 1
  const beforeOffset = getOffsetWithDefault(before, totalCount) - lastLimit

  const limit = Math.min(firstLimit, lastLimit)
  const offset = Math.max(beforeOffset, afterOffset)

  const collection = await Model.query(qb => qb.limit(limit).offset(offset)).fetchAll()

  return connectionFromArraySlice(collection, args, { arrayLength: totalCount, sliceStart: offset })
}

module.exports = {
  resolveConnection
}
