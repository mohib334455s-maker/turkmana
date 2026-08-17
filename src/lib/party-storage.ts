import { calcSellable, type PartyStageMetrics } from '@/lib/stock-lots';
import type { StockLot } from '@/lib/stock-lots';

export type PartyRecordPatch = Record<string, unknown>;

function num(v: unknown) {
  return Number(v) || 0;
}

function stageFromRaw(raw: Record<string, unknown>, prefix: string, legacyKey?: string): PartyStageMetrics {
  return {
    wagons: num(raw[`${prefix}Wagons`]),
    count: num(raw[`${prefix}Count`] ?? raw[`${prefix}Wagons`]),
    qty: num(raw[`${prefix}Qty`] ?? (legacyKey ? raw[legacyKey] : 0)),
  };
}

function stageToRaw(prefix: string, m: PartyStageMetrics): PartyRecordPatch {
  return {
    [`${prefix}Wagons`]: m.wagons,
    [`${prefix}Count`]: m.count,
    [`${prefix}Qty`]: m.qty,
    [prefix]: m.qty,
  };
}

export function bumpStage(prev: PartyStageMetrics, delta: Partial<PartyStageMetrics>): PartyStageMetrics {
  return {
    wagons: prev.wagons + num(delta.wagons),
    count: prev.count + num(delta.count),
    qty: prev.qty + num(delta.qty),
  };
}

/** Apply unload qty + optional shortage/waste to party row fields. */
export function partyPatchAfterUnload(
  raw: Record<string, unknown>,
  input: {
    qty: number;
    wagons?: number;
    shortageQty?: number;
    wasteQty?: number;
  }
): PartyRecordPatch {
  const unloaded = bumpStage(stageFromRaw(raw, 'unloaded', 'unloaded'), {
    qty: input.qty,
    wagons: input.wagons,
    count: input.wagons ? 1 : 0,
  });
  const shortage = bumpStage(stageFromRaw(raw, 'shortage', 'shortage'), {
    qty: input.shortageQty,
  });
  const waste = bumpStage(stageFromRaw(raw, 'waste', 'waste'), {
    qty: input.wasteQty,
  });
  const sold = stageFromRaw(raw, 'sold', 'sold');
  const sellable = calcSellable({ unloaded, sold, shortage, waste });
  return {
    ...stageToRaw('unloaded', unloaded),
    ...stageToRaw('shortage', shortage),
    ...stageToRaw('waste', waste),
    ...stageToRaw('sellable', sellable),
    status: 'active',
  };
}

export function partyPatchAfterLoad(raw: Record<string, unknown>, qty: number): PartyRecordPatch {
  const unloaded = stageFromRaw(raw, 'unloaded', 'unloaded');
  const sold = bumpStage(stageFromRaw(raw, 'sold', 'sold'), { qty });
  const shortage = stageFromRaw(raw, 'shortage', 'shortage');
  const waste = stageFromRaw(raw, 'waste', 'waste');
  const sellable = calcSellable({ unloaded, sold, shortage, waste });
  return {
    ...stageToRaw('sold', sold),
    ...stageToRaw('sellable', sellable),
  };
}

export function partyHasOpenStock(partyId: number, lots: StockLot[]) {
  return lots.some(
    (l) => l.partyId === partyId && l.qty > 0 && (l.status || 'active') === 'active'
  );
}
