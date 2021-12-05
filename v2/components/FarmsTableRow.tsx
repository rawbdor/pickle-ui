import { FC, Fragment, HTMLAttributes } from "react";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";

import { classNames, formatDollars } from "../utils";
import FarmsBadge from "./FarmsBadge";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-black-light p-4 whitespace-nowrap text-sm text-white sm:p-6 group-hover:bg-black-lighter transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

interface Props {
  simple?: boolean;
  farm: {
    asset: string;
    iconSrc: string;
    earned: number;
    deposited: number;
    apy: string;
    liquidity: number;
  };
}

const FarmsTableRow: FC<Props> = ({ farm, simple }) => {
  return (
    <>
      <Disclosure as={Fragment}>
        {({ open }) => (
          <>
            <Disclosure.Button as="tr">
              <RowCell className="flex items-center rounded-l-xl">
                <div className="w-9 h-9 rounded-full border-3 border-gray-outline mr-3">
                  <Image
                    src={farm.iconSrc}
                    className="rounded-full"
                    width={200}
                    height={200}
                    layout="responsive"
                    alt="DAI-ETH"
                    title="DAI-ETH"
                  />
                </div>
                <div>
                  <p className="font-title font-medium text-base leading-5 group-hover:text-green-light transition duration-300 ease-in-out">
                    {farm.asset}
                  </p>
                  <p className="italic font-normal text-xs text-gray-light">
                    Uniswap
                  </p>
                </div>
              </RowCell>
              <RowCell>
                <p className="font-title font-medium text-base leading-5">
                  {formatDollars(farm.earned, 1)}
                </p>
                <p className="font-normal text-xs text-gray-light">
                  9.3 PICKLEs
                </p>
              </RowCell>
              <RowCell>
                <div className="flex items-center">
                  <FarmsBadge active />
                  <div className="ml-2">
                    <p className="font-title font-medium text-base leading-5">
                      {formatDollars(farm.deposited)}
                    </p>
                    <p className="font-normal text-xs text-gray-light">
                      10.33 LP
                    </p>
                  </div>
                </div>
              </RowCell>
              <RowCell>
                <p className="font-title font-medium text-base leading-5">
                  {farm.apy}
                </p>
              </RowCell>
              <RowCell className={classNames(simple && "rounded-r-xl")}>
                <p className="font-title font-medium text-base leading-5">
                  {formatDollars(farm.liquidity)}
                </p>
              </RowCell>
              {!simple && (
                <RowCell className="rounded-r-xl w-10">
                  <div className="flex justify-end pr-3">
                    <ChevronDownIcon
                      className={classNames(
                        open && "rotate-180",
                        "text-white ml-2 h-5 w-5 transform",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </RowCell>
              )}
            </Disclosure.Button>
            <Disclosure.Panel as="tr">
              <td colSpan={6} className="bg-black-light -mt-2">
                Disclosure panel body
              </td>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
};

export default FarmsTableRow;