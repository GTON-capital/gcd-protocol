const {
	expectEvent,
} = require('@openzeppelin/test-helpers');
const BN = web3.utils.BN;
const { expect } = require('chai');
const utils = require('./helpers/utils');

[
	'chainlinkPoolToken',
	'sushiswapKeep3rPoolToken',
	'uniswapKeep3rPoolToken'
].forEach(oracleMode =>
	contract(`CDPManager with ${oracleMode} oracle`, function([
		deployer,
	]) {
		// deploy & initial settings
		beforeEach(async function() {
			this.utils = utils(this, oracleMode);
			this.deployer = deployer;
			await this.utils.deploy();
		});

		describe('Optimistic cases', function() {
			describe('Spawn', function() {
				it('Should spawn position', async function() {

					const mainAmount = new BN('100');
					const gcdAmount = new BN('20');

					const { logs } = await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

					expectEvent.inLogs(logs, 'Join', {
						asset: this.poolToken.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.poolToken.address, deployer);
					const gcdBalance = await this.gcd.balanceOf(deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount);
					expect(gcdBalance).to.be.bignumber.equal(gcdAmount);
					expect(await this.cdpRegistry.isListed(this.poolToken.address, deployer)).to.equal(true);
				})
			})

			describe('Repay & withdraw', function() {
				it('Should repay the debt of a position and withdraw collaterals', async function() {

					const mainAmount = new BN('100');
					const gcdAmount = new BN('20');

					await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

					const { logs } = await this.utils.repayAllAndWithdraw(this.poolToken, deployer);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.poolToken.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.poolToken.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(new BN(0));
					expect(await this.cdpRegistry.isListed(this.poolToken.address, deployer)).to.equal(false);
				})

				it('Should partially repay the debt of a position and withdraw collaterals partially', async function() {
					const mainAmount = new BN('100');
					const gcdAmount = new BN('20');

					await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

					const mainToWithdraw = new BN('50');
					const gcdToRepay = new BN('10');

					const { logs } = await this.utils.withdrawAndRepay(this.poolToken, mainToWithdraw, gcdToRepay);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.poolToken.address,
						owner: deployer,
						main: mainToWithdraw,
						gcd: gcdToRepay,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.poolToken.address, deployer);
					const gcdInPosition = await this.vault.debts(this.poolToken.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.sub(mainToWithdraw));
					expect(gcdInPosition).to.be.bignumber.equal(gcdAmount.sub(gcdToRepay));
				})
			})

			it('Should deposit collaterals to position and mint GCD', async function() {
				let mainAmount = new BN('100');
				let gcdAmount = new BN('20');

				await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

				const { logs } = await this.utils.join(this.poolToken, mainAmount, gcdAmount);

				expectEvent.inLogs(logs, 'Join', {
					asset: this.poolToken.address,
					owner: deployer,
					main: mainAmount,
					gcd: gcdAmount,
				});

				const mainAmountInPosition = await this.vault.collaterals(this.poolToken.address, deployer);
				const gcdBalance = await this.gcd.balanceOf(deployer);

				expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.mul(new BN(2)));
				expect(gcdBalance).to.be.bignumber.equal(gcdAmount.mul(new BN(2)));
			})

			it('Should withdraw collaterals from position and repay (burn) GCD', async function() {
				let mainAmount = new BN('100');
				let gcdAmount = new BN('20');

				await this.utils.spawn(this.poolToken, mainAmount.mul(new BN(2)), gcdAmount.mul(new BN(2)));

				const gcdSupplyBefore = await this.gcd.totalSupply();

				await this.utils.exit(this.poolToken, mainAmount, gcdAmount);

				const gcdSupplyAfter = await this.gcd.totalSupply();

				const mainAmountInPosition = await this.vault.collaterals(this.poolToken.address, deployer);
				const gcdBalance = await this.gcd.balanceOf(deployer);

				expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount);
				expect(gcdBalance).to.be.bignumber.equal(gcdAmount);
				expect(gcdSupplyAfter).to.be.bignumber.equal(gcdSupplyBefore.sub(gcdAmount));
			})
		});

		describe('Pessimistic cases', function() {
			describe('Spawn', function() {
				it('Reverts non valuable tx', async function() {
					const mainAmount = new BN('0');
					const gcdAmount = new BN('0');

					const tx = this.utils.spawn(
						this.poolToken,
						mainAmount, // main
						gcdAmount,	// GCD
					);
					await this.utils.expectRevert(tx, "GCD Protocol: USELESS_TX");
				})

				describe('Reverts when collateralization is incorrect', function() {
					it('Not enough main collateral', async function() {
						let mainAmount = new BN('0');
						const gcdAmount = new BN('20');

						const tx = this.utils.spawn(
							this.poolToken,
							mainAmount, // main
							gcdAmount,	// GCD
						);
						await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
					})

					it('Reverts when main collateral is not approved', async function() {
						const mainAmount = new BN('100');
						const gcdAmount = new BN('20');

						const tx = this.utils.spawn(
							this.poolToken,
							mainAmount, // main
							gcdAmount,	// GCD
							{ noApprove: true }
						);
						await this.utils.expectRevert(tx, "TRANSFER_FROM_FAILED");
					})
				})
			})

			describe('Exit', function() {
				it('Reverts non valuable tx', async function() {
					const mainAmount = new BN('100');
					const gcdAmount = new BN('20');

					await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.poolToken, 0, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: USELESS_TX");
				})

				it('Reverts when position state after exit becomes undercollateralized', async function() {
					const mainAmount = new BN('100');
					const gcdAmount = new BN('20');

					await this.utils.spawn(this.poolToken, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.poolToken, mainAmount, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
				})
			})
		})
	})
)
