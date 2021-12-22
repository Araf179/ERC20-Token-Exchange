var web3 = require("web3");

// eslint-disable-next-line no-undef
const Token = artifacts.require('./Token');

require('chai')
.use(require("chai-as-promised"))
.should()

const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}

// eslint-disable-next-line no-undef
contract('Token', ([deployer, reciever, exchange]) => {
    const name = 'DApp Token';
    const symbol = 'DAPP';
    const decimals = '18';
    const totalSupply = tokens(1000000);
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
            result.toString().should.equal(totalSupply.toString())
        })

        it("asigns the total sujpply to the depployer", async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
        })
    })

    describe('sending tokens', () => {
        let amount;
        let result;
        
        beforeEach(async () => {
            amount = tokens(100)
            result = await token.transfer(reciever, amount, {from: deployer})
            await token.approve(exchange, amount, { from: deployer })
            //result = await token.transfer(reciever, amount, {from: deployer})
        })

        it('transfers token balance', async () => {
            let balanceOf = await token.balanceOf(deployer);
            balanceOf = await token.balanceOf(reciever)
            await token.transfer(reciever, tokens(100), {from: deployer})
            balanceOf = await token.balanceOf(deployer);
            balanceOf.toString().should.equal(tokens(999800).toString())
            balanceOf = await token.balanceOf(reciever)
            balanceOf.toString().should.equal(tokens(200).toString())
        })

        it('emits a transfer event', async () => {
            const log = result.logs[0]
            log.event.should.eq("Transfer")
            const event = log.args
            event.from.toString().should.equal(deployer, 'from is correct')
            event.to.should.equal(reciever, 'to is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
        })

        it('rejects insufficient balances', async () => {
            let invalidAmount;
            invalidAmount = tokens(1000000000)
            await token.transfer(reciever, invalidAmount, { from: deployer }).should.be.rejectedWith('VM Exception while processing transaction: revert')
        })
    })
    
    describe('Approving tokens', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, {from: deployer});
        })

        describe('success', () => {
            it('allocates an allowance for delegated token spending on exchange', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString());
            })

            it('emits a approval event', async () => {
                const log = result.logs[0]
                log.event.should.eq("Approval")
                const event = log.args
                event._owner.toString().should.equal(deployer, 'owner is correct')
                event._spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })

        })

        describe('failure', () => {
            it('rejects invalid senders', async () => {
                await token.approve(0x0, amount, {from: deployer }).should.be.rejected;
            })

            it('rejects insufficient amounts', async () => {
                const invalidAmount = tokens(1000000000);
                await token.transferFrom(deployer, reciever, invalidAmount, {from: exchange}).should.be.rejected;
            })
        })
    })
})

