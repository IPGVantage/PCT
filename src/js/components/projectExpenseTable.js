/**
* @module Draw Data Table for Expense page.
* @version
*/
var expenseTable = (function ($) {
  'use strict';

  function initExpenseTable() {

    var Deliverable = [],
        table = $('#project-expense-table');

    var projExpenseTable = table.DataTable({
      // "dom":'<tip>',
      "searching": false,
      "ajax" : {
         "url": get_data_feed( feeds.projectDeliverables ),
         "dataSrc": "d.results"
       },
      "paging": false,
      "stateSave": true,
      "info": false,
      "length": false,
      "bFilter": false,
      "select": true,
      "ordering" : false,
      "columnDefs": [ {
        "orderable": false,
        "targets": [ 0, 1 ],
      } ],
      "columns": [{
          "title": 'Row',
          "sClass": "center",
          "defaultContent": '',
          "render": function (data, type, row, meta) {
            return meta.row + 1;
          }
        },
        {
          "title" : '<i class="fa fa-trash"></i>',
          "sClass": "center blue-bg",
          "targets": [1],
          "data": null,
          "defaultContent":'<a href=" " class="remove"><i class="fa fa-trash"></i></a>',
        },
        {
          "title": 'Deliverable / Work&nbsp;Stream',
          "data": "DelvDesc",
          "render": function ( data, type, set, meta ) {
            var output = '<select class="deliverable">';
            output += '</select>';
            return output;
          }
        },
        {
          "title": "Category",
          "data": "",
          "defaultContent": '',
          "render": function(data) {
            return "<div contenteditable />" ;
          }
        },
        {
          "title": "Description",
          "data": "",
          "defaultContent": '',
          "render": function(data) {
            return "<div contenteditable />" ;
          }
        },
        {
          "title": "Amount",
          "data": "",
          "defaultContent": '',
          "render": function(data) {
            return "<div contenteditable />" ;
          }
        },
      ],
      "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $(nRow).removeClass('odd even');
        $("td:last-child", nRow).addClass('amount num');
        $("td:nth-child(n+4)", nRow)
        // .prop('contenteditable', true)
        .addClass("contenteditable");
      },
      // TODO working on grouping the rows
      "fnInitComplete": function (nRow, data) {
        nRow.aoData.map(function(val, key) {
          Deliverable.push($('<option>', { value :key }).text(val._aData.DelvDesc));
        });
        $('.deliverable').empty().append(Deliverable);
      },
    "bDestroy": true,
  });

    //add row
  $('.project-expense').on( 'click', '#add-row', function (e) {
    e.preventDefault();

    projExpenseTable.rows().nodes().to$().removeClass( 'new-row' );

    var rowNode = projExpenseTable.row.add([]).order( [[ 2, 'asc' ]] ).draw(false).node();
    $('.deliverable').empty().append(Deliverable);
    $('#project-expense-table tr:last-child').addClass('new-row');
  });
  //remove row
  $('#project-expense-table tbody').on( 'click', '.remove', function (e) {
    e.preventDefault();
    projExpenseTable.row( $(this).parents('tr') ).remove().draw(false);
  });
  }
  return {
    initExpenseTable:initExpenseTable
  };

})($);
