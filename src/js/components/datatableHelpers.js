var classLetters = {
  "E": 1000,
  "M": 500,
  "S": 1
};


function getClassValue(resClass) {
  return parseInt(classLetters[resClass[0]]) + parseInt(resClass[1]);
}

$.fn.dataTableExt.oSort["rclass-desc"] = function (x, y) {
  if (getClassValue(x) < getClassValue(y))
    return -1;
  else if (getClassValue(x) > getClassValue(y))
    return 1;
  else // must be equal
    return 0;
};

$.fn.dataTableExt.oSort["rclass-asc"] = function (x, y) {
  if (getClassValue(x) > getClassValue(y))
    return -1;
  else if (getClassValue(x) < getClassValue(y))
    return 1;
  else // must be equal
    return 0;
};

$.fn.dataTableExt.oSort["select-desc"] = function (x, y) {
  if ($(x).find(":selected").val() < $(y).find(":selected").val())
    return -1;
  else if ($(x).find(":selected").val() > $(y).find(":selected").val())
    return 1;
  else
    return 0;
};

$.fn.dataTableExt.oSort["select-asc"] = function (x, y) {
  if ($(x).find(":selected").val() > $(y).find(":selected").val())
    return -1;
  else if ($(x).find(":selected").val() < $(y).find(":selected").val())
    return 1;
  else
    return 0;
};

$.fn.dataTableExt.oSort["selecttext-desc"] = function (x, y) {
  if($(x).find(":selected").text() < $(y).find(":selected").text())
    return -1;
  else if($(x).find(":selected").text() > $(y).find(":selected").text())
    return 1;
  else
    return 0;
};

$.fn.dataTableExt.oSort["selecttext-asc"] = function (x, y) {
  if($(x).find(":selected").text() > $(y).find(":selected").text())
    return -1;
  else if($(x).find(":selected").text() < $(y).find(":selected").text())
    return 1;
  else
    return 0;
};