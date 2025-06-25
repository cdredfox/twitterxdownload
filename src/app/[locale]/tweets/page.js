'use client';
import { Input, Select, SelectItem, Button,Spinner } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { getTranslation } from "@/lib/i18n";
import { useState, useEffect, Suspense } from "react";
import TweetCard from "@/app/components/ui/TweetCard";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

function TweetsContent({ locale }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialParams = {
        screen_name: searchParams.get('screen_name'),
        name: searchParams.get('name'),
        text: searchParams.get('text')
    }

    const t = function(key){
        return getTranslation(locale, key);
    }
    const contentTypes = [
        { key: "all", label: t('All') },
        { key: "video", label: t('Video') },
        { key: "image", label: t('Image') }
    ];

    const dateRanges = [
        { key: "all", label: t('All') },
        { key: "week", label: t('Week') },
        { key: "month", label: t('Month') },
        { key: "quarter", label: t('Quarter') }
    ];

    const [name, setName] = useState(initialParams.name || '');
    const [screen_name, setScreenName] = useState(initialParams.screen_name || '');
    const [text, setText] = useState(initialParams.text || '');
    const [content_type, setContentType] = useState('all');
    const [date_range, setDateRange] = useState('all');
    const [loading, setLoading] = useState(false);
    const [tweets, setTweets] = useState([[], [], []]);

    const [shouldSearch, setShouldSearch] = useState(false);

    // 初始搜索 - 只在组件挂载时执行一次
    useEffect(() => {
        if (initialParams.name || initialParams.screen_name || initialParams.text) {
            handleSearch();
        }
    }, []); // 空依赖数组，只执行一次

    // 处理 shouldSearch 状态
    useEffect(() => {
        if (shouldSearch) {
            handleSearch();
            setShouldSearch(false);
        }
    }, [shouldSearch]);

    const handleSearch = async () => {
        if(!name.trim() && !screen_name.trim() && !text.trim()){
            return;
        }

        setLoading(true);

        try {
            // 更新 URL
            router.replace(`/${locale}/tweets?name=${encodeURIComponent(name)}&screen_name=${encodeURIComponent(screen_name)}&text=${encodeURIComponent(text)}`);

            // 构建搜索参数
            const searchParams = new URLSearchParams({
                name: name.trim(),
                screen_name: screen_name.trim(),
                text: text.trim(),
                content_type: content_type,
                date_range: date_range
            });

            const response = await fetch(`/api/search?${searchParams.toString()}`);

            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const data = await response.json();

            if (data.success && data.data && Array.isArray(data.data)) {
                const newTweets = [[], [], []];
                data.data.forEach((tweet, index) => {
                    if (tweet && tweet.tweet_id) {
                        newTweets[index % 3].push({
                            ...tweet,
                            tweet_media: tweet.tweet_media ? tweet.tweet_media.split(',') : []
                        });
                    }
                });
                setTweets(newTweets);
            } else {
                console.error('Invalid search response:', data);
                setTweets([[], [], []]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setTweets([[], [], []]);
        } finally {
            setLoading(false);
        }
    }

    const handleClear = () => {
        setName('');
        setScreenName('');
        setText('');
        setTweets([[], [], []]);
    }

    return (
        <div className="page-container">
            <div className='section'>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-semibold">{t('Search Conditions')}</h2>
                </div>

                <div className="flex w-full gap-4 flex-wrap md:flex-nowrap">
                    {/* 用户名搜索 */}
                    <Input
                        disabled={loading}
                        label="Name"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="flex-1 md:w-1/3 min-w-[150px]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    {/* 用户昵称搜索 */}
                    <Input
                        disabled={loading}
                        label="Screen Name"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="flex-1 md:w-1/3 min-w-[150px]"
                        value={screen_name}
                        onChange={(e) => setScreenName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    {/* 推文内容搜索 */}
                    <Input
                        disabled={loading}
                        label="Text"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="w-full"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    <Button
                        disabled={loading}
                        color="primary"
                        variant="solid"
                        size="lg"
                        radius="xs"
                        className="px-8 flex-1 md:flex-none"
                        onPress={handleSearch}
                    >
                        {t('Search')}
                    </Button>
                    <Button
                        disabled={loading}
                        color="default"
                        variant="bordered"
                        size="lg"
                        radius="xs"
                        className="px-8 flex-1 md:flex-none"
                        onPress={handleClear}
                    >
                        {t('Clear')}
                    </Button>
                </div>
            </div>
            <div className="section">
                <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                    <div className='flex items-center gap-2'>{t('Search Results')}{loading && <Spinner className="ml-2" size="sm" color="primary" variant="simple"/>}</div>
                    <div className='flex gap-4 flex-shrink-0'>
                        {/* 内容类型过滤 */}
                        <div className='w-1/2 min-w-[110px]'>
                            <Select
                                disabled={loading}
                                label={t('Content Type')}
                                variant="underlined"
                                selectedKeys={[content_type]}
                                onSelectionChange={(keys) => {
                                    const newValue = Array.from(keys)[0];
                                    if (newValue !== content_type) {
                                        setContentType(newValue);
                                        setShouldSearch(true);
                                    }
                                }}
                            >
                                {contentTypes.map((type) => (
                                    <SelectItem key={type.key} value={type.key}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* 时间范围过滤 */}
                        <div className='w-1/2 min-w-[110px]'>
                            <Select
                                disabled={loading}
                                label={t('Date Range')}
                                variant="underlined"
                                selectedKeys={[date_range]}
                                onSelectionChange={(keys) => {
                                    const newValue = Array.from(keys)[0];
                                    if (newValue !== date_range) {
                                        setDateRange(newValue);
                                        setShouldSearch(true);
                                    }
                                }}
                            >
                                {dateRanges.map((range) => (
                                    <SelectItem key={range.key} value={range.key}>
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </h3>
                {tweets.some(row => row.length > 0) ? (
                    <div className="flex justify-between gap-5 mt-8 flex-wrap md:flex-nowrap">
                        {tweets.map((row, index) => (
                            <div key={index} className="w-full md:w-1/3 flex flex-col gap-5">
                                {Array.isArray(row) && row.map((tweet) => (
                                    tweet && tweet.tweet_id ? (
                                        <TweetCard locale={locale} key={tweet.tweet_id} tweet={tweet} />
                                    ) : null
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-44 text-default-500">
                        <RiSearchLine size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm mt-2">{t('Search results will be displayed here')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Tweets({ params: { locale } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TweetsContent locale={locale} />
        </Suspense>
    );
}