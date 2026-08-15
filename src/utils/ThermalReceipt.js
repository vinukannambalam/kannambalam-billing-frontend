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
// PUSHPANJALI IMAGE + ESC/POS RASTER HELPERS
//
// IMPORTANT:
// The normal receipt remains native ESC/POS text.
// ONLY the Malayalam Pushpanjali section is rasterized.
//
// This avoids converting the whole receipt to a PNG, which was
// causing the complete receipt text to print smaller/softer.
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
// WAIT FOR MALAYALAM FONT
// ============================================================

const waitForMalayalamFont = async () => {

    try {

        if (
            document.fonts &&
            document.fonts.load
        ) {

            await document.fonts.load(
                "28px 'Noto Sans Malayalam'"
            );

        }

    }
    catch {

        // Browser fallback font will be used.
    }

};


// ============================================================
// BUILD ONLY THE PUSHPANJALI IMAGE
//
// The final image is exactly printer width (384 pixels).
// The rest of the receipt is NOT rasterized.
// ============================================================

const buildPushpanjaliCanvas = (
    pushpanjaliItems
) => {

    const width = 384;

    const left = 8;

    const right =
        width - 8;

    const contentWidth =
        right - left;

    const measureCanvas =
        document.createElement(
            "canvas"
        );

    const measureCtx =
        measureCanvas.getContext(
            "2d"
        );

    if (!measureCtx) {

        return null;

    }

    measureCtx.font =
        "28px 'Noto Sans Malayalam', sans-serif";

    let height = 24;

    // Heading
    height += 42;

    // Separator
    height += 34;

    // Names
    pushpanjaliItems.forEach(
        (item) => {

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
                star
                    ? `${name} - ${star}`
                    : name;

            const lines =
                wrapCanvasText(
                    measureCtx,
                    text,
                    contentWidth - 8
                );

            height +=
                Math.max(
                    1,
                    lines.length
                ) * 40;

            // Small gap between persons
            height += 6;

        }
    );

    // Bottom separator + feed
    height += 34;

    height += 60;

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = width;

    canvas.height =
        Math.ceil(height);

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {

        return null;

    }

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle =
        "#000000";

    ctx.textBaseline =
        "top";

    let y = 12;

    // --------------------------------------------------------
    // Pushpanjali heading
    // --------------------------------------------------------

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 30px 'Noto Sans Malayalam', sans-serif";

    ctx.fillText(
        "പുഷ്പാഞ്ജലി",
        width / 2,
        y
    );

    y += 42;

    // --------------------------------------------------------
    // Separator
    // --------------------------------------------------------

    ctx.textAlign =
        "left";

    ctx.font =
        "19px monospace";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 34;

    // --------------------------------------------------------
    // Beneficiary names
    // --------------------------------------------------------

    ctx.font =
        "28px 'Noto Sans Malayalam', sans-serif";

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
                star
                    ? `${index + 1}. ${name} - ${star}`
                    : `${index + 1}. ${name}`;

            const lines =
                wrapCanvasText(
                    ctx,
                    text,
                    contentWidth - 8
                );

            lines.forEach(
                (wrappedLine) => {

                    ctx.fillText(
                        wrappedLine,
                        left,
                        y
                    );

                    y += 40;

                }
            );

            y += 6;

        }
    );

    // --------------------------------------------------------
    // Bottom separator
    // --------------------------------------------------------

    ctx.font =
        "19px monospace";

    ctx.fillText(
        "--------------------------------",
        left,
        y
    );

    y += 60;

    return canvas;

};

// ============================================================
// CONVERT CANVAS TO ESC/POS RASTER BYTES
//
// GS v 0 is the standard ESC/POS raster-image command.
// The printer receives the Pushpanjali bitmap only.
// ============================================================

const canvasToRasterBytes = (
    canvas
) => {

    const width =
        canvas.width;

    const height =
        canvas.height;

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {

        return null;

    }

    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );

    const widthBytes =
        Math.ceil(
            width / 8
        );

    const header =
        new Uint8Array([
            0x1D,
            0x76,
            0x30,
            0x00,
            widthBytes & 0xFF,
            (widthBytes >> 8) & 0xFF,
            height & 0xFF,
            (height >> 8) & 0xFF
        ]);

    const bitmap =
        new Uint8Array(
            widthBytes * height
        );

    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const pixelIndex =
                (
                    y * width +
                    x
                ) * 4;

            const r =
                imageData.data[
                    pixelIndex
                ];

            const g =
                imageData.data[
                    pixelIndex + 1
                ];

            const b =
                imageData.data[
                    pixelIndex + 2
                ];

            const alpha =
                imageData.data[
                    pixelIndex + 3
                ];

            // Treat transparent pixels as white.
            const gray =
                alpha === 0
                    ? 255
                    : (
                        0.299 * r +
                        0.587 * g +
                        0.114 * b
                    );

            // Threshold rather than dithering.
            // This keeps Malayalam strokes clean on a 203dpi
            // thermal printer.
            if (
                gray < 190
            ) {

                const byteIndex =
                    y * widthBytes +
                    Math.floor(
                        x / 8
                    );

                bitmap[
                    byteIndex
                ] |=
                    0x80 >>
                    (x % 8);

            }

        }

    }

    const result =
        new Uint8Array(
            header.length +
            bitmap.length
        );

    result.set(
        header,
        0
    );

    result.set(
        bitmap,
        header.length
    );

    return result;

};


// ============================================================
// RAWBT BYTE LAUNCHER
// ============================================================

const printRawBTBytes = (
    bytes
) => {

    if (!bytes) {

        return;

    }

    let binary = "";

    const chunkSize = 0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            );

        binary +=
            String.fromCharCode(
                ...chunk
            );

    }

    const base64 =
        btoa(binary);

    const rawbtUrl =
        `rawbt:base64,${base64}`;

    const link =
        document.createElement(
            "a"
        );

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
// PRINT RECEIPT + PUSHPANJALI
//
// OPTION B:
//
//   Receipt text       -> native ESC/POS text
//   Pushpanjali        -> ESC/POS raster image
//
// This preserves the sharp native receipt text while still
// allowing Malayalam Pushpanjali names to print correctly.
// ============================================================

export const printReceiptWithPushpanjali = async (
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
    // Preserve the existing native text printing exactly.
    // --------------------------------------------------------

    if (
        pushpanjaliItems.length === 0
    ) {

        printWithRawBT(
            receipt
        );

        return;

    }

    try {

        // Ensure Malayalam font is available before rendering.
        await waitForMalayalamFont();

        // ----------------------------------------------------
        // 1. Native receipt text
        // ----------------------------------------------------

        const receiptText =
            buildThermalReceiptText(
                receipt
            );

        const textBytes =
            new TextEncoder().encode(
                receiptText
            );

        // ----------------------------------------------------
        // 2. Pushpanjali image only
        // ----------------------------------------------------

        const pushpanjaliCanvas =
            buildPushpanjaliCanvas(
                pushpanjaliItems
            );

        if (!pushpanjaliCanvas) {

            printWithRawBT(
                receipt
            );

            return;

        }

        const imageBytes =
            canvasToRasterBytes(
                pushpanjaliCanvas
            );

        if (!imageBytes) {

            printWithRawBT(
                receipt
            );

            return;

        }

        // ----------------------------------------------------
        // 3. Combine native text + raster image
        // ----------------------------------------------------

        const combined =
            new Uint8Array(
                textBytes.length +
                imageBytes.length
            );

        combined.set(
            textBytes,
            0
        );

        combined.set(
            imageBytes,
            textBytes.length
        );

        // ----------------------------------------------------
        // 4. Send ONE ESC/POS job to RawBT
        // ----------------------------------------------------

        printRawBTBytes(
            combined
        );

    }
    catch (error) {

        console.error(
            "Pushpanjali thermal print failed:",
            error
        );

        // Safe fallback:
        // print the normal receipt rather than failing silently.
        printWithRawBT(
            receipt
        );

    }

};

