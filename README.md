# GraphQL + Relay + Bookshelf

### Example usage

```javascript
  const bookshelf = require('./bookshelf')
  const { GraphQLObjectType, GraphQLString } = require('graphql')
  const { connectionDefinitions, connectionArgs } = require('graphql-relay')
  const { resolveConnection } = require('graphql-relay-bookshelf')

  // Your bookshelf model
  const User = bookshelf.Model.extend({
    tableName: 'users'
  })

  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
      email: { type: GraphQLString }
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
- [ ] Select requested columns only
- [ ] Parent field scoping
