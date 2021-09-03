import { createContainer } from "unstated-next";

import { useWithReward } from "./MiniFarms/useWithReward";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { useFetchFarms } from "./Farms/useFetchFarms";
import { useMaticJarApy } from "./MiniFarms/useMaticJarApy";

interface IFarmInfo {
  [key: string]: { tokenName: string; poolName: string };
}

export const FarmInfo: IFarmInfo = {
  "0x9eD7e3590F2fB9EEE382dfC55c71F9d3DF12556c": {
    tokenName: "pCLP USDC/WETH",
    poolName: "pCLP USDC/WETH",
  },
  "0x7512105DBb4C0E0432844070a45B7EA0D83a23fD": {
    tokenName: "pCLP PICKLE/MUST",
    poolName: "pCLP PICKLE/MUST",
  },
  "0x91bcc0BBC2ecA760e3b8A79903CbA53483A7012C": {
    tokenName: "pCLP MATIC/MUST",
    poolName: "pCLP MATIC/MUST",
  },
  "0x0519848e57Ba0469AA5275283ec0712c91e20D8E": {
    tokenName: "pAaveDAI",
    poolName: "pAaveDAI",
  },
  "0x261b5619d85B710f1c2570b65ee945975E2cC221": {
    tokenName: "am3CRV",
    poolName: "am3CRV",
  },
  "0x80aB65b1525816Ffe4222607EDa73F86D211AC95": {
    tokenName: "pSLP ETH/USDT",
    poolName: "pSLP ETH/USDT",
  },
  "0xd438Ba7217240a378238AcE3f44EFaaaF8aaC75A": {
    tokenName: "pSLP ETH/MATIC",
    poolName: "pSLP ETH/MATIC",
  },
  "0xf12BB9dcD40201b5A110e11E38DcddF4d11E6f83": {
    tokenName: "pQLP MAI (old)",
    poolName: "pQLP MAI (old)",
  },
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": {
    tokenName: "pQLP MAI",
    poolName: "pQLP MAI",
  },
  "0xd06a56c864C80e4cC76A2eF778183104BF0c848d": {
    tokenName: "pQLP QI",
    poolName: "pQLP QI",
  },
  "0xE484Ed97E19F6B649E78db0F37D173C392F7A1D9": {
    tokenName: "IS3USD",
    poolName: "IS3USD",
  },
  "0xC8450922d18793AD97C401D65BaE8A83aE5353a8": {
    tokenName: "pSLP DINO/USDC",
    poolName: "pSLP DINO/USDC",
  },
  "0x1cCDB8152Bb12aa34e5E7F6C9c7870cd6C45E37F": {
    tokenName: "pQLP DINO/WETH",
    poolName: "pQLP DINO/WETH",
  },
  "0xC3f393FB40F8Cc499C1fe7FA5781495dc6FAc9E9": {
    tokenName: "pCLP CHE/OKT",
    poolName: "pCLP CHE/OKT",
  },
  "0xe75c8805f9970c7547255059A22d14001d3D7b94": {
    tokenName: "pCLP CHE/USDT",
    poolName: "pCLP CHE/USDT",
  },
  "0x91bcc0BBC2ecA760e3b8A79903CbA53483A7012C": {
    tokenName: "pCLP BTCK/USDT",
    poolName: "pCLP BTCK/USDT",
  },
  "0x4a19C49Ee3233A2AE103487f3699D70573EC2371": {
    tokenName: "pCLP ETHK/USDT",
    poolName: "pCLP ETHK/USDT",
  },
  "0x7072B80D4E259F26b82C2C4e53cDBFB71450195e": {
    tokenName: "pCLP OKT/USDT",
    poolName: "pCLP OKT/USDT",
  },
  "0x80aB65b1525816Ffe4222607EDa73F86D211AC95": {
    tokenName: "pCLP USDT/USDC",
    poolName: "pCLP USDT/USDC",
  },
};

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward);
  const { jarFarmWithMaticApy } = useMaticJarApy(jarFarmWithApy);

  const jarFarms = jarFarmWithMaticApy
    ?.map((farm) => {
      if (!FarmInfo[farm.lpToken]) return null;
      const { tokenName, poolName } = FarmInfo[farm.lpToken];
      return {
        ...farm,
        tokenName,
        poolName,
      };
    })
    .filter((x) => x);

  return {
    farms: jarFarms,
  };
}

export const MiniFarms = createContainer(useFarms);
