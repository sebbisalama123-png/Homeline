const FREE_DELIVERY_THRESHOLD_UGX = 1_500_000
const KAMPALA_DELIVERY_FEE_UGX = 50_000
const UPCOUNTRY_DELIVERY_FEE_UGX = 150_000

const KAMPALA_KEYWORDS = ['kampala', 'ntinda', 'nakawa', 'nansana', 'kira', 'wakiso', 'entebbe', 'mukono', 'kawempe', 'makindye', 'rubaga', 'kololo', 'bugolobi', 'muyenga', 'kisaasi', 'bukoto']

function isKampalaArea(location: string): boolean {
  const lower = location.toLowerCase()
  return KAMPALA_KEYWORDS.some((keyword) => lower.includes(keyword))
}

export function calculateDeliveryFee(
  location: string,
  subtotalUgx: number,
): number {
  if (isKampalaArea(location)) {
    return subtotalUgx >= FREE_DELIVERY_THRESHOLD_UGX
      ? 0
      : KAMPALA_DELIVERY_FEE_UGX
  }

  return UPCOUNTRY_DELIVERY_FEE_UGX
}
