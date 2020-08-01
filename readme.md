# purpose
* learn vocabulary by sorting lists. less known at the top, known at the bottom
* replacement alternative to anki, for me anyway, because:
  * a) listlearner it is extremely responsive
  * b) moving between all lines freely as well as doing immediate repeated reviews is possible

# features
* load lists of questions and answers. for example, vocabulary with translations
* show only the question
* space shows/hides the answer
* up and down arrow move between lines
* left arrow on the keyboard moves the line further up (relearn)
* right arrow moves the line further down (recalled)
* ctrl+q quits the application
* saves files automatically. if unsaved, a grey box is visible in the top right corner. it doesnt save extra on quit, wait till the box disappears before quit
* files must be space separated csv (dsv) files (can be created with libreoffice calc or excel, or by hand. words with spaces surrounded by ", inside " escaped by doubling "")
* the filename suffix is irrelevant, can be .txt for compatibility
* the first column is the question, the rest the answer
* the application adds a sort column with a signed integer number that stores the number of times the line has been moved up or down
* using a sort index keeps the easy things together. always moving to the topmost or bottom (how this app started out) would lead to frequent reviews of the well known lines
* csv headers are not supported
* because the files stay plaintext, they can be viewed anywhere text files can be displayed
* if the last column in the file already is a number that is part of the information, then the sort column must be added manually (set to 0) or it will be used and overwritten

this is a rudimentary implementation that only does the minimum of what i needed. should other people use it then it would become more polished.
make backups of your csv files before using the app

# requirements and setup
* install [node.js](https://nodejs.org/en/) if not already installed
* on a command-line, change into the application directory and execute ``npm install`` to install the required node modules
* if that was successful, the app should then be usable

# two ways to start the app
* ``npm start`` in the application directory
* or ``./exe/build`` to create an electron package under temp/. the resulting directory is a complete installation that can be copied

# how to open files
* when the app is started, via the "open" button in the top left
* by passing the path to the program when starting it, ``npm start mypath``

# platforms
* linux
* windows
* mac
* any other platform electron runs on

# license
gpl3+