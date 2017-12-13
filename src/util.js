export function pointsToSVGLinePath(points) {
	if (points.length < 1)
		return '';

	const pathSegment = (p) => p.x + ' ' + p.y;
	return ['M', ...points.map(pathSegment)].join(' ');
};

export function chunkBy(n, k, array) {
	if (k <= 0)             return [];
	if (array.length === 0) return [];
	if (array.length < n)   return [array];
	if (n < 1)
		n = 0;
	return [array.slice(0, n), ...chunkBy(n, k, array.slice(k))];
};

export function mapBy(n, k, array, f) {
	if (array.length < n)
		return [];
	const chunks = chunkBy(n, k, array).filter(c => c.length === n);
	return chunks.map(c => f(...c));
};

export function interleave(a, b) {
	if (a.length === 0)
		return b;
	if (b.length === 0)
		return a;
	return [a[0], b[0], ...interleave(a.slice(1), b.slice(1))];
};

export function treePathPixels(path, isTarget, xScale, yScale, state) {
	const treeSrc = { 'x': path[0].x,
	                  'y': path[0].y - 10 };
	const treeDst = { 'x': path[path.length-1].x,
	                  'y': yScale(state.ui.points.end_path.y) };

	let resultPoint = state.ui.points[isTarget ? "end_target" : "end_nontarget"],
	    resultSrc = { x: xScale(resultPoint.x),
	                   y: yScale(resultPoint.y) };

	const midpts = mapBy(2, 1, path, (a, b) => angledPathMidpoint(a, b));
	const treePath = interleave(path, midpts);

	return [treeSrc, ...treePath, treeDst, resultSrc];
}

export function linkAngledPath(src, dst, xScale, yScale, offset=0, splitFrac=0.3) {
	let pa = { 'x': xScale(src.x), 'y': yScale(src.y) },
	    pb = { 'x': xScale(dst.x), 'y': yScale(dst.y) },
	    pm = angledPathMidpoint(pa, pb, splitFrac);

	if (offset != 0) {
		const xoff = (pb.x - pa.x) > 0 ? -offset : +offset,
		      yoff = (pa.y - pb.y) > 0 ? -offset : +offset;

		const pmDx = pm.x - pa.x,
		      pmDy = pm.y - pa.y,
		      theta = Math.atan(pmDx/pmDy);

		pa.y += yoff;
		pb.x += xoff;
		pm.x = pb.x;
		pm.y = pa.y + ((pb.x - pa.x) / Math.tan(theta));
	}

	return pointsToSVGLinePath([pa, pm, pb]);
}

export function angledPathMidpoint(src, dst, splitFrac = 0.3) {
	return { 'x': dst.x,
	         'y': src.y + (dst.y - src.y) * splitFrac };
}

export function makeHexLatticeRhombus(unitWidth, unitHeight, spacing,
                                      baseX, baseY, origin="BOTTOM_LEFT",
                                      orientation="SKEW_LEFT") {
	const sizeX = (unitWidth  + spacing) / 2;
	const sizeY = (unitHeight + spacing) / 2;

	let hexToPixel;
	switch (orientation) {
	case "SKEW_RIGHT":
		hexToPixel = (r, q) => {
			return { 'x' : sizeX * Math.sqrt(3) * (q + r/2),
			         'y' : sizeY * 3/2 * r }; };
		break;
	case "SKEW_LEFT":
	default:
		hexToPixel = (r, q) => {
			return { 'x' : sizeX * Math.sqrt(3) * (q + -r/2),
			         'y' : sizeY * 3/2 * r }; };
		break;
	}

	let toPixel;
	switch (origin) {
	case "TOP_RIGHT":
		toPixel = (r, q) => hexToPixel( r, -q);
		break;
	case "BOTTOM_LEFT":
		toPixel = (r, q) => hexToPixel(-r,  q);
		break;
	case "BOTTOM_RIGHT":
		toPixel = (r, q) => hexToPixel(-r, -q);
		break;
	case "TOP_LEFT":
	default:
		toPixel = (r, q) => hexToPixel( r,  q);
		break;
	}

	return (row, col) => {
		const p = toPixel(row, col);
		return { 'x' : baseX + p.x,
		         'y' : baseY + p.y };
	};
}

export function progressArray(progress, n, nspan) {
	function normalize(x, lo, hi) {
		var normed = (x - lo) / (hi - lo);
		return Math.max(0, Math.min(1, normed));
	}

	nspan = nspan || undefined;
	if (n < 1) return [];
	return Array(n).fill(undefined).map((_, i) => {
		let [ lo, hi ] = progressDomain(i, n, nspan);
		return normalize(progress, lo, hi);
	});
}

export function progressDomain(k, n, distance) {
	if (n < 1)  return [0, 0];
	if (n == 1) return [0, 1];

	let interval = 1 / n;
	distance = distance || (1 - interval);
	interval = 1 - distance;

	const s = k * (interval / (n-1));
	return [ s, s + distance ];
}

export function getRandom(arr, n) {
	var len = arr.length;
	n = Math.min(len, n);
  var result = new Array(n),
      taken = new Array(len);
	len = n;
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len;
  }
  return result;
}
