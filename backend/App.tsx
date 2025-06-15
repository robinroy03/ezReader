import { useState, useCallback } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react'
import type { Node, Edge, Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'

interface JsonNode {
  id: string
  label: string
  indegree_id?: string[]
  outdegree_id?: string[]
}

function App() {
  const [jsonInput, setJsonInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'json' | 'text'>('text')

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const generateRoadmapFromText = async () => {
    try {
      setError('')
      setLoading(true)
      
      if (!textInput.trim()) {
        throw new Error('Text input cannot be empty')
      }

      const response = await fetch('http://localhost:8000/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate roadmap')
      }

      const data = await response.json()
      createFlowFromData(data.roadmap)
    } catch (err) {
      setError(`Error generating roadmap: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const processJsonData = () => {
    try {
      setError('')
      const data = JSON.parse(jsonInput)
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects')
      }

      createFlowFromData(data)
    } catch (err) {
      setError(`Error parsing JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const createFlowFromData = (data: JsonNode[]) => {
    // Create nodes
    const flowNodes: Node[] = data.map((item: JsonNode, index: number) => ({
      id: item.id,
      type: 'default',
      position: { 
        x: (index % 4) * 200, 
        y: Math.floor(index / 4) * 100 
      },
      data: { label: item.label || item.id },
      style: {
        background: '#ffffff',
        border: '2px solid #1a192b',
        borderRadius: '8px',
        padding: '10px',
        color: '#1a192b',
        fontSize: '14px',
        fontWeight: 'bold',
      },
    }))

    // Create edges based on indegree_id and outdegree_id arrays
    const flowEdges: Edge[] = []
    const addedEdges = new Set<string>() // To prevent duplicate edges
    
    data.forEach((item: JsonNode) => {
      // If this node has outdegree_id array, create edges to those nodes
      if (item.outdegree_id && Array.isArray(item.outdegree_id)) {
        item.outdegree_id.forEach((targetId: string) => {
          const targetExists = data.some((node: JsonNode) => node.id === targetId)
          const edgeId = `${item.id}->${targetId}`
          
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
            })
            addedEdges.add(edgeId)
          }
        })
      }

      // If this node has indegree_id array, create edges from those nodes
      if (item.indegree_id && Array.isArray(item.indegree_id)) {
        item.indegree_id.forEach((sourceId: string) => {
          const sourceExists = data.some((node: JsonNode) => node.id === sourceId)
          const edgeId = `${sourceId}->${item.id}`
          
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
            })
            addedEdges.add(edgeId)
          }
        })
      }
    })

    setNodes(flowNodes)
    setEdges(flowEdges)
  }

  const clearDiagram = () => {
    setNodes([])
    setEdges([])
    setJsonInput('')
    setTextInput('')
    setError('')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1a192b' }}>Learning Roadmap Generator</h1>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'text' ? '#3182ce' : '#e2e8f0',
              color: activeTab === 'text' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Generate from Text
          </button>
          <button
            onClick={() => setActiveTab('json')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'json' ? '#3182ce' : '#e2e8f0',
              color: activeTab === 'json' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Manual JSON Input
          </button>
        </div>

        {/* Text Input Tab */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='Enter your learning content here (e.g., book text, course outline, tutorial content, etc.). The AI will analyze it and create a structured learning roadmap.'
              style={{
                flex: 1,
                minHeight: '150px',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={generateRoadmapFromText}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading ? '#a0aec0' : '#38a169',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Generating...' : 'Generate Roadmap'}
              </button>
              <button
                onClick={clearDiagram}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* JSON Input Tab */}
        {activeTab === 'json' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Enter JSON data here, e.g., [{"id": "1", "label": "Node 1", "outdegree_id": ["2", "3"]}, {"id": "2", "label": "Node 2", "indegree_id": ["1"]}]'
              style={{
                flex: 1,
                minHeight: '100px',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={processJsonData}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Render Flow
              </button>
              <button
                onClick={clearDiagram}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {error && (
          <div style={{ 
            color: '#e53e3e', 
            backgroundColor: '#fed7d7', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

export default App
