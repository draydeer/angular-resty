
(function (window, angular) {

    'use strict';

    var $restyMinErr = angular.$$minErr('$resty');

    angular
        .module('Resty', ['ng'])
        .factory(
            '$resty',
            [
                '$http',
                '$q',
                function ($http, $q) {
                    var noop = angular.noop;
                    var forEach = angular.forEach;
                    var extend = angular.extend;
                    var copy = angular.copy;

                    function Route(route, compileStrictly, appendParams, defaults, method) {
                        this.appendParams = appendParams === true;
                        this.compileStrictly = compileStrictly !== false;
                        this.defaults = defaults;
                        this.method = method;
                        this.route = route;

                        var match;
                        var re = /[^\\]:([\w\$]+)/g;
                        var routeParams = [];

                        while (match = re.exec(route)) {
                            routeParams.push(match[1]);
                        }

                        this.routeParams = routeParams;

                        route = route.replace(/([^\\]):([\w\$]+)/g, "$1!@$#$2#$@!").replace('\\:', ':');

                        var q = route.indexOf('?');

                        if (q !== - 1) {
                            this.url = route.substr(0, q);
                            this.q = route.substr(q + 1);
                        } else {
                            this.url = route;
                            this.q = null;
                        }
                    }

                    Route.prototype = {

                        getCompiledUrl: function () {
                            return this.q ? this.url + '?' + this.q : this.url;
                        },

                        compileQuery: function (params) {
                            var appendParams = this.appendParams;
                            var compileStrictly = this.compileStrictly;
                            var route = this.route;
                            var q = this.q;
                            var url = this.url;
                            var used = {};

                            if (angular.isObject(params)) {
                                if (this.defaults) {
                                    params = copy(params);

                                    for (var k in this.defaults) {
                                        k in params || (params[k] = this.defaults[k]);
                                    }
                                }
                            } else {
                                params = this.defaults;
                            }

                            if (angular.isObject(params)) {
                                if (url) {
                                    forEach(this.routeParams, function (v) {
                                        if (v in params && params[v] !== void 0) {
                                            url = url.replace('!@$#' + v + '#$@!', params[v] !== null ? params[v].toString() : '');

                                            used[v] = true;
                                        } else {
                                            if (compileStrictly) {
                                                throw new Error('Path parameter missing: ' + v + ' on ' + route);
                                            }
                                        }
                                    });
                                }

                                if (q) {
                                    forEach(this.routeParams, function (v) {
                                        if (v in params && params[v] !== void 0) {
                                            q = q.replace('!@$#' + v + '#$@!', params[v] !== null ? encodeURIComponent(params[v].toString()) : '');

                                            used[v] = true;
                                        } else {
                                            if (compileStrictly) {
                                                throw new Error('Path parameter missing: ' + v + ' on ' + route);
                                            }
                                        }
                                    });
                                }

                                if (appendParams) {
                                    forEach(params, function (v, k) {
                                        if (! (k in used) && v !== void 0) {
                                            q || (q = '');

                                            q = q + '&' + k + '=' + (v !== null ? encodeURIComponent(v.toString()) : '');
                                        }
                                    });
                                }
                            }

                            return q ? url + '?' + q : url;
                        },

                        delete: function (params, data, options) {
                            return $http.delete(this.compileQuery(params), extend(options || {}, {data: data}));
                        },

                        get: function (params, data, options) {
                            return $http.get(this.compileQuery(params), extend(options || {}, {data: data}));
                        },

                        head: function (params, data, options) {
                            return $http.head(this.compileQuery(params), extend(options || {}, {data: data}));
                        },

                        options: function (params, data, options) {
                            return $http.options(this.compileQuery(params), data, options);
                        },

                        patch: function (params, data, options) {
                            return $http.patch(this.compileQuery(params), data, options);
                        },

                        post: function (params, data, options) {
                            return $http.post(this.compileQuery(params), data, options);
                        },

                        put: function (params, data, options) {
                            return $http.put(this.compileQuery(params), data, options);
                        },

                        trace: function (params, data, options) {
                            return $http.trace(this.compileQuery(params), data, options);
                        }

                    };

                    function Resty(base, routes) {
                        this.base = base;
                        this.compiledRoutes = {};
                        this.defaults = {};
                        this.errorHandler = null;
                        this.onAfterRequest = null;
                        this.onBeforeRequest = null;
                        this.onRequest = null;
                        this.rawResponse = true;
                        this.responseSimpleOnce = false;
                        this.successHandler = null;

                        if (routes) {
                            this.addRoutes(routes);
                        }
                    }

                    Resty.prototype = {

                        setDefaults: function (value) {
                            this.defaults = angular.isObject(value) ? value : null;

                            return this;
                        },

                        setRawResponse: function (value) {
                            this.rawResponse = value === true;

                            return this;
                        },

                        setResponseSimpleOnce: function (value) {
                            this.responseSimpleOnce = value === true;

                            return this;
                        },

                        setErrorHandler: function (value) {
                            if (angular.isFunction(handler)) {
                                this.errorHandler = value;

                                return this;
                            }

                            throw new Error('Invalid [error] handler.');
                        },

                        setSuccessHandler: function (value) {
                            if (angular.isFunction(handler)) {
                                this.successHandler = value;

                                return this;
                            }

                            throw new Error('Invalid [success] handler.');
                        },

                        setOnAfterRequest: function (value) {
                            if (angular.isFunction(value)) {
                                this.onAfterRequest = value;

                                return this;
                            }

                            throw new Error('Invalid [on after request] handler.');
                        },

                        setOnBeforeRequest: function (handler) {
                            if (angular.isFunction(handler)) {
                                this.onBeforeRequest = handler;

                                return this;
                            }

                            throw new Error('Invalid [on before request] handler.');
                        },

                        setOnRequest: function (handler) {
                            if (angular.isFunction(handler)) {
                                this.onRequest = handler;

                                return this;
                            }

                            throw new Error('Invalid [on request] handler.');
                        },

                        /**
                         * Add routes.
                         *
                         * @param routes Routes definition set with keys as an alias of route and values as params:
                         *
                         *      "?" means an optional parameter
                         *
                         *      params as array:
                         *          [url, method?="get", append unused params flag?=false, default params?={}]
                         *
                         *          {
                         *              item: ['item/:id', 'post', true, {id: 1}]
                         *          }
                         *
                         *      params as object:
                         *          {path, appendParams?=false, compileStrictly?=true, defaults?={}, method?="get"}
                         *
                         *          {
                         *              item: {path: 'item/:id', appendParams: true, compileStrictly: true, defaults: {id: 1}, method: 'post'}
                         *          }
                         *
                         *      params as string:
                         *          [url=<string>, method="get", append unused params flag=true, default params={}]
                         *
                         *          {
                         *              item: 'item/:id'
                         *          }
                         *
                         * @returns {Resty}
                         */
                        addRoutes: function (routes) {
                            if (angular.isObject(routes)) {
                                forEach(routes, function (v, k) {
                                    var appendParams = false;
                                    var compileStrictly = true;
                                    var defaults = {};
                                    var errorHandler;
                                    var method;
                                    var route;
                                    var successHandler;

                                    if (typeof v === 'string') {
                                        method = 'get';
                                        route = this.base + '/' + v;
                                    } else {
                                        if (angular.isArray(v)) {
                                            if (v.length === 0) {
                                                throw new Error('Route is not defined: ' + k);
                                            }

                                            appendParams = v[2] === true;
                                            defaults = angular.isObject(v[3]) ? v[3] : this.defaults;
                                            method = v[1] || 'get';
                                            route = this.base + '/' + v[0];
                                        } else {
                                            appendParams = v.appendParams === true;
                                            compileStrictly = v.compileStrictly !== false;
                                            defaults = angular.isObject(v.defaults) ? v.defaults : this.defaults;
                                            method = v.method || 'get';

                                            if (v.path === void 0) {
                                                throw new Error('Route is not defined: ' + k);
                                            }

                                            route = this.base + '/' + v.path;

                                            errorHandler = angular.isFunction(v.errorHandler) ? v.errorHandler : null;

                                            successHandler = angular.isFunction(v.successHandler) ? v.successHandler : null;
                                        }
                                    }

                                    if (method in Route.prototype) {
                                        this.compiledRoutes[k] = route = new Route(
                                            route,
                                            compileStrictly,
                                            appendParams,
                                            defaults,
                                            method
                                        );

                                        routes[k] = this[k] = function (params, data, options) {
                                            var promise = $q(function (resolve, reject) {
                                                var rawResponse = this.rawResponse;

                                                var responseSimpleOnce = this.responseSimpleOnce;

                                                if (this.onBeforeRequest) {
                                                    options = this.onBeforeRequest(options);
                                                }

                                                return route[method](params, data, options).then(
                                                    function (res) {
                                                        var handler = this.successHandler || successHandler;

                                                        if (handler) {
                                                            handler(res.data, res);
                                                        }

                                                        res = rawResponse && responseSimpleOnce === false ? res : res.data;

                                                        resolve(this.onAfterRequest ? this.onAfterRequest(res) :  res);

                                                        this.responseSimpleOnce = false;
                                                    }.bind(this),
                                                    function (err) {
                                                        var handler = this.errorHandler || errorHandler;

                                                        if (handler) {
                                                            handler(err.data, err.status, err);
                                                        }

                                                        err = rawResponse && responseSimpleOnce === false ? err : err.data;

                                                        reject(err);

                                                        this.responseSimpleOnce = false;
                                                    }.bind(this)
                                                );
                                            }.bind(this));

                                            if (this.onRequest) {
                                                promise = this.onRequest(promise);
                                            }

                                            return promise;
                                        }
                                    } else {
                                        throw new Error('Http method is not defined: ' + method);
                                    }
                                }.bind(this));
                            } else {
                                throw new Error('Routes definition must be a set');
                            }

                            return this;
                        },

                        compile: function (alias, params) {
                            if (alias in this.compiledRoutes) {
                                return this.compiledRoutes[alias].compileQuery(params);
                            }

                            throw new Error('Route is not defined: ' + alias);
                        }

                    };

                    function factory(base, routes) {
                        return new Resty(base, routes);
                    }

                    factory.Resty = Resty;

                    factory.Route = Route;

                    return factory;
                }
            ]
        );

})(window, window.angular);