import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { GraphVisualization } from './GraphVisualization';
import { debounce } from 'lodash';
import './LiveTextEditor.css';

interface NetworkNode {
  id: string;
  label: string;
  type: string;
  size?: number;
  color?: string;
  community?: number;
  betweenness?: number;
  x?: number;
  y?: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

interface GraphMetrics {
  modularity: number;
  density: number;
  averageClustering: number;
  nodeCount: number;
  edgeCount: number;
}

interface TextNetworkAnalysis {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  topics: string[][];
  insights: string[];
  contentGaps: string[];
  keyTerms: string[];
  diversity: number;
  metrics: GraphMetrics;
  structuralGaps: Array<{
    community1: number;
    community2: number;
    bridgingConcepts: string[];
  }>;
}

export const LiveTextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<TextNetworkAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'graph'>('split');
  const [showMetrics, setShowMetrics] = useState(true);
  const [highlightedTerms, setHighlightedTerms] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analysisCache = useRef<Map<string, TextNetworkAnalysis>>(new Map());

  // Debounced analysis function for real-time updates
  const debouncedAnalyze = useCallback(
    debounce(async (inputText: string) => {
      if (!inputText.trim() || inputText.length < 20) {
        setAnalysis(null);
        return;
      }

      // Check cache first
      const cacheKey = inputText.substring(0, 100);
      if (analysisCache.current.has(cacheKey)) {
        setAnalysis(analysisCache.current.get(cacheKey)!);
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await axios.post('/api/zettelkasten/text/analyze-incremental', {
          text: inputText,
          previousAnalysis: analysis,
          password
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        const newAnalysis = response.data;
        setAnalysis(newAnalysis);
        
        // Cache the result
        analysisCache.current.set(cacheKey, newAnalysis);
        
        // Keep cache size reasonable
        if (analysisCache.current.size > 10) {
          const firstKey = analysisCache.current.keys().next().value;
          analysisCache.current.delete(firstKey);
        }
        
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000),
    [analysis, password]
  );

  useEffect(() => {
    debouncedAnalyze(text);
  }, [text, debouncedAnalyze]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = analysis?.nodes.find(n => n.id === nodeId);
    if (node) {
      setHighlightedTerms([node.label]);
      
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const text = textarea.value.toLowerCase();
        const term = node.label.toLowerCase();
        const index = text.indexOf(term);
        
        if (index !== -1) {
          textarea.focus();
          textarea.setSelectionRange(index, index + term.length);
        }
      }
    }
  };

  const exportGraph = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify({
      nodes: analysis.nodes,
      edges: analysis.edges,
      metrics: analysis.metrics,
      insights: analysis.insights
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'text-network-analysis.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearEditor = () => {
    setText('');
    setAnalysis(null);
    setHighlightedTerms([]);
    analysisCache.current.clear();
  };

  const insertSampleText = () => {
    const sampleText = `Network analysis reveals patterns in complex systems. 
    
Text mining and natural language processing help extract meaning from documents. Machine learning algorithms can identify topics and relationships automatically.

Knowledge graphs represent information as networks of connected concepts. Community detection algorithms find clusters of related ideas. Centrality measures identify the most important nodes in a network.

Visualization techniques make complex data comprehensible. Interactive graphs allow exploration of information spaces. Real-time analysis provides immediate feedback on text structure.`;
    
    setText(sampleText);
  };

  return (
    <div className="live-text-editor">
      <div className="editor-header">
        <h1>Live Text Analysis</h1>
        <p>Real-time network analysis as you type • InfraNodus-style text-to-graph</p>
        
        <div className="editor-controls">
          <div className="view-mode-selector">
            <button 
              className={viewMode === 'split' ? 'active' : ''}
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              ⚏
            </button>
            <button 
              className={viewMode === 'editor' ? 'active' : ''}
              onClick={() => setViewMode('editor')}
              title="Editor Only"
            >
              📝
            </button>
            <button 
              className={viewMode === 'graph' ? 'active' : ''}
              onClick={() => setViewMode('graph')}
              title="Graph Only"
            >
              🕸
            </button>
          </div>

          <div className="action-buttons">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
            />
            <button onClick={insertSampleText} className="sample-button">
              Sample Text
            </button>
            <button onClick={exportGraph} disabled={!analysis} className="export-button">
              Export
            </button>
            <button onClick={clearEditor} className="clear-button">
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className={`editor-content ${viewMode}`}>
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className="text-editor-panel">
            <div className="editor-stats">
              <span>Characters: {text.length}</span>
              <span>Words: {text.split(/\s+/).filter(w => w.length > 0).length}</span>
              {isAnalyzing && <span className="analyzing">Analyzing...</span>}
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Start typing to see real-time network analysis...

Try writing about topics like:
• Machine learning and artificial intelligence
• Network theory and graph algorithms  
• Natural language processing
• Knowledge management systems

The graph will update automatically as you type!"
              className="live-textarea"
              spellCheck={false}
            />
            
            {analysis && (
              <div className="live-insights">
                <h4>Live Insights</h4>
                <div className="insight-chips">
                  {analysis.keyTerms.slice(0, 5).map((term, index) => (
                    <span 
                      key={index} 
                      className="insight-chip"
                      onClick={() => setHighlightedTerms([term])}
                    >
                      {term}
                    </span>
                  ))}
                </div>
                {analysis.insights.slice(0, 2).map((insight, index) => (
                  <p key={index} className="live-insight">{insight}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'graph') && analysis && (
          <div className="graph-panel">
            {showMetrics && (
              <div className="live-metrics">
                <div className="metric">
                  <span className="metric-value">{analysis.nodes.length}</span>
                  <span className="metric-label">Concepts</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{analysis.edges.length}</span>
                  <span className="metric-label">Links</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{analysis.topics.length}</span>
                  <span className="metric-label">Topics</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{(analysis.metrics.modularity * 100).toFixed(0)}%</span>
                  <span className="metric-label">Modularity</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{(analysis.metrics.density * 100).toFixed(1)}%</span>
                  <span className="metric-label">Density</span>
                </div>
                
                <button 
                  className="metrics-toggle"
                  onClick={() => setShowMetrics(false)}
                  title="Hide Metrics"
                >
                  ×
                </button>
              </div>
            )}
            
            {!showMetrics && (
              <button 
                className="show-metrics-button"
                onClick={() => setShowMetrics(true)}
                title="Show Metrics"
              >
                📊
              </button>
            )}

            <div className="graph-container">
              <GraphVisualization 
                nodes={analysis.nodes}
                edges={analysis.edges}
                onNodeClick={handleNodeClick}
                highlightedTerms={highlightedTerms}
              />
            </div>
            
            {analysis.structuralGaps.length > 0 && (
              <div className="structural-gaps">
                <h5>Potential Connections</h5>
                {analysis.structuralGaps.slice(0, 2).map((gap, index) => (
                  <div key={index} className="gap-suggestion">
                    <span>Topics {gap.community1} ↔ {gap.community2}</span>
                    {gap.bridgingConcepts.length > 0 && (
                      <span className="bridge-concepts">
                        via {gap.bridgingConcepts.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 