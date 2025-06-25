'use client';
import { Chip, Spinner } from "@heroui/react";
import { getTranslation } from "@/lib/i18n";
import TweetCard from './TweetCard';
import { useState, useEffect } from 'react';

export default function HotTweets({ locale = 'en' }) {
    const [tweets, setTweets] = useState([[], [], []]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const t = function (key) {
        return getTranslation(locale, key);
    }

    useEffect(() => {
        async function fetchTweets() {
            try {
                setLoading(true);
                const response = await fetch('/api/requestdb?action=recent');

                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }

                const data = await response.json();

                if (data.success) {
                    setTotalCount(data.count || 0);

                    // 将推文分成三列
                    const tweetColumns = [[], [], []];

                    // 确保 data.data 存在且是数组
                    if (data.data && Array.isArray(data.data)) {
                        data.data.forEach((tweet, index) => {
                            if (tweet) {
                                tweetColumns[index % 3].push({
                                    ...tweet,
                                    tweet_media: tweet.tweet_media ? tweet.tweet_media.split(',') : []
                                });
                            }
                        });
                    }

                    setTweets(tweetColumns);
                } else {
                    throw new Error(data.error || 'Failed to load tweets');
                }
            } catch (err) {
                console.error('Error fetching tweets:', err);
                setError(err.message);

                // 使用示例数据作为后备
                const sampleTweets = [
                    {
                        name: "Example User 1",
                        screen_name: "user1",
                        profile_image: "/images/default-avatar.png",
                        tweet_id: "example1",
                        tweet_text: "This is an example tweet for demonstration purposes.",
                        tweet_media: [],
                        post_at: new Date().toISOString()
                    },
                    {
                        name: "Example User 2",
                        screen_name: "user2",
                        profile_image: "/images/default-avatar.png",
                        tweet_id: "example2",
                        tweet_text: "Another example tweet with some content.",
                        tweet_media: [],
                        post_at: new Date().toISOString()
                    },
                    {
                        name: "Example User 3",
                        screen_name: "user3",
                        profile_image: "/images/default-avatar.png",
                        tweet_id: "example3",
                        tweet_text: "A third example tweet for the layout.",
                        tweet_media: [],
                        post_at: new Date().toISOString()
                    }
                ];

                const fallbackTweets = [[], [], []];
                sampleTweets.forEach((tweet, index) => {
                    fallbackTweets[index % 3].push({
                        ...tweet,
                        tweet_media: tweet.tweet_media || []
                    });
                });

                setTweets(fallbackTweets);
                setTotalCount(sampleTweets.length);
            } finally {
                setLoading(false);
            }
        }

        fetchTweets();
    }, []);

    if (loading) {
        return (
            <>
                <div className="text-2xl font-bold px-2 py-4 flex">
                    <div>{t('Hot Tweets')}</div>
                    <Chip color="primary" size="sm" variant="flat" className="ml-2 mt-1">
                        <Spinner size="sm" color="white" />
                    </Chip>
                </div>
                <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
                    {[1, 2, 3].map((col) => (
                        <div key={col} className="md:w-1/3 w-full flex flex-col gap-5">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <div className="text-2xl font-bold px-2 py-4 flex">
                <div>{t('Hot Tweets')}</div>
                <Chip color="primary" size="sm" variant="flat" className="ml-2 mt-1">
                    {totalCount}
                    {error && <span className="ml-1 text-xs opacity-70">(示例)</span>}
                </Chip>
            </div>
            <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
                {tweets.map((row, index) => (
                    <div key={index} className="md:w-1/3 w-full flex flex-col gap-5">
                        {Array.isArray(row) && row.map((tweet) => (
                            tweet && tweet.tweet_id ? (
                                <TweetCard locale={locale} key={tweet.tweet_id} tweet={tweet} />
                            ) : null
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}