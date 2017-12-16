import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import DecisionTree from './components/DecisionTree.jsx';

import { dataSet, treeData, treeTrainingSet, treeTestingSet } from './tree-set.js';
import { makeDecisionTree } from './tree.js';
import { getRandom } from './util.js';

let tree = makeDecisionTree(treeData);

function createSet(tree, treeSet) {
  let trainSet = tree.classifySamples(treeSet);

  _.forOwn(trainSet.byPath, (samples, path_id) =>
           samples.forEach(s => s.pathID = Number(path_id)));
  trainSet.byTarget['target'].forEach(s => s.isTarget = (s.target == "0"));
  trainSet.byTarget['nontarget'].forEach(s => s.isTarget = (s.target == "0"));

  trainSet.byTarget['target'].forEach(s => s.correctLeaf = (!!+s.target == !tree.leaves[s.pathID].target));
  trainSet.byTarget['nontarget'].forEach(s => s.correctLeaf = (!!+s.target == !tree.leaves[s.pathID].target));

  trainSet.samples = _.shuffle(_.flatten(_.values(trainSet.byTarget)));
  let tempTarget = trainSet.samples.filter(s => !(s.isTarget ^ s.correctLeaf)),
      tempNontarget = trainSet.samples.filter(s => (s.isTarget ^ s.correctLeaf));
  let splitTarget = _.partition(tempTarget, n => n.correctLeaf),
      splitNontarget = _.partition(tempNontarget, n => n.correctLeaf);
  trainSet.byTarget['target'] = _.concat(splitTarget[0], splitTarget[1]);
  trainSet.byTarget['nontarget'] = _.concat(splitNontarget[0], splitNontarget[1]);

  return trainSet;
}

let trainSet = createSet(tree, treeTrainingSet),
    testSet = createSet(tree, treeTestingSet);

ReactDOM.render(<DecisionTree tree={tree} samples={{train: trainSet, test: testSet}} className={dataSet}/>,
                document.getElementById(dataSet));
