/**
 * @module Uploads CSV comma delimetered document into a Client Rate Card.
 * @version
 */
var loadCustomBillSheet = (function ($) {
  'use strict';

  function initLoadCustomBillSheet() {
    var csv_table = $("#csv-table");
    // get user profile

    if (!getParameterByName('CardID')) {
      var pProfile = new Promise(function (resolve, reject) {
        $.getJSON(get_data_feed(feeds.employee), function (employees) {
          resolve(employees.d.results[0].Office);
        }).fail(function () {
          console.log("unable to find user profile.");
          reject("error. cant load profile");
        });
      }).then(function (Office) {
        return new Promise(function (resolve, reject) {
          $.getJSON(get_data_feed(feeds.rateCards, Office), function (rcs) {
            var rateCards = rcs.d.results.filter(function (rc) {
              return rc.Office === Office && rc.EmpGradeName;
            });

            var uniqRcs = {};
            rateCards.forEach(function (rc) {
              uniqRcs[rc.EmpGrade] = rc;
            });

            uniqRcs = Object.values(uniqRcs).map(function (obj) {
              return {
                TitleDesc: obj.EmpGradeName,
                TitleId: obj.EmpGrade,
                Class: obj.Class,
                StandardRate: obj.BillRate,
                Currency: obj.LocalCurrency,
                DiscountPer: ''
              };
            }).sort(function (a, b) {
              return (a.TitleDesc > b.TitleDesc) ? 1 : ((b.TitleDesc > a.TitleDesc) ? -1 : 0);
            });
            resolve(uniqRcs);
          }).fail(function () {
            console.log("unable to find user rcs.");
            reject("error. cant load profile");
          });
        });
      }).then(function (res) {
        populateTable(res, false);
      });
    }
    else {
      var rcs = new Promise(function (resolve, reject) {
        // we have a card we are trying to Edit
        var BillsheetId = getParameterByName('CardID');
        $.getJSON(get_data_feed(feeds.billSheet, BillsheetId), function (plan) {
          console.log(plan);
          var rcs = plan.d.results.filter(function (val) {
            return val.BillsheetId === BillsheetId;
          });
          console.log(rcs);
          resolve(rcs);
        }).fail(function () {
          // not found, but lets fix this and return empty set
          console.log('no custom bill sheet found.... returning empty set');
          resolve([]);
        });

      });

      Promise.all([rcs]).then(function (values) {
        populateTable(values[0], false);
      });
    }

    function populateTable(rows, isUploaded) {
      console.log(rows);
      var columns;
      if (isUploaded) {
        columns = [
          {
            name: "Title",
            title: "Title"
          },
          {
            name: "TitleId",
            visible: false,
            title: "TitleId"
          },
          {
            name: "Class",
            title: "Class"
          },
          {
            name: "StandardRate",
            title: "Standard Rate"
          },
          {
            name: "Currency",
            defaultContent: "USD",
            title: "Currency"
          },
          {
            name: "OverrideRate",
            title: "Upload / Override",
            defaultContent: "<div contenteditable></div>",
            render: function (data, type, row) {
              if (data) {
                return "<div contenteditable>" + data + "</div>";
              }
            }
          },
          {
            name: "Discount",
            title: "Discount"
          }
        ];
      }
      else {
        columns = [
          {
            name: "Title",
            data: "TitleDesc",
            title: "Title"
          },
          {
            name: "Title Id",
            data: "TitleId",
            visible: true,
            title: "Title Id"
          },
          {
            name: "Class",
            data: "Class",
            title: "Class"
          },
          {
            name: "StandardRate",
            data: "StandardRate",
            title: "Rate"
          },
          {
            name: "Currency",
            defaultContent: "USD",
            title: "Currency"
          },
          {
            name: "OverrideRate",
            data: "OverrideRate",
            title: "Upload / Override",
            defaultContent: "<div contenteditable></div>",
            render: function (data, type, row) {
              if (parseFloat(data)) {
                return "<div contenteditable>" + data + "</div>";
              }
            }
          },
          {
            data: "DiscountPer",
            title: "Discount"
          }
        ];
      }
      csv_table.dataTable({
        dom: '<tip>',
        data: rows,
        select: {
          items: 'cells',
          info: false
        },
        searching: false,
        paging: false,
        length: false,
        order: [[0, 'asc']],
        columns: columns,
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
          $(nRow).removeClass('odd even');
          $("td:nth-child(n+6):not(:last-child)", nRow)
            .addClass("contenteditable");
          $("td:nth-child(4)", nRow).addClass('rate num');
          $("td:nth-child(7)", nRow).addClass('discount num');
          $("td:nth-child(6)", nRow).addClass('rate-override num');

          //Calculate percentage for the discount.
          $("td:nth-child(6) div", nRow).on('keyup focusout', function (e) {
            if ($.isNumeric($(e.target).text()) && $(e.target).text().length > 0) {
              var ovd_rate = $(e.target).text(),
                st_rate = $(e.target).parent().prevAll('.rate').text().replace(/[^0-9\.]/g, ""),
                minus = st_rate - ovd_rate,
                percent = ( (st_rate - ovd_rate) / st_rate) * 100;
              $(e.target).parent().next('.discount').html(percent.toFixed(2) + "%");
            }
            else {
              $(e.target).parent().next('.discount').empty();
            }
          });
        },
        bDestroy: true
      });
    }

    function uploadCSV(data) {
      var newlines = /\r|\n/.exec(data);

      if (newlines) {
        var rows = data.split(/\n/),
          titles = '';
        //get titles from the Excel sheet
        for (var i = rows.length - 1; i >= 1; i--) {
          if (rows[0].indexOf(',') != -1) {
            titles = rows[0].split(/","/g);

            if ($.trim(titles[0]) === "Title") {
              //get titles from the Excel.
              titles[0] = titles[0].replace(/"/g, ",");
              titles[titles.length - 1] = titles[titles.length - 1].replace(/"/g, ",");
            }
          }
        }
        rows = rows.map(function (row, index) {
          var columns = row.split('","');
          columns[0] = columns[0].replace(/"/g, "");
          columns[columns.length - 1] = columns[columns.length - 1].replace(/"/g, " ");
          return columns;
        });

        //remove the row with titles from the table
        if ($.trim(rows["0"]["0"]) === 'Title') {
          rows.shift();
        }
        populateTable(rows, true);
      }
    }

    $('#downloadTemplate').on('click', function(e){
        csv_table.tableToCSV();
    });

    // Upload CSV into a table.
    $("#uploadTable").on('click', function (event, opt_startByte, opt_stopByte) {
      console.log(this);
      $("input[type=\"file\"]").trigger('click', function () {
        event.stopPropagation();
      });

      $("input[type=\"file\"]").on('change', function (evt) {

        var files = evt.target.files,
          file = files[0],
          file_name = file.name,
          start = parseInt(opt_startByte) || 0,
          stop = parseInt(opt_stopByte) || file.size - 1,
          reader = new FileReader();

        reader.onloadend = function (event) {
          if (event.target.readyState == FileReader.DONE) {
            uploadCSV(event.target.result);
          }
        };
        var blob = file.slice(start, stop + 1);

        reader.readAsBinaryString(blob);
        $('#bill-sheet-name').val(file_name.slice(0, -4));
      });
      event.stopPropagation();
    });

    $('#DeleteCustomBillSheet').on('click', function () {
      var confirmDelete = confirm("Are you sure you want to delete this Custom Rate Card?");
      if (confirmDelete) {
        console.log("deleting this sheet");
        deleteBillSheet();
      }
    });

    $('.custom-bill-sheet #btn-save').on('click', function (event) {
      event.preventDefault();
      console.log("saving form");

      var payloads = buildBillSheetPayload();
      $.ajaxBatch({
        url: '/sap/opu/odata/sap/ZUX_PCT_SRV/$batch',
        data: payloads,
        complete: function (xhr, status, data) {
          console.log(data);
          var timeout = getParameterByName('timeout');
          console.log("navigating to new window in" + timeout + "seconds");
          timeout = timeout ? timeout : 1;
          setTimeout(function () {
            // where do they go after they save a sheet?
            //window.location.href = $('#btn-save').attr('href');
          }, timeout);
        },
        always: function (xhr, status, data) {
          var timeout = getParameterByName('timeout');
          console.log("navigating to new window in" + timeout + "seconds");
          timeout = timeout ? timeout : 1;
          setTimeout(function () {
            //window.location.href = $('#btn-save').attr('href');
          }, timeout);
        }
      });
    });

    function buildBillSheetPayload() {
      var csv_table = $("#csv-table").DataTable();
      var rows = csv_table.rows();
      var payloads = [];
      var rowIndex = 1;

      var bsId = getParameterByName('CardID');
      bsId = bsId ? bsId : get_unique_id();

      for (var i = 0; i < rows.context[0].aoData.length; i++) {
        var hoursPerRow = 0;
        var cells = $(rows.context[0].aoData[i].anCells);
        console.log(cells);
        var rowId = padNumber(rowIndex, 5);
        var StandardRate = convertToDecimal($(cells[3]).text()) ? convertToDecimal($(cells[3]).text()) : "0.0";
        var OverrideRate = convertToDecimal($(cells[5]).text()) ? convertToDecimal($(cells[5]).text()) : "0.0";
        var DiscountPer = convertToDecimal($(cells[6]).text()) ? convertToDecimal($(cells[6]).text()) : "0.0";

        payloads.push({
          type: 'POST',
          url: '/sap/opu/odata/sap/ZUX_PCT_SRV/BillSheetCollection',
          data: {
            "__metadata": {
              "id": "https://fioridev.interpublic.com/sap/opu/odata/sap/ZUX_PCT_SRV/BillSheetCollection(BillsheetId='" + bsId + "',RowId='" + rowId + "')",
              "uri": "https://fioridev.interpublic.com/sap/opu/odata/sap/ZUX_PCT_SRV/BillSheetCollection(BillsheetId='" + bsId + "',RowId='" + rowId + "')",
              "type": "ZUX_EMPLOYEE_DETAILS_SRV.BillsheetDetails"
            },
            "Class": $(cells[2]).text(),
            "BillsheetId": bsId,
            "BillsheetName": $('#bill-sheet-name').val(),
            "RowId": rowId,
            "TitleId": $(cells[1]).text(),
            "TitleDesc": $(cells[0]).text(),
            "StandardRate": StandardRate,
            "OverrideRate": OverrideRate,
            "DiscountPer": DiscountPer
          }
        });
        rowIndex++;
      }
      return payloads;
    }
  }

  function deleteBillSheet() {
    var bsId = getParameterByName('CardID');

    var deletePayloads = [];
    for (var i = 1; i <= $("#csv-table tbody tr").length; i++) {
      var rowId = padNumber(i, 5);
      var targetUrl = "/sap/opu/odata/sap/ZUX_PCT_SRV/BillSheetCollection(BillsheetId='" + bsId + "',RowId='" + rowId + "')";
      // just make sure we don't keep adding the delete payloads.
      deletePayloads.push({
        type: 'DELETE',
        url: targetUrl
      });
    }

    $.ajaxBatch({
      url: '/sap/opu/odata/sap/ZUX_PCT_SRV/$batch',
      data: deletePayloads,
      complete: function (xhr, status, data) {
        console.log(data);
        var timeout = getParameterByName('timeout');
        console.log("navigating to new window in" + timeout + "seconds");
        timeout = timeout ? timeout : 1;
        setTimeout(function () {
          window.location.href = 'customBillSheet.htm';
        }, timeout);
      },
      always: function (xhr, status, data) {
        var timeout = getParameterByName('timeout');
        console.log("navigating to new window in" + timeout + "seconds");
        timeout = timeout ? timeout : 1;
        setTimeout(function () {
          window.location.href = 'customBillSheet.htm';
        }, timeout);
      }
    });
  }

  return {
    initLoadCustomBillSheet: initLoadCustomBillSheet
  };
})($);
