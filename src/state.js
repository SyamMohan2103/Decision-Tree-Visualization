import { createSelector } from 'reselect';

const initialState = {
	ui: {
		sample_hover_id: null,
		tree_node_hover_id: null,
		leaf_length: 14,
		animation_extent: 0,
		tree_offset: 7,
		points: {
			start:         { x:    0, y:   0  },
			end_path:      { x: null, y: 0.72 },
			end_target:    { x: 0.25, y: 0.8  },
			end_nontarget: { x: 0.75, y: 0.8  }
		},
		extent: {
			tree: { min: 0.06, max: 0.7 },
			results_training: { min: 0.75, max: 1.00 },
			results_test:     { min: 0.75, max: 0.9  }
		},
		canvas: {
		 	size:   { width: 800,
			          height: 700 },
			margin: { top: 10,
			          bottom: 10,
			          left: 10,
			          right: 10 }
		}
	}
};

export function makeState() {
	return Object.assign({}, initialState);
};

export function makeSelector() {
	let s = {
		canvasSize	 : state => state.ui.canvas.size,
		treeExtent	 : state => state.ui.extent.tree,
		canvasMargin : state => state.ui.canvas.margin
	};

	s.xScale      = createSelector([ s.canvasSize,
	                                 s.canvasMargin ], xScale);
	s.yScale      = createSelector([ s.canvasSize,
	                                 s.canvasMargin ], yScale);
	s.yTreeScale  = createSelector([ s.canvasSize,
	                                 s.canvasMargin,
	                                 s.treeExtent ], yTreeScale);
	return s;
};

function xScale(size, margin) {
	var xm = margin.top + margin.bottom;
	return d3.scaleLinear()
		.domain([0, 1])
		.range([xm, size.width - xm]);
}

function yScale(size, margin) {
	var ym = margin.left + margin.right;
	return d3.scaleLinear()
		.domain([0, 1])
		.range([ym, size.height - ym]);
}

function yTreeScale(size, margin, extent) {
	return d3.scaleLinear()
		.domain([0, 1])
		.range([extent.min * size.height,
		        extent.max * size.height]);
}
