# ******************************************
# *               TxtFX Bot                *
# *         Created by Evan Straw          *
# * Applies various effects using fancy    *
# * Unicode characters to text inputted    *
# * inputted via Telegram.                 *
# *                                        *
# * This code is under the MIT License     *
# * (see LICENSE)                          *
# ******************************************
# * conversion.py                          *
# * This is a small script I wrote to make *
# * the creation of the alphabet map a lot *
# * easier. The user inputs the alphabet   *
# * equivalents for the ASCII characters   *
# * in order and the script returns them   *
# * in the format of the alphabet map      *
# * object. See alphabetMap under the main *
# * file, txtfxbot.js.                     *
# * The only reason I wrote this in Python *
# * is because I just wanted to write a    *
# * small, synchronous script that used    *
# * console input.                         *
# * This script is not required for the    *
# * main program to run, I've only         *
# * included it here for the purpose of    *
# * making *all* of the code publicly      *
# * available.                             *
# ******************************************
import sys
while True:
  try:
      alphabet_name = raw_input("alphabet name? ")
      alphabet_display_name = raw_input("display name? ")
      alphabet = raw_input("alphabet? ").decode("UTF-8")
      start_index = 32
      end_index = 126
      output = alphabet_name+": {rtl: false, name: '"+alphabet_display_name+"', alphabet:{"
      index = 0
      for i in alphabet:
          current_index = start_index + index
          if i=='"' or i=="'" or i=="\\":
              output = output + str(current_index) + ":'\\"+ i+"'"
          else:
              output = output + str(current_index) + ":'"+ i+"'"
          if current_index<end_index:
              output = output + ", "
          index = index + 1
      output = output + "}},"
      print(output)
  except KeyboardInterrupt:
    print("")
    sys.exit(0)