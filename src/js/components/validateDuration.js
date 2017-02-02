/**
* @module Tabs called from showLogin.js
* @version
*/

var validateDurationPlanBy = (function ($) {
  'use strict';

  function initValidateDurationPlanBy() {

    function validatePlanBy() {
       $("form.project-info select[name='planby']").on('change', function(event) {
        var planby = $(this).val();
        if($("form.project-info input[name='duration']").hasClass('error')) {
          $("form.project-info input[name='duration']").val('').removeClass('error');
        }
        compare_plan_duration(planby, $("form.project-info input[name='duration']").val().replace(/\D/g, ''));
      });
    }

    function validateDuration() {
       $("form.project-info input[name='duration']").on('change keyup', function(event) {
        var duration = $(this).val().replace(/\D/g, '');
        compare_plan_duration($("form.project-info select[name='planby']").val(), duration);
      });
    }

    function compare_plan_duration(planby, duration) {
      if(planby === 'Weekly' && duration > 52) {
        $("form.project-info input[name='duration']").val('Please enter less then 52 weeks.').addClass('error');
      }
      if(planby === 'Monthly' && duration > 24) {
         $("form.project-info input[name='duration']").val('Please enter less then 24 months.').addClass('error');
      }
    }
    validatePlanBy();
    validateDuration();
  }

  return {
    initValidateDurationPlanBy:initValidateDurationPlanBy
  };

})($);