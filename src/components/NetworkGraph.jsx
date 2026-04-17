import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSimStore } from "../store/useSimStore";

const NODE_COLORS = {
  dispatcher_primary: "#7F77DD",
  dispatcher_backup:  "#AFA9EC",
  ambulance_alive:    "#1D9E75",
  ambulance_busy:     "#EF9F27",
  dead:               "#E24B4A",
};

function nodeColor(n) {
  if (n.status === "dead") return NODE_COLORS.dead;
  if (n.type === "dispatcher") {
    return n.role === "primary" ? NODE_COLORS.dispatcher_primary : NODE_COLORS.dispatcher_backup;
  }
  return n.status === "busy" ? NODE_COLORS.ambulance_busy : NODE_COLORS.ambulance_alive;
}

export default function NetworkGraph({ onKill, onRecover }) {
  const svgRef  = useRef(null);
  const simRef  = useRef(null);
  const nodes   = useSimStore((s) => s.nodes);

  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current;
    const W = el.clientWidth || 380;
    const H = el.clientHeight || 280;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el)
      .append("svg")
      .attr("width", W)
      .attr("height", H);

    // Build links: dispatchers ↔ all ambulances
    const links = [];
    const dispatchers = nodes.filter((n) => n.type === "dispatcher");
    const ambulances  = nodes.filter((n) => n.type === "ambulance");
    dispatchers.forEach((d) => {
      ambulances.forEach((a) => {
        links.push({ source: d.id, target: a.id });
      });
    });
    // Dispatcher ↔ dispatcher link
    if (dispatchers.length === 2) {
      links.push({ source: dispatchers[0].id, target: dispatchers[1].id });
    }

    const nodeData = nodes.map((n) => ({ ...n }));

    simRef.current = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(70).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(28));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", (d) => {
        const s = nodes.find((n) => n.id === d.source || n.id === d.source?.id);
        const t = nodes.find((n) => n.id === d.target || n.id === d.target?.id);
        return (s?.type === "dispatcher" && t?.type === "dispatcher") ? "4 3" : "none";
      });

    const node = svg.append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simRef.current.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end",  (event, d) => {
            if (!event.active) simRef.current.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    node.append("circle")
      .attr("r", (d) => d.type === "dispatcher" ? 18 : 13)
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", (d) => d.justPromoted ? "#534AB7" : "#fff")
      .attr("stroke-width", (d) => d.justPromoted ? 3 : 1.5);

    node.append("text")
      .text((d) => d.id.split("-")[1] || d.id)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .style("font-size", "9px")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    node.append("title").text((d) => `${d.name} — ${d.status} (${d.role})\nClick to kill/recover`);

    node.on("click", (event, d) => {
      if (d.status === "dead") {
        onRecover(d.id);
      } else {
        onKill(d.id);
      }
    });

    simRef.current.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simRef.current?.stop();
  }, [nodes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Network topology</span>
        <span className="text-xs text-gray-400">click node to kill / recover</span>
      </div>
      <div ref={svgRef} className="flex-1 w-full rounded-lg bg-gray-50 border border-gray-100" />
      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {[
          { color: NODE_COLORS.dispatcher_primary, label: "Primary" },
          { color: NODE_COLORS.dispatcher_backup,  label: "Backup" },
          { color: NODE_COLORS.ambulance_alive,     label: "Available" },
          { color: NODE_COLORS.ambulance_busy,      label: "Busy" },
          { color: NODE_COLORS.dead,                label: "Dead" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}