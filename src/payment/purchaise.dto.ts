export interface PurchaseRequestDto {
  client: {
    email: string;
  };
  payment: {
    amount: number;
    currency: string;
    description: string;
  };
  purchase: {
    products: {
      name: string;
      price: number;
    }[];
  };
  brand_id: string;
  success_redirect: string;
  failure_redirect: string;
}

export interface CreatePurchaseResponse {
  id: string;
  direct_post_url: string;
  checkout_url: string;
  status: string;
}

export interface ProcessPurchaseResponse {
  status: string;
  Method?: string;
  URL?: string
  PaReq?: string;
  MD?: string;
  callback_url?: string
}

export interface Data3Ds {
  PaReq: string;
  MD: string;
  TermUrl: string;
  method: string;
  url: string
}