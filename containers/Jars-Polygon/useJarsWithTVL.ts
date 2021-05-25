import { Contract, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

import { Contracts } from "../Contracts-Polygon";
import { Prices } from "../Prices";

import { STRATEGY_NAMES, DEPOSIT_TOKENS_JAR_NAMES, getPriceId } from "./jars";
import { JarWithAPY } from "./useJarsWithAPY";

import { Connection } from "../Connection";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const isCurvePool = (jarName: string): boolean => {
  return jarName === DEPOSIT_TOKENS_JAR_NAMES.AM3CRV;
};

// UniV2/SLP pools
const isUniPool = (jarName: string): boolean => {
  return jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_USDC_WETH;
};

export const useJarWithTVL = (jars: Input): Output => {
  const {
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { uniswapv2Pair } = Contracts.useContainer();

  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureCurveTVL = async (jar: JarWithAPY) => {
    let pool;
    let pricePerUnderlying;

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.AM3CRV) {
      pricePerUnderlying = prices?.dai;
    }

    if (!pool || !pricePerUnderlying || !multicallProvider) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const multicallJarContract = new Contract(
      jar.contract.address,
      jar.contract.interface.fragments,
      multicallProvider,
    );

    const multicallPoolContract = new Contract(
      pool.address,
      pool.interface.fragments,
      multicallProvider,
    );

    const [supply, balance, virtualPrice, ratio] = (
      await Promise.all([
        multicallJarContract.totalSupply(),
        multicallJarContract.balance(),
        chainName === "Ethereum"
          ? multicallPoolContract.get_virtual_price()
          : 0,
        multicallJarContract.getRatio(),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    const tvlUSD = balance * virtualPrice * pricePerUnderlying;

    const usdPerPToken = tvlUSD / supply;

    return { ...jar, tvlUSD, usdPerPToken, ratio };
  };

  const measureUniJarTVL = async (jar: JarWithAPY) => {
    if (!uniswapv2Pair || !prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const uniPair = uniswapv2Pair.attach(jar.depositToken.address);

    const [
      supply,
      balance,
      totalUNI,
      token0,
      token1,
      ratio,
    ] = await Promise.all([
      jar.contract.totalSupply(),
      jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
      uniPair.totalSupply(),
      uniPair.token0(),
      uniPair.token1(),
      jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
    ]);

    const Token0 = uniswapv2Pair.attach(token0);
    const Token1 = uniswapv2Pair.attach(token1);

    const [
      token0InPool,
      token1InPool,
      token0Decimal,
      token1Decimal,
    ] = await Promise.all([
      Token0.balanceOf(uniPair.address),
      Token1.balanceOf(uniPair.address),
      Token0.decimals(),
      Token1.decimals(),
    ]);

    const dec18 = parseEther("1");

    const token0PerUni = token0InPool.mul(dec18).div(totalUNI);
    const token1PerUni = token1InPool.mul(dec18).div(totalUNI);

    const token0Bal = parseFloat(
      ethers.utils.formatUnits(
        token0PerUni.mul(balance).div(dec18),
        token0Decimal,
      ),
    );
    const token1Bal = parseFloat(
      ethers.utils.formatUnits(
        token1PerUni.mul(balance).div(dec18),
        token1Decimal,
      ),
    );

    const token0PriceId = getPriceId(token0);
    const token1PriceId = getPriceId(token1);

    let tvlUSD;
    if (prices[token0PriceId]) {
      tvlUSD = 2 * token0Bal * prices[token0PriceId];
    } else {
      tvlUSD = 2 * token1Bal * prices[token1PriceId];
    }

    const usdPerPToken = tvlUSD / parseFloat(formatEther(supply));

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio: parseFloat(formatEther(ratio)),
    };
  };

  const measureCompoundTVL = async (jar: JarWithAPY) => {
    if (!prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const [supply, balance, ratio] = (
      await Promise.all([
        jar.contract.totalSupply(),
        jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
        jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    const priceId = getPriceId(jar.depositToken.address);

    const tvlUSD = prices[priceId] * balance;

    const usdPerPToken = tvlUSD / supply;

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio,
    };
  };

  const measureTVL = async () => {
    if (jars) {
      const promises: Array<Promise<JarWithTVL>> = jars.map(async (jar) => {
        if (isCurvePool(jar.jarName)) {
          return measureCurveTVL(jar);
        } else if (isUniPool(jar.jarName)) {
          return measureUniJarTVL(jar);
        }

        return {
          ...jar,
          tvlUSD: null,
          usdPerPToken: null,
          ratio: null,
        };
      });
      const jarsWithTVL = await Promise.all(promises);
      setJarsWithTVL(jarsWithTVL);
    }
  };

  useEffect(() => {
    measureTVL();
  }, [jars, prices]);

  return {
    jarsWithTVL,
  } as Output;
};