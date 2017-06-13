"use strict";

var A = require("assert");

var SUT = require("utils/readable");

suite("Utils - Readable");

test("ok", function (done) {
	this.timeout(500);

	var expected = "Testing readable stream.";
	var sut = SUT.create(expected);
	var actual = "";

	sut.on("data", function (chunk) {
		actual += chunk;
	});

	sut.on("end", function () {
		A.strictEqual(actual, expected);

		done();
	});
});
