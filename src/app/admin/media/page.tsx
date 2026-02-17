"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Trash2, Copy, Image as ImageIcon, FileText } from "lucide-react";
import { mockDb } from "@/services/mockDb";
import { MediaAsset } from "@/types/admin";

export default function MediaLibraryPage() {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    async function loadAssets() {
        setLoading(true);
        const data = await mockDb.getMediaAssets();
        setAssets(data);
        setLoading(false);
    }

    useEffect(() => {
        loadAssets();
    }, []);

    async function handleUpload() {
        setUploading(true);
        // Simulate upload delay
        setTimeout(async () => {
            const newAsset = {
                name: `upload-${Date.now()}.jpg`,
                size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
            };
            await mockDb.uploadMedia(newAsset);
            setUploading(false);
            loadAssets();
        }, 1500);
    }

    async function handleDelete(id: string) {
        if (confirm("Delete this asset?")) {
            await mockDb.deleteMedia(id);
            loadAssets();
        }
    }

    function copyToClipboard(url: string) {
        navigator.clipboard.writeText(url);
        alert("URL copied to clipboard!");
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
                    <p className="text-slate-500 mt-1">Manage images and documents for your content.</p>
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Asset"}
                </Button>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">Loading library...</div>
            ) : assets.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No assets found</h3>
                    <p className="text-slate-500 mt-1">Upload files to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {assets.map((asset) => (
                        <div key={asset.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {asset.type === 'image' ? (
                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <FileText className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => copyToClipboard(asset.url)} title="Copy URL">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(asset.id)} title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="font-medium text-slate-900 truncate" title={asset.name}>{asset.name}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-slate-500 uppercase">{asset.type}</span>
                                    <span className="text-xs text-slate-400">{asset.size}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
