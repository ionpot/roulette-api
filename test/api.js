"use strict";

var A = require("assert");

var R = require("utils/readable");
var W = require("utils/writable");

var sut = require("../lib/router.js");

function makeReq(method, url, head, body) {
	var req = R.create(body || "");

	req.method = method;
	req.url = url;
	req.headers = head || {};

	req._dump = function () {
		return;
	};

	return req;
}

function validReq(method, url, obj) {
	var head = {};
	var body = obj
		? JSON.stringify(obj)
		: "";

	if (body) {
		head["content-length"] = Buffer.byteLength(body);
		head["content-type"] = "application/json";
	}

	return makeReq(method, url, head, body);
}

function GET(url) {
	return makeReq("GET", url);
}

function POST(url, obj) {
	return validReq("POST", url, obj);
}

function makeRes(done) {
	var res = W.create();
	var actual = {};

	res.writeHead = function (code, head) {
		actual.code = code;
		actual.head = head;
	};

	res.on("finish", function () {
		actual.body = res.out;

		done(actual);
	});

	return res;
}

function emptyRes(scode, done) {
	return makeRes(function (res) {
		A.strictEqual(res.code, scode);

		done();
	});
}

function jsonRes(scode, done) {
	return makeRes(function (res) {
		var head = res.head;

		A.strictEqual(res.code, scode);
		A.strictEqual(head["content-type"], "application/json");
		A.ok(head["content-length"] > 0);

		done(JSON.parse(res.body));
	});
}

function sendEmpty(req, scode, done) {
	var res = emptyRes(scode, done);

	sut(req, res);
}

function sendOk(req, done) {
	var res = jsonRes(200, done);

	sut(req, res);
}

function sendErr(req, done) {
	var res = jsonRes(422, done);

	sut(req, res);
}

function newRoom(done) {
	var req = POST("/");

	sendOk(req, done);
}

suite("API");

test("501 HEAD", function (done) {
	this.timeout(500);

	var req = makeReq("HEAD", "/");

	sendEmpty(req, 501, done);
});

test("501 PUT", function (done) {
	this.timeout(500);

	var req = makeReq("PUT", "/");

	sendEmpty(req, 501, done);
});

test("501 DELETE", function (done) {
	this.timeout(500);

	var req = makeReq("DELETE", "/");

	sendEmpty(req, 501, done);
});

test("501 OPTIONS", function (done) {
	this.timeout(500);

	var req = makeReq("OPTIONS", "/");

	sendEmpty(req, 501, done);
});

test("404 GET", function (done) {
	this.timeout(500);

	var req = makeReq("GET", "/invalid-path");

	sendEmpty(req, 404, done);
});

test("404 POST", function (done) {
	this.timeout(500);

	var req = makeReq("POST", "/invalid-path");

	sendEmpty(req, 404, done);
});

test("POST / defaults", function (done) {
	this.timeout(500);

	var req = POST("/");

	sendOk(req, function (body) {
		A.strictEqual(typeof body.number, "number");
		A.strictEqual(body.duration, 20);
		A.strictEqual(body.maxRounds, 5);

		done();
	});
});

test("POST / settings", function (done) {
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

test("GET /", function (done) {
	this.timeout(500);

	var req = POST("/");

	sendOk(req, function (room) {
		req = GET("/");

		sendOk(req, function (arr) {
			A.ok(Array.isArray(arr));
			A.ok(arr.indexOf(room.number) >= 0);

			done();
		});
	});
});

test("GET /state", function (done) {
	this.timeout(500);

	newRoom(function (room) {
		var req = GET("/state/" + room.number);

		sendOk(req, function (state) {
			A.strictEqual(state.round, 1);
			A.strictEqual(state.maxRounds, room.maxRounds);
			A.strictEqual(state.duration, room.duration);
			A.ok(state.remaining <= (room.duration * 1000));

			done();
		});
	});
});

test("GET /state/invalid", function (done) {
	this.timeout(500);

	var req = GET("/state/invalid");

	sendErr(req, function (err) {
		A.strictEqual(err.code, 1);
		A.strictEqual(typeof err.text, "string");

		done();
	});
});

test("POST /join", function (done) {
	this.timeout(500);

	newRoom(function (room) {
		var req = POST("/join/" + room.number);

		sendOk(req, function (info) {
			A.strictEqual(typeof info.id, "string");
			A.strictEqual(info.id.length, 64);
			A.strictEqual(typeof info.remaining, "number");

			done();
		});
	});
});

test("POST /join/invalid", function (done) {
	this.timeout(500);

	var req = POST("/join/invalid");

	sendErr(req, function (err) {
		A.strictEqual(err.code, 1);
		A.strictEqual(typeof err.text, "string");

		done();
	});
});
