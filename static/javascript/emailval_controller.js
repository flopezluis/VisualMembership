var checkemail_validation = function(spec, my) {
    my = my || {};

    var that = {};

    my.form = spec.form;
    my.input = spec.input;

    that.validate = function(on_change) {
        my.form.children('#error').remove();

        var email = my.input.val();

        var data = {};

        if (validate_email(email)) {
            data.result = true;
        }
        else {
            validation_failed();
            data.result = false;
        }

        data.id = my.form.attr('id');

        on_change(data);
    };

    var validation_failed = function() {
        var error_msg = '<div id="error"><h3 class="error">Invalid email. Please check the provided account</h3></div>';

        my.form.append(error_msg);
    };

    var validate_email = function(email) {
        var regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            
        return email.match(regexp);
    };

    return that;
};