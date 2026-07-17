import type { RunInput, RunResult } from "@aegntic/sdk"
import { nanoid } from "nanoid"
import type { ProviderAdapter } from "./index.js"

export class MockAdapter implements ProviderAdapter {
  name: string

  constructor(name: string) {
    this.name = name
  }

  async execute(endpoint: string, input: RunInput): Promise<RunResult> {
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const body = (input as any)?.body || {}
    const limit = body.maxItems || body.maxResults || body.limit || 5
    const resultsArray = []

    if (endpoint === "/apidojo/tweet-scraper") {
      const searchTerms = body.searchTerms || ["AI"]
      for (let i = 0; i < limit; i++) {
        resultsArray.push({
          id: `tweet_${nanoid(8)}`,
          text: `Interesting thoughts on ${searchTerms[i % searchTerms.length]} - tweet number ${i + 1}!`,
          author: `@user_${nanoid(4)}`,
          likes: Math.floor(Math.random() * 500),
          createdAt: new Date().toISOString(),
        })
      }
    } else {
      const keywords = body.keywords || "tech"
      for (let i = 0; i < limit; i++) {
        resultsArray.push({
          id: `linkedin_${nanoid(8)}`,
          postText: `Super excited to share our new thoughts about ${keywords}!`,
          postedBy: `Professional ${nanoid(4)}`,
          commentsCount: Math.floor(Math.random() * 20),
          createdAt: new Date().toISOString(),
        })
      }
    }

    return {
      data: resultsArray,
      items: resultsArray.length,
      cost: 0,
    }
  }

  async estimateCost(endpoint: string, input: RunInput): Promise<number> {
    return 100
  }
}
