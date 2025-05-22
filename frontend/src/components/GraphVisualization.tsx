import React, { useEffect, useRef } from 'react';
import { SigmaContainer, useRegisterEvents, useLoadGraph } from '@react-sigma/core';
import { DirectedGraph } from 'graphology';
import '@react-sigma/core/lib/react-sigma.min.css';

type GraphVisualizationProps = {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label: string;
  }>;
};

const GraphEvents: React.FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => console.log('Clicked node:', event.node),
      overNode: (event) => console.log('Hovered node:', event.node),
      outNode: (event) => console.log('Left node:', event.node),
    });
  }, [registerEvents]);

  return null;
};

const LoadGraph: React.FC<GraphVisualizationProps> = ({ nodes, edges }) => {
  const loadGraph = useLoadGraph();
  const graph = useRef<DirectedGraph>(new DirectedGraph());

  useEffect(() => {
    if (!nodes || !edges) return;

    const g = graph.current;
    g.clear();

    // Add nodes
    nodes.forEach((node) => {
      g.addNode(node.id, {
        label: node.label,
        size: 10,
        color: '#666',
      });
    });

    // Add edges
    edges.forEach((edge) => {
      g.addEdge(edge.source, edge.target, {
        label: edge.label,
        size: 2,
        color: '#ccc',
      });
    });

    loadGraph(g);
  }, [nodes, edges, loadGraph]);

  return null;
};

export const GraphVisualization: React.FC<GraphVisualizationProps> = (props) => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <SigmaContainer settings={{ renderEdgeLabels: true }}>
        <GraphEvents />
        <LoadGraph {...props} />
      </SigmaContainer>
    </div>
  );
};