# ***SSGの実装***

## **ディレクトリ構成**
```
src―――lib
    |  |―post.ts // ファイルをやり取りをする
    |
    |―pages
       |―main
       |  |―blog.tsx // ブログの一覧が表示されているページ
       |
       |―posts
          |―[id].tsx // 任意のページに対して行う
```

## **post.ts** 

ファイルを読み込んだりとデータを扱う役割

```typescript
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postDirectory = path.join(process.cwd(), "src/posts");

// 取得するデータについて型を宣言している
type PostData = {
  readonly id: string,
  readonly title: string,
  readonly date: string,
  readonly thumbnail: string,
  readonly content: string
}

// MDファイル情報をオブジェクト配列で返す関数
const getPostsDataList = () => {
  // dirctory内のファイル名を取得する
  const fileNames = fs.readdirSync(postDirectory);

  const postdata: Array<PostData> = Array(fileNames.length).fill({id:'', title:'', date:'', thumbnail:'', content: ''});
  fileNames.forEach(async (el, index) => {
    // [id].tsxの任意のIDで使う文字列を取得する
    const id = el.replace(/\.md$/, '');
    const fullPath = path.join(postDirectory, el);
    // ファイルの中身をutf-8で取得する
    const fileInfo = fs.readFileSync(fullPath, 'utf-8');
    // matterはMDファイルを解析してくれる
    const { data, content } = matter(fileInfo);

    // MarkDown書式を解析してHTML形式に変換してくれる
    const blogContent = await remark()
    .use(html)
    .process(content);
    
    // 用意したPostData型の配列に詰めていく
    postdata[index] = {id: id, title: data.title, date: data.date, thumbnail: data.thumbnail, content:blogContent.toString()};
  })

  return postdata;
}

// MDファイルのID一覧を配列で返す
const getAllPostId = () => {
  const fileNames = fs.readdirSync(postDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      }
    }
  })
}

// 特定のIDのMDファイルについて情報をPostData型のオブジェクトで返す
const getPostsData = async (id: string) => {
  const fullPath = path.join(postDirectory, `${id}.md`);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');

  const { data, content } = matter(fileContent);

  const blogContent = await remark()
  .use(html)
  .process(content);

  const postdata: PostData = {id: id, title: data.title, date: data.date, thumbnail: data.thumbnail, content:blogContent.toString()};

  return postdata;
}

export { getPostsDataList, getAllPostId, getPostsData }
```
## **blog.tsx**

サムネなど表示して、クリックすると各ブログ記事へ飛ぶリンクなどが書いてある。  
ここにもSSGの実装がある
```typescript
import Head from 'next/head'
import Link from 'next/link';
import type { ReactElement } from 'react'
import styles from 'styles/main/News.module.sass'
import utilStyles from 'styles/utils.module.sass'
import { getPostsDataList } from '@/lib/post'
import { InferGetStaticPropsType } from 'next';

const MdPage = '../posts';

// ********** SSGとして実装
// nextjsの用意関数 
export const getStaticProps = async () => {
  const postData = getPostsDataList();
  
  // getStaticPropsのお決まりreturn
  return {
    props: {
      postData,
    },
  };
}
// SSGとして実装 **********

// ********** SSRとして実装 
// export const getServerSideProps = async (context) => {
//   // SSGのときに実装したpost.tsでfetch関数などを用いてデータベースから取得したデータを用いる
//   return {
//     props: {
//       // コンポーネントに渡すためのprops
//     }
//   }
// }
// SSRとして実装 **********

type Props = InferGetStaticPropsType<typeof getStaticProps>;
const News = ( { postData }: Props ) => {
  return (
    <div>
      <Head>
        <title>NEWS | Next/React App</title>
      </Head>
      <section>
        <p>This page for using News is created like blog site</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h1>NEWS</h1>
        <div className={styles.grid}>
          { postData.map(({id, title, date, thumbnail}) => (
            <article key={id}>
              <Link href={`${MdPage}/${id}`}>
                <img
                className={styles.thumbnailImage}
                src={thumbnail}
                alt={id} />
              </Link>
              <Link href={`${MdPage}/${id}`}>
                <p className={utilStyles.boldText}>{ title }</p>
              </Link>
              <small className={utilStyles.lightText}>{ date }</small>
            </article>
          ))}
        </div> 
      </section>
      
    </div>
  )
}

export default News;
```
## **[id].tsx**
---
任意のページについて処理を行う、SSGの実装におけるメインの話はここで行われている
```typescript
import { getAllPostId, getPostsData } from '@/lib/post';
import { InferGetStaticPropsType, GetStaticPaths, GetStaticPropsContext } from 'next';
import styles from 'styles/main/Posts.module.sass'
import utilStyles from 'styles/utils.module.sass'

// getStaticPathsはNextJsの標準関数
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostId();
  return {
    paths,
    fallback: false, // falseにするとIdに含まれないものは404を返すようになる
  }
}

// getStaticPropsはNextJsの標準関数
export const getStaticProps = async (context:GetStaticPropsContext<{ id:string }>) => {
console.log(context.params!.id)
  const postData = await getPostsData(context.params!.id);
  return {
    props: {
      postData,
    },
  };
}

type Props = InferGetStaticPropsType<typeof getStaticProps>;
const MdViewer = ({ postData }: Props) => {
  
  return (
    <div>
      <article className={styles.container}>
        <h1 className={utilStyles.headingX1}>{ postData.title }</h1>
        <div className={utilStyles.lightText}>{ postData.date }</div>
        {/* dangerouslySetInnerHTMLはalertや悪意のあるものも実行してしまうので、
        事前にサニタイズをしてから出力するようにしないといけない */}
        <div dangerouslySetInnerHTML={{__html: postData.content }}/>
      </article>
    </div>
  );
}

export default MdViewer;
```