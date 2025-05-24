# JanusGraph Setup Guide

This project uses JanusGraph as the graph database for knowledge graph functionality, replacing Neo4j.

## Installation

### Option 1: Download and Run JanusGraph

1. **Download JanusGraph**
   ```bash
   wget https://github.com/JanusGraph/janusgraph/releases/download/v1.0.0/janusgraph-1.0.0.zip
   unzip janusgraph-1.0.0.zip
   cd janusgraph-1.0.0
   ```

2. **Start JanusGraph with Cassandra and Elasticsearch**
   ```bash
   ./bin/janusgraph-server.sh start
   ```

3. **Verify Installation**
   Open your browser to `http://localhost:8182` to see the Gremlin Server status.

### Option 2: Docker Setup (Recommended)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     janusgraph:
       image: janusgraph/janusgraph:latest
       ports:
         - "8182:8182"
       environment:
         - JANUS_PROPS_TEMPLATE=berkeleyje-es
       volumes:
         - janusgraph-data:/opt/janusgraph/data
   
   volumes:
     janusgraph-data:
   ```

2. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/infrasyncus"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Zettelkasten
ZETTELKASTEN_PASSWORD="your-zettelkasten-password"

# JanusGraph Configuration
JANUSGRAPH_HOST="localhost"
JANUSGRAPH_PORT="8182"
```

## Features

The JanusGraph integration provides:

### Text Network Analysis
- **Persistent Knowledge Graphs**: Text concepts are stored as vertices
- **Co-occurrence Relationships**: Word relationships stored as edges
- **Community Detection**: Topic clustering with graph algorithms
- **Incremental Analysis**: Build knowledge graphs over time

### Zettelkasten Integration
- **Note Relationships**: Links between notes stored in the graph
- **Concept Mapping**: Automatic concept extraction and linking
- **Knowledge Discovery**: Find related concepts across your knowledge base

### Graph Queries
- **Concept Exploration**: Navigate through related concepts
- **Path Finding**: Discover connections between ideas
- **Centrality Analysis**: Identify key concepts in your knowledge

## API Endpoints

### Text Processing
- `POST /api/text-processing/process` - Process text into network
- `GET /api/text-processing/graph` - Retrieve stored graph data

### Zettelkasten
- `POST /api/zettelkasten/text/analyze` - Analyze text with JanusGraph storage
- `POST /api/zettelkasten/text/analyze-incremental` - Incremental analysis

## Graph Schema

### Vertex Labels
- **Concept**: Text processing concepts
- **TextConcept**: Advanced text analysis concepts
- **Note**: Zettelkasten notes (if stored in graph)

### Edge Labels
- **FOLLOWS**: Sequential word relationships
- **CO_OCCURS**: Co-occurrence relationships
- **RELATED**: General relationships
- **LINKS_TO**: Note-to-note relationships

## Troubleshooting

### Connection Issues
1. Ensure JanusGraph server is running on port 8182
2. Check firewall settings
3. Verify WebSocket connections are allowed

### Performance
1. JanusGraph may take time to start up initially
2. For large graphs, consider tuning JanusGraph configuration
3. Monitor memory usage for large text processing tasks

### Data Persistence
- Data is stored in JanusGraph's configured backend (Berkeley DB by default)
- For production, consider using Cassandra or HBase as storage backend

## Migration from Neo4j

If you had previous Neo4j data:

1. Export data from Neo4j using Cypher queries
2. Transform to Gremlin traversals
3. Import using the JanusGraph service methods

## Advanced Configuration

For production deployments, consider:

1. **External Storage Backend**: Configure Cassandra or HBase
2. **Search Integration**: Set up Elasticsearch for text search
3. **Clustering**: Deploy JanusGraph in cluster mode
4. **Security**: Enable authentication and SSL

## Resources

- [JanusGraph Documentation](https://docs.janusgraph.org/)
- [Gremlin Tutorial](https://tinkerpop.apache.org/gremlin.html)
- [Graph Databases Concepts](https://neo4j.com/developer/graph-database/) 