import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  // MiniMap,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import { hierarchy, tree, cluster } from 'd3-hierarchy';
import '@xyflow/react/dist/style.css';

interface JsonNode {
  id: string;
  label: string;
  indegree_id?: string[];
  outdegree_id?: string[];
}

interface HierarchyNode {
  id: string;
  label: string;
  children?: HierarchyNode[];
}

interface RoadmapGeneratorProps {
  roadmapData?: JsonNode[];
  error?: string;
  isLoading?: boolean;
  onClear?: () => void;
}

type LayoutType = 'tree' | 'cluster';

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({
  roadmapData = [],
  error = '',
  isLoading = false,
  onClear
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutType, setLayoutType] = React.useState<LayoutType>('tree');
  const containerRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Convert flat array with connections to hierarchical structure
  const convertToHierarchy = (data: JsonNode[]): HierarchyNode => {
    // Find root nodes (nodes with no indegree_id or empty indegree_id)
    const rootCandidates = data.filter(node => 
      !node.indegree_id || node.indegree_id.length === 0
    );
    
    // If no clear root, create a virtual root
    if (rootCandidates.length === 0 || rootCandidates.length > 1) {
      const virtualRoot: HierarchyNode = {
        id: 'virtual-root',
        label: 'Learning Path',
        children: []
      };
      
      // Add all nodes with no indegree as direct children of virtual root
      const topLevelNodes = data.filter(node => 
        !node.indegree_id || node.indegree_id.length === 0
      );
      
      if (topLevelNodes.length === 0) {
        // If all nodes have dependencies, pick the first few as starting points
        topLevelNodes.push(...data.slice(0, Math.min(3, data.length)));
      }
      
      virtualRoot.children = topLevelNodes.map(node => 
        buildHierarchyNode(node, data, new Set())
      );
      
      return virtualRoot;
    }
    
    // Single root case
    return buildHierarchyNode(rootCandidates[0], data, new Set());
  };

  const buildHierarchyNode = (
    node: JsonNode, 
    allNodes: JsonNode[], 
    visited: Set<string>
  ): HierarchyNode => {
    if (visited.has(node.id)) {
      // Prevent cycles by returning a leaf node
      return {
        id: node.id,
        label: node.label || node.id,
        children: []
      };
    }
    
    visited.add(node.id);
    
    const hierarchyNode: HierarchyNode = {
      id: node.id,
      label: node.label || node.id,
      children: []
    };
    
    // Find children based on outdegree_id
    if (node.outdegree_id && node.outdegree_id.length > 0) {
      hierarchyNode.children = node.outdegree_id
        .map(childId => allNodes.find(n => n.id === childId))
        .filter((child): child is JsonNode => child !== undefined)
        .map(child => buildHierarchyNode(child, allNodes, new Set(visited)));
    }
    
    return hierarchyNode;
  };

  // Update nodes and edges when roadmapData or layout changes
  React.useEffect(() => {
    if (roadmapData.length > 0) {
      createFlowFromData(roadmapData);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [roadmapData, layoutType, setNodes, setEdges]);

  const createFlowFromData = (data: JsonNode[]) => {
    // Convert flat data to hierarchical structure
    const hierarchyData = convertToHierarchy(data);
    
    // Create d3 hierarchy and layout
    const root = hierarchy(hierarchyData);
    
    // Choose layout based on selected type with increased spacing
    const layout = layoutType === 'tree' 
      ? tree<HierarchyNode>().size([1200, 800]).separation((a, b) => (a.parent === b.parent ? 2 : 3))
      : cluster<HierarchyNode>().size([1200, 800]).separation((a, b) => (a.parent === b.parent ? 2 : 3));
    
    layout(root);
    
    // Create nodes with d3-hierarchy positions
    const flowNodes: Node[] = [];
    root.each((node) => {
      flowNodes.push({
        id: node.data.id,
        type: 'default',
        position: {
          x: node.x || 0,
          y: node.y || 0
        },
        data: { label: node.data.label || node.data.id },
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
      });
    });

    // Create edges based on the hierarchical structure and original connections
    const flowEdges: Edge[] = [];
    const addedEdges = new Set<string>(); // To prevent duplicate edges

    // Create edges from hierarchy (parent-child relationships)
    const createHierarchyEdges = (node: ReturnType<typeof hierarchy<HierarchyNode>>) => {
      if (node.children) {
        node.children.forEach((child: ReturnType<typeof hierarchy<HierarchyNode>>) => {
          const edgeId = `${node.data.id}->${child.data.id}`;
          if (!addedEdges.has(edgeId) && node.data.id !== 'virtual-root') {
            flowEdges.push({
              id: edgeId,
              source: node.data.id,
              target: child.data.id,
              type: 'smoothstep',
              style: { stroke: '#3182ce', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3182ce',
              },
            });
            addedEdges.add(edgeId);
          }
          createHierarchyEdges(child);
        });
      }
    };

    createHierarchyEdges(root);

    // Add any additional edges from original data that might not be in hierarchy
    data.forEach((item: JsonNode) => {
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
              style: { stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5,5' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#9ca3af',
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
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value as LayoutType)}
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <option value="tree">🌳 Tree Layout</option>
              <option value="cluster">🌿 Cluster Layout</option>
            </select>
            
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
          💡 This AI-powered tool analyzes your PDF content and creates a visual learning roadmap showing the connections between concepts. Use the layout selector to choose between tree and cluster arrangements.
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
            {isLoading ? (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⏳</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Generating roadmap...
                </div>
                <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                  AI is analyzing your PDF content and creating a visual learning path. This may take a few moments.
                </div>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </>
            ) : (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No roadmap generated yet
                </div>
                <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                  Load a PDF and click "Generate Roadmap" in the toolbar to create an AI-powered learning path from your document content.
                </div>
              </>
            )}
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
            {/* <MiniMap
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)'
              }}
            /> */}
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator; 