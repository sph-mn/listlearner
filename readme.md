# purpose
* list questions from a text file and show answers by pressing the spacebar
* sort lists from less known to well known by using the left and right arrow keys

example use case: learning vocabulary

![screenshot](other/screenshot.png?raw=true)

# features
* the files only have the lines resorted and stay plaintext. the files can be viewed anywhere where text files can be viewed
* files for listlearner contain lines with space delimited columns. files can be created by hand, with libreoffice calc (use the filename suffic .csv) or excel
* the first column is the question, the rest the answer
* the filename suffix is irrelevant. it can be .txt
* columns that include spaces are surrounded by doublequotes. doublequotes inside are escaped by doubling, ""
* files are saved automatically, and on quit via ctrl+q. if unsaved, a grey box is displayed in the top right corner
* csv headers are not handled and will appear like any other line
* study time is tracked for each file, displayed in the top right corner and updated every 100 seconds

compared to spaced repetition flashcard software, with listlearner it is always possible to move freely between all questions and do immediate repeated reviews.

make backups of your files before using the app.

# example file content
~~~
aberration "a state or condition markedly different from the norm"
acquiesce "agree or express agreement"
alacrity "liveliness and eagerness"
~~~

there can be more than two columns. the first column is the question.

# keyboard controls
| key | action |
| --- | --- |
| space  | show/hide answer |
| left arrow | move the line to the top |
| right arrow | move the line to the bottom |
| ctrl + left arrow | move the line up by half the line count |
| ctrl + right arrow | move the line down by half the line count |
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

# tips
one way to use listlearner is to go through the list and move difficult items to the top. only well known items are moved to the bottom. this way, over time, a personalised list sorted by difficulty emerges.

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
