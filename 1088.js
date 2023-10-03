function unique_name_649(form_element, via_user_submit) {
      if(this.user_decided_length) {
        var data = $(form_element).serialize();
      } else {
        var data = "length=35";
      }

      $.ajax({
        url: $(form_element).attr('action'),
        data: data,
        method: 'get',
        success: function(response_body) {
          $('pre.logs').text(response_body);
        },
        error: function(response) {
          if(via_user_submit) {
            horizon.clearErrorMessages();

            horizon.alert('error', 'There was a problem communicating with the server, please try again.');
          }
        }
      });
    }