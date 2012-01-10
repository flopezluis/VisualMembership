var start_controller = function(spec) {
    var that = {};
    var validations = spec.validations;
    var current, ok_val, total_val, failed_val;
    
    that.start = function() {
        current = 0, ok_val = 0, failed_val = 0;
        total_val = validations.length;

        $('#start_migration').html("Please wait...");
        $('#start_migration').attr("disabled", "true");
        
        validate();
    };

    var validate = function(data) {
        validations[current].validate(update_val);   
    };

    var update_val = function(data) {
        // Called once a validation has been done    
        if (data.result == true) {
            ok_val += 1;

            if (ok_val == total_val) {
                $("#send-migration").submit();
            }
            else {
                if (current < total_val) {
                    current += 1;
                    validate();
                }
            }

        }
        else if (failed_val == 0){
            failed_val = 1;

            // In case there is a data.id that identifies the error, move there.
            if (data.id) {
                $('html, body').animate({ scrollTop: ($('#' + data.id).offset().top) - 20 }, 500);                
            }

            $('#start_migration').html("Start migration");
            $('#start_migration').removeAttr("disabled");
        
        }

    };
    
    return that;        
};

var equalfields_validator = function(spec, my) {
    my = my || {};
    // TODO: Should it be spec.data?
    my.controls = spec['controls'];
    var that = {};
        
    that.validate = function(on_change){                
        // Check data is different
        // Transform data from controls to JSON and use hash sieving
        var hash = {};
        for (var idx in my.controls) {
            var control = my.controls[idx];
            if (!control['get_data']) {
                continue;
            }
                
            var data = JSON.stringify(control.get_data()[control.process_id]);
            if ( hash[data] ){
                alert('Source and destination are the same account. Please review the data you have provided.');
                on_change( {result: false} );
                return;
            }
            else {
                hash[data] = 1;
            }
        }
        on_change( {result: true} );
    };

    return that;
};