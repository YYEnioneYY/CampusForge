export type GetReferenceCountryPayload = {
  code: string;
};

export type GetReferenceCountryResponse = {
  country: {
    code2: string;
    code3: string;
    name: string;
  };
};