// Convert any %-encoded FGHI URL string to a real string:
// 1) replace '+' to a space
// 2) find %-encoded fragments, run them through decodeURIComponent()
function decodeFGHIURL(encodedString){
   var spaceDecodedString = encodedString.replace(/\+/g, ' ');
   var SourceArray =
      spaceDecodedString.split(/((%[0-9ABCDEFabcdef][0-9ABCDEFabcdef])+)/);
   if (SourceArray.length == 1) {
      // No encoded content detected :-)
      return spaceDecodedString;
   } else {
      // Converting all URLencoded fragments
      for (var ijk = 1; ijk < SourceArray.length; ijk += 3){
         SourceArray[ijk] = decodeURIComponent(SourceArray[ijk]);
         SourceArray[ijk+1] = '';
      };
      return SourceArray.join('');
   };
};

//
//  The FGHI URL object:
//

function FidonetURL(){  // FidonetURL constructor
   this.scheme = '';
};

FidonetURL.prototype = {
   // Possible exceptions:
   FGHI_URL_NO_SEPARATOR        : 'No :// separator in URL!',
   FGHI_URL_EMPTY_OPTIONAL_NAME : 'An optional parameter name is empty!',
   FGHI_URL_EMPTY_OPTIONAL_PAIR : 'Empty parameter+value pair detected!',
   FGHI_URL_INVALID_STATION : 'Fidonet station address violates FSP-1004!',
   FGHI_URL_EMPTY_AREA_NAME : 'Area name is empty!',
   FGHI_URL_DOUBLE_SLASH    : 'Unexpected double slash!',

   // Empty requests are invalid in FGHI URL post-0.3 drafts
   FGHI_URL_EMPTY_FAQ_REQUEST : 'FAQ request is empty!',

   FGHI_URL_UNKNOWN_SCHEME : 'Unknown Fidonet URL scheme!',

   // The station parser function:
   // slices station address (sets stationZone, stationNet,
   //                              stationNode, stationPoint, stationDomain)
   ParseStation : function (){
      var Parsed = this.station.match(
          /^(([0-9]+):)?([0-9]+)\/([0-9]+)(\.([0-9]+))?(@(.+))?$/
      );
      if (Parsed === null){
         throw new Error(this.FGHI_URL_INVALID_STATION);
      } else {
         this.stationZone = Parsed[2];
         if (this.stationZone === undefined) this.stationZone = '';

         this.stationNet  = Parsed[3];
         this.stationNode = Parsed[4];

         this.stationPoint = Parsed[6];
         if (this.stationPoint === undefined) this.stationPoint = '';

         this.stationDomain = Parsed[8];
         if (this.stationDomain === undefined) {
            this.stationDomain = ''
         } else this.stationDomain = decodeFGHIURL(this.stationDomain);
      };
   },

   // And when there is no station:
   NoStation : function (){
      this.station = '';
      this.stationZone   = '';
      this.stationNet    = '';
      this.stationNode   = '';
      this.stationPoint  = '';
      this.stationDomain = '';
   },

   // And when there is no object-path:
   NoObjectPath : function (){
      this.objectPath = '';
      this.objectPathPart = Array();
   },

   ParseObjectPath : function (){
      this.objectPathPart = Array();
      var PathBuf = this.objectPath;
      while (PathBuf.length > 0) {
         // next step: getting another slashed slice
         var SlashPos = PathBuf.indexOf('/');
         if (SlashPos < 0){
            // No more slashes!
            this.objectPathPart.push(decodeFGHIURL(PathBuf));
            PathBuf = '';
         } else if (SlashPos == 0){
            throw new Error(this.FGHI_URL_DOUBLE_SLASH);
         } else if (SlashPos == (PathBuf.length - 1)){
            // Trailing slash. IMPORTANT! Must not be ignored.
            this.objectPathPart.push(decodeFGHIURL(PathBuf.slice(0, -1)));
            this.objectPathPart.push('/');
            PathBuf = '';
         } else {
            // There are more slices yet.
            this.objectPathPart.push(
               decodeFGHIURL(PathBuf.slice(0, SlashPos))
            );
            PathBuf = PathBuf.slice(SlashPos + 1);
         };
         // Another slashed slice got
      };
      // PathBuf completely processed.
   },

   // The main parser function:
   ParseFromString : function (pfsString){
      var SchemeSeparatorMatch = pfsString.match(/:(\/{2})?/);
                 // NB: the above regexp is greedy ^^^^^^^^
      if (SchemeSeparatorMatch === null) {
         throw new Error(this.FGHI_URL_NO_SEPARATOR);  // URL is invalid!
      };

      var SchemeSeparatorPosition = 
                        pfsString.indexOf(SchemeSeparatorMatch[0]);
      var SchemeSeparatorMatchLen = SchemeSeparatorMatch[0].length;

      this.scheme = pfsString.slice(0, SchemeSeparatorPosition);
      this.scheme = this.scheme.toLowerCase(); // force ignore scheme case
      this.schemeSpecificPart = pfsString.slice(SchemeSeparatorPosition
                                              + SchemeSeparatorMatchLen);

      var QuestionPos = this.schemeSpecificPart.indexOf('?');
      if (QuestionPos < 0) {
      // optional part is empty!
         this.optionalPart = '';
         this.requiredPart = this.schemeSpecificPart;
      } else {
      // optional part may be non-empty
         this.requiredPart =
            this.schemeSpecificPart.slice(0, QuestionPos);
         this.optionalPart = 
            this.schemeSpecificPart.slice(QuestionPos + 1);
      };

      if (this.optionalPart == ''){
         // no optional params!
         this.optionalParam = new Array();
         // (this array would remain empty!
      } else {
         // parsing optional params...
         this.optionalParam = new Array();
         var optionalBuf = this.optionalPart;
         // if the optional parts ends with ampersand (&), kill it:
         if (optionalBuf.charAt(optionalBuf.length-1) == '&'){
            optionalBuf = optionalBuf.slice(0, -1);
         };
         while (optionalBuf.length > 0){
            // each step: getting the next param name+value pair
            var AmpersandPos = optionalBuf.indexOf('&');
            var ParamValuePair = '';
            if (AmpersandPos == 0) {
               // Mistake: nothing precedes an ampersand,
               // or unexpected double ampersand (&&) is encountered!
               throw new Error(this.FGHI_URL_EMPTY_OPTIONAL_PAIR);
            } else if (AmpersandPos < 0) {
               // No more ampersands!
               ParamValuePair = optionalBuf;
               optionalBuf = '';
            } else {
               // grab the first remaining slice:
               ParamValuePair = optionalBuf.slice(0, AmpersandPos);
               optionalBuf = optionalBuf.slice(AmpersandPos + 1);
            };
            // optionalBuf decremented by the slice;
            // now we have ParamValuePair; let's parse it!
            var EqualsPos = ParamValuePair.indexOf('=');
            var ParamValueObject = new Object();
            if (EqualsPos == 0) {
               // Mistake: empty parameter name!
               throw new Error(this.FGHI_URL_EMPTY_OPTIONAL_NAME);
            } else if (EqualsPos < 0) {
               // The equals sign is absent!
               // The ParamValuePair contains just the name
               ParamValueObject.name = decodeFGHIURL(ParamValuePair);
               ParamValueObject.value = '';
            } else {
               // grab the slices:
               ParamValueObject.name =
                  decodeFGHIURL(ParamValuePair.slice(0, EqualsPos));
               ParamValueObject.value =
                  decodeFGHIURL(ParamValuePair.slice(EqualsPos + 1));
            };
            // ParamValueObject is formed
            this.optionalParam.push(ParamValueObject);
         };
         // optionalBuf is processed
      };
      // this.optionalPart is processed.

      // Now we start parsing requiredPart.
      // This is going to be very scheme-specific.
      // Our goal is to fill one or more of the following:
      //
      // *) station (stationZone, stationNet, stationNode, stationPoint,
      //             stationDomain)
      //
      // *) echoName
      //
      // *) objectPath (and the objectPathPart[] array)
      //
      // *) request (for faqserv://)
      switch(this.scheme){
         // cases follow in order of appearance in the FGHI URL standard:
         case 'netmail':
            this.request = '';
            this.NoObjectPath();
            this.echoName = '';
            this.station = this.requiredPart;
            this.ParseStation();
         break;

         case 'areafix':
         case 'echomail':
            this.request = '';
            this.NoObjectPath();
            this.NoStation();
            this.echoName = decodeFGHIURL(this.requiredPart);
         break;

         case 'area':
         case 'fecho':
            this.request = '';
            this.NoStation();
            
            var SlashPos = this.requiredPart.indexOf('/');
            if (SlashPos < 0){
               // No object-path!
               this.NoObjectPath();
               this.echoName = decodeFGHIURL(this.requiredPart);
            } else if (SlashPos == 0){
               throw new Error(this.FGHI_URL_EMPTY_AREA_NAME);
            } else {
               this.echoName =
                  decodeFGHIURL(this.requiredPart.slice(0, SlashPos));
               this.objectPath = this.requiredPart.slice(SlashPos + 1);
               this.ParseObjectPath();
            };
         break;

         case 'faqserv':
            var FirstSlashPos = this.requiredPart.indexOf('/');
            var FreqBuf = '';

            if (FirstSlashPos <= 0){
               throw new Error(this.FGHI_URL_INVALID_STATION);
            }

            var SecondSlashPos = this.requiredPart.indexOf('/',
                                                      FirstSlashPos+1);
            if (SecondSlashPos < 0) {
               // No request, no object-path
               this.request = '';
               this.NoObjectPath();
               this.station = this.requiredPart;
               this.ParseStation();
            } else {
               this.station = this.requiredPart.slice(0, SecondSlashPos);
               this.ParseStation();
               FreqBuf = this.requiredPart.slice(SecondSlashPos + 1);

               var ThirdSlashPos = FreqBuf.indexOf('/');
               if (ThirdSlashPos < 0){
                  // No object-path!
                  this.NoObjectPath();
                  this.request = decodeFGHIURL(FreqBuf);
               } else if (ThirdSlashPos == 0){
                  // Empty requests are invalid in FGHI URL post-0.3 drafts
                  throw new Error(this.FGHI_URL_EMPTY_FAQ_REQUEST);
               } else {
                  this.request =
                     decodeFGHIURL(FreqBuf.slice(0, ThirdSlashPos));
                  this.objectPath = FreqBuf.slice(ThirdSlashPos + 1);
                  this.ParseObjectPath();
               };
               // Finished parsing request (and object-path, if exists)
            };
         break;

         case 'freq':
            this.request = '';

            var FirstSlashPos = this.requiredPart.indexOf('/');
            var FreqBuf = '';

            if (FirstSlashPos <= 0){
               throw new Error(this.FGHI_URL_INVALID_STATION);
            }

            var SecondSlashPos = this.requiredPart.indexOf('/',
                                                      FirstSlashPos+1);
            if (SecondSlashPos < 0) {
               // No object-path!
               this.NoObjectPath();
               this.station = this.requiredPart;
               this.ParseStation();
            } else {
               this.station = this.requiredPart.slice(0, SecondSlashPos);
               this.ParseStation();
               this.objectPath = this.requiredPart.slice(SecondSlashPos+1);
               this.ParseObjectPath();
            };
         break;

         default:
            throw new Error(this.FGHI_URL_UNKNOWN_SCHEME);
         break;
      };
   }
}

module.exports = FidonetURL;