---
title: WebDFU
subtitle: Device firmware updates in the browser using WebUSB
preview_image: /img/WebDFU-preview.png
wide_preview: true
excerpt: >
  A demo using the browser to reprogram USB-attached devices via WebUSB - no native plugins required.
---
## Overview
WebDFU is a proof-of-concept using [WebUSB](https://wicg.github.io/webusb/) to reprogram [USB DFU](http://wiki.openmoko.org/wiki/USB_DFU_-_The_USB_Device_Firmware_Upgrade_standard) class devices from the browser. It supports USB DFU 1.1 and [DfuSe 1.1a](http://www.st.com/en/development-tools/stsw-stm32080.html) bootloaders and mbed boards with [custom interface firmware](https://github.com/devanlai/DAPLink).
It does not require the user to install browser plugins or proxy agents that could execute arbitrary code.

Note: WebUSB is currently a draft standard that is only implemented by Google Chrome.

## Potential for abuse
Giving any untrusted code access to your USB devices is dangerous, but especially so when the device is fully reprogrammable and could be converted into a malicious device ala [BadUSB](https://arstechnica.com/information-technology/2014/07/this-thumbdrive-hacks-computers-badusb-exploit-makes-devices-turn-evil/).
Ideally, firmware updates should require some combination of physical access (a bootloader button), multiple user prompts, and cryptographically signed firmware images to reduce the risk of BadUSB-type attack.

## Applications

### Standalone firmware updates in the browser
The simplest application for WebUSB and firmware updates is to implement [dfu-util](http://dfu-util.sourceforge.net/) in a cross-platform browser application. dfu-util uses libusb to directly schedule the USB control transfers needed to execute a USB DFU firmware update. Since WebUSB offers a similar degree of low-level transfer-oriented API access, it's a straightforward exercise to port the necessary parts of dfu-util from C to javascript.

I've put together an [online demo](https://devanlai.github.io/webdfu/dfu-util/) that offers similar functionality to dfu-util. It supports basic DFU 1.1 functionality like switching to the bootloader over USB, downloading new firmware, and reading out the device firmware. It also has preliminary support for [STMicro's DfuSe 1.1a](http://dfu-util.sourceforge.net/dfuse.html) extensions, which I've tested successfully with the on-chip USB bootloader on STM32F042xx chips.

![webdfu example screenshot](/img/WebDFU.png)
*A screenshot of the webdfu demo in action*

In the future, this could be used to build a rich firmware updater that guides the user through the process of putting their device into firmware-upgrade mode and selecting the correct firmware image.

### Online IDEs with hardware access
Sites such as [mbed.org](https://developer.mbed.org), [codebender](https://codebender.cc), and [Arduino Create](https://create.arduino.cc/) show that there are real applications for online IDEs for embedded development. Compared to native software, web applications are well-suited to cross-platform compatibility, automatic cloud storage, and online collaboration.

However, embedded development is more than just writing code and compiling it. Embedded software lives in realm of hardware beyond the confines of our day-to-day operating systems running on general purpose computers. Without some way to take your code out of your computer and into the microcontroller on your desk, you may as well be blinking pixels on the monitor.

So how do IDEs like mbed bridge the gap today?

Every mbed-enabled board has two microcontrollers - the target microcontroller that controls the actual hardware on the board and an interface microcontroller that mediates communication between the PC and the target microcontroller via USB.
Depending on the age of the board and the manufacturer, the firmware on the interface chip might be called [CMSIS-DAP](https://developer.mbed.org/handbook/CMSIS-DAP), [OpenSDA](https://www.nxp.com/products/microcontrollers-and-processors/arm-based-processors-and-mcus/kinetis-cortex-m-mcus/developer-resources/ides-for-kinetis-mcus/opensda-serial-and-debug-adapter:OPENSDA), STLink/v2-1, or [DAPLink](https://developer.mbed.org/handbook/DAPLink).
Regardless of the name, all of the interface chips allow the user to flash the target chip by dragging and dropping compiled firmware binaries onto an emulated USB mass storage drive. Thus, a typical development cycle with mbed looks like:  

1. Write some code on mbed.org
2. Compile the code and download the firmware binary
3. Copy the binary from the download directory to the emulated drive and hit reset
4. Troubleshoot the new code with external tools and software
5. Return to step 1

The software involved to make all of this work out-of-the-box across multiple platforms is quite clever, but it has some limitations:

* The user must manually copy the firmware onto the board every time.
* Mass storage device emulation is a moving target - it's difficult to future-proof against OS driver and filesystem changes.
* The IDE has no way to directly interact with the board - it can't retrieve serial log messages or read the microcontroller's registers.

With WebUSB, we could potentially resolve all of those issues:

* The browser can talk directly to the interface chip via WebUSB, eliminating the manual drag'n'drop step.
* Since WebUSB doesn't depend on OS-level application drivers, it's no longer necessary to tunnel everything through the lowest-common-denominator of drivers to build something that works out-of-the-box everywhere.
* With a custom USB protocol, the browser can access the full capabilities of the interface chip, which include [on-chip debugging](/projects/webstlink) and bidirectional serial communication with the target chip.


Alas, as I am only one man and the mbed IDE itself is closed source, I don't have the time and resources to build a fully enabled online IDE that interfaces directly with the hardware. What I do have is a [proof-of-concept](https://devanlai.github.io/webdfu/mbed-download/) that cuts out the pesky drag'n'drop step, allowing a direct download from the browser to the target microcontroller without leaving the browser.


Unlike the IDE, the interface firmware is fully open source as part of the [DAPLink](https://developer.mbed.org/handbook/DAPLink) project. I [forked](https://github.com/devanlai/DAPLink) the DAPLink project and added a standard USB DFU interface to the DAPLink firmware, except it reprograms the target chip instead of itself. Armed with a WebUSB DFU driver and USB DFU compatible interface firmware, we've got everything we need to reprogram mbed boards from the browser.

Still, it's not much of an improvement if all we've done is flip it around so that we have to compile code outside of the browser and then flash it from the browser instead of vice versa.

Luckily, while the mbed IDE isn't open-source, we can still leverage their online compiler through their [remote compilation API](https://developer.mbed.org/handbook/Compile-API) to build projects online. With my demo, you can select programs from your workspace or published examples and compile and flash them from entirely within the browser. It's a bit awkward since the authentication method is terrible and you still have to edit your code in a second tab, but it's a start.

## Sources on GitHub

* WebUSB demo code: [webdfu](https://github.com/devanlai/webdfu)
* DAPLink with DFU and WebUSB: [daplink](https://github.com/devanlai/DAPLink)

## See also:
* Controlling unmodified STLink debuggers with WebUSB: [webstlink](/projects/webstlink)
* Check out the [dapjs](https://github.com/ARMmbed/dapjs-web-demo) project for similar ideas by someone else.
