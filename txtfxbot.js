/******************************************
 *               TxtFX Bot                *
 *         Created by Evan Straw          *
 * Applies various effects using fancy    *
 * Unicode characters to text inputted    *
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
var commands = require('./commands.js');
//require the telegram bot api library
var TelegramBot = require("node-telegram-bot-api");
//require the UUID library
var uuid = require('uuid');

var txtfxcore = require('./txtfxcore.js');

//variable to hold the bot instance once it is created
var bot = {};
//variable to hold the bot information
var me = {};

//constant to hold the usage message (will be displayed if the user gets one of the arguments wrong)
//The arguments required for the program right now are:
// 1. The node command
// 2. The name of the program ("txtfxbot.js")
// 3. The token for the Telegram Bot API
var usage = "node txtfxbot.js <Telegram Bot API token>"

var originalMessages = {};

//Start the actual program
//check command line arguments
checkArguments();
//variable to hold the API token
var token = process.argv[2];
//start telegram functions (tests token)
log("Starting Telegram Bot...",levels.info);
initTelegram(token);

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

function initTelegram(token){
  bot = new TelegramBot(token,{polling:true});
  log("Fetching bot information...",levels.info);
  me = bot.getMe().then(function(me) {
  	log("Bot information fetched!",levels.info);
    log("Bot ID: "+me.id+"; Name: "+me.first_name+(me.last_name?" "+me.last_name:"")+"; Username: @"+me.username);
    commands.init(me);
    startTelegramPolling(bot);
  }).catch(function(e){
  	log("An error was encountered while fetching bot information!",levels.err);
    //check if the token was incorrect (API server will return HTTP 401 UNAUTHORIZED error)
    if(e.response && e.response.body && JSON.parse(e.response.body).error_code===401){
      log("Your token is incorrect! (API returned 401 UNAUTHORIZED)",levels.err);
    }
  	log(e.stack.bold.red,levels.err);
  	exit(2);
  });
  //log("Telegram Bot successfully started!",levels.info);
}

function startTelegramPolling(bot){
  //start polling
  //bot.initPolling();
  //set up event listeners
  bot.on('text',onMessage);
  bot.on('inline_query',onInlineQuery);
  bot.on('callback_query',onCallbackQuery);
}



//stores the text of a message in the originalMessages object with the message id as the key
function storeMessage(msg){
  originalMessages[msg.message_id] = msg.text;
}

//recalls the text of a message from the originalMessages object, given the message id
function recallMessage(msgId){
  return originalMessages[msgId];
}

//deletes the text of a message from the originalMessages object, given the message id
function deleteMessage(msgId){
  delete originalMessages[msgId];
}

//Event Handlers

//called every time the bot receives a text message from someone.
function onMessage(msg) {
    //log to the console that we received a message
    log("Message from " + getUserFormat(msg.from) + ": '" + msg.text + "'", levels.info);
    //variable to hold the result of the command check
    var cmdCheck = commands.processCommands(msg.text, msg.from, msg.chat);

    if (cmdCheck === false) {

        //store the contents of the message in the stored messages object
        storeMessage(msg);
        //variable to hold the name of the first alphabet in the map
        var effectID = txtfxcore.effects[0].id;
        //send the user the selection menu
        bot.sendMessage(msg.chat.id, createMessageFormat(msg.text, effectID, 1, txtfxcore.effects.length), {
            reply_markup: createSelectionKeyboard(0, 0, txtfxcore.effects.length - 1),
            parse_mode: "Markdown",
            reply_to_message_id: msg.message_id
        });
    }
    else {
        bot.sendMessage(msg.chat.id, cmdCheck, {
            parse_mode: "Markdown",
            reply_to_message_id: msg.message_id
        });
    }
}

//called every time the bot receives an inline query from someone.
//for those not familiar with Telegram, an inline query is when a user types the bot's username in the chat box followed by some query text (WITHOUT sending it.)
//  the text is sent to the Telegram API and the bot can return content that the user can send in the chat. This is all done from the chat box, which is pretty cool.
//This bot will allow users to send text in this way and then get a list of different alphabets with the text replaced. 
function onInlineQuery(query){
  //check if the text isn't empty
  //to save us some time and annoyance we'd rather not waste time answering empty queries
  if(query.query!==""){
    //announce that we have received an inline query
    log("Inline query from "+getUserFormat(query.from)+"; Query ID: "+query.id+"; Text: '"+query.query+"'");
    //array to hold results to be returned to the user
    var results = [];
    //loop through all the alphabets
    for(var i=0; i<txtfxcore.effects.length; i++)
    {
      var currentEffect = txtfxcore.effects[i];
      results.push(createInlineQueryResult(uuid.v4(),currentEffect.name,txtfxcore.processText(currentEffect.id,query.query)));
    }
    //send the results through telegram back to the user
    bot.answerInlineQuery(query.id,results,{cache_time:1}); //cache time is zero to permit a user to repeat effects like
                                                            //  emojify that use randomization
  }
}

//called every time someone presses a button (named a "callback button" by telegram.)
//Messages can be sent to users with "inline keyboards" attached to them (buttons underneath the message that do things).
//These buttons can be "callback buttons" and have a small string of text called "callback data". When they are pressed, 
// that string is sent to the bot. We can use this to make a menu (have the user send us a small JSON object containing
// what page/alphabet they want.)
function onCallbackQuery(query){
  //announce that we have received a callback query
  log("Callback query from "+getUserFormat(query.from)+"; Query ID: "+query.id+"; Data: '"+query.data+"'");
  //variable to hold the new keyboard (we're gonna have to change the buttons if the user went back or forward one page)
  var newKeyboard;

  var effectID, messageId, chatId, originalId, originalText;

  //variable to hold the callback data (parsed for JSON and converted to a JavaScript object)
  var data = JSON.parse(query.data);
  //if the data isn't null (let's not waste time on blank/bad callback queries)
  if(data){
    //if the data has a "goto" property (meaning the user wanted to go to a page)
    if(data.goto!==undefined){
      //variable for the index of the page the user wanted to go to
      var gotoIndex = data.goto;
      //variable for the name of the alphabet at that index
      effectID = txtfxcore.effects[gotoIndex].id;
      //the message ID of the message that held the button the user pressed (we're gonna need this to edit the message)
      messageId = query.message.message_id;
      //the chat ID that the message was in (we're also going to need this to edit the message)
      chatId = query.message.chat.id;
      //the ID of the original message (the source of the raw text - we need this to do the conversion again)
      //in order to save this ID, we made the menu a reply to the original message. Telegram lets you access the original
      // message's ID through "reply_to_message"
      originalId = query.message.reply_to_message.message_id;
      //the original Text of the message (recalled out of the stored message object using the message ID as a key)
      originalText = recallMessage(originalId);
      //create a new selection keyboard with updated buttons
      newKeyboard = createSelectionKeyboard(gotoIndex,0,txtfxcore.effects.length-1);
      //update the text of the message to show the text with the new alphabet and buttons
      bot.editMessageText(createMessageFormat(originalText,effectID,gotoIndex+1,txtfxcore.effects.length),
        {message_id: messageId, chat_id: chatId, reply_markup: newKeyboard,parse_mode: "Markdown"});
    }
    //if the data has a "select" property (meaning the user wanted to select the current page)
    else if(data.select!==undefined){
      //the index of the page the user wanted to select
      var selectIndex = data.select;
      //the name of the alphabet at that index
      effectID = txtfxcore.effects[selectIndex].id;
      //the ID of the message that held the button the user pressed (we need this to edit the message)
      messageId = query.message.message_id;
      //the ID of the chat that the message was in (we also need this to edit the message)
      chatId = query.message.chat.id;
      //the ID of the original message (the source of the raw text - we need this to do the conversion again)
      //in order to save this ID, we made the menu a reply to the original message. Telegram lets you access the original
      // message's ID through "reply_to_message"
      originalId = query.message.reply_to_message.message_id;
      //the original Text of the message (recalled out of the stored message object using the message ID as a key)
      originalText = recallMessage(originalId);
      //the new text for the message (just the plain converted text, no alphabet title)
      var newText = query.message.text.split('\n')[1]; //txtfxcore.processText(effectID,originalText);
      //update the text of the message to show just the converted text and remove the buttons
      bot.editMessageText(newText,{message_id:messageId, chat_id: chatId});
      deleteMessage(originalId);
    }
  }
  //respond to the callback query (telegram requires that you do this because clients display a little progress bar
  // until the bot sends a response)
  bot.answerCallbackQuery(query.id,"",false,{});
}

//Abstractions

//creates the message for the selection menu, given the original text, alphabet name, current index (this should be human readable
// so it shouldn't be zero-indexed), and total number of alphabets
//this function does the alphabet conversion.
function createMessageFormat(originalText, effectID, index, total){
  var processed = txtfxcore.processText(effectID, originalText);
  return "*"+txtfxcore.getEffectByID(effectID).name+"* ("+index+"/"+total+")\n"
        +processed;
}

//creates the selection keyboard for the selection menu, given the current index, start (pretty much always 0), and end (the index
// of the last item. usually the length minus one to make it zero-indexed)
function createSelectionKeyboard(index, start, end){
  //arrays to hold the buttons
  var buttons = [];
  //array to hold the first row of buttons
  var firstRow = [];
  //variable to hold the index that pressing the "previous" button will send the user to
  //if the current index is the start index (the user is on the first option) this will be set to the last index, looping around to the end
  var previousIndex = (index===start ? end : index-1);
  //variable to hold the index that pressing the "next" button will send the user to
  //if the current index is the end index (the user is on the last option) this will be set to the first index, looping around
  var nextIndex = (index===end ? start : index+1);
  firstRow.push(createInlineKeyboardButton("⬅ Prev ("+(previousIndex+1)+")","{\"goto\":"+previousIndex+"}"));
  firstRow.push(createInlineKeyboardButton("✅ Select","{\"select\":"+index+"}"));
  firstRow.push(createInlineKeyboardButton("Next ("+(nextIndex+1)+") ➡","{\"goto\":"+nextIndex+"}"));
  buttons.push(firstRow);
  return createInlineKeyboardMarkup(buttons);
}

//requires a two-dimensional array of inline keyboard button objects and wraps them in the syntax that telegram requires.
//see createInlineKeyboardButton for a function that generates them.
function createInlineKeyboardMarkup(buttons){
  return {inline_keyboard:buttons};
}

function createInlineKeyboardButton(text, callbackData){
  return {text:text,callback_data:callbackData};
}

//abstraction
//returns an inline query result object given the id and some information.
function createInlineQueryResult(resultId, title, description){
  return {type:"article",id:resultId,title:title,description:description,input_message_content:{message_text:description}};
}

//abstraction
//returns a formatted string for user information.
//the returned string will be in the format "Full Name (@username) [ID: XXXXXXXXX]"
function getUserFormat(user){
  return getFormattedName(user).bold.green+" (".yellow+getUsername(user)+")".yellow+" [ID: ".bold.cyan+user.id.toString().inverse+"]".bold.cyan;
}

//abstraction
//returns the formatted full name of a user.
//if the user has no last name set, then "Firstname" will be returned,
//but if the user does have a last name set, then "Firstname Lastname" will be returned.
function getFormattedName(user){
  return user.first_name+(user.last_name?" "+user.last_name:"");
}

//abstraction
//returns the formatted username of a user.
//if the user has a username, then "@username" will be returned, but if
//the user does not have a username, then "No username" will be returned.
function getUsername(user){
  return (user.username?"@"+user.username.bold.magenta:"No username".italic.magenta);
}
