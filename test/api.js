"use strict";

var A = require("assert");

var R = require("utils/readable");
var W = require("utils/writable");

var sut = require("../lib/router.js");

function makeReq(method, url, obj) {
	var body = obj ? JSON.stringify(obj) : "";
	var req = R.create(body);
	var hdr = {};

	if (body) {
		hdr["content-length"] = Buffer.byteLength(body);
		hdr["content-type"] = "application/json";
	}

	req.method = method;
	req.url = url;
	req.headers = hdr;

	return req;
}

function GET(url) {
	return makeReq("GET", url);
}

function POST(url, obj) {
	return makeReq("POST", url, obj);
}

function send(expectedStatusCode, req, done) {
	var res = W.create();
	var head = {};

	res.writeHead = function (code, hdr) {
		head.code = code;
		head.type = hdr["content-type"];
	};

	res.on("end", function () {
		A.strictEqual(head.code, expectedStatusCode);
		A.strictEqual(head.type, "application/json");

		done(JSON.parse(res.out));
	});

	sut(req, res);
}

function sendOk(req, done) {
	send(200, req, done);
}

function sendErr(req, done) {
	send(422, req, done);
}

suite("API");

test("create room defaults", function (done) {
	this.timeout(500);

	var req = POST("/");

	sendOk(req, function (body) {
		A.strictEqual(typeof body.number, "number");
		A.strictEqual(body.duration, 20);
		A.strictEqual(body.maxRounds, 5);

		done();
	});
});

test("create room settings", function (done) {
	this.timeout(500);

	var obj = {
		duration: 10,
		maxRounds: 10
	};
	var req = POST("/", obj);

	sendOk(req, function (body) {
		A.strictEqual(typeof body.number, "number");
		A.strictEqual(body.duration, obj.duration);
		A.strictEqual(body.maxRounds, obj.maxRounds);

		done();
	});
});
