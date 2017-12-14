import json
import os
import sys


def renderTreeGraph(inputFile):
    import pandas as pd
    from sklearn import tree
    import graphviz

    with open(inputFile) as f:
        content = f.readlines()
    content = [x.strip() for x in content]

    lists = []
    for line in content:
        tmp = line.split(" ")
        dics = {}
        for i in tmp:
            try:
                label = int(i)
                dics["label"] = i
            except:
                tmp2 = i.split(":")
                dics[tmp2[0]] = float(tmp2[1])
        lists.append(dics)

    df_diagnosis = pd.DataFrame.from_dict(lists)
    df_diagnosis = df_diagnosis.fillna(0)
    label = df_diagnosis.label
    df_diagnosis = df_diagnosis.drop('label', 1)
    features = df_diagnosis.columns

    clf = tree.DecisionTreeClassifier(max_depth=7, min_samples_split=10)
    clf = clf.fit(df_diagnosis, label)

    # IN CASE WE NEED TREE OUTPUT AS IMAGE
    #
    # dot_data = tree.export_graphviz(
    #     clf,
    #     out_file=None,
    #     feature_names=features,
    #     class_names=list(set(label)),
    #     filled=True,
    #     rounded=True,
    #     special_characters=True)
    # graph = graphviz.Source(dot_data)
    # graph.render(inputFile[11:])

    return treeToDict(clf, 0, features)


def treeToDict(clf, node_id, features):
    import numpy as np

    n_nodes = clf.tree_.node_count
    children_left = clf.tree_.children_left
    children_right = clf.tree_.children_right
    feature = clf.tree_.feature
    threshold = clf.tree_.threshold

    j = {}

    if (children_left[node_id] != children_right[node_id]):
        j['id'] = node_id
        j['key'] = features[feature[node_id]]
        j['value'] = threshold[node_id]
        j['children'] = []
        j['children'].append(treeToDict(clf, children_left[node_id], features))
        j['children'].append(
            treeToDict(clf, children_right[node_id], features))
    else:
        j['id'] = node_id
        j['value'] = [
            clf.tree_.value[node_id][0][0], clf.tree_.value[node_id][0][1]
        ]
    return j


def createTrainingSet(inputFile):
    import os

    with open(inputFile) as train:
        features = set()
        for line in train.read().splitlines():
            data = line.split(" ")[1:]
            for f in data:
                split_f = f.split(":")
                if len(split_f) > 1:
                    feature_name = split_f[0]
                    if feature_name == 'ough':
                    features.add(feature_name)
        features = list(features)
        tree_training_set = []
        train.seek(0)
        count = 0
        for line in train.read().splitlines():
            training_data = {"target": 0, "num": count}
            for f in features:
                training_data[f] = 0
            data = line.split(" ")
            training_data["target"] = data[0]
            data.pop(0)
            for feature in data:
                split_feature = feature.split(":")
                if len(split_feature) > 1:
                    feature_name = split_feature[0]
                    feature_value = float(split_feature[1])
                    training_data[feature_name] = feature_value
            tree_training_set.append(training_data)
            count += 1
        return tree_training_set


with open('tree-set.js', 'w') as training_set:
    training_set.write("export var dataSet = \"" + sys.argv[1][11:-4] +
                       "\";\n\n")
    training_set.write("export var treeData = ")
    json.dump(renderTreeGraph(sys.argv[1]), training_set, indent=4)
    training_set.write(";\n\n")

    training_set.write("export var treeTrainingSet = [\n")
    for sample in createTrainingSet(sys.argv[1]):
        training_set.write("\t%s,\n" % sample)
    training_set.seek(-2, os.SEEK_END)
    training_set.truncate()
    training_set.write("\n];\n\n")

    training_set.write("export var treeTestingSet = [\n")
    testing_set_file = "data/test" + sys.argv[1][10:]
    for sample in createTrainingSet(testing_set_file):
        training_set.write("\t%s,\n" % sample)
    training_set.seek(-2, os.SEEK_END)
    training_set.truncate()
    training_set.write("\n];")
