export type ownerData = {
  ownerName: string;
  ownerAddress: string;
};

export type safeData = {
  name: string;
  numberRequireApprove: number;
  owners: ownerData[];
};

// Default data

export const defaultOwnerData: ownerData = {
  ownerName: "",
  ownerAddress: "",
};

export const defaultSafeData = (publickey: string): safeData => {
  return {
    name: "",
    numberRequireApprove: 1,
    owners: [
      {
        ownerName: "Me",
        ownerAddress: publickey,
      },
    ],
  };
};
