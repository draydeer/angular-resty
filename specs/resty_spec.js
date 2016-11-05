
const baseUrl = 'http://localhost\\:3000';

const baseUrlNormalized = baseUrl.replace('\\:', ':');

describe('Resty', function() {

    var $resty;

    beforeEach(angular.mock.module("Resty"));

    beforeEach(inject(function ($injector) {
        $resty = $injector.get("$resty");
    }));

    function checkRouteConfiguration(route, url, appendParams, compileStrictly, defaults, method) {
        expect(route instanceof $resty.Route).toBe(true);

        expect(route.getCompiledUrl()).toBe(url);

        expect(route.appendParams).toBe(appendParams);

        expect(route.compileStrictly).toBe(compileStrictly);

        expect(route.defaults).toEqual(defaults);

        expect(route.method).toBe(method);
    }

    describe("instance", function () {
        it("should be initialized with base url", function () {
            var r = $resty(baseUrl);

            expect(r.base).toEqual(baseUrl);
        });

        it("should add routes", function () {
            var r = $resty(baseUrl, {
                'test1': 'test1',
                'test2': 'test2',
                'test3': 'test3'
            });

            expect(r.compiledRoutes.test1 instanceof $resty.Route).toBe(true);

            expect(r.compiledRoutes.test2 instanceof $resty.Route).toBe(true);

            expect(r.compiledRoutes.test3 instanceof $resty.Route).toBe(true);

            /*
            var r = $resty(baseUrl, {
                'test1': 'test1/:id?:di',
                'test2': ['test2/:id?:di'],
                'test3': ['test3/:id?:di', 'post', true, {di: 2}],
                'test4': ['test4/:id?:di', 'post', false, {di: 2}],
                'test5': {route: 'test5/:id?:di'},
                'test6': {route: 'test6/:id?:di', appendParams: true, compileStrictly: true, defaults: {di: 2}, method: 'post'},
                'test7': {route: 'test7/:id?:di', appendParams: false, compileStrictly: false, defaults: {di: 2}, method: 'post'}
            });

            expect(r.compiledRoutes.test1 instanceof $resty.Route).toBe(false);
            */
        });

        it("should add valid route defined as string", function () {
            var r = $resty(baseUrl, {
                'test1': 'test1/:id?di=:di'
            });

            checkRouteConfiguration(
                r.compiledRoutes.test1,
                baseUrlNormalized + '/' + 'test1/!@$#id#$@!?di=!@$#di#$@!',
                false,
                true,
                {},
                'get'
            );
        });
    });

});
