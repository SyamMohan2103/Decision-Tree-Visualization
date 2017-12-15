var dispatch = d3.dispatch("dataLoaded", "rectSelected", "rectDeselected");

function loadData(trainTest, dataPoint) {
  d3.json("data/" + trainTest + "/words_" + dataPoint + ".json", function(error, data) {
    if (error)
      throw error;
    else
      dispatch.call('dataLoaded', null, data);
    }
  );
}

dispatch.call("rectSelected");
dispatch.call("rectDeselected");
