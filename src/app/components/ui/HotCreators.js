'use client';
import { Card, CardFooter, CardHeader, Button, Avatar, Skeleton, ScrollShadow, Spinner } from "@heroui/react";
import { getTranslation } from "@/lib/i18n";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HotCreators({ locale = 'en' }) {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const t = function (key) {
        return getTranslation(locale, key);
    }

    useEffect(() => {
        async function fetchCreators() {
            try {
                setLoading(true);
                const response = await fetch('/api/requestdb?action=creators');

                if (!response.ok) {
                    throw new Error('Failed to fetch creators');
                }

                const data = await response.json();

                if (data.success) {
                    // 确保 data.data 存在且是数组
                    if (data.data && Array.isArray(data.data)) {
                        setCreators(data.data);
                    } else {
                        setCreators([]);
                    }
                } else {
                    throw new Error(data.error || 'Failed to load creators');
                }
            } catch (err) {
                console.error('Error fetching creators:', err);
                setError(err.message);

                // 使用示例数据作为后备
                const sampleCreators = [
                    {
                        name: "Example Creator 1",
                        screen_name: "creator1",
                        profile_image: "/images/default-avatar.png",
                        tweet_count: 150
                    },
                    {
                        name: "Example Creator 2",
                        screen_name: "creator2",
                        profile_image: "/images/default-avatar.png",
                        tweet_count: 120
                    },
                    {
                        name: "Example Creator 3",
                        screen_name: "creator3",
                        profile_image: "/images/default-avatar.png",
                        tweet_count: 98
                    }
                ];

                setCreators(sampleCreators);
            } finally {
                setLoading(false);
            }
        }

        fetchCreators();
    }, []);

    if (loading) {
        return (
            <>
                <ScrollShadow className="w-full flex gap-5" orientation="horizontal">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <Card
                            shadow="none"
                            className="min-w-[160px] max-w-[20%] p-2 flex-shrink-0"
                            radius="lg"
                            key={index}
                        >
                            <CardHeader className="justify-between gap-5">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex flex-col gap-1 items-start justify-center overflow-hidden flex-1">
                                    <Skeleton className="w-full h-4 rounded" />
                                    <Skeleton className="w-3/4 h-3 rounded" />
                                </div>
                            </CardHeader>
                            <CardFooter className="justify-between">
                                <Skeleton className="w-[100px] h-8 rounded-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </ScrollShadow>
            </>
        );
    }

    return (
        <>
            <ScrollShadow className="w-full flex gap-5" orientation="horizontal">
                {Array.isArray(creators) && creators.map((creator) => (
                    creator && creator.screen_name ? (
                    <Card
                        shadow="none"
                        disableRipple
                        className="select-none box-border border-foreground/10 border-[1px] min-w-[160px] max-w-[20%] p-2 flex-shrink-0"
                        radius="lg"
                        key={creator.screen_name}
                    >
                        <CardHeader className="justify-between gap-5">
                            <Avatar
                                isBordered
                                radius="full"
                                size="md"
                                alt={`${creator.name} avatar`}
                                src={creator.profile_image}
                            />
                            <div className="flex flex-col gap-1 items-start justify-center overflow-hidden flex-1">
                                <h4 className="w-full text-small font-semibold leading-none text-default-600 text-ellipsis overflow-hidden whitespace-nowrap">{creator.name}</h4>
                                <h5 className="w-full text-small tracking-tight text-default-400 text-ellipsis overflow-hidden whitespace-nowrap">@{creator.screen_name}</h5>
                            </div>
                        </CardHeader>
                        <CardFooter className="justify-between before:bg-white/10 overflow-hidden w-[calc(100%_-_8px)]">
                            
                                <Button
                                    className="text-tiny text-white m-auto w-[100px]"
                                    color="primary"
                                    radius="full"
                                    size="sm"
                                    as={Link}
                                    href={`/${locale}/tweets?screen_name=${creator.screen_name}`}
                                >
                                    {t('Search')}
                                </Button>
                        </CardFooter>
                    </Card>
                    ) : null
                ))}
            </ScrollShadow>
        </>
    );
}