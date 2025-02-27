import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { AssetWithData, CoreSelectors } from "v2/store/core";
import type { JarChartData } from "v2/types";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";
import { ChainSelectData } from "./ChainSelect";
import { JarSelectData } from "./JarSelect";

const JarStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  chain: ChainSelectData;
  jar: JarSelectData;
}> = ({ core, chain, jar }) => {
  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));

  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);

  let asset: AssetWithData | undefined = {} as AssetWithData;
  if (jar && jar.value)
    asset = assets.find((a) => a.details.apiKey.toLowerCase() === jar.value.toLowerCase());

  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (jar) getJarData(jar.value).then((data) => setJarData(data));
    };
    getData();
  }, [jar]);

  if (chain && Object.keys(chain).length > 0 && jar && Object.keys(jar).length > 0)
    return (
      <>
        <div className="mb-3">
          {asset && asset.depositTokensInJar && (
            <FarmsTable singleAsset={asset} hideDescription={true} />
          )}
        </div>
        <ChartContainer jarData={jarData} />
        {jarData && jarData.documentation && <DocContainer docs={jarData.documentation} />}
        {jarData &&
          jarData.revenueExpenses &&
          jarData.revenueExpenses.recentHarvests.length > 0 && (
            <RevTableContainer
              revs={jarData.revenueExpenses}
              pfCore={core ? core : ({} as PickleModelJson.PickleModelJson)}
            />
          )}
      </>
    );
  return null;
};

const getJarData = async (jarKey: string): Promise<JarChartData> => {
  if (jarKey === "") return {} as JarChartData;
  const url = `${process.env.apiJar}/${jarKey}/en`;
  const data: JarChartData = await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
  return data;
};

export default JarStats;
