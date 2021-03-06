/******************************************
 *               TxtFX Bot                *
 *         Created by Evan Straw          *
 * Applies various effects using fancy    *
 * Unicode characters to text inputted    *
 * inputted via Telegram.                 *
 *                                        *
 * This code is under the MIT License     *
 * (see LICENSE)                          *
 ******************************************
 * txtfxcore.js                           *
 * Contains functions for applying        *
 * effects to inputted text.              *
 ******************************************/

var emoji = require('node-emoji');
var logutil = require("./logutil.js");
//require the log function (see logutils.js)
var log = logutil.log;
var levels = logutil.levels;

/*
Array of all the available effects.
There are currently two types: alphabet and custom.
In alphabet effects, all the printing ASCII characters (ASCII codes 32-126) are mapped by code to the Unicode character equivalent.
  for example: in the "circled" alphabet, character code 65 ('A') is mapped to 'Ⓐ'
In custom effects, each effect has its own processor function which is in the "processor" property of the effect object. This function takes the inputted text as a parameter and returns processed text.
structure:
effect
|-id: The internal name/ID of the effect. used as a key to retrieve specific effects. Should be simplified (e.g. if effect display name is "Countries (Flags)" then ID should be "countries")
|-name: The display name for the effect, will be shown to users
|-type: Either "alphabet" or "custom"
|-alphabet: the alphabet mapping (only present if type is "alphabet")
  |-character code
    |- alphabet equivalent
|-processor: the processor function for this effect. (only present if type is "custom")
*/
module.exports.effects = [
	{id: 'fullwidth', name: 'Full Width', type: "alphabet", alphabet:{32:'　', 33:'！', 34:'\"', 35:'＃', 36:'＄', 37:'％', 38:'＆', 39:'＇', 40:'（', 41:'）', 42:'＊', 43:'＋', 44:'，', 45:'－', 46:'．', 47:'／', 48:'０', 49:'１', 50:'２', 51:'３', 52:'４', 53:'５', 54:'６', 55:'７', 56:'８', 57:'９', 58:'：', 59:'；', 60:'<', 61:'＝', 62:'>', 63:'？', 64:'＠', 65:'Ａ', 66:'Ｂ', 67:'Ｃ', 68:'Ｄ', 69:'Ｅ', 70:'Ｆ', 71:'Ｇ', 72:'Ｈ', 73:'Ｉ', 74:'Ｊ', 75:'Ｋ', 76:'Ｌ', 77:'Ｍ', 78:'Ｎ', 79:'Ｏ', 80:'Ｐ', 81:'Ｑ', 82:'Ｒ', 83:'Ｓ', 84:'Ｔ', 85:'Ｕ', 86:'Ｖ', 87:'Ｗ', 88:'Ｘ', 89:'Ｙ', 90:'Ｚ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ａ', 98:'ｂ', 99:'ｃ', 100:'ｄ', 101:'ｅ', 102:'ｆ', 103:'ｇ', 104:'ｈ', 105:'ｉ', 106:'ｊ', 107:'ｋ', 108:'ｌ', 109:'ｍ', 110:'ｎ', 111:'ｏ', 112:'ｐ', 113:'ｑ', 114:'ｒ', 115:'ｓ', 116:'ｔ', 117:'ｕ', 118:'ｖ', 119:'ｗ', 120:'ｘ', 121:'ｙ', 122:'ｚ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id:'emojify', name: 'Emojify', type: 'custom', processor:emojify},
  {id:'clap',name: 'Clap', type: 'custom', processor:clap},
  {id:'random_caps',name: 'Random Caps (Mocking Spongebob)', type: 'custom', processor:random_caps},
  {id: 'thinking', name: 'Rlly makes u think '+em('thinking_face')+em('thinking_face'), type: 'custom', processor:think},
	{id: 'countries', name: 'Countries (Flags)', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🇦', 66:'🇧', 67:'🇨', 68:'🇩', 69:'🇪', 70:'🇫', 71:'🇬', 72:'🇭', 73:'🇮', 74:'🇯', 75:'🇰', 76:'🇱', 77:'🇲', 78:'🇳', 79:'🇴', 80:'🇵', 81:'🇶', 82:'🇷', 83:'🇸', 84:'🇹', 85:'🇺', 86:'🇻', 87:'🇼', 88:'🇽', 89:'🇾', 90:'🇿', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'🇦', 98:'🇧', 99:'🇨', 100:'🇩', 101:'🇪', 102:'🇫', 103:'🇬', 104:'🇭', 105:'🇮', 106:'🇯', 107:'🇰', 108:'🇱', 109:'🇲', 110:'🇳', 111:'🇴', 112:'🇵', 113:'🇶', 114:'🇷', 115:'🇸', 116:'🇹', 117:'🇺', 118:'🇻', 119:'🇼', 120:'🇽', 121:'🇾', 122:'🇿', 123:'{', 124:'|', 125:'}', 126:'~'}},
 	{id: 'squared', name: 'Squared', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'⧆', 43:'⊞', 44:',', 45:'⊟', 46:'⊡', 47:'⧄', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🄰', 66:'🄱', 67:'🄲', 68:'🄳', 69:'🄴', 70:'🄵', 71:'🄶', 72:'🄷', 73:'🄸', 74:'🄹', 75:'🄺', 76:'🄻', 77:'🄼', 78:'🄽', 79:'🄾', 80:'🄿', 81:'🅀', 82:'🅁', 83:'🅂', 84:'🅃', 85:'🅄', 86:'🅅', 87:'🅆', 88:'🅇', 89:'🅈', 90:'🅉', 91:'[', 92:'⧅', 93:']', 94:'^', 95:'_', 96:'`', 97:'🄰', 98:'🄱', 99:'🄲', 100:'🄳', 101:'🄴', 102:'🄵', 103:'🄶', 104:'🄷', 105:'🄸', 106:'🄹', 107:'🄺', 108:'🄻', 109:'🄼', 110:'🄽', 111:'🄾', 112:'🄿', 113:'🅀', 114:'🅁', 115:'🅂', 116:'🅃', 117:'🅄', 118:'🅅', 119:'🅆', 120:'🅇', 121:'🅈', 122:'🅉', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'squaredNegative', name: 'Squared (Negative)', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🅰', 66:'🅱', 67:'🅲', 68:'🅳', 69:'🅴', 70:'🅵', 71:'🅶', 72:'🅷', 73:'🅸', 74:'🅹', 75:'🅺', 76:'🅻', 77:'🅼', 78:'🅽', 79:'🅾', 80:'🅿', 81:'🆀', 82:'🆁', 83:'🆂', 84:'🆃', 85:'🆄', 86:'🆅', 87:'🆆', 88:'🆇', 89:'🆈', 90:'🆉', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'🅰', 98:'🅱', 99:'🅲', 100:'🅳', 101:'🅴', 102:'🅵', 103:'🅶', 104:'🅷', 105:'🅸', 106:'🅹', 107:'🅺', 108:'🅻', 109:'🅼', 110:'🅽', 111:'🅾', 112:'🅿', 113:'🆀', 114:'🆁', 115:'🆂', 116:'🆃', 117:'🆄', 118:'🆅', 119:'🆆', 120:'🆇', 121:'🆈', 122:'🆉', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'accents', name: 'Accents', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Á', 66:'B', 67:'Ć', 68:'D', 69:'É', 70:'F', 71:'Ǵ', 72:'H', 73:'í', 74:'J', 75:'Ḱ', 76:'Ĺ', 77:'Ḿ', 78:'Ń', 79:'Ő', 80:'Ṕ', 81:'Q', 82:'Ŕ', 83:'ś', 84:'T', 85:'Ű', 86:'V', 87:'Ẃ', 88:'X', 89:'Ӳ', 90:'Ź', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'á', 98:'b', 99:'ć', 100:'d', 101:'é', 102:'f', 103:'ǵ', 104:'h', 105:'í', 106:'j', 107:'ḱ', 108:'ĺ', 109:'ḿ', 110:'ń', 111:'ő', 112:'ṕ', 113:'q', 114:'ŕ', 115:'ś', 116:'t', 117:'ú', 118:'v', 119:'ẃ', 120:'x', 121:'ӳ', 122:'ź', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'currency', name: 'Currency Symbols', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'"', 35:'#', 36:'$', 37:'%', 38:'&', 39:"'", 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'A', 66:'฿', 67:'₡', 68:'D', 69:'€', 70:'£', 71:'G', 72:'H', 73:'I', 74:'J', 75:'₭', 76:'L', 77:'M', 78:'N', 79:'O', 80:'₱', 81:'Q', 82:'R', 83:'$', 84:'₮', 85:'U', 86:'V', 87:'₩', 88:'X', 89:'¥', 90:'₴', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'a', 98:'b', 99:'¢', 100:'₫', 101:'e', 102:'ƒ', 103:'g', 104:'h', 105:'i', 106:'j', 107:'k', 108:'l', 109:'m', 110:'n', 111:'o', 112:'₽', 113:'q', 114:'r', 115:'$', 116:'t', 117:'u', 118:'v', 119:'w', 120:'x', 121:'y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'cjk', name: 'CJK', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ﾑ', 66:'乃', 67:'c', 68:'d', 69:'乇', 70:'ｷ', 71:'g', 72:'ん', 73:'ﾉ', 74:'ﾌ', 75:'ズ', 76:'ﾚ', 77:'ﾶ', 78:'刀', 79:'o', 80:'ｱ', 81:'q', 82:'尺', 83:'丂', 84:'ｲ', 85:'u', 86:'√', 87:'w', 88:'ﾒ', 89:'ﾘ', 90:'乙', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ﾑ', 98:'乃', 99:'c', 100:'d', 101:'乇', 102:'ｷ', 103:'g', 104:'ん', 105:'ﾉ', 106:'ﾌ', 107:'ズ', 108:'ﾚ', 109:'ﾶ', 110:'刀', 111:'o', 112:'ｱ', 113:'q', 114:'尺', 115:'丂', 116:'ｲ', 117:'u', 118:'√', 119:'w', 120:'ﾒ', 121:'ﾘ', 122:'乙', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'misc1', name: 'Misc 1', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'܁', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ค', 66:'๒', 67:'ƈ', 68:'ɗ', 69:'ﻉ', 70:'ि', 71:'ﻭ', 72:'ɦ', 73:'ٱ', 74:'ﻝ', 75:'ᛕ', 76:'ɭ', 77:'๓', 78:'ก', 79:'ѻ', 80:'ρ', 81:'۹', 82:'ɼ', 83:'ร', 84:'Շ', 85:'પ', 86:'۷', 87:'ฝ', 88:'ซ', 89:'ץ', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ค', 98:'๒', 99:'ƈ', 100:'ɗ', 101:'ﻉ', 102:'ि', 103:'ﻭ', 104:'ɦ', 105:'ٱ', 106:'ﻝ', 107:'ᛕ', 108:'ɭ', 109:'๓', 110:'ก', 111:'ѻ', 112:'ρ', 113:'۹', 114:'ɼ', 115:'ร', 116:'Շ', 117:'પ', 118:'۷', 119:'ฝ', 120:'ซ', 121:'ץ', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'misc2', name: 'Misc 2', type: 'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'α', 66:'в', 67:'¢', 68:'∂', 69:'є', 70:'ƒ', 71:'ﻭ', 72:'н', 73:'ι', 74:'נ', 75:'к', 76:'ℓ', 77:'м', 78:'η', 79:'σ', 80:'ρ', 81:'۹', 82:'я', 83:'ѕ', 84:'т', 85:'υ', 86:'ν', 87:'ω', 88:'χ', 89:'у', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'α', 98:'в', 99:'¢', 100:'∂', 101:'є', 102:'ƒ', 103:'ﻭ', 104:'н', 105:'ι', 106:'נ', 107:'к', 108:'ℓ', 109:'м', 110:'η', 111:'σ', 112:'ρ', 113:'۹', 114:'я', 115:'ѕ', 116:'т', 117:'υ', 118:'ν', 119:'ω', 120:'χ', 121:'у', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'misc3', name: 'Misc 3', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ค', 66:'๒', 67:'ς', 68:'๔', 69:'є', 70:'Ŧ', 71:'ﻮ', 72:'ђ', 73:'เ', 74:'ן', 75:'к', 76:'ɭ', 77:'๓', 78:'ภ', 79:'๏', 80:'ק', 81:'ợ', 82:'г', 83:'ร', 84:'Շ', 85:'ย', 86:'ש', 87:'ฬ', 88:'א', 89:'ץ', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ค', 98:'๒', 99:'ς', 100:'๔', 101:'є', 102:'Ŧ', 103:'ﻮ', 104:'ђ', 105:'เ', 106:'ן', 107:'к', 108:'ɭ', 109:'๓', 110:'ภ', 111:'๏', 112:'ק', 113:'ợ', 114:'г', 115:'ร', 116:'Շ', 117:'ย', 118:'ש', 119:'ฬ', 120:'א', 121:'ץ', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'cyrillic', name: 'Cyrillic',type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Д', 66:'Б', 67:'Ҁ', 68:'ↁ', 69:'Є', 70:'Ғ', 71:'Б', 72:'Н', 73:'І', 74:'Ј', 75:'Ќ', 76:'L', 77:'М', 78:'И', 79:'Ф', 80:'Р', 81:'Q', 82:'Я', 83:'Ѕ', 84:'Г', 85:'Ц', 86:'V', 87:'Щ', 88:'Ж', 89:'Ч', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'а', 98:'ъ', 99:'с', 100:'ↁ', 101:'э', 102:'ғ', 103:'Б', 104:'Ђ', 105:'і', 106:'ј', 107:'к', 108:'l', 109:'м', 110:'и', 111:'о', 112:'р', 113:'q', 114:'ѓ', 115:'ѕ', 116:'т', 117:'ц', 118:'v', 119:'ш', 120:'х', 121:'Ў', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'ethiopic', name: 'Ethiopic', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ል', 66:'ጌ', 67:'ር', 68:'ዕ', 69:'ቿ', 70:'ቻ', 71:'ኗ', 72:'ዘ', 73:'ጎ', 74:'ጋ', 75:'ጕ', 76:'ረ', 77:'ጠ', 78:'ክ', 79:'ዐ', 80:'የ', 81:'ዒ', 82:'ዪ', 83:'ነ', 84:'ፕ', 85:'ሁ', 86:'ሀ', 87:'ሠ', 88:'ሸ', 89:'ሃ', 90:'ጊ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ል', 98:'ጌ', 99:'ር', 100:'ዕ', 101:'ቿ', 102:'ቻ', 103:'ኗ', 104:'ዘ', 105:'ጎ', 106:'ጋ', 107:'ጕ', 108:'ረ', 109:'ጠ', 110:'ክ', 111:'ዐ', 112:'የ', 113:'ዒ', 114:'ዪ', 115:'ነ', 116:'ፕ', 117:'ሁ', 118:'ሀ', 119:'ሠ', 120:'ሸ', 121:'ሃ', 122:'ጊ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'fraktur', name: 'Fraktur', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝔄', 66:'𝔅', 67:'ℭ', 68:'𝔇', 69:'𝔈', 70:'𝔉', 71:'𝔊', 72:'ℌ', 73:'ℑ', 74:'𝔍', 75:'𝔎', 76:'𝔏', 77:'𝔐', 78:'𝔑', 79:'𝔒', 80:'𝔓', 81:'𝔔', 82:'ℜ', 83:'𝔖', 84:'𝔗', 85:'𝔘', 86:'𝔙', 87:'𝔚', 88:'𝔛', 89:'𝔜', 90:'ℨ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝔞', 98:'𝔟', 99:'𝔠', 100:'𝔡', 101:'𝔢', 102:'𝔣', 103:'𝔤', 104:'𝔥', 105:'𝔦', 106:'𝔧', 107:'𝔨', 108:'𝔩', 109:'𝔪', 110:'𝔫', 111:'𝔬', 112:'𝔭', 113:'𝔮', 114:'𝔯', 115:'𝔰', 116:'𝔱', 117:'𝔲', 118:'𝔳', 119:'𝔴', 120:'𝔵', 121:'𝔶', 122:'𝔷', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id: 'dots', name: 'Dots', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'⸚', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'ӟ', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Ä', 66:'Ḅ', 67:'Ċ', 68:'Ḋ', 69:'Ё', 70:'Ḟ', 71:'Ġ', 72:'Ḧ', 73:'Ї', 74:'J', 75:'Ḳ', 76:'Ḷ', 77:'Ṁ', 78:'Ṅ', 79:'Ö', 80:'Ṗ', 81:'Q', 82:'Ṛ', 83:'Ṡ', 84:'Ṫ', 85:'Ü', 86:'Ṿ', 87:'Ẅ', 88:'Ẍ', 89:'Ÿ', 90:'Ż', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ä', 98:'ḅ', 99:'ċ', 100:'ḋ', 101:'ë', 102:'ḟ', 103:'ġ', 104:'ḧ', 105:'ï', 106:'j', 107:'ḳ', 108:'ḷ', 109:'ṁ', 110:'ṅ', 111:'ö', 112:'ṗ', 113:'q', 114:'ṛ', 115:'ṡ', 116:'ẗ', 117:'ü', 118:'ṿ', 119:'ẅ', 120:'ẍ', 121:'ÿ', 122:'ż', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id:'smallCaps', name: 'Small Caps', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ᴀ', 66:'ʙ', 67:'ᴄ', 68:'ᴅ', 69:'ᴇ', 70:'ꜰ', 71:'ɢ', 72:'ʜ', 73:'ɪ', 74:'ᴊ', 75:'ᴋ', 76:'ʟ', 77:'ᴍ', 78:'ɴ', 79:'ᴏ', 80:'ᴩ', 81:'Q', 82:'ʀ', 83:'ꜱ', 84:'ᴛ', 85:'ᴜ', 86:'ᴠ', 87:'ᴡ', 88:'x', 89:'Y', 90:'ᴢ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ᴀ', 98:'ʙ', 99:'ᴄ', 100:'ᴅ', 101:'ᴇ', 102:'ꜰ', 103:'ɢ', 104:'ʜ', 105:'ɪ', 106:'ᴊ', 107:'ᴋ', 108:'ʟ', 109:'ᴍ', 110:'ɴ', 111:'ᴏ', 112:'ᴩ', 113:'q', 114:'ʀ', 115:'ꜱ', 116:'ᴛ', 117:'ᴜ', 118:'ᴠ', 119:'ᴡ', 120:'x', 121:'y', 122:'ᴢ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id:'stroked', name: 'Stroked', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'ƻ', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Ⱥ', 66:'Ƀ', 67:'Ȼ', 68:'Đ', 69:'Ɇ', 70:'F', 71:'Ǥ', 72:'Ħ', 73:'Ɨ', 74:'Ɉ', 75:'Ꝁ', 76:'Ł', 77:'M', 78:'N', 79:'Ø', 80:'Ᵽ', 81:'Ꝗ', 82:'Ɍ', 83:'S', 84:'Ŧ', 85:'ᵾ', 86:'V', 87:'W', 88:'X', 89:'Ɏ', 90:'Ƶ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'Ⱥ', 98:'ƀ', 99:'ȼ', 100:'đ', 101:'ɇ', 102:'f', 103:'ǥ', 104:'ħ', 105:'ɨ', 106:'ɉ', 107:'ꝁ', 108:'ł', 109:'m', 110:'n', 111:'ø', 112:'ᵽ', 113:'ꝗ', 114:'ɍ', 115:'s', 116:'ŧ', 117:'ᵾ', 118:'v', 119:'w', 120:'x', 121:'ɏ', 122:'ƶ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id:'subscript', name: 'Subscript', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'₀', 49:'₁', 50:'₂', 51:'₃', 52:'₄', 53:'₅', 54:'₆', 55:'₇', 56:'₈', 57:'₉', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ₐ', 66:'B', 67:'C', 68:'D', 69:'ₑ', 70:'F', 71:'G', 72:'ₕ', 73:'ᵢ', 74:'ⱼ', 75:'ₖ', 76:'ₗ', 77:'ₘ', 78:'ₙ', 79:'ₒ', 80:'ₚ', 81:'Q', 82:'ᵣ', 83:'ₛ', 84:'ₜ', 85:'ᵤ', 86:'ᵥ', 87:'W', 88:'ₓ', 89:'Y', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ₐ', 98:'b', 99:'c', 100:'d', 101:'ₑ', 102:'f', 103:'g', 104:'ₕ', 105:'ᵢ', 106:'ⱼ', 107:'ₖ', 108:'ₗ', 109:'ₘ', 110:'ₙ', 111:'ₒ', 112:'ₚ', 113:'q', 114:'ᵣ', 115:'ₛ', 116:'ₜ', 117:'ᵤ', 118:'ᵥ', 119:'w', 120:'ₓ', 121:'y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  {id:'superscript', name: 'Superscript', type:'alphabet', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'⁰', 49:'¹', 50:'²', 51:'³', 52:'⁴', 53:'⁵', 54:'⁶', 55:'⁷', 56:'⁸', 57:'⁹', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ᴬ', 66:'ᴮ', 67:'ᶜ', 68:'ᴰ', 69:'ᴱ', 70:'ᶠ', 71:'ᴳ', 72:'ᴴ', 73:'ᴵ', 74:'ᴶ', 75:'ᴷ', 76:'ᴸ', 77:'ᴹ', 78:'ᴺ', 79:'ᴼ', 80:'ᴾ', 81:'Q', 82:'ᴿ', 83:'ˢ', 84:'ᵀ', 85:'ᵁ', 86:'ⱽ', 87:'ᵂ', 88:'ˣ', 89:'ʸ', 90:'ᶻ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ᵃ', 98:'ᵇ', 99:'ᶜ', 100:'ᵈ', 101:'ᵉ', 102:'ᶠ', 103:'ᵍ', 104:'ʰ', 105:'ⁱ', 106:'ʲ', 107:'ᵏ', 108:'ˡ', 109:'ᵐ', 110:'ⁿ', 111:'ᵒ', 112:'ᵖ', 113:'q', 114:'ʳ', 115:'ˢ', 116:'ᵗ', 117:'ᵘ', 118:'ᵛ', 119:'ʷ', 120:'ˣ', 121:'ʸ', 122:'ᶻ', 123:'{', 124:'|', 125:'}', 126:'~'}}

];
 function doAlphabetConversion (text,alphabet){
    //split the text up into individual characters
    var characters = text.split("");
    //variable to hold the result of the conversion; characters will be added to this
    var result = "";
    //iterate over each character in the text
    for(i=0;i<characters.length;i++){
      //get the current character (to make things easier)
      var currentChar = characters[i];
      //check the if the current character's code is included in the alphabet
      if(alphabet[currentChar.charCodeAt(0)]){
        //add the equivalent character to the result string
        result += alphabet[currentChar.charCodeAt(0)];
      }
      //if it's not:
      else
      {
        //skip over this character and move to the next one
        //add the original character to the result string
        result += currentChar;
      }
    }
    //return the final string once we're done with the conversion
    return result;
  }

module.exports.processText = function(effectID, inputText)
{
    function process(effectID, inputText)
    {
        var effect = module.exports.getEffectByID(effectID);
        if(effect !== null)
        {
            var type = effect.type;
            if(type==='alphabet')
            {
                if(effect.alphabet)
                {
                    return doAlphabetConversion(inputText, effect.alphabet);
                }
            }
            else if(type === 'custom')
            {
                if(effect.processor)
                {
                    return effect.processor(inputText);
                }
            }
            return inputText;
        }
    }

    //The following code lets people do partial effects by enclosing the part(s) they want the effect applied to between backticks (`) or pipes (|).

	var gPattern = /[|`]([^`|]*)[`|]/g;  //global pattern to match all text between backticks or pipes (allows matching multiple results)
    var pattern = /[|`]([^`|]*)[`|]/;  //non-global pattern (allows us to test if there is at least one match without throwing off the global pattern)
    if(pattern.test(inputText)) //if we have any matches at all, at least one
    {
        var matches = []; //array to hold all regex matches
        while(current = gPattern.exec(inputText))  //the way regular expressions work, the pattern has to be executed multiple times to get all the matches
                                                   // this will repeat until there are no more matches, and put them all into the array
        {
            matches.push(current);  //push all the matches to the array
        }
        var replace = []; //array to hold all the text pieces to replace the matches with, once they've been processed with an effect
        for(var i=0;i<matches.length;i++)     //iterate over all the matches
        {
            replace.push(process(effectID, matches[i][1]));  //process only group number 1 (the stuff inside the backticks) and put it in the replace array
        }
        var outStr = ''; //empty string to hold the result; we'll build onto this as we go
        var done = false;  //whether or not we're done. will be used to break the loop later
        var startIndex = 0; //the current starting index (point in the string at which we will start taking regular text)
        var currentMatch = 0; //the current regex match we're on
        while(!done)  //while the done flag has not been set, keep going. we'll set this when we run out of matches
        {
            if(matches[currentMatch]) { //as long as the current match is not null (if it is, we ran out of matches)
                for (var i = startIndex; i < matches[currentMatch].index; i++) { //for all the letters between the current start index and the index of the current match (all the normal text)
                    outStr += inputText.charAt(i);  //add the letters to the output string
                }
                outStr += replace[currentMatch]; //add the processed text for the current match to the output string
                startIndex = matches[currentMatch].index + matches[currentMatch][0].length; //set the start index to the index of the first normal letter after the match (current match start index plus its length)
                currentMatch += 1; //move on to the next match (add one to current match)
            }
            else //if the current match is null (we ran out of matches)
            {
                outStr += inputText.substring(startIndex); //add just the rest of the input to the output string (starting at the start index)
                done = true;  //set the done flag to break out of the loop
            }
        }
        return outStr; //return the output string
    }
    else //if the regex fails (no matches)
    {
        return process(effectID, inputText); //just process the entire text normally and return it
    }
}

module.exports.getEffectByID = function(effectID)
{
	if(effectID === null || effectID === '')
	{
		return null; //return null if no effect name was given
	}
	for(var i=0; i<module.exports.effects.length; i++) //loop through all the effects
	{
		current = module.exports.effects[i]; //variable to hold the current effect
		if(current.id === effectID) //if the names match
		{
			return current; //return the current effect; it's what we're looking for
		}
	}
	return null; //nothing was found, so return null
}

function em(name){
  var e = emoji.find(name);
  if(e){
    return e.emoji;
  } else {
    return e;
  }
}

function emojify(input)
{
  var emojis = [];
  emojis.push(em('joy'));
  emojis.push(em('b'));
  emojis.push(em('ok_hand'));
  emojis.push(em('fire'));
  emojis.push(em('weary'));
  emojis.push(em('thumbsup'));
  emojis.push(em('100'));
  emojis.push(em('pray'));
  emojis.push(em('raised_hands'));
  emojis.push(em('eyes'));
  emojis.push(em('joy_cat'));
  emojis.push(em('a'));
  emojis.push(em('sunglasses'));
  emojis.push(em('thinking_face'));

  for(var e in emojis)
  {
    if(emojis[e] === undefined)
    {
      log("Undefined emoji! "+e,levels.err);
    }
  }

  function randomEmoji()
  {
    var max = emojis.length -1 ;
    var num = Math.round(Math.random()*max);
    return emojis[num];
  }

  var words = input.split(" ");
  var output = "";
  for(var i=0; i<words.length; i++)
  {
    var current = words[i];

    output += current;
    output += " ";
    output += randomEmoji();
    output += randomEmoji();
    output += " ";
  }

	return output;
}

function clap(input)
{
  var clap = emoji.find('clap').emoji;
  var words = input.split(' ');
  var output = "";
  for(var i = 0; i< words.length-1; i++)
  {
    output+=words[i];
    output+=" ";
    output+=clap;
    output+=" ";
  }
  //add just the last word, without a clap emoji at the end
  output+= words[words.length-1];
  return output;
}

function think(input)
{
  var think = emoji.find('thinking_face').emoji;
  var words = input.split(' ');
  var output = think+" "; //start off with a thinking emoji
  for(var i = 0; i<words.length; i++)
  {
    output+=words[i];
    output+=" ";
    output+=think;
    output+=" ";
  }
  return output;
}

function random_caps(input)
{
  var output = "";
  var capsCount = 0;
  var lowerCount = 0;
  var letters = input.split('');
  for(var i = 0; i<letters.length; i++)
  {
    var random = Math.random();
    if(capsCount>=3 || (random>0.5 && lowerCount<3)){
      output+=letters[i].toLowerCase();
      capsCount = 0;
      lowerCount++;
    }
    else if(lowerCount>=3 || (random<0.5 && capsCount<3)){
      output+=letters[i].toUpperCase();
      lowerCount = 0;
      capsCount++;
    }
  }
  return output;
}

