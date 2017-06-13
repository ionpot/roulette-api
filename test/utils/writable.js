"use strict";

var A = require("assert");

var SUT = require("utils/writable");

suite("Utils - Writable");

test("ok", function (done) {
	this.timeout(500);

	var sut = SUT.create();

	sut.write("Testing");
	sut.write(" writable");
	sut.end(" stream.");

	sut.on("finish", function () {
		A.strictEqual(sut.out, "Testing writable stream.");

		done();
	});
});
