import watcher from "@parcel/watcher"
import { exec } from "node:child_process"
import path from "node:path"

process.on("SIGINT", async () => {
  console.log("\n\n======= Caught SIGINT, goodbye")
  if (!subscription) process.exit(0)
  try {
    await subscription.unsubscribe()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
  process.exit(0)
})

const build = (cb) => {
  const start = process.hrtime()
  exec("pnpm build", (err, _stdout, stderr) => {
    if (err) {
      console.error(`Exec error: ${err}`)
      return
    }
    if (stderr) {
      console.error(`Build error: ${stderr}`)
      return
    }
    const [s, ns] = process.hrtime(start)
    console.clear()
    console.log(`Built in ${s}.${ns.toString().padStart(9, "0").slice(0, 3)}s`)
    cb?.()
  })
}

console.clear()
console.log("======= Building...")
await new Promise((resolve) => {
  build(resolve)
})
console.log("======= Watching ./lib for changes")
let isRebuilding = false
const subscription = await watcher.subscribe(path.join(process.cwd(), "lib"), (err, _evs) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  if (isRebuilding) return
  isRebuilding = true
  console.log("Rebuilding...")
  build(() => {
    setTimeout(() => {
      isRebuilding = false
    }, s > 3 ? 0 : 3 - s + (ns / 1e6))
    console.log("======= Watching ./lib for changes")
  })
})
