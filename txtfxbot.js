/******************************************
 *               TxtFX Bot                *
 *         Created by Evan Straw          *
 * Applies various Unicode alphabet and   *
 * pseudoalphabet effects to text         *
 * inputted via Telegram.                 *
 *                                        *
 * This code is under the MIT License     *
 * (see LICENSE)                          *
 *******************************************/

//require the colors library for colorful output text
var colors = require("colors");
//require logutil.js
var logutil = require("./logutil.js");
//require the log function (see logutils.js)
var log = logutil.log;
var exit = logutil.exit;
var levels = logutil.levels;
log("Program start!",levels.info);
log("Importing libraries...",levels.info);
var TelegramBot = require("node-telegram-bot-api");

//Start the actual program
//check command line arguments
checkArguments();
//variable to hold the API key
var key = process.argv[2];
//start telegram functions (tests key)
log("Starting Telegram Bot...",levels.info);
startTelegram();

//variable to hold the bot instance once it is created
var bot = {};
//variable to hold the bot information
var me = {};

//constant to hold the usage message (will be displayed if the user gets one of the arguments wrong)
//The arguments required for the program right now are:
// 1. The node command
// 2. The name of the program ("txtfxbot.js")
// 3. The key for the Telegram Bot API
const usage = "node txtfxbot.js <Telegram Bot API key>"

//object that holds the alphabet mappings.
//all the printing ASCII characters (ASCII codes 32-126) are mapped by code to the Unicode character equivalent.
//  for example: in the "circled" pseudoalphabet, character code 65 ('A') is mapped to 'Ⓐ'
//also contains some extra info about the alphabet
//structure:
//alphabetMap
//|-rtl: whether or not the text should be reversed. Unsure at this point whether to use an RTL character or just print the text in reverse order. Probably will go with the latter, RTLs tend to be annoying to some users
//|-name: The display name for the alphabet, will be shown to users
//|-alphabet: the actual alphabet mapping
//  |-character code
//    |- alphabet equivalent
//
// NOTE: I didn't write this whole thing manually, I used a small python script to generate it (see conversion.py)
const alphabetMap = {
	normalASCII: {rtl: false, name: 'Normal ASCII', alphabet:{32:' ', 33:'!', 34:'"', 35:'#', 36:'$', 37:'%', 38:'&', 39:"'", 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'A', 66:'B', 67:'C', 68:'D', 69:'E', 70:'F', 71:'G', 72:'H', 73:'I', 74:'J', 75:'K', 76:'L', 77:'M', 78:'N', 79:'O', 80:'P', 81:'Q', 82:'R', 83:'S', 84:'T', 85:'U', 86:'V', 87:'W', 88:'X', 89:'Y', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'a', 98:'b', 99:'c', 100:'d', 101:'e', 102:'f', 103:'g', 104:'h', 105:'i', 106:'j', 107:'k', 108:'l', 109:'m', 110:'n', 111:'o', 112:'p', 113:'q', 114:'r', 115:'s', 116:'t', 117:'u', 118:'v', 119:'w', 120:'x', 121:'y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
	circled: {rtl: false, name: 'Circled', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'⊛', 43:'⊕', 44:',', 45:'⊖', 46:'⨀', 47:'⊘', 48:'0', 49:'①', 50:'②', 51:'③', 52:'④', 53:'⑤', 54:'⑥', 55:'⑦', 56:'⑧', 57:'⑨', 58:':', 59:';', 60:'⧀', 61:'⊜', 62:'⧁', 63:'?', 64:'@', 65:'Ⓐ', 66:'Ⓑ', 67:'Ⓒ', 68:'Ⓓ', 69:'Ⓔ', 70:'Ⓕ', 71:'Ⓖ', 72:'Ⓗ', 73:'Ⓘ', 74:'Ⓙ', 75:'Ⓚ', 76:'Ⓛ', 77:'Ⓜ', 78:'Ⓝ', 79:'Ⓞ', 80:'Ⓟ', 81:'Ⓠ', 82:'Ⓡ', 83:'Ⓢ', 84:'Ⓣ', 85:'Ⓤ', 86:'Ⓥ', 87:'Ⓦ', 88:'Ⓧ', 89:'Ⓨ', 90:'Ⓩ', 91:'[', 92:'⦸', 93:']', 94:'^', 95:'_', 96:'`', 97:'ⓐ', 98:'ⓑ', 99:'ⓒ', 100:'ⓓ', 101:'ⓔ', 102:'ⓕ', 103:'ⓖ', 104:'ⓗ', 105:'ⓘ', 106:'ⓙ', 107:'ⓚ', 108:'ⓛ', 109:'ⓜ', 110:'ⓝ', 111:'ⓞ', 112:'ⓟ', 113:'ⓠ', 114:'ⓡ', 115:'ⓢ', 116:'ⓣ', 117:'ⓤ', 118:'ⓥ', 119:'ⓦ', 120:'ⓧ', 121:'ⓨ', 122:'ⓩ', 123:'{', 124:'⦶', 125:'}', 126:'~'}},
  circledNegative: {rtl: false, name: 'Circled (Negative)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'⓿', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🅐', 66:'🅑', 67:'🅒', 68:'🅓', 69:'🅔', 70:'🅕', 71:'🅖', 72:'🅗', 73:'🅘', 74:'🅙', 75:'🅚', 76:'🅛', 77:'🅜', 78:'🅝', 79:'🅞', 80:'🅟', 81:'🅠', 82:'🅡', 83:'🅢', 84:'🅣', 85:'🅤', 86:'🅥', 87:'🅦', 88:'🅧', 89:'🅨', 90:'🅩', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'🅐', 98:'🅑', 99:'🅒', 100:'🅓', 101:'🅔', 102:'🅕', 103:'🅖', 104:'🅗', 105:'🅘', 106:'🅙', 107:'🅚', 108:'🅛', 109:'🅜', 110:'🅝', 111:'🅞', 112:'🅟', 113:'🅠', 114:'🅡', 115:'🅢', 116:'🅣', 117:'🅤', 118:'🅥', 119:'🅦', 120:'🅧', 121:'🅨', 122:'🅩', 123:'{', 124:'|', 125:'}', 126:'~'}},
	fullwidth: {rtl: false, name: 'Full Width', alphabet:{32:' ', 33:'！', 34:'\"', 35:'＃', 36:'＄', 37:'％', 38:'＆', 39:'＇', 40:'（', 41:'）', 42:'＊', 43:'＋', 44:'，', 45:'－', 46:'．', 47:'／', 48:'０', 49:'１', 50:'２', 51:'３', 52:'４', 53:'５', 54:'６', 55:'７', 56:'８', 57:'９', 58:'：', 59:'；', 60:'<', 61:'＝', 62:'>', 63:'？', 64:'＠', 65:'Ａ', 66:'Ｂ', 67:'Ｃ', 68:'Ｄ', 69:'Ｅ', 70:'Ｆ', 71:'Ｇ', 72:'Ｈ', 73:'Ｉ', 74:'Ｊ', 75:'Ｋ', 76:'Ｌ', 77:'Ｍ', 78:'Ｎ', 79:'Ｏ', 80:'Ｐ', 81:'Ｑ', 82:'Ｒ', 83:'Ｓ', 84:'Ｔ', 85:'Ｕ', 86:'Ｖ', 87:'Ｗ', 88:'Ｘ', 89:'Ｙ', 90:'Ｚ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ａ', 98:'ｂ', 99:'ｃ', 100:'ｄ', 101:'ｅ', 102:'ｆ', 103:'ｇ', 104:'ｈ', 105:'ｉ', 106:'ｊ', 107:'ｋ', 108:'ｌ', 109:'ｍ', 110:'ｎ', 111:'ｏ', 112:'ｐ', 113:'ｑ', 114:'ｒ', 115:'ｓ', 116:'ｔ', 117:'ｕ', 118:'ｖ', 119:'ｗ', 120:'ｘ', 121:'ｙ', 122:'ｚ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathBold: {rtl: false, name: 'Math (Bold)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'𝟎', 49:'𝟏', 50:'𝟐', 51:'𝟑', 52:'𝟒', 53:'𝟓', 54:'𝟔', 55:'𝟕', 56:'𝟖', 57:'𝟗', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝐀', 66:'𝐁', 67:'𝐂', 68:'𝐃', 69:'𝐄', 70:'𝐅', 71:'𝐆', 72:'𝐇', 73:'𝐈', 74:'𝐉', 75:'𝐊', 76:'𝐋', 77:'𝐌', 78:'𝐍', 79:'𝐎', 80:'𝐏', 81:'𝐐', 82:'𝐑', 83:'𝐒', 84:'𝐓', 85:'𝐔', 86:'𝐕', 87:'𝐖', 88:'𝐗', 89:'𝐘', 90:'𝐙', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝐚', 98:'𝐛', 99:'𝐜', 100:'𝐝', 101:'𝐞', 102:'𝐟', 103:'𝐠', 104:'𝐡', 105:'𝐢', 106:'𝐣', 107:'𝐤', 108:'𝐥', 109:'𝐦', 110:'𝐧', 111:'𝐨', 112:'𝐩', 113:'𝐪', 114:'𝐫', 115:'𝐬', 116:'𝐭', 117:'𝐮', 118:'𝐯', 119:'𝐰', 120:'𝐱', 121:'𝐲', 122:'𝐳', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathFraktur: {rtl: false, name: 'Math (Fraktur)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝕬', 66:'𝕭', 67:'𝕮', 68:'𝕯', 69:'𝕰', 70:'𝕱', 71:'𝕲', 72:'𝕳', 73:'𝕴', 74:'𝕵', 75:'𝕶', 76:'𝕷', 77:'𝕸', 78:'𝕹', 79:'𝕺', 80:'𝕻', 81:'𝕼', 82:'𝕽', 83:'𝕾', 84:'𝕿', 85:'𝖀', 86:'𝖁', 87:'𝖂', 88:'𝖃', 89:'𝖄', 90:'𝖅', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝖆', 98:'𝖇', 99:'𝖈', 100:'𝖉', 101:'𝖊', 102:'𝖋', 103:'𝖌', 104:'𝖍', 105:'𝖎', 106:'𝖏', 107:'𝖐', 108:'𝖑', 109:'𝖒', 110:'𝖓', 111:'𝖔', 112:'𝖕', 113:'𝖖', 114:'𝖗', 115:'𝖘', 116:'𝖙', 117:'𝖚', 118:'𝖛', 119:'𝖜', 120:'𝖝', 121:'𝖞', 122:'𝖟', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathBoldItalic: {rtl: false, name: 'Math (Bold+Italic)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝑨', 66:'𝑩', 67:'𝑪', 68:'𝑫', 69:'𝑬', 70:'𝑭', 71:'𝑮', 72:'𝑯', 73:'𝑰', 74:'𝑱', 75:'𝑲', 76:'𝑳', 77:'𝑴', 78:'𝑵', 79:'𝑶', 80:'𝑷', 81:'𝑸', 82:'𝑹', 83:'𝑺', 84:'𝑻', 85:'𝑼', 86:'𝑽', 87:'𝑾', 88:'𝑿', 89:'𝒀', 90:'𝒁', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝒂', 98:'𝒃', 99:'𝒄', 100:'𝒅', 101:'𝒆', 102:'𝒇', 103:'𝒈', 104:'𝒉', 105:'𝒊', 106:'𝒋', 107:'𝒌', 108:'𝒍', 109:'𝒎', 110:'𝒏', 111:'𝒐', 112:'𝒑', 113:'𝒒', 114:'𝒓', 115:'𝒔', 116:'𝒕', 117:'𝒖', 118:'𝒗', 119:'𝒘', 120:'𝒙', 121:'𝒚', 122:'𝒛', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathScript: {rtl: false, name: 'Math (Script)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝓐', 66:'𝓑', 67:'𝓒', 68:'𝓓', 69:'𝓔', 70:'𝓕', 71:'𝓖', 72:'𝓗', 73:'𝓘', 74:'𝓙', 75:'𝓚', 76:'𝓛', 77:'𝓜', 78:'𝓝', 79:'𝓞', 80:'𝓟', 81:'𝓠', 82:'𝓡', 83:'𝓢', 84:'𝓣', 85:'𝓤', 86:'𝓥', 87:'𝓦', 88:'𝓧', 89:'𝓨', 90:'𝓩', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝓪', 98:'𝓫', 99:'𝓬', 100:'𝓭', 101:'𝓮', 102:'𝓯', 103:'𝓰', 104:'𝓱', 105:'𝓲', 106:'𝓳', 107:'𝓴', 108:'𝓵', 109:'𝓶', 110:'𝓷', 111:'𝓸', 112:'𝓹', 113:'𝓺', 114:'𝓻', 115:'𝓼', 116:'𝓽', 117:'𝓾', 118:'𝓿', 119:'𝔀', 120:'𝔁', 121:'𝔂', 122:'𝔃', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathDoubleStruck: {rtl: false, name: 'Math (Double-Struck)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'𝟘', 49:'𝟙', 50:'𝟚', 51:'𝟛', 52:'𝟜', 53:'𝟝', 54:'𝟞', 55:'𝟟', 56:'𝟠', 57:'𝟡', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝔸', 66:'𝔹', 67:'ℂ', 68:'𝔻', 69:'𝔼', 70:'𝔽', 71:'𝔾', 72:'ℍ', 73:'𝕀', 74:'𝕁', 75:'𝕂', 76:'𝕃', 77:'𝕄', 78:'ℕ', 79:'𝕆', 80:'ℙ', 81:'ℚ', 82:'ℝ', 83:'𝕊', 84:'𝕋', 85:'𝕌', 86:'𝕍', 87:'𝕎', 88:'𝕏', 89:'𝕐', 90:'ℤ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝕒', 98:'𝕓', 99:'𝕔', 100:'𝕕', 101:'𝕖', 102:'𝕗', 103:'𝕘', 104:'𝕙', 105:'𝕚', 106:'𝕛', 107:'𝕜', 108:'𝕝', 109:'𝕞', 110:'𝕟', 111:'𝕠', 112:'𝕡', 113:'𝕢', 114:'𝕣', 115:'𝕤', 116:'𝕥', 117:'𝕦', 118:'𝕧', 119:'𝕨', 120:'𝕩', 121:'𝕪', 122:'𝕫', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathMonospace: {rtl: false, name: 'Math (Monospace)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'𝟶', 49:'𝟷', 50:'𝟸', 51:'𝟹', 52:'𝟺', 53:'𝟻', 54:'𝟼', 55:'𝟽', 56:'𝟾', 57:'𝟿', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝙰', 66:'𝙱', 67:'𝙲', 68:'𝙳', 69:'𝙴', 70:'𝙵', 71:'𝙶', 72:'𝙷', 73:'𝙸', 74:'𝙹', 75:'𝙺', 76:'𝙻', 77:'𝙼', 78:'𝙽', 79:'𝙾', 80:'𝙿', 81:'𝚀', 82:'𝚁', 83:'𝚂', 84:'𝚃', 85:'𝚄', 86:'𝚅', 87:'𝚆', 88:'𝚇', 89:'𝚈', 90:'𝚉', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝚊', 98:'𝚋', 99:'𝚌', 100:'𝚍', 101:'𝚎', 102:'𝚏', 103:'𝚐', 104:'𝚑', 105:'𝚒', 106:'𝚓', 107:'𝚔', 108:'𝚕', 109:'𝚖', 110:'𝚗', 111:'𝚘', 112:'𝚙', 113:'𝚚', 114:'𝚛', 115:'𝚜', 116:'𝚝', 117:'𝚞', 118:'𝚟', 119:'𝚠', 120:'𝚡', 121:'𝚢', 122:'𝚣', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathSans: {rtl: false, name: 'Math (Sans)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'𝟢', 49:'𝟣', 50:'𝟤', 51:'𝟥', 52:'𝟦', 53:'𝟧', 54:'𝟨', 55:'𝟩', 56:'𝟪', 57:'𝟫', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝖠', 66:'𝖡', 67:'𝖢', 68:'𝖣', 69:'𝖤', 70:'𝖥', 71:'𝖦', 72:'𝖧', 73:'𝖨', 74:'𝖩', 75:'𝖪', 76:'𝖫', 77:'𝖬', 78:'𝖭', 79:'𝖮', 80:'𝖯', 81:'𝖰', 82:'𝖱', 83:'𝖲', 84:'𝖳', 85:'𝖴', 86:'𝖵', 87:'𝖶', 88:'𝖷', 89:'𝖸', 90:'𝖹', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝖺', 98:'𝖻', 99:'𝖼', 100:'𝖽', 101:'𝖾', 102:'𝖿', 103:'𝗀', 104:'𝗁', 105:'𝗂', 106:'𝗃', 107:'𝗄', 108:'𝗅', 109:'𝗆', 110:'𝗇', 111:'𝗈', 112:'𝗉', 113:'𝗊', 114:'𝗋', 115:'𝗌', 116:'𝗍', 117:'𝗎', 118:'𝗏', 119:'𝗐', 120:'𝗑', 121:'𝗒', 122:'𝗓', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathSansBold: {rtl: false, name: 'Math (Sans+Bold)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'𝟬', 49:'𝟭', 50:'𝟮', 51:'𝟯', 52:'𝟰', 53:'𝟱', 54:'𝟲', 55:'𝟳', 56:'𝟴', 57:'𝟵', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝗔', 66:'𝗕', 67:'𝗖', 68:'𝗗', 69:'𝗘', 70:'𝗙', 71:'𝗚', 72:'𝗛', 73:'𝗜', 74:'𝗝', 75:'𝗞', 76:'𝗟', 77:'𝗠', 78:'𝗡', 79:'𝗢', 80:'𝗣', 81:'𝗤', 82:'𝗥', 83:'𝗦', 84:'𝗧', 85:'𝗨', 86:'𝗩', 87:'𝗪', 88:'𝗫', 89:'𝗬', 90:'𝗭', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝗮', 98:'𝗯', 99:'𝗰', 100:'𝗱', 101:'𝗲', 102:'𝗳', 103:'𝗴', 104:'𝗵', 105:'𝗶', 106:'𝗷', 107:'𝗸', 108:'𝗹', 109:'𝗺', 110:'𝗻', 111:'𝗼', 112:'𝗽', 113:'𝗾', 114:'𝗿', 115:'𝘀', 116:'𝘁', 117:'𝘂', 118:'𝘃', 119:'𝘄', 120:'𝘅', 121:'𝘆', 122:'𝘇', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathSansBoldItalic: {rtl: false, name: 'Math (Sans+Bold+Italic)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝘼', 66:'𝘽', 67:'𝘾', 68:'𝘿', 69:'𝙀', 70:'𝙁', 71:'𝙂', 72:'𝙃', 73:'𝙄', 74:'𝙅', 75:'𝙆', 76:'𝙇', 77:'𝙈', 78:'𝙉', 79:'𝙊', 80:'𝙋', 81:'𝙌', 82:'𝙍', 83:'𝙎', 84:'𝙏', 85:'𝙐', 86:'𝙑', 87:'𝙒', 88:'𝙓', 89:'𝙔', 90:'𝙕', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝙖', 98:'𝙗', 99:'𝙘', 100:'𝙙', 101:'𝙚', 102:'𝙛', 103:'𝙜', 104:'𝙝', 105:'𝙞', 106:'𝙟', 107:'𝙠', 108:'𝙡', 109:'𝙢', 110:'𝙣', 111:'𝙤', 112:'𝙥', 113:'𝙦', 114:'𝙧', 115:'𝙨', 116:'𝙩', 117:'𝙪', 118:'𝙫', 119:'𝙬', 120:'𝙭', 121:'𝙮', 122:'𝙯', 123:'{', 124:'|', 125:'}', 126:'~'}},
  mathSansItalic: {rtl: false, name: 'Math (Sans+Italic)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝘈', 66:'𝘉', 67:'𝘊', 68:'𝘋', 69:'𝘌', 70:'𝘍', 71:'𝘎', 72:'𝘏', 73:'𝘐', 74:'𝘑', 75:'𝘒', 76:'𝘓', 77:'𝘔', 78:'𝘕', 79:'𝘖', 80:'𝘗', 81:'𝘘', 82:'𝘙', 83:'𝘚', 84:'𝘛', 85:'𝘜', 86:'𝘝', 87:'𝘞', 88:'𝘟', 89:'𝘠', 90:'𝘡', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝘢', 98:'𝘣', 99:'𝘤', 100:'𝘥', 101:'𝘦', 102:'𝘧', 103:'𝘨', 104:'𝘩', 105:'𝘪', 106:'𝘫', 107:'𝘬', 108:'𝘭', 109:'𝘮', 110:'𝘯', 111:'𝘰', 112:'𝘱', 113:'𝘲', 114:'𝘳', 115:'𝘴', 116:'𝘵', 117:'𝘶', 118:'𝘷', 119:'𝘸', 120:'𝘹', 121:'𝘺', 122:'𝘻', 123:'{', 124:'|', 125:'}', 126:'~'}},
  parenthesized: {rtl: false, name: 'Parenthesized', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'⑴', 50:'⑵', 51:'⑶', 52:'⑷', 53:'⑸', 54:'⑹', 55:'⑺', 56:'⑻', 57:'⑼', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'⒜', 66:'⒝', 67:'⒞', 68:'⒟', 69:'⒠', 70:'⒡', 71:'⒢', 72:'⒣', 73:'⒤', 74:'⒥', 75:'⒦', 76:'⒧', 77:'⒨', 78:'⒩', 79:'⒪', 80:'⒫', 81:'⒬', 82:'⒭', 83:'⒮', 84:'⒯', 85:'⒰', 86:'⒱', 87:'⒲', 88:'⒳', 89:'⒴', 90:'⒵', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'⒜', 98:'⒝', 99:'⒞', 100:'⒟', 101:'⒠', 102:'⒡', 103:'⒢', 104:'⒣', 105:'⒤', 106:'⒥', 107:'⒦', 108:'⒧', 109:'⒨', 110:'⒩', 111:'⒪', 112:'⒫', 113:'⒬', 114:'⒭', 115:'⒮', 116:'⒯', 117:'⒰', 118:'⒱', 119:'⒲', 120:'⒳', 121:'⒴', 122:'⒵', 123:'{', 124:'|', 125:'}', 126:'~'}},
  symbolLetter: {rtl: false, name: 'Symbol Letters', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🇦', 66:'🇧', 67:'🇨', 68:'🇩', 69:'🇪', 70:'🇫', 71:'🇬', 72:'🇭', 73:'🇮', 74:'🇯', 75:'🇰', 76:'🇱', 77:'🇲', 78:'🇳', 79:'🇴', 80:'🇵', 81:'🇶', 82:'🇷', 83:'🇸', 84:'🇹', 85:'🇺', 86:'🇻', 87:'🇼', 88:'🇽', 89:'🇾', 90:'🇿', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'🇦', 98:'🇧', 99:'🇨', 100:'🇩', 101:'🇪', 102:'🇫', 103:'🇬', 104:'🇭', 105:'🇮', 106:'🇯', 107:'🇰', 108:'🇱', 109:'🇲', 110:'🇳', 111:'🇴', 112:'🇵', 113:'🇶', 114:'🇷', 115:'🇸', 116:'🇹', 117:'🇺', 118:'🇻', 119:'🇼', 120:'🇽', 121:'🇾', 122:'🇿', 123:'{', 124:'|', 125:'}', 126:'~'}},
  squared: {rtl: false, name: 'Squared', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'⧆', 43:'⊞', 44:',', 45:'⊟', 46:'⊡', 47:'⧄', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🄰', 66:'🄱', 67:'🄲', 68:'🄳', 69:'🄴', 70:'🄵', 71:'🄶', 72:'🄷', 73:'🄸', 74:'🄹', 75:'🄺', 76:'🄻', 77:'🄼', 78:'🄽', 79:'🄾', 80:'🄿', 81:'🅀', 82:'🅁', 83:'🅂', 84:'🅃', 85:'🅄', 86:'🅅', 87:'🅆', 88:'🅇', 89:'🅈', 90:'🅉', 91:'[', 92:'⧅', 93:']', 94:'^', 95:'_', 96:'`', 97:'🄰', 98:'🄱', 99:'🄲', 100:'🄳', 101:'🄴', 102:'🄵', 103:'🄶', 104:'🄷', 105:'🄸', 106:'🄹', 107:'🄺', 108:'🄻', 109:'🄼', 110:'🄽', 111:'🄾', 112:'🄿', 113:'🅀', 114:'🅁', 115:'🅂', 116:'🅃', 117:'🅄', 118:'🅅', 119:'🅆', 120:'🅇', 121:'🅈', 122:'🅉', 123:'{', 124:'|', 125:'}', 126:'~'}},
  squaredNegative: {rtl: false, name: 'Squared (Negative)', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'🅰', 66:'🅱', 67:'🅲', 68:'🅳', 69:'🅴', 70:'🅵', 71:'🅶', 72:'🅷', 73:'🅸', 74:'🅹', 75:'🅺', 76:'🅻', 77:'🅼', 78:'🅽', 79:'🅾', 80:'🅿', 81:'🆀', 82:'🆁', 83:'🆂', 84:'🆃', 85:'🆄', 86:'🆅', 87:'🆆', 88:'🆇', 89:'🆈', 90:'🆉', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'🅰', 98:'🅱', 99:'🅲', 100:'🅳', 101:'🅴', 102:'🅵', 103:'🅶', 104:'🅷', 105:'🅸', 106:'🅹', 107:'🅺', 108:'🅻', 109:'🅼', 110:'🅽', 111:'🅾', 112:'🅿', 113:'🆀', 114:'🆁', 115:'🆂', 116:'🆃', 117:'🆄', 118:'🆅', 119:'🆆', 120:'🆇', 121:'🆈', 122:'🆉', 123:'{', 124:'|', 125:'}', 126:'~'}},
  accents: {rtl: false, name: 'Accents', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Á', 66:'B', 67:'Ć', 68:'D', 69:'É', 70:'F', 71:'Ǵ', 72:'H', 73:'í', 74:'J', 75:'Ḱ', 76:'Ĺ', 77:'Ḿ', 78:'Ń', 79:'Ő', 80:'Ṕ', 81:'Q', 82:'Ŕ', 83:'ś', 84:'T', 85:'Ű', 86:'V', 87:'Ẃ', 88:'X', 89:'Ӳ', 90:'Ź', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'á', 98:'b', 99:'ć', 100:'d', 101:'é', 102:'f', 103:'ǵ', 104:'h', 105:'í', 106:'j', 107:'ḱ', 108:'ĺ', 109:'ḿ', 110:'ń', 111:'ő', 112:'ṕ', 113:'q', 114:'ŕ', 115:'ś', 116:'t', 117:'ú', 118:'v', 119:'ẃ', 120:'x', 121:'ӳ', 122:'ź', 123:'{', 124:'|', 125:'}', 126:'~'}},
  CJKThai: {rtl: false, name: 'CJK+Thai', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ﾑ', 66:'乃', 67:'c', 68:'d', 69:'乇', 70:'ｷ', 71:'g', 72:'ん', 73:'ﾉ', 74:'ﾌ', 75:'ズ', 76:'ﾚ', 77:'ﾶ', 78:'刀', 79:'o', 80:'ｱ', 81:'q', 82:'尺', 83:'丂', 84:'ｲ', 85:'u', 86:'√', 87:'w', 88:'ﾒ', 89:'ﾘ', 90:'乙', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ﾑ', 98:'乃', 99:'c', 100:'d', 101:'乇', 102:'ｷ', 103:'g', 104:'ん', 105:'ﾉ', 106:'ﾌ', 107:'ズ', 108:'ﾚ', 109:'ﾶ', 110:'刀', 111:'o', 112:'ｱ', 113:'q', 114:'尺', 115:'丂', 116:'ｲ', 117:'u', 118:'√', 119:'w', 120:'ﾒ', 121:'ﾘ', 122:'乙', 123:'{', 124:'|', 125:'}', 126:'~'}},
  curvy1: {rtl: false, name: 'Curvy 1', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'܁', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ค', 66:'๒', 67:'ƈ', 68:'ɗ', 69:'ﻉ', 70:'ि', 71:'ﻭ', 72:'ɦ', 73:'ٱ', 74:'ﻝ', 75:'ᛕ', 76:'ɭ', 77:'๓', 78:'ก', 79:'ѻ', 80:'ρ', 81:'۹', 82:'ɼ', 83:'ร', 84:'Շ', 85:'પ', 86:'۷', 87:'ฝ', 88:'ซ', 89:'ץ', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ค', 98:'๒', 99:'ƈ', 100:'ɗ', 101:'ﻉ', 102:'ि', 103:'ﻭ', 104:'ɦ', 105:'ٱ', 106:'ﻝ', 107:'ᛕ', 108:'ɭ', 109:'๓', 110:'ก', 111:'ѻ', 112:'ρ', 113:'۹', 114:'ɼ', 115:'ร', 116:'Շ', 117:'પ', 118:'۷', 119:'ฝ', 120:'ซ', 121:'ץ', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  curvy2: {rtl: false, name: 'Curvy 2', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'α', 66:'в', 67:'¢', 68:'∂', 69:'є', 70:'ƒ', 71:'ﻭ', 72:'н', 73:'ι', 74:'נ', 75:'к', 76:'ℓ', 77:'м', 78:'η', 79:'σ', 80:'ρ', 81:'۹', 82:'я', 83:'ѕ', 84:'т', 85:'υ', 86:'ν', 87:'ω', 88:'χ', 89:'у', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'α', 98:'в', 99:'¢', 100:'∂', 101:'є', 102:'ƒ', 103:'ﻭ', 104:'н', 105:'ι', 106:'נ', 107:'к', 108:'ℓ', 109:'м', 110:'η', 111:'σ', 112:'ρ', 113:'۹', 114:'я', 115:'ѕ', 116:'т', 117:'υ', 118:'ν', 119:'ω', 120:'χ', 121:'у', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  curvy3: {rtl: false, name: 'Curvy 3', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ค', 66:'๒', 67:'ς', 68:'๔', 69:'є', 70:'Ŧ', 71:'ﻮ', 72:'ђ', 73:'เ', 74:'ן', 75:'к', 76:'ɭ', 77:'๓', 78:'ภ', 79:'๏', 80:'ק', 81:'ợ', 82:'г', 83:'ร', 84:'Շ', 85:'ย', 86:'ש', 87:'ฬ', 88:'א', 89:'ץ', 90:'չ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ค', 98:'๒', 99:'ς', 100:'๔', 101:'є', 102:'Ŧ', 103:'ﻮ', 104:'ђ', 105:'เ', 106:'ן', 107:'к', 108:'ɭ', 109:'๓', 110:'ภ', 111:'๏', 112:'ק', 113:'ợ', 114:'г', 115:'ร', 116:'Շ', 117:'ย', 118:'ש', 119:'ฬ', 120:'א', 121:'ץ', 122:'չ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  cyrillic: {rtl: false, name: 'Cyrillic', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Д', 66:'Б', 67:'Ҁ', 68:'ↁ', 69:'Є', 70:'F', 71:'Б', 72:'Н', 73:'І', 74:'Ј', 75:'Ќ', 76:'L', 77:'М', 78:'И', 79:'Ф', 80:'Р', 81:'Q', 82:'Я', 83:'Ѕ', 84:'Г', 85:'Ц', 86:'V', 87:'Щ', 88:'Ж', 89:'Ч', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'а', 98:'ъ', 99:'с', 100:'ↁ', 101:'э', 102:'f', 103:'Б', 104:'Ђ', 105:'і', 106:'ј', 107:'к', 108:'l', 109:'м', 110:'и', 111:'о', 112:'р', 113:'q', 114:'ѓ', 115:'ѕ', 116:'т', 117:'ц', 118:'v', 119:'ш', 120:'х', 121:'Ў', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  ethiopic: {rtl: false, name: 'Ethiopic', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ል', 66:'ጌ', 67:'ር', 68:'ዕ', 69:'ቿ', 70:'ቻ', 71:'ኗ', 72:'ዘ', 73:'ጎ', 74:'ጋ', 75:'ጕ', 76:'ረ', 77:'ጠ', 78:'ክ', 79:'ዐ', 80:'የ', 81:'ዒ', 82:'ዪ', 83:'ነ', 84:'ፕ', 85:'ሁ', 86:'ሀ', 87:'ሠ', 88:'ሸ', 89:'ሃ', 90:'ጊ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ል', 98:'ጌ', 99:'ር', 100:'ዕ', 101:'ቿ', 102:'ቻ', 103:'ኗ', 104:'ዘ', 105:'ጎ', 106:'ጋ', 107:'ጕ', 108:'ረ', 109:'ጠ', 110:'ክ', 111:'ዐ', 112:'የ', 113:'ዒ', 114:'ዪ', 115:'ነ', 116:'ፕ', 117:'ሁ', 118:'ሀ', 119:'ሠ', 120:'ሸ', 121:'ሃ', 122:'ጊ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  fraktur: {rtl: false, name: 'Fraktur', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'𝔄', 66:'𝔅', 67:'ℭ', 68:'𝔇', 69:'𝔈', 70:'𝔉', 71:'𝔊', 72:'ℌ', 73:'ℑ', 74:'𝔍', 75:'𝔎', 76:'𝔏', 77:'𝔐', 78:'𝔑', 79:'𝔒', 80:'𝔓', 81:'𝔔', 82:'ℜ', 83:'𝔖', 84:'𝔗', 85:'𝔘', 86:'𝔙', 87:'𝔚', 88:'𝔛', 89:'𝔜', 90:'ℨ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'𝔞', 98:'𝔟', 99:'𝔠', 100:'𝔡', 101:'𝔢', 102:'𝔣', 103:'𝔤', 104:'𝔥', 105:'𝔦', 106:'𝔧', 107:'𝔨', 108:'𝔩', 109:'𝔪', 110:'𝔫', 111:'𝔬', 112:'𝔭', 113:'𝔮', 114:'𝔯', 115:'𝔰', 116:'𝔱', 117:'𝔲', 118:'𝔳', 119:'𝔴', 120:'𝔵', 121:'𝔶', 122:'𝔷', 123:'{', 124:'|', 125:'}', 126:'~'}},
  dots: {rtl: false, name: 'Dots', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'⸚', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'ӟ', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Ä', 66:'Ḅ', 67:'Ċ', 68:'Ḋ', 69:'Ё', 70:'Ḟ', 71:'Ġ', 72:'Ḧ', 73:'Ї', 74:'J', 75:'Ḳ', 76:'Ḷ', 77:'Ṁ', 78:'Ṅ', 79:'Ö', 80:'Ṗ', 81:'Q', 82:'Ṛ', 83:'Ṡ', 84:'Ṫ', 85:'Ü', 86:'Ṿ', 87:'Ẅ', 88:'Ẍ', 89:'Ÿ', 90:'Ż', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ä', 98:'ḅ', 99:'ċ', 100:'ḋ', 101:'ë', 102:'ḟ', 103:'ġ', 104:'ḧ', 105:'ï', 106:'j', 107:'ḳ', 108:'ḷ', 109:'ṁ', 110:'ṅ', 111:'ö', 112:'ṗ', 113:'q', 114:'ṛ', 115:'ṡ', 116:'ẗ', 117:'ü', 118:'ṿ', 119:'ẅ', 120:'ẍ', 121:'ÿ', 122:'ż', 123:'{', 124:'|', 125:'}', 126:'~'}},
  smallCaps: {rtl: false, name: 'Small Caps', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ᴀ', 66:'ʙ', 67:'ᴄ', 68:'ᴅ', 69:'ᴇ', 70:'ꜰ', 71:'ɢ', 72:'ʜ', 73:'ɪ', 74:'ᴊ', 75:'ᴋ', 76:'ʟ', 77:'ᴍ', 78:'ɴ', 79:'ᴏ', 80:'ᴩ', 81:'Q', 82:'ʀ', 83:'ꜱ', 84:'ᴛ', 85:'ᴜ', 86:'ᴠ', 87:'ᴡ', 88:'x', 89:'Y', 90:'ᴢ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ᴀ', 98:'ʙ', 99:'ᴄ', 100:'ᴅ', 101:'ᴇ', 102:'ꜰ', 103:'ɢ', 104:'ʜ', 105:'ɪ', 106:'ᴊ', 107:'ᴋ', 108:'ʟ', 109:'ᴍ', 110:'ɴ', 111:'ᴏ', 112:'ᴩ', 113:'q', 114:'ʀ', 115:'ꜱ', 116:'ᴛ', 117:'ᴜ', 118:'ᴠ', 119:'ᴡ', 120:'x', 121:'y', 122:'ᴢ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  stroked: {rtl: false, name: 'Stroked', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'ƻ', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'Ⱥ', 66:'Ƀ', 67:'Ȼ', 68:'Đ', 69:'Ɇ', 70:'F', 71:'Ǥ', 72:'Ħ', 73:'Ɨ', 74:'Ɉ', 75:'Ꝁ', 76:'Ł', 77:'M', 78:'N', 79:'Ø', 80:'Ᵽ', 81:'Ꝗ', 82:'Ɍ', 83:'S', 84:'Ŧ', 85:'ᵾ', 86:'V', 87:'W', 88:'X', 89:'Ɏ', 90:'Ƶ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'Ⱥ', 98:'ƀ', 99:'ȼ', 100:'đ', 101:'ɇ', 102:'f', 103:'ǥ', 104:'ħ', 105:'ɨ', 106:'ɉ', 107:'ꝁ', 108:'ł', 109:'m', 110:'n', 111:'ø', 112:'ᵽ', 113:'ꝗ', 114:'ɍ', 115:'s', 116:'ŧ', 117:'ᵾ', 118:'v', 119:'w', 120:'x', 121:'ɏ', 122:'ƶ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  subscript: {rtl: false, name: 'Subscript', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'₀', 49:'₁', 50:'₂', 51:'₃', 52:'₄', 53:'₅', 54:'₆', 55:'₇', 56:'₈', 57:'₉', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ₐ', 66:'B', 67:'C', 68:'D', 69:'ₑ', 70:'F', 71:'G', 72:'ₕ', 73:'ᵢ', 74:'ⱼ', 75:'ₖ', 76:'ₗ', 77:'ₘ', 78:'ₙ', 79:'ₒ', 80:'ₚ', 81:'Q', 82:'ᵣ', 83:'ₛ', 84:'ₜ', 85:'ᵤ', 86:'ᵥ', 87:'W', 88:'ₓ', 89:'Y', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ₐ', 98:'b', 99:'c', 100:'d', 101:'ₑ', 102:'f', 103:'g', 104:'ₕ', 105:'ᵢ', 106:'ⱼ', 107:'ₖ', 108:'ₗ', 109:'ₘ', 110:'ₙ', 111:'ₒ', 112:'ₚ', 113:'q', 114:'ᵣ', 115:'ₛ', 116:'ₜ', 117:'ᵤ', 118:'ᵥ', 119:'w', 120:'ₓ', 121:'y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  superscript: {rtl: false, name: 'Superscript', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'⁰', 49:'¹', 50:'²', 51:'³', 52:'⁴', 53:'⁵', 54:'⁶', 55:'⁷', 56:'⁸', 57:'⁹', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'ᴬ', 66:'ᴮ', 67:'ᶜ', 68:'ᴰ', 69:'ᴱ', 70:'ᶠ', 71:'ᴳ', 72:'ᴴ', 73:'ᴵ', 74:'ᴶ', 75:'ᴷ', 76:'ᴸ', 77:'ᴹ', 78:'ᴺ', 79:'ᴼ', 80:'ᴾ', 81:'Q', 82:'ᴿ', 83:'ˢ', 84:'ᵀ', 85:'ᵁ', 86:'ⱽ', 87:'ᵂ', 88:'ˣ', 89:'ʸ', 90:'ᶻ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ᵃ', 98:'ᵇ', 99:'ᶜ', 100:'ᵈ', 101:'ᵉ', 102:'ᶠ', 103:'ᵍ', 104:'ʰ', 105:'ⁱ', 106:'ʲ', 107:'ᵏ', 108:'ˡ', 109:'ᵐ', 110:'ⁿ', 111:'ᵒ', 112:'ᵖ', 113:'q', 114:'ʳ', 115:'ˢ', 116:'ᵗ', 117:'ᵘ', 118:'ᵛ', 119:'ʷ', 120:'ˣ', 121:'ʸ', 122:'ᶻ', 123:'{', 124:'|', 125:'}', 126:'~'}},
  inverted: {rtl: false, name: 'Inverted', alphabet:{32:' ', 33:'¡', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'⅋', 39:',', 40:'(', 41:')', 42:'*', 43:'+', 44:'‘', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'¿', 64:'@', 65:'ɐ', 66:'q', 67:'ɔ', 68:'p', 69:'ǝ', 70:'ɟ', 71:'ƃ', 72:'ɥ', 73:'ı', 74:'ɾ', 75:'ʞ', 76:'ן', 77:'ɯ', 78:'u', 79:'o', 80:'d', 81:'b', 82:'ɹ', 83:'s', 84:'ʇ', 85:'n', 86:'𐌡', 87:'ʍ', 88:'x', 89:'ʎ', 90:'z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ɐ', 98:'q', 99:'ɔ', 100:'p', 101:'ǝ', 102:'ɟ', 103:'ƃ', 104:'ɥ', 105:'ı', 106:'ɾ', 107:'ʞ', 108:'ן', 109:'ɯ', 110:'u', 111:'o', 112:'d', 113:'b', 114:'ɹ', 115:'s', 116:'ʇ', 117:'n', 118:'ʌ', 119:'ʍ', 120:'x', 121:'ʎ', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
  invertedBackwards: {rtl: true, name: 'Inverted (Backwards)', alphabet:{32:' ', 33:'~', 34:'}', 35:'|', 36:'{', 37:'z', 38:'ʎ', 39:'x', 40:'ʍ', 41:'ʌ', 42:'n', 43:'ʇ', 44:'s', 45:'ɹ', 46:'b', 47:'d', 48:'o', 49:'u', 50:'ɯ', 51:'ן', 52:'ʞ', 53:'ɾ', 54:'ı', 55:'ɥ', 56:'ƃ', 57:'ɟ', 58:'ǝ', 59:'p', 60:'ɔ', 61:'q', 62:'ɐ', 63:'`', 64:'_', 65:'^', 66:']', 67:'\\', 68:'[', 69:'z', 70:'ʎ', 71:'x', 72:'ʍ', 73:'𐌡', 74:'n', 75:'ʇ', 76:'s', 77:'ɹ', 78:'b', 79:'d', 80:'o', 81:'u', 82:'ɯ', 83:'ן', 84:'ʞ', 85:'ɾ', 86:'ı', 87:'ɥ', 88:'ƃ', 89:'ɟ', 90:'ǝ', 91:'p', 92:'ɔ', 93:'q', 94:'ɐ', 95:'@', 96:'¿', 97:'>', 98:'=', 99:'<', 100:';', 101:':', 102:'9', 103:'8', 104:'7', 105:'6', 106:'5', 107:'4', 108:'3', 109:'2', 110:'1', 111:'0', 112:'/', 113:'.', 114:'-', 115:'‘', 116:'+', 117:'*', 118:')', 119:'(', 120:',', 121:'⅋', 122:'%', 123:'$', 124:'#', 125:'\"', 126:'¡'}},
  reversed: {rtl: false, name: 'Reversed', alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'߁', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:'⁏', 60:'<', 61:'=', 62:'>', 63:'⸮', 64:'@', 65:'A', 66:'d', 67:'Ↄ', 68:'b', 69:'Ǝ', 70:'ꟻ', 71:'G', 72:'H', 73:'I', 74:'J', 75:'K', 76:'⅃', 77:'M', 78:'ᴎ', 79:'O', 80:'ꟼ', 81:'p', 82:'ᴙ', 83:'Ꙅ', 84:'T', 85:'U', 86:'V', 87:'W', 88:'X', 89:'Y', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'A', 98:'d', 99:'ↄ', 100:'b', 101:'ɘ', 102:'ꟻ', 103:'g', 104:'H', 105:'i', 106:'j', 107:'k', 108:'l', 109:'m', 110:'ᴎ', 111:'o', 112:'q', 113:'p', 114:'ᴙ', 115:'ꙅ', 116:'T', 117:'U', 118:'v', 119:'w', 120:'x', 121:'Y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'∽'}},
  reversedBackwards: {rtl: false, name: 'Reversed (Backwards)', alphabet:{32:' ', 33:'∽', 34:'}', 35:'|', 36:'{', 37:'z', 38:'Y', 39:'x', 40:'w', 41:'v', 42:'U', 43:'T', 44:'ꙅ', 45:'ᴙ', 46:'p', 47:'q', 48:'o', 49:'ᴎ', 50:'m', 51:'l', 52:'k', 53:'j', 54:'i', 55:'H', 56:'g', 57:'ꟻ', 58:'ɘ', 59:'b', 60:'ↄ', 61:'d', 62:'A', 63:'`', 64:'_', 65:'^', 66:']', 67:'\\', 68:'[', 69:'Z', 70:'Y', 71:'X', 72:'W', 73:'V', 74:'U', 75:'T', 76:'Ꙅ', 77:'ᴙ', 78:'p', 79:'ꟼ', 80:'O', 81:'ᴎ', 82:'M', 83:'⅃', 84:'K', 85:'J', 86:'I', 87:'H', 88:'G', 89:'ꟻ', 90:'Ǝ', 91:'b', 92:'Ↄ', 93:'d', 94:'A', 95:'@', 96:'⸮', 97:'>', 98:'=', 99:'<', 100:'⁏', 101:':', 102:'9', 103:'8', 104:'7', 105:'6', 106:'5', 107:'4', 108:'3', 109:'2', 110:'߁', 111:'0', 112:'/', 113:'.', 114:'-', 115:',', 116:'+', 117:'*', 118:')', 119:'(', 120:'\'', 121:'&', 122:'%', 123:'$', 124:'#', 125:'\"', 126:'!'}}
}


//Check the command line arguments
//returns true if all required arguments are present (NOTE: doesn't actually check if they're valid)
//if some are missing, the program will exit
function checkArguments(){
	var args = process.argv
	if(args.length < 3)
	{
		log("Missing arguments!",levels.err);
		log("Usage: "+usage,levels.err);
		exit(1)
	}
	return true;
}

function startTelegram(){
  bot = new TelegramBot(key);//,{polling:true});
  log("Fetching bot information...",levels.info);
  me = bot.getMe().then((me) => {
  	log("Bot information fetched!",levels.info);
  }).catch((e) => {
  	log("An error was encountered while fetching bot information!",levels.err);
  	log("Either your key is incorrect or something else went wrong.",levels.err);
  	log(e.stack.bold.red,levels.err);
  	exit(2);
  });
  //log("Telegram Bot successfully started!",levels.info);
}

//called every time the bot recieves a message from someone.
function onMessage(msg){

}

//called every time the bot recieves an inline query from someone. 
//for those not familiar with Telegram, an inline query is when a user types the bot's username in the chat box followed by some query text (WITHOUT sending it.)
//  the text is sent to the Telegram API and the bot can return content that the user can send in the chat. This is all done from the chat box, which is pretty cool.
//This bot will allow users to send text in this way and then get a list of different alphabets with the text replaced. 
function onInlineQuery(msg){

}