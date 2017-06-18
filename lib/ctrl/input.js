"use strict";

var read = require("utils/read-incoming");

var Err = require("./error-http.js");

var maxLen = 1000;

function checkType(hdr) {
	var type = hdr["content-type"];

	return (type === "application/json");
}

function dump(req) {
	req._dump();
}

exports.parse = function (req, done) {
	var hdr = req.headers;
	var len = hdr["content-length"];
	var lenOk = (len < maxLen);

	if (checkType(hdr) && lenOk) {
		read(req, len, function (str) {
			try {
				done(JSON.parse(str));

			} catch (e) {
				done();
			}
		});

	} else {
		dump(req);

		done();
	}
};

exports.check = function (req, res, done) {
	var hdr = req.headers;
	var len = hdr["content-length"];

	if (len === undefined) {
		dump(req);

		return Err.lengthRequired(res);
	}

	if (len > maxLen) {
		dump(req);

		return Err.tooLarge(res);
	}

	if (!checkType(hdr)) {
		dump(req);

		return Err.invalidMIME(res);
	}

	read(req, len, function (str) {
		var json;

		try {
			done(JSON.parse(str));

		} catch (e) {
			Err.badRequest(res);
		}
	});
};
