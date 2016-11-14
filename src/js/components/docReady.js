(function () {
  jQuery(function () {

    $.getJSON( "/data/gw_client_data.json", function( data ) {
     var items = [];
     $.each( data.d.results, function( key, val ) {
        for (var key in val) {
          if(typeof val[key] === 'object') {
            for(var key_2 in val[key] ) {
              items.push( "<li class='" + key_2 + "'>" + '<span>' + key_2 + ': </span>' + val[key][key_2] + "</li>" );
            }
          } else {
            items.push( "<li class='" + key + "'>" + '<span>' + key + ': </span>' + val[key] + "</li>" );
          }

        }
      });

     if($("#json_data").length > 0) {
        $( "<ul/>", {
          "class": "data-list",
          html: items.join( "" )
        }).appendTo( "#json_data" );
      }
    });

    // ShowHide Tabs init
    fadeTabs.initFadeTabs();


    // // Disable function future use
    // jQuery.fn.extend({
    //     disable: function(state) {
    //         return this.each(function() {
    //             this.disabled = state;
    //         });
    //     }
    // });

    // // Disabled with:
    // $('input[type="submit"], input[type="button"], button').disable(true);

    // // Enabled with:
    // $('input[type="submit"], input[type="button"], button').disable(false);


    // $('button').prop('disabled', false);
  });

})(jQuery);
