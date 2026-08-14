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

    if (left.length + right.length >= LINE_WIDTH) {
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
            LINE_WIDTH - left.length - right.length
        ) +
        right
    );
};

const formatDateTime = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return String(value);
    }

    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

const centre = (text) => {
    text = String(text ?? "");

    if (text.length >= LINE_WIDTH) {
        return text.slice(0, LINE_WIDTH);
    }

    const left = Math.floor(
        (LINE_WIDTH - text.length) / 2
    );

    return " ".repeat(left) + text;
};

export const buildThermalReceiptText = (receipt) => {

    const lines = [];

    // --------------------------------------------------------
    // Temple heading
    // --------------------------------------------------------

    lines.push(
        centre("Kannambalath Shree Bhadrakali")
    );

    lines.push(
        centre("Shankarammavan Kshethram")
    );

    lines.push(line());

    // --------------------------------------------------------
    // Receipt details
    // --------------------------------------------------------

    lines.push(
        `Receipt: ${receipt.receipt_no || ""}`
    );

    lines.push(
        `Date: ${receipt.receipt_date || ""}`
    );

    lines.push(
        `Devotee: ${receipt.devotee?.full_name || ""}`
    );

    if (receipt.devotee?.phone) {
        lines.push(
            `Phone: ${receipt.devotee.phone}`
        );
    }

    lines.push(line());

    // --------------------------------------------------------
    // Offerings
    // Separator is added BETWEEN offerings only
    // --------------------------------------------------------

    const items = receipt.items || [];

    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        lines.push(
            String(item.offering_name || "")
        );

        lines.push(
            twoColumn(
                `Qty ${item.qty || 1}`,
                `Rs. ${Number(
                    item.amount || 0
                ).toFixed(2)}`
            )
        );

        if (item.beneficiary_name) {
            lines.push(
                `For: ${item.beneficiary_name}`
            );
        }

        if (item.nakshathra_en) {
            lines.push(
                `Star: ${item.nakshathra_en}`
            );
        }

        // Separator only between offerings.
        // No extra separator after the last offering.
        if (i < items.length - 1) {
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
            `Rs. ${Number(
                receipt.total_amount || 0
            ).toFixed(2)}`
        )
    );

    if (receipt.payment_mode) {
        lines.push(
            `Payment: ${receipt.payment_mode}`
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
        `Created: ${formatDateTime(
            receipt.created_at
        )}`
    );

    lines.push(
        `Printed: ${formatDateTime(
            receipt.printed_at
        )}`
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
// Android RawBT printing
// ============================================================

export const printWithRawBT = (receipt) => {

    const text =
        buildThermalReceiptText(receipt);

    const utf8Bytes =
        new TextEncoder().encode(text);

    let binary = "";

    for (const byte of utf8Bytes) {
        binary += String.fromCharCode(byte);
    }

    const base64 = btoa(binary);

    const rawbtUrl =
        `rawbt:base64,${base64}`;

    const link =
        document.createElement("a");

    link.href = rawbtUrl;
    link.textContent = "Print Receipt";
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
};


// ============================================================
// Detect Android
// ============================================================

export const isAndroidDevice = () => {

    return /Android/i.test(
        navigator.userAgent
    );
};


// ============================================================
// Main print function
//
// Android -> RawBT
// Desktop -> Chrome print
// ============================================================

export const printThermalReceipt = (receipt) => {

    if (isAndroidDevice()) {

        printWithRawBT(receipt);

        return;
    }

    window.print();
};


// ============================================================
// DIRECT RAWBT PRINT TEST
// Sends ESC/POS-compatible text directly to RawBT
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

    // Convert UTF-8 text to Base64
    const utf8Bytes =
        new TextEncoder().encode(testText);

    let binary = "";

    for (const byte of utf8Bytes) {
        binary += String.fromCharCode(byte);
    }

    const base64 = btoa(binary);

    const rawbtUrl =
        `rawbt:base64,${base64}`;

    // Create a real hyperlink because RawBT expects
    // its special URL scheme to be launched from a link.
    const link =
        document.createElement("a");

    link.href = rawbtUrl;
    link.textContent = "Print Test";
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}