// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

import '../interfaces/IOracleRegistry.sol';
import '../interfaces/IVault.sol';
import '../interfaces/ICDPRegistry.sol';
import '../interfaces/IVaultManagerParameters.sol';
import '../interfaces/IVaultParameters.sol';
import '../interfaces/IWrappedToUnderlyingOracle.sol';
import '../interfaces/IForceTransferAssetStore.sol';
import '../interfaces/IFoundation.sol';

import '../helpers/ReentrancyGuard.sol';

/**
 * @title LiquidationAuction02
 **/
contract LiquidationAuction02 is ReentrancyGuard {

    IVault public immutable vault;
    IVaultManagerParameters public immutable vaultManagerParameters;
    ICDPRegistry public immutable cdpRegistry;
    IForceTransferAssetStore public immutable forceTransferAssetStore;

    uint public constant DENOMINATOR_1E2 = 1e2;
    uint public constant WRAPPED_TO_UNDERLYING_ORACLE_TYPE = 11;

    /**
     * @dev Trigger when buyouts are happened
    **/
    event Buyout(address indexed asset, address indexed owner, address indexed buyer, uint amount, uint price, uint penalty);

    modifier checkpoint(address asset, address owner) {
        _;
        cdpRegistry.checkpoint(asset, owner);
    }

    /**
     * @param _vaultManagerParameters The address of the contract with Vault manager parameters
     * @param _cdpRegistry The address of the CDP registry
     * @param _forceTransferAssetStore The address of the ForceTransferAssetStore
     **/
    constructor(address _vaultManagerParameters, address _cdpRegistry, address _forceTransferAssetStore) {
        require(
            _vaultManagerParameters != address(0) &&
            _forceTransferAssetStore != (address(0)),
                "GCD Protocol: INVALID_ARGS"
        );
        vaultManagerParameters = IVaultManagerParameters(_vaultManagerParameters);
        vault = IVault(IVaultParameters(IVaultManagerParameters(_vaultManagerParameters).vaultParameters()).vault());
        cdpRegistry = ICDPRegistry(_cdpRegistry);
        forceTransferAssetStore = IForceTransferAssetStore(_forceTransferAssetStore);
    }

    /**
     * @dev Buyouts a position's collateral
     * @param asset The address of the main collateral token of a position
     * @param owner The owner of a position
     **/
    function buyout(address asset, address owner) public nonReentrant checkpoint(asset, owner) {
        require(vault.liquidationBlock(asset, owner) != 0, "GCD Protocol: LIQUIDATION_NOT_TRIGGERED");
        uint startingPrice = vault.liquidationPrice(asset, owner);
        uint blocksPast = block.number - vault.liquidationBlock(asset, owner);
        uint depreciationPeriod = vaultManagerParameters.devaluationPeriod(asset);
        uint debt = vault.getTotalDebt(asset, owner);
        uint penalty = debt * vault.liquidationFee(asset, owner) / DENOMINATOR_1E2;
        uint collateralInPosition = vault.collaterals(asset, owner);

        uint collateralToLiquidator;
        uint collateralToOwner;
        uint repayment;

        (collateralToLiquidator, collateralToOwner, repayment) = _calcLiquidationParams(
            depreciationPeriod,
            blocksPast,
            startingPrice,
            debt + penalty,
            collateralInPosition
        );

        // ensure that at least 1 unit of token is transferred to cdp owner
        if (collateralToOwner == 0 && forceTransferAssetStore.shouldForceTransfer(asset)) {
            collateralToOwner = 1;
            collateralToLiquidator = collateralToLiquidator - 1;
        }

        _liquidate(
            asset,
            owner,
            collateralToLiquidator,
            collateralToOwner,
            repayment,
            penalty
        );
    }

    function _liquidate(
        address asset,
        address user,
        uint collateralToBuyer,
        uint collateralToOwner,
        uint repayment,
        uint penalty
    ) private {
        // send liquidation command to the Vault
        vault.liquidate(
            asset,
            user,
            collateralToBuyer,
            collateralToOwner,
            repayment,
            penalty,
            msg.sender
        );

        uint fee = repayment > penalty ? penalty : repayment;
        IFoundation(IVaultParameters(vaultManagerParameters.vaultParameters()).foundation()).submitLiquidationFee(fee);

        // fire an buyout event
        emit Buyout(asset, user, msg.sender, collateralToBuyer, repayment, penalty);
    }

    function _calcLiquidationParams(
        uint depreciationPeriod,
        uint blocksPast,
        uint startingPrice,
        uint debtWithPenalty,
        uint collateralInPosition
    )
    internal
    pure
    returns(
        uint collateralToBuyer,
        uint collateralToOwner,
        uint price
    ) {
        if (depreciationPeriod > blocksPast) {
            uint valuation = depreciationPeriod - blocksPast;
            uint collateralPrice = startingPrice * valuation / depreciationPeriod;
            if (collateralPrice > debtWithPenalty) {
                collateralToBuyer = collateralInPosition * debtWithPenalty / collateralPrice;
                collateralToOwner = collateralInPosition - collateralToBuyer;
                price = debtWithPenalty;
            } else {
                collateralToBuyer = collateralInPosition;
                price = collateralPrice;
            }
        } else {
            collateralToBuyer = collateralInPosition;
        }
    }
}
