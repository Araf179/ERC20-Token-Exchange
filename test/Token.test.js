// eslint-disable-next-line no-undef
const Token = artifacts.require('./Token');

require('chai')
.use(require("chai-as-promised"))
.should()

// eslint-disable-next-line no-undef
contract('Token', ([deployer, reciever]) => {
    const name = 'DApp Token';
    const symbol = 'DAPP';
    const decimals = '18';
    const totalSupply = '1000000000000000000000000';
    let token;

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it("Tracks the name", async () => {
           const token = await Token.new();
           const result = await token.name(); 
           result.should.equal(name);
        })

        it("tracks the symbol", async () => {
            const result = await token.symbol()
            result.should.equal(symbol)
        })

        it("Tracks the decimals", async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
        })

        it("tracks the total supply", async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply)
        })

        it("asigns the total sujpply to the depployer", async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply)
        })
    })

    describe('sending tokens', () => {
        it('transfers token balance', async () => {
            let balanceOf = await token.balanceOf(deployer);
            console.log('deployer alance', balanceOf.toString())
            balanceOf = await token.balanceOf(reciever)
            console.log('reciever balance', balanceOf.toString())

            await token.transfer(reciever, '100000000000000000000000', {from: deployer})

            balanceOf = await token.balanceOf(deployer);
            console.log('deployer balance after', balanceOf.toString())
            balanceOf = await token.balanceOf(reciever)
            console.log('reciever balance after', balanceOf.toString())
        })
    })
})

