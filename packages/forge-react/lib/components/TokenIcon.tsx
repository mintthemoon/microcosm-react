import { useChain } from "$lib/hooks"
import type { TokenIconProps } from "$types"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

export const TokenIcon = ({ symbol }: TokenIconProps) => {
  const { isReady, info } = useChain()
  const logoUrl = isReady ? info?.assets.get(symbol)?.logoUrl : undefined

  if (!logoUrl) {
    return (
      <figure className="vf-token-icon">
        <QuestionMarkCircleIcon />
      </figure>
    )
  }

  return (
    <figure className="vf-token-icon">
      <img src={logoUrl} alt={symbol} />
    </figure>
  )
}
