import type { ProviderAdapter, Endpoint, RunInput, RunResult } from "@aegntic/sdk"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const APIFY_ACTORS = {
  "twitter/posts": "apidojo/tweet-scraper",
  "linkedin/posts": "harvestapi/linkedin-post-search",
  "reddit/posts": "apidojo/reddit-scraper",
  "google/search": "apidojo/google-search-scraper",
  "amazon/products": "apidojo/amazon-product-scraper",
  "instagram/posts": "apidojo/instagram-scraper",
} as const

const endpoints: Endpoint[] = [
  {
    provider: "apify",
    path: "twitter/posts",
    description: "Scrape Twitter/X posts by search terms, hashtags, or user handles using Apify's Tweet Scraper actor",
    inputSchema: {
      body: {
        searchTerms: { type: "array", description: "Search terms, hashtags, or @handles to query", required: true },
        maxItems: { type: "number", description: "Maximum number of tweets to return", required: false, default: 10 },
        proxyConfig: { type: "object", description: "Apify proxy configuration (e.g. { useApifyProxy: true })" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.005, currency: "USD" },
    verified: true,
  },
  {
    provider: "apify",
    path: "linkedin/posts",
    description: "Search LinkedIn posts by keywords using Apify's LinkedIn Post Search actor",
    inputSchema: {
      body: {
        keywords: { type: "string", description: "Search keywords for LinkedIn posts", required: true },
        maxResults: { type: "number", description: "Maximum number of posts to return", required: false, default: 10 },
        proxyConfig: { type: "object", description: "Apify proxy configuration" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.01, currency: "USD" },
    verified: true,
  },
  {
    provider: "apify",
    path: "reddit/posts",
    description: "Scrape Reddit posts and threads by keyword or subreddit using Apify's Reddit Scraper actor",
    inputSchema: {
      body: {
        searchTerms: { type: "array", description: "Search terms or subreddit names", required: true },
        maxItems: { type: "number", description: "Maximum number of posts to return", required: false, default: 10 },
        sort: { type: "string", description: "Sort order: relevance, new, top, hot" },
        proxyConfig: { type: "object", description: "Apify proxy configuration" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.003, currency: "USD" },
    verified: true,
  },
  {
    provider: "apify",
    path: "google/search",
    description: "Perform Google web search using Apify's Google Search Scraper actor",
    inputSchema: {
      body: {
        searchTerms: { type: "array", description: "Search queries to execute", required: true },
        maxItems: { type: "number", description: "Maximum results per query", required: false, default: 10 },
        languageCode: { type: "string", description: "Language code (e.g. en)", required: false, default: "en" },
        countryCode: { type: "string", description: "Country code (e.g. us)", required: false, default: "us" },
        proxyConfig: { type: "object", description: "Apify proxy configuration" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.002, currency: "USD" },
    verified: true,
  },
  {
    provider: "apify",
    path: "amazon/products",
    description: "Scrape Amazon product listings by keyword using Apify's Amazon Product Scraper actor",
    inputSchema: {
      body: {
        searchTerms: { type: "array", description: "Product search keywords", required: true },
        maxItems: { type: "number", description: "Maximum number of products to return", required: false, default: 10 },
        minPrice: { type: "number", description: "Minimum price filter (USD)" },
        maxPrice: { type: "number", description: "Maximum price filter (USD)" },
        proxyConfig: { type: "object", description: "Apify proxy configuration" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.008, currency: "USD" },
    verified: true,
  },
  {
    provider: "apify",
    path: "instagram/posts",
    description: "Scrape Instagram posts by hashtag or user using Apify's Instagram Scraper actor",
    inputSchema: {
      body: {
        searchTerms: { type: "array", description: "Hashtags or usernames to scrape", required: true },
        maxItems: { type: "number", description: "Maximum number of posts to return", required: false, default: 10 },
        resultsType: { type: "string", description: "Type of results: posts, reels, stories" },
        proxyConfig: { type: "object", description: "Apify proxy configuration" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_result", unitPrice: 0.006, currency: "USD" },
    verified: true,
  },
]

function buildActorInput(endpoint: string, input: RunInput): Record<string, unknown> {
  const body = input.body || {}
  switch (endpoint) {
    case "twitter/posts":
      return {
        searchTerms: body.searchTerms || [],
        maxItems: body.maxItems || 10,
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    case "linkedin/posts":
      return {
        keywords: body.keywords || "",
        maxResults: body.maxResults || 10,
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    case "reddit/posts":
      return {
        searchTerms: body.searchTerms || [],
        maxItems: body.maxItems || 10,
        sort: body.sort || "relevance",
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    case "google/search":
      return {
        searchTerms: body.searchTerms || [],
        maxItems: body.maxItems || 10,
        languageCode: body.languageCode || "en",
        countryCode: body.countryCode || "us",
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    case "amazon/products":
      return {
        searchTerms: body.searchTerms || [],
        maxItems: body.maxItems || 10,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    case "instagram/posts":
      return {
        searchTerms: body.searchTerms || [],
        maxItems: body.maxItems || 10,
        resultsType: body.resultsType || "posts",
        proxyConfig: body.proxyConfig || { useApifyProxy: true },
      }
    default:
      return body
  }
}

function generateMockData(endpoint: string, input: RunInput): unknown[] {
  const body = input.body || {}
  const maxItems = Number(body.maxItems || body.maxResults || 10)
  const terms = (body.searchTerms as string[]) || [body.keywords as string] || ["topic"]
  const term = terms[0] || "topic"

  switch (endpoint) {
    case "twitter/posts":
      return Array.from({ length: maxItems }, (_, i) => ({
        id: `tw_apify_${i}`,
        url: `https://twitter.com/user${i}/status/${rand(1e17, 9e17)}`,
        text: `Apify scraped tweet about ${term} #${i}`,
        author: `@user_${rand(100, 999)}`,
        likes: rand(5, 5000),
        retweets: rand(0, 1000),
        createdAt: new Date(Date.now() - rand(0, 86400000 * 7)).toISOString(),
      }))
    case "linkedin/posts":
      return Array.from({ length: maxItems }, (_, i) => ({
        id: `li_apify_${i}`,
        url: `https://linkedin.com/posts/professional-${i}_activity-${rand(1e15, 9e15)}`,
        text: `LinkedIn post about ${term} - professional insights #${i}`,
        author: `Professional ${i}`,
        reactions: rand(10, 2000),
        comments: rand(0, 200),
        createdAt: new Date(Date.now() - rand(0, 86400000 * 30)).toISOString(),
      }))
    case "reddit/posts":
      return Array.from({ length: maxItems }, (_, i) => ({
        id: `rd_apify_${i}`,
        url: `https://reddit.com/r/${term.replace(/\s/g, "")}/comments/mock${i}`,
        title: `Reddit: ${term} - discussion thread #${i}`,
        subreddit: `r/${term.replace(/\s/g, "")}`,
        score: rand(1, 15000),
        numComments: rand(0, 800),
        author: `redditor_${rand(100, 9999)}`,
        createdAt: new Date(Date.now() - rand(0, 86400000 * 30)).toISOString(),
      }))
    case "google/search":
      return Array.from({ length: maxItems }, (_, i) => ({
        url: `https://example${i}.com/${term.replace(/\s/g, "-")}`,
        title: `${term} - Result ${i + 1}`,
        description: `Detailed search result for "${term}" from Apify Google scraper...`,
        position: i + 1,
      }))
    case "amazon/products":
      return Array.from({ length: maxItems }, (_, i) => ({
        asin: `B0${rand(10000000, 99999999)}`,
        title: `${term} - Product ${i + 1}`,
        price: (rand(999, 49999) / 100).toFixed(2),
        rating: (3 + Math.random() * 2).toFixed(1),
        reviews: rand(10, 8000),
        url: `https://amazon.com/dp/B0${rand(10000000, 99999999)}`,
        imageUrl: `https://images-na.ssl-images-amazon.com/images/I/mock${i}.jpg`,
      }))
    case "instagram/posts":
      return Array.from({ length: maxItems }, (_, i) => ({
        id: `ig_apify_${i}`,
        url: `https://instagram.com/p/mock${i}`,
        caption: `Instagram post about ${term} #photo #${i}`,
        likes: rand(50, 50000),
        comments: rand(0, 500),
        author: `insta_user_${rand(100, 9999)}`,
        imageUrl: `https://instagram.com/p/mock${i}/media`,
        createdAt: new Date(Date.now() - rand(0, 86400000 * 60)).toISOString(),
      }))
    default:
      return []
  }
}

export const apifyProvider: ProviderAdapter = {
  name: "apify",
  endpoints,

  async execute(endpoint: string, input: RunInput): Promise<RunResult> {
    const token = process.env.APIFY_TOKEN
    const actorId = APIFY_ACTORS[endpoint as keyof typeof APIFY_ACTORS]

    if (!actorId) {
      throw new Error(`Unknown Apify endpoint: ${endpoint}`)
    }

    if (token) {
      const actorInput = buildActorInput(endpoint, input)
      const runUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`

      const runRes = await fetch(runUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput),
      })

      if (!runRes.ok) {
        const text = await runRes.text()
        throw new Error(`Apify actor ${actorId} failed: ${text}`)
      }

      const runJson = (await runRes.json()) as any
      const runId = runJson.data.id
      const datasetId = runJson.data.defaultDatasetId
      const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`

      let status = runJson.data.status
      let attempts = 0
      while (status === "RUNNING" || status === "READY") {
        if (attempts >= 60) throw new Error(`Timeout waiting for Apify actor ${actorId}`)
        await delay(5000)
        const checkRes = await fetch(statusUrl)
        if (!checkRes.ok) throw new Error(`Failed to check Apify run status`)
        const checkJson = (await checkRes.json()) as any
        status = checkJson.data.status
        attempts++
      }

      if (status !== "SUCCEEDED") {
        throw new Error(`Apify actor run failed with status: ${status}`)
      }

      const itemsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=1&token=${token}`
      const itemsRes = await fetch(itemsUrl)
      if (!itemsRes.ok) throw new Error(`Failed to fetch Apify dataset items`)
      const data = (await itemsRes.json()) as unknown[]

      const ep = endpoints.find((e) => e.path === endpoint)
      const cost = ep
        ? ep.costModel.type === "per_result"
          ? data.length * ep.costModel.unitPrice
          : ep.costModel.unitPrice
        : 0.01

      return { data, items: data.length, cost }
    }

    await delay(rand(100, 500))
    const data = generateMockData(endpoint, input)
    const ep = endpoints.find((e) => e.path === endpoint)
    const cost = ep
      ? ep.costModel.type === "per_result"
        ? data.length * ep.costModel.unitPrice
        : ep.costModel.unitPrice
      : 0.01

    return { data, items: data.length, cost }
  },

  async estimateCost(endpoint: string, input: RunInput): Promise<number> {
    const ep = endpoints.find((e) => e.path === endpoint)
    if (!ep) return 0.01
    const body = input.body || {}
    const estimatedItems = Number(body.maxItems || body.maxResults || body.limit || 10)
    return ep.costModel.type === "per_result"
      ? estimatedItems * ep.costModel.unitPrice
      : ep.costModel.unitPrice
  },
}

export default apifyProvider
