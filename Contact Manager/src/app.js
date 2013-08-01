(function($) {


    var ContactsModel = Backbone.Model.extend({
        initialize: function() {        
            this.on("invalid", this.validationError); // if validation finds an error invalid event gets fired and it calls validationError() function
        },

        defauts: {// default values for a model
            fistName: "unknown",
            lastName: "unknown",
            address: "unknown",
            email: "unknown@unknown",
            created: "unknown"
        },
                
        validationError: function (model, errors) { 
            $(".valError").show();

          /*  $("#contactInfo form #validationError").show();
            $("#contactInfo form #validationError").empty('p'); // empty p element of errors so same errors wont append
            _.each(errors, function(el, index) { // errors list gets iterated and errors listed in <p> -tags
                $("#contactInfo form #validationError").append('<li>' + errors[index] + '</li><br>');
            });
            $("#contactInfo form #validationError").fadeOut(3000);*/
            $(".valError").fadeOut(3000);
        },
                
        validate: function(attrs) {
            var error = false;

            $("#contactInfo form #validationError").empty('p');

            if (!attrs.firstName) {     // if firstName input is empty
                $("#firstNameValError").text('Fill first name field.');
                error = true;
            }
            if (!attrs.lastName) {
                $("#lastNameValError").text('Fill last name field.');
                error = true;
            }
            if (!attrs.address) {
                $("#addressValError").text('Fill address field.');
                error = true;
            }
            if (!attrs.email) {
                $("#emailValError").text('Fill email field.');
                error = true;
            }
            else if (attrs.email.indexOf('@', 1) < 1) { // if input doesent contain @ character after first index
                $("#emailValError").text('Enter correct email address');
                error = true;
            }

            if (error) {
                return error;          // fires validationError.
            }
        }
    });

    var modelArray = []; // array where model objects get stored

    var ContactsCollection = Backbone.Collection.extend({
        model: ContactsModel, // collection is consisting of ContactsModel-models

	    search : function(letters){  
               var pattern = new RegExp(letters,"i"); // Capitalization ignored
		       return _(this.filter(function(data) {
		  	        return pattern.test(data.get($("#sortList").val())); // search uses sortlist's value 
		        }));
	    },        
                
        comparator: function(item) {                // sorts contacts automatically when added depending what sorting style is selected from sorting dopdown list
                                                    // method sort() uses comparator 
            switch ($("#sortList").val()) {         

                case 'lastName':
                    return item.get("lastName");
                break;

                case 'firstName':
                    return item.get("firstName");
                break;
                
                case 'address':
                    return item.get("address");
                break;

                case 'createdNewest':
                    return -item.get("created");
                break;

                case 'createdOldest':
                    return item.get("created");
                break;
            }
        }
    });

    var ContactsListView = Backbone.View.extend({
        el: "div#contactInfo",
        initialize: function() { // initializes ContactLisView
            if (JSON.parse(window.localStorage.getItem("contactModels")) !== null) {
                modelArray = JSON.parse(window.localStorage.getItem("contactModels"));
                this.collection = new ContactsCollection(modelArray); //instantiates a collection for view
                this.render();
            }
            else {
                this.collection = new ContactsCollection();
            }
            
            this.collection.sort();
            
            this.collection.on("add", this.renderContactsList, this); // binds a callback function to an object. The callback will be invoked whenever the event is fired
            this.collection.on("remove", this.removeContact, this);
            this.collection.on("sort", this.updateContactsView, this); // add event for sort to fire updateContactsView function
        },

        events: {
            "click #submit": "submit", // click event binded to button id=#submit. When event is fired submit function gets called
            "change #sortList": "sortContacts", // sorting is fired when dropdoen list value changes
            "keyup #searchInput": "searchContacts" // searchContacts function is fired when key is inserted in searchInput
        },

        submit: function(e) { // values from input form gets parsed to form object as firstName: "value", lastName: "value", ect
            e.preventDefault();
            
            /*var form = _.object(_.zip(["firstName", "lastName", "address", "email"],                      // another way to get values from input elements
             [$("#firstName").val(), $("#lastName").val(), $("#address").val(), $("#email").val()]));*/

            var date = new Date();
          
            var form = {                                // getting input elements to form object
                firstName: this.$("#firstName").val(),
                lastName: this.$("#lastName").val(),
                address: this.$("#address").val(),
                email: this.$("#email").val(),
                created: date.getTime()
            };
                       
            _.each(form, function(value, key, list){                    // capitalize first letters of first name, last name and address
                if(key !== 'email' && typeof value === 'string'){
                  form[key] = value.substring(0,1).toUpperCase() + value.slice(1);  
                }                    
            });
                       
            var contactsModel = new ContactsModel(); //var contactsModel = new ContactsModel(form); // model can be instanciated this way too
            contactsModel.set(form); // form parameters are set to new model

            if (contactsModel.isValid()) {  // validate model. if valid, then continue

                $("#contactInfo form").children("input").each(function(index, element) { // clearing input fields
                    $(element).val('');
                });

                this.collection.add(contactsModel); // new model is passed to collection.
                modelArray.push(form); // form object added to modelArray
                window.localStorage.setItem('contactModels', JSON.stringify(modelArray)); // modelArray saved to localStorage
            }
        },      
                
        sortContacts: function(e) {
            e.preventDefault();
            this.collection.sort(); // calls sort() methed. Sort() uses comparator defined in ContactsListView

        },

        removeContact: function(removedContact) {   // removes removed contact from modelArray
            var removedContactData = removedContact.attributes;
            _.each(modelArray, function(contact) {  
                if (_.isEqual(contact, removedContactData)) { // if removed contacts attributes match with iterated object from modelArray,
                    modelArray.splice(_.indexOf(modelArray, contact), 1); // contact model is removed from modelArray
                }
            });
        },

        searchContacts: function(e) {
            e.preventDefault();

            var letters = $("#searchInput").val();
            var result = this.collection.search(letters);
            var _this = this; 
            
            $(".contactListContainer").empty(); // empty container before adding search results in
                       
            _.each(result._wrapped, function(item) {
                _this.renderContactsList(item);
            });           
        },
        
        renderContactsList: function(item) { // creates a new contactView and appends it in contactListContainer
            var contactView = new ContactView({model: item});    // contactView is creted using the values got from input form
            $(".contactListContainer").append(contactView.render().el);
        },
                
        updateContactsView: function() {
            $(".contactListContainer").empty(); // empty old contacts before updating new ones
            this.render();
        },
                
        render: function() {    // renders every model in collection 
            var _this = this;
            _.each(this.collection.models, function(item) {
                _this.renderContactsList(item);
            });
        }

    });

    var ContactView = Backbone.View.extend({
        tagName: "div", //tag type of the template container
        className: "contactContainer", //class name of the template container
        template: $("#contactsTemplate").html(),
        events: {
            "click .delete": "removeContact"
        },

        removeContact: function(e) {
            e.preventDefault();
            this.model.destroy();
            this.remove();
            window.localStorage.setItem('contactModels', JSON.stringify(modelArray));
        },

        render: function() {
            var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html        
            this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
            return this;
        }
    });

    var contactsListView = new ContactsListView(); // creating a new contactsListView

})(jQuery);
