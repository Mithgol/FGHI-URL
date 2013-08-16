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
      }
      return SourceArray.join('');
   }
}

// The FGHI URL object's constructor
// takes a string
function FidonetURL(initialString){
   // a fair number of helper functions is used in object's context (this)!
   // _END_OF_HELPER_FUNCTIONS_ below is the real constructor code's start

   var parseStation = function(){
      // takes this.station and makes slices:
      // this.stationZone, this.stationNet,
      // this.stationNode, this.stationPoint, this.stationDomain
      var Parsed = this.station.match(
          /^(([0-9]+):)?([0-9]+)\/([0-9]+)(\.([0-9]+))?(@(.+))?$/
      );
      if (Parsed === null){
         throw new Error(this.errors.INVALID_STATION);
      } else {
         this.stationZone = Parsed[2];
         if (this.stationZone === undefined) this.stationZone = '';

         this.stationNet  = Parsed[3];
         this.stationNode = Parsed[4];

         this.stationPoint = Parsed[6];
         if (this.stationPoint === undefined) this.stationPoint = '';

         this.stationDomain = Parsed[8];
         if (this.stationDomain === undefined) {
            this.stationDomain = '';
         } else this.stationDomain = decodeFGHIURL(this.stationDomain);
      }
   };

   var noStation = function(){
      // like parseStation() above, but there's no station
      this.station = '';
      this.stationZone   = '';
      this.stationNet    = '';
      this.stationNode   = '';
      this.stationPoint  = '';
      this.stationDomain = '';
   };

   var parseObjectPath = function(){
      // takes this.objectPath string
      // makes this.objectPathParts array
      this.objectPathParts = [];
      var PathBuf = this.objectPath;
      while (PathBuf.length > 0){
         // next step: getting another slashed slice
         var SlashPos = PathBuf.indexOf('/');
         if (SlashPos < 0){ // No more slashes!
            this.objectPathParts.push(decodeFGHIURL(PathBuf));
            PathBuf = '';
         } else if (SlashPos === 0){
            throw new Error(this.errors.DOUBLE_SLASH);
         } else if( SlashPos === (PathBuf.length - 1) ){
            // Trailing slash. IMPORTANT! Must not be ignored.
            this.objectPathParts.push(decodeFGHIURL(PathBuf.slice(0, -1)));
            this.objectPathParts.push('/');
            PathBuf = '';
         } else { // There are more slices yet.
            this.objectPathParts.push(
               decodeFGHIURL(PathBuf.slice(0, SlashPos))
            );
            PathBuf = PathBuf.slice(SlashPos + 1);
         }
      } // PathBuf is completely processed when while(){} ends
   };

   var noObjectPath = function(){
      // like parseObjectPath() above, but there's no object-path
      this.objectPath = '';
      this.objectPathParts = [];
   };

   var parseFundamentalSections = function(pfsString){
      // takes a string containing the URL
      // makes: this.scheme,
      // this.schemeSpecificPart,
      // this.requiredPart, this.optionalPart

      var separatorMatch = pfsString.match(/:(\/{2})?/);
           // NB: the above regexp is greedy ^^^^^^^^
      if( separatorMatch === null ){
         throw new Error(this.errors.NO_SEPARATOR);  // URL is invalid!
      }

      var separatorPosition = pfsString.indexOf(separatorMatch[0]);
      var separatorMatchLen = separatorMatch[0].length;

      this.scheme = pfsString.slice(0, separatorPosition);
      this.scheme = this.scheme.toLowerCase(); // force ignore scheme case
      this.schemeSpecificPart = pfsString.slice(
         separatorPosition + separatorMatchLen
      );

      var questionPos = this.schemeSpecificPart.indexOf('?');
      if (questionPos < 0) { // optional part is empty!
         this.optionalPart = '';
         this.requiredPart = this.schemeSpecificPart;
         return;
      }
      this.requiredPart = this.schemeSpecificPart.slice(0, questionPos);
      this.optionalPart = this.schemeSpecificPart.slice(questionPos + 1);
   };

   var parseOptionalPart = function(){
      // takes this.optionalPart
      // makes this.optionalParams array

      this.optionalParams = [];
      if (this.optionalPart === ''){ // no optional params!
         return;
      }
      // parsing optional params...
      var optionalBuf = this.optionalPart;
      // if the optional parts ends with ampersand (&), kill it:
      if( optionalBuf.charAt(optionalBuf.length-1) === '&' ){
         optionalBuf = optionalBuf.slice(0, -1);
      }
      while (optionalBuf.length > 0){
         // each step: getting the next param name+value pair
         var ampersandPos = optionalBuf.indexOf('&');
         var ParamValuePair = '';
         if( ampersandPos === 0 ){
            // Mistake: nothing precedes an ampersand,
            // or unexpected double ampersand (&&) is encountered!
            throw new Error(this.errors.EMPTY_OPTIONAL_PAIR);
         } else if( ampersandPos < 0 ){
            // No more ampersands!
            ParamValuePair = optionalBuf;
            optionalBuf = '';
         } else {
            // grab the first remaining slice:
            ParamValuePair = optionalBuf.slice(0, ampersandPos);
            optionalBuf = optionalBuf.slice(ampersandPos + 1);
         }
         // optionalBuf decremented by the slice;
         // and now we have our next ParamValuePair; let's parse it!
         var equalsPos = ParamValuePair.indexOf('=');
         var ParamValueObject = {};
         if( equalsPos === 0 ){
            // Mistake: empty parameter name!
            throw new Error(this.errors.EMPTY_OPTIONAL_NAME);
         } else if( equalsPos < 0 ){
            // The equals sign is absent!
            // The ParamValuePair contains just the name
            ParamValueObject.name = decodeFGHIURL(ParamValuePair);
            ParamValueObject.value = '';
         } else {
            // grab the slices:
            ParamValueObject.name =
               decodeFGHIURL(ParamValuePair.slice(0, equalsPos));
            ParamValueObject.value =
               decodeFGHIURL(ParamValuePair.slice(equalsPos + 1));
         }
         // ParamValueObject is formed
         this.optionalParams.push(ParamValueObject);
      } // optionalBuf is processed
   };

   var netmailRequiredPart = function(){
      // process this.requiredPart for 'netmail:' scheme
      // it contains this.station (with subsections)
      this.request = '';
      noObjectPath.call(this);
      this.echoName = '';
      this.station = this.requiredPart;
      parseStation.call(this);
   };

   var areafixOrEchomailRequiredPart = function(){
      // process this.requiredPart for 'areafix:' or 'echomail:' scheme
      // it contains this.echoName
      this.request = '';
      noObjectPath.call(this);
      noStation.call(this);
      this.echoName = decodeFGHIURL(this.requiredPart);
   };

   var areaOrFechoRequiredPart = function(){
      // process this.requiredPart for 'area://' or 'fecho://' scheme
      // it contains this.echoName and this.objectPath
      this.request = '';
      noStation.call(this);

      var slashPos = this.requiredPart.indexOf('/');
      if (slashPos < 0){
         // No object-path!
         noObjectPath.call(this);
         this.echoName = decodeFGHIURL(this.requiredPart);
      } else if (slashPos === 0){
         throw new Error(this.errors.EMPTY_AREA_NAME);
      } else {
         this.echoName =
            decodeFGHIURL(this.requiredPart.slice(0, slashPos));
         this.objectPath = this.requiredPart.slice(slashPos + 1);
         parseObjectPath.call(this);
      }
   };

   var faqservRequiredPart = function(){
      // process this.requiredPart for 'faqserv://' scheme
      // it contains this.station and this.objectPath
      var FreqBuf = '';

      var firstSlashPos = this.requiredPart.indexOf('/');
      if( firstSlashPos <= 0 ) throw new Error(this.errors.INVALID_STATION);

      var secondSlashPos = this.requiredPart.indexOf('/', firstSlashPos+1);
      if (secondSlashPos < 0) { // no request, no object-path
         this.request = '';
         noObjectPath.call(this);
         this.station = this.requiredPart;
         parseStation.call(this);
         return;
      }

      this.station = this.requiredPart.slice(0, secondSlashPos);
      parseStation.call(this);
      FreqBuf = this.requiredPart.slice(secondSlashPos + 1);

      var thirdSlashPos = FreqBuf.indexOf('/');
      if (thirdSlashPos < 0){ // no object-path
         noObjectPath.call(this);
         this.request = decodeFGHIURL(FreqBuf);
      } else if (thirdSlashPos === 0){
         // Empty requests are invalid in FGHI URL post-0.3 drafts
         throw new Error(this.errors.EMPTY_FAQ_REQUEST);
      } else {
         this.request = decodeFGHIURL(FreqBuf.slice(0, thirdSlashPos));
         this.objectPath = FreqBuf.slice(thirdSlashPos + 1);
         parseObjectPath.call(this);
      }
   };

   var freqRequiredPart = function(){
      // process this.requiredPart for 'freq://' scheme
      // it contains this.station and this.objectPath
      this.request = '';
      var FreqBuf = '';

      var firstSlashPos = this.requiredPart.indexOf('/');
      if( firstSlashPos <= 0 ) throw new Error(this.errors.INVALID_STATION);

      var secondSlashPos = this.requiredPart.indexOf('/', firstSlashPos+1);
      if (secondSlashPos < 0) { // no object-path
         noObjectPath.call(this);
         this.station = this.requiredPart;
         parseStation.call(this);
         return;
      }

      this.station = this.requiredPart.slice(0, secondSlashPos);
      parseStation.call(this);
      this.objectPath = this.requiredPart.slice(secondSlashPos+1);
      parseObjectPath.call(this);
   };

   // _END_OF_HELPER_FUNCTIONS_

   parseFundamentalSections.call(this, initialString);
   parseOptionalPart.call(this);

   // Now we start parsing requiredPart.
   // This is going to be very scheme-specific.
   // Our goal is to fill one (or more) of the following:
   // *) station (stationZone, stationNet, stationNode, stationPoint,
   //             stationDomain)
   // *) echoName
   // *) objectPath (and the objectPathParts[] array)
   // *) request (for faqserv://)
   switch(this.scheme){ // in order of appearance in the FGHI URL standard:
      case 'netmail':
         netmailRequiredPart.call(this);
      break;
      case 'areafix':
      case 'echomail':
         areafixOrEchomailRequiredPart.call(this);
      break;
      case 'area':
      case 'fecho':
         areaOrFechoRequiredPart.call(this);
      break;
      case 'faqserv':
         faqservRequiredPart.call(this);
      break;
      case 'freq':
         freqRequiredPart.call(this);
      break;

      default: throw new Error(this.errors.UNKNOWN_SCHEME);
   }
}

FidonetURL.prototype.errors = {
   NO_SEPARATOR        : 'No :// separator in URL!',
   EMPTY_OPTIONAL_NAME : 'An optional parameter name is empty!',
   EMPTY_OPTIONAL_PAIR : 'Empty parameter+value pair detected!',
   INVALID_STATION : 'Fidonet station address violates FSP-1004!',
   EMPTY_AREA_NAME : 'Area name is empty!',
   DOUBLE_SLASH    : 'Unexpected double slash!',
   UNKNOWN_SCHEME  : 'Unknown Fidonet URL scheme!',

   // Empty requests are invalid in FGHI URL post-0.3 drafts
   EMPTY_FAQ_REQUEST : 'FAQ request is empty!'
};

module.exports = FidonetURL;