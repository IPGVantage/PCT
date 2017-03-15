/**
 * @module Draw Data Table for Preoject Resource page.
 * @version
 */

var projectSummary = (function ($) {
  'use strict';

  var projectId = getParameterByName('projID');

  function initProjectSummary() {

    var p1 = new Promise(function (resolve, reject) {
      $.getJSON(get_data_feed(feeds.project, projectId), function (projects) {
        resolve(projects.d.results.find(filterByProjectId, projectId));
      });
    });

    var p2 = new Promise(function (resolve, reject) {
      $.getJSON(get_data_feed(feeds.projectDeliverables, projectId), function (projectDeliverables) {
        resolve(projectDeliverables.d.results.filter(filterByProjectId, projectId));
      });
    });

    var p3 = new Promise(function (resolve, reject) {
      $.getJSON(get_data_feed(feeds.marginModeling, projectId, ' '), function (marginModeling) {
        resolve(marginModeling.d.results.filter(filterByProjectId, projectId));
      });
    });

    var p4 = new Promise(function (resolve, reject) {
      $.getJSON(get_data_feed(feeds.projectResources, projectId), function (projectResources) {
        resolve(projectResources.d.results.filter(filterByProjectId, projectId));
      });
    });

    var p5 = new Promise(function (resolve, reject) {
      $.getJSON(get_data_feed(feeds.projectExpenses, projectId), function (projectExpenses) {
        resolve(projectExpenses.d.results.filter(filterByProjectId, projectId));
      });
    });

    function loadRateCardFromServer(OfficeId) {
      return new Promise(function (resolve, reject) {
        //console.log('RateCard Not found. checking service for OfficeId' + OfficeId);
        $.getJSON(get_data_feed(feeds.rateCards, OfficeId), function (rateCards) {
          var rcs = rateCards.d.results.filter(function (val) {
            // add in any filtering params if we need them in the future
            return parseInt(val.CostRate) > 0 && val.EmpGradeName;
          });

          var rc = {
            OfficeId: OfficeId,
            rateCards: rateCards.d.results
          };

          resolve(rc);
        }).fail(function () {
          // not found, but lets fix this and return empty set
          console.log('no rate cards found.... returning empty set');
          resolve([]);
        });
      });
    }

    var p6 = Promise.resolve(p4)
      .then(function (resources) {
        var promiseArray = [];
        var officeIds = {};
        resources.forEach(function (val) {
          if (!officeIds[val.Officeid]) {
            officeIds[val.Officeid] = true;
            promiseArray.push(loadRateCardFromServer(val.Officeid));
          }
        });
        return Promise.all(promiseArray)
          .then(function (rateCards) {
            console.log("rateCard with associated offices are loaded");
            return rateCards;
          });
      });

    Promise.all([p1, p2, p3, p4, p5, p6]).then(function (values) {
      var projectInfo = values[0];
      var projectDeliverables = values[1];
      var marginModeling = values[2];
      var projectResources = values[3];
      var projectExpenses = values[4];
      var rateCards = values[5];

      fillProjectInfoSummary(projectInfo);

      var selectedModel = marginModeling.find(function (val) {
        return val.Selected === '1';
      });

      if(selectedModel.ModelType !== 'FFT' && selectedModel.ModelType !== 'TMBF'){
        // apply either the ARBF or SRBF
        if(selectedModel.ModelType === 'SRBF'){
          // return SRBF model instead
          var arbfModel = marginModeling.find(function (val) {
            return val.ModelType === 'ARBF';
          });

          if(parseFloat(arbfModel.Fees) > 0){
            selectedModel = arbfModel;
          }
        }
      }

      if(projectResources.length) {
        financialSummaryTable(projectInfo, selectedModel, projectResources, projectExpenses);
      }

      summaryDeliverablesTable.initSummaryDeliverablesTable(projectInfo, projectDeliverables, projectResources, projectExpenses, selectedModel);
      summaryOfficeTable.initSummaryOfficeTable(projectInfo, projectResources, rateCards, selectedModel);
      summaryRoleTable.initSummaryRoleTable(projectInfo, projectResources, rateCards, selectedModel);
    });
  }

  function fillProjectInfoSummary(projectInfo) {
    currencyStyles.initCurrencyStyles(projectInfo.Currency);
    $('#client-name').text(projectInfo.Clientname);
    $('#country').text(projectInfo.Region);
    $('#office').text(projectInfo.Office);
    $('#project-name').text(projectInfo.Projname);
    $('#start-date').text(calcPrettyDate(projectInfo.EstStDate));
    $('#duration').text(projectInfo.Duration);
    $('#comp-type').text(projectInfo.Comptyp);
    $('#rate-card').text(projectInfo.BillsheetId);
    $('textarea[name="comments"]').text(projectInfo.Comments);
  }

  function financialSummaryTable(projectInfo, selectedModel, projectResources, projectExpenses) {
    var totalExpenses = projectExpenses.reduce(function (acc, val) {
      return acc + parseFloat(val.Amount);
    }, 0);

    var totalFees;
    var contributionMargin;

    // do math based on the selected model tab..
    if (selectedModel) {
      totalFees = selectedModel.Fees;
      contributionMargin = selectedModel.CtrMargin;
    }

    var budget = parseFloat(totalFees) + totalExpenses;

    var resourceTotalHours = projectResources.reduce(function (acc, val) {
      return parseFloat(acc) + parseFloat(val.TotalHrs);
    }, 0);

    var netRevenue = budget - totalExpenses;
    var blendedAvg = netRevenue / resourceTotalHours;
    var oopFees = totalExpenses / totalFees;
    if (totalFees <= 0) {
      oopFees = 0;
    }

    var class_name = (contributionMargin > 65) ? "high-value" : "low-value";

    // budget = ARBF or SRBF + Expenses
    $('#total-budget').text(convertToDollar(projectInfo.Currency, budget));
    $('#expenses').text(convertToDollar(projectInfo.Currency, totalExpenses)).addClass("low-value");
    $('#net-revenue').text(convertToDollar(projectInfo.Currency, netRevenue));

    $('#contribution-margin').text(contributionMargin + '%').addClass(class_name);

    $('#oop-fees').text(oopFees.toFixed(2) + "%");
    $('#total-hours').text(resourceTotalHours);
    $('#avg-rate').text(convertToDollar(projectInfo.Currency, blendedAvg));

  }

  return {
    initProjectSummary: initProjectSummary
  };
})($);
