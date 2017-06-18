"use strict";

var A = require("assert");

var R = require("utils/readable");
var W = require("utils/writable");

var sut = require("../router.js");

function makeReq(method, url, head, body) {
	var req = R.create(body || "");

	req.method = method;
	req.url = url;
	req.headers = head;

	return req;
}

function send(req, scode, done) {
	var res = W.create();
	var actual;

	res.writeHead = function (code) {
		actual = code;
	};

	res.on("finish", function () {
		A.strictEqual(actual, scode);

		done();
	});

	sut(req, res);
}

suite("Status Codes");

test("501 HEAD", function (done) {
	this.timeout(500);

	var req = makeReq("HEAD", "/");

	send(req, 501, done);
});

test("501 PUT", function (done) {
	this.timeout(500);

	var req = makeReq("PUT", "/");

	send(req, 501, done);
});

test("501 DELETE", function (done) {
	this.timeout(500);

	var req = makeReq("DELETE", "/");

	send(req, 501, done);
});

test("501 OPTIONS", function (done) {
	this.timeout(500);

	var req = makeReq("OPTIONS", "/");

	send(req, 501, done);
});

test("404 GET", function (done) {
	this.timeout(500);

	var req = makeReq("GET", "/invalid-path");

	send(req, 404, done);
});

test("404 POST", function (done) {
	this.timeout(500);

	var req = makeReq("POST", "/invalid-path");

	send(req, 404, done);
});