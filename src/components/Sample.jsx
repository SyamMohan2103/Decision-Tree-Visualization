import React from 'react';
import { pointsToSVGLinePath } from '../util.js';

class Sample extends React.Component {
	constructor(props) {
		super(props);
		this.state = { p: { x:0, y:0 },
		               path: pointsToSVGLinePath(this.props.path),
		               progress: this.props.progress,
		               pathID: this.props.pathID,
		               targetclass: this.props.isTarget ? "target" : "nontarget",
      			 			 correctLeaf: this.props.correctLeaf ? "correct" : "incorrect",
									 name: this.props.name,
									 num: this.props.num
		             };
	}

	render() {
	    return <g>
	      <circle cx={this.state.p.x} cy={this.state.p.y} ref="circle" r={2.5} className={"sample " + this.state.targetclass + " " + this.state.correctLeaf} id={this.state.name + "-" + this.state.num}/>
	      <path d={this.state.path} className={"sample-path " + this.state.targetclass} ref="path" id={"path-" + this.state.name + "-" + this.state.num}/>;
	    </g>;
	  }

	componentDidMount() {
		this.updatePosition();
	}

	componentWillReceiveProps(newProps) {
		this.setState({ progress: newProps.progress });
		this.updatePosition();
	}

	updatePosition() {
		let path = document.getElementById("path-"+this.state.pathID);
		path = this.refs.path;
		let dist = this.state.progress * path.getTotalLength();
		const p = path.getPointAtLength(dist);
		this.setState({ p: p });
	}
}

export default Sample;
