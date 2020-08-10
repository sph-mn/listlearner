# purpose
* list questions from a text file and show answers by pressing the spacebar
* sort lists from less known to well known by using the arrow keys

example use case: learning vocabulary

# features
* files for listlearner are space delimited dsv/csv files, which can be created with libreoffice calc or excel, or by hand. fields with spaces are surrounded by ", inside " escaped by doubling ""
* the first column is the question, the rest the answer
* csv headers are not supported, they will appear like any other line
* files are saved automatically, and on quit by keypress. if unsaved, a grey box is displayed in the top right corner
* the filename suffix is irrelevant. it can be .txt for compatibility with viewers
* the files only have the lines resorted and stay plaintext. the files can be viewed anywhere where text files can be viewed
* compared to spaced repetition flashcard software, with listlearner it is always possible to move freely between all questions and do immediate repeated reviews

make backups of your csv files before using the app

# keyboard controls

| key | action |
| --- | --- |
| space  | show/hide answer |
| left arrow | move the line up |
| right arrow | move the line down |
| ctrl + left arrow | move the line up multiple steps at once |
| ctrl + right arrow | move the line down multiple steps at once |
| ctrl + q | save and quit |

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

# developer information
* the csv delimiter can be changed at the top of main.js
* the app is built using [electron](https://www.electronjs.org/)
* relevant files are main.js (the back end) and render.js (the front end), as well as main.html
