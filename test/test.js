/*global describe, it */
var assert = require('assert');
var FGHIURL = require('../');

describe('Error processing', function(){
   it('does not allow missing "://" or ":"', function(){
      assert.throws(function(){
         FGHIURL('foobar');
      }, RegExp( FGHIURL.NO_SEPARATOR ));
      assert.throws(function(){
         FGHIURL('know yourself');
      }, RegExp( FGHIURL.NO_SEPARATOR ));
      assert.doesNotThrow(function(){
         FGHIURL('echomail:FTSC_Public');
         FGHIURL('area://FTSC_Public');
      });
   });
   it('rejects unknown (non-FGHI) schemes', function(){
      assert.throws(function(){
         FGHIURL('mailto:example@example.org');
      }, RegExp( FGHIURL.UNKNOWN_SCHEME ));
      assert.throws(function(){
         FGHIURL(
            'magnet:?xt=urn:btih:5E83C9DDCFF170EA01274378013B91081F7FF88E' +
            '&dn=LibreOffice_4.1.0_Win_x86_helppack_ru.msi&tr=' +
            'http%3a%2f%2ftracker.documentfoundation.org%3a6969%2fannounce' +
            '&ws=http%3a%2f%2flibreoffice-mirror.rbc.ru' +
            '%2fpub%2flibreoffice%2flibreoffice%2fstable%2f4.1.0%2f' +
            'win%2fx86%2fLibreOffice_4.1.0_Win_x86_helppack_ru.msi'
         );
      }, RegExp( FGHIURL.UNKNOWN_SCHEME ));
   });
   it('rejects empty FAQ requests', function(){
      assert.throws(function(){
         FGHIURL('faqserv://2:50/88//');
      }, RegExp( FGHIURL.EMPTY_FAQ_REQUEST ));
      assert.doesNotThrow(function(){
         FGHIURL('faqserv://2:50/88');
         FGHIURL('faqserv://2:50/88/');
         FGHIURL('faqserv://2:5020/0/nodelist');
         FGHIURL('faqserv://2:5030/0/nodelist');
      });
   });
   it('rejects empty names of optional parameters', function(){
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?=!');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_NAME ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?=!&date=2013');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_NAME ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?date=2013&=!');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_NAME ));
      assert.doesNotThrow(function(){
         FGHIURL('area://FTSC_Public/?date=2013');
         FGHIURL('area://FTSC_Public/?date=2013&');
         FGHIURL('area://FTSC_Public?date=2013');
         FGHIURL('area://FTSC_Public/?whatever&date=2013');
      });
   });
   it('rejects empty parameter=value pairs', function(){
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?&date=2013');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_PAIR ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?date=2013&&');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_PAIR ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/?date=2013&&whatever');
      }, RegExp( FGHIURL.EMPTY_OPTIONAL_PAIR ));
   });
   it('rejects violations of FSP-1004', function(){
      assert.throws(function(){
         FGHIURL('netmail:');
      }, RegExp( FGHIURL.INVALID_STATION ));
      assert.throws(function(){
         FGHIURL('freq://');
      }, RegExp( FGHIURL.INVALID_STATION ));
      assert.throws(function(){
         FGHIURL('faqserv://');
      }, RegExp( FGHIURL.INVALID_STATION ));
      assert.throws(function(){
         FGHIURL('faqserv://3d5');
      }, RegExp( FGHIURL.INVALID_STATION ));
      assert.throws(function(){
         FGHIURL('faqserv://7:7:5/6/');
      }, RegExp( FGHIURL.INVALID_STATION ));
   });
   it('does not allow an empty name of an area', function(){
      assert.throws(function(){
         FGHIURL('area:///');
      }, RegExp( FGHIURL.EMPTY_AREA_NAME ));
      assert.throws(function(){
         FGHIURL('fecho:///');
      }, RegExp( FGHIURL.EMPTY_AREA_NAME ));
      assert.throws(function(){
         FGHIURL('area:///some/path');
      }, RegExp( FGHIURL.EMPTY_AREA_NAME ));
      assert.throws(function(){
         FGHIURL('fecho:///some/container/');
      }, RegExp( FGHIURL.EMPTY_AREA_NAME ));
      assert.doesNotThrow(function(){
         FGHIURL('area://');
         FGHIURL('fecho://');
         FGHIURL('area://?filter=subscribed');
      });
   });
   it("rejects a double slash in an object's path", function(){
      assert.throws(function(){
         FGHIURL('area://FTSC_Public//somefile');
      }, RegExp( FGHIURL.DOUBLE_SLASH ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/somedir//');
      }, RegExp( FGHIURL.DOUBLE_SLASH ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/somedir//more+path');
      }, RegExp( FGHIURL.DOUBLE_SLASH ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/somedir//more+path/');
      }, RegExp( FGHIURL.DOUBLE_SLASH ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public/somedir//more+path//');
      }, RegExp( FGHIURL.DOUBLE_SLASH ));
      assert.doesNotThrow(function(){
         FGHIURL('area://FTSC_Public/somefile');
         FGHIURL('area://FTSC_Public/somedir/');
         FGHIURL('area://FTSC_Public/somedir/more+path');
      });
   });
   it('rejects empty elements in the list of areas', function(){
      assert.throws(function(){
         FGHIURL('area://FTSC_Public+/somefile');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.throws(function(){
         FGHIURL('area://%20FTSC_Public');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.throws(function(){
         FGHIURL('area://Ru.FTN.Develop+%20FTSC_Public');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.doesNotThrow(function(){
         FGHIURL('area://Ru.FTN.Develop+FTSC_Public/somefile');
         FGHIURL('area://Ru.FTN.Develop%20FTSC_Public');
      });
   });
   it('rejects empty suffixes in a name of an area', function(){
      assert.throws(function(){
         FGHIURL('area://FTSC_Public@/somefile');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.throws(function(){
         FGHIURL('area://FTSC_Public@@fidonet');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.throws(function(){
         FGHIURL('area://Ru.FTN.Develop@fidonet@');
      }, RegExp( FGHIURL.EMPTY_FQAN ));
      assert.doesNotThrow(function(){
         FGHIURL('area://Ru.FTN.Develop+FTSC_Public@fidonet');
         FGHIURL('area://Ru.FTN.Develop@fidonet%40%40root%20FTSC_Public');
      });
   });
});