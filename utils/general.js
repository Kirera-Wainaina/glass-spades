const url = require("url");

const indexUtils = require("../index-utils");

function deleteFromRouteCache(page) {
    if (indexUtils.routeCache.has(page)) {
	indexUtils.routeCache.delete(page);
    }
}

exports.deleteFromRouteCache = deleteFromRouteCache;
