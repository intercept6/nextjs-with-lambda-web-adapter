# Next.js(App Router)を Lambda Web Adapter を使いデプロイするサンプル

Next.js を Lambda Web Adapter を使い Lambda 関数にデプロイします。
Lambda 関数は関数 URL を使いエンドポイントを公開します。関数 URL には IAM 認証を設定します。
関数 URL に直接アクセスするのではなく、CloudFront を経由してアクセスします。これはキャッシュ制御や WAF を設定可能にするためです。

CloudFront Origin Access Control を使い、関数 URL へアクセスする権限を得ます。
POST、PUT リクエストを可能にする為には`x-amz-content-sha256`ヘッダーにボディの SHA256 ハッシュを付与する必要があります。これを Service Worker を使いクライアント側で付与します。

Lambda@Edge でもハッシュ付与が行えますが、us-east-1 リージョンにデプロイした Lambda 関数のレプリケーションが各リージョンにレプリケーションされ実行されます。これが要求されがちな、「日本リージョンにデータ操作および保存を限定したい」を満たすことが出来ないのでこのような方法を模索しました。（日本からのリクエストは原則日本の CloudFront へアクセスし、日本の Lambda 関数が実行されるが保証はできないと理解しています。）
