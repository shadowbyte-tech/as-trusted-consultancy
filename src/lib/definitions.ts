
export type Plot = {
  id: string;
  plotNumber: string;
  villageName: string;
  areaName: string;
  plotSize: string;
  plotFacing: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  imageUrl: string;
  imageHint: string;
  description?: string;
};

export type PlotFacing = Plot['plotFacing'];

export type User = {
    id: string;
    email: string;
    role: 'Owner' | 'User';
};

export type Inquiry = {
  id: string;
  plotNumber: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string; // ISO date string
};

export type Contact = {
    id: string;
    name: string;
    phone: string;
    email: string;
    type: 'Seller' | 'Buyer';
    notes?: string;
}

export type Registration = {
  id:string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string; // ISO date string
  isNew?: boolean;
};


export type State = {
  errors?: {
    plotNumber?: string[];
    villageName?: string[];
    areaName?: string[];
    plotSize?: string[];
    plotFacing?: string[];
    imageUrl?: string[];
    email?: string[];
    password?: string[];
    name?: string[];
    phone?: string[];
    type?: string[];
    notes?: string[];
    message?: string[];
    description?: string[];
  };
  message?: string | null;
  success?: boolean;
  plotId?: string | null;
  registration?: Registration | null;
};
