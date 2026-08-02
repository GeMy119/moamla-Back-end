export const generateUniqueSourceNumber = async (
    model = null,
    { length = 10, prefix = "", maxRetries = 10, fieldName = "source_number" } = {}
) => {
    const digitsNeeded = length - prefix.length;

    if (digitsNeeded <= 0) {
        throw new Error("طول الرقم المطلوب أقل من أو يساوي طول البادئة");
    }

    if (!model) {
        const randomDigits = generateRandomDigits(digitsNeeded);
        return `${prefix}${randomDigits}`;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const randomDigits = generateRandomDigits(digitsNeeded);
        const candidate = `${prefix}${randomDigits}`;

        // Dynamic Field Query
        const exists = await model.exists({ [fieldName]: candidate });

        if (!exists) {
            return candidate;
        }
    }

    throw new Error("تعذر توليد رقم صادر فريد، حاول مرة أخرى");
};

/**
 * يولّد سلسلة أرقام عشوائية بطول معين (أول رقم لا يكون صفر)
 */
const generateRandomDigits = (length) => {
    let result = String(Math.floor(Math.random() * 9) + 1); // أول رقم من 1-9
    for (let i = 1; i < length; i++) {
        result += Math.floor(Math.random() * 10); // باقي الأرقام من 0-9
    }
    return result;
};