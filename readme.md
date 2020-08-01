# purpose
* learn vocabulary by sorting lists. less known at the top, known at the bottom
* replacement alternative to anki, for me anyway, because:
  * a) listlearner it is extremely responsive
  * b) moving between lines freely and doing immediate repeated reviews is possible

# features
* load lists of questions and answers. for example, vocabulary and translations, but could be other information
* show only the question
* space shows the answer
* left arrow on the keyboard moves the line further up (relearn)
* right arrow moves the line further down (recalled)
* up and down arrow move between lines
* ctrl+q quits the application
* saves files automatically. if unsaved, a grey box is visible in the top right corner. it doesnt save extra on quit, so wait till the box disappears before quit
* files must be space separated csv (dsv) files (can be created with libreoffice calc or excel or by hand. words with spaces surrounded by ", inside " escaped by doubling "")
* csv headers are not supported
* the application adds a third sort column with a signed integer number that stores the number of times the line has been moved up or down

this is a rudimentary implementation that only does the minimum of what i needed. should other people use it then it would become more polished.
make backups of your csv files before using the app if needed

# requirements and setup
* install [node.js](https://nodejs.org/en/) if not already installed
* on a command-line, change into the application directory and execute ``npm install`` to install the required node modules
* if that was successful, the app should now be usable

# two ways to start the app
* ``npm start`` in the application directory
* ``./exe/build`` to create an electron package under temp/

# how to open files
* when the app is started, via the "open" button in the top left
* by passing the path to the program when starting it, ``npm start mypath``

# platforms
* linux
* windows
* mac
* any platform electron runs on

# license
gpl3+