import { useEffect, useState } from "react";

import {
  DEPOSIT_TOKENS_JAR_NAMES,
  getPriceId,
  JAR_DEPOSIT_TOKENS,
} from "./jars";
import { Prices } from "../Prices";
import { Contracts, COMETH_USDC_WETH_REWARDS } from "../Contracts-Polygon";
import { Jar } from "./useFetchJars";
import { useComethPairDayData } from "./useComethPairDayData";
import { formatEther } from "ethers/lib/utils";
import { ComethPairs } from "../ComethPairs";

import { Connection } from "../Connection";
import { Contract } from "@ethersproject/contracts";
import fetch from "node-fetch";
import AaveStrategyAbi from "../ABIs/aave-strategy.json";
import { ethers } from "ethers";
import { useCurveRawStats } from "./useCurveRawStats";
import { useCurveAm3MaticAPY } from "./useCurveAm3MaticAPY";
export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  apr: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useJarWithAPY = (jars: Input): Output => {
  const {
    multicallProvider,
  } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData: getComethPairData } = ComethPairs.useContainer();
  const { stakingRewards } = Contracts.useContainer();
  const { getComethPairDayAPY } = useComethPairDayData();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );
  const { rawStats } = useCurveRawStats();
  useCurveAm3MaticAPY();

  const calculateComethAPY = async (rewardsAddress: string) => {
    if (
      stakingRewards &&
      prices?.must &&
      getComethPairData &&
      multicallProvider
    ) {
      const multicallStakingRewards = new Contract(
        rewardsAddress,
        stakingRewards.interface.fragments,
        multicallProvider,
      );

      const [
        rewardsDurationBN,
        rewardsForDurationBN,
        stakingToken,
        totalSupplyBN,
      ] = await Promise.all([
        multicallStakingRewards.rewardsDuration(),
        multicallStakingRewards.getRewardForDuration(),
        multicallStakingRewards.stakingToken(),
        multicallStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsDuration = rewardsDurationBN.toNumber(); //epoch
      const rewardsForDuration = parseFloat(formatEther(rewardsForDurationBN));

      const { pricePerToken } = await getComethPairData(stakingToken);

      const rewardsPerYear =
        rewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.must * rewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const apy = valueRewardedPerYear / totalValueStaked;

      return [{ must: getCompoundingAPY(apy * 0.8), apr: apy * 0.8 * 100 }];
    }

    return [];
  };

  const calculateAaveAPY = async (
    assetAddress: string,
    strategyAddress: string,
  ) => {
    const pools = await fetch(
      "https://aave-api-v2.aave.com/data/liquidity/v2?poolId=0xd05e3E715d945B59290df0ae8eF85c1BdB684744",
    ).then((response) => response.json());
    const pool = pools?.find(
      (pool) =>
        pool.underlyingAsset.toUpperCase() === assetAddress?.toUpperCase(),
    );

    if (!pool || !prices?.matic || !multicallProvider) return [];

    const aaveStrategy = new Contract(
      strategyAddress,
      AaveStrategyAbi,
      multicallProvider,
    );
    const [supplied, borrowed, balance] = await Promise.all([
      aaveStrategy.getSuppliedView().then(ethers.utils.formatEther),
      aaveStrategy.getBorrowedView().then(ethers.utils.formatEther),
      aaveStrategy.balanceOfPool().then(ethers.utils.formatEther),
    ]);

    const rawSupplyAPY = +pool["avg1DaysLiquidityRate"];
    const rawBorrowAPY = +pool["avg1DaysVariableBorrowRate"];

    const supplyMaticAPR =
      (+pool.aEmissionPerSecond * 365 * 3600 * 24 * prices.matic) /
      +pool["totalLiquidity"] /
      +pool["referenceItem"]["priceInUsd"];
    const borrowMaticAPR =
      (+pool.vEmissionPerSecond * 365 * 3600 * 24 * prices.matic) /
      +pool["totalDebt"] /
      +pool["referenceItem"]["priceInUsd"];

    const maticAPR =
      (supplied * supplyMaticAPR + borrowed * borrowMaticAPR) / balance;

    const rawAPY =
      (rawSupplyAPY * supplied - rawBorrowAPY * borrowed) / balance;

    return [
      {
        [getPriceId(assetAddress)]: rawAPY * 100,
        matic: maticAPR * 0.8 * 100,
        apr: maticAPR * 0.8 * 100,
        rawAPY: rawAPY * 100,
      },
    ];
  };

  const calculateAPY = async () => {
    if (jars && controller && strategy) {
      const aaveDaiStrategy = jars.find(
        (jar) => jar.depositToken.address === JAR_DEPOSIT_TOKENS.DAI,
      )?.strategy;

      const [comethUsdcWethApy, aaveDaiAPY] = await Promise.all([
        calculateComethAPY(COMETH_USDC_WETH_REWARDS),
        calculateAaveAPY(
          JAR_DEPOSIT_TOKENS.DAI,
          aaveDaiStrategy?.address || "",
        ),
      ]);

      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_USDC_WETH) {
          APYs = [
            ...comethUsdcWethApy,
            ...getComethPairDayAPY(JAR_DEPOSIT_TOKENS.COMETH_USDC_WETH),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.AAVE_DAI) {
          APYs = [...aaveDaiAPY];
        }

        let apr = 0;
        APYs.map((x) => {
          if (x.apr) {
            apr += x.apr;
            delete x.apr;
          }
        });

        let lp = 0;
        APYs.map((x) => {
          if (x.lp) {
            lp += x.lp;
          }
        });

        // const totalAPY = APYs.map((x) => {
        //   return Object.values(x).reduce((acc, y) => acc + y, 0);
        // }).reduce((acc, x) => acc + x, 0);
        const totalAPY = getCompoundingAPY(apr / 100) + lp;

        return {
          ...jar,
          APYs,
          totalAPY,
          apr,
        };
      });

      const newJarsWithAPY = await Promise.all(promises);

      setJarsWithAPY(newJarsWithAPY);
    }
  };

  useEffect(() => {
    calculateAPY();
  }, [jars, prices]);

  return { jarsWithAPY };
};