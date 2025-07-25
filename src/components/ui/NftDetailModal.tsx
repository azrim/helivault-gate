// src/components/ui/NftDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NftDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: NftMetadata | null;
  tokenId: bigint | null;
}

export const NftDetailModal = ({
  isOpen,
  onClose,
  metadata,
  tokenId,
}: NftDetailModalProps) => {
  if (!metadata || tokenId === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{metadata.name}</DialogTitle>
          <DialogDescription>Token ID: {tokenId.toString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            <img
              src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
              alt={metadata.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-muted-foreground">{metadata.description}</p>
          {metadata.attributes && metadata.attributes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Attributes</h4>
              <div className="flex flex-wrap gap-2">
                {metadata.attributes.map((attr, index) => (
                  <Badge key={index} variant="secondary">
                    <span className="font-normal text-muted-foreground mr-2">
                      {attr.trait_type}:
                    </span>
                    {attr.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
