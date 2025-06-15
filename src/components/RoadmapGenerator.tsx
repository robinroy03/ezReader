import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface JsonNode {
  id: string;
  label: string;
  indegree_id?: string[];
  outdegree_id?: string[];
}

interface RoadmapGeneratorProps {
  roadmapData?: JsonNode[];
  error?: string;
  onClear?: () => void;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ 
  roadmapData = [],
  error = '',
  onClear
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update nodes and edges when roadmapData changes
  React.useEffect(() => {
    if (roadmapData.length > 0) {
      createFlowFromData(roadmapData);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [roadmapData, setNodes, setEdges]);

  const createFlowFromData = (data: JsonNode[]) => {
    // Create nodes
    const flowNodes: Node[] = data.map((item: JsonNode, index: number) => ({
      id: item.id,
      type: 'default',
      position: { 
        x: (index % 4) * 250, 
        y: Math.floor(index / 4) * 120 
      },
      data: { label: item.label || item.id },
      style: {
        background: '#ffffff',
        border: '2px solid #3182ce',
        borderRadius: '12px',
        padding: '12px',
        color: '#1a202c',
        fontSize: '14px',
        fontWeight: '600',
        minWidth: '180px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }));

    // Create edges based on indegree_id and outdegree_id arrays
    const flowEdges: Edge[] = [];
    const addedEdges = new Set<string>(); // To prevent duplicate edges
    
    data.forEach((item: JsonNode) => {
      // If this node has outdegree_id array, create edges to those nodes
      if (item.outdegree_id && Array.isArray(item.outdegree_id)) {
        item.outdegree_id.forEach((targetId: string) => {
          const targetExists = data.some((node: JsonNode) => node.id === targetId);
          const edgeId = `${item.id}->${targetId}`;
          
          if (targetExists && !addedEdges.has(edgeId)) {
            flowEdges.push({
              id: edgeId,
              source: item.id,
              target: targetId,
              type: 'smoothstep',
              style: { stroke: '#3182ce', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3182ce',
              },
            });
            addedEdges.add(edgeId);
          }
        });
      }

      // If this node has indegree_id array, create edges from those nodes
      if (item.indegree_id && Array.isArray(item.indegree_id)) {
        item.indegree_id.forEach((sourceId: string) => {
          const sourceExists = data.some((node: JsonNode) => node.id === sourceId);
          const edgeId = `${sourceId}->${item.id}`;
          
          if (sourceExists && !addedEdges.has(edgeId)) {
            flowEdges.push({
              id: edgeId,
              source: sourceId,
              target: item.id,
              type: 'smoothstep',
              style: { stroke: '#3182ce', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3182ce',
              },
            });
            addedEdges.add(edgeId);
          }
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'var(--bg-primary)', 
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ 
            margin: '0', 
            color: 'var(--text-accent)',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            🧠 Learning Roadmap
          </h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleClear}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--button-danger)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            color: 'var(--error-text)', 
            backgroundColor: 'var(--error-bg)', 
            border: `1px solid var(--error-border)`,
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-secondary)' 
        }}>
          💡 This AI-powered tool analyzes your PDF content and creates a visual learning roadmap showing the connections between concepts.
        </div>
      </div>

      <div style={{ flex: 1, border: '1px solid var(--border-secondary)' }}>
        {nodes.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No roadmap generated yet
            </div>
            <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
              Load a PDF and click "Generate Roadmap" in the toolbar to create an AI-powered learning path from your document content.
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="var(--border-secondary)" />
            <Controls />
            <MiniMap 
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator; 