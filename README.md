# Bamazon: The Dinosaur CLI Store You Didn't Know You Needed

![Bamazon Banner](/img/bamazon-banner.png)

Bamazon is a node app that can be accessed from the command line to query and write to a local MySQL database. It has three levels of access (customer, manager and supervisor), and offers local data permanence.

## Overview

This version of Bamazon can be viewed as:

#### Customer:

![Bamazon Customer Process Flowchart](/img/customer-flow.png)

#### Manager:

![Bamazon Manager Process Flowchart](/img/manager-flow.png)

#### Supervisor:

![Bamazon Supervisor Process Flowchart](/img/super-flow.png)

## Demo

The store can be navigated from the command line. Flow shown for each of the available paths.

#### Customer:

[![Bamazon Customer Process Flow in Visual Studio Code Terminal](http://img.youtube.com/vi/HV_wMffOv-E/0.jpg)](http://www.youtube.com/watch?v=HV_wMffOv-E "Bamazon Customer Process Flow in Visual Studio Code Terminal")

#### Manager:

[![Bamazon Manager Process Flow in Visual Studio Code Terminal](http://img.youtube.com/vi/YTVF2dGKn40/0.jpg)](http://www.youtube.com/watch?v=YTVF2dGKn40 "Bamazon Manager Process Flow in Visual Studio Code Terminal")

#### Supervisor:

[![Bamazon Supervisor Process Flow in Visual Studio Code Terminal](http://img.youtube.com/vi/HV_wMffOv-E/0.jpg)](http://www.youtube.com/watch?v=SNYcW11GXSs "Bamazon Supervisor Process Flow in Visual Studio Code Terminal")

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

#### Prerequisites

A basic understanding of JavaScript, Node.js, MySQL, as well as a system meeting the minimum requirements and with access to the Internet and the command line. (Not standard on Windows machines. You will have to install your own, e.g Git Bash* or Babun. On Mac OS X look in /Applications/Utilities/ for Terminal, on Linux the location of the command line will depend on whether you are using the Gnome or the KDE window manager. Then follow instructions in your chosen app's documentation.)

Here's a good tutorial if you're new to this environment: https://www.davidbaumgold.com/tutorials/command-line/.

\* Git for Windows will not run on anything older than Windows Vista (such as Windows XP or Windows Server 2003). 


Standard system requirements to run Bamazon:

|  | Windows requirements | Mac requirements | Linux requirements |
|:---|:---:|:---:|:---:|
|**Operating system**|Windows 7 or later|Mac OS X Yosemite 10.10 or later 64-bit|Ubuntu 12.04+, Debian 8+, openSUSE 12.2+, or Fedora Linux 17+|
|**Processor**|Intel Pentium 4 or later	Intel|Intel Pentium 3 / Athlon 64 or later|
|**Memory**|2 GB minimum, 4 GB recommended|
|**Internet connection**|Required|

#### Installation

Fork or clone the repository from https://github.com/cfpaige/store-manager/.

![GitHub repository page screencap](/img/clone.png)

The app has several dependencies:

* inquirer
* mysql
* cli-table3
* clear
* figlet
* colors

All of them are available as packages that can be installed with npm or bower, or added with yarn. Check out npm documentation for specific instructions. (E.g. for cli-table3: https://www.npmjs.com/package/cli-table3).

You will also need to set up your own local MySQL server and database for your Bamazon app to be able to access the data (but you can use the files in the db folder for schema and seeds).

#### Deployment

As this is a command-line app, there's no website to deploy. Store files on your own server. Deploy from the command line on your machine.

#### Usage

This is a CLI (Command Line Interface) demo app. Modify with your preferred data or process structure and use to practice querying MySQL databases.

#### Built With 

[Virtual Studio Code](https://code.visualstudio.com/)

#### Contributing

Use the Issues feature of GitHub to suggest changes or fixes.

![Issues menu screencap](/img/issues.png)

#### Authors

- **cfpaige** - https://github.com/cfpaige?tab=repositories

#### License

Licensed under GNU GPL v3.
