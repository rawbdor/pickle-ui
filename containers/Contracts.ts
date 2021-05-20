import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Connection } from "./Connection";

import { BasisStaking } from "./Contracts/BasisStaking";
import { BasisStaking__factory as BasisStakingFactory } from "./Contracts/factories/BasisStaking__factory";
import { Comptroller } from "./Contracts/Comptroller";
import { Comptroller__factory as ComptrollerFactory } from "./Contracts/factories/Comptroller__factory";
import { Controller } from "./Contracts/Controller";
import { Controller__factory as ControllerFactory } from "./Contracts/factories/Controller__factory";
import { Ctoken } from "./Contracts/Ctoken";
import { Ctoken__factory as CtokenFactory } from "./Contracts/factories/Ctoken__factory";
import { CurveGauge } from "./Contracts/CurveGauge";
import { CurveGauge__factory as CurveGaugeFactory } from "./Contracts/factories/CurveGauge__factory";
import { CurveProxyLogic } from "./Contracts/CurveProxyLogic";
import { CurveProxyLogic__factory as CurveProxyLogicFactory } from "./Contracts/factories/CurveProxyLogic__factory";
import { Dill } from "./Contracts/Dill";
import { Dill__factory as DillFactory } from "./Contracts/factories/Dill__factory";
import { Erc20 } from "./Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "./Contracts/factories/Erc20__factory";
import { FeeDistributor } from "./Contracts/FeeDistributor";
import { FeeDistributor__factory as FeeDistributorFactory } from "./Contracts/factories/FeeDistributor__factory";
import { Gauge } from "./Contracts/Gauge";
import { Gauge__factory as GaugeFactory } from "./Contracts/factories/Gauge__factory";
import { GaugeController } from "./Contracts/GaugeController";
import { GaugeController__factory as GaugeControllerFactory } from "./Contracts/factories/GaugeController__factory";
import { GaugeProxy } from "./Contracts/GaugeProxy";
import { GaugeProxy__factory as GaugeProxyFactory } from "./Contracts/factories/GaugeProxy__factory";
import { Instabrine } from "./Contracts/Instabrine";
import { Instabrine__factory as InstabrineFactory } from "./Contracts/factories/Instabrine__factory";
import { Masterchef } from "./Contracts/Masterchef";
import { Masterchef__factory as MasterchefFactory } from "./Contracts/factories/Masterchef__factory";
import { Pool } from "./Contracts/Pool";
import { Pool__factory as PoolFactory } from "./Contracts/factories/Pool__factory";
import { StakingPools } from "./Contracts/StakingPools";
import { YearnRegistry } from "./Contracts/YearnRegistry";
import { YearnRegistry__factory as YearnRegistryFactory } from "./Contracts/factories/YearnRegistry__factory";
import { StakingPools__factory as StakingPoolsFactory } from "./Contracts/factories/StakingPools__factory";
import { StakingRewards } from "./Contracts/StakingRewards";
import { StakingRewards__factory as StakingRewardsFactory } from "./Contracts/factories/StakingRewards__factory";
import { Strategy } from "./Contracts/Strategy";
import { Strategy__factory as StrategyFactory } from "./Contracts/factories/Strategy__factory";
import { SushiChef } from "./Contracts/SushiChef";
import { SushiChef__factory as SushiChefFactory } from "./Contracts/factories/SushiChef__factory";
import { Uniswapv2Pair } from "./Contracts/Uniswapv2Pair";
import { Uniswapv2Pair__factory as Uniswapv2PairFactory } from "./Contracts/factories/Uniswapv2Pair__factory";
import { Uniswapv2ProxyLogic } from "./Contracts/Uniswapv2ProxyLogic";
import { Uniswapv2ProxyLogic__factory as Uniswapv2ProxyLogicFactory } from "./Contracts/factories/Uniswapv2ProxyLogic__factory";
import { YvboostMigrator } from "./Contracts/YvboostMigrator";
import { YvboostMigrator__factory as YvboostMigratorFactory } from "./Contracts/factories/YvboostMigrator__factory";
import { YvecrvZap } from "./Contracts/YvecrvZap";
import { YvecrvZap__factory as YvecrvZapFactory } from "./Contracts/factories/YvecrvZap__factory";

export const PICKLE_STAKING_SCRV_REWARDS =
  "0xd86f33388bf0bfdf0ccb1ecb4a48a1579504dc0a";
export const PICKLE_STAKING_WETH_REWARDS =
  "0xa17a8883dA1aBd57c690DF9Ebf58fC194eDAb66F";

export const DILL = "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf";

export const COMPTROLLER_ADDR = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export const PICKLE_TOKEN_ADDR = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";
export const MASTERCHEF_ADDR = "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d";
export const CONTROLLER_ADDR = "0x6847259b2B3A4c17e7c43C54409810aF48bA5210";

export const UNISWAPV2_PROXY_LOGIC =
  "0x0a536ca30B9E20a3D89c91c22Ef77E1AeBBd6944";
export const CURVE_PROXY_LOGIC = "0x6186E99D9CFb05E1Fdf1b442178806E81da21dD8";

export const GAUGE_CONTROLLER_ADDR =
  "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB";
export const SUSD_GAUGE_ADDR = "0xA90996896660DEcC6E997655E065b23788857849";
export const SUSD_POOL_ADDR = "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD";
export const STETH_GAUGE_ADDR = "0x182B723a58739a9c974cFDB385ceaDb237453c28";
export const STETH_POOL_ADDR = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const RENBTC_GAUGE_ADDR = "0xB1F2cdeC61db658F091671F5f199635aEF202CAC";
export const RENBTC_POOL_ADDR = "0x93054188d876f558f4a66B2EF1d97d16eDf0895B";
export const THREE_GAUGE_ADDR = "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A";
export const THREE_POOL_ADDR = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const LUSD_POOL_ADDR = "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA";
export const EURS_POOL_ADDR = "0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC";

export const SUSDV2_DEPOSIT_ADDR = "0xFCBa3E75865d2d561BE8D220616520c171F12851";

export const SUSDV2_CRV = "0xC25a3A3b969415c80451098fa907EC722572917F";
export const THREE_CRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
export const RENBTC_CRV = "0x49849C98ae39Fff122806C06791Fa73784FB3675";

export const SCRV_STAKING_REWARDS =
  "0xDCB6A51eA3CA5d3Fd898Fd6564757c7aAeC3ca92";
export const STECRV_STAKING_REWARDS =
  "0x99ac10631F69C753DDb595D074422a0922D9056B";

export const LQTY_LUSD_ETH_STAKING_REWARDS =
  "0xd37a77E71ddF3373a79BE2eBB76B6c4808bDF0d5";

export const UNI_ETH_DAI_STAKING_REWARDS =
  "0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711";
export const UNI_ETH_USDC_STAKING_REWARDS =
  "0x7fba4b8dc5e7616e59622806932dbea72537a56b";
export const UNI_ETH_USDT_STAKING_REWARDS =
  "0x6c3e4cb2e96b01f4b866965a91ed4437839a121a";
export const UNI_ETH_WBTC_STAKING_REWARDS =
  "0xCA35e32e7926b96A9988f61d510E038108d8068e";
export const MITH_MIC_USDT_STAKING_REWARDS =
  "0x9D9418803F042CCd7647209b0fFd617981D5c619";
export const MITH_MIS_USDT_STAKING_REWARDS =
  "0x14E33e1D6Cc4D83D7476492C0A52b3d4F869d892";
export const BASIS_BAC_DAI_V1_STAKING_REWARDS =
  "0x067d4D3CE63450E74F880F86b5b52ea3edF9Db0f";
export const BASIS_BAC_DAI_STAKING_REWARDS =
  "0x7E7aE8923876955d6Dcb7285c04065A1B9d6ED8c";
export const BASIS_BAS_DAI_STAKING_REWARDS =
  "0x5859Adb05988946B9d08dcE2E12ae29af58120C0";
export const BASIS_BAC_DAI_PID = 0;
export const BASIS_BAS_DAI_PID = 1;

export const MIRROR_MIR_UST_STAKING_REWARDS =
  "0x5d447Fc0F8965cED158BAB42414Af10139Edf0AF";

export const MIRROR_MTSLA_UST_STAKING_REWARDS =
  "0x43DFb87a26BA812b0988eBdf44e3e341144722Ab";
export const MIRROR_MAAPL_UST_STAKING_REWARDS =
  "0x735659C8576d88A2Eb5C810415Ea51cB06931696";
export const MIRROR_MQQQ_UST_STAKING_REWARDS =
  "0xc1d2ca26A59E201814bF6aF633C3b3478180E91F";
export const MIRROR_MSLV_UST_STAKING_REWARDS =
  "0xDB278fb5f7d4A7C3b83F80D18198d872Bbf7b923";
export const MIRROR_MBABA_UST_STAKING_REWARDS =
  "0x769325E8498bF2C2c3cFd6464A60fA213f26afcc";

export const FEI_TRIBE_STAKING_REWARDS =
  "0x18305DaAe09Ea2F4D51fAa33318be5978D251aBd";

export const ALCHEMIX_ALCX_ETH_STAKING_POOLS =
  "0xab8e74017a8cc7c15ffccd726603790d26d7deca";

export const INSTABRINE = "0x8F9676bfa268E94A2480352cC5296A943D5A2809";
export const SUSHI_CHEF = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
export const GAUGE_PROXY = "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f";
export const FEE_DISTRIBUTOR = "0x74C6CadE3eF61d64dcc9b97490d9FbB231e4BdCc";
export const YVECRV_ZAP = "0x1fd6ADbA9FEe5c18338F134E31b4a323aFa06AD4";

export const YVBOOST_MIGRATOR = "0x61Dde5da89fB3a099035bd9b3f94d1105A22F3d9";

export const YEARN_REGISTRY = "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804";

function useContracts() {
  const { signer } = Connection.useContainer();

  const [pickle, setPickle] = useState<Erc20 | null>(null);
  const [masterchef, setMasterchef] = useState<Masterchef | null>(null);
  const [controller, setController] = useState<Controller | null>(null);

  const [
    gaugeController,
    setGaugeController,
  ] = useState<GaugeController | null>(null);
  const [susdGauge, setSUSDGauge] = useState<CurveGauge | null>(null);
  const [susdPool, setSUSDPool] = useState<Pool | null>(null);
  const [steCRVGauge, setSteCRVGauge] = useState<CurveGauge | null>(null);
  const [steCRVPool, setSteCRVPool] = useState<Pool | null>(null);
  const [renGauge, setRENGauge] = useState<CurveGauge | null>(null);
  const [renPool, setRENPool] = useState<Pool | null>(null);
  const [threeGauge, setThreeGauge] = useState<CurveGauge | null>(null);
  const [threePool, setThreePool] = useState<Pool | null>(null);
  const [comptroller, setComptroller] = useState<Comptroller | null>(null);
  const [cToken, setCToken] = useState<Ctoken | null>(null);
  const [sushiChef, setSushiChef] = useState<SushiChef | null>(null);
  const [dill, setDill] = useState<Dill | null>(null);
  const [gaugeProxy, setGaugeProxy] = useState<GaugeProxy | null>(null);
  const [gauge, setGauge] = useState<Gauge | null>(null);
  const [feeDistributor, setFeeDistributor] = useState<FeeDistributor | null>(
    null,
  );

  const [stakingRewards, setStakingRewards] = useState<StakingRewards | null>(
    null,
  );
  const [basisStaking, setBasisStaking] = useState<BasisStaking | null>(null);
  const [uniswapv2Pair, setUniswapv2Pair] = useState<Uniswapv2Pair | null>(
    null,
  );
  const [erc20, setERC20] = useState<Erc20 | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [
    curveProxyLogic,
    setCurveProxyLogic,
  ] = useState<CurveProxyLogic | null>(null);
  const [
    uniswapv2ProxyLogic,
    setUniswapv2ProxyLogic,
  ] = useState<Uniswapv2ProxyLogic | null>(null);

  const [instabrine, setInstabrine] = useState<Instabrine | null>(null);

  const [yveCrvZap, setYveCrvZap] = useState<YvecrvZap | null>(null);
  const [stakingPools, setStakingPools] = useState<StakingPools | null>(null);
  const [yearnRegistry, setYearnRegistry] = useState<YearnRegistry | null>(
    null,
  );
  const [lusdPool, setLusdPool] = useState<Pool | null>(null);
  const [eursPool, setEursPool] = useState<Pool | null>(null);

  const [
    yvBoostMigrator,
    setyvBoostMigrator,
  ] = useState<YvboostMigrator | null>(null);

  const initContracts = async () => {
    if (signer) {
      setPickle(Erc20Factory.connect(PICKLE_TOKEN_ADDR, signer));
      setMasterchef(MasterchefFactory.connect(MASTERCHEF_ADDR, signer));
      setController(ControllerFactory.connect(CONTROLLER_ADDR, signer));
      setGaugeController(
        GaugeControllerFactory.connect(GAUGE_CONTROLLER_ADDR, signer),
      );
      setSUSDGauge(CurveGaugeFactory.connect(SUSD_GAUGE_ADDR, signer));
      setSUSDPool(PoolFactory.connect(SUSD_POOL_ADDR, signer));
      setSteCRVGauge(CurveGaugeFactory.connect(STETH_GAUGE_ADDR, signer));
      setSteCRVPool(PoolFactory.connect(STETH_POOL_ADDR, signer));
      setRENGauge(CurveGaugeFactory.connect(RENBTC_GAUGE_ADDR, signer));
      setRENPool(PoolFactory.connect(RENBTC_POOL_ADDR, signer));
      setThreeGauge(CurveGaugeFactory.connect(THREE_GAUGE_ADDR, signer));
      setThreePool(PoolFactory.connect(THREE_POOL_ADDR, signer));

      setStakingRewards(
        StakingRewardsFactory.connect(ethers.constants.AddressZero, signer),
      );
      setBasisStaking(
        BasisStakingFactory.connect(ethers.constants.AddressZero, signer),
      );
      setUniswapv2Pair(
        Uniswapv2PairFactory.connect(ethers.constants.AddressZero, signer),
      );
      setERC20(Erc20Factory.connect(ethers.constants.AddressZero, signer));
      setCToken(CtokenFactory.connect(ethers.constants.AddressZero, signer));
      setComptroller(ComptrollerFactory.connect(COMPTROLLER_ADDR, signer));
      setStrategy(
        StrategyFactory.connect(ethers.constants.AddressZero, signer),
      );
      setCurveProxyLogic(
        CurveProxyLogicFactory.connect(CURVE_PROXY_LOGIC, signer),
      );
      setUniswapv2ProxyLogic(
        Uniswapv2ProxyLogicFactory.connect(UNISWAPV2_PROXY_LOGIC, signer),
      );
      setInstabrine(InstabrineFactory.connect(INSTABRINE, signer));
      setSushiChef(SushiChefFactory.connect(SUSHI_CHEF, signer));
      setDill(DillFactory.connect(DILL, signer));
      setGaugeProxy(GaugeProxyFactory.connect(GAUGE_PROXY, signer));
      setGauge(GaugeFactory.connect(ethers.constants.AddressZero, signer));
      setFeeDistributor(FeeDistributorFactory.connect(FEE_DISTRIBUTOR, signer));
      setYveCrvZap(YvecrvZapFactory.connect(YVECRV_ZAP, signer));
      setyvBoostMigrator(
        YvboostMigratorFactory.connect(YVBOOST_MIGRATOR, signer),
      );
      setStakingPools(
        StakingPoolsFactory.connect(ALCHEMIX_ALCX_ETH_STAKING_POOLS, signer),
      );
      setYearnRegistry(YearnRegistryFactory.connect(YEARN_REGISTRY, signer));

      setLusdPool(PoolFactory.connect(LUSD_POOL_ADDR, signer));

      setEursPool(PoolFactory.connect(EURS_POOL_ADDR, signer));
    }
  };

  useEffect(() => {
    if (signer) initContracts();
  }, [signer]);

  return {
    pickle,
    masterchef,
    controller,
    susdGauge,
    renGauge,
    threeGauge,
    steCRVGauge,
    gaugeController,
    susdPool,
    renPool,
    threePool,
    steCRVPool,
    stakingRewards,
    uniswapv2Pair,
    erc20,
    comptroller,
    cToken,
    strategy,
    uniswapv2ProxyLogic,
    curveProxyLogic,
    instabrine,
    sushiChef,
    basisStaking,
    dill,
    gaugeProxy,
    gauge,
    feeDistributor,
    yveCrvZap,
    yvBoostMigrator,
    stakingPools,
    yearnRegistry,
    lusdPool,
    eursPool,
  };
}

export const Contracts = createContainer(useContracts);
