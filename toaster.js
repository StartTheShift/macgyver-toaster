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
    var config, self;

    self = this;
    config = {
      template:
        '<div class="mac-toasters">' +
          '<div class="mac-toaster animates" ' +
               'ng-repeat="notification in notifications">' +
            '<div ng-class="notification.type" class="mac-toaster-content">' +
              '<div class="mac-toaster-icon">' +
                '<i ng-class="notification.type" class="icon"></i>' +
              '</div>' +
              '<div class="mac-toaster-message" ' +
                   'ng-switch="notification.messages.length">' +
                '<div ng-switch-when="1">' +
                  '{{ notification.messages[0] }}' +
                '</div>' +
                '<div ng-switch-default>' +
                  '<span class="notification-count">' +
                    '{{notification.messages.length}} {{notification.type}}s ' +
                  '</span>' +
                  '<span class="notification-collapse">collapse</span>' +
                '</div>' +
              '</div>' +
              '<div ng-if="notification.messages.length > 1" ' +
                   'class="notication-aggregate">' +
                '<div ng-repeat="message in notification.messages track by $index">' +
                  '{{message}}' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<i ng-click="close($index)" class="icon x"></i>' +
          '</div>' +
        '</div>',
      position: "top right",
      max: 5,
      delay: 4000,
      agg_margin: 50,
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
        var notifications, toastersScope, toastersElement, styles = {},
          deferred_notifications = [], defer_call_id = null, positions, i;

        positions = config.position.split(" ");

        // Create an isolated scope for all the toaster notifications
        toastersScope = $rootScope.$new(true);
        angular.extend(toastersScope, {
          notifications: [],
          close: function(index) {
            close(index);
          }
        });

        /**
         * @function
         * @name defer
         * @description
         * Proxy method to show, deferring the show calls after current JS
         * thread ends.
         * @param {String} type    Message type
         * @param {String} message Message content
         * @param {Object} options Showing toaster options
         */

        function defer(){
          deferred_notifications.push(arguments);
          if(defer_call_id === null){
            defer_call_id = $timeout(flushQueue, 0);
          }
        }

        /**
         * @function
         * @name flushQueue
         * @description
         * Renders all the deferred notifications in the queue.
         */

        function flushQueue(){
          while(deferred_notifications.length){
            show.apply(self, deferred_notifications.shift());
          }
          defer_call_id = null;
        }

        /**
         * @function
         * @name clearQueue
         * @description
         * Clears all the deferred notifications in the queue.
         */

        function clearQueue(){
          deferred_notifications.length = 0;
          $timeout.cancel(defer_call_id);
          defer_call_id = null;
        }

        /**
         * @function
         * @name show
         * @description
         * Showing certain type of message
         * @param {String} type    Message type
         * @param {String} message Message content
         * @param {Object} options Showing toaster options
         */

        function show(type, message, options) {
          var new_notification;
          var notifications = toastersScope.notifications;
          var timestamp = options.timestamp || new Date().getTime();

          // Default to empty object
          if (options === null) {
            options = {};
          }

          opts = angular.extend({}, config, options);

          if (options.deferred === true){
            options.deferred = false;
            return defer.apply(self, arguments);
          }

          for (var i = 0; i < notifications.length; i++){
            var notification = notifications[i];
            if(notification.type === type &&
               notification.timestamp - config.agg_margin < timestamp &&
               notification.timestamp + config.agg_margin > timestamp){
              notification.messages.push(message);
              // extend the pop promise delay if any
              if(notification.promise){
                $timeout.cancel(notification.promise);
                notification.promise = $timeout(deferred_pop(notification),
                  opts.delay);
              }
              return;
            }
          }

          new_notification = {
            type: type,
            messages: [message],
            options: opts,
            timestamp: timestamp,
            promise: null
          };

          // If there are more notifications than max, pop the first one
          if (opts.max && notifications.length >= opts.max) {
            notifications.shift();
          }

          if (opts.delay > 0) {
            new_notification.promise = $timeout(deferred_pop(new_notification),
              opts.delay);
          }

          notifications.push(new_notification);
        };

       /**
        * @function
        * @name deferred_pop
        * @description
        * Callback constructor to pop a notification from the stack
        * @param {Object} notification to remove
        */

        function deferred_pop(notification){
          return function(){
            var index;
            index = toastersScope.notifications.indexOf(notification);
            if (index > -1) {
              toastersScope.notifications.splice(index, 1);
            }
          }
        }

       /**
        * @function
        * @name error
        * @description
        * Shortcut function for showing error type
        * @param {String} message Alert message
        * @param {Object} options Additional options
        */

        function error(message, options) {
          this.show.call(this, "error", message, angular.extend({}, config.error, options));
        };

        /**
         * @function
         * @name success
         * @description
         * Shortcut function for showing success type
         * @param {String} message Alert message
         * @param {Object} options Additional options
         */

        function success(message, options) {
          this.show.call(this, "success", message, angular.extend({}, config.success, options));
        };

        /**
         * @function
         * @name notice
         * @description
         * Shortcut function fow showing notice type
         * @param {String} message Alert message
         * @param {Object} options Additional options
         */

        function notice(message, options) {
          this.show.call(this, "notice", message, angular.extend({}, config.notice, options));
        };

        /**
         * @function
         * @name close
         * @description
         * Remove the notification.
         * @param {index} index of the notification in the notifications stack
         */

        function close(index) {
          var notification = toastersScope.notifications[index];
          if (notification.promise) {
            $timeout.cancel(notification.promise);
          }
          toastersScope.notifications.splice(index, 1);
        };

        toastersElement = $compile(config.template)(toastersScope);

        $animate.enter(toastersElement, angular.element(document.body));

        return {
          'show': show,
          'defer': defer,
          'flushQueue': flushQueue,
          'clearQueue': clearQueue,
          'error': error,
          'success': success,
          'notice': notice,
          'close': close
        };
      }
    ];
  });
