# Roulette API
An HTTP API implemented in Node.js, designed for private use.

## Overview
- Games take place in rooms.
- A room hosts a number of rounds with fixed durations.
- A player needs to either create or join a room in order to play.
- Bets are placed during the round.
- At the end of round, the spin occurs, and the outcome is reported separately to each player.
- Next round begins immediately.
- If it was the last round, the room is gone.
- The number of rounds and the duration are specified when creating the room.

## Usage
This is a summary, the methods are detailed in the next section.
- Send a *POST /* request to create a room. Request body can contain a JSON to specify the configuration. The response will be a JSON containing the newly created room number, along with its effective configuration.
- Send a *POST /join/{room}* request to join the room, where *{room}* is the room number. The response will contain the player id. It's only valid for this room, and must be supplied when placing bets and when comitting the bets.
- Use *POST /bet/{room}* for betting on numbers. The request must contain a list of numbers to bet on, and an amount indicating how much. This request can be made multiple times in order to place different amount on different numbers.
- When ready, use *POST /ready/{room}* to commit your bets. This is a long poll which will wait until the end of round, and is the only way to have the server process and report the player's outcome. If not called before the end of round, the player's bets are discarded.

## Error Handling
Errors fall into two categories:

### HTTP Errors
These are responses to malformed HTTP requests made to the API, in order to guard against bogus input. The numbers correspond to the HTTP status codes set for the response. Its body is empty.

- *501* for HTTP requests with methods other than GET or POST.
- *404* for HTTP requests to an invalid path.
- *411* for POST requests with a missing *Content-Length* header.
- *413* for POST requests with *Content-Length* greater than 1000.
- *415* for POST requests that do not specify the correct *Content-Type*.
- *400* for POST requests with an invalid JSON body.

### API Errors
When the request is well formed but out of place, an API error is issued. These always have the status code *422* and *Content-Type: application/json* header. Unlike the HTTP errors above, these are accompanied with a JSON body that specifies the exact issue. The JSON takes this form:
```js
{
	code: /* (number) The number in the ordered list. */,
	text: /* (string) The text part of the ordered list. */
}
```
Ordered list refers to *Errors* lists in the next section that indicate the API errors each method issues.

## The API Methods
Responses to successful requests are always set to status code *200* with *Content-Type: application/json*.

### GET /
Get the numbers of active rooms.

Response:
```js
[
	/* (number) Room numbers. */
]
```

Errors: *None.*

### GET /state/{room}
Get the current state of the room.
- **{room}** (number) Room number.

Response:
```js
{
	round: /* (number) Current round. First round is 1. */,
	duration: /* (number) Seconds each round takes. */,
	remaining: /* (number) Milliseconds left until the end of round. */,
	maxRounds: /* (number) If "round" is equal to this number, then this is the last round, and the room will close after "remaining" reaches zero. */
}
```

Errors:
1. Room doesn't exist.

### POST /
Create a new room. The request may override the default settings by providing a JSON.

Request (optional):
```js
{
	duration: /* (number) Seconds each round takes. Defaults to 20 seconds. */,
	maxRounds: /* (number) Indicates the number of rounds this room will serve. The room is discarded afterwards. Defaults to 5 rounds. */
}
```

Response:
```js
{
	number: /* (number) Number of the created room. */,
	duration: /* (number) Effective value of "roundDuration", can be checked against the requested value. */,
	maxRounds: /* (number) Effective value of "maxRounds", can be checked against the requested value. */
}
```

Errors: *None.*

### POST /join/{room}
Join a room. This generates an id required for placing bets. The id is valid for this room only.

For the purposes of having a consistent look, the id is a SHA-256 encode. It has high collision resistance, and an acceptable length.

This method asks the operating system for random bytes, which may fail in some cases, resulting in a 500 HTTP response.

- **{room}** (number) Room number.

Response:
```js
{
	id: /* (string) Generated id, will be used for placing bets. */,
	remaining: /* (number) Milliseconds until the end of round. */
}
```

Errors:
1. Room doesn't exist.

### POST /bet/{room}
Place bet. Can be called multiple times. Cannot be called after a */ready* request is made by this id, which would result in error code 3.
- **{room}** (number) Room number.

Request:
```js
{
	id: /* (string) Id of the player, obtained when joining. */,
	amount: /* (number) How much to bet. */,
	numbers: [
		/* (number) Numbers to bet on. The ones lower than 0 or higher than 36 are ignored, and won't take place in the response. */
	]
}
```

Response:
```js
{
	amount: /* (number) Effective value of "amount", can be checked against the requested value. */,
	numbers: [
		/* (number) All the valid numbers in the request. */
	]
}
```

Errors:
1. Room doesn't exist.
2. Invalid player id.
3. Player has committed.

### POST /ready/{room}
Commit the bets placed, otherwise the bets placed by this player are discarded, and the outcome for this player will not be calculated.

This request is essentially a long poll. It only gets a response when the end of round is reached, which reports the outcome.

Depending on the configuration of the room, a response might take a while. In case a network issue occurs during this period (or the client times out), making this request again before the end of round will not result in an error (assuming the player has placed bets).

- **{room}** (number) Room number.

Request:
```js
{
	id: /* (string) Id of the player, obtained when joining. */
}
```

Response:
```js
{
	outcome: /* (number) The ball ended up in this number. */,
	amount: /* (number) The amount this player placed on this number. */,
	won: /* (number) The amount won (floored). */,
	lost: /* (number) The amount lost (the total placed on other numbers). */
}
```

Errors:
1. Room doesn't exist.
2. Invalid player id.
3. No bets are placed.

## Possible Extensions
- Amount of players allowed in a room can be capped.
- Several endpoints can be introduced to allow common betting schemes.
- Rooms can impose a minimum and a maximum limit for betting amounts.
- Rooms can allocate wallets to players.
