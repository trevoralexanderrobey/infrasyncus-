// Fallback type definitions for gremlin when module is not available
export declare namespace GremlinFallback {
  interface Client {
    close(): Promise<void>;
  }

  interface DriverRemoteConnection {
    constructor(url: string): void;
  }

  interface GraphTraversalSource {
    V(id?: any): any;
    addV(label: string): any;
    E(id?: any): any;
    limit(count: number): any;
    toList(): Promise<any[]>;
    next(): Promise<{ value: any }>;
    hasLabel(label: string): any;
    has(property: string, value: any): any;
    addE(label: string): any;
    to(vertex: any): any;
    property(key: string, value: any): any;
    in_(): any;
    out(): any;
    both(): any;
  }

  interface Driver {
    Client: new (url: string, options?: any) => Client;
    DriverRemoteConnection: new (url: string) => DriverRemoteConnection;
  }

  interface Process {
    traversal(): {
      withRemote(connection: DriverRemoteConnection): GraphTraversalSource;
    };
  }

  interface GremlinModule {
    driver: Driver;
    process: Process;
  }
} 