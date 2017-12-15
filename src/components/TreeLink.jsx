import React from 'react';
import { linkAngledPath } from '../util.js';

export function TreeLink({ src, dst, state, selector }) {
	var d1 = linkAngledPath(src, dst,
							  selector.xScale(state),
							  selector.yTreeScale(state),
							  state.ui.tree_offset);
	var xScale = selector.xScale(state),
			yScale = selector.yTreeScale(state);
	return (
		<g>
		  <path d={d1} className="tree-link" />
		</g>
	);
}

export function TreeLinkList({ links, tree, state, selector }) {
	return (
		<g className="links">
		  { links.map(l => <TreeLink key={l.source+"-"+l.target}
												 src={tree.points[l.source]}
												 dst={tree.points[l.target]}
												 state={state}
												 label={l.label}
												 selector={selector} />)
		  }
	    </g>
	);
}

export function TreeLabel({ src, state, label, selector }) {
	var xScale = selector.xScale(state),
			yScale = selector.yTreeScale(state);
	return (
		<g>
			<text x={xScale(src.x)} y={yScale(src.y)} style={{'fontSize': '6pt'}}>{label}</text>
		</g>
	);
}

export function TreeLabelList({ links, tree, state, selector}) {
	return (
		<g className="labels">
			{ links.map(l => <TreeLabel src={tree.points[l.source]}
													state={state}
													label={l.label}
													selector={selector} />)
			}
		</g>
	);
}
