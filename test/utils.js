const { describe, it } = require('mocha')
const assert = require('assert');
const { hex2LittleEndingBuffer, calcContractAddress, formatCfxAddress } = require('../utils');


describe('hex2LittleEndingBuffer', function () {
    it('should return little ending buffer', function () {
        let le = hex2LittleEndingBuffer("0x0123456789abcdef")
        const expect = Buffer.from("efcdab8967452301", 'hex')
        assert.ok(Buffer.compare(le, expect) === 0)
    });
});

describe('calcContractAddress', function () {
    it('should work', function () {
        let table = [
            {
                actual: calcContractAddress("NET3585:TYPE.USER:AAJM0G9YWZ0SJKWKB0XGYZFT02WV5Z1DKAVNPS63X7", 1, "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220d87130a47b02a6fc81630ec6abfe6c73495df32350603e693c8634b31b53d31e64736f6c63430008000033"),
                expect: "net3585:acd01jakry4sns30xbkrcyzxy2a2nvdkkeeme12tvu"
            },
            {
                actual: calcContractAddress(formatCfxAddress("0x0f572e5295c57f15886f9b263e2f6d2d6c7b5ec6", 3585), 88, "0x"),
                expect: "net3585:acd85byn4xuf8c9fu0nbyyyxy4gt05hgb29s1853yj"
            }
        ]
        table.forEach(i => {
            let { actual, expect } = i
            assert.ok(actual === expect, `expect ${expect}, actual ${actual}`)
        })
    })
    
})