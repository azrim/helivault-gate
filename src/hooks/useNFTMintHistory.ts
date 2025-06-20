import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { HELIVAULT_NFT_CONTRACT } from "@/contracts/HelivaultNFT"

export function useNFTMintHistory(address?: string) {
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    const fetchHistory = async () => {
      try {
        setLoading(true)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          HELIVAULT_NFT_CONTRACT.address,
          HELIVAULT_NFT_CONTRACT.abi,
          provider
        )

        const balance = await contract.balanceOf(address)
        const owned: number[] = []

        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i)
          owned.push(Number(tokenId))
        }

        setTokenIds(owned)
      } catch (err) {
        console.error("Failed to fetch mint history", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [address])

  return { tokenIds, loading }
}
