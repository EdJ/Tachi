var cookie = require('../Utilities/cookie');

AuthHandler = module.exports = (function () {

    var authenticatedUsers = {};

    var cookieKey = "_ta";

    var isAuthenticated = function (controller) {
        var req = (controller || {}).Request;

        if (!req) {
            return false;
        }

        var cookies = cookie.get(req);

        var key = cookies[cookieKey];

        if (!key) {
            return false;
        }

        return isValidAuthentication(key);
    };

    var isValidAuthentication = function (id) {
        var date = authenticatedUsers[id];

        if (!date) {
            return false;
        }

        return date > new Date();
    };

    var addAuthenticatedUser = function (id) {
        var date = new Date();
        date.setHours(date.getHours() + 1);

        authenticatedUsers[id] = date;
    };

    var authenticate = function (controller) {
        var res = (controller || {}).Response;
        if (!res) {
            return false;
        }

        var key = new Date() - 1;

        key = key.toString();

        addAuthenticatedUser(key);

        var newCookies = {};
        newCookies[cookieKey] = key + ';path=/;HttpOnly';

        cookie.set(res, newCookies);
    };

    return {
        isAuthenticated: isAuthenticated,
        authenticate: authenticate
    };

})();