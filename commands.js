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
 * commands.js                            *
 * Contains functions for applying        *
 * effects to inputted text.              *
 ******************************************/

var logutil = require('./logutil.js');
var levels = logutil.levels;
var log = logutil.log;

var me = {};

module.exports.commandList = [
    {name: 'help', handler:help}
];

module.exports.init = function(botInfo)
{
    me = botInfo;
}

module.exports.processCommands = function(text, sender, chat) {
  for(var i in module.exports.commandList)
  {
      var currentCommand = module.exports.commandList[i];
      var pattern = "\\/(?:"+currentCommand.name+")|(?:("+currentCommand.name+")@)";
      var regex = new RegExp(pattern);
      if (regex.test(text))
      {
          if(currentCommand.handler)
          {
              return currentCommand.handler(sender,chat,[]);
          }
      }
  }
  return false;
};

function help(sender, chat, arguments)
{
    return '*HOW TO USE TXTFXBOT*\n' +
        'This bot applies various effects to text, using Unicode characters.\n' +
        '\n' +
        'The bot currently has two modes: Inline and PM.\n' +
        '\n' +
        '_INLINE MODE_\n' +
        'This is the easiest way to use the bot. Simply type its username, @'+me.username+', and then some text to apply effects to _without sending it._\n' +
        'A menu should appear with a preview of text generated with all the different effects the bot has.\n' +
        'Choose the one you want, and it will be sent to the chat.\n' +
        '\n' +
        '_PM MODE_\n' +
        'Send a message to the bot directly in PM (private message) or in a group.\n' +
        '(Keep in mind that the bot won\'t be able to see your message in a group unless you tag it, reply to one of its messages, or it is made an administrator in the group.)\n' +
        'A menu will appear with the first effect on the list. Use the buttons to see the different effects, and press the select button to make the menus go away and leave you with just the text.\n' +
        '\n' +
        '_ADVANCED USAGE_\n' +
        'You can apply an effect to only part of the message by enclosing that part of the message in backticks (\\`) or pipes (|).\n' +
        'For example, sending "|aesthetic| dreams" to the bot will tell the bot to only put effects on the word "aesthetic".\n' +
        '\n' +
        'If you have any questions or trouble, ask my creator: @evan3334\n' +
        'My source code can be found on [Github](https://www.github.com/evan3334/txtfxbot)';

}