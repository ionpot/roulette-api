"use strict";

var crypto = require("crypto");

function calc(buf, count) {
	var acc = 0;

	while (count) {
		count -= 1;

		acc += buf[count];
	}

	return acc % exports.total;
}

exports.total = 37;

exports.spin = function (done) {
	var count = 64;

	crypto.randomBytes(count, function (err, buf) {
		if (!err) {
			return done(calc(buf, count));
		}

		setImmediate(function () {
			exports.spin(done);
		});
	});
};
