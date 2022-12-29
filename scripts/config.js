// Different network configs

var configEthereum = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x213ecAe6b3CbC0AD976f7d82626546d5b63A71cB",
    vaultParams: "0x1c2a972841A64872178fC510CeE5C87301d91160",
    vault: "0xAAbBB7471bCA1C152C690f10A1A9e006FE17BD7e",
    oracleRegistry: "0x2E9B7ce6124284Fb6Afe402A619278E92Ac8Cf6B",
    collateralRegistry: "0x06Ad06040e001CeB6e907478238954723E464d9e",
    cdpRegistry: "0xe498a9A86D07EF5bb59218937824234E9d15168d",
    vaultManagerParameters: "0x3888C25AcDaB370dc2B85550E0943B4253346174",
    cdpManager01: "0x6aA3cDc7a0Ab05C58105AA4C85568583f2b7e02f",
    chainlinkedOracleMainAsset: "0xa424eB5D1098EA644591d49b96D39dbc69675F04",
    uniV3Oracle: "0x67717ea6376F18F217b733eE18abaAD480dAC928",
    // External contracts
    feesCollector: "0xbE70EB523398464De569A84F447576f4f169D8d9",
    wethAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    wbtcAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    gtonAddress: "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d",
    ogxtAddress: "",
    chainlinkETHUSDAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    chainlinkUSDCUSDAddress: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
    chainlinkBTCUSDAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
}

var configBscTestnet = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x213ecAe6b3CbC0AD976f7d82626546d5b63A71cB",
    vaultParams: "0x1c2a972841A64872178fC510CeE5C87301d91160",
    vault: "0xAAbBB7471bCA1C152C690f10A1A9e006FE17BD7e",
    oracleRegistry: "0x2E9B7ce6124284Fb6Afe402A619278E92Ac8Cf6B",
    collateralRegistry: "0x06Ad06040e001CeB6e907478238954723E464d9e",
    cdpRegistry: "0xe498a9A86D07EF5bb59218937824234E9d15168d",
    vaultManagerParameters: "0x3888C25AcDaB370dc2B85550E0943B4253346174",
    cdpManager01: "0x6aA3cDc7a0Ab05C58105AA4C85568583f2b7e02f",
    chainlinkedOracleMainAsset: "0x67717ea6376F18F217b733eE18abaAD480dAC928",
    uniV3Oracle: "0x18A46375cF74574Fab6e7eafCDD303940ACD40E7",
    // External contracts
    feesCollector: "0xf7a643F3Dfc4b49a06e30AfA349ae13873FF86BD",
    wethAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    usdcAddress: "0x449d7980bd24d1c1ecab9e0fc55b3bb665212fa5",
    ogxtAddress: "0x39833193a76F41f457082F48aDc33cB0A631C8F6",
    chainlinkETHUSDAddress: "0xce74fcab1fd566943b24bb64d4835c73cdcc3ebf",
    chainlinkUSDCUSDAddress: "0xAb242990C671176f2334f4c5fF3589A031A8A461",
    chainlinkOGXTUSDAddress: "0xE7a8B625873378dD4F9bBBEd4Dbc85129Dd39FC6",
}

var upgradableConfigRopsten = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0xEfedaF36c785dcEd1CebEA0A1BdBb5ae08022dAF",
    vaultParams: "0x24643a31abb6F06C451D2be5ED01D2f95571d14a",
    vault: "0x849F651dA55b4dE09C5e91C5d3c4AC890DAC8804",
    oracleRegistry: "0x6B5701e3c6Ae063c6cBf23000E146DaaFA6db6cF",
    collateralRegistry: "0x4EcC9B51A23d72aeD451A6e73f62eA5bE1B66E75",
    cdpRegistry: "0xEdFE015ea1ae4b73AA9D714d4f47F819B96c7507",
    vaultManagerParameters: "0x216f02d56C501E591D1A669E01A74F2A7aFE7Da8",
    cdpManager01: "0x5BD328d4182f244d6CB405Ea2bb0455C1899c968",
    chainlinkedOracleMainAsset: "0x5B9082Ac5E0be515DDa3f699C895AC0CD2751A65",
    uniV3Oracle: "0xaa2Cc9ca2251D1FF1B130a5514357E290574169F",
    // External contracts
    feesCollector: "0x50DF0af8a06f82fCcB0aCb77D8c986785b36d734",
    wethAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8", // gtonUSDC
    wbtcAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E",
    chainlinkUSDCUSDAddress: "0x801bBB7A8C4B54BcC3f787da400694223dAe6731",
    chainlinkBTCUSDAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
}

module.exports = { 
    configEthereum,
    upgradableConfigRopsten,
    configBscTestnet,
 };
