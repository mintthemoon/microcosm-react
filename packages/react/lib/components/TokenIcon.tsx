import { useChain } from "$lib/contexts"
import type { TokenIconProps } from "$types"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

export const TokenIcon = ({ symbol }: TokenIconProps) => {
  const { isReady, info } = useChain()
  const logoUrl = isReady ? info?.assets.get(symbol)?.logoUrl : undefined

  if (!logoUrl) {
    return (
      <figure className="mc-token-icon">
        <QuestionMarkCircleIcon />
      </figure>
    )
  }

  return (
    <figure className="mc-token-icon">
      <img src={logoUrl} alt={symbol} className="mc-token-icon" />
    </figure>
  )
}
