import type { CompanyKey } from '@/lib/demo-data';

/** Inventory lot tied to a contract/party — source of truth for "which contract stock". */
export type StockLot = {
  id: number;
  warehouseId: number;
  warehouseName: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  qtyOriginal: number;
  unitPrice: number;
  reserved: number;
  contractId: number;
  contractNumber: string;
  partyId?: number;
  partyNumber?: string;
  supplierName: string;
  company: CompanyKey;
  receivedDate: string;
  status: 'active' | 'inactive' | 'depleted';
  notes: string;
};

export type WarehouseEntity = {
  id: number;
  name: string;
  location: string;
  /** Port / bandar for filtering (تورغندی، آقینه، …) */
  port?: string;
  type: string;
  company: CompanyKey;
  capacity: number;
  /** Capacity unit: تن، کارتن، خریطه، لیتر، … */
  capacityUnit?: string;
  notes: string;
};

export type PartyStageMetrics = {
  wagons: number;
  count: number;
  qty: number;
};

export type PartyEntity = {
  id: number;
  number: string;
  contractId: number;
  contractNumber: string;
  supplierName: string;
  product: string;
  productCode: string;
  unit: string;
  location: string;
  company: CompanyKey;
  plannedWagons: number;
  plannedQty: number;
  arrived: PartyStageMetrics;
  unloaded: PartyStageMetrics;
  sold: PartyStageMetrics;
  shortage: PartyStageMetrics;
  waste: PartyStageMetrics;
  sellable: PartyStageMetrics;
  transit: PartyStageMetrics;
  status: string;
  notes: string;
  warehouseId?: number;
};

export function emptyStage(): PartyStageMetrics {
  return { wagons: 0, count: 0, qty: 0 };
}

export function calcSellable(p: Pick<PartyEntity, 'unloaded' | 'sold' | 'shortage' | 'waste'>): PartyStageMetrics {
  return {
    wagons: Math.max(0, p.unloaded.wagons - p.sold.wagons - p.shortage.wagons - p.waste.wagons),
    count: Math.max(0, p.unloaded.count - p.sold.count - p.shortage.count - p.waste.count),
    qty: Math.max(0, p.unloaded.qty - p.sold.qty - p.shortage.qty - p.waste.qty),
  };
}

/** Legacy PartyRecord → PartyEntity bridge */
export function normalizeParty(raw: Record<string, unknown>): PartyEntity {
  const num = (v: unknown) => Number(v) || 0;
  const stage = (prefix: string, legacyQtyKey?: string): PartyStageMetrics => ({
    wagons: num(raw[`${prefix}Wagons`] ?? raw.wagons),
    count: num(raw[`${prefix}Count`] ?? raw[`${prefix}Wagons`] ?? raw.wagons),
    qty: num(raw[`${prefix}Qty`] ?? (legacyQtyKey ? raw[legacyQtyKey] : 0) ?? raw[prefix]),
  });

  const arrived = stage('arrived', 'arrived');
  const unloaded = stage('unloaded', 'unloaded');
  const sold = stage('sold', 'sold');
  const shortage = stage('shortage', 'shortage');
  const waste = stage('waste', 'waste');
  const transit = stage('transit', 'transit');
  const sellableRaw = stage('sellable', 'sellable');
  const sellable =
    sellableRaw.qty > 0 || sellableRaw.wagons > 0
      ? sellableRaw
      : calcSellable({ unloaded, sold, shortage, waste });

  return {
    id: num(raw.id),
    number: String(raw.number ?? ''),
    contractId: num(raw.contractId),
    contractNumber: String(raw.contractNumber ?? ''),
    supplierName: String(raw.supplierName ?? ''),
    product: String(raw.product ?? ''),
    productCode: String(raw.productCode ?? ''),
    unit: String(raw.unit ?? 'تن'),
    location: String(raw.location ?? ''),
    company: (raw.company as CompanyKey) || 'arya',
    plannedWagons: num(raw.plannedWagons ?? raw.wagons),
    plannedQty: num(raw.plannedQty ?? raw.qty),
    arrived,
    unloaded,
    sold,
    shortage,
    waste,
    sellable,
    transit,
    status: String(raw.status ?? 'active'),
    notes: String(raw.notes ?? ''),
    warehouseId: raw.warehouseId ? num(raw.warehouseId) : undefined,
  };
}
