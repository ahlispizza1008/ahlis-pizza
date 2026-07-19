export const getOrderDisplayId = (id: string, orderNumber?: number | null) => {
  if (orderNumber) {
    return `#AHLI-${orderNumber}`;
  }
  // For static demo/mock orders that don't have order_number, map them elegantly:
  if (id === 'o1') return '#AHLI-1021';
  if (id === 'o2') return '#AHLI-1022';
  if (id === 'o3') return '#AHLI-1023';
  if (id === 'o4') return '#AHLI-1024';
  if (id && id.startsWith('AP-')) return id; // guest random ID
  
  // Deterministic hash fallback from UUID
  let hash = 0;
  const str = id || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numericId = Math.abs(hash % 9000) + 1000;
  return `#AHLI-${numericId}`;
};
