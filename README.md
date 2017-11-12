# GraphQL + Relay + Bookshelf

### Example usage

```javascript
  const { GraphQLObjectType, GraphQLString } = require('graphql')
  const { connectionDefinitions, connectionArgs, globalIdField } = require('graphql-relay')
  const { resolveConnection } = require('graphql-relay-bookshelf')

  // Your bookshelf instance
  const bookshelf = require('./bookshelf')

  // Your bookshelf model
  const User = bookshelf.Model.extend({
    tableName: 'users'
  })

  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
      id: globalIdField(),
      email: { type: GraphQLString, resolve: ({ attributes }) => attributes.email }
    }
  })

  // Create a connection for your model
  const queryFields = {
    users: {
      type: connectionDefinitions({ nodeType: UserType }).connectionType,
      args: connectionArgs,
      resolve: resolveConnection(User)
    }
  }
```

## TODO
- [x] Pagination
- [x] Select requested columns only
- [ ] Parent field scoping
