import React, { useState } from 'react';
import axios from 'axios';
import { GraphVisualization } from './GraphVisualization';
import './TextAnalysis.css';
import { API_BASE_URL } from '../config';

interface NetworkNode {
  id: string;
  label: string;
  type: string;
  size?: number;
  color?: string;
}

interface NetworkEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

interface TextNetworkAnalysis {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  topics: string[][];
  insights: string[];
  contentGaps: string[];
  keyTerms: string[];
  diversity: number;
}

export const TextAnalysis: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<TextNetworkAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'graph' | 'insights' | 'topics'>('graph');

  const analyzeText = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.post(`${API_BASE_URL}/api/zettelkasten/text/analyze`, {
        text: inputText,
        password
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setAnalysis(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid password');
      } else {
        setError('Failed to analyze text: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      setIsLoading(true);
      setError('');
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await axios.post(`${API_BASE_URL}/api/zettelkasten/import/file`, {
          content,
          fileName: file.name,
          password
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        // Auto-analyze the imported content
        setInputText(content);
        await analyzeText();
      } catch (err: any) {
        setError('Failed to import file: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const clearAnalysis = () => {
    setInputText('');
    setAnalysis(null);
    setError('');
  };

  // Convert analysis data for graph visualization
  const graphNodes = analysis ? analysis.nodes.map(node => ({
    id: node.id,
    label: node.label,
    type: node.type || 'concept'
  })) : [];

  const graphEdges = analysis ? analysis.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    label: edge.label || ''
  })) : [];

  return (
    <div className="text-analysis-container">
      <div className="analysis-header">
        <h1>Text Network Analysis</h1>
        <p>Transform your text into a knowledge graph and discover hidden patterns</p>
      </div>

      <div className="input-section">
        <div className="input-controls">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here to analyze its structure and discover insights..."
            className="text-input"
            rows={6}
            disabled={isLoading}
          />
          
          <div className="control-row">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              disabled={isLoading}
            />
            
            <input
              type="file"
              accept=".txt,.md,.csv"
              onChange={importFile}
              className="file-input"
              disabled={isLoading}
            />
            
            <button 
              onClick={analyzeText} 
              disabled={isLoading || !inputText.trim()}
              className="analyze-button"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Text'}
            </button>
            
            <button 
              onClick={clearAnalysis} 
              disabled={isLoading}
              className="clear-button"
            >
              Clear
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {analysis && (
        <div className="analysis-results">
          <div className="view-toggle">
            <button 
              className={viewMode === 'graph' ? 'active' : ''}
              onClick={() => setViewMode('graph')}
            >
              Network Graph
            </button>
            <button 
              className={viewMode === 'insights' ? 'active' : ''}
              onClick={() => setViewMode('insights')}
            >
              Insights
            </button>
            <button 
              className={viewMode === 'topics' ? 'active' : ''}
              onClick={() => setViewMode('topics')}
            >
              Topics
            </button>
          </div>

          {viewMode === 'graph' && (
            <div className="graph-section">
              <div className="graph-container">
                <GraphVisualization nodes={graphNodes} edges={graphEdges} />
              </div>
              
              <div className="graph-stats">
                <div className="stat">
                  <span className="stat-label">Nodes:</span>
                  <span className="stat-value">{analysis.nodes.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Connections:</span>
                  <span className="stat-value">{analysis.edges.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Diversity:</span>
                  <span className="stat-value">{analysis.diversity.toFixed(2)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Topics:</span>
                  <span className="stat-value">{analysis.topics.length}</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'insights' && (
            <div className="insights-section">
              <div className="insights-content">
                <h3>AI-Generated Insights</h3>
                <ul className="insights-list">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="insight-item">{insight}</li>
                  ))}
                </ul>

                <h3>Content Gaps</h3>
                <p className="description">
                  These are potential areas for development or connections that could strengthen your discourse:
                </p>
                <ul className="gaps-list">
                  {analysis.contentGaps.map((gap, index) => (
                    <li key={index} className="gap-item">{gap}</li>
                  ))}
                </ul>

                <h3>Key Terms</h3>
                <div className="key-terms">
                  {analysis.keyTerms.map((term, index) => (
                    <span key={index} className="key-term">{term}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'topics' && (
            <div className="topics-section">
              <h3>Topic Clusters</h3>
              <p className="description">
                The algorithm identified these topic clusters based on word co-occurrence:
              </p>
              <div className="topics-grid">
                {analysis.topics.map((topic, index) => (
                  <div key={index} className="topic-cluster">
                    <h4>Topic {index + 1}</h4>
                    <div className="topic-words">
                      {topic.map((word, wordIndex) => (
                        <span key={wordIndex} className="topic-word">{word}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 