"use strict";

function set(code) {
	return function (res) {
		res.writeHead(code);
		res.end();
	};
}

exports.notImplemented = set(501);
exports.notFound = set(404);
exports.lengthRequired = set(411);
exports.tooLarge = set(413);
exports.invalidMIME = set(415);
exports.badRequest = set(400);
