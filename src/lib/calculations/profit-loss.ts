export type ExpenseBreakdown = {
  transport: number;
  bankCommission: number;
  railway: number;
  truckRent: number;
  storage: number;
  fine: number;
  loading: number;
  foreignCustoms: number;
  otherForeign: number;
  customs: number;
  telex: number;
  railwayLocal: number;
  oilServices: number;
  lab: number;
  demurrage: number;
  port: number;
  transportLocal: number;
  storageLocal: number;
  literCommission: number;
  weighing: number;
  transfer: number;
  government: number;
  contractCost: number;
  office: number;
  otherLocal: number;
};

export type ProfitLossInput = {
  product: string;
  purchaseQty: number;
  purchaseAmount: number;
  wasteQty: number;
  soldQty: number;
  salesAmount: number;
  remainingQty: number;
  marketRate: number;
  expenses: ExpenseBreakdown;
};

export function sumForeignExpenses(e: ExpenseBreakdown) {
  return (
    e.transport +
    e.bankCommission +
    e.railway +
    e.truckRent +
    e.storage +
    e.fine +
    e.loading +
    e.foreignCustoms +
    e.otherForeign
  );
}

export function sumDomesticExpenses(e: ExpenseBreakdown) {
  return (
    e.customs +
    e.telex +
    e.railwayLocal +
    e.oilServices +
    e.lab +
    e.demurrage +
    e.port +
    e.transportLocal +
    e.storageLocal +
    e.literCommission +
    e.weighing +
    e.transfer +
    e.government +
    e.contractCost +
    e.office +
    e.otherLocal
  );
}

export function calculateProfitLoss(input: ProfitLossInput) {
  const foreign = sumForeignExpenses(input.expenses);
  const domestic = sumDomesticExpenses(input.expenses);
  const totalExpenses = foreign + domestic;
  const avgPurchaseRate =
    input.purchaseQty > 0 ? input.purchaseAmount / input.purchaseQty : 0;
  const landedCost = input.purchaseAmount + totalExpenses;
  const costPerTon =
    input.purchaseQty - input.wasteQty > 0
      ? landedCost / (input.purchaseQty - input.wasteQty)
      : 0;
  const cogs = costPerTon * input.soldQty;
  const avgSalesRate =
    input.soldQty > 0 ? input.salesAmount / input.soldQty : 0;
  const profitLoss = input.salesAmount - cogs;
  const profitPerTon = input.soldQty > 0 ? profitLoss / input.soldQty : 0;
  const remainingValueMarket = input.remainingQty * input.marketRate;
  const remainingValueCost = input.remainingQty * costPerTon;

  return {
    foreign,
    domestic,
    totalExpenses,
    avgPurchaseRate,
    landedCost,
    costPerTon,
    cogs,
    avgSalesRate,
    profitLoss,
    profitPerTon,
    remainingValueMarket,
    remainingValueCost,
  };
}

const gydroExpenses: ExpenseBreakdown = {
  transport: 2400,
  bankCommission: 180,
  railway: 620,
  truckRent: 900,
  storage: 120,
  fine: 0,
  loading: 210,
  foreignCustoms: 840,
  otherForeign: 80,
  customs: 8400,
  telex: 40,
  railwayLocal: 300,
  oilServices: 150,
  lab: 90,
  demurrage: 0,
  port: 0,
  transportLocal: 480,
  storageLocal: 60,
  literCommission: 0,
  weighing: 35,
  transfer: 1800,
  government: 200,
  contractCost: 0,
  office: 120,
  otherLocal: 50,
};

/** Built from linked purchase → CMR → warehouse → sales flow (demo). */
export const demoProfitLossRows: ProfitLossInput[] = [
  {
    product: 'دیزل گیدرو — CNT-1404-01',
    purchaseQty: 1200,
    purchaseAmount: 1536000,
    wasteQty: 12,
    soldQty: 420,
    salesAmount: 596400,
    remainingQty: 768,
    marketRate: 1420,
    expenses: gydroExpenses,
  },
  {
    product: 'پطرول ۹۲ — CNT-1404-02',
    purchaseQty: 800,
    purchaseAmount: 944000,
    wasteQty: 4,
    soldQty: 40,
    salesAmount: 52400,
    remainingQty: 756,
    marketRate: 1310,
    expenses: {
      ...gydroExpenses,
      customs: 5100,
      transport: 1800,
      railway: 420,
    },
  },
  {
    product: 'دیزل روسی — آقینه',
    purchaseQty: 400,
    purchaseAmount: 504000,
    wasteQty: 2,
    soldQty: 110,
    salesAmount: 159500,
    remainingQty: 288,
    marketRate: 1390,
    expenses: {
      ...gydroExpenses,
      transport: 9200,
      otherForeign: 2100,
      customs: 3200,
    },
  },
];
