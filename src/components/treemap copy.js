// import React from "react";
// import { treemap, hierarchy, scaleOrdinal, schemeDark2, format } from "d3";

// export function TreeMap(props) {
//     const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;
//     return <></>
// }

import React from "react";
import * as d3 from "d3";

// Text component for labels inside treemap cells
const Text = ({ x, y, width, text, fontSize = 12 }) => {
  // Truncate text if it's too long for the rectangle
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const maxChars = Math.floor(width / (fontSize * 0.6));
  const displayText = truncateText(text, maxChars);

  return (
    <text
      x={x + 5}
      y={y + fontSize + 5}
      fontSize={fontSize}
      fontFamily="Arial"
      fill="white"
      style={{ pointerEvents: "none" }}
    >
      {displayText}
    </text>
  );
};

export function TreeMap(props) {
  const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;
  
  // Return empty fragment if no tree data
  if (!tree || !tree.children || tree.children.length === 0) {
    return <></>;
  }

  // Calculate inner dimensions
  const innerWidth = svg_width - margin.left - margin.right;
  const innerHeight = svg_height - margin.top - margin.bottom;
  
  // Create hierarchy and treemap layout
  const root = d3.hierarchy(tree)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
  
  const treemapLayout = d3.treemap()
    .size([innerWidth, innerHeight])
    .paddingOuter(3)
    .paddingTop(20)
    .paddingInner(1)
    .round(true);
  
  // Apply treemap layout to hierarchical data
  treemapLayout(root);
  
  // Define color scale
  const colorScale = d3.scaleOrdinal(d3.schemeDark2);
  
  // Get all descendants (including root)
  const descendants = root.descendants();
  
  // Function to handle click on treemap cell
  const handleCellClick = (node) => {
    setSelectedCell(selectedCell === node.data.name ? null : node.data.name);
  };
  
  return (
    <svg 
      viewBox={`0 0 ${svg_width} ${svg_height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%" }}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Render treemap cells */}
        {descendants.slice(1).map((node, i) => (
          <g key={`node-${i}`}>
            <rect
              x={node.x0}
              y={node.y0}
              width={node.x1 - node.x0}
              height={node.y1 - node.y0}
              fill={colorScale(node.data.attr)}
              opacity={selectedCell === node.data.name ? 1.0 : 0.7}
              stroke="#fff"
              strokeWidth={1}
              onClick={() => handleCellClick(node)}
              style={{ cursor: "pointer" }}
            />
            
            {/* Only render text if cell is big enough */}
            {(node.x1 - node.x0 > 30 && node.y1 - node.y0 > 20) && (
              <Text 
                x={node.x0} 
                y={node.y0} 
                width={node.x1 - node.x0}
                text={`${node.data.name}: ${node.value}`}
              />
            )}
          </g>
        ))}
        
        {/* Add attribute labels at top of each group */}
        {descendants.filter(d => d.depth === 1).map((node, i) => (
          <text
            key={`label-${i}`}
            x={node.x0 + (node.x1 - node.x0) / 2}
            y={node.y0 - 5}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
            fill="#333"
          >
            {node.data.attr}
          </text>
        ))}
      </g>
    </svg>
  );
}
  