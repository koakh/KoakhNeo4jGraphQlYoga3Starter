import { createGraphQLError, createSchema, createYoga, Plugin } from 'graphql-yoga'
import { YOGA_DISABLE_SUBSCRIPTION } from './app'
import { typeDefs } from './gql'

// available when handling requests, needs to be provided by the implementor
// eslint-disable-next-line @typescript-eslint/ban-types
type ServerContext = {}

// available in GraphQL, during execution/subscription
interface UserContext {
  disableSubscription: boolean
}

export const yoga = createYoga<ServerContext, UserContext>({
  context: {
    disableSubscription: YOGA_DISABLE_SUBSCRIPTION,
  },
  schema: createSchema({
    // TODO:
    // typeDefs: /* GraphQL */ `
    //   type Query {
    //     greetings: String!
    //   }
    //   type Subscription {
    //     greetings: String!
    //   }
    // `
    typeDefs,
    resolvers: {
      Query: {
        greetings: () =>
          'This is the `greetings` field of the root `Query` type',
      },
      Subscription: {
        greetings: {
          async *subscribe() {
            yield { greetings: 'Hi' }
          },
        },
      },
    },
  }),
  plugins: [useDisableSubscription()],
})

// context only relevant to the plugin
// eslint-disable-next-line @typescript-eslint/ban-types
type DisableSubscriptionPluginContext = {}

function useDisableSubscription(): Plugin<
  DisableSubscriptionPluginContext,
  ServerContext,
  UserContext
> {
  return {
    onSubscribe({ args }) {
      if (args.contextValue.disableSubscription) {
        throw createGraphQLError('Subscriptions have been disabled', {
          extensions: {
            http: {
              // report error with a 400
              status: 400,
            },
          },
        })
      }
    },
  }
}
