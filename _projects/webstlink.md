---
title: WebStlink
subtitle: Controlling ST-Link debuggers with WebUSB
preview_image: /img/webstlink-preview.png
wide_preview: true
excerpt: >
  A toy debugger front-end for the ST-Link/v2 debug probe that can read memory, reprogram flash, and read semihosted log messages. Oh, and it runs in the browser.
---
## Overview
_webstlink_ is a debugger front-end for the [ST-Link/v2 debug probe](http://www.st.com/en/development-tools/st-link-v2.html) written in Javascript.

Where the ST-Link handles low-level operations like reading and writing to core CPU registers and accessing RAM, debugger front-ends like webstlink handle high-level operations like halting/resuming the CPU or reprogramming the on-chip flash memory.

## Features
webstlink can be used to implement common debugger features such as:

* Reading/writing CPU registers
* Reading/writing RAM
* Writing/erasing flash memory
* Halting/single-stepping/resetting the CPU
* Displaying semihosted log messages

webstlink has been tested with standalone ST-Link/v2 dongles and ST-Link/v2-1 debuggers embedded in ST Nucleo development boards.

## Demo
I've put together a [live demo page](https://devanlai.github.io/webstlink/demo/) online that can be used to test basic debugger functionality.

{% include youtube_iframe.html id="RP90OlUTZbs" width="560" height="315" %}
{% include caption.html text="A video showing the demo page used in conjunction with the mbed online IDE to test semihosting" %}

## Future Work

webstlink is still very much a work-in-progress. Some features I would like to add include:

* ELF support, so that the debugger can display the current line of code that the CPU is halted on.
* Breakpoint support
* Disassembly support
* SWO trace support

## Acknowledgements
webstlink is not entirely my original creation - most of the core code to handle the proprietary ST-Link USB protocol and the STM32 flash algorithms is ported from the [pystlink](https://github.com/pavelrevak/pystlink) project. My contribution has been to port it to Javascript and adjust it to work with the asynchronous [WebUSB API](https://wicg.github.io/webusb/) instead of the synchronous [libusb API](http://libusb.info/).




## Source on GitHub:

* [webstlink](https://github.com/devanlai/webstlink)
