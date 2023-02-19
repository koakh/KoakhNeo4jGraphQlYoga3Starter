import { Neo4jGraphQL, Neo4jGraphQLSubscriptionsSingleInstancePlugin } from '@neo4j/graphql';
import { OGM } from '@neo4j/graphql-ogm';
import { Neo4jGraphQLAuthJWKSPlugin } from '@neo4j/graphql-plugin-auth';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { Driver } from 'neo4j-driver';
import { AUTH_JWKS_ENDPOINT, driver, HTTP_SERVER_PORT } from '.';
import { typeDefs } from '../gql';
import createDebugger from './debugger';

const debug = createDebugger('Server');

export const startServer = async (): Promise<void> => {
  // magic! Load library based on the type definitions
  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    driver,
    // add plugins
    plugins: {
      subscriptions: new Neo4jGraphQLSubscriptionsSingleInstancePlugin(),
      auth: new Neo4jGraphQLAuthJWKSPlugin({
        jwksEndpoint: AUTH_JWKS_ENDPOINT,
        // Use the Neo4jGraphQL config option rolesPath to specify a object path for JWT roles otherwise defaults to jwt.roles
        // https://neo4j.com/docs/graphql-manual/current/auth/authorization/roles/
        // check consent app
        // TODO: add env var
        rolesPath: 'scope.profile.roles'
      })
    },
    config: {
      // TODO: add env var
      enableDebug: false
    }
  });

  const ogm = new OGM({
    typeDefs,
    driver
  });

  // available when handling requests, needs to be provided by the implementor
  type ServerContext = {
    ogm: OGM;
    driver: Driver;
  };
  // available in GraphQL, during execution/subscription
  interface UserContext { }

  // Generates graphql schema and resolvers, connect to neo4j
  neoSchema.getSchema().then(async (schema) => {
    await ogm.init();
    const yoga = createYoga<ServerContext, UserContext>({
      schema,
      context: {
        ogm
      }
    });
    // assert and create the necessary constraints @id, @unique, @fulltext, check with `:schema`
    await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

    const server = createServer(yoga);
    server.listen(HTTP_SERVER_PORT, () => {
      debugger;
      debug(`server listening on http://localhost:${HTTP_SERVER_PORT}/graphql`);
    });
  });
}