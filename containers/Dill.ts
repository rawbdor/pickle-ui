import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

import { Contracts, DILL } from "./Contracts";
import { Connection } from "./Connection";
import { ethers } from "ethers";

export interface UseDillOutput {
  lockedAmount?: ethers.BigNumber | null;
  lockEndDate?: ethers.BigNumber | null;
  balance?: ethers.BigNumber | null;
}

export function useDill(): UseDillOutput {
  const { blockNum, address } = Connection.useContainer();
  const { dill } = Contracts.useContainer();
  const [lockedAmount, setLockedAmount] = useState<ethers.BigNumber | null>();
  const [lockEndDate, setLockEndDate] = useState<ethers.BigNumber | null>();
  const [balance, setBalance] = useState<ethers.BigNumber | null>();

  useEffect(() => {
    if (dill && address) {
      const f = async () => {
        const dillContract = dill.attach(DILL);

        console.log(dillContract);

        const [lockStats, balance] = await Promise.all([
          dillContract.locked(address),
          dillContract["balanceOf(address)"](address),
        ]);

        setLockedAmount(lockStats?.amount);
        setLockEndDate(lockStats?.end);
        setBalance(balance);
      };

      f();
    }
  }, [blockNum, address]);

  return {
    lockedAmount,
    lockEndDate,
    balance,
  };
}

export const Dill = createContainer(useDill);