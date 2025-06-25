'use client';
import { useState, useEffect } from 'react';
import { Chip, Spinner } from '@heroui/react';
import { getTranslation } from '@/lib/i18n';

export default function ApiStatus({ locale = 'en' }) {
    const [remainCount, setRemainCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const t = function (key) {
        return getTranslation(locale, key);
    }

    useEffect(() => {
        async function fetchApiStatus() {
            try {
                setLoading(true);
                const response = await fetch('/api/remains');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch API status');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setRemainCount(data.data || 0);
                } else {
                    throw new Error(data.error || 'Failed to load API status');
                }
            } catch (err) {
                console.error('Error fetching API status:', err);
                setError(err.message);
                setRemainCount(0); // 默认值
            } finally {
                setLoading(false);
            }
        }

        fetchApiStatus();
        
        // 每5分钟更新一次
        const interval = setInterval(fetchApiStatus, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Chip color="primary" variant="flat">
                <Spinner size="sm" color="white" />
                <span className="ml-2">{t('API Status')}</span>
            </Chip>
        );
    }

    return (
        <Chip 
            color={error ? "warning" : "success"} 
            variant="flat"
            title={error ? `Error: ${error}` : `${t('API Status')}: ${remainCount}`}
        >
            {t('API Status')}: {remainCount}
            {error && <span className="ml-1 text-xs opacity-70">(离线)</span>}
        </Chip>
    );
}
