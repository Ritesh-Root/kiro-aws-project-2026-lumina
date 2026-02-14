import type { CodeStructure, VisualizationNode, VisualizationEdge, ASTNode } from '@lumina/shared';

export interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  mermaidDiagram: string;
}

export function generateVisualization(structure: CodeStructure): VisualizationData {
  const nodes = generateReactFlowNodes(structure);
  const edges = generateReactFlowEdges(structure);
  const mermaidDiagram = generateMermaidDiagram(structure);

  return {
    nodes: layoutNodes(nodes),
    edges,
    mermaidDiagram
  };
}

function generateReactFlowNodes(structure: CodeStructure): VisualizationNode[] {
  const nodes: VisualizationNode[] = [];

  // Add function nodes
  structure.functions.forEach((fn, index) => {
    nodes.push({
      id: fn.id,
      type: 'function',
      label: `${fn.name}(${fn.params?.join(', ') || ''})`,
      data: {
        name: fn.name,
        parameters: fn.params,
        lineNumber: fn.loc?.start.line
      },
      position: { x: 0, y: 0 }, // Will be set by layout algorithm
      style: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        borderWidth: 2
      }
    });
  });

  // Add variable nodes
  structure.variables.forEach((v, index) => {
    nodes.push({
      id: v.id,
      type: 'variable',
      label: `${v.name}: ${v.kind}`,
      data: {
        name: v.name,
        scope: v.scope,
        lineNumber: v.loc?.start.line
      },
      position: { x: 0, y: 0 },
      style: {
        backgroundColor: '#f3e5f5',
        borderColor: '#9c27b0',
        borderWidth: 1
      }
    });
  });

  // Add class nodes
  structure.classes.forEach((cls, index) => {
    nodes.push({
      id: cls.id,
      type: 'class',
      label: `class ${cls.name}`,
      data: {
        name: cls.name,
        lineNumber: cls.loc?.start.line
      },
      position: { x: 0, y: 0 },
      style: {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
        borderWidth: 2
      }
    });
  });

  return nodes;
}

function generateReactFlowEdges(structure: CodeStructure): VisualizationEdge[] {
  const edges: VisualizationEdge[] = [];

  // Add function call edges
  structure.callGraph.forEach((callees, caller) => {
    const callerNode = structure.functions.find(f => f.name === caller);
    if (!callerNode) return;

    callees.forEach((callee, index) => {
      const calleeNode = structure.functions.find(f => f.name === callee);
      if (calleeNode) {
        edges.push({
          id: `edge_${callerNode.id}_${calleeNode.id}_${index}`,
          source: callerNode.id,
          target: calleeNode.id,
          label: 'calls',
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#2196f3',
            strokeWidth: 2
          }
        });
      }
    });
  });

  return edges;
}

function generateMermaidDiagram(structure: CodeStructure): string {
  let mermaid = 'graph TD\n';

  // Limit to 50 nodes for readability
  const maxNodes = 50;
  const totalNodes = structure.functions.length + structure.variables.length;
  
  if (totalNodes > maxNodes) {
    mermaid += `  note["⚠️ Large file: Showing first ${maxNodes} nodes"]\n`;
  }

  // Add function nodes
  const functionsToShow = structure.functions.slice(0, maxNodes);
  functionsToShow.forEach(fn => {
    const params = fn.params?.join(', ') || '';
    mermaid += `  ${sanitizeId(fn.id)}["${fn.name}(${params})"]\n`;
  });

  // Add variable nodes (diamond shape)
  const remainingSlots = maxNodes - functionsToShow.length;
  const variablesToShow = structure.variables.slice(0, remainingSlots);
  variablesToShow.forEach(v => {
    mermaid += `  ${sanitizeId(v.id)}[("${v.name}: ${v.kind}")]\n`;
  });

  // Add edges (function calls)
  structure.callGraph.forEach((callees, caller) => {
    const callerNode = functionsToShow.find(f => f.name === caller);
    if (!callerNode) return;

    callees.forEach(callee => {
      const calleeNode = functionsToShow.find(f => f.name === callee);
      if (calleeNode) {
        mermaid += `  ${sanitizeId(callerNode.id)} --> ${sanitizeId(calleeNode.id)}\n`;
      }
    });
  });

  // Handle circular dependencies
  const cycles = detectCycles(structure.callGraph);
  if (cycles.length > 0) {
    mermaid += `  note2["⚠️ Circular dependencies detected"]\n`;
  }

  return mermaid;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function detectCycles(callGraph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = callGraph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recursionStack.has(neighbor)) {
        // Cycle detected
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }

    recursionStack.delete(node);
  }

  callGraph.forEach((_, node) => {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  });

  return cycles;
}

function layoutNodes(nodes: VisualizationNode[]): VisualizationNode[] {
  // Simple hierarchical layout
  const spacing = 200;
  const verticalSpacing = 150;
  
  let currentX = 100;
  let currentY = 100;
  let nodesInRow = 0;
  const maxNodesPerRow = 4;

  return nodes.map((node, index) => {
    const positioned = {
      ...node,
      position: { x: currentX, y: currentY }
    };

    nodesInRow++;
    currentX += spacing;

    if (nodesInRow >= maxNodesPerRow) {
      currentX = 100;
      currentY += verticalSpacing;
      nodesInRow = 0;
    }

    return positioned;
  });
}
