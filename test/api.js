"use strict";

var A = require("utils/assert");
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
		A.eq(res.code, scode);

		done();
	});
}

function jsonRes(scode, done) {
	return makeRes(function (res) {
		var head = res.head;

		A.eq(res.code, scode);
		A.eq(head["content-type"], "application/json");
		A.ok(head["content-length"] > 0);

		done(JSON.parse(res.body));
	});
}

function sendOk(req, done) {
	var res = jsonRes(200, done);

	sut(req, res);
}

function sendErr(req, done) {
	var res = jsonRes(422, done);

	sut(req, res);
}

function checkHttpErr(code, req, done) {
	var res = emptyRes(code, done);

	sut(req, res);
}

function checkApiErr(code, req, done) {
	sendErr(req, function (res) {
		A.eq(res.code, code);
		A.isStr(res.text);

		done();
	});
}

function newRoom(done) {
	var req = POST("/", {
		maxRounds: 1,
		duration: 1
	});

	sendOk(req, done);
}

function joinRoom(done) {
	newRoom(function (room) {
		var req = POST("/join/" + room.number);

		sendOk(req, function (player) {
			done(player, room);
		});
	});
}

suite("API");

test("501 HEAD", function (done) {
	this.timeout(500);

	var req = makeReq("HEAD", "/");

	checkHttpErr(501, req, done);
});

test("501 PUT", function (done) {
	this.timeout(500);

	var req = makeReq("PUT", "/");

	checkHttpErr(501, req, done);
});

test("501 DELETE", function (done) {
	this.timeout(500);

	var req = makeReq("DELETE", "/");

	checkHttpErr(501, req, done);
});

test("501 OPTIONS", function (done) {
	this.timeout(500);

	var req = makeReq("OPTIONS", "/");

	checkHttpErr(501, req, done);
});

test("404 GET", function (done) {
	this.timeout(500);

	var req = makeReq("GET", "/invalid-path");

	checkHttpErr(404, req, done);
});

test("404 POST", function (done) {
	this.timeout(500);

	var req = makeReq("POST", "/invalid-path");

	checkHttpErr(404, req, done);
});

test("POST / defaults", function (done) {
	this.timeout(500);

	var req = POST("/");

	sendOk(req, function (body) {
		A.isNum(body.number);
		A.eq(body.duration, 20);
		A.eq(body.maxRounds, 5);

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
		A.isNum(body.number);
		A.eq(body.duration, obj.duration);
		A.eq(body.maxRounds, obj.maxRounds);

		done();
	});
});

test("GET /", function (done) {
	this.timeout(500);

	var req = POST("/");

	sendOk(req, function (room) {
		req = GET("/");

		sendOk(req, function (arr) {
			A.isArr(arr);
			A.has(room.number, arr);

			done();
		});
	});
});

test("GET /state", function (done) {
	this.timeout(500);

	newRoom(function (room) {
		var req = GET("/state/" + room.number);

		sendOk(req, function (state) {
			A.eq(state.round, 1);
			A.eq(state.maxRounds, room.maxRounds);
			A.eq(state.duration, room.duration);
			A.ok(state.remaining <= (room.duration * 1000));

			done();
		});
	});
});

test("GET /state/invalid", function (done) {
	this.timeout(500);

	var req = GET("/state/invalid");

	checkApiErr(1, req, done);
});

test("POST /join", function (done) {
	this.timeout(500);

	newRoom(function (room) {
		var req = POST("/join/" + room.number);

		sendOk(req, function (info) {
			A.isStr(info.id);
			A.eq(info.id.length, 64);
			A.isNum(info.remaining);

			done();
		});
	});
});

test("POST /join/invalid", function (done) {
	this.timeout(500);

	var req = POST("/join/invalid");

	checkApiErr(1, req, done);
});

test("POST /bet", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: player.id,
			amount: 10,
			numbers: [-1, 0, 36, 37]
		});

		sendOk(req, function (res) {
			A.eq(res.amount, 10);
			A.eq(res.numbers.length, 2);
			A.eq(res.numbers[0], 0);
			A.eq(res.numbers[1], 36);

			done();
		});
	});
});

test("POST /bet invalid room", function (done) {
	this.timeout(500);

	var req = POST("/bet/invalid");

	checkApiErr(1, req, done);
});

test("POST /bet invalid id", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: 0,
			amount: 10,
			numbers: [1]
		});

		checkApiErr(2, req, done);
	});
});

test("POST /bet empty json", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {});

		checkApiErr(2, req, done);
	});
});

test("POST /bet missing id", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			amount: 10,
			numbers: [1]
		});

		checkApiErr(2, req, done);
	});
});

test("POST /bet missing amount", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: player.id,
			numbers: [1]
		});

		checkHttpErr(400, req, done);
	});
});

test("POST /bet missing numbers", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: player.id,
			amount: 10
		});

		checkHttpErr(400, req, done);
	});
});

test("POST /bet invalid numbers only", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: player.id,
			numbers: [-2, 41]
		});

		checkHttpErr(400, req, done);
	});
});

test("POST 411", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = makeReq("POST", "/bet/" + room.number);

		checkHttpErr(411, req, done);
	});
});

test("POST 413", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = makeReq("POST", "/bet/" + room.number, {
			"content-length": 1001
		});

		checkHttpErr(413, req, done);
	});
});

test("POST 415", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = makeReq("POST", "/bet/" + room.number, {
			"content-length": 1,
			"content-type": "text/plain"

		}, "a");

		checkHttpErr(415, req, done);
	});
});

test("POST /ready invalid room", function (done) {
	this.timeout(500);

	var req = POST("/ready/invalid");

	checkApiErr(1, req, done);
});

test("POST /ready invalid id", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/ready/" + room.number, {
			id: 1
		});

		checkApiErr(2, req, done);
	});
});

test("POST /ready no bets", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		var req = POST("/ready/" + room.number, {
			id: player.id
		});

		checkApiErr(3, req, done);
	});
});

test("POST /ready", function (done) {
	this.timeout(1500);

	joinRoom(function (player, room) {
		var req = POST("/bet/" + room.number, {
			id: player.id,
			amount: 20,
			numbers: [1]
		});

		sendOk(req, function () {
			var a, b;

			function check() {
				if (a && b) {
					A.eq(a.outcome, b.outcome);
					A.eq(a.amount, b.amount);
					A.eq(a.won, b.won);
					A.eq(a.lost, b.lost);

					done();
				}
			}

			req = POST("/ready/" + room.number, {
				id: player.id
			});

			sendOk(req, function (res) {
				A.isNum(res.outcome);
				A.isNum(res.amount);
				A.isNum(res.won);
				A.isNum(res.lost);

				a = res;

				check();
			});

			sendOk(req, function (res) {
				A.isNum(res.outcome);
				A.isNum(res.amount);
				A.isNum(res.won);
				A.isNum(res.lost);

				b = res;

				check();
			});
		});
	});
});

test("POST /ready player committed", function (done) {
	this.timeout(500);

	joinRoom(function (player, room) {
		function breq() {
			return POST("/bet/" + room.number, {
				id: player.id,
				amount: 10,
				numbers: [2]
			});
		}

		sendOk(breq(), function () {
			var req = POST("/ready/" + room.number, {
				id: player.id
			});

			sendOk(req, function () {
				return;
			});

			checkApiErr(3, breq(), done);
		});
	});
});
