"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { layoutGraph, relationLabels, topicLabels, type GraphDataset, type GraphNode } from "../../lib/graph";
import { PixelIcon } from "../icons";

type TechnologyNode = Node<{ record: GraphNode; choose: (id: string) => void; focus: (id: string) => void }, "technology">;
function Technology({ data, selected }: NodeProps<TechnologyNode>) {
  return <div className={`flow-technology topic-${data.record.topic} ${selected ? "chosen" : ""}`}>
    <Handle id="left-in" type="target" position={Position.Left} />
    <Handle id="left-out" type="source" position={Position.Left} />
    <Handle id="right-in" type="target" position={Position.Right} />
    <Handle id="right-out" type="source" position={Position.Right} />
    <button onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) data.focus(data.record.id); }} onClick={() => data.choose(data.record.id)} aria-label={`Inspect ${data.record.title}`} aria-pressed={selected} className="nodrag">
      <span className="graph-symbol"><PixelIcon name={data.record.kind === "skill" ? "path" : "universe"} /></span>
      <span><small>{topicLabels[data.record.topic]} · {data.record.kind}</small><strong>{data.record.title}</strong>{selected && <em>SELECTED</em>}</span>
    </button>
  </div>;
}
const nodeTypes = { technology: Technology };
export default function GraphCanvas({ graph, selected, edgeId, onSelect, onEdge, resetKey }: {
  graph: GraphDataset; selected: string | null; edgeId: string | null;
  onSelect: (id: string) => void; onEdge: (id: string) => void; resetKey: number;
}) {
  const [instance, setInstance] = useState<ReactFlowInstance<TechnologyNode, Edge> | null>(null);
  const fitted = useRef<string | null>(null);
  const model = useMemo(() => layoutGraph(graph, selected), [graph, selected]);
  const nodes: TechnologyNode[] = useMemo(() => model.nodes.map(({ node, position }) => ({
    id: node.id, type: "technology", position, data: { record: node, choose: onSelect, focus: (id) => {
      const target = model.nodes.find((item) => item.node.id === id);
      if (target && instance) void instance.setCenter(target.position.x + 105, target.position.y + 40, { zoom: Math.max(instance.getZoom(), 0.85), duration: 0 });
    } }, selected: node.id === selected,
    focusable: false,
  })), [model, selected, onSelect, instance]);
  const edges: Edge[] = useMemo(() => model.edges.map((edge) => {
    const start = model.nodes.find(({ node }) => node.id === edge.from)!.position;
    const end = model.nodes.find(({ node }) => node.id === edge.to)!.position;
    const color = edgeId === edge.id ? "#6744b5" : "#7b8fb4";
    return { id: edge.id, source: edge.from, target: edge.to,
      sourceHandle: start.x < end.x ? "right-out" : "left-out",
      targetHandle: start.x < end.x ? "left-in" : "right-in",
      type: "default", label: edgeId === edge.id ? relationLabels[edge.type] : undefined,
      ariaLabel: `${graph.nodes.find((n) => n.id === edge.from)?.title} ${relationLabels[edge.type]} ${graph.nodes.find((n) => n.id === edge.to)?.title}`,
      markerEnd: { type: MarkerType.ArrowClosed, color },
      markerStart: edge.type === "INTEGRATES_WITH" ? { type: MarkerType.ArrowClosed, color } : undefined,
      style: { stroke: color, strokeWidth: edgeId === edge.id ? 3 : 1.5, strokeDasharray: edge.type === "RELATED_TO" ? "5 4" : undefined },
      labelStyle: { fill: "#202b49", fontSize: 12 }, labelBgPadding: [6, 4] as [number, number],
      interactionWidth: 24,
      domAttributes: { onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onEdge(edge.id); } } },
    };
  }), [model, graph.nodes, edgeId, onEdge]);
  useEffect(() => {
    if (!instance) return;
    const key = `${selected}:${resetKey}`;
    if (fitted.current === key) return;
    // Wait one frame for node dimensions. Lens/edge changes never reset the camera.
    const frame = requestAnimationFrame(() => {
      void instance.fitView({ padding: 0.12, duration: 0, maxZoom: 1.05 });
      fitted.current = key;
    });
    return () => cancelAnimationFrame(frame);
  }, [instance, selected, resetKey, nodes]);
  return <div className="graph-canvas" aria-label="Interactive technology map">
    <ReactFlow<TechnologyNode, Edge> nodes={nodes} edges={edges} nodeTypes={nodeTypes}
      onInit={setInstance} onEdgeClick={(_, edge) => onEdge(edge.id)} fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 1.05 }} minZoom={0.25} maxZoom={1.8}
      nodesDraggable={false} nodesConnectable={false} nodesFocusable={false} edgesFocusable
      deleteKeyCode={null} selectionKeyCode={null} panOnScroll={false}
      ariaLabelConfig={{ "controls.zoomIn.ariaLabel": "Zoom in", "controls.zoomOut.ariaLabel": "Zoom out", "controls.fitView.ariaLabel": "Fit map to view" }}>
      <Background gap={24} size={1} color="#cbd7e9" />
      <Controls showInteractive={false} />
    </ReactFlow>
    <p className="canvas-hint">{selected ? `${nodes.length - 1} neighbors · select a line to understand why` : "All categories · select a node to reveal its connections"}</p>
  </div>;
}
