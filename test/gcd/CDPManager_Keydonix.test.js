const {
	expectEvent,
	ether,
} = require('@openzeppelin/test-helpers');
const balance = require('./helpers/balances');
const BN = web3.utils.BN;
const { expect } = require('chai');
const utils = require('./helpers/utils');
const increaseTime = require('./helpers/timeTravel');
const time = require('./helpers/time');

[
	'keydonixMainAsset',
].forEach(oracleMode =>
	contract(`CDPManager with ${oracleMode} oracle wrapper`, function([
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
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					const { logs } = await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					expectEvent.inLogs(logs, 'Join', {
						asset: this.mainCollateral.address,
						user: deployer,
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

					const { logs } = await this.utils.spawnEth(mainAmount, gcdAmount);

					expectEvent.inLogs(logs, 'Join', {
						asset: this.weth.address,
						user: deployer,
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

					await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					const { logs } = await this.utils.repayAllAndWithdraw(this.mainCollateral, deployer);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.mainCollateral.address,
						user: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(new BN(0));
				})

				it('Should accumulate fee when stability fee above zero and make repayment', async function() {
					await this.vaultParameters.setStabilityFee(this.mainCollateral.address, 3000); // 3% st. fee
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					const timeStart = await time.latest();

					await increaseTime(3600 * 24);

					const accumulatedDebt = await this.vault.getTotalDebt(this.mainCollateral.address, deployer);

					let expectedDebt = gcdAmount.mul(new BN('3000')).mul((await time.latest()).sub(timeStart)).div(new BN(365*24*60*60)).div(new BN('100000')).add(gcdAmount);

					expect(accumulatedDebt.div(new BN(10 ** 12))).to.be.bignumber.equal(
						expectedDebt.div(new BN(10 ** 12))
					);

					// get some gcd to cover fee
					await this.utils.updatePrice();
					await this.utils.spawnEth(ether('2'), ether('1'), ether('2'));

					// repay debt partially
					await this.utils.repay(this.mainCollateral, deployer, gcdAmount.div(new BN(2)));

					let accumulatedDebtAfterRepayment = await this.vault.getTotalDebt(this.mainCollateral.address, deployer);
					expect(accumulatedDebtAfterRepayment.div(new BN(10 ** 12))).to.be.bignumber.equal(
						expectedDebt.div(new BN(2)).div(new BN(10 ** 12))
					);

					await this.utils.repayAllAndWithdraw(this.mainCollateral, deployer);
				})

				it('Should partially repay the debt of a position and withdraw collaterals partially', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					const mainToWithdraw = ether('50');
					const gcdToWithdraw = ether('2.5');

					const { logs } = await this.utils.withdrawAndRepay(this.mainCollateral, mainToWithdraw, gcdToWithdraw);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.mainCollateral.address,
						user: deployer,
						main: mainToWithdraw,
						gcd: gcdToWithdraw,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
					const gcdInPosition = await this.vault.debts(this.mainCollateral.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.sub(mainToWithdraw));
					expect(gcdInPosition).to.be.bignumber.equal(gcdAmount.sub(gcdToWithdraw));
				})

				it('Should partially repay the debt of a position and withdraw collaterals partially using ETH', async function() {
					const mainAmount = ether('2');
					const gcdAmount = ether('1');

					await this.utils.spawnEth(mainAmount, gcdAmount);

					const mainToWithdraw = ether('1');
					const gcdToWithdraw = ether('0.5');

					const wethBalanceBefore = await balance.current(this.weth.address);

					const { logs } = await this.utils.withdrawAndRepayEth(mainToWithdraw, gcdToWithdraw);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.weth.address,
						user: deployer,
						main: mainToWithdraw,
						gcd: gcdToWithdraw,
					});

					const mainAmountInPosition = await this.vault.collaterals(this.weth.address, deployer);
					const gcdInPosition = await this.vault.debts(this.weth.address, deployer);
					const wethBalanceAfter = await balance.current(this.weth.address);

					expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.sub(mainToWithdraw));
					expect(gcdInPosition).to.be.bignumber.equal(gcdAmount.sub(gcdToWithdraw));
					expect(wethBalanceBefore.sub(wethBalanceAfter)).to.be.bignumber.equal(mainToWithdraw);
				})

				it('Should repay the debt of a position and withdraw collaterals using ETH', async function() {
					const mainAmount = ether('2');
					const gcdAmount = ether('1');

					await this.utils.spawnEth(mainAmount, gcdAmount);

					const wethInVaultBefore = await this.weth.balanceOf(this.vault.address);

					const { logs } = await this.utils.repayAllAndWithdrawEth(deployer);

					expectEvent.inLogs(logs, 'Exit', {
						asset: this.weth.address,
						user: deployer,
						main: mainAmount,
						gcd: gcdAmount,
					});

					const wethInVaultAfter = await this.weth.balanceOf(this.vault.address);

					const mainAmountInPosition = await this.vault.collaterals(this.weth.address, deployer);

					expect(mainAmountInPosition).to.be.bignumber.equal(new BN(0));
					expect(wethInVaultBefore.sub(wethInVaultAfter)).to.be.bignumber.equal(mainAmount);
				})
			})

			it('Should deposit collaterals to position and mint GCD', async function () {
				let mainAmount = ether('100');
				let gcdAmount = ether('20');

				await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

				const { logs } = await this.utils.join(this.mainCollateral, mainAmount, gcdAmount);

				expectEvent.inLogs(logs, 'Join', {
					asset: this.mainCollateral.address,
					user: deployer,
					main: mainAmount,
					gcd: gcdAmount,
				});

				const mainAmountInPosition = await this.vault.collaterals(this.mainCollateral.address, deployer);
				const gcdBalance = await this.gcd.balanceOf(deployer);

				expect(mainAmountInPosition).to.be.bignumber.equal(mainAmount.mul(new BN(2)));
				expect(gcdBalance).to.be.bignumber.equal(gcdAmount.mul(new BN(2)));
			})

			it('Should withdraw collaterals from position and repay (burn) GCD', async function () {
				let mainAmount = ether('100');
				let gcdAmount = ether('20');

				await this.utils.spawn(this.mainCollateral, mainAmount.mul(new BN(2)), gcdAmount.mul(new BN(2)));

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

					await this.utils.approveCollaterals(this.mainCollateral, mainAmount);
					const tx = this.utils.spawn(
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

						await this.utils.approveCollaterals(this.mainCollateral, mainAmount);
						const tx = this.utils.spawn(
							this.mainCollateral,
							mainAmount, // main
							gcdAmount,	// GCD
						);
						await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
					})

					it('Reverts when main collateral is not approved', async function() {
						const mainAmount = ether('100');
						const gcdAmount = ether('20');

						const tx = this.utils.spawn(
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

			describe('Join', function () {
				it('Reverts non-spawned position', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					const tx = this.utils.join(
						this.mainCollateral,
						mainAmount,
						gcdAmount,
					);
					await this.utils.expectRevert(tx, "GCD Protocol: NOT_SPAWNED_POSITION");
				})
			})

			describe('Exit', function () {
				it('Reverts non valuable tx', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.mainCollateral, 0, 0, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: USELESS_TX");
				})

				it('Reverts when position becomes undercollateralized', async function() {
					const mainAmount = ether('100');
					const gcdAmount = ether('20');

					await this.utils.spawn(this.mainCollateral, mainAmount, gcdAmount);

					const tx = this.utils.exit(this.mainCollateral, mainAmount, 0, 0);
					await this.utils.expectRevert(tx, "GCD Protocol: UNDERCOLLATERALIZED");
				})
			})
		})
	})
);
