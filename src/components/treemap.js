import { useEffect, useRef } from "react";
import * as d3 from "d3";

// Text component for displaying attributes and values in treemap cells
function Text({ node, innerWidth }) {
  // Skip rendering text if cell is too small
  if (node.x1 - node.x0 < 30 || node.y1 - node.y0 < 20) {
    return null;
  }

  // Calculate the percentage value
  const percentage = (node.value / node.parent.value * 100).toFixed(1);
  
  // Get attribute and name values
  const attrName = node.data.attr ? `${node.data.attr}:` : "";
  const name = node.data.name || "";

  return (
    <g transform={`translate(${node.x0 + 5}, ${node.y0 + 15})`}>
      <text
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          fill: "white",
          textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)"
        }}
      >
        {`${attrName}${name}`}
      </text>
      <text
        style={{
          fontSize: "10px",
          fill: "white",
          textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)"
        }}
        y="15"
      >
        {`Value: ${percentage}%`}
      </text>
    </g>
  );
}

export function TreeMap(props) {
  const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;
  const svgRef = useRef();

  // Calculate the inner width and height based on margins
  const innerWidth = svg_width - margin.left - margin.right;
  const innerHeight = svg_height - margin.top - margin.bottom;

  // Setup treemap layout
  const treemapLayout = d3.treemap()
    .size([innerWidth, innerHeight])
    .paddingOuter(3)
    .paddingTop(20)
    .paddingInner(1)
    .round(true);

  // Process the data
  const root = d3.hierarchy(tree)
    .sum(d => d.value || 0);

  // Apply the treemap layout to the hierarchy
  treemapLayout(root);

  // Define color scale using d3's schemeDark2
  const colorScale = d3.scaleOrdinal()
    .domain(root.children ? root.children.map(d => d.data.attr || d.data.name) : [])
    .range(d3.schemeDark2);

  // Format values for display
  const format = d3.format(".1f");

  // Handle cell click
  const handleCellClick = (node) => {
    setSelectedCell(selectedCell === node ? null : node);
  };

  // Get all descendant nodes for rendering
  const allNodes = root.descendants();

  return (
    <svg
      viewBox={`0 0 ${svg_width} ${svg_height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%" }}
      ref={svgRef}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Render all the treemap cells */}
        {allNodes.map((node, i) => {
          // Skip the root node
          if (node === root) return null;

          // Determine if cell is selected
          const isSelected = selectedCell === node;
          
          // Determine cell color
          const color = node.depth === 1 
            ? colorScale(node.data.attr || node.data.name)
            : d3.color(colorScale(node.parent.data.attr || node.parent.data.name)).brighter(0.3);

          return (
            <g key={`cell-${i}`}>
              <rect
                x={node.x0}
                y={node.y0}
                width={node.x1 - node.x0}
                height={node.y1 - node.y0}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 3 : 1}
                onClick={() => handleCellClick(node)}
                style={{ cursor: "pointer" }}
              />
              
              {/* Add header for parent nodes */}
              {node.depth === 1 && (
                <text
                  x={node.x0 + 5}
                  y={node.y0 - 5}
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    fill: "#333"
                  }}
                >
                  {`${node.data.attr}: ${node.data.name}`}
                </text>
              )}
              
              {/* Add content for each cell */}
              <Text node={node} innerWidth={innerWidth} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}