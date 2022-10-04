# Graybox

This is a game for programmers, which allows you to understand in general terms how the program interacts with system resources, such as RAM and the I / O system.

When I studied at the JS developer courses, our group often solved TDD (Test Driven Development) tasks - this is when the basis for the future program is a pre-written test. Often, we guessed by the tests what kind of program the teacher wants to see. And I thought - and if they just gave me the state of the RAM and the screen, could I guess what kind of program code was running? This idea eventually became the basis of this game. I hope it will entertain you a little.

## Demo

The hero of the game dreams of a program. He knows what changes this program makes in RAM and on the screen. But specifically the program code is not known to him. Your task is to help him. For some it will be difficult, for others it will be easy. But it's real - just by changing the numbers in the RAM to understand which program was running. This link allows you to verify this.

[Graybox, the programmers game](https://jsconst.github.io/graybox/)

## FAQ

#### What is this weird programming language? Why is this language chosen as the basis?

This is actually a non-existent BASIC dialect - Yocto Basic (yBasic). A toy programming language designed specifically for this game. It is based on the real programming language GW-Basic, which was used in the late 80s. Such a language was chosen because of its simplicity - it has about 10 simple operators that are easy to remember and easy to program. In addition, it is low-level enough to illustrate the work with RAM.

#### And how does it work?

The game is based on an interpreter that executes yBasic commands and a simple virtual machine. Together, this allows you to write and debug programs in yBasic online, as well as organize the game process.

#### Where can I read more about how to play and the basics of yBasic?

The game has built-in help. I tried to describe the gameplay and programming language in as much detail as possible.

#### Does the game require some kind of remote API or can it be run locally even without internet?

To publish to Github Pages, the game requires a remote CORS Proxy. But it can also be run locally (the server part is attached for this), even without the Internet. Just make up the levels yourself (an example is also attached).

#### The game seemed primitive to me, how to complicate it?

The difficulty of the game can be set using the settings. If you remove the hints on the program code, and also set the display of hexadecimal data in memory (just like it happened in the 80s), then you will be surprised how much more complicated the process is.

#### Is there any further development planned?

Yes, of course it is planned. As long as I have free time.

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)
