const deviceWallet = require('../skywallet');
const assert = require('chai').assert;
const utils = require('../utils');
const rejectPromise = utils.rejectPromise;

const setup = utils.deviceSetup;
const wordReader = utils.unexpectedWordHandler;

const generateSeedOk = function (wordCount) {
  return setup().
    then(() => deviceWallet.devGenerateMnemonic(wordCount, false)).
    then(() => `Test generate with ${wordCount} words succeeded.`).
    catch(rejectPromise());
};

const generateSeedFail = function (wordCount) {
  return setup().
    then(() => deviceWallet.devGenerateMnemonic(wordCount, false)).
    then((msg) => Promise.reject(new Error(`Should work with 12 or 24 word count only ${msg}`))).
    catch(() => Promise.resolve(`Test generate with ${wordCount} words failed as expected.`));
};

describe('Transactions', function () {
  if (deviceWallet.getDevice() === null) {
    console.log("Skycoin hardware NOT FOUND, using emulator");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.EMULATOR);
    deviceWallet.setAutoPressButton(true, 'R');
  } else {
    console.log("Skycoin hardware is plugged in");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.USB);
  }

  it('Should have a result equal to zero', function() {
    this.timeout(0);
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        generateSeedOk(12).
          then(() => generateSeedOk(24)).
          then(() => generateSeedFail(17)).
          then(() => {
            resolve(0);
          }).
          catch(rejectPromise(reject));
      }, 200);
    }).then(function(result) {
      assert.equal(result, 0);
    });
  });

});

describe('Recovery', function () {
  if (deviceWallet.getDevice() === null) {
    console.log("Skycoin hardware NOT FOUND, using emulator");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.EMULATOR);
    deviceWallet.setAutoPressButton(true, 'R');
  } else {
    console.log("Skycoin hardware is plugged in");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.USB);
  }

  it('Can not recovery an initialized device', function() {
    this.timeout(0);
    return generateSeedOk(12).
      then(() => deviceWallet.devRecoveryDevice(wordCount, false, wordReader)).
      then(() => {
        // Unreachable path but jic
        throw new Error('Unexpected recovery success');
      }).
      catch((err) => {
        assert.equal(err.toString(), 'Error: Device is already initialized. Use Wipe first.');
      });
  });

});
