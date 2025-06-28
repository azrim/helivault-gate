// src/pages/Bridge.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowDownUp, Info, ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAccount } from "wagmi";
import { useState } from "react";

// A new component to represent the combined Token + Network selector
const TokenNetworkSelector = ({ token, network, icon }: { token: string; network: string; icon: string; }) => {
    return (
        <Button variant="ghost" className="h-auto p-0 flex items-center gap-3">
            <img src={icon} alt={token} className="w-8 h-8 rounded-full" />
            <div className="flex flex-col items-start">
                <span className="text-lg font-bold text-foreground">{token}</span>
                <span className="text-xs text-muted-foreground">{network}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
    )
}

const Bridge = () => {
    const { isConnected } = useAccount();
    const [amount, setAmount] = useState("");

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Bridge & Swap – Helivault Gate</title>
            </Helmet>
            <main className="max-w-md mx-auto px-4 pt-20 pb-12">
                <Tabs defaultValue="bridge" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="bridge">Bridge</TabsTrigger>
                        <TabsTrigger value="swap">Swap</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bridge">
                        <Card className="shadow-lg rounded-xl mt-4">
                            <CardContent className="p-4 space-y-2">

                                {/* From Section */}
                                <div className="bg-secondary/30 p-4 rounded-lg space-y-1">
                                    <span className="text-xs text-muted-foreground">From</span>
                                    <div className="flex items-center justify-between">
                                        <TokenNetworkSelector token="USDC" network="Arbitrum One" icon="/usdc-icon.svg" />
                                        <div className="text-right">
                                            <Input
                                                type="text"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0"
                                                className="text-2xl font-mono bg-transparent text-right outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                                            />
                                            <span className="text-xs text-muted-foreground">$0.00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Swap Button in the middle */}
                                <div className="flex justify-center h-0 relative">
                                    <Button variant="outline" size="icon" className="absolute top-[-18px] z-10 rounded-full border-2 w-8 h-8 bg-card hover:bg-secondary">
                                        <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                                
                                {/* To Section */}
                                <div className="bg-secondary/30 p-4 rounded-lg space-y-1">
                                    <span className="text-xs text-muted-foreground">To</span>
                                     <div className="flex items-center justify-between">
                                        <TokenNetworkSelector token="USDC" network="Plume" icon="/usdc-icon.svg" />
                                        <div className="text-right">
                                            <div className="text-2xl font-mono text-foreground">{amount || "0"}</div>
                                            <span className="text-xs text-muted-foreground">$0.00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Options */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="send-address" className="text-sm font-medium">Send to another address</Label>
                                        <Switch id="send-address" />
                                    </div>
                                </div>
                                
                                {/* Action Button */}
                                <div className="pt-4">
                                    <Button className="w-full h-12 text-lg" variant={isConnected ? 'default' : 'secondary'}>
                                        {isConnected ? "Bridge" : "Connect Wallet"}
                                    </Button>
                                </div>

                                {/* Fee Details */}
                                <div className="pt-2">
                                     <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            Total fee
                                            <Info className="w-3 h-3"/>
                                        </span>
                                        <span>0 USDC</span>
                                     </div>
                                     <div className="text-sm text-primary cursor-pointer">
                                        See Details
                                     </div>
                                </div>

                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="swap">
                        {/* Swap UI would go here */}
                         <Card className="shadow-lg rounded-xl mt-4">
                            <CardContent className="p-20 text-center">
                                <p>Swap UI Coming Soon</p>
                            </CardContent>
                         </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Bridge;