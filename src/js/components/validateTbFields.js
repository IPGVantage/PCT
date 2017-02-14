/**
* @functions Capture and validate and make calculations
* on the table cells.
* @version
*/
function returnData(new_data, table) {
  var isNum = false;
  if( ($(new_data).parent().hasClass('num') || $(new_data).hasClass('month')) &&
      $(new_data).html() != isNaN &&
      $.isNumeric($(new_data).html()) &&
      $(new_data).text() !== '' ) {
        $(new_data).removeClass('error');
        isNum = true;
  }

  var error = function() {
    var REgex = /^[\$]?[0-9\.\,]+[\%]?/g;
    if( ($(new_data).parent().hasClass('num') || $(new_data).hasClass('month')) &&
      !isNum &&
      $(new_data).html().replace(REgex, '') &&
      $(new_data).text() !== '') {
      $(new_data).html('this field accepts numbers only.').addClass('error');
    }
    return true;
  };
  //run error here.
  error();

  if(table === "#csv-table") {
    if(isNum) {
      var ovd_rate = $(new_data).html(),
          st_rate = $(new_data).parent().prevAll('.rate').html().replace(/[^0-9\.]/g,""),
          minus = st_rate - ovd_rate,
          percent = ( (st_rate - ovd_rate) / st_rate) * 100;
      if(st_rate.length > 0) {
        $(new_data).parent().next('td.discount').html(percent.toFixed(2)+ "%");
      }
    }
  }
  if(table === '#project-resource-table') {
    //for now only rate-override with values into an array from the #project-resource-table.
    var RateOverride = [],
        active_modeling_tabs = $('#modeling-table tr td');
        active_modeling_tabs.removeClass('active');
        active_modeling_tabs.children('input').prop('checked', false);
      //create an array with bill rates, numbers only.
      $('td.rate-override div').map(function(index, value) {
        if($(this).text() && $.isNumeric($(this).text())) {
          return RateOverride.push($(this).text());
        }
      });
    //activate Adjusted Resource Hdr when override is entered.
    if(RateOverride.length > 0) {
      $(active_modeling_tabs[2]).addClass('active');
      $(active_modeling_tabs[2]).children('input').prop('checked', true);
    }
    else {
      $(active_modeling_tabs[1]).addClass('active');
      $(active_modeling_tabs[1]).children('input').prop('checked', true);
    }
    //formulas for the hours, rates
  }
  resourceCalculation.initResourceFormulas(new_data, table);
}