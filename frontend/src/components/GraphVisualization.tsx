import React, { useEffect, useRef, useState } from 'react';

type GraphVisualizationProps = {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    size?: number;
    color?: string;
    community?: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label: string;
    weight?: number;
  }>;
  onNodeClick?: (nodeId: string) => void;
  highlightedTerms?: string[];
};

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Community colors inspired by InfraNodus
const communityColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#FFB347', '#87CEEB', '#F0E68C',
  '#FFA07A', '#20B2AA', '#778899', '#B0C4DE', '#FFFFE0'
];

const getCommunityColor = (community?: number): string => {
  if (community === undefined) return '#95a5a6';
  return communityColors[community % communityColors.length];
};

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  nodes, 
  edges, 
  onNodeClick, 
  highlightedTerms = [] 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize node positions
  useEffect(() => {
    if (!nodes.length) return;

    const newPositions = new Map<string, NodePosition>();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      newPositions.set(node.id, {
        x: centerX + Math.cos(angle) * radius * Math.random(),
        y: centerY + Math.sin(angle) * radius * Math.random(),
        vx: 0,
        vy: 0
      });
    });

    setNodePositions(newPositions);
  }, [nodes]);

  // Force simulation
  useEffect(() => {
    if (!nodes.length || !edges.length) return;

    const simulate = () => {
      setNodePositions(prev => {
        const newPositions = new Map(prev);
        const positions = Array.from(newPositions.entries());

        // Apply forces
        positions.forEach(([nodeId, pos]) => {
          let fx = 0, fy = 0;

          // Repulsion between nodes
          positions.forEach(([otherNodeId, otherPos]) => {
            if (nodeId !== otherNodeId) {
              const dx = pos.x - otherPos.x;
              const dy = pos.y - otherPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = 100 / (distance * distance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          });

          // Attraction along edges
          edges.forEach(edge => {
            if (edge.source === nodeId || edge.target === nodeId) {
              const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
              const otherPos = newPositions.get(otherNodeId);
              if (otherPos) {
                const dx = otherPos.x - pos.x;
                const dy = otherPos.y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 0.01 * distance;
                fx += (dx / distance) * force;
                fy += (dy / distance) * force;
              }
            }
          });

          // Update velocity and position
          pos.vx = (pos.vx + fx) * 0.9;
          pos.vy = (pos.vy + fy) * 0.9;
          pos.x += pos.vx;
          pos.y += pos.vy;

          // Keep nodes in bounds
          const canvas = canvasRef.current;
          if (canvas) {
            pos.x = Math.max(20, Math.min(canvas.width - 20, pos.x));
            pos.y = Math.max(20, Math.min(canvas.height - 20, pos.y));
          }
        });

        return newPositions;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const sourcePos = nodePositions.get(edge.source);
      const targetPos = nodePositions.get(edge.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = Math.min(edge.weight || 1, 3);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isHighlighted = highlightedTerms.includes(node.label);
      const isHovered = hoveredNode === node.id;
      const baseColor = getCommunityColor(node.community);
      const color = isHighlighted ? '#e74c3c' : baseColor;
      const size = (node.size || 8) + (isHovered ? 4 : 0);

      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isHighlighted ? '#c0392b' : '#34495e';
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#2c3e50';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, pos.x, pos.y + size + 15);
    });
  }, [nodes, edges, nodePositions, highlightedTerms, hoveredNode]);

  // Handle mouse events
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let foundNode: string | null = null;

    for (const node of nodes) {
      const pos = nodePositions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
      const nodeSize = node.size || 8;

      if (distance <= nodeSize) {
        foundNode = node.id;
        break;
      }
    }

    setHoveredNode(foundNode);
    canvas.style.cursor = foundNode ? 'pointer' : 'default';
  };

  const handleClick = () => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ width: '100%', height: '100%', border: '1px solid #ddd' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          {nodes.find(n => n.id === hoveredNode)?.label}
        </div>
      )}
    </div>
  );
};