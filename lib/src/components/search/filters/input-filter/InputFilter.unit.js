"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var _this = this;
var React = require("react");
var enzyme_1 = require("enzyme");
var InputFilter_1 = require("./InputFilter");
var core_1 = require("../../../../core");
var bem = require("bem-cn");
var TestHelpers_1 = require("../../../__test__/TestHelpers");
var ui_1 = require("../../../ui");
var sinon = require("sinon");
var omit = require("lodash/omit");
describe("InputFilter tests", function () {
    beforeEach(function () {
        _this.searchkit = core_1.SearchkitManager.mock();
        spyOn(_this.searchkit, "performSearch");
        _this.searchkit.translateFunction = function (key) {
            return {
                "searchbox.placeholder": "search placeholder",
            }[key];
        };
        _this.createWrapper = function (searchOnChange, queryFields, prefixQueryFields, otherProps) {
            if (searchOnChange === void 0) { searchOnChange = false; }
            if (queryFields === void 0) { queryFields = null; }
            if (prefixQueryFields === void 0) { prefixQueryFields = null; }
            if (otherProps === void 0) { otherProps = {}; }
            _this.wrapper = enzyme_1.mount(React.createElement(InputFilter_1.InputFilter, __assign({searchkit: _this.searchkit, id: "test_id", title: "Test title", searchOnChange: searchOnChange, queryFields: queryFields, prefixQueryFields: prefixQueryFields}, otherProps)));
            _this.accessor = _this.searchkit.accessors.getAccessors()[0];
        };
        _this.setResults = function () {
            _this.searchkit.setResults({
                hits: {
                    hits: [{ _id: 1, title: 1 }, { _id: 2, title: 2 }],
                    total: 2
                }
            });
        };
        _this.setEmptyResults = function () {
            _this.searchkit.setResults({
                hits: {
                    total: 0
                }
            });
        };
        _this.typeSearch = function (value) {
            _this.wrapper.find(".sk-input-filter__text")
                .simulate("input", { target: { value: value } });
        };
    });
    it("render", function () {
        _this.createWrapper();
        expect(_this.wrapper.find(".sk-input-filter__text").get(0).placeholder).toBe("search placeholder");
    });
    it("toggles visibility", function () {
        var spy = sinon.spy();
        _this.searchkit.performSearch = spy;
        _this.createWrapper(true);
        _this.setEmptyResults();
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-panel"), "is-disabled")).toBe(true);
        _this.setResults();
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-panel"), "is-disabled")).toBe(false);
        // Don't hide if active filter
        _this.typeSearch("noresults");
        _this.setEmptyResults();
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-panel"), "is-disabled")).toBe(false);
    });
    it("should allow custom mod and className", function () {
        _this.createWrapper(false, null, null, {
            mod: "my-input", className: "my-class"
        });
        _this.setResults();
        expect(_this.wrapper.html()).toEqual(TestHelpers_1.jsxToHTML(React.createElement("div", {className: "sk-panel filter--test_id"}, React.createElement("div", {className: "sk-panel__header"}, "Test title"), React.createElement("div", {className: "sk-panel__content"}, React.createElement("div", {className: "my-input"}, React.createElement("form", null, React.createElement("div", {className: "my-input__icon"}), React.createElement("input", {type: "text", "data-qa": "input-filter", className: "my-input__text", placeholder: "search placeholder", value: ""}), React.createElement("input", {type: "submit", value: "search", className: "my-input__action", "data-qa": "submit"}), React.createElement("div", {"data-qa": "remove", className: "my-input__remove is-hidden"})))))));
    });
    it("search on change", function () {
        var spy = sinon.spy();
        _this.searchkit.performSearch = spy;
        _this.createWrapper(true);
        _this.typeSearch("m");
        expect(_this.accessor.state.getValue()).toBe("m");
        expect(spy.callCount).toBe(1);
        _this.typeSearch("ma");
        expect(_this.accessor.state.getValue()).toBe("ma");
        expect(spy.callCount).toBe(1); // throttling should block it
        _this.wrapper.node.throttledSearch.flush();
        expect(spy.callCount).toBe(2);
    });
    it("search on change with clock", function () {
        jasmine.clock().install();
        var queries = [];
        _this.searchkit.performSearch = function () {
            queries.push(_this.searchkit.buildQuery());
        };
        _this.createWrapper(true);
        expect(_this.wrapper.node.props.searchThrottleTime).toBe(200);
        _this.typeSearch("m");
        jasmine.clock().tick(100);
        expect(queries.length).toBe(1);
        expect(queries[0].getSelectedFilters()[0].value).toBe("m");
        _this.typeSearch("ma");
        jasmine.clock().tick(100);
        expect(queries.length).toBe(1);
        jasmine.clock().tick(300);
        expect(queries.length).toBe(2);
        expect(queries[1].getSelectedFilters()[0].value).toBe("ma");
        jasmine.clock().uninstall();
    });
    it("search on submit", function () {
        var spy = sinon.spy();
        _this.searchkit.performSearch = spy;
        _this.createWrapper(false);
        _this.typeSearch('m');
        _this.typeSearch('ma');
        // State left in the component
        expect(_this.accessor.state.getValue()).toBe(null);
        expect(spy.callCount).toBe(0);
        _this.wrapper.find("form").simulate("submit");
        expect(_this.accessor.state.getValue()).toBe("ma");
        expect(spy.callCount).toBe(1);
    });
    it("should have a working remove icon", function () {
        var spy = sinon.spy();
        _this.searchkit.performSearch = spy;
        _this.createWrapper(false);
        _this.setResults();
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-input-filter__remove"), "is-hidden")).toBe(true);
        _this.typeSearch('ma');
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-input-filter__remove"), "is-hidden")).toBe(false);
        expect(spy.callCount).toBe(0);
        _this.wrapper.find("form").simulate("submit");
        expect(spy.callCount).toBe(1);
        _this.wrapper.find(".sk-input-filter__remove").simulate("click");
        expect(_this.accessor.state.getValue()).toBe(null);
        expect(spy.callCount).toBe(2);
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-input-filter__remove"), "is-hidden")).toBe(true);
    });
    it("should configure accessor defaults correctly", function () {
        _this.createWrapper(false, ["title"]);
        expect(_this.accessor.key).toBe("test_id");
        var options = _this.accessor.options;
        expect(options).toEqual({
            title: "Test title",
            addToFilters: true,
            queryFields: ["title"],
            prefixQueryFields: null,
            queryOptions: {},
            prefixQueryOptions: {},
            queryBuilder: undefined,
            onQueryStateChange: jasmine.any(Function)
        });
    });
    it("should configure accessor search on change correctly", function () {
        _this.createWrapper(true, ["title"]);
        expect(_this.accessor.key).toBe("test_id");
        var options = _this.accessor.options;
        expect(options).toEqual({
            title: "Test title",
            addToFilters: true,
            prefixQueryFields: null,
            queryFields: ["title"],
            queryOptions: {},
            prefixQueryOptions: {},
            queryBuilder: undefined,
            onQueryStateChange: jasmine.any(Function)
        });
    });
    it("should configure accessor + prefix", function () {
        _this.createWrapper(true, ["title"], ["prefix"], {
            queryOptions: { minimum_should_match: "60%" },
            prefixQueryOptions: { minimum_should_match: "70%" },
            queryBuilder: core_1.QueryString
        });
        expect(_this.accessor.key).toBe("test_id");
        var options = _this.accessor.options;
        expect(options).toEqual({
            title: "Test title",
            addToFilters: true,
            queryFields: ["title"],
            prefixQueryFields: ["prefix"],
            queryOptions: { minimum_should_match: "60%" },
            prefixQueryOptions: { minimum_should_match: "70%" },
            queryBuilder: core_1.QueryString,
            onQueryStateChange: jasmine.any(Function)
        });
    });
    it("should accept Panel elements as containerComponent", function () {
        _this.createWrapper(true, ["title"], ["prefix"], {
            containerComponent: React.createElement(ui_1.Panel, {collapsable: true})
        });
        expect(TestHelpers_1.hasClass(_this.wrapper.find(".sk-panel__header"), "is-collapsable")).toBe(true);
    });
    describe("url change + blurAction", function () {
        it("blurAction:restore", function () {
            _this.createWrapper(false, ["title"], ["prefix"], {
                blurAction: "restore"
            });
            _this.typeSearch("la");
            expect(_this.wrapper.node.getValue()).toEqual("la");
            _this.accessor.fromQueryObject({
                test_id: "foo"
            });
            expect(_this.wrapper.node.getValue()).toEqual("foo");
            _this.typeSearch("bar");
            expect(_this.wrapper.node.getValue()).toEqual("bar");
            _this.wrapper.find(".sk-input-filter__text")
                .simulate("blur");
            // should be restored to previous value
            expect(_this.wrapper.node.getValue()).toEqual("foo");
            expect(_this.searchkit.performSearch).not.toHaveBeenCalled();
        });
        it("blurAction:search", function () {
            _this.createWrapper(false, ["title"], ["prefix"], {
                blurAction: "search"
            });
            _this.typeSearch("la");
            expect(_this.wrapper.node.getValue()).toEqual("la");
            _this.accessor.fromQueryObject({
                test_id: "foo"
            });
            expect(_this.wrapper.node.getValue()).toEqual("foo");
            _this.typeSearch("bar");
            expect(_this.wrapper.node.getValue()).toEqual("bar");
            _this.wrapper.find(".sk-input-filter__text")
                .simulate("blur");
            // should flush value + search
            expect(_this.wrapper.node.getValue()).toEqual("bar");
            expect(_this.searchkit.performSearch).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=InputFilter.unit.js.map