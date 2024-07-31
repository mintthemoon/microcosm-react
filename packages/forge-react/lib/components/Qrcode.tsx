import type { QrcodeProps } from "$types"
import { type DetailedHTMLProps, type HTMLAttributes, useEffect, useState } from "react"
import { encode, type QrCodeGenerateResult } from "uqr"

export const Qrcode = (
  { value, options, scale = 4, colors = ["white", "black"], ...props }:
    & QrcodeProps
    & DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
) => {
  const [res, setRes] = useState<QrCodeGenerateResult | undefined>()

  useEffect(() => {
    setRes(encode(value, options))
  }, [value, options])

  return res && (
    <figure
      className="vf-qrcode"
      {...props}
      style={{ margin: 0, marginTop: "2em", width: "100%", aspectRatio: "1 / 1" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${res.size * scale} ${res.size * scale}`}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <title>QR Code: {value}</title>
        <rect fill={colors[0]} width={res.size * scale} height={res.size * scale} />
        <path
          fill={colors[1]}
          d={res.data.reduce((a, row, r) => {
            return a
              + row.reduce(
                (b, col, c) => col ? `${b}M${c * scale},${r * scale}h${scale}v${scale}h-${scale}z` : b,
                "",
              )
          }, "")}
        />
      </svg>
    </figure>
  )
}
