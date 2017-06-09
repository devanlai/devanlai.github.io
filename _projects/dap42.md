---
title: dap42
subtitle: An open-source CMSIS-DAP debug probe
excerpt: >
  I needed a debugger, so I decided to make one myself.

---
## Overview
_dap42_ is an open-source debug probe for ARM Cortex-M devices.

It sits between your computer and your microcontroller and translates the commands it receives over USB into bit-banged [Serial Wire Debug (SWD)](http://www.arm.com/products/system-ip/debug-trace/coresight-soc-components/serial-wire-debug.php) signals that the microcontroller's on-chip debug peripheral understands.

It uses ARM's standard [CMSIS-DAP](http://www.arm.com/products/processors/cortex-m/cortex-microcontroller-software-interface-standard.php) debug protocol, so it works with many tools and IDEs, such as Keil uVision, LPCXpresso, and [openocd](http://openocd.org/).

## What's special about dap42 vs other debuggers?
_dap42_ is a project I work on for my own education, so it's special to me, but for everyone else, it might be of interest for a few reasons.

### It's easy to build

You don't really need much more than a microcontroller, a voltage regulator, and a USB connector to build a debug probe. The [bill of materials](https://github.com/devanlai/dap42-hardware/blob/master/BOM.md) reflects that. You don't even need a dedicated crystal - the STM32F042 can trim its internal RC oscillator from the USB clock.

As a bonus, the STM32F042 has a ROM USB DFU bootloader, so you can bootstrap it with a USB cable - no need for a debugger to flash your debugger!

The firmware compiles with standard gcc-arm - you don't need an expensive proprietary toolchain to build the firmware yourself.

### It supports _really_ cheap hardware
I don't sell any hardware - I fully support taking dirt-cheap [STLink/v2 clones](https://github.com/rogerclarkmelbourne/Arduino_STM32/wiki/Programming-an-STM32F103XXX-with-a-generic-%22ST-Link-V2%22-programmer-from-Linux), erasing their pirated firmware and flashing open-source firmware onto them.

As an added bonus, the _dap42_ firmware has some extra features:

* The `SWIM` pin is repurposed as an RX pin for a USB-serial port.
* the `RST` pin is mapped so that it actually resets your target.

### It's easy to extend
_dap42_ is designed to be usable standalone, but it can also be embedded into a development board as an on-board debug probe.
Once you've put the debugger onto the board, hooking up IO lines to USB is essentially free.

From there, it's straightforward to add things like [CAN-USB](https://github.com/devanlai/dap42/tree/kitchen-sink-can-wip) support along-side the existing debug and serial capabilities.

## Sources on GitHub:

* Firmware: [dap42](https://github.com/devanlai/dap42)
* Hardware: [dap42-hardware](https://github.com/devanlai/dap42-hardware)
