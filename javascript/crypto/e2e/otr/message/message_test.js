// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Tests for the Message superclass.
 *
 * @author rcc@google.com (Ryan Chan)
 */

goog.require('e2e.otr');
goog.require('e2e.otr.Serializable');
goog.require('e2e.otr.constants');
goog.require('e2e.otr.error.ParseError');
goog.require('e2e.otr.message.Message');
goog.require('e2e.otr.testing');
goog.require('goog.crypt.base64');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');

goog.setTestOnly();


var constants = e2e.otr.constants;
var stubs = null;
var error = e2e.otr.error;


var msgImpl = function(sender, receiver, content) {
  goog.base(this, sender, receiver);
  this.content_ = content;
};
goog.inherits(msgImpl, e2e.otr.message.Message);

/** set type */
msgImpl.MESSAGE_TYPE = e2e.otr.constants.MessageType.DATA;

/** set empty process fn */
msgImpl.process = goog.nullFunction;

/** @return {!Uint8Array} */
msgImpl.prototype.serializeMessageContent = function() {
  return e2e.otr.concat([new Uint8Array([this.content_.length]),
      this.content_]);
};

function setUp() {
  stubs = new goog.testing.PropertyReplacer();
}

function tearDown() {
  stubs.reset();
}

function testConstructor() {
  var construct = function(opt_sender, opt_receiver, opt_data) {
    return function() {
      new msgImpl(opt_sender || new Uint8Array([1, 2, 3, 4]),
          opt_receiver || new Uint8Array([5, 6, 7, 8]),
          opt_data || new Uint8Array([9, 10]));
    };
  };

  stubs.remove(msgImpl, 'MESSAGE_TYPE');
  assertThrows(construct());
  stubs.reset();

  stubs.remove(msgImpl, 'process');
  assertThrows(construct());
  stubs.reset();

  stubs.setPath('msgImpl.MESSAGE_TYPE', new Uint8Array([.5]));
  assertThrows(construct());
  stubs.reset();

  assertThrows(construct([0, 0, 0, 0]));

  assertThrows(construct([0, 0, 0, 0xFF]));

  assertNotThrows(construct([0, 0, 1, 0]));

  assertNotThrows(construct(null, [0, 0, 0, 0]));

  assertThrows(construct(null, [0, 0, 0, 0xFF]));

  assertNotThrows(construct(null, [0, 0, 1, 0]));

  assertTrue(e2e.otr.implementationof(msgImpl, e2e.otr.Serializable));
}

function testSerialize() {
  // TODO(user): allow other versions.
  var msg = new msgImpl(new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]), new Uint8Array([9, 10]));
  assertUint8ArrayEquals([0x00, 0x03, msgImpl.MESSAGE_TYPE[0],
      1, 2, 3, 4, 5, 6, 7, 8, 2, 9, 10], msg.serialize());
}

function testProcess() {
  var process = e2e.otr.message.Message.process;
  assertThrows(goog.partial(process, null, [1]));
  assertTrue(assertThrows(goog.partial(process, null, new Uint8Array(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))) instanceof error.ParseError);

  var fakeSession = {};
  // Sample DATA message generated by pidgin-otr 4.0.0
  stubs.setPath('otr.message.handler.process', function(session, type, data) {
    assertEquals(fakeSession, session);
    assertUint8ArrayEquals(constants.MESSAGE_TYPE.DATA, type);
    assertUint8ArrayEquals([
      0x05, 0x00, 0x00, 0x00, 0xC0, 0x96, 0x62, 0x09, 0x47, 0x3A, 0x8B, 0x0B,
      0xF9, 0x23, 0x93, 0x7A, 0x97, 0x85, 0x4F, 0xEE, 0xBD, 0x7B, 0x3A, 0xDB,
      0x88, 0x08, 0x20, 0x17, 0xBF, 0x22, 0xFC, 0x6D, 0x70, 0xB0, 0xF3, 0xE0,
      0xDC, 0xF6, 0x9E, 0xE2, 0xFA, 0xDD, 0x36, 0x87, 0x0C, 0xAE, 0x58, 0x16,
      0xEE, 0x49, 0x20, 0xBB, 0xA0, 0x1D, 0x31, 0xFF, 0xFF, 0x8E, 0x8E, 0x06,
      0x2F, 0xFC, 0xA9, 0x0A, 0x20, 0xAE, 0x1B, 0x0E, 0x6E, 0x68, 0xB4, 0xA1,
      0xD2, 0xE2, 0x59, 0x3B, 0xAD, 0x39, 0xCC, 0x09, 0x11, 0xCC, 0x6E, 0xE3,
      0xBD, 0x78, 0x19, 0x3B, 0xC2, 0x45, 0x5F, 0xDE, 0xAB, 0x49, 0x6C, 0x2D,
      0xDA, 0xDE, 0x59, 0xE4, 0x16, 0x28, 0xB1, 0xE3, 0x0A, 0xAC, 0x0B, 0x74,
      0xF3, 0x30, 0x15, 0x70, 0xBA, 0x53, 0x01, 0xC0, 0xB7, 0xDC, 0x27, 0x62,
      0x28, 0x67, 0xCB, 0x21, 0xD2, 0x5B, 0xCD, 0x6C, 0x95, 0x25, 0x1B, 0xE2,
      0x66, 0x65, 0xBE, 0x94, 0xD0, 0x99, 0xEE, 0x04, 0x14, 0x9E, 0xB9, 0x57,
      0xC6, 0x62, 0xD9, 0x64, 0x43, 0x35, 0x75, 0x57, 0x14, 0x02, 0xAE, 0xE7,
      0x4E, 0x46, 0x9B, 0x6B, 0xCF, 0x7A, 0x7D, 0xCE, 0xBD, 0xFB, 0x64, 0x35,
      0x61, 0x44, 0x71, 0xD9, 0x71, 0xA3, 0x9C, 0xEB, 0x99, 0x1E, 0x1F, 0x8C,
      0x5F, 0x36, 0x1B, 0xA7, 0x5F, 0x50, 0x5E, 0xC6, 0x31, 0x6C, 0xCD, 0x05,
      0x22, 0x64, 0xAB, 0x34, 0xA6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x05, 0x00, 0x00, 0x00, 0x03, 0xA8, 0x9E, 0xA3, 0x30, 0xEF, 0xCF, 0x5F,
      0xC6, 0xE1, 0x84, 0x50, 0xBD, 0x9D, 0xEA, 0xCF, 0x04, 0xA6, 0x35, 0x0A,
      0x5D, 0x56, 0xFC, 0xBA, 0x00, 0x00, 0x00, 0x00], data);
  });
  var msg = process(fakeSession,
      new Uint8Array(goog.crypt.base64.decodeStringToByteArray(
      'AAMDAAAAAAQAAAAFAAAAwJZiCUc6iwv5I5N6l4VP7r17OtuICCAXvyL8bXCw8+Dc9p7i+t' +
      '02hwyuWBbuSSC7oB0x//+OjgYv/KkKIK4bDm5otKHS4lk7rTnMCRHMbuO9eBk7wkVf3qtJ' +
      'bC3a3lnkFiix4wqsC3TzMBVwulMBwLfcJ2IoZ8sh0lvNbJUlG+JmZb6U0JnuBBSeuVfGYt' +
      'lkQzV1VxQCrudORptrz3p9zr37ZDVhRHHZcaOc65keH4xfNhunX1BexjFszQUiZKs0pgAA' +
      'AAAAAAAFAAAAA6ieozDvz1/G4YRQvZ3qzwSmNQpdVvy6AAAAAA==')));
}
