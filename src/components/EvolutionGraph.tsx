"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Feature, EvolutionEvent, STATUS_META } from "@/lib/types";
import { track } from "@/lib/novus";

// Lay out features as a lineage tree (parent → child).
function layout(features: Feature[]): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const byParent = new Map<string | null, Feature[]>();
  features.forEach((f) => {
    const k = f.parentId ?? null;
    byParent.set(k, [...(byParent.get(k) || []), f]);
  });

  const X_GAP = 230;
  const Y_GAP = 120;
  let leafCursor = 0;

  // assign x by depth, y by an in-order traversal so siblings spread out
  function place(node: Feature, depth: number) {
    const children = byParent.get(node.id) || [];
    if (children.length === 0) {
      pos.set(node.id, { x: depth * X_GAP, y: leafCursor * Y_GAP });
      leafCursor += 1;
      return;
    }
    children.forEach((c) => place(c, depth + 1));
    const childYs = children.map((c) => pos.get(c.id)!.y);
    const midY = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    pos.set(node.id, { x: depth * X_GAP, y: midY });
  }

  (byParent.get(null) || []).forEach((root) => place(root, 0));
  return pos;
}

function FeatureNode({ data }: { data: any }) {
  const meta = STATUS_META[data.status as keyof typeof STATUS_META];
  return (
    <div
      className="group relative w-[190px] rounded-xl border bg-bg-card px-3.5 py-3 shadow-lg transition"
      style={{ borderColor: `${meta.color}55`, boxShadow: `0 0 0 1px ${meta.color}22, 0 8px 24px -12px ${meta.color}66` }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-white/20" />
      <div className="mb-1 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <div className="text-sm font-semibold leading-snug">{data.name}</div>
      <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-faint">{data.summary}</div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-faint">
        <span>{data.eventCount} events</span>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-white/20" />
    </div>
  );
}

const nodeTypes = { feature: FeatureNode };

export function EvolutionGraph({
  features,
  events,
  onSelect,
  activeDate,
}: {
  features: Feature[];
  events: EvolutionEvent[];
  onSelect?: (featureId: string) => void;
  activeDate?: Date | null;
}) {
  const positions = useMemo(() => layout(features), [features]);

  const eventCounts = useMemo(() => {
    const m = new Map<string, number>();
    events.forEach((e) => {
      if (activeDate && new Date(e.date) > activeDate) return;
      m.set(e.featureId, (m.get(e.featureId) || 0) + 1);
    });
    return m;
  }, [events, activeDate]);

  const nodes: Node[] = useMemo(
    () =>
      features.map((f) => {
        const dimmed = activeDate ? (eventCounts.get(f.id) || 0) === 0 : false;
        return {
          id: f.id,
          type: "feature",
          position: positions.get(f.id) || { x: 0, y: 0 },
          data: {
            name: f.name,
            summary: f.summary,
            status: f.status,
            eventCount: eventCounts.get(f.id) || 0,
          },
          style: { opacity: dimmed ? 0.28 : 1, transition: "opacity .4s" },
        };
      }),
    [features, positions, eventCounts, activeDate]
  );

  const edges: Edge[] = useMemo(
    () =>
      features
        .filter((f) => f.parentId)
        .map((f) => {
          const status = STATUS_META[f.status];
          return {
            id: `${f.parentId}-${f.id}`,
            source: f.parentId!,
            target: f.id,
            animated: f.status === "active" || f.status === "experimental",
            style: { stroke: status.color, strokeWidth: 2, opacity: 0.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: status.color },
          } as Edge;
        }),
    [features]
  );

  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => {
      track("graph_node_clicked", { featureId: node.id });
      onSelect?.(node.id);
    },
    [onSelect]
  );

  return (
    <div className="h-[460px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-bg-subtle">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.06)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
