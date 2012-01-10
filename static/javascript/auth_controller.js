// Maker function to use a prototypal approach.

// It didn't make sense inside a strategy, the control and strategy where together.
// There are really no patterns here, it is all JS

// It is a form control that allows to change the provider and validate it. 
// Validation is part of it, as in other controllers it might be checking some other data.
var auth_controller = function(spec, my) {
    // Inside functions this doesn't point to the object but to the global
    // so we create a that to fix "that"
    my = my || {};

    var that = spec.object || {};
    // Initialize other protected variables
    my.process = spec.form;
    my.process_id = my.process.attr('id');
    that.process_id = my.process_id;
    
    //console.log(my.process.children() );    
    my.form = my.process.children('form');
    
    my.providers = my.process.children('.list-providers');

    my.data = spec.data;
    
    that.load = function(input) {
        // Load UI, events, and validation strategy
        // console.log("Loading");
        
    };

    that.unload = function() {
        // Unload events and UI
        my.form.children('#error').remove();                    
    };    

    that.get_data = function() {        
        // Returns a variable with the content of all the fields in the UI
        // When passed this as a startup parameter, the control loads this data at startup

        var input = {};

        // Returns the provider and iterates on all the div inputs inside the form        
        var selected = my.providers.children('.selected');
        var selected_id = selected.attr('id');

        // This is the auth control, that changes depending on selection
        input['provider'] = selected_id;
          
        // Traverse all divs inside the form, and put them in a key value way
        my.form.children('div').each(function() {
                                     var id = $(this).attr('id');                                     
                                     input[id] = {};
                                     $(this).children().filter('input').each(function() {
                                                                        var child_id = $(this).attr('id');
                                                                        input[id][child_id] = $(this).val();
                                                                    });
                                     });
        
        var data = {};
        data[my.process_id] = input;

        return data;

    };
    
    that.validate = function(on_change) {
        // TODO: No provider selected
        my.form.children('#error').remove();
        
        var error_msg = Array('<div id="error">',
                              '<h3>Please select a provider</h3>',
                              '</div>').join('\n');            

        my.form.append(error_msg);
        
        var data = { 'id' : my.process_id,
            'result' : false };
        
        on_change(data);
    };

    that.change_authentication = function() {
        // Get selected item, and depends on selected and selecting class
        // to change the form's controller
        // $(this) here is the clicked element
        var clicked_class = $(this).attr('class');
        var selected = my.providers.children('.selected');
        if (selected.hasClass(clicked_class)) {
            // If they both have same class, do nothing
            return;            
        }
        
        that.unload();
        // It is a strategy pattern. So what we do is mutate the same object.
        // TODO: You are not changing it. You already returned the object 'that',
        // here you create a new one but don't change it. 
        that = auth_controllers[clicked_class]({object: that, form: my.process, data: my.data});
        
        that.load();        
    };
    
    return that;
};

var imapauth_controller = function(spec, my) {
    // The control is designed to select from a list of providers and 
    // validate the migration according to that. The list was separated
    // in another control, that in this case we can also use for a ton more stuff.
    
    // This has use even when the user needs to reinput some information,
    // to show what provider it has to be, etc...
    
    my = my || {};    
    var that = auth_controller(spec, my);

    var get_validation_data = function() {
        var input = that.get_data();

        var selected = my.providers.children('.selected');
        var selected_id = selected.attr('id');

        var validation_data = {};
        
        input = input[my.process_id];
        validation_data[my.process_id] = {'user' : {"id" : input['email-pass']['email'],
                                                    "host" : providers[selected_id]['host'] },
                                          'auth' : { "password" : input['email-pass']['password'] }
                                         };
                
        return validation_data;

    };

    var get_url = function() {
        return my.form.attr("action") + "imap";
    };
    
    that.validate = function(on_change) {
        // Remove previous errors
        my.form.children('#error').remove();
        
        var data = get_validation_data();
        // console.log(data);
        Requester.jsend({
                            type: 'POST',
                            url: get_url(),
                            data: data,
                            success: function(data) {
                                // on_change(data);
                                success(data);
                            },
                            complete: on_change
                      });
        
    };

    var success = function(data) {        
        if (data.result == false) {
            // TODO: Data Driven Design. Will also help for internationalization
            var error_msg = Array('<div id="error">',
                                  data.msg,
                                  '</div>').join('\n');            
            my.form.append(error_msg);
        }
        // In case it goes fine, we don't mark it in any way on this control
    };

    return that;
};

var google_user_controller = function(spec, my) {
    my = my || {};
    var that = auth_controller(spec, my);

    that.load = function() {
        my.form.children('#email-pass').toggle();

        var options = [];
        $.each(spec.data['google-users'], function(index, value) {
                   options.push('<option value=' + value + '>' + value + '</option>');
               } );        
        
        var control = Array('<div id="google-users">',
                            '<h2>Select a user from your domain</h2>',
                            '<select id="user" class="text-input">',
                            options,
                            '</select>',                  
                            '<span class="label">@' + spec.data['domain'] + '</span>',
                            '<div class="clear"></div>',
                            '</div>'
                           ).join('\n');

        my.form.append(control);
    };

    that.unload = function() {
        my.form.children('#google-users').remove();

        my.form.children('#email-pass').toggle();
    };

    that.get_data = function() {
        var user = my.form.find('#user').val();
        
        var validation_data = {};
        validation_data[my.process_id] = {
            'user' : user
        };

        // TODO: The provider comes from another control, it should be there
        // and not here. Here we should set a different data identifier.
        validation_data['provider'] = 'google_domain';
        return validation_data;        
    };
    
    var get_validation_data = function() {
        var user = my.form.find('#user').val();

        var validation_data = { 'id' : my.process_id,
                                'user' : user
            
                              };
        
        return validation_data;        
    };
    
    var get_url = function() {
        return my.form.attr("action") + "google/user_in_domain";
    };

    that.validate = function(on_change) {
        my.form.children("#error").remove();
        
        var data = get_validation_data();

        Requester.jsend({
                            type: 'POST',
                            url: get_url(),
                            data: data,
                            success: function(data) {
                                // on_change(data);
                                success(data);                                
                            },
                            complete: on_change
                        });
    };

    var success = function(data) {
        if (data.result == false) {
            var error_msg = Array('<div id="error">',
                                  data.msg,
                                  '</div>').join('\n');            
            my.form.append(error_msg);
        }        
    };

    return that;
};

var googleauth_controller = function(spec, my) {
    my = my || {};
    var that = auth_controller(spec, my);

    var get_validation_data = function() {
        var input = that.get_data();

        return input;        
    };
    var get_url = function() {
        return my.form.attr("action") + "google";        
    };
    
    that.validate = function(on_change) {
        var data = get_validation_data();

        // TODO: Move this to a general AJAX function where we also process "error"

        that.send_jrequest({
                               url: get_url(),
                               data: JSON.stringify(data),
                               success: success,
                               error: function(data) {
                                   // Request failure
                                   // TODO: Send error to system notifications (maybe like google errors on top)
                                   alert("error");
                               },
                               complete: function(data) { // After success and error
                                   // Call the delegates to notify change in state                       
                               }
                           });

    };

    var success = function(data) {
        alert("All good!");  
    };
    return that;
};

var customauth_controller = function(spec, my) {
    my = my || {};
    var that = auth_controller(spec, my);

    var host_input;
    
    that.load = function() {
        var provider = Array("<div id='provider'>",
                             "<p>Please enter your IMAP server information using the following format: imap://server.com or imaps://server.com if the server supports SSL. You can use an IP address instead of the server name.</p>",
                             "<input id='host' type='text' placeholder='Host' class='text-input'/>",
                             "<button type='button' id='show_hosts' class='large awesome'>",
                             "<span class='ui-icon ui-icon-triangle-1-s'></span>",
                             "</button>",
                             //"<div class='clear'></div>",
                             //"<input id='port' type='text' placeholder='Port' class='text-input'/>",
                             "</div>").join('\n');
        
        my.form.prepend(provider);
                
        my.form.find("#show_hosts").click(show_all_hosts);

        host_input = my.form.find("#host");
        
        host_input.autocomplete({
                                    source: availableTags,
                                    minLength: 0
                                });
        
        host_input.data( "autocomplete" )._renderItem = function( ul, item ) {
			            return $( "<li></li>" )
				        .data( "item.autocomplete", item )
				        .append( "<a>" + item.desc + "<br>" + item.value + "</a>" )
				        .appendTo( ul );
		               };       
    };

    that.unload = function() {
        my.form.children('#provider').remove();
        
    };

    var show_all_hosts = function() {
        if ( host_input.autocomplete("widget").is(":visible") ){
            host_input.autocomplete("close");
            return;
        }
        
        host_input.autocomplete("search", "");
        host_input.focus();
    };
    
    var get_validation_data = function() {
        var input = that.get_data();

        var validation_data = {};

        input = input[my.process_id];
        validation_data[my.process_id] = {'user' : {'id' : input['email-pass']['email'],
                                                    'host': input['provider']['host'] },
                                          'auth' : {'password' : input['email-pass']['password'] }            
                                         };
        
        return validation_data;        
    };
    var get_url = function() {
        return my.form.attr("action") + "imap";        
    };
    
    that.validate = function(on_change) {
        // Remove previous errors
        my.form.children('#error').remove();

        var data = get_validation_data();

        // TODO: Add validations, check IMAP forms, before sending...
        
        Requester.jsend({
                            type: 'POST',
                            url: get_url(),
                            data: data,
                            success: function(data) {
                                // on_change(data);
                                success(data);
                            },
                            complete: on_change
                        });

    };

    var success = function(data) {
        if (data.result == false) {
            // TODO: Data Driven Design. Will also help for internationalization
            var error_msg = Array('<div id="error">',
                                  data.msg,
                                  '</div>').join('\n');            
            my.form.append(error_msg);
        }
        // In case it goes fine, we don't mark it in any way on this control

    };

    return that;
};

var oauthauth_controller = function(spec, my) {
    my = my || {};
    var that = auth_controller(spec, my);

    var validated;
    var validated_account;
    
    that.load = function() {
        if (my.data && my.data.oauth_ui) {
            validated_account = my.data.oauth_ui.validated_account;
        }
        
        my.form.children('#email-pass').toggle();

        var not_validated_hdr = Array('<div id="oauth_header">',
                                      '<h2>and insert your e-mail</h2>',
                                      '</div>').join('\n');

        var validated_hdr = Array('<div id="oauth_header">',
                              '<h2>you have authenticated with:<strong>' + validated_account + '</strong></h2>',
                              '<h3 id="extend">Wrong account? <a>Click to start over</a></h3>',
                              '<h3 id="collapse">Right account? <a>Go back</a></h3>').join('\n');
        
        var control = Array('<div id="oauth_ui">',
                            '<input id="email" type="text" placeholder="Your email" class="text-input"/>',                            
                            '<button type="button" id="goto_google" class="large awesome blue">Log in</button>',
                            '</div>').join('\n');

        if (!validated_account) {
            my.form.append(not_validated_hdr);
            my.form.append(control);            
        }
        else {
            my.form.append(validated_hdr);
            my.form.append(control);
            my.form.find('#oauth_ui').hide();
            
            my.form.find('#collapse').hide();

            my.form.find('#collapse').click(
                function() {
                    my.form.find('#collapse').hide();
                    my.form.find('#extend').show();                   
                    my.form.find('#oauth_ui').hide('slow');
                });
            my.form.find('#extend').click(
                function() {
                    my.form.find('#collapse').show();
                    my.form.find('#extend').hide();                   
                    my.form.find('#oauth_ui').show('slow');                    
                });
        }
    };

    that.unload = function() {
        my.form.children('#oauth_header').remove();
        my.form.children('#oauth_ui').remove();
        
        
        my.form.children('#email-pass').toggle();        

    };
    
    var get_validation_data = function() {
        var input = that.get_data();

        return input;        
    };
    var get_url = function() {
        return my.form.attr("action") + "google_oauth";        
    };
    
    that.validate = function(on_change) {
        var data = get_validation_data();

        // TODO: Move this to a general AJAX function where we also process "error"
        that.send_jrequest({
                               url: get_url(),
                               data: JSON.stringify(data),
                               success: success,
                               error: function(data) {
                                   // Request failure
                                   // TODO: Send error to system notifications (maybe like google errors on top)
                                   alert("error");
                               },
                               complete: function(data) { // After success and error
                                   // Call the delegates to notify change in state                       
                               }
                           });
    };

    var success = function(data) {
        alert("All good!");  
    };
    return that;
};

var auth_controllers = {
    imap: imapauth_controller,
    google: googleauth_controller,
    oauth_google: oauthauth_controller, 
    custom: customauth_controller,
    google_domain: google_user_controller    
};

var providers = {
    prov_google: { host: 'imaps://imap.gmail.com' },
    prov_yahoo:  { host: 'imaps://imap.mail.yahoo.com' },
    prov_aol:    { host: 'imap://imap.aol.com' },
    prov_godaddy:{ host: 'imap://imap.godaddy.com' }    
};

var availableTags = [{"desc":"1&1 Exchange","value":"imaps://exchange.1and1.com"},
                     {"desc":"1&1 Mail","value":"imap://imap.1and1.com"},
                     {"desc":"AIM","value":"imap://mail.aol.com"},
                     {"desc":"AOL","value":"imap://imap.aol.com"},
                     {"desc":"AT&T Internet","value":"imap://imap.mail.yahoo.com"},
                     {"desc":"Airmail","value":"imap://pop3.airmail.net"},
                     {"desc":"Ameritech (now AT&T)","value":"imap://imap.mail.yahoo.com"},
                     {"desc":"Apple .Mac/Mobile Me","value":"imaps://mail.mac.com"},
                     {"desc":"Caltech","value":"imaps://imap-server.its.caltech.edu"},
                     {"desc":"Carnegie Mellon","value":"imaps://cyrus.andrew.cmu.edu"},
                     {"desc":"CompuServe","value":"imap://imap.cs.com"},
                     {"desc":"ExchangeMyMail (2003)","value":"imap://mail.hostedmsexchange.com"},
                     {"desc":"ExchangeMyMail (2007)","value":"imaps://mail.4emm.com"},
                     {"desc":"FastMail.FM","value":"imaps://mail.messagingengine.com"},
                     {"desc":"FuseMail","value":"imap://imap.fusemail.net"},                                          
                     {"desc":"Gmail","value":"imaps://imap.gmail.com"},
                     {"desc":"GoDaddy","value":"imaps://imap.secureserver.net"},
                     {"desc":"Google Apps","value":"imaps://imap.gmail.com"},                     
                     {"desc":"MailSP","value":"imaps://imap.mailsp.net"},
                     {"desc":"Michigan State University","value":"imaps://mail.msu.edu"},
                     {"desc":"Microsoft Live@EDU","value":"imaps://outlook.com"},
                     {"desc":"Netscape","value":"imap://mail.netscape.com"},
                     {"desc":"New York University","value":"imaps://mail.nyu.edu"},
                     {"desc":"Ohio State University","value":"imaps://imap.service.ohio-state.edu"},
                     {"desc":"Rackspace Email","value":"imaps://secure.emailsrvr.com"},
                     {"desc":"Santa Clara University","value":"imap://pop.scu.edu"},
                     {"desc":"Speakeasy","value":"imap://mail.speakeasy.net"},
                     {"desc":"Texas A&M University","value":"imaps://neo.tamu.edu"},
                     {"desc":"TrustyBox","value":"imaps://imap.emailsrvr.com"},
                     {"desc":"TuffMail","value":"imaps://mail.mxes.net"},
                     {"desc":"U of Arizona","value":"imaps://inbox.email.arizona.edu"},
                     {"desc":"U of Central Florida","value":"imap://imap.mail.ucf.edu"},
                     {"desc":"U of Florida","value":"imap://imap.ufl.edu"},
                     {"desc":"U of Michigan","value":"imaps://mail.umich.edu"},
                     {"desc":"U of North Carolina","value":"imaps://imap.unc.edu"},
                     {"desc":"U of Notre Dame","value":"imaps://imap.nd.edu"},
                     {"desc":"U of San Francisco","value":"imaps://lucas.usfca.edu"},
                     {"desc":"U of Virginia (McIntire)","value":"imap://webmail.comm.virginia.edu"},
                     {"desc":"U of Wisconsin-Madison","value":"imaps://wiscmail.wisc.edu"},
                     {"desc":"U of the Pacific","value":"imap://pop.pacific.edu"},
                     {"desc":"UC Berkeley","value":"imaps://calmail.berkeley.edu"},
                     {"desc":"UC Davis","value":"imaps://mail.ucdavis.edu"},
                     {"desc":"UC Los Angeles","value":"imaps://mail.ucla.edu"},
                     {"desc":"UC Santa Barbara","value":"imaps://incoming.umail.ucsb.edu"},
                     {"desc":"UK: BT Internet","value":"imap://imap.mail.yahoo.com"},
                     {"desc":"UNC","value":"imap://imap.unc.edu"},
                     {"desc":"USA.net","value":"imap://imap.postoffice.net"},
                     {"desc":"USC","value":"imaps://email.usc.edu"},
                     {"desc":"Vaxjo University","value":"imaps://imap.vxu.se"},
                     {"desc":"Washington State University","value":"imaps://connect.wsu.edu"},
                     {"desc":"Zenbe","value":"imaps://imap.zenbe.com"},
                     {"desc":"Zoho","value":"imaps://imap.zoho.com"},
                     {"desc":"Yahoo Mail","value":"imaps://imap.mail.yahoo.com"}];
