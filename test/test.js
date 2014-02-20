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

describe('URL processing', function(){
   describe("processes 'netmail:' examples (section 6.1)", function(){
      it('section 6.1 initial part', function(){
         var url = FGHIURL('netmail:2:5030/1520.9');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '1520');
         assert.equal(url.stationPoint, '9');
         assert.equal(url.stationDomain, '');

         url = FGHIURL('netmail:2:5063/88');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5063');
         assert.equal(url.stationNode, '88');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');

         url = FGHIURL('netmail:182:5043/1@forestnet');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '182');
         assert.equal(url.stationNet, '5043');
         assert.equal(url.stationNode, '1');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, 'forestnet');
      });

      it('section 6.1.1', function(){
         var url = FGHIURL('netmail:2:5063/88?to=Mithgol+the+Webmaster');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5063');
         assert.equal(url.stationNode, '88');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'to',
            value: 'Mithgol the Webmaster'
         }]);

         url = FGHIURL('netmail:2:5030/1520.9?to=Trooper');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '1520');
         assert.equal(url.stationPoint, '9');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'to',
            value: 'Trooper'
         }]);

         url = FGHIURL('netmail:2:50/13?to=Alex%20Kocharin');
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '50');
         assert.equal(url.stationNode, '13');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'to',
            value: 'Alex Kocharin'
         }]);
      });

      it('section 6.1.2', function(){
         var url = FGHIURL(
            'netmail:2:5063/88?subject=Is+the+hypertext+Fidonet+ready%3F'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5063');
         assert.equal(url.stationNode, '88');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'subject',
            value: 'Is the hypertext Fidonet ready?'
         }]);

         url = FGHIURL(
            'netmail:2:5030/830.17?subject=Yet+another+GoldEd%2b+feature'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '830');
         assert.equal(url.stationPoint, '17');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'subject',
            value: 'Yet another GoldEd+ feature'
         }]);

         url = FGHIURL(
            'netmail:2:5030/84?to=R50EC&subject=%D0%AD%D1%85%D0%B8'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '84');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'to',
            value: 'R50EC'
         }, {
            name: 'subject',
            value: 'Эхи'
         }]);
      });

      it('section 6.1.3', function(){
         var url = FGHIURL(
            'netmail:2:5030/84?to=R50EC&from=Moderator&subject=New+echo+rules'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '84');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'to',
            value: 'R50EC'
         }, {
            name: 'from',
            value: 'Moderator'
         }, {
            name: 'subject',
            value: 'New echo rules'
         }]);

         url = FGHIURL(
            'netmail:2:5024/1024?from=Moderator&subject=%5B%21%5D+read+only'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5024');
         assert.equal(url.stationNode, '1024');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'from',
            value: 'Moderator'
         }, {
            name: 'subject',
            value: '[!] read only'
         }]);
      });

      it('section 6.1.4', function(){
         var url = FGHIURL(
            'netmail:2:5063/88?subject=About+FGHI&body=Fidonet+2.0+draft'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5063');
         assert.equal(url.stationNode, '88');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'subject',
            value: 'About FGHI'
         }, {
            name: 'body',
            value: 'Fidonet 2.0 draft'
         }]);

         url = FGHIURL(
            'netmail:2:50/0?subject=Complaint&body=A+sysop+is+annoying'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '50');
         assert.equal(url.stationNode, '0');
         assert.equal(url.stationPoint, '');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'subject',
            value: 'Complaint'
         }, {
            name: 'body',
            value: 'A sysop is annoying'
         }]);

         url = FGHIURL(
            'netmail:2:5030/1520.9?body=HellEd+needs+enormously+large+DLLs'
         );
         assert.equal(url.scheme, 'netmail');
         assert.equal(url.stationZone, '2');
         assert.equal(url.stationNet, '5030');
         assert.equal(url.stationNode, '1520');
         assert.equal(url.stationPoint, '9');
         assert.equal(url.stationDomain, '');
         assert.deepEqual(url.optionalParams, [{
            name: 'body',
            value: 'HellEd needs enormously large DLLs'
         }]);
      });
   });

   describe("processes 'areafix:' examples (section 6.2)", function(){
      it('section 6.2 initial part', function(){
         var url = FGHIURL('areafix:SU.FidoTech');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [['SU.FidoTech']]);

         url = FGHIURL('areafix:Ru.Fidonet.Today');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [['Ru.Fidonet.Today']]);

         url = FGHIURL('areafix:Ru.FTN.Develop+Ru.FTN.WinSoft');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [
            ['Ru.FTN.Develop'],
            ['Ru.FTN.WinSoft']
         ]);

         url = FGHIURL('areafix:Ru.Computer.Humor%20Ru.Hutor.Filtered');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [
            ['Ru.Computer.Humor'],
            ['Ru.Hutor.Filtered']
         ]);

         url = FGHIURL('areafix:Titanic.Best+Titanic.Forward%20Titanic.PVT');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [
            ['Titanic.Best'],
            ['Titanic.Forward'],
            ['Titanic.PVT']
         ]);
      });
      it('section 6.2.1', function(){
         var url = FGHIURL('areafix:Ru.Embedded?uplink=2:5029/32');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [['Ru.Embedded']]);
         assert.deepEqual(url.optionalParams, [{
            name: 'uplink',
            value: '2:5029/32'
         }]);

         url = FGHIURL('areafix:Titanic.PVT?uplink=2:5020/830');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [['Titanic.PVT']]);
         assert.deepEqual(url.optionalParams, [{
            name: 'uplink',
            value: '2:5020/830'
         }]);
      });
      it('section 6.2.2', function(){
         var url = FGHIURL('areafix:Ru.PHP?leave');
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [['Ru.PHP']]);
         assert.deepEqual(url.optionalParams, [{
            name: 'leave',
            value: ''
         }]);

         url = FGHIURL(
            'areafix:Ru.List.Citycat.Culture.Music.Announce.FantasyNews?leave'
         );
         assert.equal(url.scheme, 'areafix');
         assert.deepEqual(url.echoNames, [[
            'Ru.List.Citycat.Culture.Music.Announce.FantasyNews'
         ]]);
         assert.deepEqual(url.optionalParams, [{
            name: 'leave',
            value: ''
         }]);
      });
   });
});

describe('Detection of filters', function(){
   it('detects when a filter is given', function(){
      assert( FGHIURL('area://Ru.FTN.Develop/?time=2014').hasFilters() );
      assert( FGHIURL('area://Ru.FTN.Develop?ttop').hasFilters() );
      assert( FGHIURL('area://Ru.FTN.Develop?ttop&view=mapm').hasFilters() );
   });
   it('detects when there are no filters', function(){
      assert(! FGHIURL('areafix:Ru.FTN.Develop').hasFilters() );
      assert(! FGHIURL('area://Ru.FTN.Develop').hasFilters() );
      assert(! FGHIURL('area://Ru.FTN.Develop/').hasFilters() );
      assert(! FGHIURL('area://Ru.FTN.Develop/ttop').hasFilters() );
      assert(! FGHIURL('area://Ru.FTN.Develop?view=mapm').hasFilters() );
   });
});