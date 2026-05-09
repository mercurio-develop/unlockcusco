import { fetchBusinesses } from "../src/features/business/actions/fetch-businesses"

async function main() {
  try {
    console.log("Fetching...")
    const res = await fetchBusinesses({
      query: "KAa",
      sort: "recommended",
      limit: 30
    })
    console.log("Success:", res.businesses.length)
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
