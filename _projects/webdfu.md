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

![webdfu example screenshot]({{site.baseurl}}/img/WebDFU.png)
*A screenshot of the webdfu demo in action*

In the future, this could be used to build a rich firmware updater that guides the user through the process of putting their device into firmware-upgrade mode and selecting the correct firmware image.

## Sources on GitHub

* WebUSB demo code: [webdfu](https://github.com/devanlai/webdfu)
* DAPLink with DFU and WebUSB: [daplink](https://github.com/devanlai/DAPLink)

## Sites using webdfu

* [NanoVNA DFU](https://cho45.stfuawsc.com/NanoVNA/dfu.html)
* [NES Emulator for NumWorks DFU](https://zardam.github.io/webnofrendo/)
* [CANable Updater](https://canable.io/updater/)

## See also:
* Controlling unmodified STLink debuggers with WebUSB: [webstlink]({{site.baseurl}}/projects/webstlink)
