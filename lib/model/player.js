"use strict";

var hash = require("utils/hash");
var proto = require("utils/proto");

var Bets = require("./bets.js");

function Player(id) {
	this.id = id;
	this.bets = Bets.create();
	this.listeners = [];
}

proto(Player, function check(input) {
	var amount = input.amount|0;
	var nums = input.numbers;

	if (!amount) {
		return;
	}

	if (!Array.isArray(nums)) {
		return;
	}

	nums = nums.filter(Bets.isValid);

	if (nums.length) {
		return {
			amount: amount,
			numbers: nums
		};
	}

}, function place(input) {
	this.bets.place(input);

}, function hasBets() {
	return !this.bets.isEmpty();

}, function ready(done) {
	this.listeners.push(done);

}, function isReady() {
	return this.listeners.length;

}, function reset() {
	this.bets.clear();
	this.listeners = [];

}, function notify(number) {
	var out = this.bets.outcome(number);

	this.listeners.forEach(function (done) {
		done(out);
	});
});

exports.create = function (roomNo, done, fail) {
	var time = process.hrtime();
	var input = [
		roomNo,
		time[0],
		time[1]
	];

	hash.sha256(input.join("-"), function (hex) {
		done(new Player(hex));

	}, fail);
};
