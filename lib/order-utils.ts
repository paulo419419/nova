/**
 * Generate a short order number in format NOVA + sequential number
 * Example: NOVA1234, NOVA1235, etc
 */
export function generateShortOrderNumber(): string {
  // Get current timestamp and convert to a shorter number
  const now = Date.now()
  // Take last 4 digits of current timestamp and year
  const timestamp = now.toString().slice(-4)
  // Add a random digit for uniqueness
  const random = Math.floor(Math.random() * 10)
  return `NOVA${timestamp}${random}`
}

/**
 * Alternative: Generate order number with incremental counter
 * This would require fetching from database, but generateShortOrderNumber is faster
 */
export function generateOrderNumberFromId(orderId: string): string {
  // Take first 8 chars of UUID and append NOVA prefix
  return `NOVA${orderId.slice(0, 4).toUpperCase()}`
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderId: string): string {
  // If it's already in NOVA format, return as is
  if (orderId.startsWith('NOVA')) {
    return orderId
  }
  // Otherwise convert UUID to NOVA format
  return generateOrderNumberFromId(orderId)
}
