const test = require('ava')

const { resolveConnection } = require('./index')

const QueryBuilder = (list) => {
  let items = list
  let limit = list.length
  let offset = 0

  const queryBuilder = {
    limit: (count) => {
      limit = count
      return queryBuilder
    },
    offset: (count) => {
      offset = count
      return queryBuilder
    },
    select: (fields = ['id', 'name']) => {
      items = items.slice(offset, offset + limit)
        .map(item => fields.reduce((result, field) => Object.assign(result, { [field]: item[field] }), {}))
    },
    result: () => Promise.resolve(items)
  }

  return queryBuilder
}

const Model = {
  count: () => Promise.resolve(3),
  query: (callback) => {
    const builder = QueryBuilder([
      { id: 1, name: 'Name 1' },
      { id: 2, name: 'Name 2' },
      { id: 3, name: 'Name 3' }
    ])

    callback && callback(builder)

    return { fetchAll: builder.result }
  }
}

const fieldSelection = (value) => ({
  name: { value }
})

const nodeSelection = (fields) => ({
  name: {
    value: 'node'
  },
  selectionSet: {
    selections: fields.map(field => fieldSelection(field))
  }
})

const edgesSelection = (fields) => ({
  name: {
    value: 'edges'
  },
  selectionSet: {
    selections: [nodeSelection(fields)]
  }
})

const connectionSelection = (fields) => ({
  name: {
    value: 'connectionName'
  },
  selectionSet: {
    selections: [edgesSelection(fields)]
  }
})

const createResolveInfo = (fields) => ({ fieldNodes: [connectionSelection(fields)] })

const defaultResolveInfo = createResolveInfo(['id'])

test('returns edges', async t => {
  const result = await resolveConnection(Model)(null, {}, {}, defaultResolveInfo)
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
      node: { id: 1 }
    },
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    },
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
      node: { id: 3 }
    }
  ])
})

test('returns page info with start cursor', async t => {
  const result = await resolveConnection(Model)(null, {}, {}, defaultResolveInfo)
  t.is(result.pageInfo.startCursor, 'YXJyYXljb25uZWN0aW9uOjA=')
})

test('returns page info with end cursor', async t => {
  const result = await resolveConnection(Model)(null, {}, {}, defaultResolveInfo)
  t.is(result.pageInfo.endCursor, 'YXJyYXljb25uZWN0aW9uOjI=')
})

test('returns true when there is a next page', async t => {
  const result = await resolveConnection(Model)(null, { first: 2 }, {}, defaultResolveInfo)
  t.true(result.pageInfo.hasNextPage)
})

test("returns false when there isn't a next page", async t => {
  const result = await resolveConnection(Model)(null, { first: 3 }, {}, defaultResolveInfo)
  t.false(result.pageInfo.hasNextPage)
})

test('returns true when there is a previous page', async t => {
  const result = await resolveConnection(Model)(null, { last: 2 }, {}, defaultResolveInfo)
  t.true(result.pageInfo.hasPreviousPage)
})

test("returns false when there isn't a previous page", async t => {
  const result = await resolveConnection(Model)(null, { last: 3 }, {}, defaultResolveInfo)
  t.false(result.pageInfo.hasPreviousPage)
})

test('returns edges when before param is present', async t => {
  const result = await resolveConnection(Model)(null, { before: 'YXJyYXljb25uZWN0aW9uOjI=' }, {}, defaultResolveInfo)
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
      node: { id: 1 }
    },
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns edges when after param is present', async t => {
  const result = await resolveConnection(Model)(null, { after: 'YXJyYXljb25uZWN0aW9uOjA=' }, {}, defaultResolveInfo)
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    },
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
      node: { id: 3 }
    }
  ])
})

test('returns edges when before and last params are present', async t => {
  const result = await resolveConnection(Model)(
    null, { last: 1, before: 'YXJyYXljb25uZWN0aW9uOjI=' }, {}, defaultResolveInfo
  )
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns edges when after and first params are present', async t => {
  const result = await resolveConnection(Model)(
    null, { first: 1, after: 'YXJyYXljb25uZWN0aW9uOjA=' }, {}, defaultResolveInfo
  )
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns edges when all params are present', async t => {
  const result = await resolveConnection(Model)(
    null,
    { first: 1, last: 1, after: 'YXJyYXljb25uZWN0aW9uOjA=', before: 'YXJyYXljb25uZWN0aW9uOjI=' },
    {},
    defaultResolveInfo
  )
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns requested fields only', async t => {
  const resolveInfo = createResolveInfo(['id', 'name'])
  const result = await resolveConnection(Model)(null, {}, {}, resolveInfo)
  t.deepEqual(result.edges.map(edge => edge.node), [
    { id: 1, name: 'Name 1' },
    { id: 2, name: 'Name 2' },
    { id: 3, name: 'Name 3' }
  ])
})
