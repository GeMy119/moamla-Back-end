export const generateUniqueSourceNumber = async (
    model = null,
    { length = 8, maxRetries = 10, fieldName = "source_number" } = {}
) => {
    const buildCandidate = () => {
        const prefix = Math.random() < 0.5 ? "01" : "80";
        return `${prefix}${generateRandomDigits(length - prefix.length)}`;
    };

    if (!model) {
        return buildCandidate();
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const candidate = buildCandidate();

        const exists = await model.exists({ [fieldName]: candidate });

        if (!exists) {
            return candidate;
        }
    }

    throw new Error("تعذر توليد رقم صادر فريد، حاول مرة أخرى");
};

const generateRandomDigits = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};