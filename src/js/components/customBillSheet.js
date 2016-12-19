/**
* @module DropDown selects.
* @version
*/
var loadCustomBillSheet = (function ($) {
  'use strict';

  function initLoadCustomBillSheet() {

    var csv_table = $("#csv-table"),
        new_table = $('#new-table');

    function uploadCSV(data) {

      var rows = data.split("\n");

      rows = rows.map(function(row) {
        var columns = row.split(/","/g);
        columns[0] =  columns[0].replace( /"/g, " " );
        columns[columns.length-1] = columns[columns.length-1].replace( /"/g, " " );
        return columns;
      });

      csv_table.dataTable({
        dom:'<tip>',
        data: rows,
        select: {
          items: 'cells',
          info: false
        },
        searching: false,
        paging: true,
        length: false,
        columns: [
          { title: "Project Name" },
          { title: "Billing Office" },
          { title: "Ext. Start" },
          { title: "Duration" },
          { title: "Total Budget" }
        ],
        "bDestroy": true,
         "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            $("td", nRow).prop('contenteditable', true);
            $("td:eq(2)").addClass('datepicker');
            $('#new-table_wrapper').addClass('hide');
            this.removeClass('hide');
         },
      });
    }

    $('.arrowpointer').on('click', function(){
      if(new_table.length > 0) {
        new_table.tableToCSV();
      } else {
        csv_table.tableToCSV();
      }
    });
    // insert into div
    $("#populateTable").on('click', function(opt_startByte, opt_stopByte, e) {

        $("input[type=\"file\"]").trigger('click', function() {});

        $("input[type=\"file\"]").on('change', function(evt) {

          var files = evt.target.files,
            file = files[0],
            file_name = file.name,
            start = parseInt(opt_startByte) || 0,
            stop = parseInt(opt_stopByte) || file.size - 1,
            reader = new FileReader();

          reader.onloadend = function(event) {
            if (event.target.readyState == FileReader.DONE) { // DONE == 2
              uploadCSV(event.target.result);
            }
          };
            var blob = file.slice(start, stop + 1);
              reader.readAsBinaryString(blob);
            $('#bill-sheet-name').val(file_name.slice(0,-4));
        });
    });


    $('#downloadTemplate').on('click', function() {
      new_table.dataTable({
        dom:'<tip>',
        "paging":   false,
        "ordering": false,
        "info":     false,
        stateSave: true,
        "order": [[ 1, 'asc' ]],
        "columnDefs": [{
          "targets": -1,
          "searchable": false,
          "data": null,
          "defaultContent": "<button>Click!</button>"
        }],
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
           $("td", nRow).prop('contenteditable', true);
           this.removeClass('hide');
           $('#csv-table_wrapper').addClass('hide');
        },
        "bDestroy": true,
      });
    });
  }

  return {
    initLoadCustomBillSheet:initLoadCustomBillSheet
  }

})($);
