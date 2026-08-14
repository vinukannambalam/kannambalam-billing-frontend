// ============================================================
// Kannambalam Thermal Receipt - Android RawBT printing
// 32 character / 58mm receipt
// ============================================================

const LINE_WIDTH = 32;

const line = (char = "-") =>
    char.repeat(LINE_WIDTH);

const padRight = (text, width) =>
    String(text ?? "").padEnd(width, " ");

const padLeft = (text, width) =>
    String(text ?? "").padStart(width, " ");

const twoColumn = (left, right) => {

    left = String(left ?? "");
    right = String(right ?? "");

    if (
        left.length + right.length >=
        LINE_WIDTH
    ) {
        return (
            left.slice(
                0,
                LINE_WIDTH - right.length - 1
            ) +
            " " +
            right
        );
    }

    return (
        left +
        " ".repeat(
            LINE_WIDTH -
            left.length -
            right.length
        ) +
        right
    );
};


// ============================================================
// DATE / TIME
// ============================================================

const formatDateTime = (value) => {

    if (!value) {
        return "-";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return String(value);
    }

    return d.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
};


// ============================================================
// CENTRE TEXT
// ============================================================

const centre = (text) => {

    text = String(text ?? "");

    if (text.length >= LINE_WIDTH) {
        return text.slice(
            0,
            LINE_WIDTH
        );
    }

    const left = Math.floor(
        (
            LINE_WIDTH -
            text.length
        ) / 2
    );

    return (
        " ".repeat(left) +
        text
    );
};


// ============================================================
// NORMAL THERMAL RECEIPT TEXT
// ============================================================

export const buildThermalReceiptText = (
    receipt
) => {

    const lines = [];

    // --------------------------------------------------------
    // Temple heading
    // --------------------------------------------------------

    lines.push(
        centre(
            "Kannambalath Shree Bhadrakali"
        )
    );

    lines.push(
        centre(
            "Shankarammavan Kshethram"
        )
    );

    lines.push(line());

    // --------------------------------------------------------
    // Receipt details
    // --------------------------------------------------------

    lines.push(
        `Receipt: ${
            receipt.receipt_no || ""
        }`
    );

    lines.push(
        `Date: ${
            receipt.receipt_date || ""
        }`
    );

    lines.push(
        `Devotee: ${
            receipt.devotee?.full_name || ""
        }`
    );

    if (receipt.devotee?.phone) {

        lines.push(
            `Phone: ${
                receipt.devotee.phone
            }`
        );

    }

    lines.push(line());

    // --------------------------------------------------------
    // Offerings
    // Separator BETWEEN offerings only
    // --------------------------------------------------------

    const items =
        receipt.items || [];

    for (
        let i = 0;
        i < items.length;
        i++
    ) {

        const item =
            items[i];

        lines.push(
            String(
                item.offering_name || ""
            )
        );

        lines.push(
            twoColumn(
                `Qty ${
                    item.qty || 1
                }`,
                `Rs. ${
                    Number(
                        item.amount || 0
                    ).toFixed(2)
                }`
            )
        );

        if (
            item.beneficiary_name
        ) {

            lines.push(
                `For: ${
                    item.beneficiary_name
                }`
            );

        }

        if (
            item.nakshathra_en
        ) {

            lines.push(
                `Star: ${
                    item.nakshathra_en
                }`
            );

        }

        // Separator only
        // between offerings
        if (
            i <
            items.length - 1
        ) {

            lines.push(line());

        }

    }

    // --------------------------------------------------------
    // Total
    // --------------------------------------------------------

    lines.push(line());

    lines.push(
        twoColumn(
            "TOTAL",
            `Rs. ${
                Number(
                    receipt.total_amount || 0
                ).toFixed(2)
            }`
        )
    );

    if (
        receipt.payment_mode
    ) {

        lines.push(
            `Payment: ${
                receipt.payment_mode
            }`
        );

    }

    lines.push(line());

    // --------------------------------------------------------
    // User / time information
    // --------------------------------------------------------

    lines.push(
        `Created By: ${
            receipt.created_by_name || "-"
        }`
    );

    lines.push(
        `Created: ${
            formatDateTime(
                receipt.created_at
            )
        }`
    );

    lines.push(
        `Printed: ${
            formatDateTime(
                receipt.printed_at
            )
        }`
    );

    lines.push(line());

    lines.push(
        centre("Thank You")
    );

    // Extra paper feed
    lines.push("");
    lines.push("");
    lines.push("");

    return lines.join("\n");
};


// ============================================================
// RAWBT TEXT PRINTING
// Used for normal receipt printing
// ============================================================

export const printWithRawBT = (
    receipt
) => {

    const text =
        buildThermalReceiptText(
            receipt
        );

    const utf8Bytes =
        new TextEncoder().encode(
            text
        );

    let binary = "";

    for (
        const byte of utf8Bytes
    ) {

        binary +=
            String.fromCharCode(
                byte
            );

    }

    const base64 =
        btoa(binary);

    const rawbtUrl =
        `rawbt:base64,${base64}`;

    const link =
        document.createElement("a");

    link.href =
        rawbtUrl;

    link.textContent =
        "Print Receipt";

    link.style.display =
        "none";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );
};


// ============================================================
// ANDROID DETECTION
// ============================================================

export const isAndroidDevice = () => {

    return /Android/i.test(
        navigator.userAgent
    );

};


// ============================================================
// MAIN PRINT FUNCTION
// ============================================================

export const printThermalReceipt = (
    receipt
) => {

    if (
        isAndroidDevice()
    ) {

        printWithRawBT(
            receipt
        );

        return;
    }

    window.print();
};


// ============================================================
// DIRECT RAWBT PRINT TEST
// ============================================================

export function printRawBTTest() {

    const testText =
        "Kannambalath Shree Bhadrakali\n" +
        "Shankarammavan Kshethram\n" +
        "--------------------------------\n" +
        "RAWBT TEST PRINT\n" +
        "Printer: Everycom ECS88\n" +
        "Width: 58mm / 32 columns\n" +
        "--------------------------------\n" +
        "If you can read this,\n" +
        "direct RawBT printing works.\n" +
        "--------------------------------\n" +
        "Thank You\n\n\n";

    const utf8Bytes =
        new TextEncoder().encode(
            testText
        );

    let binary = "";

    for (
        const byte of utf8Bytes
    ) {

        binary +=
            String.fromCharCode(
                byte
            );

    }

    const base64 =
        btoa(binary);

    const rawbtUrl =
        `rawbt:base64,${base64}`;

    const link =
        document.createElement("a");

    link.href =
        rawbtUrl;

    link.textContent =
        "Print Test";

    link.style.display =
        "none";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );
}


// ============================================================
// CANVAS HELPERS FOR MALAYALAM PRINTING
// ============================================================

const wrapCanvasText = (
    ctx,
    text,
    maxWidth
) => {

    const words =
        String(text ?? "")
            .split(" ");

    const result = [];

    let current = "";

    for (
        const word of words
    ) {

        const test =
            current
                ? `${current} ${word}`
                : word;

        const width =
            ctx.measureText(
                test
            ).width;

        if (
            width <= maxWidth
        ) {

            current = test;

        }
        else {

            if (current) {
                result.push(
                    current
                );
            }

            current = word;
        }
    }

    if (current) {
        result.push(
            current
        );
    }

    return result;
};


// ============================================================
// CREATE COMBINED RECEIPT + PUSHPANJALI IMAGE
//
// The entire print is converted into an image.
// This allows Malayalam text to print correctly through RawBT.
// ============================================================

const buildReceiptAndPushpanjaliImage = (
    receipt,
    pushpanjaliItems
) => {

    const width = 384;

    const left =
        8;

    const right =
        width - 8;

    const contentWidth =
        right - left;

    // --------------------------------------------------------
    // First calculate required height
    // --------------------------------------------------------

    let height = 20;

    const normalLines =
        buildThermalReceiptText(
            receipt
        ).split("\n");

    // Approximate normal receipt height
    height +=
        normalLines.length *
        29;

    // Pushpanjali section
    //
    // Keep the height calculation in sync with the actual
    // drawing below. This is important because the Pushpanjali
    // slip now has a 4-line gap before it and 3-line feed
    // after the bottom separator.
    height +=
        (4 * 36) +     // blank gap before Pushpanjali
        42 +            // heading
        36;             // separator line + spacing

    // Use the same font as the final Pushpanjali text when
    // measuring wrapped Malayalam lines.
    pushpanjaliMeasureContext.font =
        "25px 'Noto Sans Malayalam', 'Noto Sans', sans-serif";

    pushpanjaliItems.forEach(
        (item, index) => {

            const name =
                String(
                    item.beneficiary_name_ml ||
                    item.malayalam_name ||
                    item.beneficiary_name ||
                    ""
                ).trim();

            const star =
                String(
                    item.nakshathra_ml ||
                    item.nakshathra_en ||
                    ""
                ).trim();

            const text =
                `${index + 1}. ${name} - ${star}`;

            const measuredLines =
                wrapCanvasText(
                    pushpanjaliMeasureContext,
                    text,
                    contentWidth
                );

            height +=
                Math.max(
                    1,
                    measuredLines.length
                ) * 36;
        }
    );

    height +=
        (3 * 36) +     // blank feed after separator
        20;             // bottom safety margin

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        width;

    // Use a large temporary canvas while drawing.
    // The final canvas is cropped to the exact rendered height
    // after ALL receipt and Pushpanjali content has been drawn.
    // This prevents any Pushpanjali entries from being cut off,
    // regardless of how many persons are in the receipt.
    canvas.height =
        20000;

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {
        return null;
    }

    // --------------------------------------------------------
    // White paper
    // --------------------------------------------------------

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle =
        "#000000";

    ctx.textBaseline =
        "top";

    let y = 15;

    // --------------------------------------------------------
    // Temple heading
    // --------------------------------------------------------

    ctx.font =
        "bold 21px monospace";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Kannambalath Shree Bhadrakali",
        width / 2,
        y
    );

    y += 27;

    ctx.fillText(
        "Shankarammavan Kshethram",
        width / 2,
        y
    );

    y += 36;

    // --------------------------------------------------------
    // Separator
    // --------------------------------------------------------

    ctx.font =
        "19px monospace";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 32;

    // --------------------------------------------------------
    // Receipt details
    // --------------------------------------------------------

    ctx.font =
        "20px monospace";

    const receiptDetails = [

        `Receipt: ${
            receipt.receipt_no || ""
        }`,

        `Date: ${
            receipt.receipt_date || ""
        }`,

        `Devotee: ${
            receipt.devotee?.full_name || ""
        }`

    ];

    if (
        receipt.devotee?.phone
    ) {

        receiptDetails.push(
            `Phone: ${
                receipt.devotee.phone
            }`
        );

    }

    for (
        const detail of receiptDetails
    ) {

        const wrapped =
            wrapCanvasText(
                ctx,
                detail,
                contentWidth
            );

        for (
            const wrappedLine of wrapped
        ) {

            ctx.fillText(
                wrappedLine,
                left,
                y
            );

            y += 27;
        }

    }

    // --------------------------------------------------------
    // Separator
    // --------------------------------------------------------

    ctx.font =
        "19px monospace";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 32;

    // --------------------------------------------------------
    // Offerings
    // --------------------------------------------------------

    const items =
        receipt.items || [];

    ctx.font =
        "20px monospace";

    for (
        let i = 0;
        i < items.length;
        i++
    ) {

        const item =
            items[i];

        const offeringName =
            String(
                item.offering_name || ""
            );

        const offeringLines =
            wrapCanvasText(
                ctx,
                offeringName,
                contentWidth
            );

        for (
            const offeringLine of offeringLines
        ) {

            ctx.fillText(
                offeringLine,
                left,
                y
            );

            y += 27;
        }

        const qtyAmount =
            twoColumn(
                `Qty ${
                    item.qty || 1
                }`,
                `Rs. ${
                    Number(
                        item.amount || 0
                    ).toFixed(2)
                }`
            );

        ctx.fillText(
            qtyAmount,
            left,
            y
        );

        y += 27;

        if (
            item.beneficiary_name
        ) {

            const forLines =
                wrapCanvasText(
                    ctx,
                    `For: ${
                        item.beneficiary_name
                    }`,
                    contentWidth
                );

            for (
                const forLine of forLines
            ) {

                ctx.fillText(
                    forLine,
                    left,
                    y
                );

                y += 27;
            }

        }

        if (
            item.nakshathra_en
        ) {

            const starLines =
                wrapCanvasText(
                    ctx,
                    `Star: ${
                        item.nakshathra_en
                    }`,
                    contentWidth
                );

            for (
                const starLine of starLines
            ) {

                ctx.fillText(
                    starLine,
                    left,
                    y
                );

                y += 27;
            }

        }

        // Separator only
        // between offerings
        if (
            i <
            items.length - 1
        ) {

            ctx.fillText(
                "--------------------------------",
                left,
                y
            );

            y += 32;
        }
    }

    // --------------------------------------------------------
    // Total separator
    // --------------------------------------------------------

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 32;

    // --------------------------------------------------------
    // Total
    // --------------------------------------------------------

    ctx.font =
        "bold 20px monospace";

    ctx.fillText(
        twoColumn(
            "TOTAL",
            `Rs. ${
                Number(
                    receipt.total_amount || 0
                ).toFixed(2)
            }`
        ),
        left,
        y
    );

    y += 29;

    ctx.font =
        "20px monospace";

    if (
        receipt.payment_mode
    ) {

        ctx.fillText(
            `Payment: ${
                receipt.payment_mode
            }`,
            left,
            y
        );

        y += 29;
    }

    // --------------------------------------------------------
    // Created information
    // --------------------------------------------------------

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 32;

    const createdLines = [

        `Created By: ${
            receipt.created_by_name || "-"
        }`,

        `Created: ${
            formatDateTime(
                receipt.created_at
            )
        }`,

        `Printed: ${
            formatDateTime(
                receipt.printed_at
            )
        }`

    ];

    for (
        const detail of createdLines
    ) {

        const wrapped =
            wrapCanvasText(
                ctx,
                detail,
                contentWidth
            );

        for (
            const wrappedLine of wrapped
        ) {

            ctx.fillText(
                wrappedLine,
                left,
                y
            );

            y += 27;
        }
    }

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 36;

    // --------------------------------------------------------
    // Thank You
    // --------------------------------------------------------

    ctx.font =
        "bold 20px monospace";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Thank You",
        width / 2,
        y
    );

    y += 46;

    // --------------------------------------------------------
    // PUSHPANJALI SECTION
    //
    // Leave a clear blank gap before the Pushpanjali slip
    // so it can be detached and handed to the priest.
    // --------------------------------------------------------

    y += 36 * 4;

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 30px 'Noto Sans Malayalam', 'Noto Sans', sans-serif";

    ctx.fillText(
        "പുഷ്പാഞ്ജലി",
        width / 2,
        y
    );

    y += 42;

    ctx.font =
        "19px monospace";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 36;

    // --------------------------------------------------------
    // Pushpanjali names
    // --------------------------------------------------------

    ctx.font =
        "25px 'Noto Sans Malayalam', 'Noto Sans', sans-serif";

    pushpanjaliItems.forEach(
        (item, index) => {

            const name =
                String(
                    item.beneficiary_name_ml ||
                    item.malayalam_name ||
                    item.beneficiary_name ||
                    ""
                ).trim();

            const star =
                String(
                    item.nakshathra_ml ||
                    item.nakshathra_en ||
                    ""
                ).trim();

            const text =
                `${index + 1}. ${name} - ${star}`;

            const wrapped =
                wrapCanvasText(
                    ctx,
                    text,
                    contentWidth
                );

            for (
                const wrappedLine of wrapped
            ) {

                ctx.fillText(
                    wrappedLine,
                    left,
                    y
                );

                y += 36;
            }
        }
    );

    // --------------------------------------------------------
    // Pushpanjali bottom separator
    // --------------------------------------------------------

    ctx.font =
        "19px monospace";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    // Leave 2-3 blank lines after the separator
    // so the Pushpanjali slip can be detached cleanly.
    y += 36 * 3;

    // --------------------------------------------------------
    // Crop the temporary canvas to the EXACT content height.
    //
    // This is the important part: the final image height is
    // based on the actual y position after every Pushpanjali
    // person has been drawn. Therefore 1, 4, 10 or more persons
    // are all included in the final PNG.
    // --------------------------------------------------------

    const finalHeight =
        Math.ceil(y + 10);

    const finalCanvas =
        document.createElement(
            "canvas"
        );

    finalCanvas.width =
        width;

    finalCanvas.height =
        finalHeight;

    const finalCtx =
        finalCanvas.getContext(
            "2d"
        );

    if (!finalCtx) {
        return canvas;
    }

    finalCtx.fillStyle =
        "#ffffff";

    finalCtx.fillRect(
        0,
        0,
        width,
        finalHeight
    );

    finalCtx.drawImage(
        canvas,
        0,
        0
    );

    return finalCanvas;
};


// ============================================================
// Temporary canvas context used only for measuring Malayalam
// text before the final canvas is created.
// ============================================================

const pushpanjaliMeasureCanvas =
    document.createElement(
        "canvas"
    );

const pushpanjaliMeasureContext =
    pushpanjaliMeasureCanvas.getContext(
        "2d"
    );


// ============================================================
// PRINT RECEIPT + PUSHPANJALI
//
// NewReceipt.jsx already calls this function.
// No additional print call is required.
//
// Entire combined receipt is converted to PNG.
// Therefore Malayalam is rendered by the browser first,
// instead of being sent as raw Malayalam text to RawBT.
// ============================================================

export const printReceiptWithPushpanjali = (
    receipt
) => {

    const pushpanjaliItems =
        (receipt.items || []).filter(
            item =>
                Number(
                    item.offering_id
                ) === 2 &&
                (
                    item.beneficiary_name_ml ||
                    item.malayalam_name ||
                    item.beneficiary_name
                )
        );

    // --------------------------------------------------------
    // No Pushpanjali
    //
    // Preserve the existing normal receipt printing behaviour.
    // --------------------------------------------------------

    if (
        pushpanjaliItems.length === 0
    ) {

        printWithRawBT(
            receipt
        );

        return;
    }

    // --------------------------------------------------------
    // Build image
    // --------------------------------------------------------

    const canvas =
        buildReceiptAndPushpanjaliImage(
            receipt,
            pushpanjaliItems
        );

    if (!canvas) {

        // Safety fallback
        printWithRawBT(
            receipt
        );

        return;
    }

    // --------------------------------------------------------
    // Convert complete receipt to PNG
    // --------------------------------------------------------

    const dataUrl =
        canvas.toDataURL(
            "image/png"
        );

    const base64 =
        dataUrl.split(",")[1];

    // --------------------------------------------------------
    // ONE RawBT launch
    // --------------------------------------------------------

    const rawbtUrl =
        `rawbt:data:image/png;base64,${base64}`;

    const link =
        document.createElement("a");

    link.href =
        rawbtUrl;

    link.textContent =
        "Print Receipt and Pushpanjali";

    link.style.display =
        "none";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );
};