import React from 'react';
import _ from 'lodash';

import { progressArray, makeHexLatticeRhombus, treePathPixels } from '../util.js';
import { makeState, makeSelector } from '../state.js';

import SampleSet from './SampleSet.jsx';
import { TreePathList } from './TreePath.jsx';
import { TreeLinkList, TreeLabelList } from './TreeLink.jsx';
import { TreeLeafList } from './TreeLeaf.jsx';
import ClassifierResults from './ClassifierResults.jsx';


class DecisionTree extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.inital_state();

		this.tickTrain = this.tickTrain.bind(this);
		this.tickTest = this.tickTest.bind(this);
		this.startstopTrain = this.startstopTrain.bind(this);
		this.startstopTest = this.startstopTest.bind(this);
		this.reset = this.reset.bind(this);
	}

	inital_state() {
		return { progressTrain: 0,
					 progressTest: 0,
			     intervalTrain: null,
					 intervalTest: null,
			     animatingTrain: false,
				   animatingTest: false };
	}

	render() {
		const tree = this.props.tree;
		const trainSamples = this.props.samples['train'];
		const testSamples = this.props.samples['test'];
		const className = this.props.className;
		const state = makeState();
		const selector = makeSelector();

		const xScale = selector.xScale(state),
		      yScale = selector.yScale(state),
		      yTreeScale = selector.yTreeScale(state);
		const { width, height } = selector.canvasSize(state);

		const sampleProgressRandom = progressArray(this.state.progressTrain,
											 trainSamples.samples['randomSubset'].length, 0.2);
		const sampleProgressComplete = progressArray(this.state.progressTrain,
											 trainSamples.samples['complete'].length, 0.2);

	  const testProgressRandom = progressArray(this.state.progressTest,
	 									  testSamples.samples['randomSubset'].length, 0.2);
		const testProgressComplete = progressArray(this.state.progressTest,
											 testSamples.samples['complete'].length, 0.2);

		function nodesToPixels(nodePath, isTarget) {
			function nodeToPoint(nodeId) {
				var p = tree.points[nodeId];
				return { x : xScale(p.x),
						 y : yTreeScale(p.y) };
			};

			let points = nodePath.map(nid => nodeToPoint(nid));
			return treePathPixels(points, isTarget,
								  xScale, yScale, state);
		}

		const pixelPaths = _.mapValues(tree.paths,
									   (path, id) => nodesToPixels(path, tree.nodes[id].target));

		const placeTargets = makeHexLatticeRhombus(
			4, 4, 3, xScale(0),
		    yScale(state.ui.extent.results_training.max)-5,
		    "BOTTOM_LEFT",
		    "SKEW_LEFT");
		const placeNonTargets = makeHexLatticeRhombus(
			4, 4, 3, xScale(1),
		    yScale(state.ui.extent.results_training.max)-5,
		    "BOTTOM_RIGHT",
		    "SKEW_RIGHT");

		trainSamples.samples['randomSubsetTarget'].forEach((s, i) => {
			var row = i % 5;
			var col = i / 5;
			var result_p = placeTargets(row, col);
			s.path = [...pixelPaths[s.pathID], result_p];
		});
		trainSamples.samples['randomSubsetNontarget'].forEach((s, i) => {
			var row = i % 5;
			var col = i / 5;
			var result_p = placeNonTargets(row, col);
			s.path = [...pixelPaths[s.pathID], result_p];
		});
		testSamples.samples['randomSubsetTarget'].forEach((s, i) => {
			var row = i % 5;
			var col = i / 5;
			var result_p = placeTargets(row + 9.5, col);
			s.path = [...pixelPaths[s.pathID], result_p];
		});
		testSamples.samples['randomSubsetNontarget'].forEach((s, i) => {
			var row = i % 5;
			var col = i / 5;
			var result_p = placeNonTargets(row + 9.5, col);
			s.path = [...pixelPaths[s.pathID], result_p];
		});

		return (
			<div>
			  <div id="fullsvg">
				<svg width={width} height={height}>
				  <g className="decision-tree">
					<TreeLinkList links={_.values(tree.links)} tree={tree}
									state={state} selector={selector} />
					<TreeLeafList leaves={_.values(tree.leaves)} tree={tree}
								  state={state} selector={selector} />
					<TreePathList paths={pixelPaths}
								  state={state} />
					<TreeLabelList links={_.values(tree.links)} tree={tree}
									state={state} selector={selector} />
				  </g>
				  <g className="tree-results">
					<ClassifierResults
					  width={width}
					  x="0"
					  y={yScale(state.ui.extent.results_training.max)}
					  samples={trainSamples.samples['complete']}
					  progress={sampleProgressComplete}
						name="Training" />
					<ClassifierResults
					  width={width}
					  x="0"
					  y={yScale(state.ui.extent.results_training.max) - 50}
					  samples={testSamples.samples['complete']}
					  progress={testProgressComplete}
						name="Testing" />
				  </g>
				  <g className="sample-sets">
					<SampleSet samples={trainSamples.samples['randomSubset']}
							   progresses={sampleProgressRandom}
							   name={className + "-train"} />
				 	<SampleSet samples={testSamples.samples['randomSubset']}
							   progresses={testProgressRandom}
							   name={className + "-test"} />
				  </g>
				</svg>
			  </div>
			  <div id="buttons">
				<button id={"train_" + this.props.class}>
				  {!this.state.animatingTrain ? 'Start Training' : 'Stop Training'}
				</button>
				<button id={"test_" + this.props.class}>
				  {!this.state.animatingTest ? 'Start Testing' : 'Stop Testing'}
				</button>
				<button id={"reset_" + this.props.class}>Reset</button>
			  </div>
			</div>
		);
	}

	tickTrain() {
		if (this.state.animatingTrain) {
			this.setState((prev) => this._tickTrain(prev));
		}
	}

	_tickTrain(prev) {
		return { progressTrain: prev.progressTrain + 0.004,
				 intervalTrain: setTimeout(() => requestAnimationFrame(this.tickTrain), 20)
			   };
	}

	tickTest() {
		if (this.state.animatingTest) {
			this.setState((prev) => this._tickTest(prev));
		}
	}

	_tickTest(prev) {
		return { progressTest: prev.progressTest + 0.004,
				 intervalTest: setTimeout(() => requestAnimationFrame(this.tickTest), 20)
			   };
	}

	startstopTrain() {
		if (this.state.animatingTrain)
			this.setState({ animatingTrain: false,
						    intervalTrain: null });
		else {
			this.setState(
				(prev) => Object.assign({ animatingTrain: true }, this._tickTrain(prev, prev.animatingTest ? 2 : 0)));
		}
	}

	startstopTest() {
		if (this.state.animatingTest)
			this.setState({ animatingTest: false,
						    intervalTest: null });
		else {
			this.setState(
				(prev) => Object.assign({ animatingTest: true }, this._tickTest(prev, prev.animatingTrain ? 2 : 1)));
		}
	}

	reset() {
		this.setState(this.inital_state());
	}

	componentDidMount() {
		document.getElementById('train_' + this.props.class)
			.addEventListener('click', this.startstopTrain);
		document.getElementById('test_' + this.props.class)
			.addEventListener('click', this.startstopTest);
		document.getElementById('reset_' + this.props.class)
			.addEventListener('mousedown', this.reset);
	}
}

export default DecisionTree;
