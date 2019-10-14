# Optimizely CORs

> Solution for persisting Optimizely-related browser data to external origins, without having to await a data-sync and subject visitors to a flickering experience

## Components

#### `forwarder.js`
Data forwarding mechanism that lives on "primary" origin. The OptimizelyDataForwarder will:
* Send oeuid and localStorage visitor data off-origin via the iframe on page-load
* Allow you to send those pieces of data on-demand using `OptimizelyDataForwarder.sendVisitorData()` and `OptimizelyDataForwarder.sendOEUID()`

#### `receiver.js`
Data receiving mechanism that lives on "off origin". The OptimizelyDataReceiever will:
* Set the optimizelyEndUserId based on a value staged in localstorage
* Receive `postMessage` messages from the forwarder and write all necessary localStorage keys to 2nd origin

### Demo 
[Demo can be found here](https://creid-optimizely.s3.amazonaws.com/optcors/1.html)

### Browser Support 
Tested and validated in:
* Chrome
* Firefox

> Notes: <br />Safari - Private browsing mode (default setting) forbids any CORs storage access
