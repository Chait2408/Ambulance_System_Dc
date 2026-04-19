import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSimStore } from "../store/useSimStore";

const COLORS = {
  dispatcher_primary: "#7F77DD",
  dispatcher_backup:  "#AFA9EC",
  ambulance_alive:    "#1D9E75",
  ambulance_busy:     "#EF9F27",
  dead:               "#E24B4A",
};

function nodeColor(n) {
  if (n.status === "dead") return COLORS.dead;
  if (n.type === "dispatcher") return n.role === "primary" ? COLORS.dispatcher_primary : COLORS.dispatcher_backup;
  return n.status === "busy" ? COLORS.ambulance_busy : COLORS.ambulance_alive;
}

export default function NetworkGraph({ onKill, onRecover }) {
  const containerRef = useRef(null);
  const svgRef       = useRef(null);
  const simRef       = useRef(null);
  const nodes        = useSimStore((s) => s.nodes);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = container.clientWidth  || 500;
    const H = container.clientHeight || 300;

    // Clear previous render
    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width",  W)
      .attr("height", H)
      .style("display", "block");

    // Build links
    const links = [];
    const dispatchers = nodes.filter((n) => n.type === "dispatcher");
    const ambulances  = nodes.filter((n) => n.type === "ambulance");

    dispatchers.forEach((d) => {
      ambulances.forEach((a) => links.push({ source: d.id, target: a.id }));
    });
    if (dispatchers.length === 2) {
      links.push({ source: dispatchers[0].id, target: dispatchers[1].id, isDashboard: true });
    }

    const nodeData = nodes.map((n) => ({ ...n }));

    simRef.current = d3.forceSimulation(nodeData)
      .force("link",      d3.forceLink(links).id((d) => d.id).distance(90).strength(0.5))
      .force("charge",    d3.forceManyBody().strength(-280))
      .force("center",    d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(32))
      .force("x",         d3.forceX(W / 2).strength(0.04))
      .force("y",         d3.forceY(H / 2).strength(0.04));

    // Links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#d1d0ca")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", (d) => d.isDashboard ? "5 4" : "none");

    // Node groups
    const nodeG = svg.append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3.drag()
          .on("start", (ev, d) => {
            if (!ev.active) simRef.current.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag",  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
          .on("end",   (ev, d) => {
            if (!ev.active) simRef.current.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on("click", (ev, d) => {
        ev.stopPropagation();
        d.status === "dead" ? onRecover(d.id) : onKill(d.id);
      });

    // Outer pulse ring (alive nodes only)
    nodeG.append("circle")
      .attr("r", (d) => (d.type === "dispatcher" ? 24 : 18))
      .attr("fill", "none")
      .attr("stroke", (d) => d.status === "alive" ? nodeColor(d) : "transparent")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.35)
      .style("animation", (d) => d.status === "alive" ? "ping 1.6s ease-out infinite" : "none");

    // Main circle
    nodeG.append("circle")
      .attr("r", (d) => (d.type === "dispatcher" ? 20 : 15))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", (d) => d.justPromoted ? "#534AB7" : "rgba(255,255,255,0.8)")
      .attr("stroke-width", (d) => d.justPromoted ? 3 : 2);

    // Label inside
    nodeG.append("text")
      .text((d) => {
        if (d.type === "dispatcher") return d.role === "primary" ? "P" : "B";
        return d.id.replace("AMB-", "");
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .style("font-size", (d) => d.type === "dispatcher" ? "12px" : "10px")
      .style("font-weight", "600")
      .style("pointer-events", "none");

    // Name label below
    nodeG.append("text")
      .text((d) => d.status === "dead" ? "DEAD" : d.name.replace(" Dispatcher", " Disp.").replace(" Node", ""))
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.type === "dispatcher" ? 32 : 26)
      .attr("fill", (d) => d.status === "dead" ? "#E24B4A" : "#888780")
      .style("font-size", "9px")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    // Tooltip
    nodeG.append("title").text((d) => `${d.name}\nStatus: ${d.status}\nRole: ${d.role}\nClick to ${d.status === "dead" ? "recover" : "kill"}`);

    simRef.current.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      nodeG.attr("transform", (d) => `translate(${
        Math.max(28, Math.min(W - 28, d.x))},${
        Math.max(28, Math.min(H - 28, d.y))})`);
    });

    return () => { simRef.current?.stop(); d3.select(container).selectAll("*").remove(); };
  }, [nodes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexShrink: 0 }}>
        <span style={label}>Network topology</span>
        <span style={{ fontSize: "11px", color: "#aaa" }}>click node to kill / recover</span>
      </div>

      {/* Graph fills remaining space */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, borderRadius: "8px", background: "#fafaf9", border: "1px solid #ebebea", overflow: "hidden" }} />

      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", flexShrink: 0 }}>
        {[
          { color: COLORS.dispatcher_primary, label: "Primary" },
          { color: COLORS.dispatcher_backup,  label: "Backup" },
          { color: COLORS.ambulance_alive,     label: "Available" },
          { color: COLORS.ambulance_busy,      label: "Busy" },
          { color: COLORS.dead,                label: "Dead" },
        ].map(({ color, label: lbl }) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "#888" }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const label = { fontSize: "11px", fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em" };