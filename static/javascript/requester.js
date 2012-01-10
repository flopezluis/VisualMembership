var Requester = function() {
    var error = function(data) {
        // TODO: Do this through an overlay.
        // TODO: Maybe we can even connect different show methods
        // through an external object that gets called. This way with
        // the same object we can have different notification methods. 
        alert("An error occurred sending your request. Please try again later");
    };
    var success = function(data) {        
    };
    var complete = function(data) {        
    };
    
    return {
        send: function(params) {
            // Adds the layer for the functions inside the control            
            var request = $.extend({}, params, {
                         success: function(data) {
                             if(params.success){
                                 params.success(data);
                             }
                             success(data);
                         },
                         error: function(data) {
                             if(params.error) {
                                 params.error(data);
                             }
                             error(data);
                         },
                         complete: function(data) {
                             if (params.complete) {
                                 params.complete(JSON.parse(data.response));
                             }
                             complete(data);
                         }
                     });
            
            $.ajax(request);
        },        
        jsend: function(params) {        
            $.extend(params,
                     {
                         data: JSON.stringify(params.data),
                         dataType: 'json',
                         contentType: 'application/json: charset=utf-8'                     
                     });

            // console.log(params);            
            this.send(params);        

        }
    };
    
}();