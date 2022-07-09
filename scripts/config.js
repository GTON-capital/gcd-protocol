// Different network configs

var configEthereum = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "",
    vaultParams: "",
    vault: "",
    oracleRegistry: "",
    collateralRegistry: "",
    cdpRegistry: "",
    vaultManagerParameters: "",
    cdpManager01: "",
    chainlinkedOracleMainAsset: "",
    uniV3Oracle: "",
    // External contracts
    wethAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    gtonAddress: "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d",
    chainlinkETHUSDAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    chainlinkUSDCUSDAddress: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
}

var upgradableConfigRopsten = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x6F14c257b19Bcbc5e99CC0872CB7771FB378fe93",
    vaultParams: "0xF6045A1d0Ab52e886fb96e45B35b4340C3eF0817",
    vault: "0xB946b89FbdE4e79d981041a3c446a8709606b648",
    oracleRegistry: "0xbfDF4D2Ae5ADe91425086443BA3E1B3B4e8C3D49",
    collateralRegistry: "0x4591D83cC405DCbd55937259a7CF3204610E333A",
    cdpRegistry: "0x356B647AC7c685019EEb9100e4602CC14a60f482",
    vaultManagerParameters: "0xEDa920B85A22CcAA005E70a391977e2713EC690c",
    cdpManager01: "0xf2edCA6E853e7C0C7DDCB01060489F89cddcf1dB",
    chainlinkedOracleMainAsset: "0xF3AD74D95BC48447C1D5F19f1B91e086d4512DfA",
    uniV3Oracle: "0x154Cd9A039694bd7359066Fb7b2e6496DE82938a",
    // External contracts
    wethAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8", // gtonUSDC
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E",
    chainlinkUSDCUSDAddress: "0x801bBB7A8C4B54BcC3f787da400694223dAe6731",
}

var configGoerli = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x1EF834d6D3694a932A2082678EDd543E3Eb3412b",
    vaultParams: "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F",
    vault: "0x097f64Be4E8De6608B1d28B3732aD480D8d45823",
    oracleRegistry: "0xC0B881e21eE1B847A659206C0214E3357788E88E",
    collateralRegistry: "0x545A51D0A95C2EACbD49F4bEDEb4426dB31D113C",
    cdpRegistry: "0x9905EB831b103f8aB1F4da5707ef5400ff27d62D",
    vaultManagerParameters: "0x5f442aE49f1a17954bB1490F8fa6F1c5E04afFd0",
    cdpManager01: "0x9499e7a07Ec60731F2b063A5F29595DB02eF6567",
    chainlinkedOracleMainAsset: "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981",
    uniV3Oracle: "0xE70fFd03131675258bd421e98e5552FDfd01aDeA",
    // External contracts
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8",
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0x7b349BaEf511419454B78cd0e2046861Bc0aEb48",
    chainlinkUSDCUSDAddress: "0x684EF2E18b9e1AEFeeAF82BEF1cFe37f3F07f162",
}

var configRopsten = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x1ef834d6d3694a932a2082678edd543e3eb3412b",
    vaultParams: "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F",
    vault: "0x097f64Be4E8De6608B1d28B3732aD480D8d45823",
    oracleRegistry: "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd",
    collateralRegistry: "0x5018c2a74015e09D9B72ac9571D2Ff5594355b63",
    cdpRegistry: "0xD0011dE099E514c2094a510dd0109F91bf8791Fa",
    vaultManagerParameters: "0x3c4925B50e337aeCC2cF4B9E4767B43DcfbaD286",
    cdpManager01: "0x7023401be71E1D8C8c9548933A2716aB3234E754",
    chainlinkedOracleMainAsset: "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28",
    uniV3Oracle: "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981",
    // External contracts
    wethAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8", // gtonUSDC
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E",
    chainlinkUSDCUSDAddress: "0x801bBB7A8C4B54BcC3f787da400694223dAe6731",
}

module.exports = { 
    configEthereum,
    upgradableConfigRopsten,
 };
