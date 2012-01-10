var purchase_controller = function(spec, my) {
    // TODO: We could create this in two parts: one for the validation, and another
    // one to plug and manage the control according to it.
    my = my || {};

    var that = spec.object || {};

    my.jobid = spec.jobid;

    // Interface is the same, the action decides to validate or purchase    
    that.purchase = function(request) {        
        Requester.jsend({
                            type: 'POST',
                            url: my.form.attr('action'),
                            data: {
                                id : request.id,
                                code : request.code,
                                quantity : request.quantity
                            },
                            success: function(data) {
                                if (data.result == true) request.success(data);
                                else request.error(data);
                            }
                        });
    };

    return that;
};

var purchase_ui = function(spec, my) {
    my = my || {};

    var that = spec.object || purchase_controller(spec,my);

    my.form = spec.form;

    my.form.find('#purchase').click(
        function() {
            my.form.children('#error').remove();
            that.purchase({
                              id: my.form.find('#id').val(),
                              code: my.form.find('#purchase_code').val(),
                              quantity: my.get_num_items(),
                              success: my.success,
                              error: my.error });
            return false;
        });

    // TODO: Do it through num_items, and then create different controllers
    // to manage them
    my.get_num_items = function() {
        return 1;        
    };

    my.success = function(data) {
        my.form.children('*:not(#success_message)').remove();
        // TODO: Maybe we can define in CSS properties like hide speed.
        my.form.children('#success_message').show().hide(2000);
    };

    my.error = function(data) {
        // TODO: On this case, show error message depending on the code.
        var error_msg = Array('<div id="error">',
                              data.msg,
                              '</div>').join('\n');
        
        my.form.append(error_msg);
    };
    
    return that;
};