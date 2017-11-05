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
    select: () => Promise.resolve(items.slice(offset, offset + limit))
  }

  return queryBuilder
}

const Model = {
  count: () => Promise.resolve(3),
  query: (callback) => {
    const builder = QueryBuilder([{ id: 1 }, { id: 2 }, { id: 3 }])

    callback && callback(builder)

    return { fetchAll: builder.select }
  }
}

test('returns edges', async t => {
  const result = await resolveConnection(Model)(null, {})
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
  const result = await resolveConnection(Model)(null, {})
  t.is(result.pageInfo.startCursor, 'YXJyYXljb25uZWN0aW9uOjA=')
})

test('returns page info with end cursor', async t => {
  const result = await resolveConnection(Model)(null, {})
  t.is(result.pageInfo.endCursor, 'YXJyYXljb25uZWN0aW9uOjI=')
})

test('returns true when there is a next page', async t => {
  const result = await resolveConnection(Model)(null, { first: 2 })
  t.true(result.pageInfo.hasNextPage)
})

test("returns false when there isn't a next page", async t => {
  const result = await resolveConnection(Model)(null, { first: 3 })
  t.false(result.pageInfo.hasNextPage)
})

test('returns true when there is a previous page', async t => {
  const result = await resolveConnection(Model)(null, { last: 2 })
  t.true(result.pageInfo.hasPreviousPage)
})

test("returns false when there isn't a previous page", async t => {
  const result = await resolveConnection(Model)(null, { last: 3 })
  t.false(result.pageInfo.hasPreviousPage)
})

test('returns edges when before param is present', async t => {
  const result = await resolveConnection(Model)(null, { before: 'YXJyYXljb25uZWN0aW9uOjI=' })
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
  const result = await resolveConnection(Model)(null, { after: 'YXJyYXljb25uZWN0aW9uOjA=' })
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
  const result = await resolveConnection(Model)(null, { last: 1, before: 'YXJyYXljb25uZWN0aW9uOjI=' })
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns edges when after and first params are present', async t => {
  const result = await resolveConnection(Model)(null, { first: 1, after: 'YXJyYXljb25uZWN0aW9uOjA=' })
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})

test('returns edges when all params are present', async t => {
  const result = await resolveConnection(Model)(null, { first: 1, last: 1, after: 'YXJyYXljb25uZWN0aW9uOjA=', before: 'YXJyYXljb25uZWN0aW9uOjI=' })
  t.deepEqual(result.edges, [
    {
      cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      node: { id: 2 }
    }
  ])
})
