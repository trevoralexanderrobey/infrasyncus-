import { Injectable, OnModuleInit } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'password')
    );
  }

  async onModuleInit() {
    await this.driver.verifyConnectivity();
    console.log('Neo4j connection established');
  }

  getSession(): Session {
    return this.driver.session();
  }

  async close() {
    await this.driver.close();
  }
}