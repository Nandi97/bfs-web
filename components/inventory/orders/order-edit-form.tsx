"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { saveOrderDetails } from "@/app/actions/purchase-order";

interface OrderItem {
  id:                 string;
  productId:          string;
  productCode:        string;
  productName:        string;
  vendorPartNumber:   string | null;
  retailRaised:       number;
  consumableRaised:   number;
  retailReceived:     number;
  consumableReceived: number;
  notes:              string | null;
}

interface OrderMeta {
  id:                string;
  locationId:        string;
  invoiceNumber:     string | null;
  isInvoicePaid:     boolean;
  dateOfShipment:    string | null;
  dateOfDelivery:    string | null;
  addressOfDelivery: string | null;
  notes:             string | null;
}

interface OrderEditFormProps {
  order:  OrderMeta;
  items:  OrderItem[];
  locked: boolean;
}

export function OrderEditForm({ order, items, locked }: OrderEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Line item received quantities (local state)
  const [received, setReceived] = useState<
    Record<string, { retailReceived: number; consumableReceived: number; notes: string }>
  >(
    Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          retailReceived:     item.retailReceived,
          consumableReceived: item.consumableReceived,
          notes:              item.notes ?? "",
        },
      ])
    )
  );

  // Additional details
  const [meta, setMeta] = useState({
    invoiceNumber:     order.invoiceNumber     ?? "",
    isInvoicePaid:     order.isInvoicePaid,
    dateOfShipment:    order.dateOfShipment    ?? "",
    dateOfDelivery:    order.dateOfDelivery    ?? "",
    addressOfDelivery: order.addressOfDelivery ?? "",
    notes:             order.notes             ?? "",
  });

  const totalQty = items.reduce(
    (s, i) => s + i.retailRaised + i.consumableRaised,
    0
  );

  function handleSave() {
    startTransition(async () => {
      await saveOrderDetails(order.id, order.locationId, {
        ...meta,
        items: Object.entries(received).map(([id, vals]) => ({
          id,
          ...vals,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  const inputClass = "h-8 text-sm";
  const disabledClass = locked ? "opacity-50 pointer-events-none" : "";

  return (
    <div className={`flex flex-col gap-6 ${disabledClass}`}>
      {/* ── Line items table ── */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Product code</th>
              <th className="px-4 py-2.5 font-medium">Vendor part #</th>
              <th className="px-4 py-2.5 font-medium">Product name</th>
              <th className="px-4 py-2.5 font-medium text-right">Retail raised</th>
              <th className="px-4 py-2.5 font-medium text-right">Consumable raised</th>
              <th className="px-4 py-2.5 font-medium text-right">Pending retail</th>
              <th className="px-4 py-2.5 font-medium text-right">Pending consumable</th>
              <th className="px-4 py-2.5 font-medium text-right">Retail received</th>
              <th className="px-4 py-2.5 font-medium text-right">Consumable received</th>
              <th className="px-4 py-2.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const r = received[item.id];
              const pendingRetail      = item.retailRaised      - r.retailReceived;
              const pendingConsumable  = item.consumableRaised  - r.consumableReceived;

              return (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{item.productCode}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {item.vendorPartNumber ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">{item.productName}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{item.retailRaised}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{item.consumableRaised}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {pendingRetail < 0 ? 0 : pendingRetail}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {pendingConsumable < 0 ? 0 : pendingConsumable}
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      min={0}
                      max={item.retailRaised}
                      className={`${inputClass} w-20 text-right`}
                      value={r.retailReceived}
                      disabled={locked}
                      onChange={(e) =>
                        setReceived((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            retailReceived: Math.max(0, Number(e.target.value)),
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      min={0}
                      max={item.consumableRaised}
                      className={`${inputClass} w-20 text-right`}
                      value={r.consumableReceived}
                      disabled={locked}
                      onChange={(e) =>
                        setReceived((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            consumableReceived: Math.max(0, Number(e.target.value)),
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      className={`${inputClass} w-32`}
                      value={r.notes}
                      placeholder="—"
                      disabled={locked}
                      onChange={(e) =>
                        setReceived((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], notes: e.target.value },
                        }))
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Additional details ── */}
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <p className="text-sm font-medium">Additional details</p>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
          {/* Total qty — read only */}
          <div className="flex items-center gap-4">
            <Label className="w-40 shrink-0 text-muted-foreground">Total qty</Label>
            <span className="font-mono tabular-nums">{totalQty}</span>
          </div>
          <div /> {/* spacer */}

          {/* Invoice # + paid checkbox */}
          <div className="flex items-center gap-4">
            <Label htmlFor="invoiceNumber" className="w-40 shrink-0 text-muted-foreground">
              Invoice #
            </Label>
            <Input
              id="invoiceNumber"
              className={inputClass}
              value={meta.invoiceNumber}
              disabled={locked}
              onChange={(e) => setMeta((m) => ({ ...m, invoiceNumber: e.target.value }))}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="isInvoicePaid"
                checked={meta.isInvoicePaid}
                disabled={locked}
                onCheckedChange={(v) => setMeta((m) => ({ ...m, isInvoicePaid: !!v }))}
              />
              <Label htmlFor="isInvoicePaid" className="cursor-pointer text-muted-foreground">
                Is invoice paid
              </Label>
            </div>
          </div>

          {/* Shipment date + Delivery date */}
          <div className="flex items-center gap-4">
            <Label htmlFor="dateOfShipment" className="w-40 shrink-0 text-muted-foreground">
              Date of shipment
            </Label>
            <Input
              id="dateOfShipment"
              type="date"
              className={inputClass}
              value={meta.dateOfShipment}
              disabled={locked}
              onChange={(e) => setMeta((m) => ({ ...m, dateOfShipment: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="dateOfDelivery" className="w-40 shrink-0 text-muted-foreground">
              Date of delivery
            </Label>
            <Input
              id="dateOfDelivery"
              type="date"
              className={inputClass}
              value={meta.dateOfDelivery}
              disabled={locked}
              onChange={(e) => setMeta((m) => ({ ...m, dateOfDelivery: e.target.value }))}
            />
          </div>

          {/* Address of delivery */}
          <div className="flex items-start gap-4">
            <Label htmlFor="addressOfDelivery" className="w-40 shrink-0 pt-1 text-muted-foreground">
              Address of delivery
            </Label>
            <textarea
              id="addressOfDelivery"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm disabled:opacity-50"
              value={meta.addressOfDelivery}
              disabled={locked}
              onChange={(e) => setMeta((m) => ({ ...m, addressOfDelivery: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="flex items-start gap-4">
            <Label htmlFor="orderNotes" className="w-40 shrink-0 pt-1 text-muted-foreground">
              Notes
            </Label>
            <textarea
              id="orderNotes"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm disabled:opacity-50"
              value={meta.notes}
              disabled={locked}
              onChange={(e) => setMeta((m) => ({ ...m, notes: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      {!locked && (
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span className="text-xs text-muted-foreground">Saved</span>
          )}
        </div>
      )}
    </div>
  );
}
