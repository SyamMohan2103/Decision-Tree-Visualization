import _ from 'lodash';

const makeForkNode = () => ({
	id:          undefined,	  // unique node id
	type:        "",          // type, ROOT/LEFT/RIGHT
	leaf:        false,       // true if a leaf node
	samples:     0,           // sample count
	split_key:   "",          // split factor name
	split_point: 0,           // split factor value
	parent:      undefined,   // parent node id
	children:    []           // descendant tree nodes, ids
});

const makeLeafNode = () => ({
	id:            undefined, // unique node id
	type:          "",        // type, ROOT/LEFT/RIGHT
	leaf:          true,      // true if a leaf node
	samples:       0,         // sample count
	sample_counts: [0, 0],    // # classified target/non-target samples
	target:		   false,     // clasifies target or non-target samples?
	parent:        undefined, // parent node id
	children:      undefined  // descendant tree nodes, ids
});

const deriveObject = (dst, src) => {
	for (var key in dst) {
		if (dst.hasOwnProperty(key) && src.hasOwnProperty(key))
			dst[key] = src[key];
	}
	return dst;
};

export function cleanRawJSONTree(raw) {
	const isLeaf = (n) => n.children == undefined || n.children.length === 0;
	const isRoot = (n) => n.parent == undefined;

	const flattenTree = (root) => {
		if (isLeaf(root)) {
			root.children = [];
			return [root];
		}

		const assignParent = (n) => Object.assign({ parent : root}, n);
		root.children = root.children.map(assignParent);
		return [root, ..._.flatMap(root.children, flattenTree)];
	};

	const normalizeNode = (node) => {
		if (node.children)
			node.children = node.children.map(c => Number(c.id));
		if (node.parent)
			node.parent = node.parent.id;
		return node;
	};

	const addType = (n) => {
		if (isRoot(n))
			n.type = 'ROOT';
		else if (n == n.parent.children[0])
			n.type = 'LEFT';
		else if (n == n.parent.children[1])
			n.type = 'RIGHT';
		else
			n.type = 'UNKNOWN';
		return n;
	};

	const transformLeafNode = (n) => {
		let a = deriveObject(makeLeafNode(), n);

		if (n.value == undefined)
			throw new Error("Invalid tree input: no value on node");
		a.sample_counts = n.value;
		a.target = n.value[0] > n.value[1];

		a.id = n.id;
		a.samples = n.samples;
		return a;
	};

	const transformForkNode = (n) => {
		let a = deriveObject(makeForkNode(), n);

		a.split_key   = n.key;
		a.split_point = n.value;

		a.id      = n.id;
		a.samples = n.samples;
		return a;
	};

	const transformNode = (n) => {
		if (isLeaf(n))
			return transformLeafNode(n);
		else
			return transformForkNode(n);
	};

	let tree = Object.assign({}, raw);
	tree = flattenTree(tree);
	tree = tree.map(addType);
	tree = tree.map(transformNode);
	tree = tree.map(normalizeNode);

	return tree.reduce((obj, node) => {
		obj[node.id] = node;
		return obj;
	}, {});
};
