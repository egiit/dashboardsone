export const QueryWorkerDone = `SELECT b.BUYER_CODE, a.BARCODE_SERIAL, b.ORDER_NO, b.BUYER_PO, b.MO_NO,  DATE(a.CREATE_TIME) SCAN_DATE,  TIME(a.CREATE_TIME) SCAN_TIME,
b.ORDER_QTY , 1 STEP_ID, SUBSTRING(b.SITE_LINE, 5, 1) SITE, b.SITE_LINE LINE, b.ORDER_SIZE
FROM order_qr_generate a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
WHERE DATE(a.CREATE_TIME) BETWEEN :startDate AND :endDate
UNION ALL 
SELECT b.BUYER_CODE, a.BARCODE_SERIAL, b.ORDER_NO, b.BUYER_PO, b.MO_NO,  DATE(a.SEWING_SCAN_TIME) SCAN_DATE,  TIME(a.SEWING_SCAN_TIME) SCAN_TIME,
b.ORDER_QTY , 2 STEP_ID, SUBSTRING(b.SITE_LINE, 5, 1) SITE, b.SITE_LINE LINE, b.ORDER_SIZE
FROM scan_sewing_in a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
WHERE DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate
UNION ALL 
SELECT DISTINCT b.BUYER_CODE, a.BARCODE_MAIN BARCODE_SERIAL, b.ORDER_NO, b.BUYER_PO, b.MO_NO,  DATE(a.SEWING_SCAN_TIME) SCAN_DATE,  TIME(a.SEWING_SCAN_TIME) SCAN_TIME,
b.ORDER_QTY , 3 STEP_ID, SUBSTRING(b.SITE_LINE, 5, 1) SITE, b.SITE_LINE LINE, b.ORDER_SIZE
FROM scan_sewing_out a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
WHERE DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate
GROUP BY a.BARCODE_MAIN
UNION ALL
SELECT b.BUYER_CODE, a.BARCODE_MAIN BARCODE_SERIAL, b.ORDER_NO, b.BUYER_PO, b.MO_NO,  DATE(a.PACKING_SCAN_TIME) SCAN_DATE,  TIME(a.PACKING_SCAN_TIME) SCAN_TIME,
b.ORDER_QTY , 4 STEP_ID, SUBSTRING(b.SITE_LINE, 5, 1) SITE, b.SITE_LINE LINE, b.ORDER_SIZE
FROM scan_packing_in a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate
GROUP BY a.BARCODE_MAIN`;

export const QryBundleTrack = `SELECT  m.BUYER_CODE, f.BARCODE_SERIAL, o.BUNDLE_SEQUENCE SEQUENCE, u.ORDER_REFERENCE_PO_NO, m.ORDER_NO, SUBSTRING_INDEX(m.BUYER_PO,',',-1) BUYER_PO, SUBSTRING_INDEX(m.MO_NO,',',-1) MO_NO, 
m.ORDER_STYLE, m.ORDER_COLOR, m.ORDER_SIZE, m.ORDER_QTY, m.SITE_LINE FX_SITE, t.SITE_NAME, t.LINE_NAME, s.SCHD_PROD_DATE,
CASE WHEN o.BARCODE_SERIAL IS NOT NULL  THEN 1  END  AS GENERATE, 
CASE WHEN p.BARCODE_SERIAL IS NOT NULL THEN 2  END  AS SEWING_IN, 
CASE WHEN q.BARCODE_SERIAL IS NOT NULL THEN 3  END  AS SEWING_OUT,
CASE WHEN r.BARCODE_SERIAL IS NOT NULL THEN 4  END  AS PACKING_IN, 
v.COUNT_SPLIT,
o.CREATE_TIME GENERATE_TIME,
p.SEWING_SCAN_TIME SEWING_IN_TIME, 
q.SEWING_SCAN_TIME SEWING_OUT_TIME,
r.PACKING_SCAN_TIME PACKING_IN_TIME
FROM (
SELECT DISTINCT  n.BARCODE_SERIAL
FROM (
  SELECT a.BARCODE_SERIAL
  FROM order_qr_generate a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
  WHERE DATE(a.CREATE_TIME) BETWEEN :startDate AND :endDate
  UNION ALL 
  SELECT a.BARCODE_SERIAL
  FROM scan_sewing_in a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
  WHERE DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate
  UNION ALL 
  SELECT a.BARCODE_MAIN AS BARCODE_SERIAL
  FROM scan_sewing_out a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
  WHERE DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate 
  GROUP BY a.BARCODE_MAIN
  UNION ALL
  SELECT a.BARCODE_MAIN AS BARCODE_SERIAL
  FROM scan_packing_in a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
  WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate 
  GROUP BY a.BARCODE_MAIN
) n 
GROUP BY n.BARCODE_SERIAL
) f LEFT JOIN view_order_detail m ON f.BARCODE_SERIAL = m.BARCODE_SERIAL
LEFT JOIN order_qr_generate o ON f.BARCODE_SERIAL = o.BARCODE_SERIAL
LEFT JOIN scan_sewing_in p ON f.BARCODE_SERIAL = p.BARCODE_SERIAL
LEFT JOIN (
	SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL, a.SEWING_SCAN_TIME
	FROM scan_sewing_out a 
	GROUP BY a.BARCODE_MAIN
) q ON  f.BARCODE_SERIAL = q.BARCODE_SERIAL
LEFT JOIN (
  SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL,  a.PACKING_SCAN_TIME
  FROM scan_packing_in a 
  GROUP BY a.BARCODE_MAIN
) r ON f.BARCODE_SERIAL = r.BARCODE_SERIAL
LEFT JOIN (
	SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL, COUNT(a.BARCODE_MAIN) COUNT_SPLIT, a.NEW_QTY, a.SEWING_SCAN_TIME
	FROM scan_sewing_qr_split a 
	GROUP BY a.BARCODE_MAIN
) v ON  f.BARCODE_SERIAL =  v.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail s ON s.SCHD_ID = p.SCHD_ID
LEFT JOIN item_siteline t ON s.SCHD_ID_SITELINE = t.ID_SITELINE
LEFT JOIN order_po_listing u ON u.ORDER_PO_ID = m.BUYER_PO 
WHERE f.BARCODE_SERIAL IS NOT NULL 
GROUP BY f.BARCODE_SERIAL`;

export const queryTrackSplit = `SELECT a.BARCODE_SERIAL BARCODE_SPLIT, a.BARCODE_MAIN AS BARCODE_SERIAL, a.NEW_QTY,
CASE WHEN b.BARCODE_SERIAL IS NOT NULL THEN 3  END  AS SEWING_OUT,
CASE WHEN c.BARCODE_SERIAL IS NOT NULL THEN 4  END  AS PACKING_IN, 
 a.SEWING_SCAN_TIME,
 b.SEWING_SCAN_TIME SEWING_OUT_TIME,
 c.PACKING_SCAN_TIME PACKING_IN_TIME
FROM scan_sewing_qr_split a
LEFT JOIN scan_sewing_out b ON b.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN scan_packing_in c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE a.BARCODE_MAIN = :barcodeserial`;
