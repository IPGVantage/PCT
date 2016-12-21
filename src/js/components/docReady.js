(function ($) {
  $(function () {
    var path = window.location.pathname;
    path = path.split("/");

    //if form to be loaded exists.
    if($("form.project-info").length > 0) {
      loadJSON.initJSON("/data/OfficeCollection.json", "/data/EmployeeCollection.json");
    }
    //Show Hide elements
    showHide.initShowHide();

    //Enable submit when fileds are filled.
    if($('form.login').length > 0) {
      fillForm.initFillForm('.login');
    }
    if($('form.register').length > 0) {
      fillForm.initFillForm('.register');
    }
    if($('form.forgotpassword').length > 0) {
      fillForm.initFillForm('.forgotpassword');
    }
    if($('form.form-edit-profile').length > 0) {
      fillForm.initFillForm('.form-edit-profile');
    }
    //show in-place form.
    editProfileForm.initEditProfileForm('form.form-edit-profile');

    //drop-down selects and buttons.
    dropDown.initDropDown('[data-toggle]');

    //floating label in the input fields.
    floatLabel.initfloatLabel();

    addRemoveFields.initAddRemoveFields('.project-info');

    progressNav.initProgressNav('#progress-navigation');

    //calendars
    $( ".datepicker" ).datepicker({
      onSelect: function(dateText, instance) {
        projectDuration.initProjectDuration('.project-info', instance, dateText);
        floatLabel.initfloatLabel();
      }
    });

    activeTable.initActiveTable();
    //upload CSV for the user
    loadCustomBillSheet.initLoadCustomBillSheet();

  });

}( jQuery ));
