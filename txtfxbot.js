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
//|-alphabet: the actual alphabet mapping
//  |-character code
//    |- alphabet equivalent
const alphabetMap = {
	normalASCII: {rtl: false, alphabet:{32:' ', 33:'!', 34:'"', 35:'#', 36:'$', 37:'%', 38:'&', 39:"'", 40:'(', 41:')', 42:'*', 43:'+', 44:',', 45:'-', 46:'.', 47:'/', 48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7', 56:'8', 57:'9', 58:':', 59:';', 60:'<', 61:'=', 62:'>', 63:'?', 64:'@', 65:'A', 66:'B', 67:'C', 68:'D', 69:'E', 70:'F', 71:'G', 72:'H', 73:'I', 74:'J', 75:'K', 76:'L', 77:'M', 78:'N', 79:'O', 80:'P', 81:'Q', 82:'R', 83:'S', 84:'T', 85:'U', 86:'V', 87:'W', 88:'X', 89:'Y', 90:'Z', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'a', 98:'b', 99:'c', 100:'d', 101:'e', 102:'f', 103:'g', 104:'h', 105:'i', 106:'j', 107:'k', 108:'l', 109:'m', 110:'n', 111:'o', 112:'p', 113:'q', 114:'r', 115:'s', 116:'t', 117:'u', 118:'v', 119:'w', 120:'x', 121:'y', 122:'z', 123:'{', 124:'|', 125:'}', 126:'~'}},
	circled: {rtl: false, alphabet:{32:' ', 33:'!', 34:'\"', 35:'#', 36:'$', 37:'%', 38:'&', 39:'\'', 40:'(', 41:')', 42:'⊛', 43:'⊕', 44:',', 45:'⊖', 46:'⨀', 47:'⊘', 48:'0', 49:'①', 50:'②', 51:'③', 52:'④', 53:'⑤', 54:'⑥', 55:'⑦', 56:'⑧', 57:'⑨', 58:':', 59:';', 60:'⧀', 61:'⊜', 62:'⧁', 63:'?', 64:'@', 65:'Ⓐ', 66:'Ⓑ', 67:'Ⓒ', 68:'Ⓓ', 69:'Ⓔ', 70:'Ⓕ', 71:'Ⓖ', 72:'Ⓗ', 73:'Ⓘ', 74:'Ⓙ', 75:'Ⓚ', 76:'Ⓛ', 77:'Ⓜ', 78:'Ⓝ', 79:'Ⓞ', 80:'Ⓟ', 81:'Ⓠ', 82:'Ⓡ', 83:'Ⓢ', 84:'Ⓣ', 85:'Ⓤ', 86:'Ⓥ', 87:'Ⓦ', 88:'Ⓧ', 89:'Ⓨ', 90:'Ⓩ', 91:'[', 92:'⦸', 93:']', 94:'^', 95:'_', 96:'`', 97:'ⓐ', 98:'ⓑ', 99:'ⓒ', 100:'ⓓ', 101:'ⓔ', 102:'ⓕ', 103:'ⓖ', 104:'ⓗ', 105:'ⓘ', 106:'ⓙ', 107:'ⓚ', 108:'ⓛ', 109:'ⓜ', 110:'ⓝ', 111:'ⓞ', 112:'ⓟ', 113:'ⓠ', 114:'ⓡ', 115:'ⓢ', 116:'ⓣ', 117:'ⓤ', 118:'ⓥ', 119:'ⓦ', 120:'ⓧ', 121:'ⓨ', 122:'ⓩ', 123:'{', 124:'⦶', 125:'}', 126:'~'}},
	fullwidth: {rtl: false, alphabet:{32:' ', 33:'！', 34:'\"', 35:'＃', 36:'＄', 37:'％', 38:'＆', 39:'＇', 40:'（', 41:'）', 42:'＊', 43:'＋', 44:'，', 45:'－', 46:'．', 47:'／', 48:'０', 49:'１', 50:'２', 51:'３', 52:'４', 53:'５', 54:'６', 55:'７', 56:'８', 57:'９', 58:'：', 59:'；', 60:'<', 61:'＝', 62:'>', 63:'？', 64:'＠', 65:'Ａ', 66:'Ｂ', 67:'Ｃ', 68:'Ｄ', 69:'Ｅ', 70:'Ｆ', 71:'Ｇ', 72:'Ｈ', 73:'Ｉ', 74:'Ｊ', 75:'Ｋ', 76:'Ｌ', 77:'Ｍ', 78:'Ｎ', 79:'Ｏ', 80:'Ｐ', 81:'Ｑ', 82:'Ｒ', 83:'Ｓ', 84:'Ｔ', 85:'Ｕ', 86:'Ｖ', 87:'Ｗ', 88:'Ｘ', 89:'Ｙ', 90:'Ｚ', 91:'[', 92:'\\', 93:']', 94:'^', 95:'_', 96:'`', 97:'ａ', 98:'ｂ', 99:'ｃ', 100:'ｄ', 101:'ｅ', 102:'ｆ', 103:'ｇ', 104:'ｈ', 105:'ｉ', 106:'ｊ', 107:'ｋ', 108:'ｌ', 109:'ｍ', 110:'ｎ', 111:'ｏ', 112:'ｐ', 113:'ｑ', 114:'ｒ', 115:'ｓ', 116:'ｔ', 117:'ｕ', 118:'ｖ', 119:'ｗ', 120:'ｘ', 121:'ｙ', 122:'ｚ', 123:'{', 124:'|', 125:'}', 126:'~'}},
    //will add more later, just have these for now
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
  bot = new TelegramBot(key+"a");//,{polling:true});
  me = bot.getMe();
  log("Telegram Bot successfully started!",levels.info);
}