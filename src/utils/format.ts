export const formatAddress = (address?: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAmount = (amount: string, decimals: number = 18): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    return num.toFixed(4);
}; 