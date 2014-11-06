describe("provider", function() {
  var provider = null;

  beforeEach(function() {
    module("Mac.Toaster", function(notificationProvider) {
      provider = notificationProvider;
    });
  });

  it("should have the options method", inject(function() {
    expect(provider.options).toBeDefined();
  }));

  it("should have default position value", inject(function() {
    expect(provider.options("position")).toBe("top right");
  }));

  it("should have default max value", inject(function() {
    expect(provider.options("max")).toBe(5);
  }));

  it("should have default delay value", inject(function() {
    expect(provider.options("delay")).toBe(4000);
  }));

  it("should update values with an object", inject(function() {
    provider.options({position: "bottom right", max: 4});
    expect(provider.options("position")).toBe("bottom right");
    expect(provider.options("max")).toBe(4);
  }));

  it("should have updated position value", inject(function() {
    provider.options("position", "bottom right");
    expect(provider.options("position")).toBe("bottom right");
  }));

  it("should have updated delay value with 0", inject(function() {
    provider.options("delay", 0);
    expect(provider.options("delay")).toBe(0);
  }));

  it("should have updated max value with false", inject(function() {
    provider.options("delay", false);
    expect(provider.options("delay")).toBe(false);
  }));

  it("should have updated category value with 'SampleCategory'", inject(function() {
    provider.options("category", 'SampleCategory');
    expect(provider.options("category")).toBe('SampleCategory');
  }));
});
