import _ from 'lodash';
import deepFreeze from 'deep-freeze';

import { cleanRawJSONTree } from './tree_clean.js';
import makeState from './state.js';

export const isRoot    = (node) => node.parent === undefined;
export const isLeaf    = (node) => node.leaf;
export const getRoot   = (nodes) => _.head(_.values(_.pickBy(nodes, isRoot)));
export const getLeaves = (nodes) => _.pickBy(nodes, isLeaf);
export const getPaths  = (nodes) => _.mapValues(getLeaves(nodes),
                                                node => treeLineage(nodes, node));


export function makeDecisionTree(rawTree) {
	let _nodes = cleanRawJSONTree(rawTree);
	let nodes = deepFreeze(_.cloneDeep(_nodes));

	let root   = getRoot(nodes);
	let leaves = getLeaves(nodes);
	let points = getPoints(nodes);

	let paths  = _.mapValues(leaves,
	                         leaf => treeLineage(nodes, leaf));

	let links = _.flatMap(_.values(nodes), function childLinks(node) {
		return _.map(node.children,
		             childId => makeLink(node, childId));
	});

	let applySamples = function apply(samples) {
		return applySampleSet(nodes, root, samples);
	};

	let classifySamples = function classify(samples) {
		return classifySampleSet(nodes, samples);
	};

	let api = { nodes, root, leaves, links, points, paths,
	            applySamples, classifySamples };
	return api;
}

function makeLink(src, dstId) {
	return { source : src.id, target : dstId, label : src.split_key };
}

function buildTree(nodes, id) {
  var rootNode = nodes[id];
  rootNode.children = rootNode.children.map(function(childID) { return buildTree(nodes, childID); });
  return rootNode;
}

function getPoints(nodes) {
	let treeNodes = _.cloneDeep(nodes);
  let tree = buildTree(treeNodes, 0);
  let rootNode = d3.hierarchy(tree).sum(d => d.samples);

	let treemap = d3.tree()
	    .separation(() => 1);

  let treeData = treemap(rootNode);
  treeNodes = treeData.descendants();

	let points = treeNodes.map(n => ( { id: n.data.id,
	                                    x: n.x,
	                                    y: n.y }));
	return _.keyBy(points, 'id');
}

function applySampleSet(nodes, root, samples) {
	if (root === undefined)
		return {};
	if (isLeaf(root)) {
		let res = {};
		res[root.id] = samples;
		return res;
	}

	let split = _.partition(
		samples,
		(s) => s[root.split_key] <= Number(root.split_point)
	);
	let a = applySampleSet(nodes, nodes[root.children[0]], split[0]),
	    b = applySampleSet(nodes, nodes[root.children[1]], split[1]);
	return _.merge(a, b);
}

function classifyAppliedSampleSet(nodes, apSamples) {
	const splitOnTarget  = (nodes) => _.partition(nodes, n => n.target);

	let leaves = getLeaves(nodes);
	let splits = splitOnTarget(leaves);
	let splitLeaves = _.zipObject(['target', 'nontarget'], splits);

	return _.mapValues(splitLeaves, function collectSamples(leafList) {
		return _.flatMap(leafList, leaf => apSamples[leaf.id]);
	});
}

function classifySampleSet(nodes, samples) {
	const apSamples = applySampleSet(nodes, getRoot(nodes), samples);
	const classified = classifyAppliedSampleSet(nodes, apSamples);
	return { samples:  samples,
	         byPath:   apSamples,
	         byTarget: classified };
}

function treeLineage(nodes, node) {
	if (node.parent == undefined)
		return [node.id];
	return [...treeLineage(nodes, nodes[node.parent]), node.id];
}
