export const typeDefs = /* GraphQL */`
  # custom resolvers
  type Query {
    fuzzyBusinessByName(searchString: String): [Business]
      @cypher(
        statement: """
        CALL db.index.fulltext.queryNodes( 'businessNameIndex', $searchString+'~')
        YIELD node RETURN node
        """
      )
  }

  type Business {
    businessId: ID!
    waitTime: Int! @computed
    averageStars: Float!
      @auth(rules: [{ isAuthenticated: true }])
      @cypher(
        statement: "MATCH (this)<-[:REVIEWS]-(r:Review) RETURN avg(r.stars)"
      )
    recommended(first: Int = 1): [Business!]!
    @cypher(
      statement: """
      MATCH (this)<-[:REVIEWS]-(:Review)<-[:WROTE]-(:User)-[:WROTE]->(:Review)-[:REVIEWS]->(rec:Business)
      WITH rec, COUNT(*) AS score
      RETURN rec ORDER BY score DESC LIMIT $first
      """
    )
    name: String!
    city: String!
    state: String!
    address: String!
    location: Point!
    reviews: [Review!]! @relationship(type: "REVIEWS", direction: IN)
    categories: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
  }

  extend type Business
    @auth(
      rules: [
        { operations: [READ], where: { userId: "$jwt.sub" } }
        { operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }
      ]
    )
`;