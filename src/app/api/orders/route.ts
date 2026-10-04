import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Extract the first row from a raw Drizzle SQL result. */
function firstRow<T = Record<string, unknown>>(result: unknown): T | undefined {
  const r = result as { rows?: T[] };
  return Array.isArray(r?.rows) ? r.rows[0] : undefined;
}

/**
 * POST /api/orders — Cash On Delivery order creation.
 *
 * SECURITY MODEL
 *  - The client sends ONLY: customer info + productId + quantity (+ optional
 *    offerId / couponCode). Prices and totals are NEVER trusted from the client.
 *  - The product price is read from the database inside the same transaction
 *    that validates & decrements stock (SELECT ... FOR UPDATE), so concurrent
 *    orders cannot oversell.
 *  - Totals are recalculated server-side: subtotal + shipping − discount.
 *  - Order items are stored as a jsonb snapshot on the order row, so
 *    historical orders never change when a product is edited later.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerName: string = String(body.customerName || "").trim();
    const customerPhone: string = String(body.customerPhone || "").trim();
    const shippingAddress: string = String(body.shippingAddress || "").trim();
    const city: string = String(body.city || "").trim();

    // ---------------------------------------------------------
    // 1) VALIDATION
    // ---------------------------------------------------------
    if (customerName.length < 2) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال الاسم الكامل" },
        { status: 400 }
      );
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(customerPhone)) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال رقم هاتف صحيح" },
        { status: 400 }
      );
    }
    if (shippingAddress.length < 5) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال العنوان الكامل" },
        { status: 400 }
      );
    }
    if (!city) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال المدينة" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 2) ITEMS — only productId + quantity are accepted.
    //    Prices come from the database.
    // ---------------------------------------------------------
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    const offerId: number | null = body.offerId != null ? Number(body.offerId) : null;
    const offerQty: number = body.offerQuantity ? Number(body.offerQuantity) : 1;

    interface ParsedItem {
      productId: number;
      quantity: number;
      size?: string;
      color?: string;
    }
    const items: ParsedItem[] = rawItems
      .map((raw) => {
        const r = raw as Record<string, unknown>;
        return {
          productId: Number(r.productId),
          quantity: Math.max(1, Number(r.quantity) || 1),
          size: r.size ? String(r.size) : undefined,
          color: r.color ? String(r.color) : undefined,
        };
      })
      .filter((i) => Number.isFinite(i.productId) && i.productId > 0);

    if (items.length === 0 && offerId == null) {
      return NextResponse.json(
        { success: false, error: "الطلب لا يحتوي على منتجات" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 3) TRANSACTION
    // ---------------------------------------------------------
    await db.execute(sql`BEGIN`);

    try {
      let subtotal = 0;
      const lineItems: {
        productId: number;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
      }[] = [];

      // ---- OFFER MODE --------------------------------------------
      if (offerId != null) {
        const offerResult = await db.execute(sql`
          SELECT po.id AS offer_id, po.price AS offer_price,
                 p.id AS product_id, p.name AS product_name,
                 p.stock AS stock_quantity
          FROM product_offers po
          JOIN products p ON p.id = po.product_id
          WHERE po.id = ${offerId} AND po.is_active = true AND p.is_active = true
          FOR UPDATE OF p
        `);
        const offerRow = firstRow(offerResult);

        if (!offerRow) {
          await db.execute(sql`ROLLBACK`);
          return NextResponse.json(
            { success: false, error: "العرض غير متوفر" },
            { status: 400 }
          );
        }

        const qty = Math.max(1, Number(offerQty) || 1);
        const stock = Number(offerRow.stock_quantity);
        if (stock < qty) {
          await db.execute(sql`ROLLBACK`);
          return NextResponse.json(
            { success: false, error: `الكمية المطلوبة غير متوفرة في المخزون (المتوفر: ${stock})` },
            { status: 400 }
          );
        }

        const price = Math.round(Number(offerRow.offer_price) * 100) / 100;
        const productName = String(offerRow.product_name);
        const productId = Number(offerRow.product_id);
        subtotal = Math.round(price * qty * 100) / 100;

        lineItems.push({ productId, name: productName, price, quantity: qty });

        await db.execute(sql`
          UPDATE products SET stock = stock - ${qty} WHERE id = ${productId}
        `);
      } else {
        // ---- NORMAL MODE ------------------------------------------
        for (const item of items) {
          const prodResult = await db.execute(sql`
            SELECT id, name, price, stock
            FROM products
            WHERE id = ${item.productId} AND is_active = true
            FOR UPDATE
          `);
          const productRow = firstRow(prodResult);

          if (!productRow) {
            await db.execute(sql`ROLLBACK`);
            return NextResponse.json(
              { success: false, error: "أحد المنتجات غير متوفر حالياً" },
              { status: 400 }
            );
          }

          const stock = Number(productRow.stock);
          if (stock < item.quantity) {
            await db.execute(sql`ROLLBACK`);
            return NextResponse.json(
              {
                success: false,
                error: `الكمية المطلوبة من "${String(productRow.name)}" غير متوفرة (المتوفر: ${stock})`,
              },
              { status: 400 }
            );
          }

          // Price ALWAYS from the database — never from the client
          const price = Math.round(Number(productRow.price) * 100) / 100;
          subtotal += Math.round(price * item.quantity * 100) / 100;

          lineItems.push({
            productId: item.productId,
            name: String(productRow.name),
            price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          });

          await db.execute(sql`
            UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}
          `);
        }
      }

      // ---- SHIPPING (from store_settings, server-side) --------
      const shipResult = await db.execute(sql`
        SELECT
          COALESCE((SELECT value FROM store_settings WHERE key = 'default_shipping_cost'), '0') AS base,
          COALESCE((SELECT value FROM store_settings WHERE key = 'free_shipping_threshold'), '0') AS threshold,
          COALESCE((SELECT value FROM store_settings WHERE key = 'free_shipping_enabled'), 'true') AS free_enabled
      `);
      const shipRow = firstRow(shipResult);
      const freeEnabled = String(shipRow?.free_enabled ?? "true") === "true";
      const threshold = Number(shipRow?.threshold ?? 0);
      const baseShipping = Number(shipRow?.base ?? 0);
      const shippingCost = !freeEnabled || subtotal < threshold ? baseShipping : 0;

      // ---- DISCOUNT / COUPON -------------------------------------
      let discount = 0;
      let couponCode: string | null = null;
      const rawCoupon = body.couponCode ? String(body.couponCode).trim() : "";
      if (rawCoupon) {
        const couponResult = await db.execute(sql`
          SELECT type, value
          FROM coupons
          WHERE UPPER(code) = ${rawCoupon.toUpperCase()}
            AND is_active = true
            AND (start_date IS NULL OR start_date <= now())
            AND (end_date IS NULL OR end_date >= now())
            AND (max_uses IS NULL OR used_count < max_uses)
            AND (min_order_amount IS NULL OR min_order_amount <= ${subtotal})
          FOR UPDATE
        `);
        const couponRow = firstRow(couponResult);
        if (couponRow) {
          if (String(couponRow.type) === "percentage") {
            discount = Math.round(subtotal * (Number(couponRow.value) / 100) * 100) / 100;
          } else {
            discount = Math.min(Number(couponRow.value), subtotal);
          }
          couponCode = rawCoupon.toUpperCase();
          await db.execute(sql`
            UPDATE coupons SET used_count = used_count + 1 WHERE code = ${couponCode}
          `);
        }
      }

      const total = Math.max(
        0,
        Math.round((subtotal + shippingCost - discount) * 100) / 100
      );

      // ---- FIND OR CREATE CUSTOMER ------------------------------
      const custResult = await db.execute(sql`
        SELECT id FROM customers WHERE phone = ${customerPhone} LIMIT 1
      `);
      const existing = firstRow(custResult);
      let customerId: number;

      if (existing) {
        customerId = Number(existing.id);
        await db.execute(sql`
          UPDATE customers
          SET total_orders = total_orders + 1,
              total_spent = total_spent + ${total},
              last_order_at = now(),
              name = ${customerName},
              address = ${shippingAddress},
              city = ${city}
          WHERE id = ${customerId}
        `);
      } else {
        const inserted = await db.execute(sql`
          INSERT INTO customers (name, phone, address, city, total_orders, total_spent, last_order_at)
          VALUES (${customerName}, ${customerPhone}, ${shippingAddress}, ${city}, 1, ${total}, now())
          RETURNING id
        `);
        customerId = Number(firstRow(inserted)?.id);
      }

      // ---- ORDER NUMBER ------------------------------------------
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      // ---- CREATE ORDER (items stored as jsonb snapshot) --------
      const itemsJson = JSON.stringify(lineItems);
      const orderResult = await db.execute(sql`
        INSERT INTO orders (
          order_number, customer_id, customer_name, customer_phone,
          shipping_address, city, status,
          total_amount, shipping_cost, discount, payment_method,
          items, notes
        ) VALUES (
          ${orderNumber}, ${customerId}, ${customerName}, ${customerPhone},
          ${shippingAddress}, ${city}, 'new',
          ${total}, ${shippingCost}, ${discount}, 'cod',
          ${itemsJson}::jsonb, ${body.notes || null}
        )
        RETURNING id
      `);
      const orderId = Number(firstRow(orderResult)?.id);

      await db.execute(sql`COMMIT`);

      // ---- Google Sheets sync (non-blocking, optional) ----------
      try {
        const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
        if (spreadsheetId && clientEmail && privateKey) {
          const { appendToSheet } = await import("@/lib/google-sheets");
          await appendToSheet(
            { spreadsheetId, clientEmail, privateKey },
            "Orders",
            [[
              orderNumber,
              new Date().toLocaleDateString("ar-MA"),
              customerName,
              customerPhone,
              city,
              shippingAddress,
              lineItems.map((l) => `${l.name} (${l.quantity}x)`).join(", "),
              String(subtotal),
              String(shippingCost),
              String(discount),
              String(total),
              "cod",
              "جديد",
              body.notes || "",
            ]]
          );
        }
      } catch (sheetsErr) {
        console.error("Google Sheets sync failed (order still saved):", sheetsErr);
      }

      // Return REAL order information for the success page
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNumber,
          customerName,
          customerPhone,
          city,
          shippingAddress,
          subtotal,
          shippingCost,
          discount,
          total,
          currency: "MAD",
          items: lineItems,
          notes: body.notes || "",
        },
      });
    } catch (innerErr) {
      await db.execute(sql`ROLLBACK`).catch(() => {});
      console.error("Order transaction failed:", innerErr);
      const msg = innerErr instanceof Error ? innerErr.message : "";
      const friendly = msg.includes("stock") || msg.includes("متوفر")
        ? "الكمية المطلوبة غير متوفرة في المخزون"
        : "تعذّر إنشاء الطلب. حاول مرة أخرى.";
      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}

/** GET /api/orders — recent orders (admin use) */
export async function GET() {
  try {
    const allOrders = await db.select().from(orders);
    return NextResponse.json({ orders: allOrders });
  } catch {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
