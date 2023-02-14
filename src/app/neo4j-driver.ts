import neo4j from 'neo4j-driver';
import { NEO4J_PASSWORD, NEO4J_URL, NEO4J_USER } from './config';

// create Neo4j driver
export const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
