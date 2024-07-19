export const truncStr = (str: string | undefined, frontChars: number, backChars: number) => {
  if (!str) {
    return ""
  }
  if (str.length <= frontChars + backChars) {
    return str
  }
  return `${str.slice(0, frontChars)}...${str.slice(-backChars)}`
}

export const fmtAddrShort = (addr?: string) => {
  return truncStr(addr, 9, 6)
}

export const fmtAddrLong = (addr?: string) => {
  return truncStr(addr, 14, 10)
}

export const fmtDenom = (denom: string) => {
  if (denom.startsWith("factory/")) {
    const parts = denom.split("/")
    if (parts.length === 3 && parts[1] !== undefined && parts[2] !== undefined) {
      const contractAddress = truncStr(parts[1], 4, 3)
      const tokenName = truncStr(parts[2], 10, 5)
      return `${tokenName} (${contractAddress})`
    }
  }
  return denom
}

export const fmtAmount = (amount: bigint | number) => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })
}
