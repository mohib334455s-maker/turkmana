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

export const emptyExpenses: ExpenseBreakdown = {
  transport: 0,
  bankCommission: 0,
  railway: 0,
  truckRent: 0,
  storage: 0,
  fine: 0,
  loading: 0,
  foreignCustoms: 0,
  otherForeign: 0,
  customs: 0,
  telex: 0,
  railwayLocal: 0,
  oilServices: 0,
  lab: 0,
  demurrage: 0,
  port: 0,
  transportLocal: 0,
  storageLocal: 0,
  literCommission: 0,
  weighing: 0,
  transfer: 0,
  government: 0,
  contractCost: 0,
  office: 0,
  otherLocal: 0,
};

/** Built from linked purchase → CMR → warehouse → sales flow. */
export const demoProfitLossRows: ProfitLossInput[] = [];
