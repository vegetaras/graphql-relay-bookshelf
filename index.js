const { connectionFromArraySlice, getOffsetWithDefault } = require('graphql-relay')

const resolveSelection = (selection) => {
  return {
    [selection.name.value]: selection.selectionSet
      ? selection.selectionSet.selections.reduce((result, newSelection) => ({
        ...result,
        ...resolveSelection(newSelection)
      }), {})
      : true
  }
}

const nodeFields = (resolveInfo) => {
  const initialSelection = resolveInfo.fieldNodes[0]
  const selectionTree = resolveSelection(initialSelection)
  return Object.keys(selectionTree[initialSelection.name.value].edges.node)
}

const resolvePaginationParams = async (Model, args) => {
  const { first, after, last, before } = args
  const totalCount = await Model.count()
  const firstLimit = first || totalCount
  const lastLimit = last || totalCount
  const afterOffset = getOffsetWithDefault(after, -1) + 1
  const beforeOffset = getOffsetWithDefault(before, totalCount) - lastLimit

  return { limit: Math.min(firstLimit, lastLimit), offset: Math.max(beforeOffset, afterOffset), totalCount }
}

const resolveConnection = (Model) => async (parent, args, context, resolveInfo) => {
  const { limit, offset, totalCount } = await resolvePaginationParams(Model, args)

  const collection = await Model.query(qb => qb.limit(limit).offset(offset).select(nodeFields(resolveInfo))).fetchAll()

  return connectionFromArraySlice(collection, args, { arrayLength: totalCount, sliceStart: offset })
}

module.exports = {
  resolveConnection
}
