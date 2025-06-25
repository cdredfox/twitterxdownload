import { getTranslation } from "@/lib/i18n";
import { Avatar, Button } from "@heroui/react";
import Link from "next/link";
import { parseTweetData } from "@/lib/parser";
import ShareButtons from "@/app/components/ui/ShareButtons";
import Explore from "@/app/components/ui/Explore";

// 生成静态参数 - 为静态导出生成一些示例页面
export async function generateStaticParams({ params }) {
  // 为每个语言生成一些示例页面
  const locales = ['en', 'zh-CN', 'zh-HK', 'ja', 'ko', 'es', 'pt', 'it', 'fr', 'de', 'th', 'tr'];

  // 生成一些示例 slug
  const sampleSlugs = [
    'example-tweet-1',
    'example-tweet-2',
    'sample-video',
    'demo-content'
  ];

  return sampleSlugs.map(slug => ({
    slug: slug
  }));
}

// 在静态导出模式下，我们不能使用 headers() 和 fetch
// 这个函数将返回示例数据
function getTweetData(slug) {
    // 返回示例推文数据
    return {
        name: "Example User",
        screen_name: "example_user",
        profile_image: "/images/default-avatar.png",
        tweet_id: slug,
        tweet_text: `This is an example tweet for ${slug}. In a real application, this would be fetched from the database.`,
        tweet_media: "",
        tweet_data: JSON.stringify({
            data: {
                threaded_conversation_with_injections_v2: {
                    instructions: [{
                        entries: [{
                            content: {
                                itemContent: {
                                    tweet_results: {
                                        result: {
                                            legacy: {
                                                full_text: `This is an example tweet for ${slug}`,
                                                created_at: new Date().toISOString()
                                            }
                                        }
                                    }
                                }
                            }
                        }]
                    }]
                }
            }
        }),
        post_at: new Date().toISOString()
    };
}

function deleteAllUrl(text){
    return text.replace(/https?:\/\/[^\s]+/g, '');
}

export function generateMetadata({ params }) {
    const tweet = getTweetData(params.slug);

    const tweet_text = deleteAllUrl(tweet.tweet_text);

    const title = tweet_text.substring(0, 50);
    const description = tweet_text.substring(0, 150);

    let image = "https://twitterxdownload.com/images/og.png";
    // 如果 tweet.tweet_media 存在,则使用 tweet.tweet_media 的第一个图片
    // 获取推文数据
    const data = JSON.parse(tweet.tweet_data);
    const resultTweet = data.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result;
    // 获取主推文数据
    const first_tweet = resultTweet.legacy || resultTweet.tweet.legacy;
    if (first_tweet.extended_entities?.media) {
        image = first_tweet.extended_entities.media[0].media_url_https;
    }
    
    return {
      title: title,
      description: description,
      alternates: {
        canonical: `/tweets/${params.slug}`,
      },
      openGraph: {
        title: title,
        description: description,
        type: 'website',
        url: 'https://twitterxdownload.com',
        siteName: 'TwitterXDownload',
        images: [{
          url: image
        }]
      },
      twitter: {
        card: 'summary_large_image',
        site: '@twitterxdownload',
        title: title,
        description: description,
        images: [image]
      }
    }
}

export default function TweetDetail({params}) {
    const {slug, locale='en'} = params;
    const t = function(key){
        return getTranslation(locale, key);
    }
    const tweet = getTweetData(slug);

    const linkConvert = (text) => {
        // 替换链接
        text = text.replace(/https?:\/\/[^\s]+/g, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500">${url}</a>`;
        });
        
        // 替换 @用户名
        text = text.replace(/@(\w+)/g, (match, username) => {
            return `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer" class="text-blue-500">${match}</a>`;
        });
        
        return text;
    }

    const getHTML = () =>{
        const tweets = parseTweetData(JSON.parse(tweet.tweet_data));
        
        return (
            <div 
                className="article-content text-medium text-default-600 whitespace-pre-wrap break-words max-w-full"
            >
                {tweets.map((tweet, index) => (
                    <>
                        <pre dangerouslySetInnerHTML={{__html: linkConvert(tweet.text)}}></pre>
                        { 
                            tweet.medias.map((media, index) => {
                                if(media.type==="photo"){
                                    return <img src={media.url} alt={media.alt} />
                                }else if(media.type==="video"){
                                    return <video controls src={media.url} alt={media.alt} />
                                }
                            })
                        }
                    </>
                ))}
            </div>
        )
    }

    return (
        <div className="page-container flex flex-row gap-6 p-4 mt-4 flex-wrap md:flex-nowrap w-full">
            <div className="flex flex-col flex-1 gap-4 box-border border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
                <div className="flex gap-4">
                    <div className="box-border flex-shrink-0 p-1">
                        <Avatar disableAnimation isBordered src={tweet.profile_image} alt={`${tweet.name} avatar`} size="lg" radius="full"/>
                    </div>
                    <div className="flex flex-col gap-1 pt-3 flex-1 overflow-hidden">
                        <h1 className="text-medium font-semibold leading-none text-default-600 overflow-hidden text-ellipsis whitespace-nowrap">{tweet.name}</h1>
                        <p className="text-small text-default-400 overflow-hidden text-ellipsis whitespace-nowrap">@{tweet.screen_name}</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 items-end">
                        <Button color="primary" size="sm" radius="full" asChild>
                            <Link href={`https://x.com/${tweet.screen_name}/status/${tweet.tweet_id}`} target="_blank">{t('Goto Tweet')}</Link>
                        </Button>
                        <p className="text-small text-default-400">
                            {new Date(tweet.post_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-foreground/10 mt-3"></div>
                <div className="text-medium text-default-600 whitespace-pre-wrap break-words max-w-full mt-3">
                    {getHTML()}
                </div>
            </div>
            <div className="flex flex-col gap-6 w-full md:w-[300px] flex-shrink-0 box-border">
                <div className="border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
                    <div className="text-medium font-semibold">{t('Share')}</div>
                    <div className="w-full h-[1px] bg-foreground/10 mt-3"></div>
                    <ShareButtons />
                </div>
                <Explore locale={locale}/>
            </div>
        </div>
    )
}