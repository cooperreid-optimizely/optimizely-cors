# Optimizely CORs

> Solution for persisting Optimizely-related browser data to external origins, without having to await a data-sync and without resulting in flickering

## Components

#### `forwarder.js`
Data forwarding mechanism that lives on "primary" origin. The OptimizelyDataForwarder will:
* Send oeuid and localStorage visitor data off-origin via the iframe on page-load
* Allow you to send those pieces of data on-demand using `OptimizelyDataForwarder.sendVisitorData()` and `OptimizelyDataForwarder.sendOEUID()`

#### `receiver.js`
Data receiving mechanism that lives on "off origin". The OptimizelyDataReceiever will:
* Set the optimizelyEndUserId based on a value staged in localstorage
* Receive `postMessage` messages from the forwarder and write all necessary localStorage keys to 2nd origin
* This should live on all "off-origin" pages where Optimizely needs to run

#### `sync.html`
Page that includes the `receiver.js` client. This should be hosted on the 2nd origin in order to give pass and set the localStorage keys to the 2nd origin.

## Demo 
[Demo can be found here](https://creid-optimizely.s3.amazonaws.com/optcors/1.html)

## Setup
1. Host the `forwarder.js` on a page on the primary origin
2. Host the `sycn.html` page on a 2nd origin
3. Host the `receiver.js` on any page on the 2nd origin where Optimizely needs to run

## Browser Support 
Tested and validated in:
* Chrome
* Firefox

> Notes: <br />Safari - Private browsing mode (default setting) forbids any CORs storage access

## Todo 
* Rethink responsibility of `receiever.js`. The code responsbility for receiving `postMessage` messages should be embedded directly in the `sync.html` page, and the code that sets the optimizelyEndUserId cookie can live somewhere on origin 2's pages ahead of Optimizely. Essentially, the postMessage code in `receiver.js` doesn't need to live everywhere across the origin 2 site.
