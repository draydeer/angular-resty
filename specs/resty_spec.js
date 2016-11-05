
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

        it("should add valid route defined as array with only path", function () {
            var r = $resty(baseUrl, {
                'test1': ['test1/:id?di=:di']
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

        it("should add valid route defined as array with parameters", function () {
            var r = $resty(baseUrl, {
                'test1': ['test1/:id?di=:di', 'post', true, {di: 2}]
            });

            checkRouteConfiguration(
                r.compiledRoutes.test1,
                baseUrlNormalized + '/' + 'test1/!@$#id#$@!?di=!@$#di#$@!',
                true,
                true,
                {di: 2},
                'post'
            );
        });

        it("should add valid route defined as array with parameters", function () {
            var r = $resty(baseUrl, {
                'test1': ['test1/:id?di=:di', 'post', false, {di: 2}]
            });

            checkRouteConfiguration(
                r.compiledRoutes.test1,
                baseUrlNormalized + '/' + 'test1/!@$#id#$@!?di=!@$#di#$@!',
                false,
                true,
                {di: 2},
                'post'
            );
        });

        it("should add valid route defined as object with only path", function () {
            var r = $resty(baseUrl, {
                'test1': {path: 'test1/:id?di=:di'}
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

        it("should add valid route defined as object with parameters", function () {
            var r = $resty(baseUrl, {
                'test1': {path: 'test1/:id?di=:di', appendParams: true, compileStrictly: true, defaults: {di: 2}, method: 'post'}
            });

            checkRouteConfiguration(
                r.compiledRoutes.test1,
                baseUrlNormalized + '/' + 'test1/!@$#id#$@!?di=!@$#di#$@!',
                true,
                true,
                {di: 2},
                'post'
            );
        });

        it("should add valid route defined as object with parameters", function () {
            var r = $resty(baseUrl, {
                'test1': {path: 'test1/:id?di=:di', appendParams: false, compileStrictly: false, defaults: {di: 2}, method: 'post'}
            });

            checkRouteConfiguration(
                r.compiledRoutes.test1,
                baseUrlNormalized + '/' + 'test1/!@$#id#$@!?di=!@$#di#$@!',
                false,
                false,
                {di: 2},
                'post'
            );
        });
    });

});
