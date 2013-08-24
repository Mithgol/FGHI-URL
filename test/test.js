var assert = require('assert');
var FGHIURL = require('../');

describe('Error processing', function(){
   it('throws when :// is absent', function(){
      assert.throws(function(){
         FGHIURL('foobar');
      }, RegExp( FGHIURL.NO_SEPARATOR ));
   });
});