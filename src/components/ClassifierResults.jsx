import React from 'react';

const ClassifierAccuracy = ({ width, accuracy, name }) =>
	  <g className="classifer-accuracy">
	  <text x={width * 0.5} y="-28" className="accuracy-label">{name} Accuracy</text>
	  <text x={width * 0.5} y="-8"  className="accuracy-value">{accuracy}%</text>
	  </g>;

const ClassifierFraction = ({ x, correct, total, targetclass }) =>
	  <g className={"classifier-fraction "+targetclass}>
	  <text x={x-3} y="-8" textAnchor="end">{correct}</text>
	  <text x={x}   y="-8" fill="black" textAnchor="middle">/</text>
	  <text x={x+3} y="-8" textAnchor="start">{total}</text>
	  </g>;

const ClassifierResults = ({ width, x, y, samples, progress, name }) => {
	let target_total = 0;
	let target_correct = 0;
	let nontarget_total = 0;
	let nontarget_correct = 0;
	samples.forEach((s, i) => {
		if (progress[i] < 1) return;
		if (s.isTarget) {
			target_total++;
			if (s.target == 0 && s.correctLeaf) target_correct++;
		} else {
			nontarget_total++;
			if (s.target == 1 && s.correctLeaf) nontarget_correct++;
		}
	});

	const correct = target_correct + nontarget_correct;
	const total = target_total + nontarget_total;
	const accuracy = total > 0 ? Math.round((correct/total) * 1000) / 10 : 100;
	const left_anchor  = width * 0.37;
	const right_anchor = width * 0.63;

	return (
		<g className="classifier-results" transform={"translate("+x+","+y+")"}>
		  <ClassifierAccuracy width={width} accuracy={accuracy} name={name} />
		  <ClassifierFraction x={left_anchor} correct={target_correct} total={target_total} targetclass="target" />
		  <ClassifierFraction x={right_anchor} correct={nontarget_correct} total={nontarget_total} targetclass="nontarget" />
		  <rect className="classifier-base" />
		</g>);
};

export default ClassifierResults;
