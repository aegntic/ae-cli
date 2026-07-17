import type { RunInput, RunResult } from "@aegntic/sdk"
import type { ProviderAdapter } from "./index.js"

export class ApifyAdapter implements ProviderAdapter {
  name = "apify"
  token: string

  constructor(token: string) {
    this.token = token
  }

  async execute(endpoint: string, input: RunInput): Promise<RunResult> {
    const actorId = endpoint.replace(/^\/+/, "").replace(/\//g, "~")
    const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${this.token}`

    const body = input.body || {}
    const runRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!runRes.ok) {
      const text = await runRes.text()
      throw new Error(`Failed to start Apify Actor ${actorId}: ${text}`)
    }

    const runJson = (await runRes.json()) as any
    const runId = runJson.data.id
    const datasetId = runJson.data.defaultDatasetId

    const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${this.token}`
    let attempts = 0
    const maxAttempts = 60
    let status = runJson.data.status

    while (status === "RUNNING" || status === "READY") {
      if (attempts >= maxAttempts) {
        throw new Error(`Timeout waiting for Apify Actor ${actorId} to complete`)
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const checkRes = await fetch(statusUrl)
      if (!checkRes.ok) {
        throw new Error(`Failed to check run status for ${runId}`)
      }
      const checkJson = (await checkRes.json()) as any
      status = checkJson.data.status
      attempts++
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify Actor run failed with status: ${status}`)
    }

    const itemsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=1&token=${this.token}`
    const itemsRes = await fetch(itemsUrl)
    if (!itemsRes.ok) {
      throw new Error(`Failed to fetch dataset items from dataset ${datasetId}`)
    }
    const data = (await itemsRes.json()) as any[]

    return {
      data,
      items: data.length,
      cost: 0,
    }
  }

  async estimateCost(endpoint: string, input: RunInput): Promise<number> {
    return 100
  }
}
