"use strict";

function set(code) {
	return function (res) {
		res.writeHead(code);
		res.end();
	};
}

exports.badRequest = set(400);
exports.internal = set(500);
exports.invalidMIME = set(415);
exports.lengthRequired = set(411);
exports.notFound = set(404);
exports.notImplemented = set(501);
exports.tooLarge = set(413);
