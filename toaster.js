/**
 * @chalk
 * @name MacGyver Toaster
 * @description
 * A notification module in the form of a toaster.
 * The `Mac.Toaster` module comes with a `notification` provider for configuration
 * and a `notification` service for showing and hiding notifications
 *
 * @param {String} template Toasters template
 * @param {String} position Toasters position (default "top right")
 * @param {Integer} max     Maximum number of notifications (default 5)
 *                          If maximum number is set to false, there is no limit
 * @param {Integer} delay   Closing delay (default 4000)
 *                          Setting delay to 0 with make toaster persist until user click
 *
 */

angular.module("Mac.Toaster", []).
  provider("notification", function() {
    var config, self, notification_index;

    notification_hash = {};

    self = this;
    config = {
      template: "<div class=\"mac-toasters\"><div class=\"mac-toaster animates\" ng-repeat=\"notification in notifications\">" +
        "<div ng-class=\"notification.type\" class=\"mac-toaster-content\">" +
        "<div ng-if=\"notification.count > 1\" class=\"mac-toaster-count\"> {{notification.count}} </div>" +
        "<div class=\"mac-toaster-icon\"><i ng-class=\"notification.type\" class=\"icon\"></i></div>" +
        "<div class=\"mac-toaster-message\">" +
          "<div ng-repeat=\"message in notification.messages\"> {{message}} <hr ng-if=\"!$last\"> </div>" +
        "</div>" +
        "<i ng-click=\"close($index)\" class=\"icon x\"></i>" +
        "</div></div>",
      position: "top right",
      max: 5,
      delay: 4000,
      success: {},
      error: {},
      notice: {}
    };

    this.options = function(key, value){
      if (angular.isObject(key)) {
        angular.forEach(key, function(value, key){
          self.options(key, value);
        });
      } else if (key && value === undefined) {
        return config[key];
      } else {
        config[key] = value;
      }
    };

    this.$get = [
      "$animate",
      "$compile",
      "$rootScope",
      "$timeout",
      function ($animate, $compile, $rootScope, $timeout) {
        var notifications, show, error, success, notice, close, toasterScope, toastersElement,
            styles = {}, positions, i;

        positions = config.position.split(" ");

        // Create an isolate scope for all the toaster notifications
        toastersScope = $rootScope.$new(true);
        angular.extend(toastersScope, {
          notifications: [],
          close: function(index) {
            close(index);
          }
        });

        /**
         * @chalk
         * @function
         * @name show
         * @description
         * Showing certain type of message
         * @param {String} type    Message type
         * @param {String} message Message content
         * @param {Object} options Showing toaster options
         */

        /**
         * @chalk
         * @function
         * @name error
         * @description
         * Shortcut function for showing error type
         * @param {String} message Alert message
         * @param {Object} options Additional options
         */

         /**
          * @chalk
          * @function
          * @name success
          * @description
          * Shortcut function for showing success type
          * @param {String} message Alert message
          * @param {Object} options Additional options
          */

         /**
          * @chalk
          * @function
          * @name notice
          * @description
          * Shortcut function fow showing notice type
          * @param {String} message Alert message
          * @param {Object} options Additional options
          */

        show = function(type, message, options) {
          var new_notification, notification_index, message_index, short_key, long_key;

          // Default to empty object
          if (options === null) {
            options = {};
          }

          opts = angular.extend({}, config, options);

          // If there are more notifications than max, pop the first one
          if (opts.max && toastersScope.notifications.length >= opts.max) {
            toastersScope.notifications.shift();
          }

          // if a category is provided then we want to aggregate toasts
          if (options.category) {
            // a short key represents an aggregation of different messages
            // belonging to the same category
            short_key = [type, options.category].join('|');

            // a long key represents an aggregation of the same message
            // in the same category
            long_key = [type, options.category, message].join('|');
          }

          // there is an existing aggregation with the same message in the
          // same category as the new notification
          if (long_key && long_key in notification_hash) {
              notification_index = toastersScope.notifications.indexOf(notification_hash[long_key]);
              notification_hash[long_key].count += 1;
              toastersScope.notifications.splice(notification_index, 1);
              toastersScope.notifications.push(notification_hash[long_key]);

            }
            // there is an existing aggregation in the same category
            else if (short_key && short_key in notification_hash) {
              var messages = notification_hash[short_key].messages;

              // if the message exists in the aggregated category we
              // will take it out and make it its own notification with
              // a count of 2
              if (messages.indexOf(message) > -1) {
                message_index = messages.indexOf(message);

                messages.splice(message_index, 1);

                // if there is no more messages left in the aggregated
                // category delete the notification
                if (messages.length === 0)  {
                  message_index = toastersScope.notifications.indexOf(notification_hash[short_key]);
                  toastersScope.notifications.splice(message_index, 1);
                  delete notification_hash[short_key];
                }

                new_notification = {
                  type: type,
                  messages: [message],
                  options: opts,
                  promise: null,
                  count: 2,
                  key: long_key
                };

                toastersScope.notifications.push(new_notification);
                notification_hash[long_key] = new_notification;
              }
              // add the new message before the existing messages
              else {
                messages.unshift(message);
              }
            }
            // create a new notification if there is no aggregation possible
            // including notifications with no category defined
            else {
              new_notification = {
                type: type,
                messages: [message],
                options: opts,
                promise: null,
                count: 1,
              };

              toastersScope.notifications.push(new_notification);

              // only add to hash if aggregation is allowed (category is provided)
              if (options.category){
                new_notification.key = short_key;
                notification_hash[short_key] = new_notification;
              }
            }
          // set the auto-close delay if provided
          if (opts.delay > 0) {
            new_notification.promise = $timeout(function() {
              var index;
              index = toastersScope.notifications.indexOf(new_notification);

              // decrement notification count if possible
              if (new_notification.count > 1) {
                new_notification.count -= 1;
              }
              // if the count is 0 then close the notification
              else if (index > -1) {
                toastersScope.notifications.splice(index, 1);
              }

            }, opts.delay);
          }

        };

        error = function(message, options) {
          this.show.call(this, "error", message, angular.extend({}, config.error, options));
        };

        success = function(message, options) {
          this.show.call(this, "success", message, angular.extend({}, config.success, options));
        };

        notice = function(message, options) {
          this.show.call(this, "notice", message, angular.extend({}, config.notice, options));
        };

        close = function(index) {
          var notification = toastersScope.notifications[index];

          if (notification.promise) {
            $timeout.cancel(notification.promise);
          }

          toastersScope.notifications.splice(index, 1);
          delete notification_hash[notification.key];
        };

        toastersElement = $compile(config.template)(toastersScope);

        $animate.enter(toastersElement, angular.element(document.body));

        return {
          show: show,
          error: error,
          success: success,
          notice: notice,
          close: close
        };
      }
    ];
  });
