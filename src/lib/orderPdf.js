const sender = {
  name: "Royo Essentials LLP",
  brand: "ARAINA",
  phone: "+91 8006345123",
  email: "care@arainas.com",
  address: "Bramhavrunda Colony, Pimple Nilakh, Pune - 411027",
};

function clean(value) {
  return String(value ?? "").trim();
}

function wrap(doc, value, width, size, bold = false) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  return doc.splitTextToSize(value, width);
}

export async function createOrderPdf(order) {
  const { jsPDF } = await import("jspdf");
  const width = 101.6;
  const height = 152.4;
  const margin = 7;
  const contentWidth = width - margin * 2;
  const pink = [220, 83, 112];
  const ink = [38, 35, 42];
  const muted = [105, 99, 108];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [width, height], compress: false });

  function drawText(value, x, y, size, { bold = false, color = ink, align = "left" } = {}) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(value), x, y, { align });
  }

  function drawWrapped(value, x, y, maxWidth, size, { bold = false, color = ink, lineGap = 1.25 } = {}) {
    const lines = wrap(doc, value, maxWidth, size, bold);
    lines.forEach((line, index) => drawText(line, x, y + index * size * 0.3528 * lineGap, size, { bold, color }));
    return lines.length * size * 0.3528 * lineGap;
  }

  const label = (value, y) => drawText(value.toUpperCase(), margin, y, 6.5, { bold: true, color: pink });

  doc.setFillColor(...pink);
  doc.rect(0, 0, width, 2.2, "F");

  drawText(sender.brand, margin, 12, 19, { bold: true, color: pink });
  drawText("EMPOWERING TO RISE", width - margin, 11.5, 6.2, { bold: true, color: muted, align: "right" });
  drawText("PARCEL ORDER SUMMARY", margin, 20, 7.2, { bold: true });
  drawText(`ORDER  ${clean(order.orderNumber) || "—"}`, width - margin, 20, 7, { bold: true, align: "right" });

  doc.setDrawColor(...pink);
  doc.setLineWidth(0.5);
  doc.line(margin, 24, width - margin, 24);

  label("From / Sender", 30);
  drawText(sender.name, margin, 35, 9, { bold: true });
  drawWrapped(sender.address, margin, 40, contentWidth, 7.5, { color: muted });
  drawWrapped(`${sender.phone}  |  ${sender.email}`, margin, 45, contentWidth, 7.5, { color: muted });

  const sectionTop = 53;
  label("Ship to / Recipient", sectionTop);
  const boxTop = 57;
  const boxBottom = height - 7;
  const boxHeight = boxBottom - boxTop;
  doc.setFillColor(255, 248, 250);
  doc.setDrawColor(230, 164, 178);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, boxTop, contentWidth, boxHeight, 1.5, 1.5, "FD");
  doc.setFillColor(...pink);
  doc.rect(margin, boxTop, 1.5, boxHeight, "F");

  const innerX = margin + 5;
  const innerWidth = contentWidth - 10;
  let y = boxTop + 8;
  const recipient = clean(order.deliveryRecipientName) || "Recipient name not recorded";
  let nameSize = 14;
  let nameLines = wrap(doc, recipient, innerWidth, nameSize, true);
  while (nameLines.length > 2 && nameSize > 10) {
    nameSize -= 0.5;
    nameLines = wrap(doc, recipient, innerWidth, nameSize, true);
  }
  nameLines.forEach((line, index) => drawText(line, innerX, y + index * 5.6, nameSize, { bold: true }));
  y += Math.max(7, nameLines.length * 5.6) + 3;

  const phone = clean(order.deliveryAddress?.recipientMobile || order.orderedByMobile);
  if (phone) {
    drawText(phone, innerX, y, 11, { bold: true });
    y += 6;
  }
  const alternatePhone = clean(order.deliveryAddress?.recipientAlternateMobile);
  if (alternatePhone) {
    drawText(`Alternate: ${alternatePhone}`, innerX, y, 8, { color: muted });
    y += 5;
  }

  y += 2;
  doc.setDrawColor(231, 210, 216);
  doc.setLineWidth(0.25);
  doc.line(innerX, y, innerX + innerWidth, y);
  y += 6;
  drawText("DELIVERY ADDRESS", innerX, y, 6.3, { bold: true, color: pink });
  y += 5;

  const address = order.deliveryAddress || {};
  const addressRows = [
    [address.houseNumber, address.building, address.street],
    [address.area, address.landmark, address.village],
    [address.city, address.district].filter(Boolean).join(", "),
    [address.state, address.pinCode].filter(Boolean).join(" - "),
    address.country,
  ].map((parts) => Array.isArray(parts) ? parts.filter(Boolean).join(", ") : parts).filter((line) => clean(line));
  if (!addressRows.length) addressRows.push("Delivery address not recorded");

  const addressStart = y;
  const addressBottom = boxBottom - 5;
  let addressSize = 9;
  let addressLines = addressRows.flatMap((row) => wrap(doc, row, innerWidth, addressSize, true));
  while (addressStart + addressLines.length * addressSize * 0.42 > addressBottom && addressSize > 6.5) {
    addressSize -= 0.5;
    addressLines = addressRows.flatMap((row) => wrap(doc, row, innerWidth, addressSize, true));
  }
  addressRows.forEach((row) => {
    const lines = wrap(doc, row, innerWidth, addressSize, true);
    lines.forEach((line) => {
      if (y <= addressBottom) drawText(line, innerX, y, addressSize, { bold: true });
      y += addressSize * 0.42;
    });
    y += 1.5;
  });

  doc.setProperties({
    title: `ARAINA parcel label ${clean(order.orderNumber)}`,
    subject: "4 x 6 inch parcel label",
    author: sender.name,
  });
  return doc.output("blob");
}
