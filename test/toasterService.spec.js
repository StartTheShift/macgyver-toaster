describe("service", function() {
  var service;

  beforeEach(function() {
    module("Mac.Toaster");

    inject(function(notification) {
      service = notification;
    });

    spyOn(service, "show").and.callThrough();
  });

  it("should get the service", function() {
    expect(service).toBeDefined();
  });

  it("should append toasters element to body", function() {
    var element = document.body.querySelector(".mac-toasters");
    expect(element).toBeDefined();
  });

  it("should aggregate and track the count of identical notifications", inject(function($rootScope) {
    var sample_notifications, notifications_on_scope;

    sample_notifications = [
      { type: 'Type1', message: 'Sample message 1' },
      { type: 'Type1', message: 'Sample message 1' },
      { type: 'Type1', message: 'Sample message 1' },
    ];

    sample_notifications.forEach(function(notification) {
      service.show("generic", notification.message, { category: 'SampleCategory', delay: 0 });
    });

    notifications_on_scope = $rootScope.$$childTail.notifications;

    expect(service.show).toHaveBeenCalled();
    expect(service.show.calls.count()).toBe(3);
    expect(notifications_on_scope.length).toBe(1);
    expect(notifications_on_scope[0].count).toBe(3);
  }));

  it("should group notifications of the same category and type", inject(function($rootScope) {
    var sample_notifications, notifications_on_scope;

    sample_notifications = [
      { type: 'Type1', message: 'Sample message 1' },
      { type: 'Type1', message: 'Sample message 2' },
    ];

    sample_notifications.forEach(function(notification) {
      service.show("generic", notification.message, { category: 'SampleCategory', delay: 0 });
    });

    notifications_on_scope = $rootScope.$$childTail.notifications;

    expect(service.show).toHaveBeenCalled();
    expect(service.show.calls.count()).toBe(2);
    expect(notifications_on_scope.length).toBe(1);
    expect(notifications_on_scope[0].count).toBe(1);
    expect(notifications_on_scope[0].messages.length).toBe(2);
  }));

  describe("error", function() {
    it("should call show function", function() {
      service.error("Fail");

      expect(service.show).toHaveBeenCalledWith("error", "Fail", {});
    });

    it("should extend options correctly", function() {
      service.error("Fail", {delay: 9001});

      expect(service.show).toHaveBeenCalledWith("error", "Fail", {
        delay: 9001
      });
    });
  });

  describe("success", function() {
    it("should call show function", function() {
      service.success("SUCCESS!!!!!");

      expect(service.show).toHaveBeenCalled();
    });

    it("should extend options correctly", function() {
      service.success("IT'S WORKING", {delay: 9001});

      expect(service.show).toHaveBeenCalledWith("success", "IT'S WORKING", {
        delay: 9001
      });
    });
  });

  describe("notice", function() {
    it("should call show function", function() {
      service.notice("Good News Everyone!");

      expect(service.show).toHaveBeenCalled();
    });

    it("should extend options correctly", function() {
      service.notice("Not sure...", {delay: 9001});

      expect(service.show).toHaveBeenCalledWith("notice", "Not sure...", {
        delay: 9001
      });
    });
  });
});
