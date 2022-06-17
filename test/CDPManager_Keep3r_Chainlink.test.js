const {
	expectEvent,
	ether,
} = require('openzeppelin-test-helpers');
const balance = require('./helpers/balances');
const BN = web3.utils.BN;
const { expect } = require('chai');
const utils = require('./helpers/utils');
const increaseTime = require('./helpers/timeTravel');

[
	'chainlinkMainAsset',
	'sushiswapKeep3rMainAsset',
	'uniswapKeep3rMainAsset'
].forEach(oracleMode =>
	contract(`CDPManager with ${oracleMode} oracle wrapper`, function([
		deployer,
		liquidator,
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
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					const { logs } = await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					expectEvent.inLogs(logs, 'Join', {
						asset: this.mainCollateral.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
					const gcdBalance = await this.gcd.balanceOf(deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount);
					expect(gcdBalance).to.be.bignumber.equal(gcdAmount);
				})

				it('Should spawn position using ETH', async function() {
					const mainAmount = ether('2');
					const gcdAmount = ether('1');

					const wethInVaultBefore = await this.weth.balanceOf(this.vault.address);

					const { logs } = await this.utils.joinEth(mainAmount, gcdAmount);

					expectEvent.inLogs(logs, 'Join', {
						asset: this.weth.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const wethInVaultAfter = await this.weth.balanceOf(this.vault.address);
					expect(wethInVaultAfter.sub(wethInVaultBefore)).to.be.bignumber.equal(mainAmount);

					const mainAmountInPosition = await this.vault.collaterals(this.weth.address, deployer);
					const gcdBalance = await this.gcd.balanceOf(deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount);
					expect(gcdBalance).to.be.bignumber.equal(gcdAmount);
				})
			})

			describe('Repay & withdraw', function() {
				it('Should repay the debt of a position and withdraw collaterals', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					const { logs } = await this.utils.repayAllAndWithdraw(this.mainCollateral, deployer);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.mainCollateral.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(new BN(0));
				})

				it('Should partially repay the debt of a position and withdraw collaterals partially', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					const mainToWithdraw = ether('50');
					const gcdToRepay = ether('2.5');

					const { logs } = await this.utils.exit(this.mainCollateral, mainToWithdraw, gcdToRepay);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.mainCollateral.address,
						owner: deployer,
						main: mainToWithdraw,
						gcd: gcdToRepay,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
					const gcdInPosition = await this.vault.debts(this.mainCollateral.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.sub(mainToWithdraw));
					expect(gcdInPosition).to.be.bignumber.equal(gcdAmount.sub(gcdToRepay));
				})

				it('Should partially repay the debt of a position using `exit_targetRepayment`', async function() {
					await this.vaultParameters.setStabilityFee(this.mainCollateral.address, 10_001);
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					await increaseTime(3600 * 24 * 365);

					await this.utils.updatePrice();

					const mainToWithdraw = ether('1');
					const repayment = ether('11');

					const receipt = await this.utils.exitTarget(this.mainCollateral, mainToWithdraw, repayment);

					expectEvent(receipt, 'Exit', {
						asset: this.mainCollateral.address,
						owner: deployer,
						main: mainToWithdraw,
					});

					// the principal is about 10 GCD
					expect(ether('10').sub(receipt.logs[0].args.gcd)).to.be.bignumber.lt(ether('0.001'));

					const gcdInPosition = await this.vault.debts(this.mainCollateral.address, deployer);

					// accumulated debt is about 1 GCD
					expect(gcdInPosition.sub(ether('11'))).to.be.bignumber.lt(ether('0.001'));
				})

				it('Should partially repay the debt of a position and withdraw collaterals partially using ETH', async function() {
					const mainAmount = ether('10');
					const gcdAmount = ether('1');

					await this.utils.joinEth(mainAmount, gcdAmount);

					const mainToWithdraw = ether('1');
					const gcdToRepay = ether('0.5');

					const wethBalanceBefore = await balance.current(this.weth.address);

					const { logs } = await this.utils.exitEth(mainToWithdraw, gcdToRepay);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.weth.address,
						owner: deployer,
						main: mainToWithdraw,
						gcd: gcdToRepay,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.weth.address, deployer);
					const gcdInPosition = await this.vault.debts(this.weth.address, deployer);
					const wethBalanceAfter = await balance.current(this.weth.address);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.sub(mainToWithdraw));
					expect(gcdInPosition).to.be.bignumber.equal(gcdAmount.sub(gcdToRepay));
					expect(wethBalanceBefore.sub(wethBalanceAfter)).to.be.bignumber.equal(mainToWithdraw);
				})

				it('Should repay the debt of a position and withdraw collaterals using ETH', async function() {
					const mainAmount = ether('2');
					const gcdAmount = ether('1');

					await this.utils.joinEth(mainAmount, gcdAmount);

					const wethInVaultBefore = await this.weth.balanceOf(this.vault.address);

					const { logs } = await this.utils.repayAllAndWithdrawEth(deployer);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.weth.address,
						owner: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const wethInVaultAfter = await this.weth.balanceOf(this.vault.address);

					const mainAmountInPosition = await this.vault.collaterals(this.weth.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(new BN(0));
					expect(wethInVaultBefore.sub(wethInVaultAfter)).to.be.bignumber.equal(mainAmount);
				})
			})

			it('Should deposit collaterals to position and mint GCD', async function() {
				let mainAmount = ether('100');
				let gcdAmount = ether('20');

				await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

				const { logs } = await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

				expectEvent.inLogs(logs, 'Join', {
					asset: this.mainCollateral.address,
					owner: deployer,
					main: mainAmount,
					gcd: gcdAmount,
				});

				const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
				const gcdBalance = await this.gcd.balanceOf(deployer);

				expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.mul(new BN(2)));
				expect(gcdBalance).to.be.bignumber.equal(gcdAmount.mul(new BN(2)));
			})

			it('Should withdraw collaterals from position and repay (burn) GCD', async function() {
				let mainAmount = ether('100');
				let gcdAmount = ether('20');

				await this.utils.join(this.mainCollateral, mainAmount.mul(new BN(2)), gcdAmount.mul(new BN(2)));

				const gcdSupplyBefore = await this.gcd.totalSupply();

				await this.utils.exit(this.mainCollateral, mainAmount, gcdAmount);

				const gcdSupplyAfter = await this.gcd.totalSupply();

				const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
				const gcdBalance = await this.gcd.balanceOf(deployer);

				expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount);
				expect(gcdBalance).to.be.bignumber.equal(gcdAmount);
				expect(gcdSupplyAfter).to.be.bignumber.equal(gcdSupplyBefore.sub(gcdAmount));
			})

		});

		describe('Pessimistic cases', function() {
			describe('Spawn', function() {

				it('Reverts non valuable tx', async function() {
					const mainAmount = ether('0');
					const gcdAmount = ether('0');

					await this.mainCollateral.approve(this.vault.address, mainAmount);
					const tx = this.utils.join(
						this.mainCollateral,
						mainAmount, // main
						gcdAmount,	// GCD
					);
					await this.utils.expectRevert(tx, "GCD Protocol: USELESS_TX");
				})

				describe('Reverts when collateralization is incorrect', function() {
					it('Not enough main collateral', async function() {
						let mainAmount = ether('0');
						const gcdAmount = ether('20');

						await this.mainCollateral.approve(this.vault.address, mainAmount);
						const tx = this.utils.join(
							this.mainCollateral,
							mainAmount, // main
							gcdAmount,	// GCD
						);
						await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
					})

					it('Reverts when main collateral is not approved', async function() {
						const mainAmount = ether('100');
						const gcdAmount = ether('20');

						const tx = this.utils.join(
							this.mainCollateral,
							mainAmount, // main
							gcdAmount,	// GCD
							{
								noApprove: true
							},
						);
						await this.utils.expectRevert(tx, "TRANSFER_FROM_FAILED");
					})
				})
			})

			describe('Exit', function() {
				it('Reverts non valuable tx', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.mainCollateral, 0, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: USELESS_TX");
				})

				it('Reverts when position becomes undercollateralized', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.mainCollateral, mainAmount, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
				})
			})

			it('Should fail to trigger liquidation of collateralized position', async function () {
				const positionOwner = deployer
				const mainAmount = ether('60');
				const gcdAmount = ether('70');

				/*
				 * Spawned position params:
				 * collateral value = 60 * 2 = 120$
				 * utilization percent = 70 / 120 = 58.3%
				 */
				await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

				const tx = this.utils.triggerLiquidation(this.mainCollateral, positionOwner, liquidator);
				await this.utils.expectRevert(tx, "GCD Protocol: SAFE_POSITION");
			})

		})
	})
)
