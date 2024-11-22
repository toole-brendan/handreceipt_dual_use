// frontend/src/components/assets/RFIDScanner.tsx

import React, { useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext';
import { scanRFIDTag, associateRFIDTag } from '../../services/api';
import type { ApiResponse } from '../../types/shared';
import type { RFIDScanResult } from '../../types/rfid';

export const RFIDScanner: React.FC = () => {
    const [scanning, setScanning] = useState(false);
    const [lastScannedTag, setLastScannedTag] = useState<RFIDScanResult | null>(null);
    const { selectedAsset } = useAssetContext();

    const handleScan = async () => {
        try {
            setScanning(true);
            const result = await scanRFIDTag();
            if (result.success && result.data) {
                setLastScannedTag(result.data);
            } else {
                throw new Error(result.error || 'Scan failed');
            }
        } catch (error) {
            console.error('RFID scan failed:', error);
        } finally {
            setScanning(false);
        }
    };

    const handleAssociate = async () => {
        if (!selectedAsset || !lastScannedTag) return;
        
        try {
            const result = await associateRFIDTag(selectedAsset.id, lastScannedTag.tagId);
            if (result.success) {
                // Show success message
            }
        } catch (error) {
            console.error('Failed to associate RFID tag:', error);
        }
    };

    return (
        <div className="rfid-scanner">
            <h3>RFID Scanner</h3>
            <button 
                onClick={handleScan}
                disabled={scanning}
                className="scan-button"
            >
                {scanning ? 'Scanning...' : 'Scan RFID Tag'}
            </button>
            
            {lastScannedTag && (
                <div className="scan-result">
                    <p>Last Scanned Tag: {lastScannedTag.tagId}</p>
                    <p>Scanned at: {new Date(lastScannedTag.timestamp).toLocaleString()}</p>
                    <button 
                        onClick={handleAssociate}
                        disabled={!selectedAsset}
                        className="associate-button"
                    >
                        Associate with Selected Asset
                    </button>
                </div>
            )}
        </div>
    );
}; 