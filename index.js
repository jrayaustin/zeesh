
'use strict';

var zmq = require( 'zmq' );
var _ = require( 'highland' );
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;

var Zeesh = function( opts ) {
  var self = this;
  opts = opts || {};
  this._host = opts.host || '127.0.0.1';
  this._port = opts.port || 3000;
  var endpoint = 'tcp://' + this._host + ':' + this._port;
  this._sub = zmq.socket( 'pull' );
  this._subscriptions = {};
  this._stream = _();
  this._initStream();
  this._shouldFork = false;
  return this;
};

util.inherits( Zeesh, EventEmitter );

Zeesh.prototype._initStream = function() {
  var self = this;
  this._sub.on('message', function(msg){
    self._stream.write( msg );
  });
};

Zeesh.prototype.connect = function() {
  var endpoint = 'tcp://' + this._host + ':' + this._port;
  this._sub.connect( endpoint );
  this.emit( 'ready' );
  return this;
};

Zeesh.prototype.stream = function() {
  var self = this;
  if ( this._shouldFork ) {
    return this._stream.fork();
  } else {
    this._shouldFork = true;
    return this._stream;
  }
};

Zeesh.prototype.refresh = function() {
  this._stream.destroy();
  this._initStream();
};

Zeesh.prototype.end = function() {
  this._sub.close();
};


module.exports = Zeesh;
