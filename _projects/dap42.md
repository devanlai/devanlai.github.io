---
title: dap42
subtitle: An open-source CMSIS-DAP debug probe
---
## Overview
_dap42_ is a an open-source debug probe for ARM Cortex-M devices.

It sits between your computer and your microcontroller and translates the commands it receives over USB into bit-banged [Serial Wire Debug (SWD)](http://www.arm.com/products/system-ip/debug-trace/coresight-soc-components/serial-wire-debug.php) signals that the microcontroller's on-chip debug peripheral understands.

It uses ARM's standard [CMSIS-DAP](http://www.arm.com/products/processors/cortex-m/cortex-microcontroller-software-interface-standard.php) debug protocol, so it works with many tools and IDEs, such as Keil uVision, LPCXpresso, and [openocd](http://openocd.org/).

## What's special about dap42 vs other debuggers?
_dap42_ is a project I work on for my own education, so it's special to me, but for everyone else, it might be of interest because:

* The [BOM](https://github.com/devanlai/dap42-hardware/blob/master/BOM.md) for the debugger is short and inexpensive - it's easy to build your own from scratch.
  * It can be bootstrapped with the STM32F042's ROM USB DFU bootloader - you don't need a debugger to flash your debugger.
* It can run on cheap [STLink/v2 clones](https://github.com/rogerclarkmelbourne/Arduino_STM32/wiki/Programming-an-STM32F103XXX-with-a-generic-%22ST-Link-V2%22-programmer-from-Linux), with an added USB-serial port connected to the `SWIM` pin and a `RST` pin that actually resets the target.
* The source code is small and easy to extend. I'm also working on a variant that adds CAN-USB support.

## Sources on GitHub:

* Firmware: [dap42](https://github.com/devanlai/dap42)
* Hardware: [dap42-hardware](https://github.com/devanlai/dap42-hardware)
